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
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.addEventListener('click', () => selectSupplier(s));
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectSupplier(s);
          }
        });
      }
      container.appendChild(card);
    });
  }

  function selectSupplier(supplier) {
    state.selectedSupplier = supplier;
    showPhase('quantity');
  }

  // ===== PHASE: QUANTITY =====
  function initQuantityPhase() {
    const s = state.selectedSupplier;
    const slider = $('qty-slider');
    const maxAfford = Math.floor(state.cash / s.cost);
    const maxQty = Math.min(s.maxOrder, maxAfford);
    const minQty = s.minOrder;
    const defaultQty = Math.min(maxQty, Math.max(minQty, minQty * 2));

    slider.min = minQty;
    slider.max = maxQty;
    slider.step = Math.max(1, Math.floor((maxQty - minQty) / 20));
    slider.value = defaultQty;
    state.orderQty = defaultQty;

    $('qty-min').textContent = minQty;
    $('qty-max').textContent = fmtNum(maxQty);

    updateQuantityDisplay();
    slider.oninput = updateQuantityDisplay;
    $('btn-confirm-qty').onclick = () => {
      if (state.orderQty < state.selectedSupplier.minOrder) {
        showToast('Minimum order is ' + state.selectedSupplier.minOrder + ' units');
        return;
      }
      showPhase('price');
    };
  }

  function updateQuantityDisplay() {
    state.orderQty = parseInt($('qty-slider').value);
    const s = state.selectedSupplier;
    const totalCost = state.orderQty * s.cost;
    const cashAfter = state.cash - totalCost;

    $('qty-supplier').textContent = s.name;
    $('qty-unit-cost').textContent = '$' + s.cost.toFixed(2);
    $('qty-value').textContent = fmtNum(state.orderQty);
    $('qty-total').textContent = fmtMoney(totalCost);
    $('qty-cash-after').textContent = fmtMoney(cashAfter);
    $('qty-cash-after').className = 'price-value ' + (cashAfter >= 0 ? 'good' : 'danger');

    if (cashAfter < 0) {
      $('qty-tip').textContent = '⚠️ Not enough cash for this order!';
      $('qty-tip').className = 'conversion-est danger';
    } else if (state.orderQty > state.orderQty * 3) {
      $('qty-tip').textContent = 'Large order — watch carrying costs!';
      $('qty-tip').className = 'conversion-est';
    } else {
      $('qty-tip').textContent = 'Order enough to cover expected sales';
      $('qty-tip').className = 'conversion-est';
    }
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

    // Add to inventory (with lead time + possible delay event)
    const extraLeadTime = (state.todayEvent && state.todayEvent.effect === 'delay') ? 1 : 0;
    const totalLeadTime = s.leadTime + extraLeadTime;
    if (totalLeadTime === 0) {
      state.inventory += state.orderQty;
    } else {
      state.inventoryIncoming.push({
        units: state.orderQty,
        arrivesDay: state.day + totalLeadTime,
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
    let processorOrderLoss = 1.0;
    if (state.todayEvent) {
      if (state.todayEvent.effect === 'viral') visitors = Math.round(visitors * 1.3);
      if (state.todayEvent.effect === 'influencer') visitors += 500;
      if (state.todayEvent.effect === 'processor') processorOrderLoss = 0.8;
    }

    // Conversion rate
    const marketPrice = s.cost * 3;
    const ratio = state.price / marketPrice;
    let conversion = 0.12 / Math.pow(ratio, 1.8);
    conversion = Math.max(0.005, Math.min(0.30, conversion));
    conversion *= (0.7 + s.quality * 0.3);
    conversion *= (0.8 + (state.rating / 5) * 0.2);
    conversion *= state.season.multiplier;

    let orders = Math.min(state.inventory, Math.round(visitors * conversion * processorOrderLoss));

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
    // Update HUD immediately so player sees new cash/profit
    updateHUD();

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

    // Check win/loss immediately — don't make player click "Next Day" if game is over
    if (state.cash <= 0) {
      $('btn-next-day').textContent = 'View Results →';
      $('btn-next-day').onclick = () => endGame(false);
    } else if (state.totalProfit >= WIN_PROFIT || state.totalUnitsSold >= WIN_UNITS) {
      $('btn-next-day').textContent = 'Claim Victory! →';
      $('btn-next-day').onclick = () => endGame(true);
    } else {
      $('btn-next-day').textContent = 'Next Day →';
      $('btn-next-day').onclick = nextDay;
    }

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
    ['source', 'quantity', 'price', 'ads', 'results'].forEach(p => {
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

    if (phase === 'quantity') initQuantityPhase();
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
    rollEvent();
    showScreen('game');
    showSeasonBanner();
    if (state.todayEvent) showEventBanner();
    showPhase('source');
    renderSuppliers();
  }

  // Boot
  init();
})();
