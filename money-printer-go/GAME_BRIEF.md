# MoneyBot Game Brief: Money Printer GO

## Snapshot

- **Pitch:** Print cash when necessary, convert it into productive assets, and protect buying power before inflation overheats.
- **Audience:** Ages 12–16
- **Session:** Two minutes
- **Platform:** Mobile-first browser game; keyboard supported
- **Status:** Flagship rebuild, ready for human playtest pending Codex gate

## Learning mechanic

Money Printer GO models a simplified closed game economy—not a universal claim about real monetary policy. Printing creates immediately spendable cash while increasing the price multiplier and reducing buying power. Productive assets create passive income without additional inflation pressure. The player learns through the tradeoff: cash can solve a short-term need, but durable earning capacity matters more than repeatedly expanding the money supply.

## Core loop

1. Tap, hold, or press Space to print only enough cash for an asset.
2. Choose among Tool Kit, Micro Business, and Rental Property.
3. Let passive income fund the next purchase while inflation cools.
4. Reach 100 real wealth before two minutes or 1,000% inflation.

## Asset decisions

| Asset | Base price | Wealth | Passive income | Role |
|---|---:|---:|---:|---|
| Tool Kit | $30 | +2 | +$1/s | Early engine |
| Micro Business | $140 | +9 | +$6/s | Mid-game accelerator |
| Rental Property | $520 | +28 | +$17/s | High-cost wealth anchor |

Prices rise with inflation and repeated ownership. Consecutive asset purchases create a smart streak; printing resets it.

## Complete flow

- Title and three-part onboarding
- Active game with touch, hold, mouse, and keyboard controls
- Pause/resume/restart state
- Inflation and timeout loss coaching
- Win result with wealth, inflation, and best streak
- Local best-run persistence
- Optional sound (off by default) and haptics
- Automatic pause when the tab is hidden

## MoneyBot design

- Canonical shared brand kit and avatar
- Custom SVG icons for the three assets
- Green for productive income, gold for wealth, red only for genuine danger
- Coach copy is short, useful, and non-shaming
- Reduced-motion fallback, focus states, semantic dialogs, live coaching, and accessible zoom

## Technical model

- Explicit runtime state: cash, wealth, passive income, inflation multiplier, asset ownership, streak, timer, and lifecycle flags
- One requestAnimationFrame loop; cancelled on pause/end/restart
- Stable asset DOM updated in place
- Pointer hold plus keyboard shortcuts: Space, 1–3, P/Escape
- Local storage keys: `mb_printer_best_v2`, `mb_printer_sound_v1`

## Verification

- [x] Browser loads without page errors
- [x] Complete start/play/pause/result/restart loop
- [x] Mobile checks at 320×568, 375×667, 390×844, and 430×932
- [x] Desktop check at 1440×900
- [x] Keyboard and pointer controls
- [x] Money mechanic drives scoring and pricing
- [x] Shared MoneyBot brand kit and local assets
- [x] Reduced-motion and focus support
- [x] Repository manifest/catalog/smoke tests
- [ ] Codex challenge (blocked by expired Codex authentication)
- [ ] Human balance and feel playtest
