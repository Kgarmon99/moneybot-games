const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
  
  await page.goto('http://127.0.0.1:5190/index.html');
  await page.waitForTimeout(1000);
  await page.click('#modal-btn');
  
  // Play the game for a bit to get a good screenshot
  for(let i=0; i<15; i++) {
      // Random X between 50 and 350
      const x = 50 + Math.random() * 300;
      await page.mouse.move(x, 100);
      await page.waitForTimeout(100);
      await page.mouse.click(x, 100);
      await page.waitForTimeout(1100); // Wait for cooldown
  }
  
  await page.screenshot({ path: '/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/yield-merge/assets/thumb.png' });
  await browser.close();
})();
