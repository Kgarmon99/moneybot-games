# MoneyBot Game Brief: Compound Coaster 3D

## 1. Game Snapshot

- **Title:** Compound Coaster 3D
- **One-line pitch:** Pilot a high-speed MoneyBot coaster train down the glowing 3D exponential curve of compound interest—grab dividend boosts, compound interest gems, and market accelerators while dodging toxic 24% APR debt tracks and panic sell drops!
- **Target player:** High schoolers, college students, young investors, and arcade fans who want to visually feel the exponential power of compound growth over time.
- **Session length:** 2–4 minutes per run.
- **Platform:** Mobile-first (touch swipe left/right/up, tilt/touch buttons) + Desktop (Arrow keys / WASD / Spacebar).
- **Status:** Elite

## 2. Money Concept

- **Primary concept:** Compound Interest, Time Horizon, Annual Percentage Yield (APY), Dividend Reinvestment (DRIP), and Debt Drag.
- **What the player learns through play:**
  - **The Hockey-Stick Curve:** Compounding starts slow and flat during early years (Principal Phase), but suddenly shoots skyward into the stratosphere after year 10–15.
  - **DRIP Accelerators:** Reinvesting dividends adds extra booster rockets to your coaster, speeding up wealth accumulation exponentially.
  - **The Hazard of High APR Debt:** Toxic debt acts as a downward force, pulling the coaster into steep financial drops and slowing forward velocity.
  - **Time in the Market vs Timing the Market:** Staying on the coaster long-term builds massive wealth; jumping off during market dips destroys compound momentum.
- **What behavior the game rewards:** Long-term holding, collecting dividend gems, reinvesting yields, maintaining an emergency shield buffer.
- **What misconception the game corrects:** "Compound interest is linear" or "Investing early doesn't matter much when you have a small starting principal."

## 3. Core Loop

> The player continuously steers the MoneyBot coaster across 3 neon track lanes along the exponential compound curve, so they can maximize Net Worth and reach $1,000,000 Financial Independence, while avoiding high-interest debt obstacles, inflation slowdowns, and market drop gaps.

## 4. Controls

- **Mobile controls:**
  - Swipe Left / Right: Switch track lanes.
  - Swipe Up / Tap Boost: Fire DRIP Turbo Rocket.
  - On-screen touch controls: Thumb buttons for Left, Right, Boost, and Shield.
- **Desktop controls:**
  - Left / Right Arrows or A / D: Lane switching.
  - Up Arrow / W / Spacebar: DRIP Turbo Boost.
  - Down Arrow / S: Activate Liquidity Brake / Shield.
- **Accessibility controls:**
  - Adjustable track speed, reduced visual motion toggle, high-contrast neon lane markers, and screen reader status alerts.

## 5. Systems

- **Scoring:** Net Worth = Starting Principal + Accumulated Compounded Interest + Dividend Gems Collected - Debt Penalties.
- **Progression:**
  - **Phase 1 (Years 1–5 - Seed Stage):** Track is relatively flat; focus on collecting Initial Principal coins and setting up DRIP.
  - **Phase 2 (Years 6–15 - Momentum Stage):** Track gains positive elevation; interest begins earning interest; track speed accelerates.
  - **Phase 3 (Years 16–25 - Exponential Phase):** Track spirals upwards through glowing neon rings into the clouds; massive dividend windfalls.
  - **Phase 4 (Years 26+ - Financial Freedom):** $1,000,000 Net Worth milestone reached! Coaster enters the Infinity Galaxy Loop.
- **Difficulty Curve:** Track obstacles (Debt Hazards, Inflation Fog, Volatility Spikes) spawn faster as track velocity increases.
- **Win condition:** Reach Year 30 with $1,000,000+ Net Worth.
- **Loss condition:** Net Worth hits $0 due to toxic debt drag or crashing into unshielded debt drops.
- **Replay hook:** High scores, compound efficiency rating (A+ to F), local leaderboard, and daily streak bonuses.

## 6. MoneyBot Brand

- **Mascot role:** Pilot & Co-Captain (MoneyBot sits in the front seat of the coaster, celebrating loops and warning of debt drops!).
- **MoneyBot colors used:**
  - Primary Green: `#00E676` (Compound track rails, dividend gems, wealth boost)
  - Cyber Dark: `#070a12` (Neon night space)
  - Neon Cyan: `#00F0FF` (Coaster energy trail & turbo thrusters)
  - Gold / Amber: `#FFD700` (Compound multiplier rings)
  - Debt Red: `#FF3D71` (Toxic 24% APR obstacles)
- **Signature MoneyBot moment:** Flying through the 3D Exponential Loop with MoneyBot cheering and glowing golden coin particles exploding in 3D!
- **Assets required:** MoneyBot brand kit (`moneybot-game.css`, `moneybot-game-kit.js`), custom 3D track mesh shaders, audio synthesizer SFX.

## 7. Screens

- **Title / Onboarding Screen:** 3D coaster train parked on glowing track, MoneyBot helmet-clad, "Start Coaster Run" and "Compounding Rules".
- **Gameplay HUD:** Live Net Worth counter, Year/Time counter, Compound Multiplier (1.0x to 10.0x), Current Velocity, Lane Indicator, Emergency Shield status.
- **Pause Screen:** Pause menu with financial stat breakdown, audio toggles, and resume button.
- **Financial Freedom Win Screen:** 3D Victory loop, fireworks, final Net Worth breakdown, "Reinvest & Play Again" button.
- **Crash / Debt Overload Loss Screen:** Coaster derailed by debt; autopsy breakdown showing impact of interest drag, "Restart Run" button.

## 8. Polish Targets

- Procedural 3D tube coaster track generated dynamically based on $A = P(1 + r)^t$ mathematical formula.
- Dynamic camera following the coaster with speed lines, FOV pulse on turbo boost, and realistic camera roll into turns.
- Custom particle explosions (coins, sparkles, glowing rings) on collecting gems.
- Web Audio API synthesized sounds (coaster track rumble, coin chime, turbo swoosh, warning siren, victory fanfare).
- Smooth responsive touch overlay for mobile devices with haptic feedback.

## 9. Technical Plan

- **Files:**
  - `index.html`: Shell, HUD overlay, 3D container, modal overlays.
  - `style.css`: Cyberpunk arcade styling, responsive touch controls, neon animations.
  - `game.js`: Three.js 3D scene, procedural track geometry, coaster physics engine, obstacle spawner, financial compound math engine, Web Audio SFX.
  - `vendor/three.module.js`: Standalone Three.js ES module.
  - `assets/moneybot/`: MoneyBot brand kit and graphics.
- **State model:** `CoasterState` (distance, velocity, lane, netWorth, principal, apr, year, month, shield, multiplier, gameOver).
- **Rendering:** Three.js perspective camera, dynamic lighting, mesh instancing for track ties/gems/obstacles, particle systems.

## 10. Done Criteria

- [x] Runs at smooth 60 FPS in browser with touch and keyboard controls
- [x] Mathematically accurate compound interest curve visualization
- [x] Full game loop (Title -> Tutorial -> Action Gameplay -> Win/Loss -> Restart)
- [x] High-contrast MoneyBot brand identity with zero placeholder text
- [x] Passes MoneyBot QA review gate with 90+ score
