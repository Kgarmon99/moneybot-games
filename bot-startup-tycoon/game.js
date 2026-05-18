(function() {
  'use strict';

  // ===== STATE =====
  let state = {
    month: 1,
    cash: 500000,
    mrr: 0,
    burn: 25000,
    team: 2,
    productStage: 0, // 0=MVP, 1=Beta, 2=GA, 3=Enterprise
    productStageNames: ['MVP', 'Beta', 'GA', 'Enterprise'],
    runway: 0,
    history: [],
    gameOver: false,
    won: false,
  };

  const STAGES = ['MVP', 'Beta', 'GA', 'Enterprise'];

  const ACTIONS = [
    {
      id: 'build',
      icon: '🔨',
      title: 'Build Product',
      desc: 'Ship features. Move to next product stage to unlock higher pricing.',
      effects: [
        { text: 'Product ↑', cls: 'green' },
        { text: 'Cost: -$10K', cls: 'red' },
      ],
    },
    {
      id: 'hire',
      icon: '👥',
      title: 'Hire Team',
      desc: 'More people build and sell faster. But burn rate jumps.',
      effects: [
        { text: 'Team +2', cls: 'blue' },
        { text: 'Burn +$8K/mo', cls: 'red' },
        { text: 'Cost: -$15K', cls: 'red' },
      ],
    },
    {
      id: 'market',
      icon: '📢',
      title: 'Go to Market',
      desc: 'Spend on sales & marketing to grow MRR based on product stage.',
      effects: [
        { text: 'MRR ↑', cls: 'green' },
        { text: 'Cost: -$20K', cls: 'red' },
      ],
    },
    {
      id: 'fundraise',
      icon: '💰',
      title: 'Raise Round',
      desc: 'Get cash infusion. Dilution costs grow with each round.',
      effects: [
        { text: 'Cash +$300K', cls: 'gold' },
        { text: 'Dilution', cls: 'red' },
      ],
    },
    {
      id: 'cut',
      icon: '✂️',
      title: 'Cut Costs',
      desc: 'Layoffs are brutal but buy runway. Lose some MRR.',
      effects: [
        { text: 'Burn -30%', cls: 'green' },
        { text: 'MRR -15%', cls: 'red' },
        { text: 'Team -1', cls: 'red' },
      ],
    },
  ];

  const EVENTS = [
    { text: '📉 Market correction! MRR growth slows 20% this month.', good: false },
    { text: '💰 A customer pays annual upfront! +$50K cash.', good: true },
    { text: '🔥 Key engineer quits. Burn drops but product stalls.', good: false },
    { text: '📰 Viral blog post! Free MRR +$5K.', good: true },
    { text: '🏛️ New compliance rules. One-time cost: -$30K.', good: false },
    { text: '🤝 Partner integration deal. MRR +$8K.', good: true },
    { text: '🐛 Major outage. Churn spike: lose 10% MRR.', good: false },
    { text: '🎉 Customer success story goes viral. Free marketing month.', good: true },
  ];

  // ===== DOM =====
  const $ = id => document.getElementById(id);
  const screens = {
    start: $('start-screen'),
    game: $('game-screen'),
    summary: $('summary-screen'),
    gameover: $('gameover-screen'),
    win: $('win-screen'),
  };
  const hud = $('hud');

  function fmtMoney(n) {
    if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
    return '$' + n;
  }

  function calcRunway() {
    if (state.burn <= 0) return 999;
    return Math.floor(state.cash / state.burn);
  }

  function updateHUD() {
    $('month-val').textContent = state.month;
    $('runway-val').textContent = calcRunway() + ' mo';
    $('cash-val').textContent = fmtMoney(state.cash);
    $('mrr-val').textContent = fmtMoney(state.mrr);
    $('burn-val').textContent = '-' + fmtMoney(state.burn) + '/mo';
    $('team-val').textContent = state.team;
    $('product-val').textContent = STAGES[state.productStage];

    const r = calcRunway();
    $('runway-val').style.color = r <= 3 ? 'var(--mb-red)' : r <= 6 ? 'var(--mb-gold)' : 'var(--mb-green)';
  }

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  // ===== GAME LOGIC =====
  function initGame() {
    state = {
      month: 1,
      cash: 500000,
      mrr: 0,
      burn: 25000,
      team: 2,
      productStage: 0,
      productStageNames: STAGES,
      runway: 0,
      history: [],
      gameOver: false,
      won: false,
    };
    updateHUD();
    hud.classList.remove('hidden');
    renderCards();
    showScreen('game');
  }

  function renderCards() {
    const container = $('cards-container');
    container.innerHTML = '';
    ACTIONS.forEach(action => {
      const card = document.createElement('div');
      card.className = 'card';
      const effectsHtml = action.effects.map(e =>
        `<span class="effect-tag ${e.cls}">${e.text}</span>`
      ).join('');
      card.innerHTML = `
        <div class="card-header">
          <span class="card-icon">${action.icon}</span>
          <span class="card-title">${action.title}</span>
        </div>
        <div class="card-desc">${action.desc}</div>
        <div class="card-effects">${effectsHtml}</div>
      `;
      card.addEventListener('click', () => doAction(action));
      container.appendChild(card);
    });
  }

  function doAction(action) {
    if (state.gameOver) return;

    const prevCash = state.cash;
    const prevMrr = state.mrr;
    const prevBurn = state.burn;
    const event = Math.random() < 0.35 ? EVENTS[Math.floor(Math.random() * EVENTS.length)] : null;

    switch (action.id) {
      case 'build':
        state.cash -= 10000;
        if (state.productStage < 3) state.productStage++;
        break;
      case 'hire':
        state.cash -= 15000;
        state.team += 2;
        state.burn += 8000;
        break;
      case 'market':
        state.cash -= 20000;
        // MRR growth depends on product stage and team size
        const baseGrowth = [3000, 8000, 15000, 25000][state.productStage];
        const teamMult = 1 + (state.team * 0.15);
        state.mrr += Math.floor(baseGrowth * teamMult);
        break;
      case 'fundraise':
        state.cash += 300000;
        state.burn = Math.floor(state.burn * 1.05); // dilution pressure
        break;
      case 'cut':
        state.burn = Math.floor(state.burn * 0.7);
        state.mrr = Math.floor(state.mrr * 0.85);
        state.team = Math.max(1, state.team - 1);
        break;
    }

    // Apply event
    if (event) {
      if (event.text.includes('slows 20%')) state.mrr = Math.floor(state.mrr * 0.8);
      if (event.text.includes('+\u002450K')) state.cash += 50000;
      if (event.text.includes('engineer quits')) { state.burn = Math.floor(state.burn * 0.85); state.team = Math.max(1, state.team - 1); }
      if (event.text.includes('+\u00245K')) state.mrr += 5000;
      if (event.text.includes('One-time cost')) state.cash -= 30000;
      if (event.text.includes('+\u00248K')) state.mrr += 8000;
      if (event.text.includes('lose 10%')) state.mrr = Math.floor(state.mrr * 0.9);
    }

    // Monthly revenue collection (MRR)
    state.cash += state.mrr;
    // Monthly burn
    state.cash -= state.burn;

    state.month++;
    updateHUD();

    // Check win/loss
    if (state.mrr >= state.burn && state.cash > 0) {
      state.won = true;
      showWin();
      return;
    }
    if (state.cash <= 0) {
      state.gameOver = true;
      showGameOver();
      return;
    }

    // Show summary
    showSummary(prevCash, prevMrr, prevBurn, event);
  }

  function showSummary(prevCash, prevMrr, prevBurn, event) {
    $('summary-month').textContent = state.month - 1;
    $('sum-start-cash').textContent = fmtMoney(prevCash);
    const revDelta = state.mrr - prevMrr + prevMrr; // collected this month's MRR
    $('sum-revenue').textContent = '+' + fmtMoney(prevMrr);
    $('sum-burn').textContent = '-' + fmtMoney(prevBurn);
    $('sum-end-cash').textContent = fmtMoney(state.cash);
    $('sum-runway').textContent = calcRunway() + ' months';

    const banner = $('event-banner');
    if (event) {
      banner.textContent = event.text;
      banner.className = 'event-banner' + (event.good ? ' good' : '');
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }

    // Tip
    const tips = [
      'Your runway is cash divided by burn. When MRR covers burn, you\'re default alive.',
      'Hiring grows MRR potential but spikes burn. Time it with fundraising.',
      'Product stage unlocks pricing power. Ship before you sell hard.',
      'Fundraising buys time but adds pressure. The goal is to escape it.',
      'Cutting costs is painful but can save a company. Default alive beats default dead.',
    ];
    $('sum-tip').textContent = '💡 ' + tips[(state.month - 2) % tips.length];

    showScreen('summary');
  }

  function showGameOver() {
    $('final-months').textContent = state.month;
    $('final-mrr').textContent = fmtMoney(state.mrr);
    $('final-team').textContent = state.team;
    $('final-product').textContent = STAGES[state.productStage];

    const tips = [
      'You ran out of cash. Try raising earlier or cutting burn before the cliff.',
      'Runway = Cash / Burn. Watch it monthly. Don\'t let it dip below 6 months.',
      'MVP → Beta → GA. Each stage unlocks more revenue per marketing dollar.',
      'The best startups become profitable. Fundraising is a bridge, not a destination.',
    ];
    $('final-tip').textContent = '💡 ' + tips[Math.floor(Math.random() * tips.length)];
    showScreen('gameover');
  }

  function showWin() {
    $('win-months').textContent = state.month;
    $('win-mrr').textContent = fmtMoney(state.mrr);
    $('win-team').textContent = state.team;
    $('win-cash').textContent = fmtMoney(state.cash);
    showScreen('win');
  }

  // ===== EVENTS =====
  $('start-btn').addEventListener('click', initGame);
  $('next-month-btn').addEventListener('click', () => {
    renderCards();
    $('phase-label').textContent = 'Choose your action for Month ' + state.month;
    showScreen('game');
  });
  $('restart-btn').addEventListener('click', initGame);
  $('win-restart-btn').addEventListener('click', initGame);

  // Init
  showScreen('start');
})();
