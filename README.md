# Vatu Convert

A one-screen currency converter for Android and iPhone, built around the
Vanuatu vatu (VUV). It is an installable web app: open the link once, install
it, and from then on it runs from its own icon with no internet needed.

* Rates for ~155 currencies from free, no-key public APIs: open.er-api.com
  (updates daily), falling back to the fawazahmed0 currency-api on jsDelivr.
* Ready ahead of time: installing stores the whole app on the phone, plus a
  built-in copy of the rates, so it works even if first opened offline.
* Works offline: the last synced rates are kept on the phone. The pill at the
  top shows how long since the last sync (green = fresh, amber = over 36 h or
  built-in rates, red = last try failed). Tap it to refresh. It also refreshes
  by itself on open when the rates are over an hour old, and when the
  internet comes back.
* Remembers your last From/To currencies and amount.
* The quick list shows the same amount in VUV, AUD, NZD, USD, FJD, XPF (New
  Caledonia / Tahiti), EUR and GBP; tap one to make it the To currency.

## Install on a phone (do this before the trip, with internet)

* **Android (Chrome):** open the link, then menu ⋮ → *Install app* (or *Add to
  Home screen*). Firefox: menu → *Install*.
* **iPhone (Safari, iOS 16.4+):** open the link, Share → *Add to Home Screen*.
  Open it once from the new icon while online so it saves its own rates.

## Hosting

Static files only, served by GitHub Pages from this repo's `main` branch.
No personal data is in the repo. After changing app files, bump `CACHE` in
`sw.js` so installed copies pick up the change. `python update_seed.py`
refreshes the built-in rates; `python serve.py` serves it locally on
http://localhost:8768 for testing.
