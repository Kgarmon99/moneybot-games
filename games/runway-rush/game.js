/**
 * Runway Rush — Financial Literacy Simulation
 * Core game logic: monthly cashflow decisions, runway management, events
 */

// ==================== GAME STATE ====================
const GameState = {
  month: 1,
  maxMonths: 12,
  cash: 50000,
  monthlyRevenue: 15000,
  monthlyExpenses: 13000,
  emergencyFund: 0,
  runway: 0,
  streak: 0,
  bestStreak: 0,
  score: 0,
  gameOver: false,
  won: false,
  scenario: null,
  history: []
};

// ==================== SCENARIOS ====================
const SCENARIOS = [
  {
    id: 'prioritize_revenue',
    text: "You have some extra bandwidth this month. What's your priority?",
    choices: [
      { text: "🚀 Chase one-time big client", revenue: 8000, expenses: 2000, recurring: false, emergency: 0, tip: "One-time revenue feels good but doesn't extend runway." },
      { text: "🔄 Lock in recurring contract", revenue: 3000, expenses: 500, recurring: true, emergency: 0, tip: "Recurring revenue compounds — smart choice!" },
      { text: "💰 Cut costs aggressively", revenue: 0, expenses: -4000, recurring: false, emergency: 1000, tip: "Cost cuts directly improve runway." },
      { text: "🏦 Build emergency fund", revenue: 0, expenses: 0, recurring: false, emergency: 5000, tip: "Emergency funds absorb surprises." }
    ]
  },
  {
    id: 'growth_vs_runway',
    text: "A competitor is gaining market share. How do you respond?",
    choices: [
      { text: "📢 Heavy marketing spend", revenue: 2000, expenses: 8000, recurring: false, emergency: 0, tip: "Marketing is a bet — make sure runway can handle it." },
      { text: "🤝 Strategic partnership", revenue: 4000, expenses: 1000, recurring: true, emergency: 0, tip: "Partnerships are efficient growth." },
      { text: "🔧 Improve product silently", revenue: 1000, expenses: 2000, recurring: false, emergency: 0, tip: "Product improvements pay off slowly." },
      { text: "⏳ Wait and conserve cash", revenue: 0, expenses: -1000, recurring: false, emergency: 2000, tip: "Sometimes patience is the best strategy." }
    ]
  },
  {
    id: 'team_decision',
    text: "You need to scale operations. What's the plan?",
    choices: [
      { text: "👥 Hire full-time team", revenue: 0, expenses: 6000, recurring: true, emergency: 0, tip: "Full-time hires are fixed costs — hard to undo." },
      { text: "🌐 Outsource to contractors", revenue: 0, expenses: 3000, recurring: false, emergency: 0, tip: "Contractors are flexible but expensive per hour." },
      { text: "🤖 Automate with software", revenue: 2000, expenses: 1500, recurring: true, emergency: 0, tip: "Automation pays back over time." },
      { text: "📋 Do it yourself", revenue: 0, expenses: 500, recurring: false, emergency: 0, tip: "Founder time is expensive but preserves cash." }
    ]
  },
  {
    id: 'surprise_opportunity',
    text: "An unexpected opportunity: a bulk order at 40% discount. What do you do?",
    choices: [
      { text: "📦 Take the full order", revenue: 12000, expenses: 8000, recurring: false, emergency: 0, tip: "Big revenue spike — but watch your margins." },
      { text: "🤝 Negotiate better terms", revenue: 8000, expenses: 5000, recurring: false, emergency: 0, tip: "Negotiation preserves margin." },
      { text: "❌ Decline, focus on core", revenue: 0, expenses: 0, recurring: false, emergency: 3000, tip: "Saying no protects focus and cash." },
      { text: "📊 Analyze before deciding", revenue: 2000, expenses: 1000, recurring: false, emergency: 1000, tip: "Analysis costs time but reduces risk." }
    ]
  },
  {
    id: 'funding_decision',
    text: "An investor offers $50,000 for 15% equity. Do you take it?",
    choices: [
      { text: "✅ Take the deal", revenue: 0, expenses: 0, recurring: false, emergency: 50000, tip: "Funding extends runway but dilutes ownership." },
      { text: "🔄 Counter with less equity", revenue: 0, expenses: 0, recurring: false, emergency: 30000, tip: "Negotiation is a skill — good try!" },
      { text: "❌ Bootstrap instead", revenue: 3000, expenses: 1000, recurring: true, emergency: 0, tip: "Bootstrapping keeps control but is slower." },
      { text: "⏳ Defer decision", revenue: 1000, expenses: 500, recurring: false, emergency: 5000, tip: "Time pressure clouds judgment." }
    ]
  },
  {
    id: 'pricing_pressure',
    text: "Customers say your prices are too high. How do you respond?",
    choices: [
      { text: "📉 Lower prices 20%", revenue: -2000, expenses: 0, recurring: true, emergency: 0, tip: "Price cuts hurt margins — hard to reverse." },
      { text: "🎁 Add value instead", revenue: 1000, expenses: 1500, recurring: true, emergency: 0, tip: "Value-adds justify prices." },
      { text: "🎯 Find premium customers", revenue: 3000, expenses: 2000, recurring: true, emergency: 0, tip: "Premium positioning is powerful." },
      { text: "📊 Survey and test", revenue: 500, expenses: 500, recurring: false, emergency: 0, tip: "Data beats guessing." }
    ]
  },
  {
    id: 'debt_dilemma',
    text: "You have outstanding invoices and a loan offer. What's the move?",
    choices: [
      { text: "💳 Take the loan", revenue: 0, expenses: 2000, recurring: true, emergency: 20000, tip: "Debt extends runway but adds pressure." },
      { text: "📞 Chase invoices hard", revenue: 8000, expenses: 500, recurring: false, emergency: 0, tip: "Collections improve cash without debt." },
      { text: "🤝 Offer early-pay discount", revenue: -1000, expenses: 0, recurring: false, emergency: 15000, tip: "Discounts for cash — classic tradeoff." },
      { text: "⏳ Wait it out", revenue: 0, expenses: 0, recurring: false, emergency: 0, tip: "Waiting is risky when bills are due." }
    ]
  },
  {
    id: 'market_shift',
    text: "The market is shifting. A new trend threatens your business model.",
    choices: [
      { text: "🔄 Pivot to new trend", revenue: 2000, expenses: 5000, recurring: false, emergency: 0, tip: "Pivots are expensive but sometimes necessary." },
      { text: "🛡️ Double down on niche", revenue: -1000, expenses: -1000, recurring: true, emergency: 0, tip: "Niche focus can be a moat." },
      { text: "🤝 Acquire a competitor", revenue: 5000, expenses: 10000, recurring: true, emergency: 0, tip: "Acquisitions are high-risk, high-reward." },
      { text: "📊 Research before acting", revenue: 0, expenses: 1000, recurring: false, emergency: 2000, tip: "Research reduces uncertainty." }
    ]
  }
];

// ==================== RANDOM EVENTS ====================
const EVENTS = [
  { icon: "⚡", title: "Server Outage", desc: "Emergency fix cost $3,000.", cost: 3000, probability: 0.15 },
  { icon: "🏥", title: "Key Employee Sick", desc: "Contractor coverage cost $2,500.", cost: 2500, probability: 0.1 },
  { icon: "📉", title: "Client Churn", desc: "Lost $4,000 in recurring revenue.", revenueHit: 4000, probability: 0.12 },
  { icon: "🔧", title: "Equipment Failure", desc: "Replacement cost $2,000.", cost: 2000, probability: 0.1 },
  { icon: "🎉", title: "Viral Moment", desc: "Unexpected revenue boost of $5,000!", revenueBoost: 5000, probability: 0.08 },
  { icon: "💰", title: "Tax Refund", desc: "Received $1,500 refund.", revenueBoost: 1500, probability: 0.05 },
  { icon: "📈", title: "Referral Bonus", desc: "Client referred 2 new customers! +$3,000", revenueBoost: 3000, probability: 0.1 },
  { icon: "🏆", title: "Grant Awarded", desc: "Won a $5,000 innovation grant!", revenueBoost: 5000, probability: 0.03 }
];

// ==================== DOM REFERENCES ====================
const els = {
  runwayDisplay: document.getElementById('runway-display'),
  cashflowDisplay: document.getElementById('cashflow-display'),
  streakDisplay: document.getElementById('streak-display'),
  monthDisplay: document.getElementById('month-display'),
  monthProgress: document.getElementById('month-progress'),
  mascotText: document.getElementById('mascot-text'),
  scenarioText: document.getElementById('scenario-text'),
  choicesContainer: document.getElementById('choices'),
  eventOverlay: document.getElementById('event-overlay'),
  eventIcon: document.getElementById('event-icon'),
  eventTitle: document.getElementById('event-title'),
  eventDesc: document.getElementById('event-desc'),
  eventOk: document.getElementById('event-ok'),
  efFill: document.getElementById('ef-fill'),
  efValue: document.getElementById('ef-value'),
  startScreen: document.getElementById('start-screen'),
  winScreen: document.getElementById('win-screen'),
  lossScreen: document.getElementById('loss-screen'),
  howToScreen: document.getElementById('how-to-screen'),
  startBtn: document.getElementById('start-btn'),
  howToBtn: document.getElementById('how-to-btn'),
  howToBack: document.getElementById('how-to-back'),
  replayBtn: document.getElementById('replay-btn'),
  tryAgainBtn: document.getElementById('try-again-btn'),
  lossReason: document.getElementById('loss-reason'),
  lossTip: document.getElementById('loss-tip'),
  finalRunway: document.getElementById('final-runway'),
  finalStreak: document.getElementById('final-streak'),
  finalScore: document.getElementById('final-score')
};

// ==================== UTILITIES ====================
function formatMoney(amount) {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}$${Math.abs(amount).toLocaleString()}`;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function calculateRunway() {
  const netBurn = GameState.monthlyExpenses - GameState.monthlyRevenue;
  if (netBurn <= 0) return 99; // Profitable = infinite runway
  return Math.floor(GameState.cash / netBurn);
}

// ==================== RENDERING ====================
function updateHUD() {
  const runway = calculateRunway();
  const cashflow = GameState.monthlyRevenue - GameState.monthlyExpenses;
  
  GameState.runway = runway;
  
  els.runwayDisplay.textContent = runway >= 99 ? '∞' : runway;
  els.cashflowDisplay.textContent = formatMoney(cashflow);
  els.streakDisplay.textContent = GameState.streak;
  els.monthDisplay.textContent = `Month ${GameState.month} of ${GameState.maxMonths}`;
  
  // Progress bar
  const progress = (GameState.month / GameState.maxMonths) * 100;
  els.monthProgress.style.width = `${progress}%`;
  
  // Emergency fund bar (max $20k for visual)
  const efPercent = Math.min((GameState.emergencyFund / 20000) * 100, 100);
  els.efFill.style.width = `${efPercent}%`;
  els.efValue.textContent = `$${GameState.emergencyFund.toLocaleString()}`;
  
  // Color coding
  els.runwayDisplay.parentElement.classList.toggle('danger', runway <= 2);
  els.runwayDisplay.parentElement.classList.toggle('warning', runway > 2 && runway <= 4);
  els.cashflowDisplay.parentElement.classList.toggle('danger', cashflow < 0);
  els.cashflowDisplay.parentElement.classList.toggle('success', cashflow > 0);
}

function setMascot(text, mood = 'neutral') {
  els.mascotText.textContent = text;
  const mascot = document.getElementById('mascot');
  mascot.className = `mascot-container ${mood}`;
}

function renderChoices(choices) {
  els.choicesContainer.innerHTML = '';
  choices.forEach((choice, index) => {
    const btn = document.createElement('button');
    btn.className = 'choice-card';
    btn.innerHTML = `
      <span class="choice-text">${choice.text}</span>
      <span class="choice-preview">${getChoicePreview(choice)}</span>
    `;
    btn.addEventListener('click', () => makeChoice(choice, index));
    els.choicesContainer.appendChild(btn);
  });
}

function getChoicePreview(choice) {
  const parts = [];
  if (choice.revenue !== 0) parts.push(`Revenue ${formatMoney(choice.revenue)}`);
  if (choice.expenses !== 0) parts.push(`Costs ${formatMoney(choice.expenses)}`);
  if (choice.emergency > 0) parts.push(`+EF $${choice.emergency.toLocaleString()}`);
  if (choice.recurring) parts.push('🔁 Recurring');
  return parts.join(' • ') || 'No immediate change';
}

// ==================== GAME FLOW ====================
function startGame() {
  GameState.month = 1;
  GameState.cash = 50000;
  GameState.monthlyRevenue = 15000;
  GameState.monthlyExpenses = 13000;
  GameState.emergencyFund = 0;
  GameState.runway = 0;
  GameState.streak = 0;
  GameState.bestStreak = 0;
  GameState.score = 0;
  GameState.gameOver = false;
  GameState.won = false;
  GameState.history = [];
  
  els.startScreen.classList.add('hidden');
  els.winScreen.classList.add('hidden');
  els.lossScreen.classList.add('hidden');
  
  updateHUD();
  loadScenario();
}

function loadScenario() {
  const scenario = randomChoice(SCENARIOS);
  GameState.scenario = scenario;
  
  els.scenarioText.textContent = scenario.text;
  renderChoices(scenario.choices);
  
  // Mascot coaching based on runway
  const runway = calculateRunway();
  if (runway <= 2) {
    setMascot("⚠️ Critical! You have less than 3 months of runway. Cut costs or find revenue NOW.", 'warning');
  } else if (runway <= 4) {
    setMascot("Careful — runway is getting tight. Prioritize recurring revenue and emergency funds.", 'warning');
  } else if (GameState.emergencyFund < 5000) {
    setMascot("Runway looks okay, but you need an emergency fund. Surprises happen.", 'neutral');
  } else {
    setMascot("Solid position! Consider growth investments, but don't get reckless.", 'happy');
  }
}

function makeChoice(choice, index) {
  // Apply choice effects
  GameState.monthlyRevenue += choice.revenue;
  GameState.monthlyExpenses += choice.expenses;
  GameState.emergencyFund += choice.emergency;
  
  // Recurring revenue compounds
  if (choice.recurring && choice.revenue > 0) {
    GameState.monthlyRevenue += Math.floor(choice.revenue * 0.2); // 20% growth on recurring
  }
  
  // Ensure minimums
  GameState.monthlyExpenses = Math.max(3000, GameState.monthlyExpenses);
  GameState.monthlyRevenue = Math.max(0, GameState.monthlyRevenue);
  
  // Apply monthly cashflow
  const cashflow = GameState.monthlyRevenue - GameState.monthlyExpenses;
  GameState.cash += cashflow;
  
  // Streak tracking
  if (cashflow > 0) {
    GameState.streak++;
    GameState.bestStreak = Math.max(GameState.bestStreak, GameState.streak);
  } else {
    GameState.streak = 0;
  }
  
  // Score
  GameState.score += Math.max(0, cashflow) + (GameState.streak * 500);
  
  // Record history
  GameState.history.push({
    month: GameState.month,
    choice: choice.text,
    cashflow,
    runway: calculateRunway()
  });
  
  // Check for random event
  const event = checkRandomEvent();
  if (event) {
    showEvent(event);
  } else {
    advanceMonth();
  }
}

function checkRandomEvent() {
  const roll = Math.random();
  let cumulative = 0;
  
  for (const event of EVENTS) {
    cumulative += event.probability;
    if (roll < cumulative) {
      return event;
    }
  }
  return null;
}

function showEvent(event) {
  els.eventIcon.textContent = event.icon;
  els.eventTitle.textContent = event.title;
  els.eventDesc.textContent = event.desc;
  els.eventOverlay.classList.remove('hidden');
  
  // Apply event effects
  if (event.cost) {
    // Try emergency fund first
    const efCover = Math.min(GameState.emergencyFund, event.cost);
    GameState.emergencyFund -= efCover;
    GameState.cash -= (event.cost - efCover);
    
    if (efCover > 0) {
      els.eventDesc.textContent += ` (Emergency fund covered $${efCover.toLocaleString()})`;
    }
  }
  
  if (event.revenueHit) {
    GameState.monthlyRevenue = Math.max(0, GameState.monthlyRevenue - event.revenueHit);
  }
  
  if (event.revenueBoost) {
    GameState.cash += event.revenueBoost;
    GameState.score += event.revenueBoost;
  }
  
  els.eventOk.onclick = () => {
    els.eventOverlay.classList.add('hidden');
    advanceMonth();
  };
}

function advanceMonth() {
  // Check win/loss
  const runway = calculateRunway();
  
  if (GameState.cash <= 0 || runway <= 0) {
    gameOver(false);
    return;
  }
  
  if (GameState.month >= GameState.maxMonths) {
    gameOver(true);
    return;
  }
  
  GameState.month++;
  updateHUD();
  loadScenario();
}

function gameOver(won) {
  GameState.gameOver = true;
  GameState.won = won;
  
  if (won) {
    const finalRunway = calculateRunway();
    els.finalRunway.textContent = finalRunway >= 99 ? '∞' : finalRunway;
    els.finalStreak.textContent = GameState.bestStreak;
    els.finalScore.textContent = GameState.score.toLocaleString();
    els.winScreen.classList.remove('hidden');
  } else {
    els.lossReason.textContent = `Your runway ran out in month ${GameState.month}.`;
    
    // Generate tip based on history
    const tip = generateLossTip();
    els.lossTip.textContent = tip;
    
    els.lossScreen.classList.remove('hidden');
  }
}

function generateLossTip() {
  const history = GameState.history;
  if (history.length === 0) return "Start by building recurring revenue — it's the foundation of runway.";
  
  // Analyze patterns
  const hadEmergencyFund = GameState.emergencyFund > 0;
  const recurringChoices = history.filter(h => h.choice.includes('🔁') || h.choice.includes('recurring')).length;
  const costCutChoices = history.filter(h => h.choice.includes('Cut') || h.choice.includes('cost')).length;
  
  if (!hadEmergencyFund) {
    return "You had no emergency fund. Surprises are guaranteed — build that buffer early.";
  }
  if (recurringChoices === 0) {
    return "You didn't prioritize recurring revenue. One-time wins don't extend runway.";
  }
  if (costCutChoices === 0) {
    return "You never cut costs. Sometimes the best growth strategy is spending less.";
  }
  return "Your cashflow turned negative. Watch the relationship between revenue timing and expense growth.";
}

// ==================== EVENT LISTENERS ====================
els.startBtn.addEventListener('click', startGame);
els.replayBtn.addEventListener('click', startGame);
els.tryAgainBtn.addEventListener('click', startGame);
els.howToBtn.addEventListener('click', () => els.howToScreen.classList.remove('hidden'));
els.howToBack.addEventListener('click', () => els.howToScreen.classList.add('hidden'));

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (els.startScreen.classList.contains('hidden') === false && e.key === 'Enter') {
    startGame();
  }
  if (els.eventOverlay.classList.contains('hidden') === false && e.key === 'Enter') {
    els.eventOk.click();
  }
});

// ==================== INIT ====================
updateHUD();
