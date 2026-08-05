# Fraud or Nah — Game Brief

## 1. Game Snapshot

- **Title:** Fraud or Nah
- **One-line pitch:** Swipe through real-ish money messages and spot the scams before your trust score hits zero.
- **Target player:** Teens and adults who want to level up their financial scam radar.
- **Session length:** 2 minutes
- **Platform:** mobile first, desktop supported
- **Status:** concept → prototype

## 2. Money Concept

- **Primary concept:** fraud detection / consumer protection / financial literacy
- **What the player learns through play:** How scammers use urgency, authority, secrecy, and fake rewards to extract money or data.
- **What behavior the game rewards:** Reading carefully, spotting red flags, pausing before acting.
- **What misconception the game corrects:** "I would never fall for that." Most scams succeed because they mimic trusted contexts and trigger emotions.

## 3. Core Loop

> The player repeatedly reads a message and decides Fraud or Nah, so they can protect their trust score and cash, while avoiding false calls and missed scams.

## 4. Controls

- **Mobile controls:** swipe left/right, tap buttons
- **Desktop controls:** arrow keys, A/D, or on-screen buttons
- **Accessibility controls:** keyboard, screen-reader labels, focus-visible buttons

## 5. Systems

- **Scoring:** points for correct calls; combo streaks for consecutive correct answers
- **Progression:** rounds get harder; red flags become subtler
- **Difficulty curve:** early levels obvious scams, later levels mix near-legit offers with hidden traps
- **Win condition:** survive all rounds with trust score above zero
- **Loss condition:** trust score hits zero
- **Replay hook:** randomized deck, high score, streak counter, "scam radar" rating

## 6. MoneyBot Brand

- **Mascot role:** coach / sidekick who reacts to each call
- **MoneyBot colors used:** MoneyBot green, ink, panel, gold, red, blue
- **Signature MoneyBot moment:** mascot facepalms on a missed scam and celebrates on a long streak
- **Assets required:** mascot idle/celebrating, coin, shield, alert icons (SVG/CSS)

## 7. Screens

- Start/onboarding
- Gameplay card view
- Pause
- Round result / feedback
- Win
- Loss/game over with scam recap

## 8. Polish Targets

- [x] Smooth card transitions
- [x] Score popovers
- [x] Mascot reaction
- [x] Progress meter
- [x] Particle burst on correct streak
- [ ] Sound or voice feedback (optional)

## 9. Technical Plan

- **Files:** `index.html`, `style.css`, `game.js`
- **State model:** deck, current card index, score, trust, streak, round, status
- **Rendering approach:** DOM cards with CSS transforms, requestAnimationFrame for particles
- **Responsive strategy:** mobile-first flex/canvas shell, desktop max-width container
- **Test plan:** load, play one round, win, lose, restart, mobile viewport

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
