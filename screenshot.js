const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 800, height: 600 } });
  
  // Cashflow Cruiser
  const page1 = await context.newPage();
  await page1.goto('http://127.0.0.1:5180/cashflow-cruiser/index.html');
  await page1.waitForTimeout(1000);
  
  // Click start button
  await page1.click('#modal-btn');
  await page1.waitForTimeout(2000); // Wait for gameplay to run a bit
  
  await page1.screenshot({ path: '/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/cashflow-cruiser/assets/thumb.png' });
  await page1.close();

  // Money Printer GO
  const page2 = await context.newPage();
  await page2.goto('http://127.0.0.1:5180/money-printer-go/index.html');
  await page2.waitForTimeout(1000);
  
  // Click start button
  await page2.click('#modal-btn');
  await page2.waitForTimeout(1000);
  
  // Click printer a few times
  for(let i=0; i<5; i++) {
      await page2.click('#printer-btn');
      await page2.waitForTimeout(100);
  }
  
  await page2.screenshot({ path: '/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/money-printer-go/assets/thumb.png' });
  await page2.close();

  await browser.close();
})();
