# MoneyBot game catalog

`games.manifest.json` is the canonical source of truth for the public MoneyBot Games catalog.

## Rules

- Add, update, feature, hide, or archive games only in `games.manifest.json`.
- Do not add embedded game arrays to `index.html`.
- `moneybot-official/games.js` and `moneybot-official/games.json` are legacy snapshots and must not be consumed by the site.
- Run `npm run test:manifest` after every catalog change.
- A `flagship` entry requires a unique positive `featuredOrder`.
- Use `visibility: "hidden"` or status `labs`/`archived` to remove a game from the public catalog without deleting its files.

## Required fields

Every entry defines its stable ID, title, URL, thumbnail, learning objective, financial topic, genres, difficulty, playtime, release status, visibility, homepage section, version, and review date.
