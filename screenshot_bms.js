const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  
  await page.goto('http://127.0.0.1:5180/bull-market-survivor/index.html');
  await page.waitForTimeout(1000);
  await page.click('#modal-btn');
  
  await page.waitForTimeout(4000); // Wait for enemies to spawn and bullets to fly
  
  await page.screenshot({ path: '/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bull-market-survivor/assets/thumb.png' });
  await browser.close();
})();
