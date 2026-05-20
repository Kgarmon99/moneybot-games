/**
 * The First Hire — MoneyBot Gaming Library
 * YC Lesson: Hire slow
 * Interview simulation: evaluate candidates, decide when to hire
 */

const GameState = {
  round: 1,
  score: 0,
  teamQuality: 0,
  candidatesInterviewed: 0,
  hired: [],
  gameOver: false,
  won: false
};

const CANDIDATES = [
  { name: "Alex", role: "Engineer", skill: 90, culture: 40, cost: 120, quote: "I work best alone. Meetings are a waste of time." },
  { name: "Jordan", role: "Designer", skill: 70, culture: 90, cost: 100, quote: "I love collaborating. Let's whiteboard this together." },
  { name: "Casey", role: "PM", skill: 60, culture: 70, cost: 80, quote: "I can wear many hats. Whatever the team needs." },
  { name: "Morgan", role: "Engineer", skill: 95, culture: 30, cost: 150, quote: "I'm the best coder you'll meet. I don't need feedback." },
  { name: "Riley", role: "Marketer", skill: 75, culture: 85, cost: 90, quote: "I believe in the mission. I'll do whatever it takes." }
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
  GameState.teamQuality = 0;
  GameState.candidatesInterviewed = 0;
  GameState.hired = [];
  GameState.gameOver = false;
  GameState.won = false;

  els.startScreen.classList.add('hidden');
  els.winScreen.classList.add('hidden');
  els.lossScreen.classList.add('hidden');

  updateHUD();
  loadCandidate();
}

function updateHUD() {
  els.score.textContent = GameState.score;
  els.round.textContent = GameState.round;
}

function loadCandidate() {
  if (GameState.round > 5) {
    if (GameState.teamQuality >= 200) {
      gameOver(true, `Your team quality is ${GameState.teamQuality}. You hired well!`);
    } else {
      gameOver(false, `Team quality is only ${GameState.teamQuality}. You need better hires.`);
    }
    return;
  }

  const candidate = CANDIDATES[GameState.round - 1];
  GameState.currentCandidate = candidate;

  els.cardCategory.textContent = `${candidate.role} Candidate`;
  els.cardQuestion.textContent = `"${candidate.quote}"`;

  renderChoices(candidate);
}

function renderChoices(candidate) {
  els.choices.innerHTML = '';

  const choices = [
    {
      text: "Hire immediately",
      desc: "Speed matters in startups",
      action: () => {
        GameState.hired.push(candidate);
        GameState.teamQuality += candidate.skill + candidate.culture - candidate.cost;
        GameState.score += candidate.skill + candidate.culture;
      }
    },
    {
      text: "Check references",
      desc: "Verify their background",
      action: () => {
        GameState.score += 10;
        GameState.teamQuality += candidate.culture;
        if (candidate.culture < 50) {
          GameState.teamQuality -= 20;
        }
      }
    },
    {
      text: "Pass",
      desc: "Keep looking",
      action: () => {
        GameState.score += 5;
      }
    },
    {
      text: "Negotiate equity",
      desc: "Align incentives",
      action: () => {
        if (candidate.culture > 70) {
          GameState.hired.push(candidate);
          GameState.teamQuality += candidate.skill + candidate.culture;
          GameState.score += candidate.skill + candidate.culture + 20;
        } else {
          GameState.score -= 10;
        }
      }
    }
  ];

  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-card';
    btn.innerHTML = `<span class="choice-text">${choice.text}</span><span class="choice-preview">${choice.desc}</span>`;
    btn.addEventListener('click', () => makeChoice(choice));
    els.choices.appendChild(btn);
  });
}

function makeChoice(choice) {
  choice.action();
  GameState.round++;
  updateHUD();
  loadCandidate();
}

function gameOver(won, reason) {
  GameState.gameOver = true;
  GameState.won = won;

  if (won) {
    els.winReason.textContent = reason;
    els.winScreen.classList.remove('hidden');
  } else {
    els.lossReason.textContent = reason;
    els.lossTip.textContent = "YC hires for slope, not intercept. Culture fit beats raw skill early on.";
    els.lossScreen.classList.remove('hidden');
  }
}

els.startBtn.addEventListener('click', startGame);
els.replayBtn.addEventListener('click', startGame);
els.tryAgainBtn.addEventListener('click', startGame);

updateHUD();
