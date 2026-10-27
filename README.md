# Ember Descent V1.23 — Accurate Status Timers and Shrink

This is a **full GitHub Pages deployment ZIP**, based on V1.22, with V1.23 lifecycle fixes. It also restores `src/input/preview-targeting.js` (missing in the V1.22 ZIP) from V1.21.

## Installation
1. Extract the archive.
2. Upload **all files inside `github-pages/`** to the root of `farikolninja97/sts-online` on GitHub (`main` branch); keep directory structure intact.
3. Wait for GitHub Pages to deploy. In Chrome try an Incognito tab to avoid stale cached JS. Check the bottom footer says **V1.23**.
4. Existing saves use `ember_descent_sts2_100`; the save key is unchanged.

## New status behavior
- **Shrink from Shrinker Beetle:** the character gets small and deals 30% less Attack damage; the effect stays until its applying beetle dies. The actual game does **not** use a 3-turn expiration for this specific enemy.
- **Beetle Juice:** applies 4 turns of timed Shrink to an enemy (additional copies add more turns). The 30% damage reduction is the same, not multiplied by remaining duration.
- Weak, Vulnerable and Frail tick at end of enemy phase. Application during the enemy phase does not immediately lose duration on the player.
- Tangled costs more for Attacks and ends completely at the end of the afflicted player's turn.
- Plating grants Block at end of your turn and loses 1 stack at the next turn's start—not on damage.
- Mangle's temporary Strength loss lasts for the afflicted enemy's next move, then ends.
- Artifact blocks the next applicable debuff and consumes one charge.

## Testing
See `QA_REPORT_V1.23.md`. The game remains an original fan prototype with authored Ember Descent enemies; successful status checks do not make its entire card and enemy collection 1:1 with Slay the Spire 2.
