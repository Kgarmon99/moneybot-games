/**
 * Do Things That Don't Scale — MoneyBot Gaming Library
 * YC Lesson: Do things that don't scale
 * Manual growth simulation: do unscalable tasks, automate when proven
 */

const GameState = {
  week: 1,
  users: 0,
  automation: 0,
  burnout: 0,
  tasksCompleted: 0,
  gameOver: false,
  won: false
};

const TASKS = [
  { text: "A new user signed up. Send them a personal welcome email.", effort: 20, reward: 5, autoCost: 100 },
  { text: "A customer has a bug. Jump on a call to debug it together.", effort: 40, reward: 10, autoCost: 200 },
  { text: "A user tweeted praise. Reply personally and ask for a testimonial.", effort: 15, reward: 8, autoCost: 80 },
  { text: "A prospect is hesitating. Offer to onboard them manually.", effort: 50, reward: 15, autoCost: 300 },
  { text: "A customer churned. Call them to learn why.", effort: 30, reward: 12, autoCost: 150 },
  { text: "A power user has ideas. Schedule a 30-min feedback session.", effort: 35, reward: 10, autoCost: 180 },
  { text: "Someone posted on Reddit about your space. Reply helpfully.", effort: 25, reward: 7, autoCost: 120 },
  { text: "A enterprise lead wants a demo. Build a custom deck for them.", effort: 60, reward: 20, autoCost: 400 }
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
  GameState.week = 1;
  GameState.users = 0;
  GameState.automation = 0;
  GameState.burnout = 0;
  GameState.tasksCompleted = 0;
  GameState.gameOver = false;
  GameState.won = false;

  els.startScreen.classList.add('hidden');
  els.winScreen.classList.add('hidden');
  els.lossScreen.classList.add('hidden');

  updateHUD();
  loadTask();
}

function updateHUD() {
  els.score.textContent = GameState.users;
  els.round.textContent = GameState.week;
}

function loadTask() {
  if (GameState.week > 12) {
    if (GameState.users >= 100) {
      gameOver(true, `You grew to ${GameState.users} users through manual hustle.`);
    } else {
      gameOver(false, `Only ${GameState.users} users after 12 weeks. Not enough.`);
    }
    return;
  }

  if (GameState.burnout >= 100) {
    gameOver(false, "You burned out. Too much manual work without automation.");
    return;
  }

  const task = TASKS[Math.floor(Math.random() * TASKS.length)];
  GameState.currentTask = task;

  els.cardCategory.textContent = `Week ${GameState.week}`;
  els.cardQuestion.textContent = task.text;

  renderChoices(task);
}

function renderChoices(task) {
  els.choices.innerHTML = '';

  const choices = [
    {
      text: "Do it manually",
      desc: `+${task.reward} users, +${task.effort} burnout`,
      action: () => {
        GameState.users += task.reward;
        GameState.burnout += task.effort;
        GameState.tasksCompleted++;
      }
    },
    {
      text: "Automate it",
      desc: `Costs ${task.autoCost} users to build, then runs itself`,
      action: () => {
        if (GameState.users >= task.autoCost * 0.5) {
          GameState.automation = Math.min(100, GameState.automation + 15);
          GameState.users -= Math.floor(task.autoCost * 0.3);
          GameState.burnout = Math.max(0, GameState.burnout - 20);
        }
      }
    },
    {
      text: "Skip it",
      desc: "No users gained, burnout recovers",
      action: () => {
        GameState.burnout = Math.max(0, GameState.burnout - 10);
      }
    },
    {
      text: "Delegate to intern",
      desc: "Half the users, half the burnout",
      action: () => {
        GameState.users += Math.floor(task.reward * 0.5);
        GameState.burnout += Math.floor(task.effort * 0.5);
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
  GameState.week++;

  // Automation bonus
  if (GameState.automation > 0) {
    GameState.users += Math.floor(GameState.automation * 0.2);
  }

  updateHUD();
  loadTask();
}

function gameOver(won, reason) {
  GameState.gameOver = true;
  GameState.won = won;

  if (won) {
    els.winReason.textContent = reason;
    els.winScreen.classList.remove('hidden');
  } else {
    els.lossReason.textContent = reason;

    let tip = "Automate only when the manual work is proven to matter.";
    if (GameState.burnout >= 100) {
      tip = "You automated too late. Build systems before you hit the wall.";
    } else if (GameState.automation > 50 && GameState.users < 50) {
      tip = "You automated too early. Prove the task matters before building systems.";
    }
    els.lossTip.textContent = tip;

    els.lossScreen.classList.remove('hidden');
  }
}

els.startBtn.addEventListener('click', startGame);
els.replayBtn.addEventListener('click', startGame);
els.tryAgainBtn.addEventListener('click', startGame);

updateHUD();
