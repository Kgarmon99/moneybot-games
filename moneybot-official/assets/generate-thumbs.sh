#!/bin/bash
# Generate unique SVG thumbnails for MoneyBot games
cd "$(dirname "$0")"
mkdir -p thumbs

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

# Restored games
create_thumb "bot-insurance-defender" "🛡️" "#00ff88" "TOWER DEFENSE"
create_thumb "bot-401k-match" "💰" "#00ff88" "DON'T MISS FREE MONEY"
create_thumb "bot-active-passive-income" "⚡" "#ffcc00" "INCOME TYPES"
create_thumb "bot-appreciating-depreciating" "📊" "#00ccff" "ASSET VALUES"
create_thumb "bot-budget-builder-v2" "📊" "#00ff88" "ADVANCED BUDGET"
create_thumb "bot-charitable-giving" "🎁" "#ff6b35" "TAX SMART"
create_thumb "bot-credit-score-climb" "📈" "#00ff88" "BUILD CREDIT"
create_thumb "bot-crypto-cold-storage" "❄️" "#00ccff" "SECURE CRYPTO"
create_thumb "bot-crypto-trading" "₿" "#ffcc00" "LIVE TRADING"
create_thumb "bot-dca-game" "📅" "#00ff88" "CONSISTENCY WINS"
create_thumb "bot-deal-master" "🤝" "#ff6b35" "NEGOTIATE"
create_thumb "bot-dividend-drip" "💧" "#00ff88" "COMPOUND DRIP"
create_thumb "bot-ecommerce-empire" "🛒" "#ff6b35" "ONLINE STORE"
create_thumb "bot-emergency-fund-escape" "🚨" "#ff4444" "6 MONTH FUND"
create_thumb "bot-estate-escape" "🏰" "#ffcc00" "PLAN LEGACY"
create_thumb "bot-expense-ratio-hunter" "🔍" "#ff6b35" "HUNT FEES"
create_thumb "bot-fire-calculator" "🔥" "#ff6b35" "RETIRE EARLY"
create_thumb "bot-freelancer-agency" "💼" "#00ccff" "SCALE UP"
create_thumb "bot-hsa-health-hero" "🏥" "#00ff88" "TRIPLE TAX"
create_thumb "bot-inflation-eater" "🐛" "#ff4444" "BEAT INFLATION"
create_thumb "bot-liquid-illiquid" "💧" "#00ccff" "CASH ACCESS"
create_thumb "bot-money-surfers" "🏄" "#00ccff" "RIDE WAVES"
create_thumb "bot-negotiation-nation" "🗣️" "#ff6b35" "GET PAID"
create_thumb "bot-net-worth-tracker" "📊" "#00ff88" "TRACK WEALTH"
create_thumb "bot-property-flipper" "🏠" "#ffcc00" "BUY RENOVATE"
create_thumb "bot-refinance-racer" "🏎️" "#ff4444" "RACE TO SAVE"
create_thumb "bot-restaurant-tycoon" "🍽️" "#ff6b35" "FOOD EMPIRE"
create_thumb "bot-risk-roulette" "🎰" "#ff00ff" "SPIN THE WHEEL"
create_thumb "bot-roth-vs-traditional" "⚖️" "#00ff88" "WHICH IRA?"
create_thumb "bot-saas-empire" "💻" "#00ccff" "RECURRING REVENUE"
create_thumb "bot-side-hustle-sprint" "⚡" "#ffcc00" "30 DAY LAUNCH"
create_thumb "bot-startup-tycoon" "🚀" "#ff6b35" "BUILD UNICORN"
create_thumb "bot-subway-surfer" "🚇" "#ff4444" "ENDLESS RUNNER"
create_thumb "bot-tax-trail" "🗺️" "#00ff88" "NAVIGATE TAXES"

echo "Generated $(ls thumbs/*.svg | wc -l) total thumbnails"
