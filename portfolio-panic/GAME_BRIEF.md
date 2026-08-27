## 1. Game Snapshot

- **Title:** Portfolio Panic
- **One-line pitch:** A diversification puzzle where players allocate tokens across growth, stability, cash, and skills to survive market events.
- **Target player:** Beginner investors and classroom financial literacy groups
- **Session length:** 2 minutes
- **Platform:** mobile first, desktop supported
- **Status:** beta

## 2. Money Concept

- **Primary concept:** diversification and risk
- **What the player learns through play:** Concentration can increase risk, while thoughtful mixes balance growth and resilience.
- **What behavior the game rewards:** Building a portfolio that can both grow and survive shocks.
- **What misconception the game corrects:** The highest-return bucket is always best.

## 3. Core Loop

> The player allocates 10 tokens across portfolio buckets, so they can pass market events, while avoiding concentration and underpowered return.

## 4. Controls

- **Mobile controls:** Tap bucket cards, then tap Test portfolio.
- **Desktop controls:** Number keys 1-4 and Enter.
- **Accessibility controls:** Buttons with labels, keyboard support, reduced-motion support.

## 5. Systems

- **Scoring:** Balanced portfolios add points; concentrated or underpowered mixes subtract points.
- **Progression:** Five market events ask for different risk/return profiles.
- **Difficulty curve:** Events alternate between growth, inflation, and emergency pressure.
- **Win condition:** Survive all five events.
- **Loss condition:** Resilience reaches zero.
- **Replay hook:** Local best score and multiple viable portfolio mixes.

## 6. MoneyBot Brand

- **Mascot role:** Coach
- **MoneyBot colors used:** Green, blue, gold, ink
- **Signature MoneyBot moment:** Coach calls out concentration risk and balanced survival.
- **Assets required:** Shared MoneyBot brand kit and official avatar.

## 7. Screens

- Start/onboarding
- Gameplay
- Pause
- Win/loss result
- Restart

## 8. Polish Targets

- Score popovers
- Haptic feedback
- Animated HUD changes
- Progress meter
- Mascot reaction
- Smooth modal transitions

## 9. Technical Plan

- **Files:** `index.html`, shared `../shared-finlit-arcade/arcade.css`, shared `../shared-finlit-arcade/arcade-kit.js`
- **State model:** Static browser game state in shared engine.
- **Rendering approach:** DOM portfolio controls and allocation bars.
- **Responsive strategy:** Single-column bucket cards on mobile, grid on desktop.
- **Test plan:** Load in browser, allocate tokens, test portfolio, verify win/loss/restart and console.

## 10. Done Criteria

- [x] Loads in browser
- [x] Works on mobile viewport
- [x] Complete game loop
- [x] Win/loss/restart states
- [x] Money concept is mechanical, not just text
- [x] MoneyBot brand is clear
- [x] No placeholder slop
- [ ] No console errors
- [ ] Codex challenge run
- [ ] Known issues documented
