const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const targetGames = [
  'bot-crypto-climb',
  'bot-diversification-drop',
  'bot-dividend-defense',
  'bot-dollar-drop',
  'bot-fiscal-frogger',
  'bot-invest-island',
  'bot-ipo-launch',
  'bot-market-racer',
  'bot-market-surfers',
  'bot-profit-pinball',
  'bot-risk-tetris',
  'bot-savings-snake',
  'bot-savings-sprint',
  'bot-stock-stack',
  'bot-stock-tycoon',
  'bot-tax-tetris',
  'bot-wealth-tower',
  'bot-wealth-wheel'
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 800, height: 600 } });
  
  for (const game of targetGames) {
    const page = await context.newPage();
    const url = `http://127.0.0.1:5180/${game}/index.html`;
    console.log(`Processing ${game}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 8000 });
      await page.waitForTimeout(1000);
      
      try {
        await page.click('#start-btn, #modal-btn, button, .start-button, .play-btn', { timeout: 1000 });
        console.log(`Clicked start in ${game}`);
      } catch (e) {
        console.log(`No start button found in ${game}`);
      }
      
      await page.waitForTimeout(1500); 
      
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
