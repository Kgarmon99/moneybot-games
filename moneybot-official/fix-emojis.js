// Script to replace emojis with MoneyBot images
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Map of emojis to MoneyBot image paths
const emojiMap = {
  '🔥': 'assets/moneybot-idle.svg',
  '🎯': 'assets/moneybot-driving.svg',
  '🚀': 'assets/moneybot-celebrating.svg',
  '🎤': 'assets/moneybot-idle.svg',
  '👥': 'assets/moneybot-idle.svg',
  '🍜': 'assets/moneybot-idle.svg',
  '💯': 'assets/moneybot-celebrating.svg',
  '📊': 'assets/moneybot-idle.svg',
  '📈': 'assets/moneybot-celebrating.svg',
  '👾': 'assets/moneybot-idle.svg',
  '🦘': 'assets/moneybot-driving.svg',
  '🤖': 'assets/moneybot-idle.svg',
  '₿': 'assets/moneybot-idle.svg',
  '⚖️': 'assets/moneybot-idle.svg',
  '❓': 'assets/moneybot-idle.svg',
  '🏦': 'assets/moneybot-idle.svg',
  '✈️': 'assets/moneybot-driving.svg',
  '☕': 'assets/moneybot-idle.svg',
  '💸': 'assets/moneybot-celebrating.svg',
  '💳': 'assets/moneybot-idle.svg',
  '💰': 'assets/moneybot-celebrating.svg',
  '🏢': 'assets/moneybot-idle.svg',
  '🏡': 'assets/moneybot-idle.svg',
  '🏈': 'assets/moneybot-driving.svg',
  '🦈': 'assets/moneybot-idle.svg',
  '🍋': 'assets/moneybot-idle.svg'
};

// Replace each emoji with an image
Object.entries(emojiMap).forEach(([emoji, imgPath]) => {
  const regex = new RegExp(`<span class="game-emoji">${emoji}</span>`, 'g');
  html = html.replace(regex, `<img src="${imgPath}" alt="" class="game-icon" style="width:80px;height:80px;object-fit:contain;">`);
});

// Write updated HTML
fs.writeFileSync(htmlPath, html);
console.log('✅ Replaced all emojis with MoneyBot images');
console.log(`📊 Total replacements: ${Object.keys(emojiMap).length}`);
