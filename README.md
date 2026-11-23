# Ember Descent V1.27 — Shareable Runs, Daily Challenges & Illustrated Cards

## Milestones complete

### Unique, visible card artwork
- **96 standalone card illustrations**, one for every card currently defined (starter, pool, special, Status, Curse).
- Illustrations are displayed directly on cards in **hand, card rewards, upgrade previews, deck/pile displays, shops and the Card Compendium**, without hovering.
- All files are local SVGs (no image hosting or network dependency). They are distinct icon-based fantasy compositions, not proprietary Slay the Spire 2 illustrations.
- Compendium now has working **search, type and rarity filters**; names are visible below tiles. Mobile hands emphasize artwork instead of crowding the picture with descriptions.

### Seeded run and replayability milestone
- Custom seeds: enter a seed from a friend to recreate a run.
- Random runs: share their generated seed.
- Repeatable UTC daily challenge: same UTC calendar date gives the same daily seed on the same rules version.
- Run Chronicle stores seeds; completed seeded runs can be replayed directly from their records.
- Named RNG streams keep maps, encounters, reward choices, merchant offers, ancient boons and combat randomness distinct; visual-only effects do not influence game decisions.
- Same game version, seed, and **same decisions** should reproduce outcomes. Choosing different paths or using cards in a different order can change subsequent outcomes.

### Reliability fixes
- Seed controls appear immediately on a fresh launch.
- Card Compendium works before beginning a run, including its Close button.
- Compendium search retains focus while typing; type and rarity filters work.
- Existing run save key **`ember_descent_sts2_100` unchanged**; V1.25 history preserved.

## Install
1. Extract the release ZIP.
2. Copy **every file and folder inside `github-pages/`** into the root of your `sts-online` GitHub Pages repository.
3. Preserve the folder structure, **especially `assets/card-art/`** and the CSS/JS files.
4. Wait for deployment, open the website, and verify the footer displays **V1.27**. If Chrome shows an earlier build, check in Incognito.

## Limitations
- These are original Ember Descent daily-style challenges; no server-wide daily leaderboard, online synchronization, or official STS2 challenge system.
- Seed reproducibility is tied to this build and RNG rule version R1. New game changes may require a new rules version.
- Saved history and runs remain per-browser; clearing site storage can erase them.
- Browser QA did not include a live GitHub Pages deployment or a physical iPhone Safari session.
- Existing game systems are an original fan-game implementation and are not certified 1:1 copies of Slay the Spire 2.

## Artwork licensing
The original composition/backgrounds in `assets/card-art/` use recolored pictogram shapes from Font Awesome Free (Fonticons, Inc.), licensed CC BY 4.0. See [`CARD_ART_NOTICE.md`](CARD_ART_NOTICE.md).
