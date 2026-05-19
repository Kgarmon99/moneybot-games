# MoneyBot Game QA

Game directory: `/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire`
Generated: 2026-05-19T00:36:42Z

## Required Files
- [PASS] index.html exists
- [PASS] style.css exists
- [PASS] game.js exists

## Brand And Product Checks
- [PASS] MoneyBot green token or value
- [PASS] Money concept language
- [PASS] Win/loss/restart state
- [PASS] Mobile viewport
- [PASS] Touch or pointer support
- [PASS] Animation or feedback

## Placeholder/Slop Scan
- [WARN] Placeholder-like text found; inspect before handoff.
- [WARN] Emoji count is 27. Replace primary UI/game art with MoneyBot assets.

## Browser Smoke Test
- [PASS] Browser server loaded: http://127.0.0.1:5199/

## Codex Challenge
- [SKIP] Codex challenge skipped by flag.

## Required Human Summary

Fill this before final handoff:

```text
Elite score: __/100
Blocking issues:
Browser check:
Mobile check:
Codex verdict:
Next 10x upgrade:
```
```text
Reading additional input from stdin...
OpenAI Codex v0.125.0 (research preview)
--------
workdir: /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
model: gpt-5.5
provider: openai
approval: never
sandbox: read-only
reasoning effort: high
reasoning summaries: none
session id: 019e3da8-6ba1-7330-a93b-4ed2cb193642
--------
user
You are reviewing a MoneyBot browser game prototype. Use these standards:
- references/moneybot-games/QUALITY_STANDARD.md
- references/moneybot-games/DESIGN_SYSTEM.md
- references/moneybot-games/ELITE_RUBRIC.md
- references/moneybot-games/ASSET_MANIFEST.md

Review focus: MoneyBot elite quality: fun, money learning mechanic, brand consistency, mobile UX, controls, accessibility, bugs, and launch readiness

Inspect the code in this directory and return:
1. PASS or FAIL for "ready for Kahlil to play".
2. Elite score from 0-100 using the MoneyBot elite rubric.
3. The top 5 issues that hurt fun, MoneyBot brand, usability, correctness, or launch quality.
4. Concrete fixes, with filenames and exact implementation guidance.
5. One upgrade that would make the game feel 10x better.

Be direct. Do not rewrite the whole game unless necessary. Prioritize playable,
visible, fun, browser-safe behavior. Do not call emoji-heavy placeholder UI elite.
codex
I’ll review this as a code and product quality pass against the MoneyBot standards, then report findings first with concrete file-level fixes. I’m going to read the referenced standards and map the app structure before judging play readiness.
exec
/bin/zsh -lc "sed -n '1,220p' references/moneybot-games/QUALITY_STANDARD.md" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 exited 1 in 0ms:
sed: references/moneybot-games/QUALITY_STANDARD.md: No such file or directory

exec
/bin/zsh -lc "sed -n '1,240p' references/moneybot-games/DESIGN_SYSTEM.md" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 exited 1 in 0ms:
sed: references/moneybot-games/DESIGN_SYSTEM.md: No such file or directory

exec
/bin/zsh -lc "sed -n '1,260p' references/moneybot-games/ELITE_RUBRIC.md" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 exited 1 in 0ms:
sed: references/moneybot-games/ELITE_RUBRIC.md: No such file or directory

exec
/bin/zsh -lc "sed -n '1,220p' references/moneybot-games/ASSET_MANIFEST.md" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 exited 1 in 0ms:
sed: references/moneybot-games/ASSET_MANIFEST.md: No such file or directory

exec
/bin/zsh -lc 'pwd && rg --files' in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
g.js
s.css
MONEYBOT_GAME_QA.md
GAME_BRIEF.md
index.html

codex
The local game is only three runtime files plus briefs. The referenced standards are not under this directory path, so I’m checking nearby paths and the game files directly before assigning the score.
exec
/bin/zsh -lc "sed -n '1,260p' index.html" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>E-commerce Empire</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="s.css?v=4">
</head>
<body>
    <div id="app">
        <!-- HUD -->
        <header id="hud" class="hidden">
            <div class="hud-row">
                <div class="hud-pill">
                    <span class="hud-label">DAY</span>
                    <span id="day-val" class="hud-value">1</span>
                </div>
                <div class="hud-pill">
                    <span class="hud-label">STREAK</span>
                    <span id="streak-val" class="hud-value">0</span>
                </div>
                <div class="hud-pill cash">
                    <span class="hud-label">CASH</span>
                    <span id="cash-val" class="hud-value">$10K</span>
                </div>
            </div>
            <div class="hud-row metrics">
                <div class="metric">
                    <span class="metric-label">INVENTORY</span>
                    <span id="inv-val" class="metric-value">0</span>
                </div>
                <div class="metric">
                    <span class="metric-label">REVENUE</span>
                    <span id="rev-val" class="metric-value">$0</span>
                </div>
                <div class="metric">
                    <span class="metric-label">PROFIT</span>
                    <span id="profit-val" class="metric-value">$0</span>
                </div>
                <div class="metric">
                    <span class="metric-label">RATING</span>
                    <span id="rating-val" class="metric-value">⭐ 3.0</span>
                </div>
            </div>
        </header>

        <!-- Start Screen -->
        <div id="start-screen" class="screen active">
            <div class="logo-area">
                <div class="mascot">🛒</div>
                <h1>E-COMMERCE<br><span class="highlight">EMPIRE</span></h1>
                <p class="tagline">Source. Price. Advertise. Ship. Profit.</p>
            </div>
            <div class="instructions">
                <div class="inst-item"><span class="inst-icon">📦</span> Source products from suppliers</div>
                <div class="inst-item"><span class="inst-icon">🏷️</span> Set prices — too high kills sales</div>
                <div class="inst-item"><span class="inst-icon">📢</span> Run ads — budget vs reach</div>
                <div class="inst-item"><span class="inst-icon">📊</span> Watch cashflow — you pay first, customers pay later</div>
            </div>
            <div class="win-target">
                <div class="target-row"><span>Win:</span> <span class="good">$500K profit</span> or <span class="good">50K units sold</span></div>
                <div class="target-row"><span>Lose:</span> <span class="danger">Cash hits $0</span></div>
            </div>
            <button id="btn-start" class="btn-primary">Open Store</button>
        </div>

        <!-- Game Screen -->
        <div id="game-screen" class="screen">
            <!-- Season / Event Banner -->
            <div id="event-banner" class="event-banner hidden"></div>

            <!-- Phase: Source -->
            <div id="phase-source" class="phase-panel">
                <div class="phase-header">
                    <span class="phase-icon">📦</span>
                    <span class="phase-title">Source Products</span>
                </div>
                <div class="suppliers-grid" id="suppliers-list"></div>
            </div>

            <!-- Phase: Price -->
            <div id="phase-price" class="phase-panel hidden">
                <div class="phase-header">
                    <span class="phase-icon">🏷️</span>
                    <span class="phase-title">Set Price</span>
                </div>
                <div class="price-card">
                    <div class="price-info">
                        <div class="price-row"><span>Unit Cost</span><span id="unit-cost" class="price-value">$5.00</span></div>
                        <div class="price-row"><span>Your Price</span><span id="your-price" class="price-value good">$10.00</span></div>
                        <div class="price-row"><span>Margin</span><span id="margin-pct" class="price-value">50%</span></div>
                    </div>
                    <div class="slider-wrap">
                        <input type="range" id="price-slider" min="1" max="50" step="0.5" value="10">
                        <div class="slider-labels"><span>$1</span><span>$50</span></div>
                    </div>
                    <div class="conversion-est">
                        <span>Est. conversion:</span>
                        <span id="conversion-rate" class="good">8.5%</span>
                    </div>
                </div>
                <button id="btn-confirm-price" class="btn-primary">Set Price</button>
            </div>

            <!-- Phase: Ads -->
            <div id="phase-ads" class="phase-panel hidden">
                <div class="phase-header">
                    <span class="phase-icon">📢</span>
                    <span class="phase-title">Run Ads</span>
                </div>
                <div class="ads-card">
                    <div class="ads-info">
                        <div class="ads-row"><span>Daily Budget</span><span id="ad-budget" class="price-value">$200</span></div>
                        <div class="ads-row"><span>Est. Reach</span><span id="ad-reach" class="price-value">2,000</span></div>
                        <div class="ads-row"><span>Est. Visitors</span><span id="ad-visitors" class="price-value">170</span></div>
                    </div>
                    <div class="slider-wrap">
                        <input type="range" id="ad-slider" min="0" max="2000" step="50" value="200">
                        <div class="slider-labels"><span>$0</span><span>$2,000</span></div>
                    </div>
                    <div class="ad-tip">Higher budgets have diminishing returns. Test and learn.</div>
                </div>
                <button id="btn-confirm-ads" class="btn-primary">Launch Campaign</button>
            </div>

            <!-- Phase: Results -->
            <div id="phase-results" class="phase-panel hidden">
                <div class="phase-header">
                    <span class="phase-icon">📊</span>
                    <span class="phase-title">Daily Results</span>
                </div>
                <div class="results-card">
                    <div class="result-row"><span>Visitors</span><span id="res-visitors">0</span></div>
                    <div class="result-row"><span>Orders</span><span id="res-orders">0</span></div>
                    <div class="result-row"><span>Revenue</span><span id="res-revenue">$0</span></div>
                    <div class="result-row"><span>Ad Spend</span><span id="res-adspend" class="danger">-$0</span></div>
                    <div class="result-row"><span>Shipping</span><span id="res-shipping" class="danger">-$0</span></div>
                    <div class="result-row"><span>Returns</span><span id="res-returns" class="danger">-$0</span></div>
                    <div class="result-row"><span>Carrying Cost</span><span id="res-carrying" class="danger">-$0</span></div>
                    <div class="result-row highlight"><span>Net Profit</span><span id="res-profit">$0</span></div>
                    <div class="result-row"><span>Inventory Left</span><span id="res-inventory">0</span></div>
                    <div class="result-row"><span>New Reviews</span><span id="res-reviews">0</span></div>
                </div>
                <div id="review-flash" class="review-flash hidden"></div>
                <button id="btn-next-day" class="btn-primary">Next Day →</button>
            </div>
        </div>

        <!-- Win Screen -->
        <div id="win-screen" class="screen">
            <div class="mascot big">🏆</div>
            <h1>EMPIRE<br><span class="highlight">BUILT</span></h1>
            <p class="subtitle">You mastered e-commerce cashflow.</p>
            <div class="final-stats" id="win-stats"></div>
            <div class="tip-box" id="win-tip"></div>
            <button id="btn-replay-win" class="btn-primary">Play Again</button>
        </div>

        <!-- Loss Screen -->
        <div id="loss-screen" class="screen">
            <div class="mascot big">💸</div>
            <h1 class="danger">OUT OF<br>CASH</h1>
            <p class="subtitle">Your store couldn't stay afloat.</p>
            <div class="final-stats" id="loss-stats"></div>
            <div class="tip-box" id="loss-tip"></div>
            <button id="btn-replay-loss" class="btn-primary">Try Again</button>
        </div>
    </div>

    <script src="g.js?v=4"></script>
</body>
</html>

exec
/bin/zsh -lc "sed -n '1,280p' g.js" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
(function() {
  'use strict';

  // ===== CONSTANTS =====
  const WIN_PROFIT = 500000;
  const WIN_UNITS = 50000;
  const START_CASH = 10000;
  const CARRYING_COST_PER_UNIT = 0.15; // per day per unsold unit
  const SHIPPING_COST_PER_UNIT = 2.50;
  const BASE_RETURN_RATE = 0.05; // 5% returns
  const REVIEW_WEIGHT = 0.08; // each review affects rating by this much

  const SEASONS = [
    { name: 'Normal', multiplier: 1.0, color: '' },
    { name: 'Back to School', multiplier: 1.4, color: 'good' },
    { name: 'Black Friday', multiplier: 2.2, color: 'gold' },
    { name: 'Holiday Rush', multiplier: 1.8, color: 'gold' },
    { name: 'Summer Slump', multiplier: 0.7, color: '' },
  ];

  const SUPPLIERS = [
    {
      id: 'budget',
      name: 'Budget Direct',
      tier: 'budget',
      cost: 3.00,
      quality: 0.6,
      minOrder: 50,
      maxOrder: 500,
      leadTime: 0,
      desc: 'Cheap, slow shipping, higher returns. Good for testing.',
      unlockDay: 0,
    },
    {
      id: 'standard',
      name: 'Standard Wholesale',
      tier: 'standard',
      cost: 5.00,
      quality: 0.85,
      minOrder: 100,
      maxOrder: 2000,
      leadTime: 0,
      desc: 'Balanced cost and quality. The safe choice.',
      unlockDay: 0,
    },
    {
      id: 'premium',
      name: 'Premium Goods Co.',
      tier: 'premium',
      cost: 12.00,
      quality: 0.95,
      minOrder: 200,
      maxOrder: 5000,
      leadTime: 1,
      desc: 'High quality, low returns. Customers love it.',
      unlockDay: 7,
    },
    {
      id: 'wholesale',
      name: 'Global Wholesale Hub',
      tier: 'wholesale',
      cost: 8.00,
      quality: 0.80,
      minOrder: 1000,
      maxOrder: 20000,
      leadTime: 2,
      desc: 'Massive volume at lower per-unit cost. Requires scale.',
      unlockDay: 14,
    },
  ];

  const EVENTS = [
    { text: '📦 Supply chain delay! New inventory arrives 1 day late.', effect: 'delay', good: false },
    { text: '📈 Trending on social! Demand +30% today.', effect: 'viral', good: true },
    { text: '🚚 Shipping rates spike! Shipping costs +50% today.', effect: 'shipping', good: false },
    { text: '⭐ Influencer shoutout! Free visitors today.', effect: 'influencer', good: true },
    { text: '💳 Payment processor down! 20% of sales lost.', effect: 'processor', good: false },
    { text: '🎁 Bulk corporate order! +50 units sold instantly.', effect: 'corporate', good: true },
    { text: '📉 Ad costs jump! CPM +40% today.', effect: 'adcost', good: false },
    { text: '🌟 Customer love week! Reviews are extra positive.', effect: 'love', good: true },
  ];

  // ===== STATE =====
  let state = {
    day: 1,
    cash: START_CASH,
    inventory: 0,
    inventoryIncoming: [], // { units, arrivesDay }
    totalProfit: 0,
    totalRevenue: 0,
    totalUnitsSold: 0,
    totalUnitsReturned: 0,
    rating: 3.0,
    reviewCount: 0,
    reputation: 0, // 0-100, unlocks better suppliers
    streak: 0,
    bestStreak: 0,
    dailyLog: [],
    gameOver: false,
    won: false,
    // Current day decisions
    selectedSupplier: null,
    orderQty: 0,
    price: 10,
    adBudget: 200,
    // Season
    season: SEASONS[0],
    seasonDaysLeft: 0,
    // Event
    todayEvent: null,
  };

  // ===== DOM =====
  const $ = id => document.getElementById(id);
  const screens = {
    start: $('start-screen'),
    game: $('game-screen'),
    win: $('win-screen'),
    loss: $('loss-screen'),
  };
  const hud = $('hud');

  function fmtMoney(n) {
    if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + Math.round(n).toLocaleString();
  }

  function fmtNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  }

  // ===== SCREEN MANAGEMENT =====
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  // ===== HUD =====
  function updateHUD() {
    $('day-val').textContent = state.day;
    $('streak-val').textContent = state.streak;
    $('cash-val').textContent = fmtMoney(state.cash);
    $('inv-val').textContent = fmtNum(state.inventory);
    $('rev-val').textContent = fmtMoney(state.totalRevenue);
    $('profit-val').textContent = fmtMoney(state.totalProfit);
    $('profit-val').className = 'metric-value ' + (state.totalProfit >= 0 ? 'good' : 'danger');
    $('rating-val').textContent = '⭐ ' + state.rating.toFixed(1);
  }

  // ===== SEASONS =====
  function pickSeason() {
    const roll = Math.random();
    if (roll < 0.45) return SEASONS[0]; // Normal
    if (roll < 0.60) return SEASONS[4]; // Summer Slump
    if (roll < 0.75) return SEASONS[1]; // Back to School
    if (roll < 0.88) return SEASONS[3]; // Holiday Rush
    return SEASONS[2]; // Black Friday
  }

  function updateSeason() {
    if (state.seasonDaysLeft <= 0) {
      state.season = pickSeason();
      state.seasonDaysLeft = 3 + Math.floor(Math.random() * 5); // 3-7 days
    }
    state.seasonDaysLeft--;
  }

  function showSeasonBanner() {
    const banner = $('event-banner');
    if (state.season.name !== 'Normal') {
      banner.textContent = `🌟 ${state.season.name}: Demand ${state.season.multiplier >= 1 ? '+' : ''}${Math.round((state.season.multiplier - 1) * 100)}%`;
      banner.className = 'event-banner ' + (state.season.color || '');
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  }

  // ===== EVENTS =====
  function rollEvent() {
    if (Math.random() < 0.25) {
      state.todayEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    } else {
      state.todayEvent = null;
    }
  }

  function showEventBanner() {
    if (!state.todayEvent) return;
    const banner = $('event-banner');
    banner.textContent = state.todayEvent.text;
    banner.className = 'event-banner ' + (state.todayEvent.good ? 'good' : '');
    banner.classList.remove('hidden');
  }

  // ===== PHASE: SOURCE =====
  function renderSuppliers() {
    const container = $('suppliers-list');
    container.innerHTML = '';

    SUPPLIERS.forEach(s => {
      const locked = state.day < s.unlockDay;
      const card = document.createElement('div');
      card.className = 'supplier-card' + (locked ? ' locked' : '');
      card.innerHTML = `
        <div class="supplier-header">
          <span class="supplier-tier tier-${s.tier}">${s.tier}</span>
          <span class="supplier-name">${s.name}</span>
        </div>
        <div class="supplier-desc">${s.desc}</div>
        <div class="supplier-stats">
          <span class="supplier-stat"><span class="stat-label">Cost:</span><span class="stat-value">$${s.cost.toFixed(2)}</span></span>
          <span class="supplier-stat"><span class="stat-label">Quality:</span><span class="stat-value">${Math.round(s.quality * 100)}%</span></span>
          <span class="supplier-stat"><span class="stat-label">Min:</span><span class="stat-value">${s.minOrder}</span></span>
          <span class="supplier-stat"><span class="stat-label">Max:</span><span class="stat-value">${fmtNum(s.maxOrder)}</span></span>
          ${s.leadTime > 0 ? `<span class="supplier-stat"><span class="stat-label">Lead:</span><span class="stat-value">${s.leadTime}d</span></span>` : ''}
        </div>
      `;
      if (!locked) {
        card.addEventListener('click', () => selectSupplier(s));
      }
      container.appendChild(card);
    });
  }

  function selectSupplier(supplier) {
    state.selectedSupplier = supplier;
    // Default order: min order or affordable max
    const maxAfford = Math.floor(state.cash / supplier.cost);
    state.orderQty = Math.min(supplier.maxOrder, Math.max(supplier.minOrder, Math.min(maxAfford, supplier.minOrder * 2)));
    if (state.orderQty < supplier.minOrder) {
      // Can't afford even minimum
      showToast('Not enough cash for minimum order!');
      return;
    }
    showPhase('price');
  }

  // ===== PHASE: PRICE =====
  function initPricePhase() {
    const s = state.selectedSupplier;
    const slider = $('price-slider');
    // Set reasonable default price: 2.5x cost minimum
    const defaultPrice = Math.max(10, s.cost * 2.5);
    state.price = Math.round(defaultPrice * 2) / 2;
    slider.min = Math.max(1, s.cost * 1.2);
    slider.max = Math.max(50, s.cost * 8);
    slider.step = 0.5;
    slider.value = state.price;
    updatePriceDisplay();
    slider.oninput = updatePriceDisplay;
    $('btn-confirm-price').onclick = () => showPhase('ads');
  }

  function updatePriceDisplay() {
    state.price = parseFloat($('price-slider').value);
    const s = state.selectedSupplier;
    $('unit-cost').textContent = '$' + s.cost.toFixed(2);
    $('your-price').textContent = '$' + state.price.toFixed(2);
    const margin = ((state.price - s.cost) / state.price) * 100;
    $('margin-pct').textContent = margin.toFixed(1) + '%';
    $('margin-pct').className = 'price-value ' + (margin > 30 ? 'good' : margin > 10 ? '' : 'danger');

    // Conversion estimate based on price relative to "market" price
    const marketPrice = s.cost * 3;
    const ratio = state.price / marketPrice;
    let conversion = 0.12 / Math.pow(ratio, 1.8);
    conversion = Math.max(0.005, Math.min(0.25, conversion));
    // Quality bonus
    conversion *= (0.7 + s.quality * 0.3);
    // Rating bonus
    conversion *= (0.8 + (state.rating / 5) * 0.2);

    $('conversion-rate').textContent = (conversion * 100).toFixed(1) + '%';
  }

  // ===== PHASE: ADS =====

exec
/bin/zsh -lc "sed -n '1,320p' s.css" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
:root {
  --mb-green: #00E676;
  --mb-green-dark: #00C853;
  --mb-green-soft: #69F0AE;
  --mb-ink: #07111F;
  --mb-ink-2: #0B1628;
  --mb-panel: rgba(10, 24, 42, 0.92);
  --mb-line: rgba(105, 240, 174, 0.2);
  --mb-white: #F8FAFC;
  --mb-muted: #94A3B8;
  --mb-gold: #FBBF24;
  --mb-red: #FB7185;
  --mb-blue: #38BDF8;
  --mb-purple: #A78BFA;
  --mb-radius: 16px;
  --mb-shadow: 0 8px 32px rgba(0,0,0,0.4);
  --mb-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body, html {
  width: 100%; height: 100%;
  background: var(--mb-ink);
  color: var(--mb-white);
  font-family: 'Outfit', sans-serif;
  user-select: none;
  overflow: hidden;
}

#app {
  max-width: 480px;
  margin: 0 auto;
  height: 100%;
  position: relative;
  background: var(--mb-ink);
  display: flex;
  flex-direction: column;
}

/* ===== SCREENS ===== */
.screen {
  position: absolute;
  inset: 0;
  z-index: 20;
  padding: 24px 20px;
  display: none;
  flex-direction: column;
  background: var(--mb-ink);
  overflow-y: auto;
}

/* ===== START SCREEN ===== */
.logo-area { text-align: center; margin: 10px 0 24px; }
.mascot { font-size: 48px; line-height: 1; margin-bottom: 12px; }
.mascot.big { font-size: 72px; margin-bottom: 16px; }

h1 {
  font-size: 38px;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -1px;
}
h1 .highlight { color: var(--mb-green); }
h1.danger { color: var(--mb-red); }

.tagline {
  font-size: 16px;
  color: var(--mb-muted);
  margin-top: 10px;
  font-weight: 600;
}

.instructions {
  background: var(--mb-panel);
  border: 1px solid var(--mb-line);
  border-radius: var(--mb-radius);
  padding: 18px;
  margin-bottom: 20px;
}
.inst-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  padding: 9px 0;
  border-bottom: 1px solid var(--mb-line);
}
.inst-item:last-child { border-bottom: none; }
.inst-icon { font-size: 20px; }

.win-target {
  background: var(--mb-panel);
  border: 1px solid var(--mb-line);
  border-radius: var(--mb-radius);
  padding: 14px 18px;
  margin-bottom: 24px;
}
.target-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 0;
}
.target-row span:first-child { color: var(--mb-muted); }

/* ===== HUD ===== */
#hud {
  z-index: 30;
  padding: 12px 16px;
  background: linear-gradient(to bottom, rgba(7,17,31,0.95), rgba(7,17,31,0.7));
  border-bottom: 1px solid var(--mb-line);
  flex-shrink: 0;
}

.hud-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.hud-row:last-child { margin-bottom: 0; }
.hud-row.metrics { gap: 12px; justify-content: space-between; }

.hud-pill {
  flex: 1;
  background: var(--mb-panel);
  border: 1px solid var(--mb-line);
  border-radius: 12px;
  padding: 10px 12px;
  text-align: center;
}
.hud-pill.cash { border-color: rgba(0,230,118,0.4); }

.hud-label {
  display: block;
  font-size: 9px;
  font-weight: 800;
  color: var(--mb-muted);
  letter-spacing: 1.5px;
  margin-bottom: 4px;
}
.hud-value {
  display: block;
  font-size: 20px;
  font-weight: 900;
  color: var(--mb-white);
}
#streak-val { color: var(--mb-gold); }
#cash-val { color: var(--mb-green-soft); }

.metric { text-align: center; }
.metric-label {
  display: block;
  font-size: 9px;
  font-weight: 800;
  color: var(--mb-muted);
  letter-spacing: 1px;
}
.metric-value {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: var(--mb-white);
  margin-top: 2px;
}
.metric-value.danger { color: var(--mb-red); }
.metric-value.good { color: var(--mb-green); }

/* ===== GAME SCREEN ===== */
#game-screen {
  position: relative;
  padding-top: 110px;
  justify-content: flex-start;
}

.event-banner {
  background: linear-gradient(90deg, rgba(251,113,133,0.2), rgba(251,113,133,0.05));
  border-left: 3px solid var(--mb-red);
  padding: 12px 16px;
  margin: 0 0 14px;
  border-radius: 0 12px 12px 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--mb-red);
  animation: slideIn 0.3s var(--mb-spring);
}
.event-banner.good {
  background: linear-gradient(90deg, rgba(0,230,118,0.2), rgba(0,230,118,0.05));
  border-left-color: var(--mb-green);
  color: var(--mb-green);
}
.event-banner.gold {
  background: linear-gradient(90deg, rgba(251,191,36,0.2), rgba(251,191,36,0.05));
  border-left-color: var(--mb-gold);
  color: var(--mb-gold);
}

@keyframes slideIn {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* ===== PHASE PANELS ===== */
.phase-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: popIn 0.25s var(--mb-spring);
}
@keyframes popIn {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.phase-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}
.phase-icon { font-size: 24px; }
.phase-title {
  font-size: 20px;
  font-weight: 900;
  color: var(--mb-white);
  letter-spacing: -0.5px;
}

/* ===== SUPPLIERS ===== */
.suppliers-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.supplier-card {
  background: var(--mb-panel);
  border: 1px solid var(--mb-line);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  overflow: hidden;
}
.supplier-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  background: var(--mb-green);
  opacity: 0;
  transition: opacity 0.15s;
}
.supplier-card:hover::before, .supplier-card:active::before { opacity: 1; }
.supplier-card:hover {
  border-color: rgba(105, 240, 174, 0.5);
  transform: translateX(4px);
}
.supplier-card:active { transform: scale(0.98); }
.supplier-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}
.supplier-card.locked:hover { transform: none; border-color: var(--mb-line); }
.supplier-card.locked::before { display: none; }

.supplier-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.supplier-tier {
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.tier-budget { background: rgba(56,189,248,0.15); color: var(--mb-blue); }
.tier-standard { background: rgba(0,230,118,0.15); color: var(--mb-green); }
.tier-premium { background: rgba(251,191,36,0.15); color: var(--mb-gold); }
.tier-wholesale { background: rgba(167,139,250,0.15); color: var(--mb-purple); }

.supplier-name {
  font-size: 17px;
  font-weight: 800;
  color: var(--mb-white);
}
.supplier-desc {
  font-size: 13px;
  color: var(--mb-muted);
  margin-bottom: 10px;
  line-height: 1.4;
}
.supplier-stats {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}
.supplier-stat {
  font-size: 12px;
  font-weight: 700;
}
.supplier-stat .stat-label { color: var(--mb-muted); margin-right: 4px; }
.supplier-stat .stat-value { color: var(--mb-white); }

/* ===== PRICE / ADS CARDS ===== */
.price-card, .ads-card {
  background: var(--mb-panel);
  border: 1px solid var(--mb-line);
  border-radius: var(--mb-radius);
  padding: 18px;
}

.price-info, .ads-info {

exec
/bin/zsh -lc "sed -n '1,260p' GAME_BRIEF.md && sed -n '1,260p' MONEYBOT_GAME_QA.md" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
# E-commerce Empire — Game Brief

## 1. Game Snapshot

- **Title:** E-commerce Empire
- **One-line pitch:** Run an online store from first sale to empire.
- **Target player:** Anyone curious about business cashflow and pricing strategy
- **Session length:** 3–5 minutes
- **Platform:** mobile first, desktop supported
- **Status:** elite target

## 2. Money Concept

- **Primary concept:** cashflow management, pricing psychology, inventory risk
- **What the player learns through play:** You pay suppliers before customers pay you. Price too high = low conversion. Price too low = no margin. Overstock = carrying costs. Stockout = lost sales forever.
- **What the player is rewarded for:** Balanced inventory, smart pricing, profitable ad spend
- **What misconception the game corrects:** Revenue ≠ profit. More sales can bankrupt you if margins and inventory are wrong.

## 3. Core Loop

> The player repeatedly sources products, sets prices, runs ads, and ships orders each day, so they can grow profit and cash, while avoiding stockouts and cashflow death.

## 4. Controls

- **Mobile:** Tap cards to choose daily actions. Tap sliders/buttons to set price and ad budget.
- **Desktop:** Same — tap/click.
- **Accessibility:** Large tap targets, high contrast, clear labels.

## 5. Systems

- **Scoring:** Profit dollars + units sold
- **Progression:** Days advance, reputation grows, better suppliers unlock
- **Difficulty curve:** Seasonal demand spikes, rising ad costs, supplier minimums increase
- **Win condition:** $500K profit OR 50K units sold
- **Loss condition:** Cash hits $0
- **Replay hook:** Try different pricing/ad strategies. Beat your best day count.

## 6. MoneyBot Brand

- **Mascot role:** coach — appears on start and win/loss with tips
- **MoneyBot colors:** full dark theme, #00E676 green accent
- **Signature MoneyBot moment:** mascot celebrates a cashflow-positive streak; warns when runway (cash) gets low
- **Assets:** CSS/SVG icons, no external dependencies

## 7. Screens

- Start/onboarding
- Gameplay (day loop: source → price → ads → ship → results)
- Pause (not needed — turn-based)
- Win
- Loss

## 8. Polish Targets

- Score/cash popovers on daily results
- Smooth screen transitions
- Animated HUD value changes
- Event banner slide-in
- Progress meter to win target
- Card hover/active states
- Streak flame for profitable days

## 9. Technical Plan

- **Files:** index.html, s.css, g.js
- **State model:** single state object with day, cash, inventory, reputation, daily log
- **Rendering:** DOM-based, screen switching with .active class
- **Responsive:** max-width 480px shell, mobile-first
- **Test plan:** play through to win and loss, check mobile viewport

## 10. Done Criteria

- [ ] Loads in browser
- [ ] Works on mobile viewport
- [ ] Complete game loop
- [ ] Win/loss/restart states
- [ ] Money concept is mechanical, not just text
- [ ] MoneyBot brand is clear
- [ ] No placeholder slop
- [ ] No console errors
- [ ] Codex challenge run
- [ ] Known issues documented
# MoneyBot Game QA

Game directory: `/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire`
Generated: 2026-05-19T00:35:07Z

## Required Files
- [PASS] index.html exists
- [FAIL] style.css missing
- [FAIL] game.js missing

## Brand And Product Checks
- [PASS] MoneyBot green token or value
- [PASS] Money concept language
- [PASS] Win/loss/restart state
- [PASS] Mobile viewport
- [PASS] Touch or pointer support
- [PASS] Animation or feedback

## Placeholder/Slop Scan
- [WARN] Placeholder-like text found; inspect before handoff.
- [WARN] Emoji count is 19. Replace primary UI/game art with MoneyBot assets.

## Browser Smoke Test
- [PASS] Browser server loaded: http://127.0.0.1:5199/

## Codex Challenge

exec
/bin/zsh -lc "find .. -path '*references/moneybot-games*' -maxdepth 5 -type f -print" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
exec
/bin/zsh -lc "sed -n '281,620p' g.js" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
  function initAdsPhase() {
    const slider = $('ad-slider');
    slider.value = state.adBudget;
    updateAdsDisplay();
    slider.oninput = updateAdsDisplay;
    $('btn-confirm-ads').onclick = runDay;
  }

  function updateAdsDisplay() {
    state.adBudget = parseInt($('ad-slider').value);
    $('ad-budget').textContent = fmtMoney(state.adBudget);

    // Reach = budget * CPM factor (diminishing returns)
    let cpm = 8; // cost per 1000 impressions
    if (state.adBudget > 500) cpm = 10;
    if (state.adBudget > 1000) cpm = 14;
    if (state.adBudget > 1500) cpm = 20;

    // Event: ad costs jump
    if (state.todayEvent && state.todayEvent.effect === 'adcost') {
      cpm *= 1.4;
    }

    const reach = Math.round((state.adBudget / cpm) * 1000);
    $('ad-reach').textContent = fmtNum(reach);

    // Visitors = reach * CTR (click-through rate)
    const ctr = 0.035 + (state.reputation / 1000); // 3.5% base + reputation bonus
    const visitors = Math.round(reach * ctr);
    $('ad-visitors').textContent = fmtNum(visitors);
  }

  // ===== RUN DAY =====
  function runDay() {
    const s = state.selectedSupplier;
    const orderCost = state.orderQty * s.cost;

    // Pay supplier upfront
    state.cash -= orderCost;

    // Add to inventory (with lead time)
    if (s.leadTime === 0) {
      state.inventory += state.orderQty;
    } else {
      state.inventoryIncoming.push({
        units: state.orderQty,
        arrivesDay: state.day + s.leadTime,
      });
    }

    // Calculate visitors
    let cpm = 8;
    if (state.adBudget > 500) cpm = 10;
    if (state.adBudget > 1000) cpm = 14;
    if (state.adBudget > 1500) cpm = 20;
    if (state.todayEvent && state.todayEvent.effect === 'adcost') cpm *= 1.4;

    let reach = Math.round((state.adBudget / cpm) * 1000);
    let visitors = Math.round(reach * (0.035 + state.reputation / 1000));

    // Event effects
    if (state.todayEvent) {
      if (state.todayEvent.effect === 'viral') visitors = Math.round(visitors * 1.3);
      if (state.todayEvent.effect === 'influencer') visitors += 500;
      if (state.todayEvent.effect === 'processor') visitors = Math.round(visitors * 0.8);
    }

    // Conversion rate
    const marketPrice = s.cost * 3;
    const ratio = state.price / marketPrice;
    let conversion = 0.12 / Math.pow(ratio, 1.8);
    conversion = Math.max(0.005, Math.min(0.30, conversion));
    conversion *= (0.7 + s.quality * 0.3);
    conversion *= (0.8 + (state.rating / 5) * 0.2);
    conversion *= state.season.multiplier;

    let orders = Math.min(state.inventory, Math.round(visitors * conversion));

    // Event: corporate bulk order
    if (state.todayEvent && state.todayEvent.effect === 'corporate') {
      const extra = Math.min(state.inventory - orders, 50);
      orders += extra;
    }

    // Revenue
    const revenue = orders * state.price;
    state.cash += revenue;
    state.totalRevenue += revenue;
    state.totalUnitsSold += orders;
    state.inventory -= orders;

    // Shipping costs
    let shippingCost = orders * SHIPPING_COST_PER_UNIT;
    if (state.todayEvent && state.todayEvent.effect === 'shipping') shippingCost *= 1.5;
    state.cash -= shippingCost;

    // Returns
    let returnRate = BASE_RETURN_RATE * (1.6 - s.quality); // lower quality = more returns
    if (state.todayEvent && state.todayEvent.effect === 'love') returnRate *= 0.5;
    const returns = Math.round(orders * returnRate);
    const returnCost = returns * state.price; // refund full price
    state.cash -= returnCost;
    state.totalUnitsReturned += returns;
    // Returns hurt rating
    if (returns > 0) {
      state.rating = Math.max(1, state.rating - (returns / Math.max(1, orders)) * 0.3);
    }

    // Carrying cost for unsold inventory
    const carryingCost = state.inventory * CARRYING_COST_PER_UNIT;
    state.cash -= carryingCost;

    // Ad spend
    state.cash -= state.adBudget;

    // Reviews from satisfied customers
    const satisfied = orders - returns;
    const newReviews = Math.max(0, Math.round(satisfied * 0.05));
    let reviewDelta = 0;
    for (let i = 0; i < newReviews; i++) {
      // Review score depends on quality and price fairness
      const priceFairness = Math.max(0.3, Math.min(1, marketPrice / state.price));
      const reviewScore = (s.quality * 0.6 + priceFairness * 0.4) * 5;
      const clamped = Math.max(1, Math.min(5, reviewScore + (Math.random() - 0.5) * 1.5));
      reviewDelta += (clamped - state.rating) * REVIEW_WEIGHT;
    }
    if (newReviews > 0) {
      state.rating = Math.max(1, Math.min(5, state.rating + reviewDelta));
      state.reviewCount += newReviews;
    }

    // Reputation grows with sales
    state.reputation = Math.min(100, state.reputation + orders * 0.001);

    // Net profit for the day
    const netProfit = revenue - orderCost - shippingCost - returnCost - carryingCost - state.adBudget;
    state.totalProfit += netProfit;

    // Streak
    if (netProfit > 0) {
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
    } else {
      state.streak = 0;
    }

    // Log
    state.dailyLog.push({
      day: state.day,
      revenue,
      netProfit,
      orders,
      visitors,
      returns,
    });

    // Show results
    showResults({
      visitors,
      orders,
      revenue,
      adSpend: state.adBudget,
      shippingCost,
      returnCost,
      carryingCost,
      netProfit,
      inventory: state.inventory,
      newReviews,
    });
  }

  function showResults(r) {
    $('res-visitors').textContent = fmtNum(r.visitors);
    $('res-orders').textContent = fmtNum(r.orders);
    $('res-revenue').textContent = fmtMoney(r.revenue);
    $('res-adspend').textContent = '-' + fmtMoney(r.adSpend);
    $('res-shipping').textContent = '-' + fmtMoney(r.shippingCost);
    $('res-returns').textContent = '-' + fmtMoney(r.returnCost);
    $('res-carrying').textContent = '-' + fmtMoney(r.carryingCost);
    $('res-profit').textContent = (r.netProfit >= 0 ? '+' : '') + fmtMoney(r.netProfit);
    $('res-profit').className = r.netProfit >= 0 ? 'good' : 'danger';
    $('res-inventory').textContent = fmtNum(r.inventory);
    $('res-reviews').textContent = r.newReviews > 0 ? `${r.newReviews} new` : '0';

    const reviewFlash = $('review-flash');
    if (r.newReviews > 0) {
      const avgSentiment = state.rating >= 4 ? 'Customers love it!' : state.rating >= 3 ? 'Mixed reviews.' : 'Customers are unhappy.';
      reviewFlash.textContent = `⭐ Rating: ${state.rating.toFixed(1)} — ${avgSentiment}`;
      reviewFlash.className = 'review-flash ' + (state.rating >= 3.5 ? 'good' : 'bad');
      reviewFlash.classList.remove('hidden');
    } else {
      reviewFlash.classList.add('hidden');
    }

    $('btn-next-day').onclick = nextDay;
    showPhase('results');
  }

  // ===== NEXT DAY =====
  function nextDay() {
    state.day++;

    // Receive incoming inventory
    state.inventoryIncoming = state.inventoryIncoming.filter(item => {
      if (item.arrivesDay <= state.day) {
        state.inventory += item.units;
        return false;
      }
      return true;
    });

    // Check win/loss
    if (state.cash <= 0) {
      endGame(false);
      return;
    }
    if (state.totalProfit >= WIN_PROFIT || state.totalUnitsSold >= WIN_UNITS) {
      endGame(true);
      return;
    }

    updateSeason();
    rollEvent();
    updateHUD();
    showSeasonBanner();
    if (state.todayEvent) showEventBanner();
    showPhase('source');
    renderSuppliers();
  }

  // ===== PHASE MANAGEMENT =====
  function showPhase(phase) {
    ['source', 'price', 'ads', 'results'].forEach(p => {
      const el = $('phase-' + p);
      if (el) el.classList.add('hidden');
    });
    const active = $('phase-' + phase);
    if (active) {
      active.classList.remove('hidden');
      // Re-trigger animation
      active.style.animation = 'none';
      active.offsetHeight; // force reflow
      active.style.animation = '';
    }

    if (phase === 'price') initPricePhase();
    if (phase === 'ads') initAdsPhase();
  }

  // ===== END GAME =====
  function endGame(won) {
    state.gameOver = true;
    state.won = won;
    hud.classList.add('hidden');

    const statsHTML = `
      <div class="final-row"><span>Days</span><span>${state.day}</span></div>
      <div class="final-row"><span>Total Revenue</span><span>${fmtMoney(state.totalRevenue)}</span></div>
      <div class="final-row"><span>Total Profit</span><span class="${state.totalProfit >= 0 ? 'good' : 'danger'}">${fmtMoney(state.totalProfit)}</span></div>
      <div class="final-row"><span>Units Sold</span><span>${fmtNum(state.totalUnitsSold)}</span></div>
      <div class="final-row"><span>Returns</span><span>${fmtNum(state.totalUnitsReturned)}</span></div>
      <div class="final-row"><span>Final Rating</span><span>⭐ ${state.rating.toFixed(1)}</span></div>
      <div class="final-row"><span>Best Streak</span><span>${state.bestStreak} days</span></div>
    `;

    if (won) {
      $('win-stats').innerHTML = statsHTML;
      const tips = [
        'You mastered the cashflow cycle: buy low, sell smart, advertise wisely.',
        'Great job balancing inventory risk with growth!',
        'Your pricing strategy and ad spend were on point.',
      ];
      $('win-tip').textContent = tips[Math.floor(Math.random() * tips.length)];
      showScreen('win');
    } else {
      $('loss-stats').innerHTML = statsHTML;
      const tips = [
        'You ran out of cash. Try smaller orders and higher margins early on.',
        'Inventory carrying costs add up. Don\'t overstock!',
        'Price matters — too low and you bleed cash on shipping and ads.',
        'Start with Budget Direct, price at 3x cost, and keep ad spend under $300/day until you have cash.',
      ];
      $('loss-tip').textContent = tips[Math.floor(Math.random() * tips.length)];
      showScreen('loss');
    }
  }

  // ===== TOAST =====
  function showToast(msg) {
    // Simple toast using event banner
    const banner = $('event-banner');
    banner.textContent = msg;
    banner.className = 'event-banner';
    banner.classList.remove('hidden');
    setTimeout(() => {
      if (!state.todayEvent && state.season.name === 'Normal') {
        banner.classList.add('hidden');
      }
    }, 2000);
  }

  // ===== INIT =====
  function init() {
    // Reset state
    state = {
      day: 1,
      cash: START_CASH,
      inventory: 0,
      inventoryIncoming: [],
      totalProfit: 0,
      totalRevenue: 0,
      totalUnitsSold: 0,
      totalUnitsReturned: 0,
      rating: 3.0,
      reviewCount: 0,
      reputation: 0,
      streak: 0,
      bestStreak: 0,
      dailyLog: [],
      gameOver: false,
      won: false,
      selectedSupplier: null,
      orderQty: 0,
      price: 10,
      adBudget: 200,
      season: SEASONS[0],
      seasonDaysLeft: 0,
      todayEvent: null,
    };

    $('btn-start').onclick = startGame;
    $('btn-replay-win').onclick = startGame;
    $('btn-replay-loss').onclick = startGame;
  }

  function startGame() {
    init();
    hud.classList.remove('hidden');
    updateHUD();
    updateSeason();

exec
/bin/zsh -lc "sed -n '321,760p' s.css" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}
.price-row, .ads-row {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 700;
}
.price-row span:first-child, .ads-row span:first-child { color: var(--mb-muted); }
.price-value { font-weight: 900; font-size: 16px; }

.slider-wrap {
  margin-bottom: 14px;
}
input[type="range"] {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: var(--mb-ink-2);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--mb-green);
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,230,118,0.4);
}
input[type="range"]::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--mb-green);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 10px rgba(0,230,118,0.4);
}
.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--mb-muted);
  margin-top: 6px;
  font-weight: 700;
}

.conversion-est, .ad-tip {
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  padding: 10px;
  border-radius: 10px;
}
.conversion-est { background: rgba(0,230,118,0.08); color: var(--mb-green); }
.ad-tip { background: rgba(56,189,248,0.08); color: var(--mb-blue); }

/* ===== RESULTS ===== */
.results-card {
  background: var(--mb-panel);
  border: 1px solid var(--mb-line);
  border-radius: var(--mb-radius);
  padding: 16px 20px;
}
.result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  font-size: 15px;
  font-weight: 600;
  border-bottom: 1px solid var(--mb-line);
}
.result-row:last-child { border-bottom: none; }
.result-row span:first-child { color: var(--mb-muted); }
.result-row span:last-child { font-weight: 900; font-size: 16px; }
.result-row.highlight {
  background: rgba(0,230,118,0.08);
  margin: 0 -20px;
  padding: 12px 20px;
  border-radius: 8px;
  border-bottom: none;
}
.result-row.highlight span:last-child { color: var(--mb-green); font-size: 18px; }

.review-flash {
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  padding: 10px;
  border-radius: 10px;
  animation: popIn 0.3s var(--mb-spring);
}
.review-flash.good {
  background: rgba(0,230,118,0.1);
  color: var(--mb-green);
  border: 1px solid rgba(0,230,118,0.3);
}
.review-flash.bad {
  background: rgba(251,113,133,0.1);
  color: var(--mb-red);
  border: 1px solid rgba(251,113,133,0.3);
}

/* ===== WIN / LOSS ===== */
#win-screen, #loss-screen {
  justify-content: center;
  text-align: center;
}
#win-screen h2, #loss-screen h2 {
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 20px;
}

.final-stats {
  background: var(--mb-panel);
  border: 1px solid var(--mb-line);
  border-radius: var(--mb-radius);
  padding: 16px 20px;
  margin-bottom: 20px;
}
.final-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 15px;
  font-weight: 600;
  border-bottom: 1px solid var(--mb-line);
}
.final-row:last-child { border-bottom: none; }
.final-row span:first-child { color: var(--mb-muted); }
.final-row span:last-child { font-weight: 900; font-size: 16px; }

.subtitle {
  font-size: 16px;
  color: var(--mb-muted);
  margin-bottom: 24px;
}

.tip-box {
  background: rgba(56,189,248,0.1);
  border: 1px solid rgba(56,189,248,0.3);
  border-radius: 12px;
  padding: 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--mb-blue);
  line-height: 1.4;
  margin-bottom: 20px;
}

/* ===== BUTTONS ===== */
.btn-primary {
  background: linear-gradient(135deg, var(--mb-green-soft), var(--mb-green-dark));
  color: var(--mb-ink);
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  font-size: 18px;
  padding: 18px;
  border-radius: 14px;
  border: none;
  width: 100%;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 8px 25px rgba(0,230,118,0.25);
  transition: transform 0.1s;
  margin-top: 8px;
}
.btn-primary:active { transform: scale(0.96); }

.good { color: var(--mb-green) !important; }
.danger { color: var(--mb-red) !important; }

/* ===== PROGRESS BAR ===== */
.progress-wrap {
  background: var(--mb-ink-2);
  border-radius: 10px;
  height: 10px;
  overflow: hidden;
  margin: 8px 0 16px;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--mb-green-soft), var(--mb-green));
  border-radius: 10px;
  transition: width 0.5s var(--mb-spring);
}

/* ===== MISC ===== */
.hidden { display: none !important; }

.screen.active { display: flex !important; }

exec
/bin/zsh -lc "nl -ba g.js | sed -n '1,620p'" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
exec
/bin/zsh -lc "nl -ba index.html | sed -n '1,230p'" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
     1	<!DOCTYPE html>
     2	<html lang="en">
     3	<head>
     4	    <meta charset="UTF-8">
     5	    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
     6	    <title>E-commerce Empire</title>
     7	    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet">
     8	    <link rel="stylesheet" href="s.css?v=4">
     9	</head>
    10	<body>
    11	    <div id="app">
    12	        <!-- HUD -->
    13	        <header id="hud" class="hidden">
    14	            <div class="hud-row">
    15	                <div class="hud-pill">
    16	                    <span class="hud-label">DAY</span>
    17	                    <span id="day-val" class="hud-value">1</span>
    18	                </div>
    19	                <div class="hud-pill">
    20	                    <span class="hud-label">STREAK</span>
    21	                    <span id="streak-val" class="hud-value">0</span>
    22	                </div>
    23	                <div class="hud-pill cash">
    24	                    <span class="hud-label">CASH</span>
    25	                    <span id="cash-val" class="hud-value">$10K</span>
    26	                </div>
    27	            </div>
    28	            <div class="hud-row metrics">
    29	                <div class="metric">
    30	                    <span class="metric-label">INVENTORY</span>
    31	                    <span id="inv-val" class="metric-value">0</span>
    32	                </div>
    33	                <div class="metric">
    34	                    <span class="metric-label">REVENUE</span>
    35	                    <span id="rev-val" class="metric-value">$0</span>
    36	                </div>
    37	                <div class="metric">
    38	                    <span class="metric-label">PROFIT</span>
    39	                    <span id="profit-val" class="metric-value">$0</span>
    40	                </div>
    41	                <div class="metric">
    42	                    <span class="metric-label">RATING</span>
    43	                    <span id="rating-val" class="metric-value">⭐ 3.0</span>
    44	                </div>
    45	            </div>
    46	        </header>
    47	
    48	        <!-- Start Screen -->
    49	        <div id="start-screen" class="screen active">
    50	            <div class="logo-area">
    51	                <div class="mascot">🛒</div>
    52	                <h1>E-COMMERCE<br><span class="highlight">EMPIRE</span></h1>
    53	                <p class="tagline">Source. Price. Advertise. Ship. Profit.</p>
    54	            </div>
    55	            <div class="instructions">
    56	                <div class="inst-item"><span class="inst-icon">📦</span> Source products from suppliers</div>
    57	                <div class="inst-item"><span class="inst-icon">🏷️</span> Set prices — too high kills sales</div>
    58	                <div class="inst-item"><span class="inst-icon">📢</span> Run ads — budget vs reach</div>
    59	                <div class="inst-item"><span class="inst-icon">📊</span> Watch cashflow — you pay first, customers pay later</div>
    60	            </div>
    61	            <div class="win-target">
    62	                <div class="target-row"><span>Win:</span> <span class="good">$500K profit</span> or <span class="good">50K units sold</span></div>
    63	                <div class="target-row"><span>Lose:</span> <span class="danger">Cash hits $0</span></div>
    64	            </div>
    65	            <button id="btn-start" class="btn-primary">Open Store</button>
    66	        </div>
    67	
    68	        <!-- Game Screen -->
    69	        <div id="game-screen" class="screen">
    70	            <!-- Season / Event Banner -->
    71	            <div id="event-banner" class="event-banner hidden"></div>
    72	
    73	            <!-- Phase: Source -->
    74	            <div id="phase-source" class="phase-panel">
    75	                <div class="phase-header">
    76	                    <span class="phase-icon">📦</span>
    77	                    <span class="phase-title">Source Products</span>
    78	                </div>
    79	                <div class="suppliers-grid" id="suppliers-list"></div>
    80	            </div>
    81	
    82	            <!-- Phase: Price -->
    83	            <div id="phase-price" class="phase-panel hidden">
    84	                <div class="phase-header">
    85	                    <span class="phase-icon">🏷️</span>
    86	                    <span class="phase-title">Set Price</span>
    87	                </div>
    88	                <div class="price-card">
    89	                    <div class="price-info">
    90	                        <div class="price-row"><span>Unit Cost</span><span id="unit-cost" class="price-value">$5.00</span></div>
    91	                        <div class="price-row"><span>Your Price</span><span id="your-price" class="price-value good">$10.00</span></div>
    92	                        <div class="price-row"><span>Margin</span><span id="margin-pct" class="price-value">50%</span></div>
    93	                    </div>
    94	                    <div class="slider-wrap">
    95	                        <input type="range" id="price-slider" min="1" max="50" step="0.5" value="10">
    96	                        <div class="slider-labels"><span>$1</span><span>$50</span></div>
    97	                    </div>
    98	                    <div class="conversion-est">
    99	                        <span>Est. conversion:</span>
   100	                        <span id="conversion-rate" class="good">8.5%</span>
   101	                    </div>
   102	                </div>
   103	                <button id="btn-confirm-price" class="btn-primary">Set Price</button>
   104	            </div>
   105	
   106	            <!-- Phase: Ads -->
   107	            <div id="phase-ads" class="phase-panel hidden">
   108	                <div class="phase-header">
   109	                    <span class="phase-icon">📢</span>
   110	                    <span class="phase-title">Run Ads</span>
   111	                </div>
   112	                <div class="ads-card">
   113	                    <div class="ads-info">
   114	                        <div class="ads-row"><span>Daily Budget</span><span id="ad-budget" class="price-value">$200</span></div>
   115	                        <div class="ads-row"><span>Est. Reach</span><span id="ad-reach" class="price-value">2,000</span></div>
   116	                        <div class="ads-row"><span>Est. Visitors</span><span id="ad-visitors" class="price-value">170</span></div>
   117	                    </div>
   118	                    <div class="slider-wrap">
   119	                        <input type="range" id="ad-slider" min="0" max="2000" step="50" value="200">
   120	                        <div class="slider-labels"><span>$0</span><span>$2,000</span></div>
   121	                    </div>
   122	                    <div class="ad-tip">Higher budgets have diminishing returns. Test and learn.</div>
   123	                </div>
   124	                <button id="btn-confirm-ads" class="btn-primary">Launch Campaign</button>
   125	            </div>
   126	
   127	            <!-- Phase: Results -->
   128	            <div id="phase-results" class="phase-panel hidden">
   129	                <div class="phase-header">
   130	                    <span class="phase-icon">📊</span>
   131	                    <span class="phase-title">Daily Results</span>
   132	                </div>
   133	                <div class="results-card">
   134	                    <div class="result-row"><span>Visitors</span><span id="res-visitors">0</span></div>
   135	                    <div class="result-row"><span>Orders</span><span id="res-orders">0</span></div>
   136	                    <div class="result-row"><span>Revenue</span><span id="res-revenue">$0</span></div>
   137	                    <div class="result-row"><span>Ad Spend</span><span id="res-adspend" class="danger">-$0</span></div>
   138	                    <div class="result-row"><span>Shipping</span><span id="res-shipping" class="danger">-$0</span></div>
   139	                    <div class="result-row"><span>Returns</span><span id="res-returns" class="danger">-$0</span></div>
   140	                    <div class="result-row"><span>Carrying Cost</span><span id="res-carrying" class="danger">-$0</span></div>
   141	                    <div class="result-row highlight"><span>Net Profit</span><span id="res-profit">$0</span></div>
   142	                    <div class="result-row"><span>Inventory Left</span><span id="res-inventory">0</span></div>
   143	                    <div class="result-row"><span>New Reviews</span><span id="res-reviews">0</span></div>
   144	                </div>
   145	                <div id="review-flash" class="review-flash hidden"></div>
   146	                <button id="btn-next-day" class="btn-primary">Next Day →</button>
   147	            </div>
   148	        </div>
   149	
   150	        <!-- Win Screen -->
   151	        <div id="win-screen" class="screen">
   152	            <div class="mascot big">🏆</div>
   153	            <h1>EMPIRE<br><span class="highlight">BUILT</span></h1>
   154	            <p class="subtitle">You mastered e-commerce cashflow.</p>
   155	            <div class="final-stats" id="win-stats"></div>
   156	            <div class="tip-box" id="win-tip"></div>
   157	            <button id="btn-replay-win" class="btn-primary">Play Again</button>
   158	        </div>
   159	
   160	        <!-- Loss Screen -->
   161	        <div id="loss-screen" class="screen">
   162	            <div class="mascot big">💸</div>
   163	            <h1 class="danger">OUT OF<br>CASH</h1>
   164	            <p class="subtitle">Your store couldn't stay afloat.</p>
   165	            <div class="final-stats" id="loss-stats"></div>
   166	            <div class="tip-box" id="loss-tip"></div>
   167	            <button id="btn-replay-loss" class="btn-primary">Try Again</button>
   168	        </div>
   169	    </div>
   170	
   171	    <script src="g.js?v=4"></script>
   172	</body>
   173	</html>

 succeeded in 0ms:
     1	(function() {
     2	  'use strict';
     3	
     4	  // ===== CONSTANTS =====
     5	  const WIN_PROFIT = 500000;
     6	  const WIN_UNITS = 50000;
     7	  const START_CASH = 10000;
     8	  const CARRYING_COST_PER_UNIT = 0.15; // per day per unsold unit
     9	  const SHIPPING_COST_PER_UNIT = 2.50;
    10	  const BASE_RETURN_RATE = 0.05; // 5% returns
    11	  const REVIEW_WEIGHT = 0.08; // each review affects rating by this much
    12	
    13	  const SEASONS = [
    14	    { name: 'Normal', multiplier: 1.0, color: '' },
    15	    { name: 'Back to School', multiplier: 1.4, color: 'good' },
    16	    { name: 'Black Friday', multiplier: 2.2, color: 'gold' },
    17	    { name: 'Holiday Rush', multiplier: 1.8, color: 'gold' },
    18	    { name: 'Summer Slump', multiplier: 0.7, color: '' },
    19	  ];
    20	
    21	  const SUPPLIERS = [
    22	    {
    23	      id: 'budget',
    24	      name: 'Budget Direct',
    25	      tier: 'budget',
    26	      cost: 3.00,
    27	      quality: 0.6,
    28	      minOrder: 50,
    29	      maxOrder: 500,
    30	      leadTime: 0,
    31	      desc: 'Cheap, slow shipping, higher returns. Good for testing.',
    32	      unlockDay: 0,
    33	    },
    34	    {
    35	      id: 'standard',
    36	      name: 'Standard Wholesale',
    37	      tier: 'standard',
    38	      cost: 5.00,
    39	      quality: 0.85,
    40	      minOrder: 100,
    41	      maxOrder: 2000,
    42	      leadTime: 0,
    43	      desc: 'Balanced cost and quality. The safe choice.',
    44	      unlockDay: 0,
    45	    },
    46	    {
    47	      id: 'premium',
    48	      name: 'Premium Goods Co.',
    49	      tier: 'premium',
    50	      cost: 12.00,
    51	      quality: 0.95,
    52	      minOrder: 200,
    53	      maxOrder: 5000,
    54	      leadTime: 1,
    55	      desc: 'High quality, low returns. Customers love it.',
    56	      unlockDay: 7,
    57	    },
    58	    {
    59	      id: 'wholesale',
    60	      name: 'Global Wholesale Hub',
    61	      tier: 'wholesale',
    62	      cost: 8.00,
    63	      quality: 0.80,
    64	      minOrder: 1000,
    65	      maxOrder: 20000,
    66	      leadTime: 2,
    67	      desc: 'Massive volume at lower per-unit cost. Requires scale.',
    68	      unlockDay: 14,
    69	    },
    70	  ];
    71	
    72	  const EVENTS = [
    73	    { text: '📦 Supply chain delay! New inventory arrives 1 day late.', effect: 'delay', good: false },
    74	    { text: '📈 Trending on social! Demand +30% today.', effect: 'viral', good: true },
    75	    { text: '🚚 Shipping rates spike! Shipping costs +50% today.', effect: 'shipping', good: false },
    76	    { text: '⭐ Influencer shoutout! Free visitors today.', effect: 'influencer', good: true },
    77	    { text: '💳 Payment processor down! 20% of sales lost.', effect: 'processor', good: false },
    78	    { text: '🎁 Bulk corporate order! +50 units sold instantly.', effect: 'corporate', good: true },
    79	    { text: '📉 Ad costs jump! CPM +40% today.', effect: 'adcost', good: false },
    80	    { text: '🌟 Customer love week! Reviews are extra positive.', effect: 'love', good: true },
    81	  ];
    82	
    83	  // ===== STATE =====
    84	  let state = {
    85	    day: 1,
    86	    cash: START_CASH,
    87	    inventory: 0,
    88	    inventoryIncoming: [], // { units, arrivesDay }
    89	    totalProfit: 0,
    90	    totalRevenue: 0,
    91	    totalUnitsSold: 0,
    92	    totalUnitsReturned: 0,
    93	    rating: 3.0,
    94	    reviewCount: 0,
    95	    reputation: 0, // 0-100, unlocks better suppliers
    96	    streak: 0,
    97	    bestStreak: 0,
    98	    dailyLog: [],
    99	    gameOver: false,
   100	    won: false,
   101	    // Current day decisions
   102	    selectedSupplier: null,
   103	    orderQty: 0,
   104	    price: 10,
   105	    adBudget: 200,
   106	    // Season
   107	    season: SEASONS[0],
   108	    seasonDaysLeft: 0,
   109	    // Event
   110	    todayEvent: null,
   111	  };
   112	
   113	  // ===== DOM =====
   114	  const $ = id => document.getElementById(id);
   115	  const screens = {
   116	    start: $('start-screen'),
   117	    game: $('game-screen'),
   118	    win: $('win-screen'),
   119	    loss: $('loss-screen'),
   120	  };
   121	  const hud = $('hud');
   122	
   123	  function fmtMoney(n) {
   124	    if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
   125	    if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
   126	    return '$' + Math.round(n).toLocaleString();
   127	  }
   128	
   129	  function fmtNum(n) {
   130	    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
   131	    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
   132	    return n.toLocaleString();
   133	  }
   134	
   135	  // ===== SCREEN MANAGEMENT =====
   136	  function showScreen(name) {
   137	    Object.values(screens).forEach(s => s.classList.remove('active'));
   138	    screens[name].classList.add('active');
   139	  }
   140	
   141	  // ===== HUD =====
   142	  function updateHUD() {
   143	    $('day-val').textContent = state.day;
   144	    $('streak-val').textContent = state.streak;
   145	    $('cash-val').textContent = fmtMoney(state.cash);
   146	    $('inv-val').textContent = fmtNum(state.inventory);
   147	    $('rev-val').textContent = fmtMoney(state.totalRevenue);
   148	    $('profit-val').textContent = fmtMoney(state.totalProfit);
   149	    $('profit-val').className = 'metric-value ' + (state.totalProfit >= 0 ? 'good' : 'danger');
   150	    $('rating-val').textContent = '⭐ ' + state.rating.toFixed(1);
   151	  }
   152	
   153	  // ===== SEASONS =====
   154	  function pickSeason() {
   155	    const roll = Math.random();
   156	    if (roll < 0.45) return SEASONS[0]; // Normal
   157	    if (roll < 0.60) return SEASONS[4]; // Summer Slump
   158	    if (roll < 0.75) return SEASONS[1]; // Back to School
   159	    if (roll < 0.88) return SEASONS[3]; // Holiday Rush
   160	    return SEASONS[2]; // Black Friday
   161	  }
   162	
   163	  function updateSeason() {
   164	    if (state.seasonDaysLeft <= 0) {
   165	      state.season = pickSeason();
   166	      state.seasonDaysLeft = 3 + Math.floor(Math.random() * 5); // 3-7 days
   167	    }
   168	    state.seasonDaysLeft--;
   169	  }
   170	
   171	  function showSeasonBanner() {
   172	    const banner = $('event-banner');
   173	    if (state.season.name !== 'Normal') {
   174	      banner.textContent = `🌟 ${state.season.name}: Demand ${state.season.multiplier >= 1 ? '+' : ''}${Math.round((state.season.multiplier - 1) * 100)}%`;
   175	      banner.className = 'event-banner ' + (state.season.color || '');
   176	      banner.classList.remove('hidden');
   177	    } else {
   178	      banner.classList.add('hidden');
   179	    }
   180	  }
   181	
   182	  // ===== EVENTS =====
   183	  function rollEvent() {
   184	    if (Math.random() < 0.25) {
   185	      state.todayEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
   186	    } else {
   187	      state.todayEvent = null;
   188	    }
   189	  }
   190	
   191	  function showEventBanner() {
   192	    if (!state.todayEvent) return;
   193	    const banner = $('event-banner');
   194	    banner.textContent = state.todayEvent.text;
   195	    banner.className = 'event-banner ' + (state.todayEvent.good ? 'good' : '');
   196	    banner.classList.remove('hidden');
   197	  }
   198	
   199	  // ===== PHASE: SOURCE =====
   200	  function renderSuppliers() {
   201	    const container = $('suppliers-list');
   202	    container.innerHTML = '';
   203	
   204	    SUPPLIERS.forEach(s => {
   205	      const locked = state.day < s.unlockDay;
   206	      const card = document.createElement('div');
   207	      card.className = 'supplier-card' + (locked ? ' locked' : '');
   208	      card.innerHTML = `
   209	        <div class="supplier-header">
   210	          <span class="supplier-tier tier-${s.tier}">${s.tier}</span>
   211	          <span class="supplier-name">${s.name}</span>
   212	        </div>
   213	        <div class="supplier-desc">${s.desc}</div>
   214	        <div class="supplier-stats">
   215	          <span class="supplier-stat"><span class="stat-label">Cost:</span><span class="stat-value">$${s.cost.toFixed(2)}</span></span>
   216	          <span class="supplier-stat"><span class="stat-label">Quality:</span><span class="stat-value">${Math.round(s.quality * 100)}%</span></span>
   217	          <span class="supplier-stat"><span class="stat-label">Min:</span><span class="stat-value">${s.minOrder}</span></span>
   218	          <span class="supplier-stat"><span class="stat-label">Max:</span><span class="stat-value">${fmtNum(s.maxOrder)}</span></span>
   219	          ${s.leadTime > 0 ? `<span class="supplier-stat"><span class="stat-label">Lead:</span><span class="stat-value">${s.leadTime}d</span></span>` : ''}
   220	        </div>
   221	      `;
   222	      if (!locked) {
   223	        card.addEventListener('click', () => selectSupplier(s));
   224	      }
   225	      container.appendChild(card);
   226	    });
   227	  }
   228	
   229	  function selectSupplier(supplier) {
   230	    state.selectedSupplier = supplier;
   231	    // Default order: min order or affordable max
   232	    const maxAfford = Math.floor(state.cash / supplier.cost);
   233	    state.orderQty = Math.min(supplier.maxOrder, Math.max(supplier.minOrder, Math.min(maxAfford, supplier.minOrder * 2)));
   234	    if (state.orderQty < supplier.minOrder) {
   235	      // Can't afford even minimum
   236	      showToast('Not enough cash for minimum order!');
   237	      return;
   238	    }
   239	    showPhase('price');
   240	  }
   241	
   242	  // ===== PHASE: PRICE =====
   243	  function initPricePhase() {
   244	    const s = state.selectedSupplier;
   245	    const slider = $('price-slider');
   246	    // Set reasonable default price: 2.5x cost minimum
   247	    const defaultPrice = Math.max(10, s.cost * 2.5);
   248	    state.price = Math.round(defaultPrice * 2) / 2;
   249	    slider.min = Math.max(1, s.cost * 1.2);
   250	    slider.max = Math.max(50, s.cost * 8);
   251	    slider.step = 0.5;
   252	    slider.value = state.price;
   253	    updatePriceDisplay();
   254	    slider.oninput = updatePriceDisplay;
   255	    $('btn-confirm-price').onclick = () => showPhase('ads');
   256	  }
   257	
   258	  function updatePriceDisplay() {
   259	    state.price = parseFloat($('price-slider').value);
   260	    const s = state.selectedSupplier;
   261	    $('unit-cost').textContent = '$' + s.cost.toFixed(2);
   262	    $('your-price').textContent = '$' + state.price.toFixed(2);
   263	    const margin = ((state.price - s.cost) / state.price) * 100;
   264	    $('margin-pct').textContent = margin.toFixed(1) + '%';
   265	    $('margin-pct').className = 'price-value ' + (margin > 30 ? 'good' : margin > 10 ? '' : 'danger');
   266	
   267	    // Conversion estimate based on price relative to "market" price
   268	    const marketPrice = s.cost * 3;
   269	    const ratio = state.price / marketPrice;
   270	    let conversion = 0.12 / Math.pow(ratio, 1.8);
   271	    conversion = Math.max(0.005, Math.min(0.25, conversion));
   272	    // Quality bonus
   273	    conversion *= (0.7 + s.quality * 0.3);
   274	    // Rating bonus
   275	    conversion *= (0.8 + (state.rating / 5) * 0.2);
   276	
   277	    $('conversion-rate').textContent = (conversion * 100).toFixed(1) + '%';
   278	  }
   279	
   280	  // ===== PHASE: ADS =====
   281	  function initAdsPhase() {
   282	    const slider = $('ad-slider');
   283	    slider.value = state.adBudget;
   284	    updateAdsDisplay();
   285	    slider.oninput = updateAdsDisplay;
   286	    $('btn-confirm-ads').onclick = runDay;
   287	  }
   288	
   289	  function updateAdsDisplay() {
   290	    state.adBudget = parseInt($('ad-slider').value);
   291	    $('ad-budget').textContent = fmtMoney(state.adBudget);
   292	
   293	    // Reach = budget * CPM factor (diminishing returns)
   294	    let cpm = 8; // cost per 1000 impressions
   295	    if (state.adBudget > 500) cpm = 10;
   296	    if (state.adBudget > 1000) cpm = 14;
   297	    if (state.adBudget > 1500) cpm = 20;
   298	
   299	    // Event: ad costs jump
   300	    if (state.todayEvent && state.todayEvent.effect === 'adcost') {
   301	      cpm *= 1.4;
   302	    }
   303	
   304	    const reach = Math.round((state.adBudget / cpm) * 1000);
   305	    $('ad-reach').textContent = fmtNum(reach);
   306	
   307	    // Visitors = reach * CTR (click-through rate)
   308	    const ctr = 0.035 + (state.reputation / 1000); // 3.5% base + reputation bonus
   309	    const visitors = Math.round(reach * ctr);
   310	    $('ad-visitors').textContent = fmtNum(visitors);
   311	  }
   312	
   313	  // ===== RUN DAY =====
   314	  function runDay() {
   315	    const s = state.selectedSupplier;
   316	    const orderCost = state.orderQty * s.cost;
   317	
   318	    // Pay supplier upfront
   319	    state.cash -= orderCost;
   320	
   321	    // Add to inventory (with lead time)
   322	    if (s.leadTime === 0) {
   323	      state.inventory += state.orderQty;
   324	    } else {
   325	      state.inventoryIncoming.push({
   326	        units: state.orderQty,
   327	        arrivesDay: state.day + s.leadTime,
   328	      });
   329	    }
   330	
   331	    // Calculate visitors
   332	    let cpm = 8;
   333	    if (state.adBudget > 500) cpm = 10;
   334	    if (state.adBudget > 1000) cpm = 14;
   335	    if (state.adBudget > 1500) cpm = 20;
   336	    if (state.todayEvent && state.todayEvent.effect === 'adcost') cpm *= 1.4;
   337	
   338	    let reach = Math.round((state.adBudget / cpm) * 1000);
   339	    let visitors = Math.round(reach * (0.035 + state.reputation / 1000));
   340	
   341	    // Event effects
   342	    if (state.todayEvent) {
   343	      if (state.todayEvent.effect === 'viral') visitors = Math.round(visitors * 1.3);
   344	      if (state.todayEvent.effect === 'influencer') visitors += 500;
   345	      if (state.todayEvent.effect === 'processor') visitors = Math.round(visitors * 0.8);
   346	    }
   347	
   348	    // Conversion rate
   349	    const marketPrice = s.cost * 3;
   350	    const ratio = state.price / marketPrice;
   351	    let conversion = 0.12 / Math.pow(ratio, 1.8);
   352	    conversion = Math.max(0.005, Math.min(0.30, conversion));
   353	    conversion *= (0.7 + s.quality * 0.3);
   354	    conversion *= (0.8 + (state.rating / 5) * 0.2);
   355	    conversion *= state.season.multiplier;
   356	
   357	    let orders = Math.min(state.inventory, Math.round(visitors * conversion));
   358	
   359	    // Event: corporate bulk order
   360	    if (state.todayEvent && state.todayEvent.effect === 'corporate') {
   361	      const extra = Math.min(state.inventory - orders, 50);
   362	      orders += extra;
   363	    }
   364	
   365	    // Revenue
   366	    const revenue = orders * state.price;
   367	    state.cash += revenue;
   368	    state.totalRevenue += revenue;
   369	    state.totalUnitsSold += orders;
   370	    state.inventory -= orders;
   371	
   372	    // Shipping costs
   373	    let shippingCost = orders * SHIPPING_COST_PER_UNIT;
   374	    if (state.todayEvent && state.todayEvent.effect === 'shipping') shippingCost *= 1.5;
   375	    state.cash -= shippingCost;
   376	
   377	    // Returns
   378	    let returnRate = BASE_RETURN_RATE * (1.6 - s.quality); // lower quality = more returns
   379	    if (state.todayEvent && state.todayEvent.effect === 'love') returnRate *= 0.5;
   380	    const returns = Math.round(orders * returnRate);
   381	    const returnCost = returns * state.price; // refund full price
   382	    state.cash -= returnCost;
   383	    state.totalUnitsReturned += returns;
   384	    // Returns hurt rating
   385	    if (returns > 0) {
   386	      state.rating = Math.max(1, state.rating - (returns / Math.max(1, orders)) * 0.3);
   387	    }
   388	
   389	    // Carrying cost for unsold inventory
   390	    const carryingCost = state.inventory * CARRYING_COST_PER_UNIT;
   391	    state.cash -= carryingCost;
   392	
   393	    // Ad spend
   394	    state.cash -= state.adBudget;
   395	
   396	    // Reviews from satisfied customers
   397	    const satisfied = orders - returns;
   398	    const newReviews = Math.max(0, Math.round(satisfied * 0.05));
   399	    let reviewDelta = 0;
   400	    for (let i = 0; i < newReviews; i++) {
   401	      // Review score depends on quality and price fairness
   402	      const priceFairness = Math.max(0.3, Math.min(1, marketPrice / state.price));
   403	      const reviewScore = (s.quality * 0.6 + priceFairness * 0.4) * 5;
   404	      const clamped = Math.max(1, Math.min(5, reviewScore + (Math.random() - 0.5) * 1.5));
   405	      reviewDelta += (clamped - state.rating) * REVIEW_WEIGHT;
   406	    }
   407	    if (newReviews > 0) {
   408	      state.rating = Math.max(1, Math.min(5, state.rating + reviewDelta));
   409	      state.reviewCount += newReviews;
   410	    }
   411	
   412	    // Reputation grows with sales
   413	    state.reputation = Math.min(100, state.reputation + orders * 0.001);
   414	
   415	    // Net profit for the day
   416	    const netProfit = revenue - orderCost - shippingCost - returnCost - carryingCost - state.adBudget;
   417	    state.totalProfit += netProfit;
   418	
   419	    // Streak
   420	    if (netProfit > 0) {
   421	      state.streak++;
   422	      state.bestStreak = Math.max(state.bestStreak, state.streak);
   423	    } else {
   424	      state.streak = 0;
   425	    }
   426	
   427	    // Log
   428	    state.dailyLog.push({
   429	      day: state.day,
   430	      revenue,
   431	      netProfit,
   432	      orders,
   433	      visitors,
   434	      returns,
   435	    });
   436	
   437	    // Show results
   438	    showResults({
   439	      visitors,
   440	      orders,
   441	      revenue,
   442	      adSpend: state.adBudget,
   443	      shippingCost,
   444	      returnCost,
   445	      carryingCost,
   446	      netProfit,
   447	      inventory: state.inventory,
   448	      newReviews,
   449	    });
   450	  }
   451	
   452	  function showResults(r) {
   453	    $('res-visitors').textContent = fmtNum(r.visitors);
   454	    $('res-orders').textContent = fmtNum(r.orders);
   455	    $('res-revenue').textContent = fmtMoney(r.revenue);
   456	    $('res-adspend').textContent = '-' + fmtMoney(r.adSpend);
   457	    $('res-shipping').textContent = '-' + fmtMoney(r.shippingCost);
   458	    $('res-returns').textContent = '-' + fmtMoney(r.returnCost);
   459	    $('res-carrying').textContent = '-' + fmtMoney(r.carryingCost);
   460	    $('res-profit').textContent = (r.netProfit >= 0 ? '+' : '') + fmtMoney(r.netProfit);
   461	    $('res-profit').className = r.netProfit >= 0 ? 'good' : 'danger';
   462	    $('res-inventory').textContent = fmtNum(r.inventory);
   463	    $('res-reviews').textContent = r.newReviews > 0 ? `${r.newReviews} new` : '0';
   464	
   465	    const reviewFlash = $('review-flash');
   466	    if (r.newReviews > 0) {
   467	      const avgSentiment = state.rating >= 4 ? 'Customers love it!' : state.rating >= 3 ? 'Mixed reviews.' : 'Customers are unhappy.';
   468	      reviewFlash.textContent = `⭐ Rating: ${state.rating.toFixed(1)} — ${avgSentiment}`;
   469	      reviewFlash.className = 'review-flash ' + (state.rating >= 3.5 ? 'good' : 'bad');
   470	      reviewFlash.classList.remove('hidden');
   471	    } else {
   472	      reviewFlash.classList.add('hidden');
   473	    }
   474	
   475	    $('btn-next-day').onclick = nextDay;
   476	    showPhase('results');
   477	  }
   478	
   479	  // ===== NEXT DAY =====
   480	  function nextDay() {
   481	    state.day++;
   482	
   483	    // Receive incoming inventory
   484	    state.inventoryIncoming = state.inventoryIncoming.filter(item => {
   485	      if (item.arrivesDay <= state.day) {
   486	        state.inventory += item.units;
   487	        return false;
   488	      }
   489	      return true;
   490	    });
   491	
   492	    // Check win/loss
   493	    if (state.cash <= 0) {
   494	      endGame(false);
   495	      return;
   496	    }
   497	    if (state.totalProfit >= WIN_PROFIT || state.totalUnitsSold >= WIN_UNITS) {
   498	      endGame(true);
   499	      return;
   500	    }
   501	
   502	    updateSeason();
   503	    rollEvent();
   504	    updateHUD();
   505	    showSeasonBanner();
   506	    if (state.todayEvent) showEventBanner();
   507	    showPhase('source');
   508	    renderSuppliers();
   509	  }
   510	
   511	  // ===== PHASE MANAGEMENT =====
   512	  function showPhase(phase) {
   513	    ['source', 'price', 'ads', 'results'].forEach(p => {
   514	      const el = $('phase-' + p);
   515	      if (el) el.classList.add('hidden');
   516	    });
   517	    const active = $('phase-' + phase);
   518	    if (active) {
   519	      active.classList.remove('hidden');
   520	      // Re-trigger animation
   521	      active.style.animation = 'none';
   522	      active.offsetHeight; // force reflow
   523	      active.style.animation = '';
   524	    }
   525	
   526	    if (phase === 'price') initPricePhase();
   527	    if (phase === 'ads') initAdsPhase();
   528	  }
   529	
   530	  // ===== END GAME =====
   531	  function endGame(won) {
   532	    state.gameOver = true;
   533	    state.won = won;
   534	    hud.classList.add('hidden');
   535	
   536	    const statsHTML = `
   537	      <div class="final-row"><span>Days</span><span>${state.day}</span></div>
   538	      <div class="final-row"><span>Total Revenue</span><span>${fmtMoney(state.totalRevenue)}</span></div>
   539	      <div class="final-row"><span>Total Profit</span><span class="${state.totalProfit >= 0 ? 'good' : 'danger'}">${fmtMoney(state.totalProfit)}</span></div>
   540	      <div class="final-row"><span>Units Sold</span><span>${fmtNum(state.totalUnitsSold)}</span></div>
   541	      <div class="final-row"><span>Returns</span><span>${fmtNum(state.totalUnitsReturned)}</span></div>
   542	      <div class="final-row"><span>Final Rating</span><span>⭐ ${state.rating.toFixed(1)}</span></div>
   543	      <div class="final-row"><span>Best Streak</span><span>${state.bestStreak} days</span></div>
   544	    `;
   545	
   546	    if (won) {
   547	      $('win-stats').innerHTML = statsHTML;
   548	      const tips = [
   549	        'You mastered the cashflow cycle: buy low, sell smart, advertise wisely.',
   550	        'Great job balancing inventory risk with growth!',
   551	        'Your pricing strategy and ad spend were on point.',
   552	      ];
   553	      $('win-tip').textContent = tips[Math.floor(Math.random() * tips.length)];
   554	      showScreen('win');
   555	    } else {
   556	      $('loss-stats').innerHTML = statsHTML;
   557	      const tips = [
   558	        'You ran out of cash. Try smaller orders and higher margins early on.',
   559	        'Inventory carrying costs add up. Don\'t overstock!',
   560	        'Price matters — too low and you bleed cash on shipping and ads.',
   561	        'Start with Budget Direct, price at 3x cost, and keep ad spend under $300/day until you have cash.',
   562	      ];
   563	      $('loss-tip').textContent = tips[Math.floor(Math.random() * tips.length)];
   564	      showScreen('loss');
   565	    }
   566	  }
   567	
   568	  // ===== TOAST =====
   569	  function showToast(msg) {
   570	    // Simple toast using event banner
   571	    const banner = $('event-banner');
   572	    banner.textContent = msg;
   573	    banner.className = 'event-banner';
   574	    banner.classList.remove('hidden');
   575	    setTimeout(() => {
   576	      if (!state.todayEvent && state.season.name === 'Normal') {
   577	        banner.classList.add('hidden');
   578	      }
   579	    }, 2000);
   580	  }
   581	
   582	  // ===== INIT =====
   583	  function init() {
   584	    // Reset state
   585	    state = {
   586	      day: 1,
   587	      cash: START_CASH,
   588	      inventory: 0,
   589	      inventoryIncoming: [],
   590	      totalProfit: 0,
   591	      totalRevenue: 0,
   592	      totalUnitsSold: 0,
   593	      totalUnitsReturned: 0,
   594	      rating: 3.0,
   595	      reviewCount: 0,
   596	      reputation: 0,
   597	      streak: 0,
   598	      bestStreak: 0,
   599	      dailyLog: [],
   600	      gameOver: false,
   601	      won: false,
   602	      selectedSupplier: null,
   603	      orderQty: 0,
   604	      price: 10,
   605	      adBudget: 200,
   606	      season: SEASONS[0],
   607	      seasonDaysLeft: 0,
   608	      todayEvent: null,
   609	    };
   610	
   611	    $('btn-start').onclick = startGame;
   612	    $('btn-replay-win').onclick = startGame;
   613	    $('btn-replay-loss').onclick = startGame;
   614	  }
   615	
   616	  function startGame() {
   617	    init();
   618	    hud.classList.remove('hidden');
   619	    updateHUD();
   620	    updateSeason();

exec
/bin/zsh -lc "find /Users/kahlilgarmon/.openclaw/workspace -path '*/references/moneybot-games/*' -type f -print" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 234ms:
exec
/bin/zsh -lc "nl -ba g.js | sed -n '620,760p'" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
   620	    updateSeason();
   621	    rollEvent();
   622	    showScreen('game');
   623	    showSeasonBanner();
   624	    if (state.todayEvent) showEventBanner();
   625	    showPhase('source');
   626	    renderSuppliers();
   627	  }
   628	
   629	  // Boot
   630	  init();
   631	})();

exec
/bin/zsh -lc "nl -ba s.css | sed -n '1,760p'" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
     1	:root {
     2	  --mb-green: #00E676;
     3	  --mb-green-dark: #00C853;
     4	  --mb-green-soft: #69F0AE;
     5	  --mb-ink: #07111F;
     6	  --mb-ink-2: #0B1628;
     7	  --mb-panel: rgba(10, 24, 42, 0.92);
     8	  --mb-line: rgba(105, 240, 174, 0.2);
     9	  --mb-white: #F8FAFC;
    10	  --mb-muted: #94A3B8;
    11	  --mb-gold: #FBBF24;
    12	  --mb-red: #FB7185;
    13	  --mb-blue: #38BDF8;
    14	  --mb-purple: #A78BFA;
    15	  --mb-radius: 16px;
    16	  --mb-shadow: 0 8px 32px rgba(0,0,0,0.4);
    17	  --mb-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    18	}
    19	
    20	* { box-sizing: border-box; margin: 0; padding: 0; }
    21	
    22	body, html {
    23	  width: 100%; height: 100%;
    24	  background: var(--mb-ink);
    25	  color: var(--mb-white);
    26	  font-family: 'Outfit', sans-serif;
    27	  user-select: none;
    28	  overflow: hidden;
    29	}
    30	
    31	#app {
    32	  max-width: 480px;
    33	  margin: 0 auto;
    34	  height: 100%;
    35	  position: relative;
    36	  background: var(--mb-ink);
    37	  display: flex;
    38	  flex-direction: column;
    39	}
    40	
    41	/* ===== SCREENS ===== */
    42	.screen {
    43	  position: absolute;
    44	  inset: 0;
    45	  z-index: 20;
    46	  padding: 24px 20px;
    47	  display: none;
    48	  flex-direction: column;
    49	  background: var(--mb-ink);
    50	  overflow-y: auto;
    51	}
    52	
    53	/* ===== START SCREEN ===== */
    54	.logo-area { text-align: center; margin: 10px 0 24px; }
    55	.mascot { font-size: 48px; line-height: 1; margin-bottom: 12px; }
    56	.mascot.big { font-size: 72px; margin-bottom: 16px; }
    57	
    58	h1 {
    59	  font-size: 38px;
    60	  font-weight: 900;
    61	  line-height: 1.05;
    62	  letter-spacing: -1px;
    63	}
    64	h1 .highlight { color: var(--mb-green); }
    65	h1.danger { color: var(--mb-red); }
    66	
    67	.tagline {
    68	  font-size: 16px;
    69	  color: var(--mb-muted);
    70	  margin-top: 10px;
    71	  font-weight: 600;
    72	}
    73	
    74	.instructions {
    75	  background: var(--mb-panel);
    76	  border: 1px solid var(--mb-line);
    77	  border-radius: var(--mb-radius);
    78	  padding: 18px;
    79	  margin-bottom: 20px;
    80	}
    81	.inst-item {
    82	  display: flex;
    83	  align-items: center;
    84	  gap: 12px;
    85	  font-size: 14px;
    86	  font-weight: 600;
    87	  padding: 9px 0;
    88	  border-bottom: 1px solid var(--mb-line);
    89	}
    90	.inst-item:last-child { border-bottom: none; }
    91	.inst-icon { font-size: 20px; }
    92	
    93	.win-target {
    94	  background: var(--mb-panel);
    95	  border: 1px solid var(--mb-line);
    96	  border-radius: var(--mb-radius);
    97	  padding: 14px 18px;
    98	  margin-bottom: 24px;
    99	}
   100	.target-row {
   101	  display: flex;
   102	  justify-content: space-between;
   103	  font-size: 14px;
   104	  font-weight: 700;
   105	  padding: 6px 0;
   106	}
   107	.target-row span:first-child { color: var(--mb-muted); }
   108	
   109	/* ===== HUD ===== */
   110	#hud {
   111	  z-index: 30;
   112	  padding: 12px 16px;
   113	  background: linear-gradient(to bottom, rgba(7,17,31,0.95), rgba(7,17,31,0.7));
   114	  border-bottom: 1px solid var(--mb-line);
   115	  flex-shrink: 0;
   116	}
   117	
   118	.hud-row {
   119	  display: flex;
   120	  gap: 8px;
   121	  margin-bottom: 8px;
   122	}
   123	.hud-row:last-child { margin-bottom: 0; }
   124	.hud-row.metrics { gap: 12px; justify-content: space-between; }
   125	
   126	.hud-pill {
   127	  flex: 1;
   128	  background: var(--mb-panel);
   129	  border: 1px solid var(--mb-line);
   130	  border-radius: 12px;
   131	  padding: 10px 12px;
   132	  text-align: center;
   133	}
   134	.hud-pill.cash { border-color: rgba(0,230,118,0.4); }
   135	
   136	.hud-label {
   137	  display: block;
   138	  font-size: 9px;
   139	  font-weight: 800;
   140	  color: var(--mb-muted);
   141	  letter-spacing: 1.5px;
   142	  margin-bottom: 4px;
   143	}
   144	.hud-value {
   145	  display: block;
   146	  font-size: 20px;
   147	  font-weight: 900;
   148	  color: var(--mb-white);
   149	}
   150	#streak-val { color: var(--mb-gold); }
   151	#cash-val { color: var(--mb-green-soft); }
   152	
   153	.metric { text-align: center; }
   154	.metric-label {
   155	  display: block;
   156	  font-size: 9px;
   157	  font-weight: 800;
   158	  color: var(--mb-muted);
   159	  letter-spacing: 1px;
   160	}
   161	.metric-value {
   162	  display: block;
   163	  font-size: 15px;
   164	  font-weight: 700;
   165	  color: var(--mb-white);
   166	  margin-top: 2px;
   167	}
   168	.metric-value.danger { color: var(--mb-red); }
   169	.metric-value.good { color: var(--mb-green); }
   170	
   171	/* ===== GAME SCREEN ===== */
   172	#game-screen {
   173	  position: relative;
   174	  padding-top: 110px;
   175	  justify-content: flex-start;
   176	}
   177	
   178	.event-banner {
   179	  background: linear-gradient(90deg, rgba(251,113,133,0.2), rgba(251,113,133,0.05));
   180	  border-left: 3px solid var(--mb-red);
   181	  padding: 12px 16px;
   182	  margin: 0 0 14px;
   183	  border-radius: 0 12px 12px 0;
   184	  font-size: 14px;
   185	  font-weight: 700;
   186	  color: var(--mb-red);
   187	  animation: slideIn 0.3s var(--mb-spring);
   188	}
   189	.event-banner.good {
   190	  background: linear-gradient(90deg, rgba(0,230,118,0.2), rgba(0,230,118,0.05));
   191	  border-left-color: var(--mb-green);
   192	  color: var(--mb-green);
   193	}
   194	.event-banner.gold {
   195	  background: linear-gradient(90deg, rgba(251,191,36,0.2), rgba(251,191,36,0.05));
   196	  border-left-color: var(--mb-gold);
   197	  color: var(--mb-gold);
   198	}
   199	
   200	@keyframes slideIn {
   201	  from { transform: translateX(-20px); opacity: 0; }
   202	  to { transform: translateX(0); opacity: 1; }
   203	}
   204	
   205	/* ===== PHASE PANELS ===== */
   206	.phase-panel {
   207	  display: flex;
   208	  flex-direction: column;
   209	  gap: 12px;
   210	  animation: popIn 0.25s var(--mb-spring);
   211	}
   212	@keyframes popIn {
   213	  from { transform: scale(0.96); opacity: 0; }
   214	  to { transform: scale(1); opacity: 1; }
   215	}
   216	
   217	.phase-header {
   218	  display: flex;
   219	  align-items: center;
   220	  gap: 10px;
   221	  margin-bottom: 4px;
   222	}
   223	.phase-icon { font-size: 24px; }
   224	.phase-title {
   225	  font-size: 20px;
   226	  font-weight: 900;
   227	  color: var(--mb-white);
   228	  letter-spacing: -0.5px;
   229	}
   230	
   231	/* ===== SUPPLIERS ===== */
   232	.suppliers-grid {
   233	  display: flex;
   234	  flex-direction: column;
   235	  gap: 10px;
   236	}
   237	
   238	.supplier-card {
   239	  background: var(--mb-panel);
   240	  border: 1px solid var(--mb-line);
   241	  border-radius: 16px;
   242	  padding: 16px;
   243	  cursor: pointer;
   244	  transition: all 0.15s;
   245	  position: relative;
   246	  overflow: hidden;
   247	}
   248	.supplier-card::before {
   249	  content: '';
   250	  position: absolute;
   251	  left: 0; top: 0; bottom: 0;
   252	  width: 4px;
   253	  background: var(--mb-green);
   254	  opacity: 0;
   255	  transition: opacity 0.15s;
   256	}
   257	.supplier-card:hover::before, .supplier-card:active::before { opacity: 1; }
   258	.supplier-card:hover {
   259	  border-color: rgba(105, 240, 174, 0.5);
   260	  transform: translateX(4px);
   261	}
   262	.supplier-card:active { transform: scale(0.98); }
   263	.supplier-card.locked {
   264	  opacity: 0.5;
   265	  cursor: not-allowed;
   266	}
   267	.supplier-card.locked:hover { transform: none; border-color: var(--mb-line); }
   268	.supplier-card.locked::before { display: none; }
   269	
   270	.supplier-header {
   271	  display: flex;
   272	  align-items: center;
   273	  gap: 10px;
   274	  margin-bottom: 8px;
   275	}
   276	.supplier-tier {
   277	  font-size: 11px;
   278	  font-weight: 800;
   279	  padding: 3px 10px;
   280	  border-radius: 20px;
   281	  text-transform: uppercase;
   282	  letter-spacing: 0.5px;
   283	}
   284	.tier-budget { background: rgba(56,189,248,0.15); color: var(--mb-blue); }
   285	.tier-standard { background: rgba(0,230,118,0.15); color: var(--mb-green); }
   286	.tier-premium { background: rgba(251,191,36,0.15); color: var(--mb-gold); }
   287	.tier-wholesale { background: rgba(167,139,250,0.15); color: var(--mb-purple); }
   288	
   289	.supplier-name {
   290	  font-size: 17px;
   291	  font-weight: 800;
   292	  color: var(--mb-white);
   293	}
   294	.supplier-desc {
   295	  font-size: 13px;
   296	  color: var(--mb-muted);
   297	  margin-bottom: 10px;
   298	  line-height: 1.4;
   299	}
   300	.supplier-stats {
   301	  display: flex;
   302	  gap: 14px;
   303	  flex-wrap: wrap;
   304	}
   305	.supplier-stat {
   306	  font-size: 12px;
   307	  font-weight: 700;
   308	}
   309	.supplier-stat .stat-label { color: var(--mb-muted); margin-right: 4px; }
   310	.supplier-stat .stat-value { color: var(--mb-white); }
   311	
   312	/* ===== PRICE / ADS CARDS ===== */
   313	.price-card, .ads-card {
   314	  background: var(--mb-panel);
   315	  border: 1px solid var(--mb-line);
   316	  border-radius: var(--mb-radius);
   317	  padding: 18px;
   318	}
   319	
   320	.price-info, .ads-info {
   321	  display: flex;
   322	  flex-direction: column;
   323	  gap: 10px;
   324	  margin-bottom: 18px;
   325	}
   326	.price-row, .ads-row {
   327	  display: flex;
   328	  justify-content: space-between;
   329	  font-size: 15px;
   330	  font-weight: 700;
   331	}
   332	.price-row span:first-child, .ads-row span:first-child { color: var(--mb-muted); }
   333	.price-value { font-weight: 900; font-size: 16px; }
   334	
   335	.slider-wrap {
   336	  margin-bottom: 14px;
   337	}
   338	input[type="range"] {
   339	  width: 100%;
   340	  height: 8px;
   341	  border-radius: 4px;
   342	  background: var(--mb-ink-2);
   343	  outline: none;
   344	  -webkit-appearance: none;
   345	  appearance: none;
   346	}
   347	input[type="range"]::-webkit-slider-thumb {
   348	  -webkit-appearance: none;
   349	  appearance: none;
   350	  width: 24px;
   351	  height: 24px;
   352	  border-radius: 50%;
   353	  background: var(--mb-green);
   354	  cursor: pointer;
   355	  box-shadow: 0 2px 10px rgba(0,230,118,0.4);
   356	}
   357	input[type="range"]::-moz-range-thumb {
   358	  width: 24px;
   359	  height: 24px;
   360	  border-radius: 50%;
   361	  background: var(--mb-green);
   362	  cursor: pointer;
   363	  border: none;
   364	  box-shadow: 0 2px 10px rgba(0,230,118,0.4);
   365	}
   366	.slider-labels {
   367	  display: flex;
   368	  justify-content: space-between;
   369	  font-size: 11px;
   370	  color: var(--mb-muted);
   371	  margin-top: 6px;
   372	  font-weight: 700;
   373	}
   374	
   375	.conversion-est, .ad-tip {
   376	  text-align: center;
   377	  font-size: 13px;
   378	  font-weight: 700;
   379	  padding: 10px;
   380	  border-radius: 10px;
   381	}
   382	.conversion-est { background: rgba(0,230,118,0.08); color: var(--mb-green); }
   383	.ad-tip { background: rgba(56,189,248,0.08); color: var(--mb-blue); }
   384	
   385	/* ===== RESULTS ===== */
   386	.results-card {
   387	  background: var(--mb-panel);
   388	  border: 1px solid var(--mb-line);
   389	  border-radius: var(--mb-radius);
   390	  padding: 16px 20px;
   391	}
   392	.result-row {
   393	  display: flex;
   394	  justify-content: space-between;
   395	  align-items: center;
   396	  padding: 9px 0;
   397	  font-size: 15px;
   398	  font-weight: 600;
   399	  border-bottom: 1px solid var(--mb-line);
   400	}
   401	.result-row:last-child { border-bottom: none; }
   402	.result-row span:first-child { color: var(--mb-muted); }
   403	.result-row span:last-child { font-weight: 900; font-size: 16px; }
   404	.result-row.highlight {
   405	  background: rgba(0,230,118,0.08);
   406	  margin: 0 -20px;
   407	  padding: 12px 20px;
   408	  border-radius: 8px;
   409	  border-bottom: none;
   410	}
   411	.result-row.highlight span:last-child { color: var(--mb-green); font-size: 18px; }
   412	
   413	.review-flash {
   414	  text-align: center;
   415	  font-size: 14px;
   416	  font-weight: 700;
   417	  padding: 10px;
   418	  border-radius: 10px;
   419	  animation: popIn 0.3s var(--mb-spring);
   420	}
   421	.review-flash.good {
   422	  background: rgba(0,230,118,0.1);
   423	  color: var(--mb-green);
   424	  border: 1px solid rgba(0,230,118,0.3);
   425	}
   426	.review-flash.bad {
   427	  background: rgba(251,113,133,0.1);
   428	  color: var(--mb-red);
   429	  border: 1px solid rgba(251,113,133,0.3);
   430	}
   431	
   432	/* ===== WIN / LOSS ===== */
   433	#win-screen, #loss-screen {
   434	  justify-content: center;
   435	  text-align: center;
   436	}
   437	#win-screen h2, #loss-screen h2 {
   438	  font-size: 28px;
   439	  font-weight: 900;
   440	  margin-bottom: 20px;
   441	}
   442	
   443	.final-stats {
   444	  background: var(--mb-panel);
   445	  border: 1px solid var(--mb-line);
   446	  border-radius: var(--mb-radius);
   447	  padding: 16px 20px;
   448	  margin-bottom: 20px;
   449	}
   450	.final-row {
   451	  display: flex;
   452	  justify-content: space-between;
   453	  align-items: center;
   454	  padding: 10px 0;
   455	  font-size: 15px;
   456	  font-weight: 600;
   457	  border-bottom: 1px solid var(--mb-line);
   458	}
   459	.final-row:last-child { border-bottom: none; }
   460	.final-row span:first-child { color: var(--mb-muted); }
   461	.final-row span:last-child { font-weight: 900; font-size: 16px; }
   462	
   463	.subtitle {
   464	  font-size: 16px;
   465	  color: var(--mb-muted);
   466	  margin-bottom: 24px;
   467	}
   468	
   469	.tip-box {
   470	  background: rgba(56,189,248,0.1);
   471	  border: 1px solid rgba(56,189,248,0.3);
   472	  border-radius: 12px;
   473	  padding: 14px;
   474	  font-size: 14px;
   475	  font-weight: 600;
   476	  color: var(--mb-blue);
   477	  line-height: 1.4;
   478	  margin-bottom: 20px;
   479	}
   480	
   481	/* ===== BUTTONS ===== */
   482	.btn-primary {
   483	  background: linear-gradient(135deg, var(--mb-green-soft), var(--mb-green-dark));
   484	  color: var(--mb-ink);
   485	  font-family: 'Outfit', sans-serif;
   486	  font-weight: 900;
   487	  font-size: 18px;
   488	  padding: 18px;
   489	  border-radius: 14px;
   490	  border: none;
   491	  width: 100%;
   492	  cursor: pointer;
   493	  text-transform: uppercase;
   494	  letter-spacing: 1px;
   495	  box-shadow: 0 8px 25px rgba(0,230,118,0.25);
   496	  transition: transform 0.1s;
   497	  margin-top: 8px;
   498	}
   499	.btn-primary:active { transform: scale(0.96); }
   500	
   501	.good { color: var(--mb-green) !important; }
   502	.danger { color: var(--mb-red) !important; }
   503	
   504	/* ===== PROGRESS BAR ===== */
   505	.progress-wrap {
   506	  background: var(--mb-ink-2);
   507	  border-radius: 10px;
   508	  height: 10px;
   509	  overflow: hidden;
   510	  margin: 8px 0 16px;
   511	}
   512	.progress-fill {
   513	  height: 100%;
   514	  background: linear-gradient(90deg, var(--mb-green-soft), var(--mb-green));
   515	  border-radius: 10px;
   516	  transition: width 0.5s var(--mb-spring);
   517	}
   518	
   519	/* ===== MISC ===== */
   520	.hidden { display: none !important; }
   521	
   522	.screen.active { display: flex !important; }

exec
/bin/zsh -lc "find /Users/kahlilgarmon -path '*/references/moneybot-games/*' -type f -print 2>/dev/null" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
codex
I’ve got enough to see the main risk areas: the economic loop exists, but several core controls and brand requirements are missing or miswired. I’m doing one quick browser/runtime check next so the PASS/FAIL is grounded in actual play behavior, not just static reading.
2026-05-19T00:36:14.106651Z ERROR codex_core::tools::router: error=write_stdin failed: stdin is closed for this session; rerun exec_command with tty=true to keep stdin open
 exited 1 in 33461ms:
/Users/kahlilgarmon/MoneyBotOS/ops/references/moneybot-games/GAME_BRIEF_TEMPLATE.md
/Users/kahlilgarmon/MoneyBotOS/ops/references/moneybot-games/ASSET_MANIFEST.md
/Users/kahlilgarmon/MoneyBotOS/ops/references/moneybot-games/DESIGN_SYSTEM.md
/Users/kahlilgarmon/MoneyBotOS/ops/references/moneybot-games/ELITE_RUBRIC.md
/Users/kahlilgarmon/MoneyBotOS/ops/references/moneybot-games/QUALITY_STANDARD.md
/Users/kahlilgarmon/MoneyBotClaw-1/references/moneybot-games/GAME_BRIEF_TEMPLATE.md
/Users/kahlilgarmon/MoneyBotClaw-1/references/moneybot-games/ASSET_MANIFEST.md
/Users/kahlilgarmon/MoneyBotClaw-1/references/moneybot-games/DESIGN_SYSTEM.md
/Users/kahlilgarmon/MoneyBotClaw-1/references/moneybot-games/ELITE_RUBRIC.md
/Users/kahlilgarmon/MoneyBotClaw-1/references/moneybot-games/QUALITY_STANDARD.md
/Users/kahlilgarmon/MoneyBot-OS/moneybot-claw/references/moneybot-games/GAME_BRIEF_TEMPLATE.md
/Users/kahlilgarmon/MoneyBot-OS/moneybot-claw/references/moneybot-games/ASSET_MANIFEST.md
/Users/kahlilgarmon/MoneyBot-OS/moneybot-claw/references/moneybot-games/DESIGN_SYSTEM.md
/Users/kahlilgarmon/MoneyBot-OS/moneybot-claw/references/moneybot-games/ELITE_RUBRIC.md
/Users/kahlilgarmon/MoneyBot-OS/moneybot-claw/references/moneybot-games/QUALITY_STANDARD.md

exec
/bin/zsh -lc 'pkill -f "find /Users/kahlilgarmon -path" || true' in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
sysmon request failed with error: sysmond service not found
pkill: Cannot get process list

exec
/bin/zsh -lc "sed -n '1,240p' /Users/kahlilgarmon/MoneyBotOS/ops/references/moneybot-games/QUALITY_STANDARD.md" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
# MoneyBot Games Quality Standard

MoneyBot games must feel like premium product work, not prototypes with a finance skin. Every game should be playable, polished, branded, and useful enough that Kahlil would be comfortable showing it to a partner, customer, investor, or student without caveats.

## Non-Negotiable Bar

A game is not done until it passes all of these:

1. **Fun in 10 seconds** - The player understands what to do, takes an action, and gets satisfying feedback almost immediately.
2. **Money mechanic is real** - The gameplay teaches or reinforces one money concept through mechanics, not just text.
3. **MoneyBot brand is obvious** - Colors, mascot treatment, UI shape language, tone, and rewards feel like the same product family.
4. **Mobile-first** - It works on a phone-sized viewport with thumb-friendly controls.
5. **No placeholder slop** - No random emoji UI, broken images, lorem ipsum, generic gradients, missing win/loss states, or console errors.
6. **Accessible by default** - Clear contrast, readable type, keyboard support where relevant, and no tiny tap targets.
7. **Replayable loop** - Score, progression, levels, streaks, unlocks, or mastery gives the player a reason to replay.
8. **Browser verified** - The game loads in a browser and the primary loop was tested.
9. **Codex challenged** - Run `scripts/game/codex-game-review.sh` and fix blocking issues.
10. **Operator-ready handoff** - Report the URL, changed files, what improved, known limitations, and next best upgrade.

## Quality Levels

### Level 0: Not Acceptable

- Static page pretending to be a game
- Generic AI copy or random emoji art
- No complete loop
- Broken on mobile
- No brand discipline

### Level 1: Prototype

- One playable loop
- Basic scoring and restart
- Uses MoneyBot colors
- Has at least one explicit money concept

### Level 2: Good

- Smooth controls and feedback
- Responsive UI and mobile layout
- Win/loss states, progression, and tuned difficulty
- Uses named MoneyBot assets or clean custom SVG/CSS assets
- No obvious bugs

### Level 3: Elite

- Feels like a polished mini-product
- Consistent MoneyBot visual system
- Strong onboarding in under three screens
- Juicy feedback: animation, particles, haptics where supported, satisfying audio optional
- Has levels, achievements, upgrades, or mastery curve
- Teaches through play, not lectures
- Passes automated checks and Codex review

Only call a game “elite” at Level 3.

## Game Design Requirements

Every game needs:

- **Core loop:** one sentence describing what the player repeatedly does.
- **Money lesson:** one concept, such as budgeting, compounding, cashflow, risk, diversification, debt, investing, taxes, negotiation, or opportunity cost.
- **Player fantasy:** what the player gets to feel: clever, fast, strategic, in control, resourceful.
- **Failure pressure:** what creates tension without shame.
- **Mastery path:** what the player gets better at.
- **Reward language:** tied to MoneyBot outcomes: runway, cashflow, streaks, savings, smart risk, leverage.

## Engineering Requirements

- Use deterministic game state where practical.
- Keep game logic separate from rendering and UI glue.
- Avoid blocking main-thread work inside the loop.
- Keep controls responsive at 60 FPS for simple games.
- Avoid external dependencies unless they clearly improve quality.
- Handle pause, restart, game over, and viewport resize.
- Never require a login or collect personal data for a local prototype.
- Use fictional/demo financial numbers unless the user explicitly asks for real operator data.

## Review Checklist

Before final handoff, answer:

- What is the one money concept?
- Is the first action obvious?
- Is the game fun without reading paragraphs?
- Does it look unmistakably MoneyBot?
- Does it work at 390x844 and desktop?
- Does it have complete win/loss/restart states?
- Are there console errors?
- Did Codex challenge pass or were its failures addressed?
- What is the next upgrade that would make it feel 10x better?

exec
/bin/zsh -lc "sed -n '1,260p' /Users/kahlilgarmon/MoneyBotOS/ops/references/moneybot-games/DESIGN_SYSTEM.md" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
# MoneyBot Games Design System

Use this as the visual and interaction baseline for every MoneyBot game. The goal is a premium, consistent, mobile-first game suite that feels like one brand family.

## Brand Feel

MoneyBot games should feel:

- Smart but playful
- Premium but not sterile
- Fast, tactile, and rewarding
- Financially useful without sounding like school
- Optimistic without fake hype

Avoid:

- Random emoji as primary art
- Generic AI gradients with no system
- Dense finance lectures
- Shame-based money feedback
- Clashing colors or one-off UI styles per game

## Core Tokens

```css
:root {
  --mb-green: #00E676;
  --mb-green-dark: #00C853;
  --mb-green-soft: #69F0AE;
  --mb-ink: #07111F;
  --mb-ink-2: #0B1628;
  --mb-panel: rgba(10, 24, 42, 0.86);
  --mb-line: rgba(105, 240, 174, 0.22);
  --mb-white: #F8FAFC;
  --mb-muted: #AAB8C8;
  --mb-gold: #FBBF24;
  --mb-red: #FB7185;
  --mb-blue: #38BDF8;
  --mb-radius-sm: 12px;
  --mb-radius-md: 18px;
  --mb-radius-lg: 28px;
  --mb-shadow: 0 24px 80px rgba(0, 0, 0, 0.34);
  --mb-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

## Typography

- Use system UI or Inter.
- Use bold numbers for score, cash, streaks, and level labels.
- Keep body text short. Games should teach through interaction.
- Use sentence case for headings unless a brand lockup requires title case.

## Layout

Mobile first:

- Target 390x844 first.
- Minimum tap target: 44x44.
- Primary controls within thumb reach.
- HUD should be readable with one glance.
- Avoid scroll during active gameplay unless the game is intentionally turn-based.

Desktop:

- Center a max-width game shell.
- Preserve the mobile layout proportions instead of stretching everything.
- Support keyboard controls for arcade games.

## Standard Components

### Game Shell

- Dark radial background
- Top brand/HUD bar
- Main play area
- Bottom controls or helper text
- Modal overlay for win/loss/pause

### HUD

Must include the metrics that matter for the game:

- Score, cash, runway, streak, risk, time, or level
- Use pill cards with high contrast
- Animate value changes subtly

### Buttons

- Primary: green gradient, bold text, large radius
- Secondary: dark translucent panel with green border
- Destructive/failure: red only when it is truly a bad outcome

### Feedback

Use at least three:

- micro animation on collect/hit
- particles or burst
- score popover
- haptic vibration where supported
- screen shake for impact, not constantly
- progress meter fill
- sound or voice optional

## MoneyBot Assets

Canonical mascot reference:

- `references/mascot/canonical-operator-reference.png`
- Runtime reference path: `~/.openclaw/media/references/moneybot-mascot/canonical-operator-reference.png`

Asset rules:

- Prefer SVG/CSS assets for in-game icons so games stay lightweight.
- Use mascot as a coach, avatar, power-up, or reward, not as random decoration.
- Never stretch or crop the mascot poorly.
- If using generated assets, save them into a named game asset folder and document the prompt/source.

## Game Object Language

Use consistent metaphors:

- Coins: positive cashflow, savings, rewards
- Bills: expenses, obligations, debt pressure
- Shields: emergency fund, insurance, diversification
- Boosts: leverage, automation, skill upgrades
- Storms/fire: volatility, surprise expenses, risk events
- Towers/engines: compounding systems
- Maps/paths: career, revenue, runway, milestones

## Copy Tone

Good:

- “Runway up.”
- “Debt pressure down.”
- “Smart risk.”
- “Cashflow streak.”
- “Emergency fund saved you.”

Avoid:

- “This pivotal lesson underscores financial literacy.”
- “You failed at budgeting.”
- “In today’s fast-paced financial landscape.”

## Empty, Win, and Lose States

Every game needs:

- First-run instruction state
- Pause state
- Win or level-clear state
- Loss state that teaches one next move
- Restart action

Loss copy should be useful, not shaming:

- “Your bills outran your income. Try collecting recurring revenue first.”
- “Risk spiked because everything was in one asset. Spread the next round.”

## Visual Polish Bar

An elite game should include:

- animated background or parallax
- consistent icon set
- smooth transitions
- readable HUD
- responsive controls
- end-state modal
- at least one signature MoneyBot moment

Signature MoneyBot moment examples:

- mascot celebrates a cashflow streak
- runway meter expands after smart decisions
- compound engine visibly accelerates
- risk shield absorbs a surprise bill

exec
/bin/zsh -lc "sed -n '1,280p' /Users/kahlilgarmon/MoneyBotOS/ops/references/moneybot-games/ELITE_RUBRIC.md" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
exec
/bin/zsh -lc "sed -n '1,260p' /Users/kahlilgarmon/MoneyBotOS/ops/references/moneybot-games/ASSET_MANIFEST.md" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
# MoneyBot Elite Game Rubric

Score every game from 0-100. A game must score 90+ to be called elite.

## Scoring

| Category | Points |
|---|---:|
| Fun and core loop | 20 |
| Money learning mechanic | 15 |
| MoneyBot brand/design | 15 |
| Mobile UX and controls | 15 |
| Technical quality | 15 |
| Polish and juice | 10 |
| Accessibility and safety | 10 |

## 1. Fun and Core Loop (20)

- 0-5: unclear or boring
- 6-10: playable but shallow
- 11-15: satisfying loop with tension
- 16-20: instantly understandable, replayable, and satisfying

Questions:

- Is the first action obvious?
- Does the player make meaningful decisions?
- Is there tension without confusion?
- Would someone replay it without being asked?

## 2. Money Learning Mechanic (15)

- 0-4: finance label pasted on top
- 5-8: concept explained in text
- 9-12: concept appears in scoring/progression
- 13-15: concept is inseparable from the mechanics

Questions:

- What does the game teach?
- Does the player learn by doing?
- Is the model financially honest?
- Are examples fictional or clearly demo data?

## 3. MoneyBot Brand/Design (15)

- 0-4: generic or emoji-heavy
- 5-8: uses green but lacks system
- 9-12: consistent MoneyBot UI and metaphors
- 13-15: premium, unmistakably MoneyBot, asset-conscious

Questions:

- Does this look like the same suite as the other games?
- Are colors, components, and copy consistent?
- Are mascot/assets used intentionally?
- Is placeholder art removed?

## 4. Mobile UX and Controls (15)

- 0-4: desktop-only or broken on phone
- 5-8: mobile visible but awkward
- 9-12: thumb-friendly and responsive
- 13-15: mobile feels first-class

Questions:

- Does it work at 390x844?
- Are controls obvious and reachable?
- Are tap targets large enough?
- Does gameplay avoid accidental scroll/zoom?

## 5. Technical Quality (15)

- 0-4: fragile, broken, console errors
- 5-8: works but messy
- 9-12: clean structure and stable loop
- 13-15: robust, readable, tested, easy to extend

Questions:

- Is state separated from rendering?
- Are edge cases handled?
- Does restart reset everything?
- Does resize preserve playability?
- Are files named clearly?

## 6. Polish and Juice (10)

- 0-2: static
- 3-5: some animation
- 6-8: satisfying feedback
- 9-10: premium tactile feel

Questions:

- Are there animations, transitions, and feedback moments?
- Do rewards feel rewarding?
- Does failure feel clear but not punishing?

## 7. Accessibility and Safety (10)

- 0-2: inaccessible or risky
- 3-5: basic readability
- 6-8: good contrast, labels, non-shaming feedback
- 9-10: accessible controls and thoughtful safety

Questions:

- Is text readable?
- Is contrast sufficient?
- Is there keyboard support where relevant?
- Does copy avoid shame, dark patterns, and personalized financial advice?

## Elite Gate

Before calling a game elite, provide:

```text
Elite score: __/100
Blocking issues: none / list
Codex verdict: PASS / FAIL / not available because ...
Browser check: loaded / failed
Mobile check: pass / fail
Next 10x upgrade:
```

If Codex is unavailable due to auth/rate limits, do not call the game elite. Say it is “ready for human playtest pending Codex gate.”

 succeeded in 0ms:
# MoneyBot Games Asset Manifest

This file tells the GameDesign bot where to find MoneyBot visual references and how to use assets consistently.

## Canonical Assets

| Asset | Path | Use |
|---|---|---|
| Canonical MoneyBot mascot reference | `references/mascot/canonical-operator-reference.png` | Source-of-truth mascot look for generated or hand-built game assets |
| Runtime mascot reference | `~/.openclaw/media/references/moneybot-mascot/canonical-operator-reference.png` | Local OpenClaw media reference for image generation and runtime workflows |

## Recommended Game Asset Layout

Each game should keep assets local to the game folder:

```text
<game>/
  index.html
  style.css
  game.js
  assets/
    mascot/
    icons/
    backgrounds/
    audio/
    README.md
```

## Asset Naming

Use descriptive lowercase kebab-case:

- `moneybot-coach.svg`
- `coin-cashflow.svg`
- `bill-pressure.svg`
- `shield-emergency-fund.svg`
- `boost-automation.svg`
- `bg-runway-grid.svg`
- `sfx-coin.ogg`

## Asset Quality Rules

- Prefer SVG for UI icons and simple game objects.
- Prefer CSS gradients and shapes for lightweight prototypes.
- Use PNG/WebP only for detailed mascot or background art.
- Keep individual assets small unless there is a clear quality reason.
- Include alt text or accessible labels for non-canvas UI assets.
- Do not hotlink assets from random websites.
- Do not use copyrighted game art or unlicensed icons.

## MoneyBot Icon Set To Build

The GameDesign bot should create or reuse these primitives across games:

- Cashflow coin
- Expense bill
- Debt chain
- Emergency shield
- Runway meter
- Compound engine
- Risk storm
- Diversification basket
- Automation lightning bolt
- Goal flag
- Streak flame
- Level badge

## Generated Asset Rules

When using `moneybot-image-gen` or `scripts/create-image.sh`:

1. Use the mascot reference unless explicitly told not to.
2. Save outputs into the game’s `assets/` folder.
3. Document the prompt and output path in `assets/README.md`.
4. Run a visual sanity check before using the asset in-game.

## Placeholder Policy

Placeholders are acceptable only during the first prototype pass. Before calling a game ready:

- Replace emoji placeholders with SVG/CSS/PNG assets.
- Replace generic icons with MoneyBot metaphors.
- Replace placeholder text with final copy.
- Remove unused assets and dead references.

codex
The standards confirm the strict bar: this can be a prototype, but not elite if it relies on emoji as primary art, lacks asset discipline, or misses browser/mobile-ready controls. I’m checking runtime syntax and basic load constraints now; I won’t modify anything because this is a review request and the workspace is read-only.
exec
/bin/zsh -lc 'node --check g.js' in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
exec
/bin/zsh -lc 'ls -la && find . -maxdepth 2 -type f -print' in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
total 184
drwx------@  10 kahlilgarmon  staff    320 May 18 19:36 .
drwx------@ 147 kahlilgarmon  staff   4704 May 18 19:26 ..
-rw-------@   1 kahlilgarmon  staff   3041 May 18 19:26 GAME_BRIEF.md
-rw-------@   1 kahlilgarmon  staff    942 May 18 19:36 MONEYBOT_GAME_QA.md
drwx------@   2 kahlilgarmon  staff     64 May 18 19:26 assets
-rw-------@   1 kahlilgarmon  staff  20981 May 18 19:28 g.js
-rw-------@   1 kahlilgarmon  staff  20981 May 18 19:36 game.js
-rw-------@   1 kahlilgarmon  staff   9107 May 18 19:27 index.html
-rw-------@   1 kahlilgarmon  staff  11816 May 18 19:27 s.css
-rw-------@   1 kahlilgarmon  staff  11816 May 18 19:36 style.css
./game.js
./index.html
./GAME_BRIEF.md
./MONEYBOT_GAME_QA.md
./s.css
./style.css
./g.js

exec
/bin/zsh -lc 'rg -n "orderQty|delay|inventoryIncoming|progress|MoneyBot|mascot|emoji|addEventListener|onclick|aria|role|tabindex|style.css|game.js" index.html g.js s.css MONEYBOT_GAME_QA.md GAME_BRIEF.md' in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
index.html:51:                <div class="mascot">🛒</div>
index.html:152:            <div class="mascot big">🏆</div>
index.html:162:            <div class="mascot big">💸</div>
MONEYBOT_GAME_QA.md:1:# MoneyBot Game QA
MONEYBOT_GAME_QA.md:8:- [PASS] style.css exists
MONEYBOT_GAME_QA.md:9:- [PASS] game.js exists
MONEYBOT_GAME_QA.md:12:- [PASS] MoneyBot green token or value
MONEYBOT_GAME_QA.md:21:- [WARN] Emoji count is 27. Replace primary UI/game art with MoneyBot assets.
GAME_BRIEF.md:38:## 6. MoneyBot Brand
GAME_BRIEF.md:40:- **Mascot role:** coach — appears on start and win/loss with tips
GAME_BRIEF.md:41:- **MoneyBot colors:** full dark theme, #00E676 green accent
GAME_BRIEF.md:42:- **Signature MoneyBot moment:** mascot celebrates a cashflow-positive streak; warns when runway (cash) gets low
GAME_BRIEF.md:78:- [ ] MoneyBot brand is clear
s.css:55:.mascot { font-size: 48px; line-height: 1; margin-bottom: 12px; }
s.css:56:.mascot.big { font-size: 72px; margin-bottom: 16px; }
s.css:505:.progress-wrap {
s.css:512:.progress-fill {
g.js:73:    { text: '📦 Supply chain delay! New inventory arrives 1 day late.', effect: 'delay', good: false },
g.js:88:    inventoryIncoming: [], // { units, arrivesDay }
g.js:103:    orderQty: 0,
g.js:223:        card.addEventListener('click', () => selectSupplier(s));
g.js:233:    state.orderQty = Math.min(supplier.maxOrder, Math.max(supplier.minOrder, Math.min(maxAfford, supplier.minOrder * 2)));
g.js:234:    if (state.orderQty < supplier.minOrder) {
g.js:255:    $('btn-confirm-price').onclick = () => showPhase('ads');
g.js:286:    $('btn-confirm-ads').onclick = runDay;
g.js:316:    const orderCost = state.orderQty * s.cost;
g.js:323:      state.inventory += state.orderQty;
g.js:325:      state.inventoryIncoming.push({
g.js:326:        units: state.orderQty,
g.js:475:    $('btn-next-day').onclick = nextDay;
g.js:484:    state.inventoryIncoming = state.inventoryIncoming.filter(item => {
g.js:589:      inventoryIncoming: [],
g.js:603:      orderQty: 0,
g.js:611:    $('btn-start').onclick = startGame;
g.js:612:    $('btn-replay-win').onclick = startGame;
g.js:613:    $('btn-replay-loss').onclick = startGame;

exec
/bin/zsh -lc 'cmp -s g.js game.js; echo g_vs_game:$?; cmp -s s.css style.css; echo s_vs_style:$?' in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
g_vs_game:0
s_vs_style:0

exec
/bin/zsh -lc "find assets -maxdepth 2 -type f -print -exec ls -lh {} \\;" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
exec
/bin/zsh -lc "sed -n '1,80p' MONEYBOT_GAME_QA.md" in /Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire
 succeeded in 0ms:
# MoneyBot Game QA

Game directory: `/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire`
Generated: 2026-05-19T00:36:42Z

## Required Files
- [PASS] index.html exists
- [PASS] style.css exists
- [PASS] game.js exists

## Brand And Product Checks
- [PASS] MoneyBot green token or value
- [PASS] Money concept language
- [PASS] Win/loss/restart state
- [PASS] Mobile viewport
- [PASS] Touch or pointer support
- [PASS] Animation or feedback

## Placeholder/Slop Scan
- [WARN] Placeholder-like text found; inspect before handoff.
- [WARN] Emoji count is 27. Replace primary UI/game art with MoneyBot assets.

## Browser Smoke Test
- [PASS] Browser server loaded: http://127.0.0.1:5199/

## Codex Challenge
- [SKIP] Codex challenge skipped by flag.

## Required Human Summary

Fill this before final handoff:

```text
Elite score: __/100
Blocking issues:
Browser check:
Mobile check:
Codex verdict:
Next 10x upgrade:
```

codex
**Verdict**
FAIL for “ready for Kahlil to play.”

Elite score: **61/100**. This is a playable prototype, not elite. The cashflow loop exists, but the core sourcing decision is mostly hidden, the HUD/game-over timing is wrong, and the MoneyBot brand is too emoji-heavy.

**Top 5 Issues**
1. **No order quantity control kills the core money mechanic**  
   In [g.js](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/g.js:229), supplier choice auto-sets `state.orderQty`, so the player cannot manage inventory risk. Add a quantity slider/stepper after supplier selection showing `units`, `supplier cost`, `cash after purchase`, and `break-even units`.

2. **HUD and win/loss checks update too late**  
   [runDay](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/g.js:314) mutates cash/profit/inventory but does not call `updateHUD()`. Win/loss only happens in [nextDay](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/g.js:480), so players can be bankrupt and still see “Next Day.” After `showResults(...)`, call `updateHUD()`, and immediately end the game if `cash <= 0` or win targets are reached.

3. **MoneyBot brand is not launch-ready**  
   Primary art is emoji in [index.html](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/index.html:51), [index.html](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/index.html:152), and event copy in [g.js](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/g.js:72). Replace emoji art with local SVG/CSS MoneyBot assets under `assets/`, add a `moneybot-coach.svg`, and use it for start/win/loss coaching moments.

4. **Event system contains broken or misleading effects**  
   The `delay` event is defined at [g.js](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/g.js:73) but never applied. Implement it by adding `extraLeadTime = state.todayEvent?.effect === 'delay' ? 1 : 0` when calculating `arrivesDay`. Also change the processor event to reduce `orders`, not `visitors`, because the text says sales are lost.

5. **Accessibility and mobile polish are below elite**  
   Supplier cards are clickable `div`s only in [g.js](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/g.js:206), with no keyboard support or ARIA state. Use real `<button class="supplier-card">` elements or add `tabindex="0"`, `role="button"`, Enter/Space handlers, and visible focus styles. Remove `user-scalable=no` from [index.html](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/index.html:5).

**Concrete Fixes**
- In [index.html](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/index.html:82), add a new “Choose Quantity” phase between source and price with a range input and cost preview.
- In [g.js](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/g.js:229), change `selectSupplier()` to store the supplier, initialize quantity UI, then show the quantity phase instead of jumping to price.
- In [g.js](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/g.js:437), after `showResults(...)`, update the HUD and lock the results button into either `Next Day`, `Claim Win`, or `Review Loss`.
- In [s.css](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/s.css:238), add `:focus-visible` styles for supplier cards/buttons and keep all tap targets at least 44px.
- In [index.html](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/index.html:7), remove the Google Fonts dependency or make local/system typography the default for browser-safe launch.

**10x Upgrade**
Add a visual “store shelf” results scene: inventory boxes flow into orders, ad spend creates visitor dots, returns bounce back, and profit coins hit the HUD. That would make cashflow, stockouts, overbuying, and margin feel visible instead of spreadsheet-like.
2026-05-19T00:37:58.188246Z ERROR codex_core::session: failed to record rollout items: thread 019e3da8-6ba1-7330-a93b-4ed2cb193642 not found
tokens used
135,379
**Verdict**
FAIL for “ready for Kahlil to play.”

Elite score: **61/100**. This is a playable prototype, not elite. The cashflow loop exists, but the core sourcing decision is mostly hidden, the HUD/game-over timing is wrong, and the MoneyBot brand is too emoji-heavy.

**Top 5 Issues**
1. **No order quantity control kills the core money mechanic**  
   In [g.js](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/g.js:229), supplier choice auto-sets `state.orderQty`, so the player cannot manage inventory risk. Add a quantity slider/stepper after supplier selection showing `units`, `supplier cost`, `cash after purchase`, and `break-even units`.

2. **HUD and win/loss checks update too late**  
   [runDay](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/g.js:314) mutates cash/profit/inventory but does not call `updateHUD()`. Win/loss only happens in [nextDay](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/g.js:480), so players can be bankrupt and still see “Next Day.” After `showResults(...)`, call `updateHUD()`, and immediately end the game if `cash <= 0` or win targets are reached.

3. **MoneyBot brand is not launch-ready**  
   Primary art is emoji in [index.html](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/index.html:51), [index.html](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/index.html:152), and event copy in [g.js](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/g.js:72). Replace emoji art with local SVG/CSS MoneyBot assets under `assets/`, add a `moneybot-coach.svg`, and use it for start/win/loss coaching moments.

4. **Event system contains broken or misleading effects**  
   The `delay` event is defined at [g.js](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/g.js:73) but never applied. Implement it by adding `extraLeadTime = state.todayEvent?.effect === 'delay' ? 1 : 0` when calculating `arrivesDay`. Also change the processor event to reduce `orders`, not `visitors`, because the text says sales are lost.

5. **Accessibility and mobile polish are below elite**  
   Supplier cards are clickable `div`s only in [g.js](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/g.js:206), with no keyboard support or ARIA state. Use real `<button class="supplier-card">` elements or add `tabindex="0"`, `role="button"`, Enter/Space handlers, and visible focus styles. Remove `user-scalable=no` from [index.html](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/index.html:5).

**Concrete Fixes**
- In [index.html](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/index.html:82), add a new “Choose Quantity” phase between source and price with a range input and cost preview.
- In [g.js](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/g.js:229), change `selectSupplier()` to store the supplier, initialize quantity UI, then show the quantity phase instead of jumping to price.
- In [g.js](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/g.js:437), after `showResults(...)`, update the HUD and lock the results button into either `Next Day`, `Claim Win`, or `Review Loss`.
- In [s.css](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/s.css:238), add `:focus-visible` styles for supplier cards/buttons and keep all tap targets at least 44px.
- In [index.html](/Users/kahlilgarmon/.openclaw/workspace/moneybot-games/bot-ecommerce-empire/index.html:7), remove the Google Fonts dependency or make local/system typography the default for browser-safe launch.

**10x Upgrade**
Add a visual “store shelf” results scene: inventory boxes flow into orders, ad spend creates visitor dots, returns bounce back, and profit coins hit the HUD. That would make cashflow, stockouts, overbuying, and margin feel visible instead of spreadsheet-like.
```

## Required Human Summary

Fill this before final handoff:

```text
Elite score: __/100
Blocking issues:
Browser check:
Mobile check:
Codex verdict:
Next 10x upgrade:
```
