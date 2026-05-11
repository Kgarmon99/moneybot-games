# Deal Master - Game Brief

## 1. Game Snapshot

- **Title:** Deal Master
- **One-line pitch:** Master negotiation tactics through realistic deal-making scenarios
- **Target player:** Aspiring entrepreneurs, business professionals, anyone interested in negotiation skills
- **Session length:** 2-5 minutes per scenario
- **Platform:** Mobile first, desktop supported
- **Status:** Elite

## 2. Money Concept

- **Primary concept:** Negotiation / Deal-making / Value creation
- **What the player learns through play:** 
  - Opening offers and anchoring
  - BATNA (Best Alternative to Negotiated Agreement)
  - Relationship preservation vs. deal extraction
  - When to walk away
  - Multi-round negotiation dynamics
- **What behavior the game rewards:** Strategic thinking, patience, tactical deployment, relationship balance
- **What misconception the game corrects:** That negotiation is about winning at all costs (relationship matters)

## 3. Core Loop

> The player repeatedly makes offers and deploys tactics, so they can close deals above their BATNA, while avoiding relationship collapse or deal failure.

## 4. Controls

- **Mobile controls:** Tap to select scenarios, tap tactics, number input with +/- buttons, tap action buttons
- **Desktop controls:** Mouse clicks, keyboard number entry
- **Accessibility controls:** Large tap targets (44px+), clear contrast, readable fonts

## 5. Systems

- **Scoring:** Deal value (savings vs market) + Relationship preservation + Tactics used + Speed bonus
- **Progression:** Unlock scenarios sequentially, unlock tactics by achieving score thresholds
- **Difficulty curve:** Easy (cooperative) → Medium (balanced) → Hard (tough opponents)
- **Win condition:** Close deal above BATNA with positive relationship
- **Loss condition:** 3 rounds without agreement, or relationship hits 0
- **Replay hook:** Higher scores unlock tactics, perfect scores on all difficulties

## 6. MoneyBot Brand

- **Mascot role:** None (deal-focused, professional tone)
- **MoneyBot colors used:** Neon green (#00C853) accents on white background
- **Signature MoneyBot moment:** Deal value calculator showing real-time savings
- **Assets required:** Emoji-based avatars (no external assets needed)

## 7. Screens

- Start/onboarding: Welcome + difficulty selector + scenario grid
- Gameplay: Negotiation interface with meters, dialogue, tactics, offer input
- Pause: Modal overlay (walk away confirmation)
- Level clear/win: Results screen with score breakdown and lessons
- Loss/game over: Results with learning points
- Tactics Library: Unlockable tactics reference

## 8. Polish Targets

- ✅ Smooth modal transitions
- ✅ Animated meter changes
- ✅ Score popovers (feedback toast)
- ✅ Button press states
- ✅ Screen transitions
- ✅ Real-time deal calculator
- ✅ Progress meter animations
- ✅ Tactic unlock celebrations

## 9. Technical Plan

- **Files:** Single index.html (self-contained)
- **State model:** Central gameState object with scenario/tactics/history
- **Rendering approach:** Vanilla JS DOM manipulation
- **Responsive strategy:** Mobile-first CSS, max-width container
- **Test plan:** All 5 scenarios, all difficulties, tactic unlocks, win/loss paths

## 10. Done Criteria

- [x] Loads in browser
- [x] Works on mobile viewport
- [x] Complete game loop
- [x] Win/loss/restart states
- [x] Money concept is mechanical, not just text
- [x] MoneyBot brand is clear
- [x] No placeholder slop
- [x] No console errors
- [ ] Codex challenge run (pending)
- [x] Known issues documented (none)
