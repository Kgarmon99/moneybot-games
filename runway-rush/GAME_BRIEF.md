# Runway Rush — Game Brief

## 1. Game Snapshot

- **Title:** Runway Rush
- **One-line pitch:** Manage monthly cashflow decisions to keep your business alive and extend your runway.
- **Target player:** Aspiring entrepreneurs, side-hustlers, financial literacy learners
- **Session length:** 2-3 minutes
- **Platform:** mobile first, desktop supported
- **Status:** concept → prototype

## 2. Money Concept

- **Primary concept:** cashflow management and runway extension
- **What the player learns through play:** How recurring revenue, cost control, and emergency reserves interact to keep a business alive
- **What behavior the game rewards:** Prioritizing recurring revenue, building emergency funds, cutting costs before they compound
- **What misconception the game corrects:** "Revenue solves everything" — players learn that timing and cost structure matter more than top-line growth

## 3. Core Loop

> The player repeatedly allocates monthly income between growth, savings, and expenses, so they can extend runway months, while avoiding surprise costs and cashflow gaps.

## 4. Controls

- **Mobile controls:** Tap cards to allocate, swipe to dismiss decisions, tap buttons for actions
- **Desktop controls:** Click cards, number keys 1-4 for quick allocation, space to advance month
- **Accessibility controls:** Keyboard navigation, high contrast mode, screen reader labels

## 5. Systems

- **Scoring:** Runway months extended × cashflow streak multiplier
- **Progression:** 12-month campaign with increasing difficulty
- **Difficulty curve:** More surprise expenses, slower revenue growth, higher fixed costs
- **Win condition:** Reach 12 months with positive cashflow
- **Loss condition:** Runway hits 0 months (bankruptcy)
- **Replay hook:** Unlock harder scenarios, beat high score, discover optimal strategies

## 6. MoneyBot Brand

- **Mascot role:** Coach — appears with tips, celebrates milestones, warns of danger
- **MoneyBot colors used:** Full palette, green for positive, red for danger, gold for milestones
- **Signature MoneyBot moment:** Mascot celebrates when player builds 3+ month emergency fund
- **Assets required:** Mascot SVG, coin/bill/shield icons, runway meter graphic

## 7. Screens

- Start/onboarding — "You're the CFO of a startup. Keep the lights on."
- Gameplay — Monthly decision cards, HUD with runway/cashflow/streak
- Pause — Resume, restart, how to play
- Level clear/win — "12 months survived! Your runway: X months"
- Loss/game over — "Bankruptcy. What happened + one tip for next time"

## 8. Polish Targets

- [x] Score popovers on good decisions
- [x] Smooth modal transitions
- [x] Animated HUD changes
- [x] Progress meter for runway
- [x] Mascot reaction animations
- [x] Particle bursts on milestones
- [x] Screen shake on bankruptcy
- [x] Level-up animation between months

## 9. Technical Plan

- **Files:** index.html, game.js, styles.css, assets/ (SVG icons, mascot)
- **State model:** Monthly cycle → decision phase → resolution phase → event phase
- **Rendering approach:** Canvas for animations, DOM for UI/HUD
- **Responsive strategy:** CSS Grid + Flexbox, mobile-first breakpoints
- **Test plan:** Browser launch, mobile viewport, keyboard nav, restart flow

## 10. Done Criteria

- [ ] Loads in browser
- [ ] Works on mobile viewport
- [ ] Complete game loop (12 months)
- [ ] Win/loss/restart states
- [ ] Money concept is mechanical (cashflow decisions affect runway)
- [ ] MoneyBot brand is clear
- [ ] No placeholder slop
- [ ] No console errors
- [ ] Codex challenge run
- [ ] Known issues documented
