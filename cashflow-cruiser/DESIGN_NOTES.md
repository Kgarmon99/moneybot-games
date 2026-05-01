# Design Notes: Cashflow Cruiser

## Math & Physics Mechanics

**The Core Tension:**
Gravity is a constant downward force (representing "Living Expenses" or "Burn Rate"). 
Thrust is an upward force applied only when holding the screen (representing active effort/income generation).
The player must balance these forces to weave through obstacles.

**Variables:**
- `Gravity`: Constant downward acceleration (e.g., 0.5px/frame^2).
- `Thrust`: Upward acceleration when holding (e.g., -1.2px/frame^2).
- `Velocity`: Current vertical speed. Capped at a max up/down speed so it doesn't break collision detection.
- `Game Speed`: Horizontal scrolling speed. Starts at e.g. 5px/frame, slowly increases to 15px/frame over 2 minutes.

**Entities:**
1. **Cruiser (Player):** Bounding box for collision.
2. **Collectibles (Income):** Spawns in patterns. Adds to `Net Worth` and briefly spawns "+$100" floating text.
3. **Obstacles (Debt/Taxes):** Red pillars (like Flappy Bird pipes) or floating hazards (zappers). Hitting them immediately drops `Net Worth` to 0 and ends the game (Bankruptcy).

## UI Layout (Mobile First)
- **Canvas:** 100vw x 100vh. Everything renders inside.
- **HUD (Drawn on Canvas or Overlay):**
  - Top Center: Huge `Net Worth: $X,XXX`
  - Top Right: `High Score: $Y,YYY`
- **Game Over Screen (DOM Overlay):**
  - Appears over the canvas.
  - "Bankruptcy!"
  - Final Net Worth stat.
  - Huge "Play Again" button.

## Polish & "Juice" Details
1. **Exhaust Particles:** When thrusting, spawn orange/blue particles from the bottom of the cruiser. When falling, trail should disappear.
2. **Parallax Cityscape:** A slow-moving back layer of dark buildings, a mid-layer of lighter buildings moving slightly faster, and the fast-moving foreground floor.
3. **Hit Stop:** When hitting a debt trap, freeze the frame for 100ms, flash the screen red, and shake the canvas before showing the Game Over screen.
4. **Snappy Physics:** The transition from falling to flying up must feel immediate. Do not make it feel like steering a boat; it needs to be an arcade jetpack.

## Elite-Score Risks (What CodeBot needs to nail)
- **Physics Tuning:** The single most important part of a Flappy Bird / Jetpack Joyride clone is the gravity-to-thrust ratio. If it feels heavy or overly floaty, the game fails. It needs to be rigorously tested.
- **Collision Hitboxes:** Make the player's collision box *slightly smaller* than the visual sprite, and the obstacle hitboxes *slightly smaller* than their visuals. Players feel cheated if they clip an invisible pixel.
- **Performance:** Using `<canvas>` is mandatory for this to run at 60fps on mobile with parallax and particles. DOM manipulation for moving obstacles will stutter on phones.
- **Mobile Touch Handling:** Bind to `touchstart` and `touchend`, not just `click`, to ensure zero input latency on mobile browsers. Prevent default scrolling behaviors.