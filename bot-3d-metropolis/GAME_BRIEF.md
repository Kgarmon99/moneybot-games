# MoneyBot Game Brief: MoneyBot Metropolis 3D

## 1. Game Snapshot

- **Title:** MoneyBot Metropolis 3D
- **One-line pitch:** Build a glowing 3D metropolis powered by real personal finance principles—balance emergency liquidity, compound index assets, and cashflow real estate to achieve total Financial Independence before debt storms collapse your grid.
- **Target player:** Teens, young adults, aspiring founders, and arcade gamers learning wealth building.
- **Session length:** 3–8 minutes per run.
- **Platform:** Mobile-first (touch orbit, pinch zoom, 48px tap targets) + desktop (mouse orbit, wheel zoom, keyboard shortcuts).
- **Status:** Elite

## 2. Money Concept

- **Primary concept:** Cashflow allocation, compounding returns, emergency liquidity, and toxic debt avoidance.
- **What the player learns through play:**
  - **The Cashflow Gap:** Wealth is built by maximizing the spread between active income and living expenses.
  - **The Liquidity Shield:** An Emergency Vault keeps unforeseen shocks (medical, vehicle, economic crises) from forcing high-interest borrowing.
  - **The Power of Compounding:** Index Fund towers start slow but outgrow active salary exponentially over simulation quarters.
  - **Debt as Negative Compounding:** High-interest consumer debt (24% APR) accumulates rapidly and will bankrupt a city if not tackled immediately with debt avalanches.
  - **Financial Independence (FIRE):** The ultimate win is when passive cashflow from investments exceeds 100% of living expenses.
- **What behavior the game rewards:** Diversification across liquid reserves, equity index growth, and cashflow-yielding assets; reinvesting dividends; keeping overhead low.
- **What misconception the game corrects:** "I should invest every single dollar into volatile stocks immediately" (corrected by surprise emergency events forcing asset liquidation if liquidity is zero).

## 3. Core Loop

> The player repeatedly allocates monthly income into building and upgrading specialized financial districts, so they can grow passive cashflow and net worth toward 100% Financial Independence, while avoiding surprise emergency debt storms and liquidity crises.

## 4. Controls

- **Mobile controls:**
  - One-finger drag: Orbit 3D camera around metropolis.
  - Two-finger pinch: Smooth zoom in / out.
  - Tap: Select plot to inspect, build, or upgrade.
  - Bottom Build Drawer: Thumb-friendly selection of financial structures.
- **Desktop controls:**
  - Left click + drag: Orbit camera.
  - Right click + drag / WASD / Arrow keys: Pan camera across the grid.
  - Mouse wheel: Zoom in / out.
  - Click: Select / interact with plots.
  - Spacebar: Toggle play / fast-forward simulation.
- **Accessibility controls:**
  - Reduced-motion toggle (disables camera sway & particle bursts).
  - High-contrast HUD indicators and keyboard navigation.
  - Text-based status readouts alongside 3D visual cues.

## 5. Systems

- **Scoring:** Net Worth = Liquid Cash + Emergency Vault Balance + Market Value of Index & Real Estate assets - Outstanding Debt.
- **Progression:**
  - **Stage 1 (Financial Survival):** Build first Emergency Vault, stabilize cashflow above $500/mo.
  - **Stage 2 (Capital Accumulation):** Construct Index Fund Towers and Clean Energy Grids to reduce overhead.
  - **Stage 3 (Scale & Diversification):** Expand into Real Estate Plazas and Tech Incubators.
  - **Stage 4 (Financial Freedom):** Reach 100% FIRE Ratio (Passive Income >= Expenses) and $1,000,000 Net Worth.
- **Difficulty curve:** Macroeconomic events cycle every 3 months (Bull markets, Bear corrections, Inflation surges, Surprise emergencies).
- **Win condition:** Achieve 100% Financial Independence with $1,000,000+ Net Worth and zero toxic debt.
- **Loss condition:** Bankruptcy (Cash below -$25,000 with debt interest compounding beyond active income).
- **Replay hook:** High scores tracked in local storage, distinct economic event seeds, rating tiers (Bronze Saver to Diamond Sovereign).

## 6. MoneyBot Brand

- **Mascot role:** Coach & Advisor (MoneyBot delivers market briefings, celebrates milestones, and flags debt emergencies).
- **MoneyBot colors used:**
  - Primary Green: `#00E676` (growth, dividends, healthy cashflow)
  - Cyber Dark: `#0A0E17` and `#111927`
  - Neon Cyan: `#00F0FF` (tech & innovation)
  - Gold / Amber: `#FFD700` (wealth & vaults)
  - Debt Alert Red: `#FF3D71` (high APR toxic debt)
- **Signature MoneyBot moment:** Celebrating with holographic fireworks and MoneyBot mascot dance when Financial Independence is achieved!
- **Assets required:** MoneyBot brand kit (`moneybot-game.css`, `moneybot-game-kit.js`), custom 3D low-poly geometries, SVG financial icons, Web Audio synthesized SFX.

## 7. Screens

- **Title / Briefing Screen:** 3D metropolis rotating in background, MoneyBot introducing the mission, "Start Building" and "Financial Rules".
- **Active Gameplay HUD:** Real-time financial dashboard (Net Worth, Cash, Monthly Runway, FIRE Meter), 3D interactive grid, build drawer, event notification ticker.
- **Plot Inspect / Upgrade Modal:** Shows ROI, monthly yield, upgrade cost, and financial education takeaway.
- **Macroeconomic Event Banner:** Interactive decisions (e.g. "Market Dip: Buy More or Hold?").
- **Financial Freedom Win Screen:** Confetti particles, celebratory MoneyBot, final financial report, replay button.
- **Insolvency Game Over Screen:** Detailed financial autopsy (where expenses exceeded income, impact of debt), retry button.

## 8. Polish Targets

- 3D procedural neon buildings with glowing windows and kinetic animations (spinning turbines, pulsing beacon antennas).
- Interactive 3D hover and selection halos using Three.js raycasting.
- Particle fountains of glowing dollar signs and floating coin bursts upon dividend payouts.
- Screen shake and red warning glow during debt emergencies.
- Procedural Web Audio API sound effects (coins, building construction, alarms, fanfares) and chill synth audio.
- Smooth mobile-first UI animations and responsive layout for iPhone / Android viewports.

## 9. Technical Plan

- **Files:**
  - `index.html`: Shell, HUD, modals, canvas container.
  - `style.css`: Sleek cyberpunk UI overlay, responsive build drawer, animations.
  - `game.js`: Three.js isometric camera, scene setup, lighting, procedural building generation, raycasting, financial simulation engine, audio synthesizer.
  - `vendor/three.module.js`: Bundled standalone Three.js ES module.
  - `assets/moneybot/`: Official brand stylesheets, kits, and SVGs.
- **State model:** `FinancialState` (cash, salary, expenses, debt, buildings, month, marketMultiplier, fireRatio) driving 60 FPS Three.js rendering.
- **Rendering approach:** Three.js WebGLRenderer with antialiasing, shadow mapping, ambient + directional lighting, custom mesh shaders and glow materials.
- **Responsive strategy:** Dynamic canvas resize, CSS grid/flexbox HUD with safe area insets.

## 10. Done Criteria

- [x] Loads cleanly in browser via local HTTP server
- [x] Runs at 60 FPS with smooth touch/mouse controls
- [x] Complete state machine (Title -> Tutorial -> Play -> Events -> Win/Loss -> Restart)
- [x] Mechanical financial simulation with realistic compounding and cashflow
- [x] Clean MoneyBot branding with zero placeholder slop
- [x] Passes MoneyBot QA audit with 90+ score
