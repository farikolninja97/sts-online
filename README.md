# Ember Descent V1.13 — Smoother card controls and visual feedback

Unofficial, fan-made, single-player Ironclad browser game, currently aligned to the **Slay the Spire 2 main-build v0.107.1** rules where individually implemented and verified. Enemy names and artwork are original. This is a playable prototype, not a replacement for the original game.

## Deploy to GitHub Pages

Upload **all files inside `github-pages/`** to the root of the existing GitHub repository. Keep the complete `src/` and `styles/` folders and their paths. Do **not** upload only `index.html`. Go to Settings → Pages → Deploy from a branch, `main`, `/(root)`.

The site is static: no npm build, backend, third-party CDN, or account connection required. Refresh after GitHub completes deploying; the footer should say **V1.13**. Your browser's previous run is intended to survive because the save key remains `ember_descent_sts2_100`. Make a backup of important save data before replacing the project.

## V1.13 input and presentation improvements

- Unified pointer control for touch, mouse and pen. Tap to select a card without opening an obstructive modal; tap the same non-targeted card again or press **Play** to cast. To cast a targeted Attack or Skill, tap the selected card then tap an enemy, or drag to that enemy.
- Swipe horizontally to scroll a full hand. Vertical card dragging releases to cast Skills and Powers. A drag that misses its enemy remains selected rather than automatically hitting the wrong target.
- Live damage readout while dragging over an enemy, based on its Vulnerable, Block, the player's Strength and Weak, and other supported damage modifiers. The card ghost shows updated attack damage and estimated HP loss.
- Each upgraded card now has a green title, accent trim, and upgrade icon, while keeping its original Attack/Skill/Power identity.
- When True Grit, Cinder or Thrash randomly Exhausts another card, a visible dismissible notice names that card. It also appears in the Exhaust pile.
- Targeted browser checks include actual Chromium mobile touch drag gestures and test that a previous drag does not suppress an immediate tap on a different card.

## Previous V1.12 relic features

- 32 built-in relic definitions: Ironclad's starting **Burning Blood** plus **31 obtainables**.
- Relics can drop from Elite and Boss fights, appear in treasure chests, or be purchased from the merchant with in-game Gold.
- Effects include start-of-combat Block, Strength, Dexterity, healing, draw, Energy, Weak/Vulnerable application, Thorns, HP thresholds, cumulative attack/skill counters, and exhaust triggers.
- Per-run collection accessible from the header; active relic icons also appear in combat.
- Tap a relic, a combat status, the Block shield, Energy, or enemy intent to inspect its effect. The Combat Reference provides tap-friendly keyword explanations.
- Card damage preview continues to use the underlying damage engine, including Red Skull and Strike Dummy.
- Existing maps, mobile drag-to-play, animations, draw/discard/exhaust views, and Ironclad cards are retained.

## Edit one system at a time

| Task | Files |
|---|---|
| Add a relic and its rarity/description | `src/data/relic-catalog.js` |
| Implement new relic triggers and pickup effects | `src/systems/relics/relic-engine.js` |
| Change relic inventory, shops, contextual help | `src/ui/relic-interface.js` |
| Update pointer dragging, taps and selection toolbar | `src/input/drag-targeting.js` |
| Update combat card appearance and upgrade accents | `src/ui/card-rendering.js`, `styles/game.css` |
| Update random Exhaust popups | `src/ui/random-exhaust-feedback.js`, `src/systems/combat/card-resolution.js` |
| Change how enemy damage / card damage is calculated | `src/systems/combat/turn-sequence.js`, `src/systems/combat/damage-preview.js` |
| Change the map, cards and rewards | `src/systems/map/`, `src/data/`, `src/systems/rewards/` |
| Adjust the iPhone combat layout | `styles/game.css` |
| Change version or save key | `src/core/config.js` |

**Development caution:** V1.13 still retains compatibility shims and layered classic JavaScript function overrides inherited from V1.11. Script order in `index.html` matters. Rewriting those layers as independent ES modules is a future cleanup; do not reorder them without running the regression checks.

## Testing

Browser smoke tests and focused relic-interaction tests were run in Chromium. The documented scripts in `tests/` can be executed using Python Playwright and Chromium (`pip install playwright` followed by `playwright install chromium`).

- `python3 tests/smoke.py`
- `python3 tests/relics.py`
- `python3 tests/relics_extended.py`
- `python3 tests/interaction.py`
- `python3 tests/touch_and_visual.py`

Local manual testing: `cd github-pages && python3 -m http.server 8000`, then open `http://localhost:8000/`. The current execution environment blocks Playwright navigation to localhost, so persistent saves after an actual hosted page reload have **not** been verified; they are expected to use the unchanged save key.

**Important scope limit:** 32 definitions is not the full game's relic collection, and this release is not a 100%-verified replica of every relic interaction or shop/drop rate. The collection intentionally includes only relics with effects implemented in this browser prototype. See `RELICS_AND_TOOLTIPS.md` and `QA_REPORT.md`.

The V1.13 UI changes are original visual effects inspired by familiar deckbuilder affordances, not a copy of proprietary card images or animation files.
