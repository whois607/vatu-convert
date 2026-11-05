// Vatu Convert - currency converter, works offline from the last synced rates.
'use strict';

const SOURCES = [
  { name: 'open.er-api.com', url: 'https://open.er-api.com/v6/latest/USD',
    parse: j => {
      if (j.result !== 'success') throw new Error('bad response');
      return { rates: j.rates, ratesTime: j.time_last_update_unix * 1000 };
    } },
  { name: 'fawazahmed0 currency-api', url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json',
    parse: j => {
      const rates = {};
      for (const [k, v] of Object.entries(j.usd)) if (/^[a-z]{3}$/.test(k)) rates[k.toUpperCase()] = v;
      return { rates, ratesTime: Date.parse(j.date + 'T00:00:00Z') };
    } },
];

// Shown first in the pickers and in the quick list.
const FAVS = ['VUV', 'AUD', 'NZD', 'USD', 'FJD', 'XPF', 'EUR', 'GBP'];
const REFRESH_AFTER = 60 * 60 * 1000;      // re-fetch if older than 1 hour
const STALE_AFTER = 36 * 60 * 60 * 1000;   // amber dot if older than 36 hours

const $ = id => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

let data = store.get('rates', null);   // { rates, ratesTime, fetchedAt, source }
let sel = store.get('sel', { from: 'AUD', to: 'VUV', amount: '1' });
let lastError = null, busy = false;

let names;
try { names = new Intl.DisplayNames(['en-AU'], { type: 'currency' }); } catch { names = null; }
const nameOf = c => (names && names.of(c)) || c;

function fmt(value, code) {
  try {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: code, currencyDisplay: 'code' })
      .format(value).replace(code, '').trim();
  } catch { return value.toFixed(2); }
}

function ago(ms) {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60); if (m < 60) return m + ' min ago';
  const h = Math.round(m / 60); if (h < 48) return h + ' h ago';
  return Math.round(h / 24) + ' days ago';
}

function auDate(ms) {
  return new Date(ms).toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function codes() {
  const all = Object.keys(data ? data.rates : {}).filter(c => nameOf(c) !== c || FAVS.includes(c));
  const rest = all.filter(c => !FAVS.includes(c)).sort();
  return { favs: FAVS.filter(c => all.includes(c)), rest };
}

function fillSelects() {
  const { favs, rest } = codes();
  for (const id of ['from', 'to']) {
    const el = $(id);
    el.innerHTML = '';
    const g1 = document.createElement('optgroup'); g1.label = 'Common';
    const g2 = document.createElement('optgroup'); g2.label = 'All';
    for (const c of favs) g1.append(new Option(c, c));
    for (const c of rest) g2.append(new Option(c, c));
    el.append(g1, g2);
    el.value = sel[id];
  }
}

function parseAmount(s) {
  const n = parseFloat(String(s).replace(/[,\s]/g, ''));
  return isFinite(n) ? n : NaN;
}

function convert(amount, from, to) {
  const r = data.rates;
  return amount / r[from] * r[to];
}

function render() {
  $('fromName').textContent = nameOf(sel.from);
  $('toName').textContent = nameOf(sel.to);

  if (!data || !data.rates[sel.from] || !data.rates[sel.to]) {
    $('result').textContent = '–';
    $('rate').textContent = data ? '' : 'No rates yet - connect to the internet once.';
    $('quick').innerHTML = '';
    renderSync();
    return;
  }
  const amt = parseAmount(sel.amount);
  $('result').textContent = isNaN(amt) ? '–' : fmt(convert(amt, sel.from, sel.to), sel.to);
  const one = convert(1, sel.from, sel.to);
  const sig = v => v.toLocaleString('en-AU', { maximumSignificantDigits: 4 });
  $('rate').textContent = `1 ${sel.from} = ${sig(one)} ${sel.to}  ·  1 ${sel.to} = ${sig(1 / one)} ${sel.from}`;

  const q = $('quick');
  q.innerHTML = '<label>Same amount in · tap to pick</label>';
  for (const c of FAVS) {
    if (c === sel.from || c === sel.to || !data.rates[c]) continue;
    const row = document.createElement('div');
    row.className = 'row';
    row.style.cursor = 'pointer';
    row.title = 'Tap to convert to ' + c;
    row.innerHTML = `<span>${c}</span><span>${isNaN(amt) ? '–' : fmt(convert(amt, sel.from, c), c)}</span>`;
    row.onclick = () => { sel.to = c; save(); $('to').value = c; render(); };
    q.append(row);
  }
  renderSync();
}

function renderSync() {
  const b = $('sync');
  b.className = '';
  if (busy) b.classList.add('busy');
  if (!data) {
    $('syncText').textContent = busy ? 'Syncing…' : 'Never synced';
    b.classList.add('off');
  } else {
    $('syncText').textContent = data.seed ? (busy ? 'Syncing…' : 'Not synced yet') : 'Synced ' + ago(data.fetchedAt);
    const old = data.seed || Date.now() - data.fetchedAt > STALE_AFTER;
    b.classList.add(lastError && !data.seed ? 'off' : old ? 'stale' : 'ok');
  }
  $('msg').textContent = data && data.seed
    ? `Using built-in rates from ${auDate(data.ratesTime)} until first sync`
    : lastError && data
    ? `Offline - using rates from ${auDate(data.ratesTime)}`
    : data ? `Rates dated ${auDate(data.ratesTime)} · ${data.source}` : (lastError || '');
  $('msg').style.color = lastError ? '' : 'var(--dim)';
}

function save() { store.set('sel', sel); }

async function sync(force) {
  if (busy) return;
  if (!force && data && !data.seed && Date.now() - data.fetchedAt < REFRESH_AFTER) return;
  busy = true; renderSync();
  let err = null;
  for (const s of SOURCES) {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 8000);
      const res = await fetch(s.url, { cache: 'no-store', signal: ctl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const p = s.parse(await res.json());
      if (!p.rates.VUV || !p.rates.AUD) throw new Error('missing rates');
      const hadData = !!data;
      data = { ...p, fetchedAt: Date.now(), source: s.name };
      store.set('rates', data);
      lastError = null;
      busy = false;
      if (!hadData) fillSelects();
      render();
      return;
    } catch (e) { err = e; }
  }
  busy = false;
  lastError = navigator.onLine === false ? 'No internet connection' : 'Could not reach rate servers';
  console.warn('sync failed', err);
  render();
}

// --- events ---
$('amount').value = sel.amount;
$('amount').addEventListener('input', e => { sel.amount = e.target.value; save(); render(); });
$('amount').addEventListener('focus', e => e.target.select());
$('from').addEventListener('change', e => { sel.from = e.target.value; save(); render(); });
$('to').addEventListener('change', e => { sel.to = e.target.value; save(); render(); });
$('swap').addEventListener('click', () => {
  [sel.from, sel.to] = [sel.to, sel.from];
  $('from').value = sel.from; $('to').value = sel.to; save(); render();
});
$('sync').addEventListener('click', () => sync(true));
window.addEventListener('online', () => sync(true));
document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(false); });
setInterval(renderSync, 30000);

// First run with no internet: fall back to the rates built into the app.
async function loadSeed() {
  if (data) return;
  try {
    const s = await (await fetch('rates-seed.json')).json();
    if (!data) { data = { ...s, fetchedAt: s.ratesTime, seed: true }; fillSelects(); render(); }
  } catch {}
}

fillSelects();
render();
loadSeed().then(() => sync(false));

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
