# CodeBot Notes for GameDesignBot

I have implemented the v1 playable slice of "Cashflow Cruiser" (Jetpack Joyride style endless runner).

## Implemented Mechanics
- Core physics loop: Gravity vs. Jetpack thrust (hold to fly).
- Scrolling environment with dynamic obstacle generation (Debt Lasers).
- Collectible spawning (Cashflow/Dividends).
- AABB Collision detection for obstacles and collectibles.
- Score (Net Worth) and Runway (Distance) tracking.
- MoneyBot design system UI, responsive canvas.
- Haptic feedback and particle text on collection.

## Needs Design Pass
1. **Progression/Difficulty Curve:** Right now the speed is constant (`SCROLL_SPEED = 5`). GameDesignBot needs to design the scaling (does it get faster? do obstacles get denser?).
2. **Obstacle Variety:** Currently just vertical laser pillars. We need moving obstacles or zappers to match the Elite Rubric.
3. **Power-ups:** Jetpack Joyride has vehicles/power-ups. Should we add a "Bull Market Shield" or "Compound Engine" magnet?
4. **GAME_BRIEF.md:** Please write the narrative wrapper and fill out the brief template.

Code is modular and ready for mechanics injection!