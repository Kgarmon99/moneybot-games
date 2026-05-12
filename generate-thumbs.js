#!/usr/bin/env node
/**
 * Generate thumbnail screenshots for MoneyBot games
 * Captures 400x250 PNG screenshots of each game's index.html
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const GAMES_DIR = '/Users/kahlilgarmon/.openclaw/workspace/moneybot-games';
const THUMB_WIDTH = 400;
const THUMB_HEIGHT = 250;

async function getGameFolders() {
  const entries = fs.readdirSync(GAMES_DIR, { withFileTypes: true });
  return entries
    .filter(e => e.isDirectory() && e.name.startsWith('bot-'))
    .map(e => e.name)
    .sort();
}

async function needsThumbnail(gameName) {
  const assetsDir = path.join(GAMES_DIR, gameName, 'assets');
  const thumbPath = path.join(assetsDir, 'thumb.png');
  return !fs.existsSync(thumbPath);
}

async function ensureAssetsDir(gameName) {
  const assetsDir = path.join(GAMES_DIR, gameName, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  return assetsDir;
}

async function captureScreenshot(browser, gameName) {
  const gameDir = path.join(GAMES_DIR, gameName);
  const indexPath = path.join(gameDir, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    return { success: false, error: 'No index.html found' };
  }

  const context = await browser.newContext({
    viewport: { width: THUMB_WIDTH, height: THUMB_HEIGHT },
    deviceScaleFactor: 2, // Retina quality
  });
  
  const page = await context.newPage();
  
  try {
    // Load the game
    await page.goto(`file://${indexPath}`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for content to render - some games need time to initialize
    await page.waitForTimeout(2000);
    
    // Ensure assets directory exists
    const assetsDir = await ensureAssetsDir(gameName);
    const thumbPath = path.join(assetsDir, 'thumb.png');
    
    // Take screenshot
    await page.screenshot({
      path: thumbPath,
      type: 'png',
    });
    
    await context.close();
    return { success: true, path: thumbPath };
    
  } catch (error) {
    await context.close();
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🎮 MoneyBot Game Thumbnail Generator\n');
  
  const allGames = await getGameFolders();
  console.log(`Found ${allGames.length} game folders`);
  
  // Check which need thumbnails
  const gamesNeedingThumbs = [];
  const gamesWithThumbs = [];
  
  for (const game of allGames) {
    if (await needsThumbnail(game)) {
      gamesNeedingThumbs.push(game);
    } else {
      gamesWithThumbs.push(game);
    }
  }
  
  console.log(`  ✅ Already have thumbs: ${gamesWithThumbs.length}`);
  console.log(`  📸 Need thumbs: ${gamesNeedingThumbs.length}\n`);
  
  if (gamesNeedingThumbs.length === 0) {
    console.log('All games have thumbnails!');
    return;
  }
  
  // Launch browser
  console.log('Launching browser...\n');
  const browser = await chromium.launch({ headless: true });
  
  let successCount = 0;
  let failCount = 0;
  const failed = [];
  
  // Process games needing thumbnails
  for (let i = 0; i < gamesNeedingThumbs.length; i++) {
    const game = gamesNeedingThumbs[i];
    const progress = `[${i + 1}/${gamesNeedingThumbs.length}]`;
    process.stdout.write(`${progress} Capturing ${game}... `);
    
    const result = await captureScreenshot(browser, game);
    
    if (result.success) {
      console.log(`✅`);
      successCount++;
    } else {
      console.log(`❌ ${result.error}`);
      failCount++;
      failed.push({ game, error: result.error });
    }
  }
  
  await browser.close();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total games: ${allGames.length}`);
  console.log(`Already had thumbs: ${gamesWithThumbs.length}`);
  console.log(`New thumbs generated: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  
  if (failed.length > 0) {
    console.log('\nFailed games:');
    for (const { game, error } of failed) {
      console.log(`  - ${game}: ${error}`);
    }
  }
  
  console.log(`\n✨ Done! ${successCount} new thumbnails generated.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
