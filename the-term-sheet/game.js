/**
 * The Term Sheet — MoneyBot Gaming Library
 * YC Lesson: Know your numbers
 * Negotiation simulation: valuation, dilution, control
 */

const GameState = {
  round: 1,
  score: 0,
  valuation: 5000000,
  ownership: 100,
  boardSeats: 1,
  cash: 0,
  gameOver: false,
  won: false
};

const TERMS = [
  {
    text: "Investor offers $2M at $8M pre. They want 20%.",
    choices: [
      { text: "Accept", valuation: 8000000, ownership: -20, boardSeats: 0, cash: 2000000, desc: "Standard deal" },
      { text: "Counter at $10M pre", valuation: 10000000, ownership: -16, boardSeats: 0, cash: 2000000, desc: "Better valuation" },
      { text: "Ask for pro-rata rights", valuation: 8000000, ownership: -20, boardSeats: 0, cash: 2000000, desc: "Protect future rounds" },
      { text: "Decline, keep bootstrapping", valuation: 5000000, ownership: 0, boardSeats: 0, cash: 0, desc: "Keep control" }
    ]
  },
  {
    text: "Investor wants a board seat and veto on future rounds.",
    choices: [
      { text: "Give them the seat", valuation: 0, ownership: 0, boardSeats: 1, cash: 0, desc: "Lose control" },
      { text: "Negotiate observer seat only", valuation: 0, ownership: 0, boardSeats: 0, cash: 0, desc: "Keep voting power" },
      { text: "Require supermajority for vetoes", valuation: 0, ownership: 0, boardSeats: 0, cash: 0, desc: "Protect decisions" },
      { text: "Walk away", valuation: 0, ownership: 0, boardSeats: 0, cash: 0, desc: "Find better terms" }
    ]
  },
  {
    text: "Investor wants participating preferred shares.",
    choices: [
      { text: "Accept", valuation: 0, ownership: -5, boardSeats: 0, cash: 0, desc: "Expensive in exit" },
      { text: "Counter with non-participating", valuation: 0, ownership: 0, boardSeats: 0, cash: 0, desc: "Standard, fair" },
      { text: "Ask for cap on participation", valuation: 0, ownership: -2, boardSeats: 0, cash: 0, desc: "Middle ground" },
      { text: "Refuse", valuation: 0, ownership: 0, boardSeats: 0, cash: 0, desc: "Stand firm" }
    ]
  },
  {
    text: "Investor wants 2x liquidation preference.",
    choices: [
      { text: "Accept", valuation: 0, ownership: -3, boardSeats: 0, cash: 0, desc: "Founders get less" },
      { text: "Counter at 1x", valuation: 0, ownership: 0, boardSeats: 0, cash: 0, desc: "Market standard" },
      { text: "Offer 1.5x with cap", valuation: 0, ownership: -1, boardSeats: 0, cash: 0, desc: "Compromise" },
      { text: "Walk", valuation: 0, ownership: 0, boardSeats: 0, cash: 0, desc: "Too greedy" }
    ]
  },
  {
    text: "Final term: Investor wants right of first refusal on sale.",
    choices: [
      { text: "Accept", valuation: 0, ownership: 0, boardSeats: 0, cash: 0, desc: "Limits buyers" },
      { text: "Limit ROFR to 48 hours", valuation: 0, ownership: 0, boardSeats: 0, cash: 0, desc: "Reasonable" },
      { text: "Require board approval for ROFR", valuation: 0, ownership: 0, boardSeats: 0, cash: 0, desc: "Protects founders" },
      { text: "Reject entirely", valuation: 0, ownership: 0, boardSeats: 0, cash: 0, desc: "Clean terms" }
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
  GameState.valuation = 5000000;
  GameState.ownership = 100;
  GameState.boardSeats = 1;
  GameState.cash = 0;
  GameState.gameOver = false;
  GameState.won = false;

  els.startScreen.classList.add('hidden');
  els.winScreen.classList.add('hidden');
  els.lossScreen.classList.add('hidden');

  updateHUD();
  loadTerm();
}

function updateHUD() {
  els.score.textContent = `${GameState.ownership}%`;
  els.round.textContent = GameState.round;
}

function loadTerm() {
  if (GameState.round > 5) {
    if (GameState.ownership >= 50 && GameState.boardSeats <= 2) {
      gameOver(true, `You kept ${GameState.ownership}% ownership and control. Well negotiated!`);
    } else {
      gameOver(false, `You only own ${GameState.ownership}% and have ${GameState.boardSeats} board seats. Too much given up.`);
    }
    return;
  }

  const term = TERMS[GameState.round - 1];
  els.cardCategory.textContent = `Term ${GameState.round}`;
  els.cardQuestion.textContent = term.text;

  renderChoices(term.choices);
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
  GameState.valuation = Math.max(choice.valuation, GameState.valuation);
  GameState.ownership += choice.ownership;
  GameState.boardSeats += choice.boardSeats;
  GameState.cash += choice.cash;
  GameState.score = GameState.ownership;

  GameState.round++;
  updateHUD();
  loadTerm();
}

function gameOver(won, reason) {
  GameState.gameOver = true;
  GameState.won = won;

  if (won) {
    els.winReason.textContent = reason;
    els.winScreen.classList.remove('hidden');
  } else {
    els.lossReason.textContent = reason;
    els.lossTip.textContent = "YC's standard deal: $500K for 7%. Anything worse than that, negotiate harder.";
    els.lossScreen.classList.remove('hidden');
  }
}

els.startBtn.addEventListener('click', startGame);
els.replayBtn.addEventListener('click', startGame);
els.tryAgainBtn.addEventListener('click', startGame);

updateHUD();
