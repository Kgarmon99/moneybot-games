/**
 * Burn Rate — YC Startup School
 * Card-based decision game: Swipe to accept/reject monthly decisions
 * Keep your startup alive for 12 months
 */

const Game = {
  // State
  month: 1,
  maxMonths: 12,
  cash: 50000,
  revenue: 0,
  burn: 8000,
  runway: 6,
  cardsThisMonth: [],
  currentCardIndex: 0,
  decisions: [],

  // Card database
  cardPool: [
    {
      emoji: 'SaaS',
      title: 'Build SaaS Product',
      desc: 'Invest in building a recurring revenue product. High upfront cost, but pays off long-term.',
      effects: { cash: -15000, revenue: 5000, burn: 2000 },
      category: 'revenue'
    },
    {
      emoji: 'GIG',
      title: 'Take Consulting Gig',
      desc: 'Pick up consulting work for quick cash. Takes time away from product.',
      effects: { cash: 8000, revenue: 0, burn: 0 },
      category: 'revenue'
    },
    {
      emoji: 'SEO',
      title: 'Start Content Marketing',
      desc: 'Create blog posts and videos. Cheap but slow to generate leads.',
      effects: { cash: -3000, revenue: 1500, burn: 500 },
      category: 'growth'
    },
    {
      emoji: 'ENT',
      title: 'Enterprise Deal',
      desc: 'Land a big enterprise client. Massive revenue but high maintenance.',
      effects: { cash: 20000, revenue: 0, burn: 3000 },
      category: 'revenue'
    },
    {
      emoji: 'CUT',
      title: 'Cut Costs',
      desc: 'Reduce team size and office space. Painful but extends runway.',
      effects: { cash: 0, revenue: 0, burn: -3000 },
      category: 'survival'
    },
    {
      emoji: 'DEV',
      title: 'Hire Developer',
      desc: 'Bring on a senior developer. Expensive but accelerates product.',
      effects: { cash: -5000, revenue: 0, burn: 8000 },
      category: 'team'
    },
    {
      emoji: 'ADS',
      title: 'Launch Ad Campaign',
      desc: 'Run Facebook/Google ads. Burn cash for potential customers.',
      effects: { cash: -10000, revenue: 3000, burn: 2000 },
      category: 'growth'
    },
    {
      emoji: 'PAR',
      title: 'Partner with Agency',
      desc: 'White-label your product through an agency. Steady but low margin.',
      effects: { cash: 5000, revenue: 2000, burn: 500 },
      category: 'revenue'
    },
    {
      emoji: 'MOV',
      title: 'Move to Cheaper Office',
      desc: 'Relocate to a cheaper area. Saves money but team morale drops.',
      effects: { cash: -2000, revenue: 0, burn: -1500 },
      category: 'survival'
    },
    {
      emoji: 'YC',
      title: 'YC Interview',
      desc: 'Apply to Y Combinator. Time-intensive but could be transformative.',
      effects: { cash: 0, revenue: 0, burn: 1000 },
      category: 'milestone'
    },
    {
      emoji: 'ANG',
      title: 'Angel Investment',
      desc: 'Raise $100K from an angel. Dilution, but extends runway 12 months.',
      effects: { cash: 100000, revenue: 0, burn: 0 },
      category: 'funding'
    },
    {
      emoji: 'PIV',
      title: 'Pivot to AI',
      desc: 'Pivot your product to AI. Risky but could 10x your market.',
      effects: { cash: -8000, revenue: 8000, burn: 3000 },
      category: 'pivot'
    },
    {
      emoji: 'DAT',
      title: 'Buy Analytics Tool',
      desc: 'Invest in data analytics. Better decisions, but monthly cost.',
      effects: { cash: -2000, revenue: 1000, burn: 500 },
      category: 'growth'
    },
    {
      emoji: 'EXP',
      title: 'Expand to New Market',
      desc: 'Launch in a new city/country. High cost, high reward.',
      effects: { cash: -15000, revenue: 5000, burn: 4000 },
      category: 'growth'
    },
    {
      emoji: 'AUT',
      title: 'Build Internal Tool',
      desc: 'Automate manual processes. Upfront cost, saves time later.',
      effects: { cash: -5000, revenue: 0, burn: -1000 },
      category: 'efficiency'
    },
    {
      emoji: 'APP',
      title: 'Mobile App Launch',
      desc: 'Build iOS/Android apps. Expensive but opens new revenue.',
      effects: { cash: -20000, revenue: 8000, burn: 2000 },
      category: 'product'
    },
    {
      emoji: 'EVT',
      title: 'Sponsor Conference',
      desc: 'Sponsor a startup conference. Brand awareness, direct leads.',
      effects: { cash: -8000, revenue: 3000, burn: 1000 },
      category: 'marketing'
    },
    {
      emoji: 'EDU',
      title: 'Launch Course/Ebook',
      desc: 'Create educational content. Low cost, passive income.',
      effects: { cash: -3000, revenue: 2000, burn: 200 },
      category: 'revenue'
    }
  ],

  // Month-specific events
  monthEvents: {
    3: { emoji: 'AWS', title: 'Server Costs Spike', desc: 'AWS bill doubled. Unexpected infrastructure costs.', effects: { cash: -5000, revenue: 0, burn: 1000 } },
    6: { emoji: 'PH', title: 'Product Hunt Launch', desc: 'Launch on Product Hunt. Viral traffic, but servers struggle.', effects: { cash: -3000, revenue: 5000, burn: 2000 } },
    9: { emoji: 'HR', title: 'Key Employee Quits', desc: 'Your CTO leaves. Need to hire replacement fast.', effects: { cash: -10000, revenue: -2000, burn: 0 } },
    12: { emoji: 'DD', title: 'Demo Day', desc: 'Present to investors. Make it count.', effects: { cash: 0, revenue: 10000, burn: 0 } }
  },

  init() {
    this.bindEvents();
    this.showStartScreen();
  },

  bindEvents() {
    document.getElementById('start-btn').addEventListener('click', () => this.start());
    document.getElementById('how-btn').addEventListener('click', () => this.showHow());
    document.getElementById('how-back').addEventListener('click', () => this.hideHow());
    document.getElementById('month-continue').addEventListener('click', () => this.nextMonth());
    document.getElementById('replay-btn').addEventListener('click', () => this.restart());
    document.getElementById('try-btn').addEventListener('click', () => this.restart());
  },

  showStartScreen() {
    document.getElementById('start-screen').classList.remove('hidden');
  },

  start() {
    this.month = 1;
    this.cash = 50000;
    this.revenue = 0;
    this.burn = 8000;
    this.runway = 6;
    this.decisions = [];

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('win-screen').classList.add('hidden');
    document.getElementById('loss-screen').classList.add('hidden');

    this.updateHUD();
    this.startMonth();
  },

  startMonth() {
    this.currentCardIndex = 0;
    this.cardsThisMonth = this.generateMonthCards();
    this.showCard();
    this.updateMonthBar();
  },

  generateMonthCards() {
    const cards = [];
    
    // Add month-specific event if exists
    if (this.monthEvents[this.month]) {
      cards.push({ ...this.monthEvents[this.month], isEvent: true });
    }

    // Add 2-3 random cards
    const numCards = 2 + Math.floor(Math.random() * 2);
    const shuffled = [...this.cardPool].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numCards; i++) {
      cards.push({ ...shuffled[i], isEvent: false });
    }

    return cards;
  },

  showCard() {
    const cardArea = document.getElementById('card-stack');
    
    if (this.currentCardIndex >= this.cardsThisMonth.length) {
      this.endMonth();
      return;
    }

    const card = this.cardsThisMonth[this.currentCardIndex];
    
    cardArea.innerHTML = `
      <div class="card" id="current-card">
        <div class="card-emoji">${card.emoji}</div>
        <div class="card-title">${card.title}</div>
        <div class="card-desc">${card.desc}</div>
        <div class="card-effects">
          ${this.renderEffects(card.effects)}
        </div>
        <div class="card-buttons">
          <button class="card-btn reject" onclick="Game.rejectCard()">REJECT</button>
          <button class="card-btn accept" onclick="Game.acceptCard()">ACCEPT</button>
        </div>
      </div>
    `;

    // Add swipe support
    this.addSwipeSupport(document.getElementById('current-card'));
  },

  renderEffects(effects) {
    let html = '';
    if (effects.cash !== 0) {
      const sign = effects.cash > 0 ? '+' : '';
      const cls = effects.cash > 0 ? 'positive' : 'negative';
      html += `<div class="effect-row ${cls}"><span class="effect-label">Cash</span><span class="effect-value ${cls}">${sign}$${Math.abs(effects.cash / 1000).toFixed(0)}K</span></div>`;
    }
    if (effects.revenue !== 0) {
      const sign = effects.revenue > 0 ? '+' : '';
      const cls = effects.revenue > 0 ? 'positive' : 'negative';
      html += `<div class="effect-row ${cls}"><span class="effect-label">Monthly Revenue</span><span class="effect-value ${cls}">${sign}$${Math.abs(effects.revenue / 1000).toFixed(0)}K</span></div>`;
    }
    if (effects.burn !== 0) {
      const sign = effects.burn > 0 ? '+' : '';
      const cls = effects.burn > 0 ? 'negative' : 'positive';
      html += `<div class="effect-row ${cls}"><span class="effect-label">Monthly Burn</span><span class="effect-value ${cls}">${sign}$${Math.abs(effects.burn / 1000).toFixed(0)}K</span></div>`;
    }
    return html;
  },

  addSwipeSupport(element) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const startDrag = (e) => {
      startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      isDragging = true;
      element.style.transition = 'none';
    };

    const moveDrag = (e) => {
      if (!isDragging) return;
      currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
      const diff = currentX - startX;
      const rotation = diff * 0.05;
      element.style.transform = `translateX(${diff}px) rotate(${rotation}deg)`;
      
      // Visual feedback
      if (diff > 50) {
        element.style.borderColor = 'var(--neon)';
      } else if (diff < -50) {
        element.style.borderColor = 'var(--danger)';
      } else {
        element.style.borderColor = 'rgba(0, 255, 136, 0.2)';
      }
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      
      const diff = currentX - startX;
      
      if (diff > 100) {
        element.classList.add('swiping-right');
        setTimeout(() => this.acceptCard(), 300);
      } else if (diff < -100) {
        element.classList.add('swiping-left');
        setTimeout(() => this.rejectCard(), 300);
      } else {
        element.style.transform = 'translateX(0) rotate(0)';
        element.style.borderColor = 'rgba(0, 255, 136, 0.2)';
      }
    };

    element.addEventListener('mousedown', startDrag);
    element.addEventListener('mousemove', moveDrag);
    element.addEventListener('mouseup', endDrag);
    element.addEventListener('mouseleave', endDrag);
    
    element.addEventListener('touchstart', startDrag);
    element.addEventListener('touchmove', moveDrag);
    element.addEventListener('touchend', endDrag);
  },

  acceptCard() {
    const card = this.cardsThisMonth[this.currentCardIndex];
    this.applyEffects(card.effects);
    this.decisions.push({ month: this.month, card: card.title, accepted: true });
    this.nextCard();
  },

  rejectCard() {
    const card = this.cardsThisMonth[this.currentCardIndex];
    this.decisions.push({ month: this.month, card: card.title, accepted: false });
    this.nextCard();
  },

  applyEffects(effects) {
    this.cash += effects.cash || 0;
    this.revenue += effects.revenue || 0;
    this.burn += effects.burn || 0;
    
    // Ensure burn doesn't go below minimum
    if (this.burn < 3000) this.burn = 3000;
    
    this.updateRunway();
    this.updateHUD();
  },

  updateRunway() {
    const netBurn = this.burn - this.revenue;
    if (netBurn <= 0) {
      this.runway = 99; // Infinite runway
    } else {
      this.runway = Math.floor(this.cash / netBurn);
    }
  },

  nextCard() {
    this.currentCardIndex++;
    setTimeout(() => this.showCard(), 300);
  },

  endMonth() {
    // Apply monthly revenue and burn
    this.cash += this.revenue - this.burn;
    this.updateRunway();
    this.updateHUD();

    // Check win/loss
    if (this.cash <= 0) {
      this.gameOver(false);
      return;
    }

    if (this.month >= this.maxMonths) {
      this.gameOver(true);
      return;
    }

    // Show month summary
    this.showMonthSummary();
  },

  showMonthSummary() {
    const net = this.revenue - this.burn;
    document.getElementById('month-number').textContent = `Month ${this.month}`;
    document.getElementById('summary-revenue').textContent = `+$${(this.revenue / 1000).toFixed(0)}K`;
    document.getElementById('summary-burn').textContent = `-$${(this.burn / 1000).toFixed(0)}K`;
    document.getElementById('summary-net').textContent = `${net >= 0 ? '+' : ''}$${(net / 1000).toFixed(0)}K`;
    document.getElementById('summary-net').className = net >= 0 ? 'positive' : 'negative';
    document.getElementById('summary-cash').textContent = `$${(this.cash / 1000).toFixed(0)}K`;
    document.getElementById('summary-runway').textContent = this.runway >= 99 ? '∞' : `${this.runway} mo`;

    document.getElementById('month-screen').classList.remove('hidden');
  },

  nextMonth() {
    document.getElementById('month-screen').classList.add('hidden');
    this.month++;
    this.startMonth();
  },

  gameOver(won) {
    if (won) {
      document.getElementById('final-cash').textContent = `$${(this.cash / 1000).toFixed(0)}K`;
      document.getElementById('final-runway').textContent = this.runway >= 99 ? '∞' : this.runway;
      document.getElementById('win-screen').classList.remove('hidden');
    } else {
      document.getElementById('loss-reason').textContent = `Your runway ran out in month ${this.month}.`;
      
      // Generate tip based on decisions
      let tip = 'Build recurring revenue early. It compounds over time.';
      const hasRevenue = this.decisions.some(d => d.accepted && ['Build SaaS Product', 'Start Content Marketing', 'Enterprise Deal'].includes(d.card));
      const hasCostCut = this.decisions.some(d => d.accepted && d.card === 'Cut Costs');
      
      if (!hasRevenue) {
        tip = 'You didn\'t build any recurring revenue. Focus on SaaS, content, or enterprise deals.';
      } else if (!hasCostCut && this.burn > 10000) {
        tip = 'Your burn was too high. Consider cutting costs or automating processes.';
      }
      
      document.getElementById('loss-tip').textContent = tip;
      document.getElementById('loss-screen').classList.remove('hidden');
    }
  },

  restart() {
    document.getElementById('win-screen').classList.add('hidden');
    document.getElementById('loss-screen').classList.add('hidden');
    this.start();
  },

  showHow() {
    document.getElementById('how-screen').classList.remove('hidden');
  },

  hideHow() {
    document.getElementById('how-screen').classList.add('hidden');
  },

  updateHUD() {
    const runwayEl = document.getElementById('runway');
    const cashEl = document.getElementById('cash');
    const burnEl = document.getElementById('burn');
    
    if (runwayEl) runwayEl.textContent = this.runway >= 99 ? '∞' : this.runway;
    if (cashEl) cashEl.textContent = `$${(this.cash / 1000).toFixed(0)}K`;
    if (burnEl) burnEl.textContent = `$${(this.burn / 1000).toFixed(0)}K`;
    
    // Color coding
    const runwayStat = document.getElementById('runway-stat');
    if (runwayStat) {
      runwayStat.classList.remove('danger', 'warning');
      if (this.runway <= 2) runwayStat.classList.add('danger');
      else if (this.runway <= 4) runwayStat.classList.add('warning');
    }
  },

  updateMonthBar() {
    const fill = document.getElementById('month-fill');
    const text = document.getElementById('month-text');
    
    if (fill) fill.style.width = `${(this.month / this.maxMonths) * 100}%`;
    if (text) text.textContent = `Month ${this.month} of ${this.maxMonths}`;
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => Game.init());
