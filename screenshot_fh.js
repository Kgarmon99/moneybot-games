const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 700 } });
  
  const url = `http://127.0.0.1:5180/bot-financial-hangman/index.html`;
  console.log(`Processing bot-financial-hangman...`);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
    await page.waitForTimeout(1500);
    
    // Click a few letters to show gameplay
    const letters = ['E', 'A', 'I', 'O', 'T', 'N'];
    for (const letter of letters) {
      const key = await page.locator('.key', { hasText: letter }).first();
      if (key) {
        await key.click();
        await page.waitForTimeout(300);
      }
    }
    
    const thumbDir = `/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-financial-hangman/assets`;
    if (!fs.existsSync(thumbDir)) {
        fs.mkdirSync(thumbDir, { recursive: true });
    }
    const dest = path.join(thumbDir, 'thumb.png');
    await page.screenshot({ path: dest });
    console.log(`Saved screenshot for bot-financial-hangman at ${dest}`);
  } catch (e) {
    console.error(`Error processing bot-financial-hangman:`, e.message);
  }
  await page.close();

  await browser.close();
})();
