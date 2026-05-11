const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const targetGames = [
  { dir: 'bot-money-surfers', click: '#start-btn, #modal-btn, button' },
  { dir: 'capital-command', click: '#start-btn, #modal-btn, button' },
  { dir: 'flappybot', click: '#start-btn, #modal-btn, button' },
  { dir: 'bot-asset-allocator', click: '#start-btn, #modal-btn, button' }
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 800, height: 600 } });
  
  for (const game of targetGames) {
    const page = await context.newPage();
    const url = `http://127.0.0.1:5180/${game.dir}/index.html`;
    console.log(`Processing ${game.dir}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
      await page.waitForTimeout(1000);
      
      // Try to click start if it exists
      try {
        await page.click(game.click, { timeout: 1000 });
        console.log(`Clicked start in ${game.dir}`);
      } catch (e) {
        // Ignore if no start button
        console.log(`No start button found in ${game.dir}`);
      }
      
      await page.waitForTimeout(2000); // Wait for gameplay to run a bit
      
      const thumbDir = `/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/${game.dir}/assets`;
      if (!fs.existsSync(thumbDir)) {
          fs.mkdirSync(thumbDir, { recursive: true });
      }
      const dest = path.join(thumbDir, 'thumb.png');
      await page.screenshot({ path: dest });
      console.log(`Saved screenshot for ${game.dir} at ${dest}`);
    } catch (e) {
      console.error(`Error processing ${game.dir}:`, e.message);
    }
    await page.close();
  }

  await browser.close();
})();
