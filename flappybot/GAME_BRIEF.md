# 1. Game Snapshot

- **Title:** Capital Command
- **One-line pitch:** Build a resilient money system by routing income through bills, emergency cash, debt, investing, learning, and risk shields before volatility breaks your runway.
- **Target player:** Adults and founders who need to feel money tradeoffs quickly.
- **Session length:** 2 minutes
- **Platform:** mobile first, desktop supported
- **Status:** good, pending Codex elite gate

# 2. Money Concept

- **Primary concept:** cashflow and opportunity cost
- **What the player learns through play:** Income is powerful only when routed through a system; bills protect survival, emergency cash absorbs shocks, debt payoff reduces drag, investing compounds after stability, learning increases future income, and diversification lowers drawdowns.
- **What behavior the game rewards:** Cover fixed obligations first, keep a cash shield, reduce expensive debt, invest consistently once stable, and buy upgrades that improve future rounds.
- **What misconception the game corrects:** The highest-upside move is not always the best move; a fragile money system loses more to shocks than it gains from chasing upside.

# 3. Core Loop

> The player repeatedly catches income and allocates it to financial systems, so they can extend runway and grow net worth, while avoiding expense pressure, debt drag, and volatility shocks.

# 4. Controls

- **Mobile controls:** Drag on the playfield to steer the MoneyBot cursor; tap system nodes to allocate held income.
- **Desktop controls:** Arrow keys or WASD to steer; number keys 1-6 allocate to systems; space pauses.
- **Accessibility controls:** Large tap targets, keyboard control, visible labels, non-shaming loss copy, high contrast.

# 5. Systems

- **Scoring:** Final score blends resilience, net worth, runway, streak, and debt reduction.
- **Progression:** Six waves introduce expense pressure, emergency shocks, debt interest, market volatility, learning leverage, and final stress testing.
- **Difficulty curve:** Waves get faster, risks appear more often, and smarter allocation becomes mandatory.
- **Win condition:** Survive six waves with positive runway.
- **Loss condition:** Cash and emergency reserves fall below zero or runway reaches zero.
- **Replay hook:** Best score, rank, streak, and different allocation paths.

# 6. MoneyBot Brand

- **Mascot role:** Avatar and coach
- **MoneyBot colors used:** Green, dark ink, blue, gold, red, muted slate.
- **Signature MoneyBot moment:** Emergency shield visibly absorbs a shock and the coach announces “Shield saved the month.”
- **Assets required:** Lightweight SVG icons documented in `assets/README.md`; game objects drawn in canvas.

# 7. Screens

- Start/onboarding
- Gameplay
- Pause
- Level clear/win
- Loss/game over
- Upgrade/reward feedback between waves

# 8. Polish Targets

- Particle bursts
- Score popovers
- Haptic feedback
- Smooth modal transitions
- Animated HUD changes
- Background motion
- Mascot reaction
- Progress meter

# 9. Technical Plan

- **Files:** `index.html`, `style.css`, `game.js`, `assets/README.md`
- **State model:** Single deterministic state object with wave configuration, player, falling items, systems, HUD metrics, particles, and modal status.
- **Rendering approach:** Canvas for playfield and SVG/CSS for UI shell.
- **Responsive strategy:** Fixed logical canvas scaled to available mobile-first shell; pointer coordinates transformed into canvas space.
- **Test plan:** Static browser load, local server smoke test, mobile viewport screenshot, console check, MoneyBot QA gate, Codex game review.

# 10. Done Criteria

- [x] Loads in browser
- [x] Works on mobile viewport
- [x] Complete game loop
- [x] Win/loss/restart states
- [x] Money concept is mechanical, not just text
- [x] MoneyBot brand is clear
- [x] Final game copy and art primitives are in place
- [x] No console errors
- [ ] Codex challenge run
- [ ] Known issues documented
