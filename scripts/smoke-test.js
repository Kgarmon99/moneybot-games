const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const root = path.resolve(__dirname, '..');
const port = 41977;
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
(async () => {
  await new Promise(resolve => setTimeout(resolve, 700));
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${port}/moneybot-official/`, { waitUntil: 'domcontentloaded' });
      await page.locator('[data-section="flagships"] .game-card').first().waitFor();
      await page.locator('[data-section="flagships"] .game-objective').first().waitFor();
      await page.locator('.cat-btn[data-filter="budgeting-and-saving"]').click();
      await page.locator('.search-results.active .game-card').first().waitFor();
      const wrongTopicCount = await page.locator('.search-results.active .game-card:not([data-topic="budgeting-and-saving"])').count();
      if (wrongTopicCount) throw new Error(`Topic filter returned ${wrongTopicCount} mismatched card(s) at ${viewport.width}px`);
      await page.locator('.cat-btn[data-filter="all"]').click();
      await page.locator('#searchInput').fill('diversification');
      await page.locator('.search-results.active .game-card').first().waitFor();
      await page.locator('#searchInput').fill('');
      await page.locator('[data-section="flagships"] .game-card').first().waitFor();
      const firstFavorite = page.locator('[data-section="flagships"] .favorite-btn').first();
      await firstFavorite.click();
      await page.locator('[data-section="favorites"] .game-card').first().waitFor();
      if (errors.length) throw new Error(`Browser errors at ${viewport.width}px: ${errors.join('; ')}`);
      await page.close();
    }
    console.log('Hub smoke test passed at 390x844 and 1440x900');
  } finally {
    await browser.close();
    server.kill();
  }
})().catch(error => { console.error(error); server.kill(); process.exit(1); });
