(function() {
  'use strict';

  // ===== STATE =====
  let state = {
    cash: 100000,
    netWorth: 100000,
    year: 1,
    dealCount: 0,
    totalProfit: 0,
    peakNetWorth: 100000,
    marketPhase: 0, // 0=crash, 1=recession, 2=normal, 3=boom, 4=bubble
    marketPhases: ['Crash', 'Recession', 'Normal', 'Boom', 'Bubble'],
    marketMultipliers: [0.75, 0.88, 1.0, 1.12, 1.25],
    currentProperty: null,
    gameOver: false,
  };

  const PHASE_COLORS = ['#FB7185', '#FBBF24', '#94A3B8', '#00E676', '#A78BFA'];

  const PROPERTIES = [
    { name: 'Fixer Upper', icon: '🏚️', askMin: 80000, askMax: 150000, arvPct: 1.6, renoMin: 20000, renoMax: 50000 },
    { name: 'Foreclosure', icon: '🏠', askMin: 120000, askMax: 200000, arvPct: 1.5, renoMin: 30000, renoMax: 70000 },
    { name: 'Distressed Duplex', icon: '🏘️', askMin: 180000, askMax: 300000, arvPct: 1.45, renoMin: 40000, renoMax: 90000 },
    { name: 'Vacant Lot', icon: '🌿', askMin: 50000, askMax: 100000, arvPct: 2.0, renoMin: 50000, renoMax: 120000 },
    { name: 'Outdated Condo', icon: '🏢', askMin: 150000, askMax: 250000, arvPct: 1.35, renoMin: 25000, renoMax: 60000 },
    { name: 'Water Damage Special', icon: '💧', askMin: 60000, askMax: 130000, arvPct: 1.7, renoMin: 35000, renoMax: 80000 },
  ];

  const RENOS = [
    { id: 'light', name: 'Light Touch', icon: '🎨', desc: 'Paint + fixtures', costPct: 0.5, arvBoost: 1.08 },
    { id: 'medium', name: 'Kitchen & Bath', icon: '🛁', desc: 'Major rooms redone', costPct: 0.75, arvBoost: 1.18 },
    { id: 'full', name: 'Full Gut', icon: '🔨', desc: 'Everything new', costPct: 1.0, arvBoost: 1.3 },
  ];

  // ===== DOM =====
  const $ = id => document.getElementById(id);

  function fmtMoney(n) {
    if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
    return '$' + Math.floor(n);
  }

  function rand(min, max) {
    return Math.floor(min + Math.random() * (max - min));
  }

  function updateHUD() {
    $('year-val').textContent = state.year;
    $('cash-val').textContent = fmtMoney(state.cash);
    $('net-val').textContent = fmtMoney(state.netWorth);
    const m = state.marketMultipliers[state.marketPhase];
    const pct = Math.round((m - 1) * 100);
    $('market-text').textContent = state.marketPhases[state.marketPhase] + (pct >= 0 ? ' +' + pct + '%' : ' ' + pct + '%');
    $('market-text').style.color = PHASE_COLORS[state.marketPhase];
    $('market-dot').style.left = (10 + state.marketPhase * 20) + '%';
    $('market-dot').style.background = PHASE_COLORS[state.marketPhase];
    $('market-dot').style.boxShadow = '0 0 10px ' + PHASE_COLORS[state.marketPhase];
  }

  function showScreen(id) {
    ['start-screen', 'deal-screen', 'reno-screen', 'sell-screen', 'result-screen', 'gameover-screen'].forEach(sid => {
      $(sid).classList.toggle('active', sid === id);
      if (sid === id) $(sid).classList.remove('hidden');
    });
  }

  // ===== GAME FLOW =====
  function initGame() {
    state = {
      cash: 100000,
      netWorth: 100000,
      year: 1,
      dealCount: 0,
      totalProfit: 0,
      peakNetWorth: 100000,
      marketPhase: 2,
      marketPhases: ['Crash', 'Recession', 'Normal', 'Boom', 'Bubble'],
      marketMultipliers: [0.75, 0.88, 1.0, 1.12, 1.25],
      currentProperty: null,
      gameOver: false,
    };
    $('hud').classList.remove('hidden');
    updateHUD();
    nextDeal();
  }

  function advanceMarket() {
    // Market moves slowly, with some volatility
    const r = Math.random();
    if (r < 0.15) state.marketPhase = Math.max(0, state.marketPhase - 1);
    else if (r < 0.3) state.marketPhase = Math.min(4, state.marketPhase + 1);
    state.year++;
  }

  function nextDeal() {
    advanceMarket();
    updateHUD();

    if (state.cash <= 0) {
      showGameOver();
      return;
    }

    const propTemplate = PROPERTIES[Math.floor(Math.random() * PROPERTIES.length)];
    const ask = rand(propTemplate.askMin, propTemplate.askMax);
    const arv = Math.floor(ask * propTemplate.arvPct * state.marketMultipliers[state.marketPhase]);
    const renoCost = rand(propTemplate.renoMin, propTemplate.renoMax);
    const potentialProfit = arv - ask - renoCost;

    state.currentProperty = {
      name: propTemplate.name,
      icon: propTemplate.icon,
      ask,
      arv,
      renoCost,
      potentialProfit,
      purchasedWithLoan: false,
      loanAmount: 0,
      downPayment: 0,
      renovationSpent: 0,
      finalArv: arv,
    };

    $('deal-name').textContent = propTemplate.name;
    $('deal-img').textContent = propTemplate.icon;
    $('deal-ask').textContent = fmtMoney(ask);
    $('deal-arv').textContent = fmtMoney(arv);
    $('deal-reno').textContent = fmtMoney(renoCost);
    $('deal-profit').textContent = (potentialProfit >= 0 ? '+' : '') + fmtMoney(potentialProfit);
    $('deal-profit').className = potentialProfit >= 0 ? 'good' : 'danger';

    // Enable/disable buttons based on cash
    const canCash = state.cash >= ask;
    const canLoan = state.cash >= ask * 0.2;
    $('buy-cash-btn').style.opacity = canCash ? '1' : '0.4';
    $('buy-cash-btn').disabled = !canCash;
    $('buy-loan-btn').style.opacity = canLoan ? '1' : '0.4';
    $('buy-loan-btn').disabled = !canLoan;

    showScreen('deal-screen');
  }

  function buyProperty(useLoan) {
    const p = state.currentProperty;
    if (useLoan) {
      p.purchasedWithLoan = true;
      p.downPayment = Math.floor(p.ask * 0.2);
      p.loanAmount = p.ask - p.downPayment;
      state.cash -= p.downPayment;
    } else {
      state.cash -= p.ask;
    }
    updateHUD();
    showReno();
  }

  function showReno() {
    const p = state.currentProperty;
    $('reno-name').textContent = p.name;
    $('reno-purchase').textContent = fmtMoney(p.ask);
    $('reno-arv').textContent = fmtMoney(p.arv);

    const list = $('reno-options');
    list.innerHTML = '';
    RENOS.forEach(r => {
      const cost = Math.floor(p.renoCost * r.costPct);
      const newArv = Math.floor(p.arv * r.arvBoost);
      const row = document.createElement('div');
      row.className = 'reno-option' + (state.cash < cost ? ' disabled' : '');
      row.innerHTML = `
        <span class="reno-opt-icon">${r.icon}</span>
        <div class="reno-opt-info">
          <div class="reno-opt-name">${r.name}</div>
          <div class="reno-opt-desc">${r.desc} · ARV → ${fmtMoney(newArv)}</div>
        </div>
        <span class="reno-opt-cost">${fmtMoney(cost)}</span>
      `;
      if (state.cash >= cost) {
        row.addEventListener('click', () => doReno(r, cost, newArv));
      }
      list.appendChild(row);
    });

    showScreen('reno-screen');
  }

  function doReno(reno, cost, newArv) {
    state.cash -= cost;
    const p = state.currentProperty;
    p.renovationSpent = cost;
    p.finalArv = newArv;
    updateHUD();
    showSell();
  }

  function skipReno() {
    showSell();
  }

  function showSell() {
    const p = state.currentProperty;
    const marketMult = state.marketMultipliers[state.marketPhase];
    const salePrice = Math.floor(p.finalArv * marketMult);
    const invested = p.purchasedWithLoan ? p.downPayment + p.renovationSpent : p.ask + p.renovationSpent;

    $('sell-name').textContent = p.name;
    $('sell-invested').textContent = fmtMoney(invested);
    $('sell-arv').textContent = fmtMoney(p.finalArv);
    const pct = Math.round((marketMult - 1) * 100);
    $('sell-market').textContent = (pct >= 0 ? '+' : '') + pct + '%';
    $('sell-market').className = pct >= 0 ? 'good' : 'danger';
    $('sell-est').textContent = fmtMoney(salePrice);

    showScreen('sell-screen');
  }

  function sellNow() {
    const p = state.currentProperty;
    const marketMult = state.marketMultipliers[state.marketPhase];
    const salePrice = Math.floor(p.finalArv * marketMult);
    const closingCosts = Math.floor(salePrice * 0.06);
    const invested = p.purchasedWithLoan ? p.downPayment + p.renovationSpent : p.ask + p.renovationSpent;
    const loanPayoff = p.purchasedWithLoan ? p.loanAmount : 0;
    const profit = salePrice - closingCosts - loanPayoff - invested;
    const cashAfter = state.cash + salePrice - closingCosts - loanPayoff;
    const roi = invested > 0 ? (profit / invested) * 100 : 0;

    state.cash = cashAfter;
    state.totalProfit += profit;
    state.netWorth = state.cash;
    state.peakNetWorth = Math.max(state.peakNetWorth, state.netWorth);
    state.dealCount++;

    $('res-sale').textContent = fmtMoney(salePrice);
    $('res-loan').textContent = loanPayoff > 0 ? '-' + fmtMoney(loanPayoff) : '$0';
    $('res-closing').textContent = '-' + fmtMoney(closingCosts);
    $('res-profit').textContent = (profit >= 0 ? '+' : '') + fmtMoney(profit);
    $('res-profit').className = profit >= 0 ? 'good' : 'danger';
    $('res-cash').textContent = fmtMoney(cashAfter);
    $('res-roi').textContent = (roi >= 0 ? '+' : '') + roi.toFixed(0) + '%';
    $('res-roi').className = roi >= 0 ? 'good' : 'danger';
    $('result-title').textContent = profit >= 0 ? 'SOLD FOR PROFIT!' : 'SOLD AT A LOSS';
    $('result-title').className = profit >= 0 ? 'highlight' : 'danger';

    const tips = [
      'Leverage magnifies returns. A 20% down payment with 5x leverage turns a 10% gain into 50% ROI.',
      'Don\'t over-improve. The best flips match the neighborhood, not exceed it.',
      'Time the market. Sell in boom, buy in crash. Patience beats speed.',
      'Closing costs are 5-6%. Always factor them into your profit calculation.',
      'ARV = After Repair Value. Never pay more than 70% of ARV minus repairs.',
    ];
    $('res-tip').textContent = '💡 ' + tips[state.dealCount % tips.length];

    updateHUD();
    showScreen('result-screen');

    if (state.cash <= 0) {
      setTimeout(showGameOver, 500);
    }
  }

  function holdProperty() {
    // Hold for a year - market moves, property value changes
    advanceMarket();
    const p = state.currentProperty;
    p.finalArv = Math.floor(p.finalArv * state.marketMultipliers[state.marketPhase]);
    // Holding costs
    const holdingCost = p.purchasedWithLoan ? Math.floor(p.loanAmount * 0.05) : Math.floor(p.ask * 0.02);
    state.cash -= holdingCost;
    updateHUD();
    showSell();
  }

  function showGameOver() {
    $('final-deals').textContent = state.dealCount;
    $('final-profit').textContent = (state.totalProfit >= 0 ? '+' : '') + fmtMoney(state.totalProfit);
    $('final-profit').className = state.totalProfit >= 0 ? 'good' : 'danger';
    $('final-peak').textContent = fmtMoney(state.peakNetWorth);

    const tips = [
      'You went bankrupt. Real estate is leverage-heavy — one bad deal in a crash can wipe you out.',
      'The 70% rule: never pay more than 70% of ARV minus repair costs.',
      'Cash reserves matter. Keep 6 months of payments in the bank.',
      'Buy in fear, sell in greed. The best deals happen when others are scared.',
    ];
    $('go-tip').textContent = '💡 ' + tips[Math.floor(Math.random() * tips.length)];
    showScreen('gameover-screen');
  }

  // ===== EVENTS =====
  $('start-btn').addEventListener('click', initGame);
  $('buy-cash-btn').addEventListener('click', () => buyProperty(false));
  $('buy-loan-btn').addEventListener('click', () => buyProperty(true));
  $('pass-btn').addEventListener('click', () => { advanceMarket(); nextDeal(); });
  $('skip-reno-btn').addEventListener('click', skipReno);
  $('sell-now-btn').addEventListener('click', sellNow);
  $('hold-btn').addEventListener('click', holdProperty);
  $('next-deal-btn').addEventListener('click', nextDeal);
  $('restart-btn').addEventListener('click', initGame);

  window.initGame = initGame;
  showScreen('start-screen');
})();
