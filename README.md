# Vatu Convert

A simple currency converter for your phone (Vanuatu vatu and more).
Works with no internet once it's on your phone.

## Put it on your phone - 3 steps

**1. Scan this with your phone's camera** (or type `whois607.github.io/vatu-convert`)

<img src="qr.png" alt="QR code for the app" width="200">

**2. Tap the green button at the bottom of the app: 📲 Put this app on my phone**

It shows the exact taps for your phone and browser (Android or iPhone,
Chrome, Firefox or Safari).

**3. Open Vatu from your home screen once while you have internet.**

Done. It now works offline, even without signal in Vanuatu.

---

### Quick help if the button isn't showing

| Phone & browser   | Tap this                                                      |
|-------------------|---------------------------------------------------------------|
| Android + Firefox | ⋮ menu → **Add app to Home screen** (or **Install**) → **Add** |
| Android + Chrome  | ⋮ menu → **Install app** → **Install**                         |
| iPhone + Safari   | Share ↑ → **Add to Home Screen** → **Add**                     |
| iPhone + Firefox  | ☰ menu → **Share** → **Add to Home Screen** → **Add**          |

If the button isn't there, the app is already installed.

---

<details>
<summary>How it works (for the curious)</summary>

* Rates for ~155 currencies from free, no-key public APIs: open.er-api.com
  (daily), with the fawazahmed0 currency-api on jsDelivr as a backup.
* The whole app and a built-in copy of the rates are stored on the phone, so
  it works even if first opened offline. The last synced rates are kept.
* The pill at the top says how long since it last synced (green = fresh,
  amber = old or built-in rates, red = last try failed). Tap it to refresh.
* Remembers your last currencies and amount.
* For changes: bump `CACHE` in `sw.js`. `python update_seed.py` refreshes the
  built-in rates; `python serve.py` serves it on http://localhost:8768.
</details>
