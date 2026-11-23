# Ember Descent — V1.24 Events & Treasures

**Full GitHub Pages release** built on **V1.23 Accurate Statuses**. The existing save key, `ember_descent_sts2_100`, has **not changed**.

## Features

### Nine original events (three decisions apiece)
- Cinder Altar — blood for Gold, random upgrade, or leave
- Fractured Mirror — copy a chosen card for HP or remove one for Gold
- Abandoned Armory — a risky relic or a selected Attack upgrade
- Lantern Stall — free potion, paid Rare card, or leave
- Withered Grove — pay for healing or accept healing and a Curse
- Shattered Vault — coins for HP or a relic for Gold
- Runic Workshop — selected card upgrade or Curse removal/healing
- Forgotten Archive — Rare card and Curse, or paid card removal
- Silent Shrine — Max HP upgrade for Gold or a relic for Max HP

Each encounter persists through a reload, keeps track of recent room types so consecutive duplicates are avoided, checks prerequisites before making a choice, and records a single committed result. This is **original Ember Descent event content**, not an official Slay the Spire 2 event catalog.

### Claimable treasure rooms
When entering a **new** treasure room you now select exactly one of:
- An unowned relic
- 75 Gold
- A random potion plus 30 Gold (if you have an open potion slot)

Rewards are never automatically granted before making a choice. A saved V1.23 treasure screen is treated as **already rewarded**, so it cannot pay out a second time.

### Run Journal
Open **Menu → View Run Journal** to review your past event decisions and treasure claims in the current run.

## Install on GitHub Pages

1. Extract this ZIP.
2. Open its `github-pages/` folder.
3. Copy **all files and directories from within `github-pages/`** to your `farikolninja97/sts-online` repository root on `main`, replacing matching files.
4. Keep `src/` and `styles/` directory structures intact.
5. After GitHub Pages deploys, open the site and confirm **V1.24** in the footer. If Chrome still shows an older release, check Incognito or clear cached files (not site storage).

**No Supabase setup or SQL migration.** This is a static-site release and does not change the existing local save key.

## Files added
- `src/systems/events/events-v124.js` — event rules, claimable treasure rules, safe save/reload, journal
- `styles/events-v124.css` — event screen, treasure screen and journal UI

## Files modified
- `src/core/config.js` — version V1.24
- `index.html` — load V1.24 script and stylesheet

## QA
See `QA_REPORT_V1.24.md` for executed tests and limits. Chromium tests ran from an **inline test bundle with simulated localStorage** because direct local HTTP/file navigation is blocked in this test environment. Live GitHub Pages and physical Safari must be verified after deployment. The entire official STS2 content catalog is not recreated in this prototype.
