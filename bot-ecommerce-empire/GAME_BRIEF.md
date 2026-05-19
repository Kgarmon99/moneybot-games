# E-commerce Empire — Game Brief

## 1. Game Snapshot

- **Title:** E-commerce Empire
- **One-line pitch:** Run an online store from first sale to empire.
- **Target player:** Anyone curious about business cashflow and pricing strategy
- **Session length:** 3–5 minutes
- **Platform:** mobile first, desktop supported
- **Status:** elite target

## 2. Money Concept

- **Primary concept:** cashflow management, pricing psychology, inventory risk
- **What the player learns through play:** You pay suppliers before customers pay you. Price too high = low conversion. Price too low = no margin. Overstock = carrying costs. Stockout = lost sales forever.
- **What the player is rewarded for:** Balanced inventory, smart pricing, profitable ad spend
- **What misconception the game corrects:** Revenue ≠ profit. More sales can bankrupt you if margins and inventory are wrong.

## 3. Core Loop

> The player repeatedly sources products, sets prices, runs ads, and ships orders each day, so they can grow profit and cash, while avoiding stockouts and cashflow death.

## 4. Controls

- **Mobile:** Tap cards to choose daily actions. Tap sliders/buttons to set price and ad budget.
- **Desktop:** Same — tap/click.
- **Accessibility:** Large tap targets, high contrast, clear labels.

## 5. Systems

- **Scoring:** Profit dollars + units sold
- **Progression:** Days advance, reputation grows, better suppliers unlock
- **Difficulty curve:** Seasonal demand spikes, rising ad costs, supplier minimums increase
- **Win condition:** $500K profit OR 50K units sold
- **Loss condition:** Cash hits $0
- **Replay hook:** Try different pricing/ad strategies. Beat your best day count.

## 6. MoneyBot Brand

- **Mascot role:** coach — appears on start and win/loss with tips
- **MoneyBot colors:** full dark theme, #00E676 green accent
- **Signature MoneyBot moment:** mascot celebrates a cashflow-positive streak; warns when runway (cash) gets low
- **Assets:** CSS/SVG icons, no external dependencies

## 7. Screens

- Start/onboarding
- Gameplay (day loop: source → price → ads → ship → results)
- Pause (not needed — turn-based)
- Win
- Loss

## 8. Polish Targets

- Score/cash popovers on daily results
- Smooth screen transitions
- Animated HUD value changes
- Event banner slide-in
- Progress meter to win target
- Card hover/active states
- Streak flame for profitable days

## 9. Technical Plan

- **Files:** index.html, s.css, g.js
- **State model:** single state object with day, cash, inventory, reputation, daily log
- **Rendering:** DOM-based, screen switching with .active class
- **Responsive:** max-width 480px shell, mobile-first
- **Test plan:** play through to win and loss, check mobile viewport

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
