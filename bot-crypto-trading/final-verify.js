const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  // Test live URL
  await page.goto('https://kgarmon99.github.io/moneybot-games/bot-crypto-trading/');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'live-start.png' });
  
  // Start and take gameplay shot
  await page.evaluate(() => document.getElementById('btn-start').click());
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'live-game.png' });
  
  await browser.close();
  console.log('Live verification complete');
})();
