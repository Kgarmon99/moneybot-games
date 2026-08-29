# Capital Command Elite — Game Brief

## Snapshot
- **Pitch:** Catch fictional income, then build a resilient capital system through six progressively unlocked commands.
- **Audience / session:** Adults and founders; mobile-first; roughly 3 minutes.
- **Learning goal:** Feel why sequence matters: Bills → Shield → Debt → Invest → Skill → Diversify.
- **Disclaimer:** Educational content only. Not investment advice.

## Core loop and progression
The player steers MoneyBot to catch income and avoid expenses/market risk, then allocates held cash. Exactly one system unlocks per wave:
1. Bills protects current obligations.
2. Shield absorbs surprises.
3. Debt lowers future interest drag.
4. Invest compounds after the base is stable.
5. Skill improves future income and burn.
6. Diversify reduces volatility damage.

Locks are enforced through click, keyboard 1–6, and automatic deployment. Disabled controls remain visible with accessible unlock labels. The live projection and committed outcome call the same pure `applyAllocation` rule.

## Evidence and replay
Every allocation, expense, shock, market loss, and wave close creates a timeline event. The final Command Report includes allocation totals, wave history evidence, bills missed, shocks, avoided interest, investment change, starting/ending runway and net worth, plus deterministic strongest/weakest coaching. Snapshots at each reached wave support replay from that wave with the same seeded random stream.

## Controls and accessibility
- Pointer drag/tap, WASD/arrows, number keys 1–6, Space/Escape pause.
- 44px minimum interactive targets, keyboard focus indicators, modal focus trap and focus restoration.
- Locked systems use native `disabled` plus descriptive ARIA labels.
- Non-shaming coaching and reduced-motion support.

## Responsive contract
Active play fits 390×844 without document scrolling or horizontal overflow. The logical 390×360 canvas scales into a flexible one-screen grid. Desktop uses the same browser-native files with no build step.

## Done criteria
- [x] Complete six-wave game loop and progressive unlock enforcement
- [x] Pure shared exact allocation projection/commit rule
- [x] Timeline and complete final Command Report
- [x] Deterministic evidence coaching and replay-from-wave snapshots
- [x] 390×844 one-screen active play and 44px targets
- [x] Pause/restart fix, focus trap/restore, safe AudioContext
- [x] Official MoneyBot brand kit and disclaimer
- [x] Syntax and focused Playwright tests
- [x] Repository static/browser QA checks
- [ ] Independent Codex review (blocked by invalid Codex refresh token)
- [ ] Physical-device human playtest
