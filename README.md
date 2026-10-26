# Ember Descent V1.16 — Loot & Smith confirmation

Deploy **all files** in this `github-pages/` folder to the root of your GitHub Pages repository. Keep `src/` and `styles/` intact. No build step needed.

## What's new
- Post-combat Loot panel: **collect gold, potion, relic, and select/skip a card individually**. Gold and relics are no longer awarded before claiming.
- Card rewards open a three-card choice dialog; selecting a card opens the full card-reveal window, then returns to remaining loot.
- Potion reward can be skipped, especially when the potion satchel is full. Progression waits for all rows to resolve.
- Smithing is non-destructive until **Confirm Upgrade**. Preview upgraded card next to original; **Cancel / Choose Another** returns to the card selection grid, and **Cancel / Return to Campfire** saves the rest-site action.
- Existing saved run key is unchanged. Saved reward screens created by older versions are handled cautiously and do not re-pay previously earned gold.

## Files
- `src/systems/rewards/loot-and-smith-v116.js` — new loot flow and smith state machine
- `styles/rewards-v116.css` — styles (desktop/iPhone)
- `src/systems/game/legacy-progression-and-input.js` — deferred gold award
- `src/systems/relics/relic-engine.js` — stage post-combat relic until claimed

Version: V1.16. Fan prototype; not an official game.
