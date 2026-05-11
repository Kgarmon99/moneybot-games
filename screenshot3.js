const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const targetGames = [
  'bot-achievement-hunt',
  'bot-budget-blaster',
  'bot-budget-breakout',
  'bot-budget-slice',
  'bot-bull-bear-battle',
  'bot-cash-craze',
  'bot-cash-dash',
  'bot-coin-pong',
  'bot-debt-destroyer'
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 800, height: 600 } });
  
  for (const game of targetGames) {
    const page = await context.newPage();
    const url = `http://127.0.0.1:5180/${game}/index.html`;
    console.log(`Processing ${game}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
      await page.waitForTimeout(1000);
      
      try {
        await page.click('#start-btn, #modal-btn, button, .start-button, .play-btn', { timeout: 1000 });
        console.log(`Clicked start in ${game}`);
      } catch (e) {
        console.log(`No start button found in ${game}`);
      }
      
      await page.waitForTimeout(2000); 
      
      const thumbDir = `/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/${game}/assets`;
      if (!fs.existsSync(thumbDir)) {
          fs.mkdirSync(thumbDir, { recursive: true });
      }
      const dest = path.join(thumbDir, 'thumb.png');
      await page.screenshot({ path: dest });
      console.log(`Saved screenshot for ${game} at ${dest}`);
    } catch (e) {
      console.error(`Error processing ${game}:`, e.message);
    }
    await page.close();
  }

  await browser.close();
})();
