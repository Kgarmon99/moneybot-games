/**
 * Ramen Profitability — MoneyBot Gaming Library
 * YC Lesson: Default alive
 * Survival simulation: minimize burn, maximize revenue, reach profitability
 */

const GameState = {
  round: 1,
  score: 0,
  cash: 10000,
  monthlyRevenue: 2000,
  monthlyExpenses: 8000,
  ramenMonths: 0,
  gameOver: false,
  won: false
};

const DECISIONS = [
  {
    text: "A customer wants a custom feature. It'll take 2 weeks.",
    choices: [
      { text: "Build it", revenue: 500, expenses: 2000, desc: "Custom work, one-time revenue" },
      { text: "Say no, focus on core", revenue: 0, expenses: 0, desc: "Protect focus" },
      { text: "Charge $5K upfront", revenue: 5000, expenses: 2000, desc: "High risk, high reward" },
      { text: "Add to roadmap for later", revenue: 0, expenses: 500, desc: "Defer, minimal cost" }
    ]
  },
  {
    text: "Your office lease is up. Current rent is $3K/month.",
    choices: [
      { text: "Renew for 1 year", revenue: 0, expenses: 3000, desc: "Stability" },
      { text: "Go remote", revenue: 0, expenses: 500, desc: "Save $2.5K/month" },
      { text: "Sublet to another startup", revenue: 1500, expenses: 3000, desc: "Partial offset" },
      { text: "Move to cheaper space", revenue: 0, expenses: 1500, desc: "Cut costs 50%" }
    ]
  },
  {
    text: "A competitor is poaching your customers with discounts.",
    choices: [
      { text: "Match their prices", revenue: -1000, expenses: 0, desc: "Race to bottom" },
      { text: "Double down on service", revenue: 500, expenses: 1000, desc: "Differentiate" },
      { text: "Ignore them", revenue: -500, expenses: 0, desc: "Focus on your lane" },
      { text: "Acquire their churned users", revenue: 800, expenses: 500, desc: "Smart targeting" }
    ]
  },
  {
    text: "You can hire a senior dev for $15K/month or 2 juniors for $8K each.",
    choices: [
      { text: "Senior dev", revenue: 2000, expenses: 15000, desc: "High output, high cost" },
      { text: "2 juniors", revenue: 3000, expenses: 16000, desc: "More hands, more management" },
      { text: "Don't hire", revenue: 0, expenses: 0, desc: "Stay lean" },
      { text: "Contractor for 3 months", revenue: 1000, expenses: 12000, desc: "Flexible, temporary" }
    ]
  },
  {
    text: "A big enterprise wants annual billing with 30% discount.",
    choices: [
      { text: "Accept", revenue: 8400, expenses: 0, desc: "Cash now, less later" },
      { text: "Negotiate 15% discount", revenue: 10200, expenses: 0, desc: "Better terms" },
      { text: "Stick to monthly", revenue: 1200, expenses: 0, desc: "Higher LTV, slower cash" },
      { text: "Require quarterly", revenue: 3000, expenses: 0, desc: "Middle ground" }
    ]
  }
];

const els = {
  score: document.getElementById('score'),
  round: document.getElementById('round'),
  cardCategory: document.getElementById('card-category'),
  cardQuestion: document.getElementById('card-question'),
  choices: document.getElementById('choices'),
  startScreen: document.getElementById('start-screen'),
  winScreen: document.getElementById('win-screen'),
  lossScreen: document.getElementById('loss-screen'),
  startBtn: document.getElementById('start-btn'),
  replayBtn: document.getElementById('replay-btn'),
  tryAgainBtn: document.getElementById('try-again-btn'),
  winReason: document.getElementById('win-reason'),
  lossReason: document.getElementById('loss-reason'),
  lossTip: document.getElementById('loss-tip')
};

function startGame() {
  GameState.round = 1;
  GameState.score = 0;
  GameState.cash = 10000;
  GameState.monthlyRevenue = 2000;
  GameState.monthlyExpenses = 8000;
  GameState.ramenMonths = 0;
  GameState.gameOver = false;
  GameState.won = false;

  els.startScreen.classList.add('hidden');
  els.winScreen.classList.add('hidden');
  els.lossScreen.classList.add('hidden');

  updateHUD();
  loadDecision();
}

function updateHUD() {
  els.score.textContent = GameState.score;
  els.round.textContent = GameState.round;
}

function loadDecision() {
  if (GameState.round > 5) {
    if (GameState.monthlyRevenue >= GameState.monthlyExpenses) {
      gameOver(true, `You're ramen profitable! $${GameState.monthlyRevenue - GameState.monthlyExpenses}/month.`);
    } else {
      gameOver(false, `Burning $${GameState.monthlyExpenses - GameState.monthlyRevenue}/month. Not sustainable.`);
    }
    return;
  }

  const decision = DECISIONS[GameState.round - 1];
  els.cardCategory.textContent = `Month ${GameState.round}`;
  els.cardQuestion.textContent = decision.text;

  renderChoices(decision.choices);
}

function renderChoices(choices) {
  els.choices.innerHTML = '';
  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-card';
    btn.innerHTML = `<span class="choice-text">${choice.text}</span><span class="choice-preview">${choice.desc}</span>`;
    btn.addEventListener('click', () => makeChoice(choice));
    els.choices.appendChild(btn);
  });
}

function makeChoice(choice) {
  GameState.monthlyRevenue += choice.revenue;
  GameState.monthlyExpenses += choice.expenses;
  GameState.cash += (GameState.monthlyRevenue - GameState.monthlyExpenses);
  GameState.score += Math.max(0, choice.revenue - choice.expenses);

  if (GameState.monthlyRevenue >= GameState.monthlyExpenses) {
    GameState.ramenMonths++;
  }

  GameState.round++;
  updateHUD();
  loadDecision();
}

function gameOver(won, reason) {
  GameState.gameOver = true;
  GameState.won = won;

  if (won) {
    els.winReason.textContent = reason;
    els.winScreen.classList.remove('hidden');
  } else {
    els.lossReason.textContent = reason;
    els.lossTip.textContent = "Default alive beats default dead. Revenue must cover expenses, even if it's ramen-level.";
    els.lossScreen.classList.remove('hidden');
  }
}

els.startBtn.addEventListener('click', startGame);
els.replayBtn.addEventListener('click', startGame);
els.tryAgainBtn.addEventListener('click', startGame);

updateHUD();
