const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  
  const url = `http://127.0.0.1:5180/bot-savings-sprint/index.html`;
  console.log(`Processing bot-savings-sprint...`);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
    await page.waitForTimeout(1000);
    
    await page.click('#startBtn');
    console.log(`Clicked start in bot-savings-sprint`);
    
    await page.waitForTimeout(2000); 
    
    const thumbDir = `/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-savings-sprint/assets`;
    if (!fs.existsSync(thumbDir)) {
        fs.mkdirSync(thumbDir, { recursive: true });
    }
    const dest = path.join(thumbDir, 'thumb.png');
    await page.screenshot({ path: dest });
    console.log(`Saved screenshot for bot-savings-sprint at ${dest}`);
  } catch (e) {
    console.error(`Error processing bot-savings-sprint:`, e.message);
  }
  await page.close();

  await browser.close();
})();
