/**
 * 100 Fans — MoneyBot Gaming Library
 * YC Lesson: Find product-market fit
 * Product-market fit simulation: acquire users, measure retention, iterate
 */

const GameState = {
  round: 1,
  score: 0,
  users: 0,
  fans: 0,
  retention: 0,
  nps: 0,
  gameOver: false,
  won: false
};

const FEATURES = [
  {
    text: "Users say onboarding is confusing. What do you build?",
    choices: [
      { text: "Interactive tutorial", users: 50, fans: 10, retention: 15, nps: 5, desc: "Helps new users" },
      { text: "Simplify the UI", users: 30, fans: 15, retention: 20, nps: 10, desc: "Better UX" },
      { text: "Video demo", users: 20, fans: 5, retention: 5, nps: 0, desc: "Low impact" },
      { text: "Ignore, focus on features", users: 0, fans: -5, retention: -10, nps: -5, desc: "Risky" }
    ]
  },
  {
    text: "Power users want an API. Others don't care.",
    choices: [
      { text: "Build the API", users: 10, fans: 20, retention: 5, nps: 10, desc: "Power user delight" },
      { text: "Build what most users want", users: 40, fans: 10, retention: 10, nps: 5, desc: "Broad appeal" },
      { text: "Build both", users: 30, fans: 15, retention: 10, nps: 8, desc: "But slower" },
      { text: "Neither, stay focused", users: 0, fans: 0, retention: 0, nps: 0, desc: "Safe but stagnant" }
    ]
  },
  {
    text: "Churn is high. Users say they 'don't see the value.'",
    choices: [
      { text: "Add more features", users: 20, fans: 0, retention: -5, nps: -5, desc: "More complexity" },
      { text: "Cut features, focus on core", users: -10, fans: 15, retention: 25, nps: 15, desc: "Simpler is better" },
      { text: "Raise prices to filter users", users: -20, fans: 10, retention: 10, nps: 5, desc: "Quality over quantity" },
      { text: "Add customer success calls", users: 5, fans: 20, retention: 20, nps: 10, desc: "Personal touch" }
    ]
  },
  {
    text: "A user says 'I'd be devastated if this shut down.'",
    choices: [
      { text: "Ask them to refer friends", users: 30, fans: 10, retention: 5, nps: 10, desc: "Leverage love" },
      { text: "Interview them deeply", users: 5, fans: 20, retention: 10, nps: 15, desc: "Learn from fans" },
      { text: "Make them a case study", users: 20, fans: 15, retention: 5, nps: 10, desc: "Social proof" },
      { text: "Ignore, they're an outlier", users: 0, fans: -10, retention: -5, nps: -10, desc: "Dangerous" }
    ]
  },
  {
    text: "You have 50 users. How do you get to 100 fans?",
    choices: [
      { text: "Launch on Product Hunt", users: 100, fans: 10, retention: -10, nps: -5, desc: "Spike, then churn" },
      { text: "Double down on existing users", users: 20, fans: 30, retention: 20, nps: 20, desc: "Organic growth" },
      { text: "Run ads", users: 80, fans: 5, retention: -15, nps: -10, desc: "Expensive, low quality" },
      { text: "Partner with complementary tool", users: 40, fans: 20, retention: 10, nps: 10, desc: "Smart distribution" }
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
  GameState.users = 10;
  GameState.fans = 0;
  GameState.retention = 20;
  GameState.nps = 0;
  GameState.gameOver = false;
  GameState.won = false;

  els.startScreen.classList.add('hidden');
  els.winScreen.classList.add('hidden');
  els.lossScreen.classList.add('hidden');

  updateHUD();
  loadFeature();
}

function updateHUD() {
  els.score.textContent = GameState.fans;
  els.round.textContent = GameState.round;
}

function loadFeature() {
  if (GameState.round > 5) {
    if (GameState.fans >= 100) {
      gameOver(true, `You found product-market fit! ${GameState.fans} true fans.`);
    } else {
      gameOver(false, `Only ${GameState.fans} fans. You need 100 for PMF.`);
    }
    return;
  }

  const feature = FEATURES[GameState.round - 1];
  els.cardCategory.textContent = `Iteration ${GameState.round}`;
  els.cardQuestion.textContent = feature.text;

  renderChoices(feature.choices);
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
  GameState.fans += choice.fans;
  GameState.retention += choice.retention;
  GameState.nps += choice.nps;
  GameState.score = GameState.fans;

  GameState.round++;
  updateHUD();
  loadFeature();
}

function gameOver(won, reason) {
  GameState.gameOver = true;
  GameState.won = won;

  if (won) {
    els.winReason.textContent = reason;
    els.winScreen.classList.remove('hidden');
  } else {
    els.lossReason.textContent = reason;
    els.lossTip.textContent = "100 fans who love you beats 10,000 who like you. Focus on retention over acquisition.";
    els.lossScreen.classList.remove('hidden');
  }
}

els.startBtn.addEventListener('click', startGame);
els.replayBtn.addEventListener('click', startGame);
els.tryAgainBtn.addEventListener('click', startGame);

updateHUD();
