/**
 * Burn Rate — YC Startup School
 * Elite game: cashflow management with visual runway, animations, real mechanics
 */

const Game = {
  month: 1,
  maxMonths: 12,
  cash: 50000,
  revenue: 15000,
  expenses: 13000,
  runway: 0,
  history: [],
  over: false,
  won: false,

  // Core loop: each month, player gets a scenario with 4 choices
  // Each choice affects revenue, expenses, and cash
  // Visual runway updates in real-time
  // Random events add unpredictability

  scenarios: [
    {
      icon: "💰",
      title: "Revenue Decision",
      text: "You have bandwidth to pursue new income. What's the move?",
      choices: [
        { text: "One-time client project", desc: "+$8K now, no recurring", impact: { revenue: 8000, recurring: false }, feedback: "Cash now, but runway doesn't improve long-term." },
        { text: "Monthly retainer contract", desc: "+$3K/month recurring", impact: { revenue: 3000, recurring: true, recurringAmount: 3000 }, feedback: "Recurring revenue is the foundation of runway." },
        { text: "Cut team costs 30%", desc: "Save $4K/month", impact: { expenses: -4000 }, feedback: "Cost cuts directly extend runway." },
        { text: "Raise prices 20%", desc: "Risk losing clients", impact: { revenue: 2000, risk: 0.3 }, feedback: "Pricing power is leverage." }
      ]
    },
    {
      icon: "⚡",
      title: "Surprise Expense",
      text: "Server outage! Emergency fix needed.",
      choices: [
        { text: "Pay $3K immediately", desc: "Fix it now", impact: { cash: -3000 }, feedback: "Sometimes you just have to pay." },
        { text: "Use emergency fund", desc: "If you have one", impact: { cash: -1500 }, feedback: "Emergency funds absorb shocks." },
        { text: "Negotiate payment plan", desc: "Spread over 3 months", impact: { expenses: 1000 }, feedback: "Cash flow management." },
        { text: "DIY the fix", desc: "Save money, lose a day", impact: { revenue: -2000 }, feedback: "Founder time has opportunity cost." }
      ]
    },
    {
      icon: "👥",
      title: "Hiring Decision",
      text: "You need to scale. How do you grow the team?",
      choices: [
        { text: "Hire senior engineer", desc: "$12K/month", impact: { expenses: 12000, revenue: 5000 }, feedback: "Expensive but high output." },
        { text: "Hire junior + contractor", desc: "$8K/month", impact: { expenses: 8000, revenue: 3000 }, feedback: "Balanced cost and growth." },
        { text: "Outsource overseas", desc: "$4K/month", impact: { expenses: 4000, revenue: 2000 }, feedback: "Cheaper but communication overhead." },
        { text: "Don't hire, automate", desc: "$2K one-time", impact: { expenses: 2000, revenue: 1000 }, feedback: "Automation compounds." }
      ]
    },
    {
      icon: "📈",
      title: "Growth Opportunity",
      text: "A competitor is struggling. Their customers are looking.",
      choices: [
        { text: "Launch marketing blitz", desc: "$10K spend", impact: { expenses: 10000, revenue: 8000 }, feedback: "Aggressive growth burns cash." },
        { text: "Offer migration discount", desc: "Lower margins, more volume", impact: { revenue: 5000, expenses: 2000 }, feedback: "Smart customer acquisition." },
        { text: "Build better product", desc: "$5K investment", impact: { expenses: 5000, revenue: 3000 }, feedback: "Product-led growth is sustainable." },
        { text: "Wait and conserve", desc: "No change", impact: {}, feedback: "Patience is a strategy." }
      ]
    },
    {
      icon: "🏦",
      title: "Funding Offer",
      text: "An investor offers $50K for 15% equity.",
      choices: [
        { text: "Take the deal", desc: "Cash now, dilution later", impact: { cash: 50000 }, feedback: "Funding extends runway but costs ownership." },
        { text: "Negotiate better terms", desc: "Counter with 10%", impact: { cash: 35000 }, feedback: "Negotiation preserves equity." },
        { text: "Bootstrap instead", desc: "Find revenue", impact: { revenue: 4000 }, feedback: "Revenue is the best funding." },
        { text: "Decline, stay lean", desc: "Keep control", impact: {}, feedback: "Control is valuable early on." }
      ]
    },
    {
      icon: "🔥",
      title: "Burn Crisis",
      text: "Your burn rate is critical. Runway: 2 months.",
      choices: [
        { text: "Emergency cost cut", desc: "Cut 50% of expenses", impact: { expenses: -8000 }, feedback: "Drastic but necessary." },
        { text: "Founder salary to $0", desc: "Save $5K/month", impact: { expenses: -5000 }, feedback: "Founders eat last." },
        { text: "Pursue acquisition", desc: "Sell the company", impact: { cash: 100000 }, feedback: "Exit beats bankruptcy." },
        { text: "Last-ditch fundraising", desc: "Desperate terms", impact: { cash: 20000, expenses: 3000 }, feedback: "Desperation shows in terms." }
      ]
    }
  ],

  init() {
    this.els = {
      runway: document.getElementById('runway'),
      cash: document.getElementById('cash'),
      burn: document.getElementById('burn'),
      monthText: document.getElementById('month-text'),
      monthFill: document.getElementById('month-fill'),
      eventIcon: document.getElementById('event-icon'),
      eventTitle: document.getElementById('event-title'),
      eventDesc: document.getElementById('event-desc'),
      choices: document.getElementById('choices'),
      feedback: document.getElementById('feedback'),
      feedbackIcon: document.getElementById('feedback-icon'),
      feedbackText: document.getElementById('feedback-text'),
      feedbackDetail: document.getElementById('feedback-detail'),
      runwayFill: document.getElementById('runway-fill'),
      runwayPlane: document.getElementById('runway-plane'),
      startScreen: document.getElementById('start-screen'),
      winScreen: document.getElementById('win-screen'),
      lossScreen: document.getElementById('loss-screen'),
      howScreen: document.getElementById('how-screen'),
      startBtn: document.getElementById('start-btn'),
      howBtn: document.getElementById('how-btn'),
      howBack: document.getElementById('how-back'),
      replayBtn: document.getElementById('replay-btn'),
      tryBtn: document.getElementById('try-btn'),
      finalRunway: document.getElementById('final-runway'),
      finalCash: document.getElementById('final-cash'),
      lossReason: document.getElementById('loss-reason'),
      lossTip: document.getElementById('loss-tip')
    };

    this.els.startBtn.addEventListener('click', () => this.start());
    this.els.howBtn.addEventListener('click', () => this.showHow());
    this.els.howBack.addEventListener('click', () => this.hideHow());
    this.els.replayBtn.addEventListener('click', () => this.start());
    this.els.tryBtn.addEventListener('click', () => this.start());

    this.updateHUD();
  },

  start() {
    this.month = 1;
    this.cash = 50000;
    this.revenue = 15000;
    this.expenses = 13000;
    this.history = [];
    this.over = false;
    this.won = false;

    this.els.startScreen.classList.add('hidden');
    this.els.winScreen.classList.add('hidden');
    this.els.lossScreen.classList.add('hidden');

    this.updateHUD();
    this.loadScenario();
  },

  calculateRunway() {
    const netBurn = this.expenses - this.revenue;
    if (netBurn <= 0) return 99;
    return Math.floor(this.cash / netBurn);
  },

  updateHUD() {
    const runway = this.calculateRunway();
    const burn = this.expenses - this.revenue;

    this.els.runway.textContent = runway >= 99 ? '∞' : runway;
    this.els.cash.textContent = '$' + (this.cash / 1000).toFixed(0) + 'K';
    this.els.burn.textContent = '$' + (Math.abs(burn) / 1000).toFixed(0) + 'K';
    this.els.monthText.textContent = `Month ${this.month} of ${this.maxMonths}`;

    // Month progress
    const monthPct = (this.month / this.maxMonths) * 100;
    this.els.monthFill.style.width = monthPct + '%';

    // Runway visual
    const runwayPct = Math.min((runway / 12) * 100, 100);
    this.els.runwayFill.style.width = runwayPct + '%';
    this.els.runwayPlane.style.left = runwayPct + '%';

    // Color coding
    const runwayStat = document.getElementById('runway-stat');
    runwayStat.classList.remove('danger', 'warning');
    if (runway <= 2) runwayStat.classList.add('danger');
    else if (runway <= 4) runwayStat.classList.add('warning');

    const burnStat = document.getElementById('burn-stat');
    burnStat.classList.remove('danger');
    if (burn > 0) burnStat.classList.add('danger');
  },

  loadScenario() {
    if (this.month > this.maxMonths) {
      this.end(true);
      return;
    }

    const runway = this.calculateRunway();
    if (runway <= 0) {
      this.end(false, `Your runway ran out in month ${this.month}.`);
      return;
    }

    // Pick scenario based on runway
    let scenario;
    if (runway <= 2) {
      scenario = this.scenarios[5]; // Burn crisis
    } else if (runway <= 4) {
      scenario = this.scenarios[Math.floor(Math.random() * 2) + 4]; // Funding or crisis
    } else {
      scenario = this.scenarios[Math.floor(Math.random() * 4)]; // Normal scenarios
    }

    this.currentScenario = scenario;

    this.els.eventIcon.textContent = scenario.icon;
    this.els.eventTitle.textContent = scenario.title;
    this.els.eventDesc.textContent = scenario.text;

    this.renderChoices(scenario.choices);
  },

  renderChoices(choices) {
    this.els.choices.innerHTML = '';
    choices.forEach((choice, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice';
      btn.innerHTML = `
        <span class="choice-title">${choice.text}</span>
        <span class="choice-desc">${choice.desc}</span>
      `;
      btn.addEventListener('click', () => this.choose(choice));
      this.els.choices.appendChild(btn);
    });
  },

  choose(choice) {
    const impact = choice.impact;

    // Apply effects
    if (impact.revenue) this.revenue += impact.revenue;
    if (impact.expenses) this.expenses += impact.expenses;
    if (impact.cash) this.cash += impact.cash;

    // Recurring revenue
    if (impact.recurring && impact.recurringAmount) {
      this.revenue += impact.recurringAmount;
    }

    // Risk events
    if (impact.risk && Math.random() < impact.risk) {
      this.revenue -= impact.revenue * 0.5;
    }

    // Monthly cashflow
    const cashflow = this.revenue - this.expenses;
    this.cash += cashflow;

    // Record history
    this.history.push({ month: this.month, choice: choice.text, cashflow });

    // Show feedback
    this.showFeedback(choice);

    // Next month
    setTimeout(() => {
      this.month++;
      this.updateHUD();
      this.loadScenario();
    }, 2000);
  },

  showFeedback(choice) {
    this.els.feedbackIcon.textContent = this.calculateRunway() > 3 ? '✅' : '⚠️';
    this.els.feedbackText.textContent = choice.text;
    this.els.feedbackDetail.textContent = choice.feedback;
    this.els.feedback.classList.remove('hidden');

    setTimeout(() => {
      this.els.feedback.classList.add('hidden');
    }, 1800);
  },

  end(won, reason) {
    this.over = true;
    this.won = won;

    if (won) {
      const runway = this.calculateRunway();
      this.els.finalRunway.textContent = runway >= 99 ? '∞' : runway;
      this.els.finalCash.textContent = '$' + (this.cash / 1000).toFixed(0) + 'K';
      this.els.winScreen.classList.remove('hidden');
    } else {
      this.els.lossReason.textContent = reason;

      // Generate tip
      let tip = "Build recurring revenue early. One-time sales don't extend runway.";
      const hadRecurring = this.history.some(h => h.choice.includes('retainer') || h.choice.includes('recurring'));
      const hadCostCut = this.history.some(h => h.choice.includes('cut') || h.choice.includes('cost'));

      if (!hadRecurring) tip = "You didn't prioritize recurring revenue. It's the foundation of runway.";
      else if (!hadCostCut) tip = "You never cut costs. Sometimes the best growth is spending less.";
      else if (this.cash < 0) tip = "Your cash went negative. Watch the relationship between revenue timing and expenses.";

      this.els.lossTip.textContent = tip;
      this.els.lossScreen.classList.remove('hidden');
    }
  },

  showHow() {
    this.els.howScreen.classList.remove('hidden');
  },

  hideHow() {
    this.els.howScreen.classList.add('hidden');
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => Game.init());
