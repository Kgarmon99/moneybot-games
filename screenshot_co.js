const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  
  await page.goto('http://127.0.0.1:5177/index.html');
  await page.waitForTimeout(1000);
  await page.click('#modal-btn');
  
  // Play the game for a bit to get a good screenshot
  await page.waitForTimeout(500);
  // Click T-Bill
  await page.mouse.click(50, 250);
  // Click Blue Chip
  await page.mouse.click(50, 310);
  // Click Folders x2
  await page.mouse.click(50, 430);
  await page.waitForTimeout(100);
  await page.mouse.click(50, 430);
  
  await page.waitForTimeout(3500); // Wait for TBill to cook
  
  // Click Grill Slot 1
  await page.mouse.click(200, 300);
  
  await page.waitForTimeout(500);
  
  await page.screenshot({ path: '/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/compound-cookoff/assets/thumb.png' });
  
  await browser.close();
})();
