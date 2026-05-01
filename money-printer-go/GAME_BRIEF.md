# MoneyBot Game Brief: Money Printer GO

## 1. Game Snapshot

- **Title:** Money Printer GO
- **One-line pitch:** Print cash to buy assets, but watch out—printing too fast causes hyperinflation and destroys your purchasing power!
- **Target player:** 12-16 years old
- **Session length:** 2 minutes
- **Platform:** Mobile first, desktop supported
- **Status:** concept

## 2. Money Concept

- **Primary concept:** Inflation and Purchasing Power
- **What the player learns through play:** Creating money out of thin air decreases its value. Real wealth comes from acquiring assets, not just holding cash.
- **What behavior the game rewards:** Balancing the speed of printing cash with the timing of buying assets before prices skyrocket.
- **What misconception the game corrects:** "If the government just printed more money, we'd all be rich."

## 3. Core Loop

> The player repeatedly **taps to print fiat cash**, so they can **buy real assets**, while avoiding **hyperinflation that makes asset prices explode**.

## 4. Controls

- **Mobile controls:** Mash tap or press-and-hold the giant "PRINT" button. Tap asset buttons to buy.
- **Desktop controls:** Spacebar or click to print. Click to buy assets.
- **Accessibility controls:** High contrast UI, no complex multi-touch gestures required.

## 5. Systems

- **Scoring:** Measured in "Real Wealth" (number of assets owned).
- **Progression:** Assets generate passive income or reduce the inflation rate slightly.
- **Difficulty curve:** The more money printed, the faster the inflation multiplier grows. Prices update dynamically.
- **Win condition:** Reach 100 Real Wealth points within 2 minutes.
- **Loss condition:** Inflation hits 1,000% (Hyperinflation Crisis) - fiat becomes worthless.
- **Replay hook:** High score tracking on time-to-win, plus seeing the absurd numbers inflation can reach.

## 6. MoneyBot Brand

- **Mascot role:** Coach (warns you when inflation is creeping up, sweat drops when the printer is overheating).
- **MoneyBot colors used:** Brand green for real assets/wealth, alarming red/orange for the inflation meter.
- **Signature MoneyBot moment:** The "Hyperinflation Warning" where prices suddenly spin up like a slot machine.
- **Assets required:** Printer icon, cash particle, gold bar (asset 1), real estate (asset 2), MoneyBot mascot faces (neutral, panicked).

## 7. Screens

- **Start/onboarding:** "Welcome to the Central Bank! Buy 100 Real Assets to win. Don't let inflation hit 1000%!"
- **Gameplay:** 
  - Top: Real Wealth Score & Time
  - Middle: Assets to buy (with rapidly updating prices)
  - Bottom: The Money Printer button and the Inflation Thermometer
- **Loss/game over:** "Hyperinflation! A loaf of bread costs $1,000,000. Your cash is worthless."
- **Level clear/win:** "Economic Master! You secured real wealth before the bubble burst."

## 8. Polish Targets

- Particle bursts (cash flying out of the printer).
- Smooth modal transitions.
- Animated HUD changes (prices rolling up like odometers).
- Background motion (screen shake when inflation gets dangerously high).
- Haptic feedback (on mobile, vibrating faster as inflation rises).
- Mascot reaction (MoneyBot getting stressed).

## 9. Technical Plan

- **Files:** `index.html`, `game.js`, `style.css`
- **State model:** `cashBalance`, `realWealth`, `inflationRate`, `baseAssetPrice`
- **Rendering approach:** DOM-based UI for crisp text, CSS animations for juice.
- **Responsive strategy:** Flexbox column layout, printer at the bottom thumb zone.
- **Test plan:** Ensure inflation math doesn't hit NaN too quickly; balance price scaling.

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