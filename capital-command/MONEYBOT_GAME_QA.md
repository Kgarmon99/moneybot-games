# MoneyBot Game QA

Game directory: `/Users/kahlilgarmon/moneybot-games-deploy/capital-command`
Generated: 2026-08-08T16:27:18Z

## Required Files
- [PASS] index.html exists
- [PASS] style.css exists
- [PASS] game.js exists
- [PASS] assets/moneybot/moneybot-game.css exists
- [PASS] assets/moneybot/moneybot-game-kit.js exists

## Brand And Product Checks
- [PASS] MoneyBot green token or value
- [PASS] Shared MoneyBot brand kit imported
- [PASS] MoneyBot mascot/assets used
- [PASS] Money concept language
- [PASS] Win/loss/restart state
- [PASS] Mobile viewport
- [PASS] Touch or pointer support
- [PASS] Animation or feedback

## Placeholder/Slop Scan
- [PASS] No obvious placeholder text found.
- [PASS] Emoji use is limited (0).

## Browser Smoke Test
- [PASS] Browser server loaded: http://127.0.0.1:5199/

## Codex Challenge
- [BLOCKED] Codex v0.145.0 launched but authentication refresh failed with HTTP 401. Independent Codex verdict is pending.

## Required Human Summary

```text
Elite score: 82/100 (not Elite)
Blocking issues: independent Codex gate unavailable; human playtest still required; staged system unlocks and post-run allocation replay remain future upgrades.
Browser check: PASS at 390x844 and 1440x900 with start, pause/resume, sound toggle, keyboard allocation, and no actionable page errors.
Mobile check: PASS for viewport, horizontal overflow, compact one-screen layout, pointer controls, and 44px controls; extended physical-device playtest pending.
Codex verdict: BLOCKED — invalid refresh token (HTTP 401).
Next 10x upgrade: authored scenario cards that unlock systems progressively, plus a post-run decision timeline showing exactly which allocations created or destroyed resilience.
```
