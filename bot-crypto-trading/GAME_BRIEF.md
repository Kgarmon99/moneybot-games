# Crypto Trading Sim — Game Brief

## 1. Game Snapshot
- **Title:** Crypto Trading Sim
- **One-line pitch:** Simulated crypto spot trading with realistic volatility. Learn risk management, position sizing, and emotional discipline.
- **Target player:** Ages 13+, anyone curious about crypto investing
- **Session length:** 5–10 minutes
- **Platform:** mobile first, desktop supported
- **Status:** building

## 2. Money Concept
- **Primary concept:** risk / investing / taxes
- **What the player learns through play:** Position sizing matters more than picking winners; leverage amplifies losses; stop-losses protect capital; short-term gains get taxed harder.
- **What behavior the game rewards:** Diversification, patience, risk management, tax-aware holding.
- **What misconception the game corrects:** "Crypto is easy money" — the game shows how quickly leverage and emotion wipe out portfolios.

## 3. Core Loop
> The player repeatedly analyzes coin prices and market events, then buys/sells/holds positions with optional leverage and stop-losses, so they can grow their portfolio toward $1M, while avoiding liquidation and 90% drawdowns.

## 4. Controls
- **Mobile controls:** Tap coins to trade, tap buttons for actions, swipe/scroll for portfolio view.
- **Desktop controls:** Click to trade, keyboard shortcuts (B=buy, S=sell, N=next day, P=pause).
- **Accessibility controls:** All actions available via click/tap; large tap targets.

## 5. Systems
- **Scoring:** Portfolio value, realized gains, win rate, tax liability.
- **Progression:** Day counter, portfolio milestones, unlockable leverage tiers.
- **Difficulty curve:** Volatility increases over time; market events become more extreme.
- **Win condition:** Reach $1M portfolio value.
- **Loss condition:** Liquidation from leverage OR 90% drawdown from starting $10K.
- **Replay hook:** Different random seeds produce different market paths; leaderboard for fastest to $1M.

## 6. MoneyBot Brand
- **Mascot role:** coach — appears in event notifications and win/loss states.
- **MoneyBot colors used:** #00E676 green, #07111F ink, #FBBF24 gold, #FB7185 red.
- **Signature MoneyBot moment:** Mascot pops up when a stop-loss saves the player from a major crash: "Smart risk. Your stop-loss just saved your runway."
- **Assets required:** Coin icons (SVG), mascot avatar, event icons.

## 7. Screens
- Start/onboarding
- Gameplay (market view + portfolio + trade panel)
- Pause
- Win
- Loss/game over
- Tax report (end-of-year summary)

## 8. Polish Targets
- [x] Score popovers on trade
- [x] Smooth modal transitions
- [x] Animated HUD changes
- [x] Progress meter for portfolio goal
- [x] Screen shake on liquidation
- [x] Event banner animations
- [ ] Sound (optional)

## 9. Technical Plan
- **Files:** `index.html`, `s.css`, `g.js`
- **State model:** Central `GameState` object with portfolio, positions, history, day counter.
- **Rendering approach:** DOM-based with CSS transitions; canvas for price sparklines.
- **Responsive strategy:** Mobile-first flex/grid, max-width game shell on desktop.
- **Test plan:** Browser load, mobile viewport, win/loss/restart, console check.

## 10. Done Criteria
- [ ] Loads in browser
- [ ] Works on mobile viewport
- [ ] Complete game loop
- [ ] Win/loss/restart states
- [ ] Money concept is mechanical, not just text
- [ ] MoneyBot brand is clear
- [ ] No placeholder slop
- [ ] No console errors
- [ ] Codex challenge run
- [ ] Known issues documented
