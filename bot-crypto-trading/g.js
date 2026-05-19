/* Crypto Trading Sim — MoneyBot Game Logic */
(function() {
  'use strict';

  // ======================== CONFIG ========================
  const START_CASH = 10000;
  const GOAL = 1000000;
  const LOSS_DRAWDOWN_PCT = 0.90; // 90% drawdown
  const TAX_ST_RATE = 0.35;
  const TAX_LT_RATE = 0.15;
  const LT_HOLD_DAYS = 30;
  const YEAR_DAYS = 365;

  const COINS = [
    { id: 'btc', name: 'Bitcoin', ticker: 'BTC', icon: '₿', basePrice: 45000, volatility: 0.035, color: '#F7931A' },
    { id: 'eth', name: 'Ethereum', ticker: 'ETH', icon: 'Ξ', basePrice: 3200, volatility: 0.045, color: '#627EEA' },
    { id: 'sol', name: 'Solana', ticker: 'SOL', icon: '◎', basePrice: 110, volatility: 0.065, color: '#14F195' },
    { id: 'doge', name: 'Dogecoin', ticker: 'DOGE', icon: 'Ð', basePrice: 0.085, volatility: 0.09, color: '#C2A633' },
    { id: 'shib', name: 'Shiba Inu', ticker: 'SHIB', icon: '🦴', basePrice: 0.000018, volatility: 0.12, color: '#FFA409' }
  ];

  const EVENTS = [
    { text: 'SEC approves Bitcoin ETF! Bull run incoming.', impact: 0.08, type: 'positive', coins: ['btc'] },
    { text: 'Major exchange hacked. Panic selling begins.', impact: -0.12, type: 'negative', coins: ['btc','eth','sol','doge','shib'] },
    { text: 'Elon tweets about Dogecoin. Meme coins surge.', impact: 0.15, type: 'positive', coins: ['doge','shib'] },
    { text: 'Fed announces rate cut. Risk assets rally.', impact: 0.05, type: 'positive', coins: ['btc','eth','sol'] },
    { text: 'Regulatory crackdown on crypto exchanges.', impact: -0.08, type: 'negative', coins: ['btc','eth','sol'] },
    { text: 'Solana network outage shakes confidence.', impact: -0.10, type: 'negative', coins: ['sol'] },
    { text: 'Institutional adoption accelerates. Smart money in.', impact: 0.06, type: 'positive', coins: ['btc','eth'] },
    { text: 'Meme coin mania fades. Speculators exit.', impact: -0.14, type: 'negative', coins: ['doge','shib'] },
    { text: 'Crypto winter? Analysts predict further downside.', impact: -0.06, type: 'negative', coins: ['btc','eth','sol','doge','shib'] },
    { text: 'DeFi summer returns. Ethereum gas spikes.', impact: 0.07, type: 'positive', coins: ['eth','sol'] },
    { text: 'Whale dumps SHIB. Price tanks 20%.', impact: -0.20, type: 'negative', coins: ['shib'] },
    { text: 'Market calm. No major news today.', impact: 0, type: 'neutral', coins: [] },
    { text: 'Bitcoin halving approaches. Miners accumulate.', impact: 0.04, type: 'positive', coins: ['btc'] },
    { text: 'Stablecoin depegs briefly. Market jitters.', impact: -0.05, type: 'negative', coins: ['btc','eth'] },
    { text: 'NFT marketplace launches on Solana. SOL pumps.', impact: 0.09, type: 'positive', coins: ['sol'] }
  ];

  // ======================== STATE ========================
  let state = null;

  function initState() {
    const seed = Math.random() * 100000 | 0;
    state = {
      day: 1,
      cash: START_CASH,
      portfolioValue: START_CASH,
      positions: {}, // coinId -> { shares, avgPrice, leverage, stopLoss, takeProfit, dayOpened }
      history: [],
      trades: { wins: 0, losses: 0 },
      realizedGains: 0,
      taxPaid: 0,
      maxValue: START_CASH,
      currentEvent: null,
      rng: mulberry32(seed),
      prices: {},
      priceHistory: {},
      paused: false,
      gameOver: false
    };
    COINS.forEach(c => {
      state.prices[c.id] = c.basePrice;
      state.priceHistory[c.id] = [c.basePrice];
    });
  }

  // ======================== RNG ========================
  function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function randRange(min, max) { return state.rng() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(state.rng() * (max - min + 1)) + min; }
  function randPick(arr) { return arr[Math.floor(state.rng() * arr.length)]; }
  function normalRandom(mean, std) {
    let u = 0, v = 0;
    while (u === 0) u = state.rng();
    while (v === 0) v = state.rng();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * std;
  }

  // ======================== DOM REFS ========================
  const $ = id => document.getElementById(id);
  const screens = {
    start: $('screen-start'),
    game: $('screen-game')
  };
  const modals = {
    portfolio: $('modal-portfolio'),
    pause: $('modal-pause'),
    win: $('modal-win'),
    loss: $('modal-loss'),
    tax: $('modal-tax')
  };

  // ======================== UTILS ========================
  function fmt$(n) {
    if (n === undefined || n === null) return '$0';
    const abs = Math.abs(n);
    if (abs >= 1000000) return '$' + (n / 1000000).toFixed(2) + 'M';
    if (abs >= 1000) return '$' + (n / 1000).toFixed(1) + 'K';
    if (abs >= 1) return '$' + n.toFixed(2);
    if (abs >= 0.001) return '$' + n.toFixed(4);
    return '$' + n.toFixed(6);
  }
  function fmtPct(n) { return (n >= 0 ? '+' : '') + n.toFixed(1) + '%'; }
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }
  function showModal(name) {
    modals[name].classList.remove('hidden');
    state.paused = true;
  }
  function hideModal(name) {
    modals[name].classList.add('hidden');
    if (!Object.values(modals).some(m => !m.classList.contains('hidden'))) {
      state.paused = false;
    }
  }
  function toast(msg, type = 'success') {
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    $('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  // ======================== PRICE ENGINE ========================
  function nextDay() {
    if (state.paused || state.gameOver) return;

    state.day++;

    // Pick event
    const eventRoll = state.rng();
    let evt = null;
    if (eventRoll < 0.35) {
      evt = randPick(EVENTS);
    }
    state.currentEvent = evt;

    // Update prices
    COINS.forEach(c => {
      let change = normalRandom(0, c.volatility);
      // Event impact
      if (evt && evt.coins.includes(c.id)) {
        change += evt.impact;
      }
      // Trend bias slightly positive over long run
      change += 0.002;

      const newPrice = Math.max(c.basePrice * 0.001, state.prices[c.id] * (1 + change));
      state.prices[c.id] = newPrice;
      state.priceHistory[c.id].push(newPrice);
      if (state.priceHistory[c.id].length > 30) state.priceHistory[c.id].shift();
    });

    // Check stop-losses and take-profits
    checkOrders();

    // Check liquidation
    checkLiquidation();

    // Update portfolio
    updatePortfolioValue();

    // Check year-end for taxes
    if (state.day % YEAR_DAYS === 0) {
      showTaxReport();
    }

    // Check win/loss
    checkWinLoss();

    render();
    renderEvent();
  }

  function checkOrders() {
    COINS.forEach(c => {
      const pos = state.positions[c.id];
      if (!pos || pos.shares <= 0) return;
      const price = state.prices[c.id];
      const entry = pos.avgPrice;
      const pctChange = (price - entry) / entry;

      // Stop loss
      if (pos.stopLoss && pctChange <= -pos.stopLoss / 100) {
        executeSell(c.id, pos.shares, true, 'Stop-loss hit');
      }
      // Take profit
      else if (pos.takeProfit && pctChange >= pos.takeProfit / 100) {
        executeSell(c.id, pos.shares, true, 'Take-profit hit');
      }
    });
  }

  function checkLiquidation() {
    COINS.forEach(c => {
      const pos = state.positions[c.id];
      if (!pos || pos.shares <= 0 || pos.leverage <= 1) return;
      const price = state.prices[c.id];
      const entry = pos.avgPrice;
      const pctChange = (price - entry) / entry;
      // Liquidation threshold: ~90% of leveraged position
      const liqThreshold = -0.90 / pos.leverage;
      if (pctChange <= liqThreshold) {
        liquidate(c.id);
      }
    });
  }

  function liquidate(coinId) {
    const pos = state.positions[coinId];
    if (!pos) return;
    const coin = COINS.find(c => c.id === coinId);
    const loss = pos.shares * pos.avgPrice * pos.leverage;
    state.cash -= loss;
    state.realizedGains -= loss;
    state.trades.losses++;
    state.history.push({
      day: state.day, coin: coinId, action: 'LIQUIDATED',
      shares: pos.shares, price: state.prices[coinId], pnl: -loss
    });
    delete state.positions[coinId];
    toast(`${coin.ticker} liquidated! -${fmt$(loss)}`, 'error');
    document.getElementById('game-shell').classList.add('shake');
    setTimeout(() => document.getElementById('game-shell').classList.remove('shake'), 500);
    checkWinLoss();
  }

  function updatePortfolioValue() {
    let invested = 0;
    COINS.forEach(c => {
      const pos = state.positions[c.id];
      if (pos && pos.shares > 0) {
        invested += pos.shares * state.prices[c.id];
      }
    });
    state.portfolioValue = state.cash + invested;
    if (state.portfolioValue > state.maxValue) state.maxValue = state.portfolioValue;
  }

  function checkWinLoss() {
    if (state.gameOver) return;
    // Win: $1M
    if (state.portfolioValue >= GOAL) {
      state.gameOver = true;
      showWin();
      return;
    }
    // Loss: 90% drawdown or cash <= 0
    const drawdown = (state.maxValue - state.portfolioValue) / state.maxValue;
    if (drawdown >= LOSS_DRAWDOWN_PCT || state.cash <= 0) {
      state.gameOver = true;
      showLoss(drawdown >= LOSS_DRAWDOWN_PCT ? 'drawdown' : 'liquidation');
    }
  }

  // ======================== TRADING ========================
  let tradeCoinId = null;
  let tradeTab = 'buy';
  let tradeLeverage = 1;

  function openTrade(coinId) {
    tradeCoinId = coinId;
    tradeTab = 'buy';
    tradeLeverage = 1;
    $('trade-panel').classList.remove('hidden');
    renderTradePanel();
  }
  function closeTrade() {
    $('trade-panel').classList.add('hidden');
    tradeCoinId = null;
  }

  function renderTradePanel() {
    if (!tradeCoinId) return;
    const coin = COINS.find(c => c.id === tradeCoinId);
    const price = state.prices[tradeCoinId];
    const pos = state.positions[tradeCoinId];

    $('tp-title').textContent = `Trade ${coin.ticker}`;
    $('tp-price-value').textContent = fmt$(price);

    if (pos && pos.shares > 0) {
      const unreal = pos.shares * (price - pos.avgPrice);
      $('tp-pos-shares').textContent = pos.shares.toFixed(4);
      $('tp-pos-avg').textContent = fmt$(pos.avgPrice);
      $('tp-pos-unreal').textContent = fmt$(unreal);
      $('tp-pos-unreal').style.color = unreal >= 0 ? 'var(--mb-green)' : 'var(--mb-red)';
      $('tp-position-info').classList.remove('hidden');
    } else {
      $('tp-position-info').classList.add('hidden');
    }

    // Tabs
    document.querySelectorAll('.tp-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tradeTab);
    });
    $('tp-action').textContent = tradeTab === 'buy' ? 'Buy' : 'Sell';
    $('tp-action').style.background = tradeTab === 'buy'
      ? 'linear-gradient(135deg, var(--mb-green) 0%, var(--mb-green-dark) 100%)'
      : 'linear-gradient(135deg, var(--mb-gold) 0%, #D97706 100%)';

    // Leverage
    document.querySelectorAll('.leverage-toggle button').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.lev) === tradeLeverage);
    });

    updateTradeSummary();
  }

  function updateTradeSummary() {
    const amt = parseFloat($('tp-amount').value) || 0;
    const coin = COINS.find(c => c.id === tradeCoinId);
    const price = state.prices[tradeCoinId];
    const shares = (amt * tradeLeverage) / price;
    const pos = state.positions[tradeCoinId];

    let summary = '';
    if (amt > 0) {
      if (tradeTab === 'buy') {
        summary = `Buy ${shares.toFixed(4)} ${coin.ticker} @ ${fmt$(price)} with ${tradeLeverage}x leverage`;
        if (tradeLeverage > 1) {
          const liq = price * (1 - 0.90 / tradeLeverage);
          summary += `. Liquidation ~${fmt$(liq)}`;
        }
      } else {
        const maxShares = pos ? pos.shares : 0;
        summary = `Sell ${Math.min(shares, maxShares).toFixed(4)} ${coin.ticker} @ ${fmt$(price)}`;
      }
    }
    $('tp-summary').textContent = summary;
  }

  function executeTrade() {
    if (!tradeCoinId) return;
    const amt = parseFloat($('tp-amount').value) || 0;
    if (amt <= 0) { toast('Enter an amount', 'error'); return; }

    if (tradeTab === 'buy') {
      const cost = amt;
      if (cost > state.cash) { toast('Not enough cash', 'error'); return; }
      executeBuy(tradeCoinId, amt, tradeLeverage);
    } else {
      const pos = state.positions[tradeCoinId];
      if (!pos || pos.shares <= 0) { toast('No position to sell', 'error'); return; }
      const price = state.prices[tradeCoinId];
      const shares = (amt * tradeLeverage) / price;
      executeSell(tradeCoinId, Math.min(shares, pos.shares));
    }
    closeTrade();
    render();
  }

  function executeBuy(coinId, cashAmt, leverage) {
    const coin = COINS.find(c => c.id === coinId);
    const price = state.prices[coinId];
    const shares = (cashAmt * leverage) / price;

    state.cash -= cashAmt;

    if (!state.positions[coinId]) {
      state.positions[coinId] = { shares: 0, avgPrice: 0, leverage, stopLoss: null, takeProfit: null, dayOpened: state.day };
    }
    const pos = state.positions[coinId];
    const totalCost = pos.shares * pos.avgPrice + shares * price;
    pos.shares += shares;
    pos.avgPrice = totalCost / pos.shares;
    pos.leverage = leverage;

    // Apply stop/take if set
    const stopVal = parseFloat($('tp-stop').value);
    const takeVal = parseFloat($('tp-take').value);
    if (stopVal > 0 && stopVal < 100) pos.stopLoss = stopVal;
    if (takeVal > 0) pos.takeProfit = takeVal;

    state.history.push({
      day: state.day, coin: coinId, action: 'BUY',
      shares, price, pnl: 0
    });
    toast(`Bought ${shares.toFixed(4)} ${coin.ticker}`, 'success');
  }

  function executeSell(coinId, shares, forced = false, reason = '') {
    const coin = COINS.find(c => c.id === coinId);
    const pos = state.positions[coinId];
    if (!pos || pos.shares <= 0) return;
    const price = state.prices[coinId];
    const sellShares = Math.min(shares, pos.shares);
    const proceeds = sellShares * price;
    const costBasis = sellShares * pos.avgPrice;
    const pnl = proceeds - costBasis;

    state.cash += proceeds;
    state.realizedGains += pnl;
    if (pnl > 0) state.trades.wins++; else state.trades.losses++;

    pos.shares -= sellShares;
    if (pos.shares <= 0.000001) {
      delete state.positions[coinId];
    }

    state.history.push({
      day: state.day, coin: coinId, action: forced ? 'STOP/TAKE' : 'SELL',
      shares: sellShares, price, pnl
    });

    const msg = forced ? `${coin.ticker} ${reason}! ${pnl >= 0 ? '+' : ''}${fmt$(pnl)}` : `Sold ${sellShares.toFixed(4)} ${coin.ticker} for ${fmt$(pnl)}`;
    toast(msg, pnl >= 0 ? 'success' : 'warn');
  }

  // ======================== TAX REPORT ========================
  function showTaxReport() {
    const stGains = Math.max(0, state.realizedGains); // simplified
    const stTax = stGains * TAX_ST_RATE;
    const ltGains = 0; // Would need per-trade tracking for true LT
    const ltTax = 0;
    const totalTax = stTax + ltTax;

    $('tax-year').textContent = Math.floor(state.day / YEAR_DAYS) + 1;
    $('tax-st-gains').textContent = fmt$(stGains);
    $('tax-st-tax').textContent = fmt$(stTax);
    $('tax-lt-gains').textContent = fmt$(ltGains);
    $('tax-lt-tax').textContent = fmt$(ltTax);
    $('tax-total').textContent = fmt$(totalTax);

    // Deduct tax
    state.cash -= totalTax;
    state.taxPaid += totalTax;
    state.realizedGains = 0; // Reset for next year

    showModal('tax');
  }

  // ======================== RENDER ========================
  function render() {
    // HUD
    $('hud-day').textContent = state.day;
    $('hud-portfolio').textContent = fmt$(state.portfolioValue);
    $('hud-cash').textContent = fmt$(state.cash);

    const pnl = state.portfolioValue - START_CASH;
    const pnlEl = $('hud-pnl');
    pnlEl.textContent = (pnl >= 0 ? '+' : '') + fmt$(pnl).replace('$', '');
    pnlEl.className = 'hud-value ' + (pnl >= 0 ? 'positive' : 'negative');

    // Goal bar
    const goalPct = Math.min(100, Math.max(1, (state.portfolioValue / GOAL) * 100));
    $('goal-fill').style.width = goalPct + '%';

    // Coin list
    renderCoinList();
  }

  function renderCoinList() {
    const list = $('coin-list');
    list.innerHTML = '';
    COINS.forEach(c => {
      const price = state.prices[c.id];
      const hist = state.priceHistory[c.id];
      const prev = hist.length > 1 ? hist[hist.length - 2] : price;
      const change = (price - prev) / prev;
      const pos = state.positions[c.id];

      const card = document.createElement('div');
      card.className = 'coin-card';
      card.onclick = () => openTrade(c.id);

      let posBadge = '';
      if (pos && pos.shares > 0) {
        posBadge = `<span class="coin-position">${pos.leverage > 1 ? pos.leverage + 'x ' : ''}${pos.shares.toFixed(2)}</span>`;
      }

      // Sparkline SVG
      const spark = buildSparkline(hist, c.color);

      card.innerHTML = `
        <div class="coin-icon" style="color:${c.color}">${c.icon}</div>
        <div class="coin-info">
          <div class="coin-name">${c.name}</div>
          <div class="coin-ticker">${c.ticker}</div>
        </div>
        <div class="coin-spark">${spark}</div>
        <div class="coin-price">
          <div class="coin-price-val">${fmt$(price)}</div>
          <div class="coin-change ${change >= 0 ? 'up' : 'down'}">${fmtPct(change * 100)}</div>
        </div>
        ${posBadge}
      `;
      list.appendChild(card);
    });
  }

  function buildSparkline(prices, color) {
    if (prices.length < 2) return '';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const w = 60, h = 30;
    const pts = prices.map((p, i) => {
      const x = (i / (prices.length - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${x},${y}`;
    }).join(' ');
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.7"/></svg>`;
  }

  function renderEvent() {
    const banner = $('event-banner');
    const evt = state.currentEvent;
    if (!evt) {
      banner.classList.add('hidden');
      return;
    }
    banner.classList.remove('hidden', 'positive', 'negative');
    banner.classList.add(evt.type);
    $('event-icon').textContent = evt.type === 'positive' ? '🚀' : evt.type === 'negative' ? '⚠️' : '📰';
    $('event-text').textContent = evt.text;
  }

  // ======================== PORTFOLIO MODAL ========================
  function renderPortfolio() {
    let invested = 0, unreal = 0;
    const posList = $('port-positions');
    posList.innerHTML = '';

    COINS.forEach(c => {
      const pos = state.positions[c.id];
      if (!pos || pos.shares <= 0) return;
      const val = pos.shares * state.prices[c.id];
      const cost = pos.shares * pos.avgPrice;
      const u = val - cost;
      invested += cost;
      unreal += u;

      const div = document.createElement('div');
      div.className = 'port-pos-item';
      div.innerHTML = `
        <div>
          <div class="ppi-name">${c.ticker} ${pos.leverage > 1 ? `<span style="color:var(--mb-red)">${pos.leverage}x</span>` : ''}</div>
          <div class="ppi-detail">${pos.shares.toFixed(4)} @ ${fmt$(pos.avgPrice)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700;color:${u>=0?'var(--mb-green)':'var(--mb-red)'}">${u>=0?'+':''}${fmt$(u)}</div>
          <div class="ppi-detail">${fmt$(val)}</div>
        </div>
      `;
      posList.appendChild(div);
    });

    if (posList.children.length === 0) {
      posList.innerHTML = '<div style="color:var(--mb-muted);font-size:13px;text-align:center;padding:12px">No open positions</div>';
    }

    $('port-total').textContent = fmt$(state.portfolioValue);
    $('port-cash').textContent = fmt$(state.cash);
    $('port-invested').textContent = fmt$(invested);
    $('port-realized').textContent = (state.realizedGains >= 0 ? '+' : '') + fmt$(state.realizedGains);
    $('port-realized').className = state.realizedGains >= 0 ? 'positive' : 'negative';
    $('port-unreal').textContent = (unreal >= 0 ? '+' : '') + fmt$(unreal);
    $('port-unreal').className = unreal >= 0 ? 'positive' : 'negative';

    const totalTrades = state.trades.wins + state.trades.losses;
    $('port-winrate').textContent = totalTrades > 0 ? Math.round((state.trades.wins / totalTrades) * 100) + '%' : '0%';
    $('port-tax').textContent = fmt$(state.taxPaid);

    const dd = state.maxValue > 0 ? ((state.maxValue - state.portfolioValue) / state.maxValue * 100).toFixed(1) : '0';
    $('port-drawdown').textContent = dd + '%';

    // History
    const histEl = $('port-history');
    histEl.innerHTML = '';
    [...state.history].reverse().slice(0, 20).forEach(h => {
      const coin = COINS.find(c => c.id === h.coin);
      const row = document.createElement('div');
      row.className = 'hist-row';
      const actionClass = h.action === 'BUY' ? 'buy' : h.action === 'SELL' ? 'sell' : 'liquidated';
      row.innerHTML = `
        <span><span class="hist-action ${actionClass}">${h.action}</span> ${coin.ticker} ${h.shares.toFixed(2)}</span>
        <span>${h.pnl !== 0 ? (h.pnl >= 0 ? '+' : '') + fmt$(h.pnl) : ''}</span>
      `;
      histEl.appendChild(row);
    });
  }

  // ======================== WIN/LOSS ========================
  function showWin() {
    const totalTrades = state.trades.wins + state.trades.losses;
    $('win-days').textContent = state.day;
    $('win-winrate').textContent = totalTrades > 0 ? Math.round((state.trades.wins / totalTrades) * 100) + '%' : '0%';
    $('win-tax').textContent = fmt$(state.taxPaid);
    const dd = state.maxValue > 0 ? ((state.maxValue - Math.min(state.portfolioValue, state.maxValue)) / state.maxValue * 100).toFixed(1) : '0';
    $('win-drawdown').textContent = dd + '%';
    showModal('win');
  }

  function showLoss(reason) {
    const totalTrades = state.trades.wins + state.trades.losses;
    $('loss-days').textContent = state.day;
    $('loss-final').textContent = fmt$(state.portfolioValue);
    $('loss-winrate').textContent = totalTrades > 0 ? Math.round((state.trades.wins / totalTrades) * 100) + '%' : '0%';
    $('loss-tax').textContent = fmt$(state.taxPaid);

    if (reason === 'drawdown') {
      $('loss-reason').textContent = '90% drawdown. Risk management matters.';
      $('loss-tip').textContent = 'Tip: Use stop-losses and diversify across coins. Never bet the farm on one trade.';
    } else {
      $('loss-reason').textContent = 'Liquidated. Leverage is a double-edged sword.';
      $('loss-tip').textContent = 'Tip: Lower leverage gives you more room before liquidation. 10x can wipe you out with a 10% move.';
    }
    showModal('loss');
  }

  // ======================== EVENT LISTENERS ========================
  $('btn-start').onclick = () => { initState(); showScreen('game'); render(); };
  $('btn-next-day').onclick = nextDay;
  $('btn-pause').onclick = () => showModal('pause');
  $('btn-resume').onclick = () => hideModal('pause');
  $('btn-restart').onclick = () => { hideModal('pause'); initState(); showScreen('start'); };
  $('btn-play-again-win').onclick = () => { hideModal('win'); initState(); showScreen('start'); };
  $('btn-play-again-loss').onclick = () => { hideModal('loss'); initState(); showScreen('start'); };
  $('btn-portfolio').onclick = () => { renderPortfolio(); showModal('portfolio'); };
  $('btn-tax-ok').onclick = () => hideModal('tax');
  $('tp-close').onclick = closeTrade;
  $('tp-action').onclick = executeTrade;

  document.querySelectorAll('.tp-tab').forEach(t => {
    t.onclick = () => { tradeTab = t.dataset.tab; renderTradePanel(); };
  });
  document.querySelectorAll('.leverage-toggle button').forEach(b => {
    b.onclick = () => { tradeLeverage = parseInt(b.dataset.lev); renderTradePanel(); updateTradeSummary(); };
  });
  document.querySelectorAll('.tp-quick button').forEach(b => {
    b.onclick = () => {
      const pct = parseInt(b.dataset.pct);
      $('tp-amount').value = Math.floor(state.cash * (pct / 100));
      updateTradeSummary();
    };
  });
  $('tp-amount').oninput = updateTradeSummary;
  $('tp-stop').oninput = updateTradeSummary;
  $('tp-take').oninput = updateTradeSummary;

  document.querySelectorAll('.modal-close').forEach(b => {
    b.onclick = () => hideModal(b.dataset.close);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (state.gameOver) return;
    if (e.key === 'n' || e.key === 'N') nextDay();
    if (e.key === 'p' || e.key === 'P') showModal('pause');
    if (e.key === 'b' || e.key === 'B') { if (tradeCoinId) { tradeTab = 'buy'; renderTradePanel(); } }
    if (e.key === 's' || e.key === 'S') { if (tradeCoinId) { tradeTab = 'sell'; renderTradePanel(); } }
    if (e.key === 'Escape') {
      if (!$('trade-panel').classList.contains('hidden')) closeTrade();
      else if (!modals.pause.classList.contains('hidden')) hideModal('pause');
    }
  });

  // Prevent zoom on double-tap
  let lastTouch = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouch < 300) e.preventDefault();
    lastTouch = now;
  }, { passive: false });

})();
