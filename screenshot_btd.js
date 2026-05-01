const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 700 } });
  
  const url = `http://127.0.0.1:5180/bot-buy-the-dip/index.html`;
  console.log(`Processing bot-buy-the-dip...`);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // Click start
    await page.click('#actionBtn');
    
    // Wait for the chart to generate some data
    await page.waitForTimeout(3000);
    
    // Click buy to show UI change
    await page.click('#buyBtn');
    await page.waitForTimeout(1000);
    
    const thumbDir = `/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-buy-the-dip/assets`;
    if (!fs.existsSync(thumbDir)) {
        fs.mkdirSync(thumbDir, { recursive: true });
    }
    const dest = path.join(thumbDir, 'thumb.png');
    await page.screenshot({ path: dest });
    console.log(`Saved screenshot for bot-buy-the-dip at ${dest}`);
  } catch (e) {
    console.error(`Error processing bot-buy-the-dip:`, e.message);
  }
  await page.close();

  await browser.close();
})();
