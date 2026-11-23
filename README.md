# Ember Descent V1.25 — Run Chronicle Milestone

**Full GitHub Pages update** based on V1.24 Events & Treasures. Ironclad-only original browser roguelike. No server, Supabase, or SQL migration.

## Milestone delivered: persistent Run Chronicle

A finished run now creates a historical record **separate from the live-game save**, including:

- Victory/defeat, act, floor, floors cleared, battles won, difficulty, and elapsed time
- Final deck with card upgrades and Curses
- Relics, remaining potions, Ancient choice history, and event/treasure journal
- Gold, HP, damage dealt/taken/blocked, turns ended, and cards played (precise combat telemetry starts with new V1.25 runs; migrated runs are marked partial)
- Run summary after victory or defeat and a detailed record viewer
- Last 100 completed runs, win rate, highest climb, and total battles/floors from retained runs
- 12 original achievement badges (display/progression only; **no official STS2 card unlocks**)

The Chronicle is accessible from the **start screen** and the **Game Menu**. Live progress appears under **Menu → Current Run**. The end screen offers **View Run Chronicle** and **Start another run**. Duplicate recording is prevented on reload and repeated rendering.

## Install

1. Extract the release ZIP.
2. Open the `github-pages/` folder in the ZIP.
3. Upload everything **inside** `github-pages/` into the root of `farikolninja97/sts-online` on your Pages branch, keeping `src/` and `styles/` subdirectories.
4. Wait for your GitHub Pages deployment, then check that the footer says **V1.25**. Use Chrome Incognito to bypass older cached JavaScript without wiping local site storage.

**Save compatibility:** The live save key remains `ember_descent_sts2_100`. The new Chronicle has a **separate localStorage key** (`ember_descent_run_chronicle_v1`). Old in-progress V1.24 saves are migrated without deleting their existing cards, relics, or journal. Only combat statistics accumulated after upgrading to V1.25 are counted for an old run.

**Storage warning:** Chronicle data stays **only in that browser/site storage**, not in GitHub or cloud storage. Chrome and Safari have independent histories. Clearing site data or using private/incognito browsing can erase or discard the history. The in-game **Clear Chronicle** control requires confirmation and does not erase your live run.

## What's unchanged

- 52 enemy designs and 72 formations, original bosses and special AI
- Ironclad card catalog, card upgrades, relics and potions
- V1.23 Shrink and status-duration mechanics
- V1.24 events, treasure, run journal, and map
- Existing local save key and gameplay balance

This is an original fan prototype, not a verified 1:1 recreation of Slay the Spire 2. Run Chronicle achievements are original to this game.

## Source changes

- `src/core/config.js` — visible version V1.25
- `src/systems/game/run-chronicle-v125.js` — run telemetry, outcome archiving, permanent history, badges, UI
- `styles/chronicle-v125.css` — responsive Chronicle, progress, and victory/defeat presentation
- `index.html` — load the new script and style last
- `github-pages/README.md` — install notes

See `QA_REPORT_V1.25.md` and `V1.25_PRIORITY_CHECKLIST.md` for verification scope and remaining priorities.
