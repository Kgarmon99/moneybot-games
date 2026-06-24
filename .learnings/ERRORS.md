# Errors Log

Command failures, exceptions, and unexpected behaviors.

---

2026-06-11 - Gemini configured but falls back when credits are depleted

What happened: `moneybot-code` was configured with `google/gemini-2.5-pro` as primary and Codex as fallback, but the live Telegram session fell back to `openai/gpt-5.5`.

What to do differently: Check session logs/status for the actual active model and Gemini API errors before saying Gemini is working. `RESOURCE_EXHAUSTED` means the Google AI Studio/Gemini prepayment credits need to be topped up or billing fixed.

---

2026-06-15 - Deployed MoneyBot games from the wrong Vercel root

What happened: A public deploy was run from `games/`, which created/linked a separate Vercel project and moved `games-money-bot.vercel.app` away from the existing full MoneyBot dashboard.

What to do differently: Before deploying, inspect `.vercel/project.json`, confirm the intended project/alias, and deploy from the workspace root when restoring the full MoneyBot page. Verify public access with plain `curl`, not only Vercel CLI output.

---

2026-06-15 - Full MoneyBot game catalog lives on `gh-pages`, not local `master`

What happened: The local `master` workspace only had a smaller subset of playable games, while the live GitHub Pages hub at `kgarmon99.github.io/moneybot-games/moneybot-official/` was built from the `gh-pages` branch with 100+ game directories.

What to do differently: When restoring or deploying the complete MoneyBot game hub, inspect `origin/gh-pages` or the GitHub Pages URL before assuming local `master` is complete. Preserve compatibility redirects for `/games/<slug>/` paths when deploying the `gh-pages` archive to Vercel.

---

2026-06-20 - Playwright package may not have bundled browsers

What happened: A Playwright smoke test failed because the cached Chromium headless shell was missing, even though the Playwright package was installed.

What to do differently: For quick local verification on Kahlil's Mac, launch Playwright with the system Chrome executable at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` before downloading browsers.
