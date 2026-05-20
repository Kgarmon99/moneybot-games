/**
 * Growth Loops — MoneyBot Gaming Library
 * YC Lesson: Build growth into product
 * Growth simulation: design viral loops, retention, referrals
 */

const GameState = {
  round: 1,
  score: 0,
  users: 100,
  viralCoeff: 0,
  retentionRate: 20,
  referralRate: 0,
  gameOver: false,
  won: false
};

const GROWTH_DECISIONS = [
  {
    text: "How do new users discover your product?",
    choices: [
      { text: "Invite friends for premium", users: 200, viralCoeff: 0.3, retentionRate: 5, referralRate: 30, desc: "Viral loop" },
      { text: "SEO content marketing", users: 50, viralCoeff: 0, retentionRate: 15, referralRate: 5, desc: "Slow, sustainable" },
      { text: "Paid ads on social", users: 300, viralCoeff: 0, retentionRate: -10, referralRate: 0, desc: "Expensive, low quality" },
      { text: "Product-led growth (free tier)", users: 150, viralCoeff: 0.2, retentionRate: 10, referralRate: 15, desc: "Balanced" }
    ]
  },
  {
    text: "Users sign up but don't return. What's the fix?",
    choices: [
      { text: "Email drip campaign", users: 20, viralCoeff: 0, retentionRate: 15, referralRate: 5, desc: "Nurture users" },
      { text: "In-app onboarding checklist", users: 30, viralCoeff: 0, retentionRate: 25, referralRate: 0, desc: "Guide to value" },
      { text: "Push notifications", users: 10, viralCoeff: 0, retentionRate: 10, referralRate: 0, desc: "Annoying but works" },
      { text: "Redesign core feature", users: -20, viralCoeff: 0, retentionRate: 30, referralRate: 0, desc: "High effort, high reward" }
    ]
  },
  {
    text: "Power users love you. How do you leverage them?",
    choices: [
      { text: "Referral program ($50 credit)", users: 100, viralCoeff: 0.4, retentionRate: 0, referralRate: 40, desc: "Incentivized sharing" },
      { text: "Case studies and testimonials", users: 30, viralCoeff: 0.1, retentionRate: 5, referralRate: 10, desc: "Social proof" },
      { text: "Affiliate program", users: 80, viralCoeff: 0.2, retentionRate: 0, referralRate: 25, desc: "Paid distribution" },
      { text: "User community/forum", users: 40, viralCoeff: 0.1, retentionRate: 20, referralRate: 10, desc: "Engagement loop" }
    ]
  },
  {
    text: "Growth is slowing. What's your next move?",
    choices: [
      { text: "Launch in new market", users: 200, viralCoeff: 0, retentionRate: -5, referralRate: 0, desc: "Geographic expansion" },
      { text: "Add enterprise tier", users: 50, viralCoeff: 0, retentionRate: 10, referralRate: 0, desc: "Higher ACV" },
      { text: "Build viral feature", users: 100, viralCoeff: 0.5, retentionRate: 5, referralRate: 50, desc: "Product-led viral" },
      { text: "Partner with platform", users: 150, viralCoeff: 0.2, retentionRate: 10, referralRate: 20, desc: "Distribution deal" }
    ]
  },
  {
    text: "You're at 1,000 users. How do you 10x?",
    choices: [
      { text: "Raise $5M, hire sales team", users: 500, viralCoeff: 0, retentionRate: -10, referralRate: 0, desc: "Sales-led" },
      { text: "Optimize viral loop", users: 300, viralCoeff: 0.8, retentionRate: 10, referralRate: 60, desc: "Compound growth" },
      { text: "Content + SEO at scale", users: 200, viralCoeff: 0, retentionRate: 20, referralRate: 10, desc: "Organic flywheel" },
      { text: "API/platform play", users: 400, viralCoeff: 0.3, retentionRate: 15, referralRate: 30, desc: "B2B2C" }
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
  GameState.users = 100;
  GameState.viralCoeff = 0;
  GameState.retentionRate = 20;
  GameState.referralRate = 0;
  GameState.gameOver = false;
  GameState.won = false;

  els.startScreen.classList.add('hidden');
  els.winScreen.classList.add('hidden');
  els.lossScreen.classList.add('hidden');

  updateHUD();
  loadDecision();
}

function updateHUD() {
  els.score.textContent = GameState.users;
  els.round.textContent = GameState.round;
}

function loadDecision() {
  if (GameState.round > 5) {
    const growth = GameState.users * (1 + GameState.viralCoeff) * (GameState.retentionRate / 100);
    GameState.users = Math.floor(growth);

    if (GameState.users >= 10000) {
      gameOver(true, `You reached ${GameState.users.toLocaleString()} users through compounding growth!`);
    } else {
      gameOver(false, `Only ${GameState.users.toLocaleString()} users. Your growth loops weren't strong enough.`);
    }
    return;
  }

  const decision = GROWTH_DECISIONS[GameState.round - 1];
  els.cardCategory.textContent = `Growth ${GameState.round}`;
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
  GameState.users += choice.users;
  GameState.viralCoeff = Math.min(2, GameState.viralCoeff + choice.viralCoeff);
  GameState.retentionRate = Math.min(100, Math.max(0, GameState.retentionRate + choice.retentionRate));
  GameState.referralRate = Math.min(100, GameState.referralRate + choice.referralRate);
  GameState.score = GameState.users;

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
    els.lossTip.textContent = "Growth loops > growth hacks. Build compounding systems, not one-time spikes.";
    els.lossScreen.classList.remove('hidden');
  }
}

els.startBtn.addEventListener('click', startGame);
els.replayBtn.addEventListener('click', startGame);
els.tryAgainBtn.addEventListener('click', startGame);

updateHUD();
