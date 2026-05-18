(function() {
  'use strict';

  // ===== STATE =====
  let state = {
    cash: 5000,
    mrr: 0,
    customers: 0,
    churnRate: 0.05,
    cac: 100,
    arpu: 50,
    clickPower: 10,
    autoMrr: 0,
    startTime: 0,
    upgrades: {},
    won: false,
  };

  const UPGRADES = [
    {
      id: 'sales-rep',
      icon: '📞',
      name: 'Sales Rep',
      desc: '+$50/mo auto MRR',
      baseCost: 500,
      costMult: 1.35,
      effect: s => ({ autoMrr: s.autoMrr + 50 }),
      max: 20,
    },
    {
      id: 'content-marketing',
      icon: '📝',
      name: 'Content Marketing',
      desc: '+$120/mo auto MRR',
      baseCost: 1200,
      costMult: 1.4,
      effect: s => ({ autoMrr: s.autoMrr + 120 }),
      max: 15,
    },
    {
      id: 'product-hunt',
      icon: '🚀',
      name: 'Product Hunt Launch',
      desc: '+$300/mo auto MRR, one-time',
      baseCost: 3000,
      costMult: 2.0,
      effect: s => ({ autoMrr: s.autoMrr + 300 }),
      max: 5,
    },
    {
      id: 'better-onboarding',
      icon: '🎯',
      name: 'Better Onboarding',
      desc: '-0.5% churn rate',
      baseCost: 2000,
      costMult: 1.5,
      effect: s => ({ churnRate: Math.max(0.005, s.churnRate - 0.005) }),
      max: 8,
    },
    {
      id: 'enterprise-tier',
      icon: '🏢',
      name: 'Enterprise Tier',
      desc: '+$200 ARPU, +$10 click',
      baseCost: 5000,
      costMult: 1.6,
      effect: s => ({ arpu: s.arpu + 200, clickPower: s.clickPower + 10 }),
      max: 5,
    },
    {
      id: 'viral-loop',
      icon: '🔄',
      name: 'Viral Loop',
      desc: '+$200/mo auto MRR',
      baseCost: 4000,
      costMult: 1.45,
      effect: s => ({ autoMrr: s.autoMrr + 200 }),
      max: 10,
    },
    {
      id: 'customer-success',
      icon: '🤝',
      name: 'Customer Success',
      desc: '-0.8% churn, +$80/mo',
      baseCost: 3500,
      costMult: 1.5,
      effect: s => ({ churnRate: Math.max(0.005, s.churnRate - 0.008), autoMrr: s.autoMrr + 80 }),
      max: 6,
    },
    {
      id: 'referral-program',
      icon: '🎁',
      name: 'Referral Program',
      desc: '+$150/mo auto MRR',
      baseCost: 2500,
      costMult: 1.4,
      effect: s => ({ autoMrr: s.autoMrr + 150 }),
      max: 12,
    },
  ];

  let lastTick = 0;
  let rafId = null;

  // ===== DOM =====
  const $ = id => document.getElementById(id);

  function fmtMoney(n) {
    if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
    return '$' + Math.floor(n);
  }

  function fmtNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return Math.floor(n).toString();
  }

  function getUpgradeLevel(id) {
    return state.upgrades[id] || 0;
  }

  function getUpgradeCost(u) {
    const lvl = getUpgradeLevel(u.id);
    return Math.floor(u.baseCost * Math.pow(u.costMult, lvl));
  }

  function ltv() {
    if (state.churnRate <= 0) return state.arpu * 999;
    return state.arpu / state.churnRate;
  }

  function ltvCac() {
    if (state.cac <= 0) return 999;
    return ltv() / state.cac;
  }

  function updateHUD() {
    $('mrr-val').textContent = fmtMoney(state.mrr);
    $('mrr-growth').textContent = '+' + fmtMoney(state.autoMrr) + '/mo';
    $('customers-val').textContent = fmtNum(state.customers);
    $('churn-val').textContent = (state.churnRate * 100).toFixed(1) + '%';
    $('cac-val').textContent = fmtMoney(state.cac);
    $('ltv-val').textContent = fmtMoney(ltv());
    $('arr-val').textContent = fmtMoney(state.mrr * 12);
    const net = state.mrr - (state.autoMrr > 0 ? state.autoMrr * 0.3 : 0); // rough cost
    $('net-val').textContent = (net >= 0 ? '+' : '') + fmtMoney(net);
    const ratio = ltvCac();
    $('ltv-cac-val').textContent = ratio.toFixed(1) + 'x';
    $('ltv-cac-val').style.color = ratio >= 3 ? 'var(--mb-green)' : ratio >= 1.5 ? 'var(--mb-gold)' : 'var(--mb-red)';
    $('cash-val').textContent = fmtMoney(state.cash);
    $('click-revenue').textContent = state.clickPower;
  }

  function renderUpgrades() {
    const list = $('upgrades-list');
    list.innerHTML = '';
    UPGRADES.forEach(u => {
      const lvl = getUpgradeLevel(u.id);
      const cost = getUpgradeCost(u);
      const maxed = lvl >= u.max;
      const canAfford = state.cash >= cost;
      const row = document.createElement('div');
      row.className = 'upgrade-row' + (!canAfford || maxed ? ' disabled' : '');
      row.innerHTML = `
        <span class="upgrade-icon">${u.icon}</span>
        <div class="upgrade-info">
          <div class="upgrade-name">${u.name}</div>
          <div class="upgrade-desc">${u.desc}</div>
          <div class="upgrade-level">Level ${lvl}${u.max < 99 ? '/' + u.max : ''}</div>
        </div>
        <div class="upgrade-cost">${maxed ? 'MAX' : fmtMoney(cost)}</div>
      `;
      if (!maxed && canAfford) {
        row.addEventListener('click', () => buyUpgrade(u));
      }
      list.appendChild(row);
    });
  }

  function buyUpgrade(u) {
    const cost = getUpgradeCost(u);
    if (state.cash < cost) return;
    state.cash -= cost;
    state.upgrades[u.id] = (state.upgrades[u.id] || 0) + 1;
    const changes = u.effect(state);
    Object.assign(state, changes);
    updateHUD();
    renderUpgrades();
    spawnParticle($('click-zone'), '⚡', 'var(--mb-gold)');
  }

  function doClick(e) {
    if (state.won) return;
    // MRR from click
    state.mrr += state.clickPower;
    state.customers += Math.max(1, Math.floor(state.clickPower / state.arpu));
    state.cash += state.clickPower * 0.5; // some cash from upfront payments
    updateHUD();

    // Particle
    const zone = $('click-zone');
    const rect = zone.getBoundingClientRect();
    const x = e ? (e.clientX || e.touches?.[0]?.clientX || rect.left + rect.width / 2) : rect.left + rect.width / 2;
    const y = e ? (e.clientY || e.touches?.[0]?.clientY || rect.top + rect.height / 2) : rect.top + rect.height / 2;
    spawnParticleAt(x, y, '+' + fmtMoney(state.clickPower));

    // Check win
    if (state.mrr * 12 >= 1000000) {
      state.won = true;
      showWin();
    }
  }

  function spawnParticleAt(x, y, text) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = text;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }

  function spawnParticle(parent, text, color) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = text;
    p.style.color = color || 'var(--mb-green)';
    p.style.left = '50%';
    p.style.top = '40%';
    p.style.transform = 'translate(-50%, -50%)';
    parent.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }

  function gameLoop(ts) {
    if (!lastTick) lastTick = ts;
    const dt = ts - lastTick;
    if (dt >= 1000) {
      lastTick = ts;
      tick();
    }
    rafId = requestAnimationFrame(gameLoop);
  }

  function tick() {
    if (state.won) return;
    // Auto MRR adds customers
    if (state.autoMrr > 0) {
      state.mrr += state.autoMrr;
      state.customers += Math.max(1, Math.floor(state.autoMrr / state.arpu));
      state.cash += state.autoMrr * 0.3;
    }
    // Churn
    if (state.customers > 0 && state.churnRate > 0) {
      const churned = Math.floor(state.customers * state.churnRate);
      state.customers = Math.max(0, state.customers - churned);
      const mrrLost = churned * state.arpu;
      state.mrr = Math.max(0, state.mrr - mrrLost);
    }
    updateHUD();
    renderUpgrades();
    if (state.mrr * 12 >= 1000000) {
      state.won = true;
      showWin();
    }
  }

  function showScreen(id) {
    ['start-screen', 'game-screen', 'win-screen'].forEach(sid => {
      $(sid).classList.toggle('active', sid === id);
      if (sid === id) $(sid).classList.remove('hidden');
    });
  }

  function showWin() {
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    $('win-time').textContent = mins + 'm ' + (secs < 10 ? '0' : '') + secs + 's';
    $('win-customers').textContent = fmtNum(state.customers);
    $('win-ltv-cac').textContent = ltvCac().toFixed(1) + 'x';
    $('win-churn').textContent = (state.churnRate * 100).toFixed(1) + '%';
    showScreen('win-screen');
    if (rafId) cancelAnimationFrame(rafId);
  }

  function initGame() {
    state = {
      cash: 5000,
      mrr: 0,
      customers: 0,
      churnRate: 0.05,
      cac: 100,
      arpu: 50,
      clickPower: 10,
      autoMrr: 0,
      startTime: Date.now(),
      upgrades: {},
      won: false,
    };
    lastTick = 0;
    updateHUD();
    renderUpgrades();
    $('hud').classList.remove('hidden');
    showScreen('game-screen');
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(gameLoop);
  }

  // Events
  $('start-btn').addEventListener('click', initGame);
  $('win-restart-btn').addEventListener('click', initGame);
  const clickZone = $('click-zone');
  clickZone.addEventListener('mousedown', doClick);
  clickZone.addEventListener('touchstart', e => { e.preventDefault(); doClick(e); }, { passive: false });

  showScreen('start-screen');
})();
