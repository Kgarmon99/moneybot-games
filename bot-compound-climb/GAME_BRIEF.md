# MoneyBot Game Brief: Compound Climb

## 1. Game Snapshot

- **Title:** Compound Climb (MoneyBot's Doodle Jump)
- **One-line pitch:** Bounce from asset to asset, climbing the ladder of wealth! Use compound interest to rocket up, but watch out for crumbling investments and debt traps.
- **Target player:** 12-16 years old
- **Session length:** 1-3 minutes
- **Platform:** Mobile web (Canvas), desktop supported
- **Status:** concept

## 2. Money Concept

- **Primary concept:** Asset Building & Compounding
- **What the player learns through play:** Building wealth is a steady climb from one solid asset to another. "Springs" (compound interest/leverage) accelerate growth, while risky assets (crumbling platforms) can cause you to lose everything.
- **What behavior the game rewards:** Careful navigation, prioritizing stable platforms, and grabbing high-yield boosters.
- **What misconception the game corrects:** "Wealth is built overnight." (It's built one jump at a time, protecting your downside).

## 3. Core Loop

> The player repeatedly **steers the bouncing MoneyBot left and right**, so they can **land on asset platforms and climb higher**, while avoiding **missing platforms and falling into bankruptcy.**

## 4. Controls

- **Mobile controls:** Touch and drag left/right, or tilt (if device orientation is enabled, but touch is fallback).
- **Desktop controls:** Mouse movement left/right, or Arrow keys.
- **Accessibility controls:** Direct touch-to-position mapping.

## 5. Systems

- **Scoring:** Net Worth (measured by maximum height achieved).
- **Progression:** As you get higher, stable platforms become sparser. More moving and crumbling platforms appear.
- **Difficulty curve:** Gap between platforms increases slowly.
- **Win condition:** Endless high-score chaser.
- **Loss condition:** Missing a platform and falling off the bottom of the screen (Bankruptcy).
- **Replay hook:** "Just one more try" fast restart loop.

## 6. MoneyBot Brand

- **Mascot role:** The Player (MoneyBot avatar bouncing upward).
- **MoneyBot colors used:** MoneyBot Green for stable assets, Gold for compound boosters, Red for debt traps / crumbling assets.
- **Signature MoneyBot moment:** Hitting a "Compound Interest" spring and rocketing upward while cash particle effects explode.

## 7. Screens

- **Start:** "Compound Climb. Bounce on assets. Avoid the red debt traps. Build your Net Worth!"
- **Gameplay:** Fullscreen canvas. Top HUD: Net Worth ($).
- **Game Over:** "Bankruptcy! You fell off the wealth ladder. Final Net Worth: $X."

## 8. Polish Targets

- Canvas rendering for smooth 60fps jumping physics.
- Screen wrapping (going off the left edge brings you to the right edge).
- Particle trails when hitting a compound spring.
- Satisfying "boing" visual stretch/squash on the player sprite.

## 9. Technical Plan

- **Files:** `index.html`, `game.js`, `style.css`
- **Tech:** Vanilla JS HTML5 `<canvas>`.
- **State:** `player(x,y,dy)`, `platforms[]`, `cameraY`, `score`.

## 10. Done Criteria
- [ ] Loads in browser
- [ ] Mobile touch steering works
- [ ] Complete game loop
- [ ] MoneyBot brand colors used