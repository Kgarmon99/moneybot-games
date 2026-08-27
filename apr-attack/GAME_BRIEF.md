## 1. Game Snapshot

- **Title:** APR Attack
- **One-line pitch:** A fast debt-priority puzzle where players attack the highest APR before interest drains flexibility.
- **Target player:** Teens and adults learning credit card and loan basics
- **Session length:** 2 minutes
- **Platform:** mobile first, desktop supported
- **Status:** beta

## 2. Money Concept

- **Primary concept:** debt avalanche and APR
- **What the player learns through play:** Extra payments usually save the most when aimed at the highest APR debt after minimums are covered.
- **What behavior the game rewards:** Reading APR and acting before expensive interest compounds.
- **What misconception the game corrects:** The largest balance is always the best debt to attack first.

## 3. Core Loop

> The player chooses which debt receives the extra payment, so they can save interest, while avoiding low-APR distractions.

## 4. Controls

- **Mobile controls:** Tap one of three debt cards.
- **Desktop controls:** Number keys 1-3.
- **Accessibility controls:** Buttons with readable labels and keyboard selection.

## 5. Systems

- **Scoring:** Correct APR picks add points and estimated interest saved.
- **Progression:** APRs and balances vary across eight months.
- **Difficulty curve:** More tempting balances and higher APR spread each round.
- **Win condition:** Finish eight months with flexibility remaining.
- **Loss condition:** Flexibility reaches zero.
- **Replay hook:** Local best score and changing debt draws.

## 6. MoneyBot Brand

- **Mascot role:** Coach
- **MoneyBot colors used:** Green, blue, gold, ink
- **Signature MoneyBot moment:** Coach confirms an avalanche move when highest APR is picked.
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
- **Rendering approach:** DOM cards and round state.
- **Responsive strategy:** Single-column cards on mobile, 3-card grid on desktop.
- **Test plan:** Load in browser, play rounds, verify correct/wrong choices, result state, restart, console.

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
