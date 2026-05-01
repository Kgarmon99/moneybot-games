# MoneyBot Game QA

Game directory: `/Users/kahlilgarmon/.openclaw/workspace-ultimate-code-bot/games/capital-command`
Generated: 2026-05-01

## Required Files

- [PASS] `index.html` exists
- [PASS] `style.css` exists
- [PASS] `game.js` exists
- [PASS] `GAME_BRIEF.md` exists
- [PASS] `assets/README.md` exists

## Static Checks

- [PASS] `node --check games/capital-command/game.js`
- [PASS] MoneyBot brand tokens and language present
- [PASS] Complete start, pause, restart, wave-clear, win, and loss states present
- [PASS] Mobile viewport configured
- [PASS] Pointer, click, and keyboard controls present
- [PASS] Canvas animation, particles, popups, haptics, and HUD transitions present
- [PASS] No unfinished `TODO`, `FIXME`, `lorem`, `debugger`, or console-error code found in game source

## Browser And Codex Gate

- [BLOCKED] Local HTTP server launch was rejected by operator approval flow after sandbox denied binding `127.0.0.1`.
- [BLOCKED] Browser tool blocks `file://` and `data:` navigation, so a direct browser smoke test could not be completed in this session.
- [BLOCKED] Codex challenge could not create local session files inside sandbox; the required escalated rerun was rejected by operator approval flow.

## Manual Rubric Pass

```text
Elite score: 84/100
Blocking issues: browser and Codex gates unavailable in this session; live playtest pending.
Codex verdict: not available because sandbox session creation was blocked and escalation was rejected.
Browser check: blocked by local server and file/data URL restrictions.
Mobile check: static pass for layout/controls; live viewport check pending.
Next 10x upgrade: add authored mini-scenarios with named life events, sound design, and a post-run allocation replay that shows exactly which decisions created resilience.
```
