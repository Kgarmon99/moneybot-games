(function() {
  'use strict';

  let state = {
    day: 1,
    cash: 10000,
    rating: 3.0,
    customersServed: 0,
    dailyRevenue: 0,
    dailyCosts: 0,
    dailyProfit: 0,
    totalProfit: 0,
    bestDay: 0,
    peakRating: 3.0,
    gameOver: false,
    won: false,
    // Staff
    cooks: 1,
    servers: 1,
    // Pricing
    menuPrice: 15,
    foodCostPer: 5,
    // Upgrades
    marketing: 0,
    kitchen: 0,
    seating: 0,
    // Tracking
    waitingCustomers: 0,
    servedToday: 0,
  };

  const ACTIONS = [
    { id: 'low-price', icon: '📉', name: 'Lower Prices', desc: '-$2 menu price. +20% customers today.', cost: 0, effect: s => ({ menuPrice: Math.max(5, s.menuPrice - 2), waitingCustomers: Math.floor(s.waitingCustomers * 1.2) }) },
    { id: 'high-price', icon: '📈', name: 'Raise Prices', desc: '+$2 menu price. -15% customers today.', cost: 0, effect: s => ({ menuPrice: s.menuPrice + 2, waitingCustomers: Math.floor(s.waitingCustomers * 0.85) }) },
    { id: 'portion', icon: '🍕', name: 'Bigger Portions', desc: '+$1 food cost. +0.2 rating boost today.', cost: 0, effect: s => ({ foodCostPer: s.foodCostPer + 1, rating: Math.min(5, s.rating + 0.2) }) },
    { id: 'cut-portion', icon: '✂️', name: 'Cut Portions', desc: '-$1 food cost. -0.2 rating hit today.', cost: 0, effect: s => ({ foodCostPer: Math.max(2, s.foodCostPer - 1), rating: Math.max(1, s.rating - 0.2) }) },
    { id: 'hire-cook', icon: '👨‍🍳', name: 'Hire Cook', desc: 'Serve +10 more/day. Cost: $80/day.', cost: 0, effect: s => ({ cooks: s.cooks + 1 }) },
    { id: 'hire-server', icon: '💁', name: 'Hire Server', desc: 'Better service. +0.1 rating.', cost: 0, effect: s => ({ servers: s.servers + 1, rating: Math.min(5, s.rating + 0.1) }) },
    { id: 'promo', icon: '📢', name: 'Run Promotion', desc: '+50% customers today. Cost: $200.', cost: 200, effect: s => ({ waitingCustomers: Math.floor(s.waitingCustomers * 1.5) }) },
    { id: 'quality', icon: '⭐', name: 'Quality Focus', desc: 'Spend extra on ingredients. +0.3 rating. Cost: $300.', cost: 300, effect: s => ({ rating: Math.min(5, s.rating + 0.3) }) },
  ];

  const UPGRADES = [
    { id: 'marketing', icon: '📱', name: 'Social Media', desc: '+5 base customers/day', baseCost: 500, costMult: 1.5, max: 10, effect: s => ({ marketing: s.marketing + 1 }) },
    { id: 'kitchen', icon: '🔥', name: 'Better Equipment', desc: 'Cooks serve +5 more/day', baseCost: 800, costMult: 1.6, max: 8, effect: s => ({ kitchen: s.kitchen + 1 }) },
    { id: 'seating', icon: '🪑', name: 'Extra Seating', desc: '+8 max customers/day', baseCost: 600, costMult: 1.5, max: 10, effect: s => ({ seating: s.seating + 1 }) },
    { id: 'decor', icon: '🎨', name: 'Renovate Decor', desc: '+0.2 permanent rating', baseCost: 1200, costMult: 2, max: 5, effect: s => ({ rating: Math.min(5, s.rating + 0.2) }) },
  ];

  const EVENTS = [
    { text: '📰 Food critic visits! Rating boost if quality is high.', good: true },
    { text: '🐛 Health inspection! Rating drops if understaffed.', good: false },
    { text: '🌧️ Rainy day. -30% customers.', good: false },
    { text: '🎉 Local event nearby! +40% customers.', good: true },
    { text: '📈 Food supplier raised prices. +$1 food cost today.', good: false },
    { text: '💬 Viral review! +0.3 rating.', good: true },
    { text: '😠 Bad Yelp review. -0.2 rating.', good: false },
    { text: '🎂 Birthday party books! +15 customers.', good: true },
  ];

  const $ = id => document.getElementById(id);

  function fmtMoney(n) {
    if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + Math.floor(n);
  }

  function updateHUD() {
    $('day-val').textContent = state.day;
    $('cash-val').textContent = fmtMoney(state.cash);
    $('rating-val').textContent = state.rating.toFixed(1);
    $('rating-val').style.color = state.rating >= 4.5 ? 'var(--mb-green)' : state.rating >= 3.5 ? 'var(--mb-gold)' : 'var(--mb-red)';
    $('customers-val').textContent = state.servedToday;
    $('revenue-val').textContent = fmtMoney(state.dailyRevenue);
    $('costs-val').textContent = fmtMoney(state.dailyCosts);
    $('profit-val').textContent = (state.dailyProfit >= 0 ? '+' : '') + fmtMoney(state.dailyProfit);
    $('profit-val').style.color = state.dailyProfit >= 0 ? 'var(--mb-green)' : 'var(--mb-red)';
  }

  function showScreen(id) {
    ['start-screen', 'game-screen', 'gameover-screen', 'win-screen'].forEach(sid => {
      $(sid).classList.toggle('active', sid === id);
      if (sid === id) $(sid).classList.remove('hidden');
    });
  }

  function initGame() {
    state = {
      day: 1, cash: 10000, rating: 3.0,
      customersServed: 0, dailyRevenue: 0, dailyCosts: 0, dailyProfit: 0,
      totalProfit: 0, bestDay: 0, peakRating: 3.0,
      gameOver: false, won: false,
      cooks: 1, servers: 1,
      menuPrice: 15, foodCostPer: 5,
      marketing: 0, kitchen: 0, seating: 0,
      waitingCustomers: 0, servedToday: 0,
    };
    $('hud').classList.remove('hidden');
    $('day-summary').classList.add('hidden');
    $('event-banner').classList.add('hidden');
    $('action-panel').classList.remove('hidden');
    $('upgrades-panel').classList.remove('hidden');
    updateHUD();
    renderActions();
    renderUpgrades();
    showScreen('game-screen');
  }

  function calcBaseCustomers() {
    let base = 20;
    base += state.marketing * 5;
    base += Math.floor(state.rating * 8);
    base += state.day * 1.5;
    return Math.floor(base);
  }

  function calcCapacity() {
    return 15 + state.cooks * 10 + state.kitchen * 5 + state.seating * 8;
  }

  function doAction(action) {
    if (state.gameOver || state.won) return;
    if (action.cost > 0 && state.cash < action.cost) return;
    if (action.cost > 0) state.cash -= action.cost;

    const changes = action.effect(state);
    Object.assign(state, changes);

    // End the day
    endDay();
  }

  function endDay() {
    // Calculate customers
    let customers = state.waitingCustomers || calcBaseCustomers();
    const capacity = calcCapacity();
    const served = Math.min(customers, capacity);
    state.servedToday = served;
    state.customersServed += served;

    // Revenue
    const revenue = served * state.menuPrice;
    state.dailyRevenue = revenue;

    // Costs
    const foodCost = served * state.foodCostPer;
    const laborCost = (state.cooks * 80) + (state.servers * 60);
    const rent = 150;
    const utils = 50;
    const totalCosts = foodCost + laborCost + rent + utils;
    state.dailyCosts = totalCosts;

    // Profit
    state.dailyProfit = revenue - totalCosts;
    state.cash += state.dailyProfit;
    state.totalProfit += state.dailyProfit;
    if (state.dailyProfit > state.bestDay) state.bestDay = state.dailyProfit;

    // Rating drift
    if (served < customers * 0.5) {
      state.rating = Math.max(1, state.rating - 0.15);
    }
    if (state.rating > state.peakRating) state.peakRating = state.rating;

    state.day++;
    state.waitingCustomers = 0;
    updateHUD();

    // Event
    const event = Math.random() < 0.3 ? EVENTS[Math.floor(Math.random() * EVENTS.length)] : null;
    if (event) {
      if (event.text.includes('Rainy')) state.servedToday = Math.floor(state.servedToday * 0.7);
      if (event.text.includes('Local event')) state.servedToday = Math.floor(state.servedToday * 1.4);
      if (event.text.includes('supplier raised')) state.foodCostPer += 1;
      if (event.text.includes('Viral review')) state.rating = Math.min(5, state.rating + 0.3);
      if (event.text.includes('Bad Yelp')) state.rating = Math.max(1, state.rating - 0.2);
      if (event.text.includes('Birthday party')) state.servedToday += 15;
      if (event.text.includes('Food critic') && state.foodCostPer >= 5) state.rating = Math.min(5, state.rating + 0.2);
      if (event.text.includes('Health inspection') && (state.cooks + state.servers) < 3) state.rating = Math.max(1, state.rating - 0.3);
    }

    // Show summary
    showSummary(event);
  }

  function showSummary(event) {
    $('action-panel').classList.add('hidden');
    $('upgrades-panel').classList.add('hidden');
    $('day-summary').classList.remove('hidden');

    $('sum-customers').textContent = state.servedToday;
    $('sum-revenue').textContent = fmtMoney(state.dailyRevenue);
    $('sum-food').textContent = fmtMoney(state.servedToday * state.foodCostPer);
    $('sum-labor').textContent = fmtMoney((state.cooks * 80) + (state.servers * 60));
    $('sum-rent').textContent = fmtMoney(200);
    $('sum-profit').textContent = (state.dailyProfit >= 0 ? '+' : '') + fmtMoney(state.dailyProfit);
    $('sum-profit').className = state.dailyProfit >= 0 ? 'good' : 'danger';

    const banner = $('event-banner');
    if (event) {
      banner.textContent = event.text;
      banner.className = 'event-banner' + (event.good ? ' good' : '');
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }

    const tips = [
      'Food cost is your biggest variable. Watch it as a % of revenue — aim for under 30%.',
      'Rating drives long-term traffic. One bad review costs more than a day of low profit.',
      'Staffing matters. Understaffed = slow service = bad reviews = death spiral.',
      'Marketing brings people in, but quality keeps them coming back.',
      'Cash flow is king. Even profitable restaurants go broke if cash runs out.',
    ];
    $('sum-tip').textContent = '💡 ' + tips[(state.day - 2) % tips.length];

    // Check win/loss
    if (state.cash >= 50000 && state.rating >= 4.0) {
      state.won = true;
      setTimeout(showWin, 500);
      return;
    }
    if (state.cash <= 0) {
      state.gameOver = true;
      setTimeout(showGameOver, 500);
      return;
    }
  }

  function nextDay() {
    $('day-summary').classList.add('hidden');
    $('event-banner').classList.add('hidden');
    $('action-panel').classList.remove('hidden');
    $('upgrades-panel').classList.remove('hidden');
    renderActions();
    renderUpgrades();
  }

  function showGameOver() {
    $('final-days').textContent = state.day;
    $('final-peak-rating').textContent = state.peakRating.toFixed(1);
    $('final-profit').textContent = (state.totalProfit >= 0 ? '+' : '') + fmtMoney(state.totalProfit);
    $('final-best').textContent = (state.bestDay >= 0 ? '+' : '') + fmtMoney(state.bestDay);

    const tips = [
      'Restaurants fail when costs outrun revenue. Monitor food cost % daily.',
      'Cash reserves matter. Keep at least 2 weeks of operating costs in the bank.',
      'Bad reviews compound. Fix service issues before they become reputation issues.',
    ];
    $('go-tip').textContent = '💡 ' + tips[Math.floor(Math.random() * tips.length)];
    showScreen('gameover-screen');
  }

  function showWin() {
    $('win-days').textContent = state.day;
    $('win-rating').textContent = state.rating.toFixed(1);
    $('win-profit').textContent = fmtMoney(state.totalProfit);
    $('win-cash').textContent = fmtMoney(state.cash);
    showScreen('win-screen');
  }

  function renderActions() {
    const list = $('actions-list');
    list.innerHTML = '';
    ACTIONS.forEach(a => {
      const row = document.createElement('div');
      row.className = 'action-row' + (a.cost > 0 && state.cash < a.cost ? ' disabled' : '');
      row.innerHTML = `
        <span class="action-icon">${a.icon}</span>
        <div class="action-info">
          <div class="action-name">${a.name}</div>
          <div class="action-desc">${a.desc}</div>
        </div>
        ${a.cost > 0 ? `<span class="action-cost">${fmtMoney(a.cost)}</span>` : ''}
      `;
      row.addEventListener('click', () => doAction(a));
      list.appendChild(row);
    });
  }

  function renderUpgrades() {
    const list = $('upgrades-list');
    list.innerHTML = '';
    UPGRADES.forEach(u => {
      const lvl = state[u.id] || 0;
      const cost = Math.floor(u.baseCost * Math.pow(u.costMult, lvl));
      const maxed = lvl >= u.max;
      const canAfford = state.cash >= cost;
      const row = document.createElement('div');
      row.className = 'upgrade-row' + (!canAfford || maxed ? ' disabled' : '');
      row.innerHTML = `
        <span class="upgrade-icon">${u.icon}</span>
        <div class="upgrade-info">
          <div class="upgrade-name">${u.name}</div>
          <div class="upgrade-desc">${u.desc}</div>
          <div class="upgrade-desc" style="color:var(--mb-green)">Level ${lvl}${u.max < 99 ? '/' + u.max : ''}</div>
        </div>
        <span class="upgrade-cost">${maxed ? 'MAX' : fmtMoney(cost)}</span>
      `;
      if (!maxed && canAfford) {
        row.addEventListener('click', () => buyUpgrade(u, cost));
      }
      list.appendChild(row);
    });
  }

  function buyUpgrade(u, cost) {
    if (state.cash < cost) return;
    state.cash -= cost;
    state[u.id] = (state[u.id] || 0) + 1;
    const changes = u.effect(state);
    Object.assign(state, changes);
    updateHUD();
    renderUpgrades();
  }

  $('start-btn').addEventListener('click', initGame);
  $('close-summary-btn').addEventListener('click', nextDay);
  $('restart-btn').addEventListener('click', initGame);
  $('win-restart-btn').addEventListener('click', initGame);

  window.initGame = initGame;
  window.nextDay = nextDay;
  showScreen('start-screen');
})();
