# Ember Descent V1.17 — Ancient Blessings

An original, unofficial Ironclad-only browser deckbuilder, distributed as a static, modular GitHub Pages site.

## Install / upgrade

1. Extract the ZIP.
2. Upload **all files inside `github-pages/`** to the root of your GitHub Pages repository. Keep `src/` and `styles/` exactly as organized.
3. In GitHub repository settings enable Pages from `main` → `/(root)`.
4. Verify the footer displays **V1.17**. If you see an old cached page, use a private tab or append `?v=117` to the URL.

## What's new

- New runs begin with **Neow**, who offers two positive Ancient relics and one curse/drawback relic. Pick one and **Confirm** to begin your Act 1 map.
- After the Act 1 boss, an **Act 2 Ancient** is chosen from Pael and Tezcatara. After the Act 2 boss, an **Act 3 Ancient** is chosen from Nonupeipe and Tanx.
- Each Act opens with three choices, one claim per Act. Selections, owned Ancient relics and their effects persist in existing local run saves.
- Entering the Ancient encounter restores missing HP (or 80% on the prototype's A9+ toggle, reflecting the game's A2+ healing rule).
- Implemented relic effects include Golden Pearl, Arcane Scroll, Nutritious Oyster, Neow's Talisman, Booming Conch, Small Capsule, Phial Holster, Cursed Pearl and Large Capsule; Pael Flesh/Blood/Tears; Tezcatara Very Hot Cocoa/Yummy Cookie/Seal of Gold; Nonupeipe Delicate Frond/Looming Fruit/Signet Ring; Tanx Sai/Iron Club/War Hammer.
- **Greed** added as an Eternal, Unplayable Curse, and merchant card removal now respects Eternal.
- Ancient relics appear in the normal relic collection with tap-to-read tooltips. They are excluded from the ordinary randomized relic reward pool.

## Main-build scope and limitations

References use Slay the Spire 2's **main v0.107.1**. In the actual game Neow is specific to Act 1; later acts use different Ancients. This release currently supports **two of the several possible Ancients** in each of Acts 2 and 3, with selected fully implemented boons rather than every possible Ancient relic or its complex enchantment mechanics. The base game is still a smaller, fan-made prototype.

The A9+ toggle approximates the Ancient's reduced heal for Ascension 2+; a full Ascension 0–10 selection remains out of scope. The actual game's rare unlock eligibility, weighted relic RNG and some encounters differ.

**Saved-run compatibility:** Existing V1.16 runs remain playable on their current room. Starting a **new run** is required to see Neow at the Act 1 entrance. Older in-progress runs will get the new Ancient choices after their next act transition. No save-key reset is needed (`ember_descent_sts2_100`).

## Code architecture

- `src/systems/ancients/ancient-boons-v117.js`: offer definitions, risk pools, Ancient screen, confirm/commit, save compatibility and passive combat triggers.
- `styles/ancients-v117.css`: responsive Ancient selection scene and reduced-motion styles.
- `src/systems/combat/statuses-curses.js`: registers Greed before save migration.
- `src/ui/merchant-and-collection.js`: honors Eternal in the removal service.
- `src/core/config.js`: site version number.

## Test commands

Run from the repository containing the developer scripts:

```bash
python test_ancients.py
python test_effects.py
python test_persistence_mock.py
python tests_smoke_v117.py
python test_reward_regression.py
```

Hosted reload testing is not available in the current browser sandbox, so storage persistence was verified using an instrumented localStorage mock; physical iPhone Safari and live GitHub Pages testing are still outstanding.
