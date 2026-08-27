## 1. Game Snapshot

- **Title:** Runway Rush
- **One-line pitch:** A lane-dash cashflow game where revenue and savings keep your runway alive while bills try to drain it.
- **Target player:** Middle school through adult beginner financial literacy learners
- **Session length:** 45 seconds
- **Platform:** mobile first, desktop supported
- **Status:** beta

## 2. Money Concept

- **Primary concept:** cashflow and runway
- **What the player learns through play:** Recurring revenue and savings extend financial runway; surprise bills shrink it.
- **What behavior the game rewards:** Prioritizing income and emergency savings before expenses hit.
- **What misconception the game corrects:** Cash on hand alone is enough without ongoing inflow and reserves.

## 3. Core Loop

> The player moves between lanes to collect revenue and savings, so they can extend runway, while avoiding surprise bills.

## 4. Controls

- **Mobile controls:** Tap lane buttons 1-5.
- **Desktop controls:** Arrow keys or A/D.
- **Accessibility controls:** Keyboard lane movement, visible labels, reduced-motion support.

## 5. Systems

- **Scoring:** Revenue and savings add points; bills subtract points.
- **Progression:** Drop speed and spawn pressure rise through the run.
- **Difficulty curve:** Faster objects and tighter decision windows over 45 seconds.
- **Win condition:** Keep cash and runway above zero until time expires.
- **Loss condition:** Cash or runway reaches zero.
- **Replay hook:** Local best score and streak.

## 6. MoneyBot Brand

- **Mascot role:** Runner/avatar
- **MoneyBot colors used:** Green, blue, gold, ink
- **Signature MoneyBot moment:** Savings shields refill the runway meter.
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
- **Rendering approach:** DOM lane objects with requestAnimationFrame.
- **Responsive strategy:** 390px mobile-first shell with scalable lane controls.
- **Test plan:** Load in browser, click Play, use lane buttons, verify win/loss/restart and console.

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
