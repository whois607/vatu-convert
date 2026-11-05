"""Refresh rates-seed.json, the built-in rates used until the app's first sync."""
import json
import os
import urllib.request

here = os.path.dirname(os.path.abspath(__file__))
j = json.load(urllib.request.urlopen("https://open.er-api.com/v6/latest/USD", timeout=15))
assert j["result"] == "success" and "VUV" in j["rates"] and "AUD" in j["rates"]
seed = {"rates": j["rates"], "ratesTime": j["time_last_update_unix"] * 1000, "source": "built-in copy"}
with open(os.path.join(here, "rates-seed.json"), "w") as f:
    f.write(json.dumps(seed, separators=(",", ":")))
print(len(j["rates"]), "rates, dated", j["time_last_update_utc"])
