# Freelancer to Agency — Game Brief

## 1. Game Snapshot

- **Title:** Freelancer to Agency
- **One-line pitch:** Start solo, take gigs, hire contractors, scale to $1M agency.
- **Target player:** Aspiring entrepreneurs, side-hustlers, agency-curious.
- **Session length:** 3–5 minutes
- **Platform:** mobile first, desktop supported
- **Status:** good → elite target

## 2. Money Concept

- **Primary concept:** cashflow / leverage / opportunity cost
- **What the player learns through play:** Hiring leverage beats hourly billing; cashflow timing kills more agencies than lack of clients.
- **What behavior the game rewards:** Raising rates, hiring ahead of demand, maintaining buffer cash.
- **What misconception the game corrects:** "More clients = more profit" ignores overhead, quality decay, and net-30 cash lag.

## 3. Core Loop

> The player repeatedly accepts or rejects client projects, allocates billable hours, hires contractors when workload exceeds capacity, and manages cashflow week by week, so they can scale revenue and headcount, while avoiding cash hitting $0 from late invoices or overhead bloat.

## 4. Controls

- **Mobile:** tap buttons (Accept, Reject, Hire, Set Rate, Next Week)
- **Desktop:** mouse click same buttons
- **Accessibility:** large tap targets, high contrast, keyboard Tab + Enter

## 5. Systems

- **Scoring:** Annual revenue, total profit, weeks survived, employee count
- **Progression:** Solo → First Hire → Team → Agency (4 stages)
- **Difficulty curve:** Client demands grow faster than solo capacity; overhead auto-scales with team size
- **Win condition:** $1M annual revenue OR 10 full-time employees
- **Loss condition:** Cash hits $0
- **Replay hook:** Try different rate strategies, faster hiring, niche specialization

## 6. MoneyBot Brand

- **Mascot role:** coach — appears in tips and win/loss modals
- **MoneyBot colors used:** #00E676 green accent, #07111F ink, #FBBF24 gold
- **Signature MoneyBot moment:** Cashflow meter flashes red when runway < 4 weeks; green celebration burst on hitting $1M
- **Assets required:** CSS/SVG icons for clients, contractors, cash, satisfaction

## 7. Screens

- Start / onboarding
- Main gameplay (week view)
- Hire contractor modal
- Set rate modal
- Win modal
- Loss modal

## 8. Polish Targets

- [x] Score popovers on invoice paid
- [x] Smooth modal transitions
- [x] Animated HUD changes
- [x] Progress meter (revenue to $1M)
- [x] Screen shake on cashflow crisis
- [x] Level-up animation on stage advance

## 9. Technical Plan

- **Files:** `index.html`, `s.css`, `g.js`
- **State model:** plain JS object, JSON-serializable
- **Rendering approach:** DOM-based, screen classes toggle visibility
- **Responsive strategy:** mobile-first flex/grid, max-width 480px shell
- **Test plan:** play through solo → first hire → team → win/loss paths

## 10. Done Criteria

- [x] Loads in browser
- [x] Works on mobile viewport
- [x] Complete game loop
- [x] Win/loss/restart states
- [x] Money concept is mechanical, not just text
- [x] MoneyBot brand is clear
- [x] No placeholder slop
- [x] No console errors
- [ ] Codex challenge run
- [x] Known issues documented
