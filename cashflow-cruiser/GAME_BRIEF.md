# MoneyBot Game Brief: Cashflow Cruiser

## 1. Game Snapshot

- **Title:** Cashflow Cruiser
- **One-line pitch:** Fly your cruiser through the economy, dodging debt traps and tax bills while collecting positive cashflow to build your Net Worth!
- **Target player:** 12-16 years old
- **Session length:** 1-2 minutes (endless runner)
- **Platform:** Mobile first, desktop supported
- **Status:** concept

## 2. Money Concept

- **Primary concept:** Cashflow, Net Worth, and Expenses/Debt
- **What the player learns through play:** Building net worth requires navigating expenses (gravity) and avoiding bad debt (obstacles) while consistently securing income (collectibles).
- **What behavior the game rewards:** Timing, consistency, and prioritizing positive cashflow over risky maneuvers.
- **What misconception the game corrects:** "Wealth is just having money." (Net worth is the continuous accumulation of positive cashflow against the constant drag of living expenses).

## 3. Core Loop

> The player repeatedly **holds the screen to boost their cruiser**, so they can **collect income and build Net Worth**, while avoiding **debt traps and taxes that drain their wealth or crash them**.

## 4. Controls

- **Mobile controls:** Touch and hold anywhere to thrust up. Release to let gravity pull you down.
- **Desktop controls:** Spacebar or left-click (hold to thrust, release to fall).
- **Accessibility controls:** High contrast mode, simple one-button input logic.

## 5. Systems

- **Scoring:** Net Worth (measured in dollars, constantly ticking up slightly, boosted by collectibles).
- **Progression:** The game speeds up over time, and obstacle density increases.
- **Difficulty curve:** Linear speed increase until a max cap; obstacle patterns become tighter.
- **Win condition:** Endless. The goal is to beat your high score (Max Net Worth).
- **Loss condition:** Crash into the ground ("Bankruptcy") or hit a lethal Debt Trap.
- **Replay hook:** Fast restart, visible high score to beat.

## 6. MoneyBot Brand

- **Mascot role:** The Avatar (MoneyBot riding a green jetpack or hover-cruiser).
- **MoneyBot colors used:** Brand green for income/cruiser trail, alarming red for debt obstacles, dark slate for background.
- **Signature MoneyBot moment:** A "Cashflow Surge" where passing through a green gate grants a temporary magnet effect.
- **Assets required:** Cruiser sprite, Cash collectible ($), Debt obstacle (red spike/wall), Parallax skyline background.

## 7. Screens

- **Start/onboarding:** "Hold to fly. Dodge Debt. Collect Cashflow. Don't go Bankrupt!"
- **Gameplay:** 
  - Top HUD: Current Net Worth (Big, green) & High Score.
  - Full screen canvas for action.
- **Loss/game over:** "Bankrupt! You hit a debt trap. Final Net Worth: $X. Try again?"

## 8. Polish Targets

- Particle bursts (exhaust from the cruiser, sparkles when collecting cash).
- Parallax background scrolling to give a sense of speed.
- Floating text ("+$500") popping off the cruiser when collecting cash.
- Screen shake and red flash on collision.
- Smooth modal transitions for Game Over and Restart.
- Gravity and thrust physics feel snappy, not floaty.

## 9. Technical Plan

- **Files:** `index.html`, `game.js`, `style.css`
- **State model:** `cruiser.y`, `cruiser.velocity`, `netWorth`, `speed`, `obstacles[]`, `collectibles[]`
- **Rendering approach:** HTML5 `<canvas>` for 60fps rendering of moving objects.
- **Responsive strategy:** Canvas scales to fit window inner bounds (mobile full screen).
- **Test plan:** Tune gravity vs. thrust ratios so the cruiser doesn't rocket out of frame instantly or fall too fast.

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