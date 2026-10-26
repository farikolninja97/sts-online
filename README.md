# Ember Descent V1.20 — Individual Enemy AI & Honest Intents

Install: upload the **contents** of this folder to your GitHub Pages site root (including `index.html`, `src/` and `styles/`). Confirm **V1.20** in the footer after publishing.

## What's new

- All 52 original enemies have per-enemy move-selection policies, preserving normal/elite/boss encounters.
- Some opponents use scripted patterns, some weighted move selection with no-repeat limits, some fixed attacks, and some condition-dependent behavior.
- Intent is selected and saved at the start of the player turn, and it **does not switch** just because the player plays cards. This mirrors the telegraph-first principle of Slay the Spire 2.
- Distinct boss phases and some unique reactions remain; reactions to your last turn now choose the upcoming move instead of unexpectedly changing the current move.
- Damage numbers still update when Strength, Weak, Vulnerable and similar modifiers change; the planned action is stable.
- Open **Intel** during battle to inspect the enemy's move style and current committed intent.
- PRNG state and planned moves serialize in your run save. Existing `ember_descent_sts2_100` save key unchanged; old V1.19 saves can resume.

**Accuracy note:** The game's 52 monsters have original names, appearances, and move tables. Their AI architecture follows documented STS2 design categories, but **these are not copies of the actual enemy AI**. 1:1 correctness needs an official-enemy-by-enemy rewrite/audit against a specific game patch, which this release does not claim.

## Installation

1. Extract the ZIP and open `github-pages/`.
2. Upload everything **inside** that folder to the GitHub Pages site root, replacing the previous version.
3. Hard refresh or reopen the tab and confirm V1.20 in the footer.
4. Resume a saved run or start a new one.

The `docs/` folder is for QA/checklists; it does not need to be deployed.
