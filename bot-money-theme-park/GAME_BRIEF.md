# MoneyBot Game Brief: MoneyBot Theme Park 3D

## 1. Game Snapshot

- **Title:** MoneyBot Theme Park 3D
- **One-line pitch:** Build and manage the world's first 3D financial theme park where every thrill ride and attraction runs on real money concepts—ride the looping Compound Coaster, balance the Diversification Ferris Wheel, dodge 24% APR ghosts in the Toxic Debt Haunted Mansion, and maintain ticket cashflow to reach 5-star status!
- **Target player:** Kids, teens, young adults, and simulation/tycoon game lovers.
- **Session length:** 3–7 minutes per session.
- **Platform:** Mobile-first (touch orbit, pinch zoom, tap attractions) + Desktop (mouse orbit, wheel zoom, click).
- **Status:** Elite

## 2. Money Concept

- **Primary concept:** Cashflow operations, capital reinvestment, diversification, emergency liquidity buffers, and avoiding toxic debt leverage.
- **What the player learns through play:**
  - **Operating Cashflow vs Capital Expenditure:** High ticket sales generate recurring daily revenue; balancing operating maintenance costs against big new ride investments is essential to park survival.
  - **Compound Growth (The Coaster):** Reinvesting park profits into speed and capacity upgrades creates exponential ticket sales curves.
  - **Diversification (The Ferris Wheel):** Offering different attraction types (thrill rides, family rides, refreshments) stabilizes park attendance through varying economic seasons.
  - **The Liquidity Buffer (Emergency Splash Mountain):** Sudden ride breakdowns or bad weather require immediate cash; without a liquidity reserve, the park is forced into toxic high-interest emergency loans.
  - **Toxic Debt Drag (The Haunted Mansion):** Borrowing at high APR haunts your daily cashflow with punitive interest payments.
- **What behavior the game rewards:** Reinvesting earnings into revenue-generating rides, keeping cash reserves for surprises, maintaining guest satisfaction, and paying off debt immediately.
- **What misconception the game corrects:** "Spending all money on shiny new things right away leads to success" (corrected by surprise breakdown costs causing insolvency).

## 3. Core Loop

> The player repeatedly collects park ticket and concession cashflow, reinvests capital into constructing and upgrading kinetic 3D financial rides, so they can boost guest attendance and achieve a 5-Star $1,000,000 Park Empire, while avoiding ride breakdown debt crises.

## 4. Controls

- **Mobile controls:**
  - One-finger drag: Orbit 3D park camera.
  - Two-finger pinch: Smooth zoom in/out.
  - Tap on ride/plot: Inspect stats, upgrade ride, adjust ticket price, or ride in first-person!
  - Bottom Drawer: Thumb-friendly attraction selection cards.
- **Desktop controls:**
  - Left click + drag: Orbit camera around park.
  - Right click + drag or WASD: Pan camera.
  - Mouse wheel: Zoom in/out.
  - Click on attraction: Open ride dashboard.
  - Spacebar: Toggle simulation speed.
- **Accessibility controls:**
  - High-contrast UI elements, clear text statistics, toggleable ride animations for reduced motion.

## 5. Systems

- **Scoring & Metrics:**
  - Park Treasury (Liquid Cash)
  - Park Net Worth (Cash + Ride Asset Values - Debt)
  - Daily & Monthly Cashflow (Ticket Sales + Concessions - Ride Maintenance)
  - Park Guests & Happiness (Guest count and satisfaction rating)
  - Park Stars (1 to 5 Stars based on net worth and guest happiness)
- **Rides & Attractions:**
  1. **The Compound Coaster:** Flagship thrill ride. Upgrading track loops exponentially multiplies ticket price and rider throughput.
  2. **The Diversification Ferris Wheel:** Multi-colored asset gondolas (Equities, Bonds, Real Estate, Cash). Provides stable year-round cashflow.
  3. **Bull & Bear Bumper Arena:** Kinetic bumper car arena where visitors bump through market cycles. High thrill multiplier.
  4. **Emergency Splash Mountain:** Log flume water ride with a giant splash pool. Functions as the park's liquid reserve storage.
  5. **Toxic Debt Haunted Mansion:** Spooky neon walk-through castle. Upgrading Debt Snowball cannons eliminates high APR debt threats.
  6. **Cashflow Concessions & Merch:** High-margin refreshment stands providing steady passive profits per guest.
- **Difficulty Curve:**
  - Year 1: Modest park with 1 starter ride; master basic positive cashflow.
  - Year 2–3: Weather events (Summer Influx vs Rainy Season) test liquidity reserves.
  - Year 4+: Managing large guest crowds and maximizing compound reinvestment to reach 5 Stars.
- **Win condition:** Achieve 5-Star Park Rating, 1,000 Happy Guests, and $1,000,000 Park Net Worth!
- **Loss condition:** Bankruptcy (Park cash dips below -$25,000 with debt compounding faster than ticket revenue).
- **Replay hook:** Leaderboards, high scores, custom park layouts, and replayable financial challenges.

## 6. MoneyBot Brand

- **Mascot role:** Park Host & Guide (MoneyBot greets guests at the entrance turnstiles, congratulates milestone upgrades, and issues liquidity warnings).
- **MoneyBot colors used:**
  - Primary Green: `#00E676` (Carnival neon lights, positive revenue, ticket gains)
  - Cyber Dark: `#070a12` (Theme park night festival sky)
  - Neon Cyan: `#00F0FF` (Rollercoaster energy tracks and splash waters)
  - Gold / Amber: `#FFD700` (Concessions, stars, golden tickets)
  - Alert Red: `#FF3D71` (Toxic debt and ride maintenance warnings)
- **Signature MoneyBot moment:** A fireworks celebration over the 3D Ferris Wheel and Compound Coaster when the 5th star is unlocked!
- **Assets required:** MoneyBot brand kit (`moneybot-game.css`, `moneybot-game-kit.js`), custom 3D geometries for rides, procedural Web Audio SFX.

## 7. Screens

- **Title / Entrance Gate Screen:** 3D theme park spinning in background with ferris wheel turning, MoneyBot mascot greeting players, "Open Theme Park" button.
- **Active Park HUD:** Top dashboard with Treasury, Daily Cashflow, Guest Count, Park Star Rating, 3D viewport with animated rides and walking guests, bottom ride catalog drawer.
- **Ride Inspector Modal:** Displays ride excitement rating, daily maintenance cost, ticket price, upgrade cost, and financial literacy lesson.
- **First-Person / Ride Cam Mode:** Dynamic camera locked onto the Compound Coaster car or Ferris Wheel gondola!
- **5-Star Grand Opening Win Screen:** Celebratory fireworks, MoneyBot celebration dance, final profit report.
- **Bankruptcy Foreclosure Loss Screen:** Park lights turn off, debt autopsy report, "Try Again" button.

## 8. Polish Targets

- Animated 3D kinetic rides: looping coaster train moving along a 3D spline track, rotating ferris wheel with dangling gondolas, spinning bumper cars, splashing log flume particles.
- Animated low-poly visitor crowd simulation: little MoneyBot park guests walking along cobblestone paths between rides.
- Interactive raycasting: hover highlights rides with neon selection halos; clicking opens ride details.
- Procedural Web Audio API soundscape: carnival synth tunes, coaster clatter and swoosh, cash register chimes, cheering crowds.
- Responsive mobile touch layout with thumb-accessible controls.

## 9. Technical Plan

- **Files:**
  - `index.html`: Shell, HUD, modals, canvas container.
  - `style.css`: Theme park carnival aesthetic, glowing panels, responsive UI.
  - `game.js`: Three.js scene, procedural ride construction, animation loops (wheel rotation, coaster motion, guest pathfinding), financial simulation engine, audio synthesizer.
  - `vendor/three.module.js`: Bundled Three.js ES module.
  - `assets/moneybot/`: Official brand stylesheets and SVGs.
- **State model:** `ParkState` (cash, netWorth, dailyIncome, dailyExpenses, guests, happiness, stars, rides, day, month, year, debt).
- **Rendering:** Three.js WebGLRenderer with shadows, glowing neon materials, particle systems for fireworks and water splashes.

## 10. Done Criteria

- [x] Loads in browser via local HTTP server
- [x] Smooth 60 FPS performance with interactive 3D rides
- [x] Full state machine (Title -> Tutorial -> Active Park -> Win/Loss -> Restart)
- [x] Educational financial simulation tied to park mechanics
- [x] MoneyBot brand consistency with zero placeholder text
- [x] Passes MoneyBot QA audit with 90+ score
