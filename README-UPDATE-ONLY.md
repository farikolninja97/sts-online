# STS-Online V1.28 — Update only (from V1.27)

This ZIP contains ONLY the six functional website files added or changed
between V1.27 and V1.28. All 96 card artwork files are byte-for-byte
unchanged, so no card art is included. The full release also updates a
README file, which is unnecessary for running the website and is omitted.

## Installation
1. Use this package if the repository already has V1.27, including the
   `assets/card-art/` folder.
2. Extract the ZIP and upload ONLY the files inside `github-pages/` into
   the root of your `sts-online` repository. Preserve folder paths.
3. Replace files with the same names; DO NOT delete unchanged files.
4. Once GitHub Pages deploys, check the footer shows V1.28.

## Website files in this patch
- `index.html`
- `src/core/config.js`
- `src/systems/combat/enemy-variety-v128.js`
- `src/systems/combat/turn-sequence.js`
- `styles/card-clarity-v128.css`
- `styles/enemy-variety-v128.css`

## Notes
- If full V1.28 is already deployed, do not upload this patch again.
- Saves, Run Chronicle, and card art are unchanged.
- This is an incremental update, not a standalone full website.
- No Supabase migration.

## Verification
Compared the actual V1.27 and V1.28 release archives by file content.
Applying these six files to V1.27 recreates the full V1.28 running site
exactly (excluding the nonessential README.md documentation change).
