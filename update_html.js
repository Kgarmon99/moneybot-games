const fs = require('fs');

const indexPath = '/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/moneybot-official/index.html';
let html = fs.readFileSync(indexPath, 'utf-8');

const games = [
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

games.forEach(game => {
    // Find the block for this game
    const regexStr = `<a href="\\.\\./${game}/" class="game-card">[\\s\\S]*?<img src="assets/moneybot-logo-1\\.jpg" class="game-icon" alt="([^"]+)">`;
    const regex = new RegExp(regexStr, 'g');
    
    html = html.replace(regex, (match, altText) => {
        return `<a href="../${game}/" class="game-card">
                    <div class="game-image">
                        <img src="../${game}/assets/thumb.png" class="game-icon" alt="${altText}" style="width: 100%; height: 100%; object-fit: cover; filter: none; border-radius: 0;">`;
    });
});

fs.writeFileSync(indexPath, html);
console.log('HTML updated successfully');
