#!/bin/bash
# Generate unique SVG thumbnails for MoneyBot games
# Usage: bash generate-thumbs.sh

cd "$(dirname "$0")"

mkdir -p thumbs

# Function to create SVG thumb
create_thumb() {
    local name="$1"
    local icon="$2"
    local color="$3"
    local subtitle="$4"
    local file="thumbs/${name}.svg"
    
    cat > "$file" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="320" height="200">
  <defs>
    <linearGradient id="g${name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#050505"/>
      <stop offset="100%" style="stop-color:#0a1a0f"/>
    </linearGradient>
    <filter id="glow${name}">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="320" height="200" fill="url(#g${name})"/>
  <rect x="10" y="10" width="300" height="180" fill="none" stroke="${color}" stroke-width="1" opacity="0.3"/>
  <rect x="15" y="15" width="290" height="170" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.15"/>
  <text x="160" y="90" font-family="Arial, sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="${color}" filter="url(#glow${name})" opacity="0.9">${icon}</text>
  <text x="160" y="140" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="bold" text-anchor="middle" fill="#ffffff" letter-spacing="2">${name//-/ }</text>
  <text x="160" y="165" font-family="'JetBrains Mono', monospace" font-size="10" text-anchor="middle" fill="${color}" opacity="0.7" letter-spacing="1">${subtitle}</text>
  <line x1="60" y1="175" x2="260" y2="175" stroke="${color}" stroke-width="0.5" opacity="0.3"/>
</svg>
EOF
}

# Featured games
create_thumb "bot-real-estate-sim" "🏠" "#00ff88" "RENT VS BUY"
create_thumb "bot-shot" "🏀" "#ff6b35" "SPACE BASKETBALL"
create_thumb "bot-smart-borrower" "🧠" "#00ccff" "LEARN TO BORROW"
create_thumb "bot-financial-simulator" "💰" "#00ff88" "LIFE SIMULATION"
create_thumb "bot-college-quest" "🎓" "#ffcc00" "COLLEGE FINANCE"
create_thumb "cashflow-cruiser" "🚀" "#ff00ff" "ENDLESS RUNNER"
create_thumb "compound-cookoff" "🍳" "#ff6b35" "COOK & INVEST"
create_thumb "money-printer-go" "💵" "#00ff88" "IDLE ECONOMY"
create_thumb "flappybot" "🐦" "#00ccff" "FLY & DODGE"
create_thumb "bot-financial-hangman" "🎯" "#ff4444" "GUESS THE TERM"
create_thumb "bull-market-survivor" "📈" "#00ff88" "MARKET SURVIVAL"
create_thumb "bot-savings-sprint" "🏃" "#ffcc00" "DODGE EXPENSES"
create_thumb "capital-command" "⚔️" "#ff6b35" "COMMAND CAPITAL"
create_thumb "yield-merge" "🔀" "#00ccff" "MERGE ASSETS"
create_thumb "bot-budget-builder" "📊" "#00ff88" "BUILD BUDGETS"
create_thumb "bot-achievement-hunt" "🏆" "#ffcc00" "UNLOCK MILESTONES"
create_thumb "bot-buy-the-dip" "📉" "#ff4444" "TIMING GAME"
create_thumb "bot-asset-allocator" "🎯" "#00ff88" "PORTFOLIO BALANCE"
create_thumb "bot-debt-destroyer" "💥" "#ff4444" "BLAST DEBT"
create_thumb "bot-crypto-climb" "🪙" "#ffcc00" "CLIMB MARKETS"
create_thumb "bot-compound-climb" "📊" "#00ff88" "STACK & GROW"
create_thumb "bot-stock-stack" "🏗️" "#00ccff" "BUILD PORTFOLIO"
create_thumb "bot-risk-tetris" "🎮" "#ff6b35" "BALANCE RISK"
create_thumb "bot-wealth-tower" "🏢" "#ffcc00" "BUILD WEALTH"
create_thumb "bot-dividend-defense" "🛡️" "#00ff88" "TOWER DEFENSE"
create_thumb "bot-invest-island" "🏝️" "#00ccff" "ISLAND SIM"
create_thumb "bot-cash-craze" "💎" "#ff00ff" "MATCH-3"
create_thumb "bot-coin-pong" "🏓" "#ffcc00" "CLASSIC PONG"
create_thumb "bot-budget-blaster" "🔫" "#ff4444" "BLAST EXPENSES"
create_thumb "bot-bull-bear-battle" "🐂" "#ff6b35" "MARKET BATTLE"
create_thumb "bot-budget-breakout" "🧱" "#00ccff" "BREAKOUT"
create_thumb "bot-budget-slice" "🍕" "#ff6b35" "SLICE BUDGET"
create_thumb "bot-dollar-drop" "💵" "#00ff88" "STRATEGIC DROP"
create_thumb "bot-galactic-loan-sharks" "🦈" "#ff4444" "SPACE ADVENTURE"
create_thumb "bot-history-of-money" "📜" "#ffcc00" "EDUCATIONAL"
create_thumb "bot-ipo-launch" "🚀" "#00ff88" "GO PUBLIC"
create_thumb "bot-lemonade-empire" "🍋" "#ffcc00" "TYCOON"
create_thumb "bot-market-racer" "🏎️" "#ff6b35" "RACING"
create_thumb "bot-diversification-drop" "📦" "#00ccff" "PUZZLE DROP"
create_thumb "bot-wealth-wheel" "🎡" "#ff00ff" "SPIN & WIN"
create_thumb "bot-profit-pinball" "🔮" "#ffcc00" "PINBALL"
create_thumb "bot-fiscal-frogger" "🐸" "#00ff88" "CROSS ROADS"
create_thumb "bot-savings-snake" "🐍" "#00ff88" "GROW SAVINGS"
create_thumb "bot-tax-tetris" "🧩" "#00ccff" "FIT PIECES"
create_thumb "bot-stock-tycoon" "📈" "#ffcc00" "TRADING EMPIRE"
create_thumb "bot-cash-dash" "💨" "#ff6b35" "SPEED RUN"
create_thumb "bot-market-surfers" "🏄" "#00ccff" "SURF MARKETS"

echo "Generated $(ls thumbs/*.svg | wc -l) thumbnails"
