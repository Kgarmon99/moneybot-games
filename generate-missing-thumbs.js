const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const games = [
  'cryptobot',
  'money-bank-heist',
  'money-invaders',
  'money-jump',
  'moneybot-3d-showcase',
  'moneybot-rush-pro',
  'moneymatch',
  'moneyolympics',
  'moneyverse-games',
  'stockbot'
];

async function capture(game) {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 800, height: 500 }
  });
  
  try {
    const gamePath = path.join(__dirname, game, 'index.html');
    if (!fs.existsSync(gamePath)) {
      console.log(`✗ ${game} - no index.html`);
      await browser.close();
      return;
    }
    
    await page.goto(`file://${gamePath}`);
    await page.waitForTimeout(2000);
    
    const assetsDir = path.join(__dirname, game, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    await page.screenshot({
      path: path.join(assetsDir, 'thumb.png'),
      type: 'png'
    });
    
    console.log(`✓ ${game}`);
  } catch (err) {
    console.log(`✗ ${game} - ${err.message}`);
  }
  
  await browser.close();
}

async function main() {
  for (const game of games) {
    await capture(game);
  }
}

main();