# MoneyBot Games — Catalog and Quality Audit

**Audit date:** 2026-08-08

**Canonical branch:** `gh-pages`

**Baseline commit:** `b8f3356`

## Executive decision

Do not add more games yet. The next release should establish one canonical catalog, promote 8–12 verified flagships, move unfinished or duplicate games out of the public library, and make the shared MoneyBot game shell the publication gate.

The current homepage is healthy enough to build on, but the game library predates the current Elite standard. Volume is not the constraint; consistency, trust, and curation are.

## Verified runtime baseline

The automated mobile audit loaded every game declared in the active homepage catalog at **390×844**.

| Check | Result |
|---|---:|
| Homepage catalog entries | 108 |
| Successful initial loads | 108 / 108 |
| Initial load failures | 0 |
| Mobile horizontal overflow detected | 0 |
| Missing homepage entry points | 0 |
| Homepage catalog audit | Pass |
| Homepage smoke test at 390×844 | Pass |
| Homepage smoke test at 1440×900 | Pass |

A host-injected `/api/sponsors/` request was excluded from game error scoring because it is not present in repository source. The raw request remains recorded in `health-audit/latest.json` for transparency.

## Catalog integrity findings

There are currently three conflicting sources of game truth:

| Source | Records | Notes |
|---|---:|---|
| `moneybot-official/index.html` | 108 declared | Active homepage catalog |
| `moneybot-official/games.js` | 118 unique IDs | Stale; many IDs have no physical game directory |
| `moneybot-official/games.json` | 152 records / 151 unique IDs | Includes a duplicate and many nonexistent IDs |

Additional findings:

- The active homepage dynamically inserts `fraud-or-nah`, producing 109 rendered entries.
- There are roughly 132 playable root game directories outside the homepage shell.
- The homepage omits 25 directories with `index.html`; 11 are explicit stubs.
- All 108 declared homepage thumbnail paths existed at audit time.
- Likely version collisions include:
  - `bot-money-surfers` and `bot-money-surfers-new`
  - `bot-cold-storage` and `bot-crypto-cold-storage`
  - multiple game generations inside `bot-property-flipper`, `bot-saas-empire`, `bot-startup-tycoon`, and `bot-ecommerce-empire`

## Quality-system gap

Static signals from the active 108-game homepage catalog:

| Signal | Count |
|---|---:|
| Shared MoneyBot brand kit detected | 0 |
| Official MoneyBot avatar detected | 0 |
| Deprecated mascot detected | 28 |
| Reduced-motion support detected | 0 |
| Keyboard handling detected | 37 |
| Pause-state signal detected | 8 |
| Restart-state signal detected | 75 |
| Catalog payload on disk | 50.1 MB |

Across all playable directories, only `fraud-or-nah` clearly uses both the shared MoneyBot CSS and `MoneyBotGameKit`. This should become the migration reference, not proof that the rest of the library meets the current standard.

These are triage indicators, not Elite scores. Each flagship still needs play-state QA, learning-mechanic review, performance measurement, and independent challenge review before receiving an Elite badge.

## Priority upgrade shortlist

| Rank | Game | Why it belongs in the first cohort | First upgrade |
|---:|---|---|---|
| 1 | `fraud-or-nah` | Closest to the current quality standard and best reference implementation | Finish canonical shell and use as release template |
| 2 | `capital-command` | Differentiated portfolio strategy loop with brief/QA foundation | Install shared kit; strengthen disclaimer and mobile polish |
| 3 | `cashflow-cruiser` | Accessible arcade loop naturally tied to cash-flow decisions | Standardize shell, feedback, and learning recap |
| 4 | `bot-crypto-trading` | High-interest topic and substantial implementation | Improve risk framing, persistence, and shared branding |
| 5 | `bot-ecommerce-empire` | Strong entrepreneurship fit and deeper systems | Consolidate duplicate code generations before polish |
| 6 | `bot-property-flipper` | Homepage prominence and distinct visual concept | Consolidate versions; add QA contract and shared kit |
| 7 | `bot-compound-climb` | Compounding concept maps cleanly to progression | Upgrade mobile controls, official avatar, and end-state lesson |
| 8 | `bot-smart-borrower` | Practical credit/borrowing learning value | Add canonical shell and clearer APR/cost feedback |
| 9 | `bot-money-surfers-new` | Stronger technical signals than the cataloged older version | Compare versions and promote one canonical folder |
| 10 | `bot-debt-trap` | Memorable survival metaphor with flagship potential | Make debt cost mechanical and add meaningful progression |

Next tier: `money-printer-go`, `bot-fire-forge`, `bot-buy-the-dip`, `bot-insurance-defender`, and `bot-history-of-money`.

## Homepage release plan

### Release 1 — Truth and trust

1. Create one canonical manifest with:
   - ID and canonical URL
   - title and thumbnail
   - money-learning objective
   - topic and gameplay genre as separate fields
   - difficulty and estimated playtime
   - status: `flagship`, `verified`, `beta`, `labs`, or `archived`
   - version and last-reviewed date
2. Generate homepage data from that manifest.
3. Remove stale catalog sources from production use.
4. Resolve duplicate game versions.
5. Move stubs and unfinished games into a hidden `/labs/` collection.

### Release 2 — Curated homepage

1. Lead with 8–12 verified flagship games.
2. Add learning tracks such as Budgeting, Credit, Investing, Entrepreneurship, and Risk.
3. Show a clear learning outcome, difficulty, playtime, and quality badge on every card.
4. Keep search, favorites, and recent play, but stop presenting every game as equally finished.
5. Replace reused/fallback thumbnail art on flagship cards.

### Release 3 — Shared progression

1. Add one local player profile shared across games.
2. Track completed lessons, high scores, streaks, and achievements.
3. Add “Continue playing” and recommended next lessons.
4. Defer accounts/backend until the local progression model proves useful.

## Publication gate

A game should not appear as Verified or Flagship unless it has:

- shared MoneyBot brand kit and official avatar
- complete start, onboarding, play, pause, win/loss, and restart flow
- mobile-first controls and no accidental overflow
- reduced-motion support and keyboard controls where appropriate
- no actionable console errors or missing assets
- learning feedback embedded in the mechanic
- honest demo/educational framing
- documented QA and 90+ Elite rubric score for Elite status
- independent challenge review with no blocking findings

## Artifacts

- Automated audit: `scripts/health-audit.js`
- Runtime report: `reports/health-audit/latest.md`
- Machine-readable results: `reports/health-audit/latest.json`
- Priority screenshot script: `scripts/capture-priority-games.js`
- Priority screenshots: `reports/priority-screenshots/`
- Screenshot manifest: `reports/priority-screenshots/manifest.json`

## Recommended next physical build

Build the canonical manifest and curated homepage using the ten-game cohort above. In parallel, use `fraud-or-nah` as the shell reference and upgrade `capital-command` as the first migration proof. This tests both catalog architecture and the per-game upgrade workflow before touching the remaining library.
