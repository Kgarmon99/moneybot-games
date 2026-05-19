/**
 * Demo Day Dash — MoneyBot
 * YC Lesson: A great pitch is specific, metric-driven, and ready for objections.
 */

const Game = {
  phaseIndex: 0,
  hype: 45,
  clarity: 50,
  traction: 35,
  partnerLikes: 0,
  mistakes: 0,
  streak: 0,
  timeLeft: 75,
  maxTime: 75,
  gameOver: false,
  selectedLine: null,
  currentObjection: null,
  objectionEvery: new Set([1, 3, 4]),
  usedObjections: []
};

const PHASES = [
  {
    label: 'Hook',
    title: 'Open with a sharp hook',
    prompt: 'You have ten seconds to make partners care.',
    best: 'Run payroll teams waste 11 hours a week fixing contractor payments. We cut that to 7 minutes.',
    okay: 'We help companies pay contractors faster with software.',
    weak: 'Payments are broken and we are using AI to solve it.',
    lesson: 'Specific pain plus time saved beats generic market language.',
    metric: 'pain'
  },
  {
    label: 'Problem',
    title: 'Make the problem undeniable',
    prompt: 'Show why this is urgent enough to fund.',
    best: 'Our first 42 interviews all mentioned the same failure: missed filings create penalties and churn.',
    okay: 'Customers told us compliance is annoying and expensive.',
    weak: 'Everyone has this problem eventually.',
    lesson: 'Investor confidence rises when the problem is proven by customer evidence.',
    metric: 'clarity'
  },
  {
    label: 'Solution',
    title: 'Explain the wedge',
    prompt: 'Keep it concrete. No buzzword fog.',
    best: 'We start with one painful workflow: contractor onboarding, tax forms, and first payment in one link.',
    okay: 'We are building an all-in-one platform for finance operations.',
    weak: 'Our AI agent handles everything automatically.',
    lesson: 'A narrow wedge feels more believable than a giant first product.',
    metric: 'focus'
  },
  {
    label: 'Traction',
    title: 'Prove momentum',
    prompt: 'Numbers beat promises.',
    best: '$18K MRR, 31% month-over-month growth, and 82% weekly active payroll admins.',
    okay: 'We have pilots with several companies and strong feedback.',
    weak: 'People love the idea and our waitlist is growing.',
    lesson: 'Revenue, retention, and usage are stronger than vibes.',
    metric: 'traction'
  },
  {
    label: 'Ask',
    title: 'Close with a crisp ask',
    prompt: 'Tell them exactly what funding buys.',
    best: 'We are raising $500K for 18 months to reach $100K MRR and prove repeatable sales.',
    okay: 'We are raising a seed round to grow faster.',
    weak: 'We need money for hiring, marketing, and product.',
    lesson: 'A good ask connects capital to milestones and runway.',
    metric: 'runway'
  }
];

const OBJECTIONS = [
  {
    q: 'Why will customers switch from their current payroll provider?',
    best: 'We are not replacing payroll first. We attach to the painful contractor edge case they already hack around.',
    weak: 'Our design is better and the market is ready.',
    lesson: 'Position the wedge before claiming a platform shift.'
  },
  {
    q: 'What is your unfair advantage?',
    best: 'Our onboarding data improves every tax and compliance check, and our founder sold this workflow for four years.',
    weak: 'We move faster than big companies.',
    lesson: 'Moats are earned through data, distribution, workflow depth, or founder-market fit.'
  },
  {
    q: 'How do you get customers without burning cash?',
    best: 'Payroll consultants refer us because we remove their lowest-margin manual work.',
    weak: 'We will run ads and post more content.',
    lesson: 'A believable acquisition channel beats a pile of marketing tactics.'
  },
  {
    q: 'What breaks this business?',
    best: 'If weekly active admins stay under 60%, we stop expanding and rebuild onboarding before hiring sales.',
    weak: 'Nothing major, we feel good about the plan.',
    lesson: 'Strong founders know the kill criteria and the next experiment.'
  }
];

function $(id) { return document.getElementById(id); }

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function init() {
  $('start-btn').onclick = startGame;
  $('replay-btn').onclick = startGame;
  $('try-again-btn').onclick = startGame;
  $('how-to-btn').onclick = () => $('how-to-screen').classList.add('active');
  $('how-to-back').onclick = () => $('how-to-screen').classList.remove('active');
  $('start-screen').classList.add('active');
}

function startGame() {
  Object.assign(Game, {
    phaseIndex: 0,
    hype: 45,
    clarity: 50,
    traction: 35,
    partnerLikes: 0,
    mistakes: 0,
    streak: 0,
    timeLeft: 75,
    maxTime: 75,
    gameOver: false,
    selectedLine: null,
    currentObjection: null,
    usedObjections: []
  });

  document.body.classList.remove('game-ended');
  $('start-screen').classList.remove('active');
  $('how-to-screen').classList.remove('active');
  $('win-screen').classList.remove('active');
  $('loss-screen').classList.remove('active');
  $('investor-reaction').className = 'mascot-bubble';
  $('investor-reaction').textContent = 'Keep it specific. I am listening.';

  updateHUD();
  renderPhase();
  startTimer();
}

let timerInterval;
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (Game.gameOver) {
      clearInterval(timerInterval);
      return;
    }
    Game.timeLeft -= 1;
    if (Game.timeLeft <= 0) {
      Game.timeLeft = 0;
      finishGame();
    }
    updateHUD();
  }, 1000);
}

function updateHUD() {
  const score = Math.round((Game.hype * 0.45) + (Game.clarity * 0.35) + (Game.traction * 0.2));
  $('score').textContent = `${score}% ready`;
  $('round').textContent = `${Math.min(Game.phaseIndex + 1, PHASES.length)}/${PHASES.length}`;
  $('phase-label').textContent = Game.phaseIndex < PHASES.length
    ? `Phase ${Game.phaseIndex + 1}: ${PHASES[Game.phaseIndex].label}`
    : 'Final decision';

  const timeMin = Math.floor(Game.timeLeft / 60);
  const timeSec = Game.timeLeft % 60;
  $('time-display').textContent = `${timeMin}:${String(timeSec).padStart(2, '0')}`;

  const hypeBar = $('hype-bar');
  hypeBar.style.width = `${Game.hype}%`;
  hypeBar.className = `progress-fill ${Game.hype < 35 ? 'danger' : Game.hype < 60 ? 'warning' : ''}`;

  const phaseProgress = $('phase-progress');
  if (phaseProgress) phaseProgress.style.width = `${(Game.phaseIndex / PHASES.length) * 100}%`;

  const timerFill = $('timer-fill');
  if (timerFill) timerFill.style.width = `${(Game.timeLeft / Game.maxTime) * 100}%`;
}

function renderPhase() {
  if (Game.phaseIndex >= PHASES.length) {
    finishGame();
    return;
  }

  const phase = PHASES[Game.phaseIndex];
  Game.selectedLine = null;
  $('card-category').textContent = phase.label;
  $('card-question').textContent = phase.prompt;

  const choices = $('choices');
  choices.innerHTML = '';

  const board = document.createElement('div');
  board.className = 'pitch-board';
  board.innerHTML = `
    <div class="pitch-card">
      <div class="pitch-kicker">${phase.metric}</div>
      <h2>${phase.title}</h2>
      <p>${phase.prompt}</p>
      <div class="metric-row">
        <span>Hype ${Math.round(Game.hype)}%</span>
        <span>Clarity ${Math.round(Game.clarity)}%</span>
        <span>Traction ${Math.round(Game.traction)}%</span>
      </div>
    </div>
  `;
  choices.appendChild(board);

  const lines = shuffle([
    { level: 'best', text: phase.best, label: 'Sharp', delta: { hype: 12, clarity: 10, traction: phase.metric === 'traction' ? 14 : 5 } },
    { level: 'okay', text: phase.okay, label: 'Safe', delta: { hype: 4, clarity: 3, traction: phase.metric === 'traction' ? 5 : 1 } },
    { level: 'weak', text: phase.weak, label: 'Vague', delta: { hype: -10, clarity: -12, traction: -5 } }
  ]);

  const lineGrid = document.createElement('div');
  lineGrid.className = 'line-grid';
  lines.forEach(line => {
    const btn = document.createElement('button');
    btn.className = `pitch-line ${line.level}`;
    btn.innerHTML = `<span>${line.label}</span><strong>${line.text}</strong>`;
    btn.onclick = () => chooseLine(line, phase);
    lineGrid.appendChild(btn);
  });
  choices.appendChild(lineGrid);
}

function chooseLine(line, phase) {
  if (Game.gameOver) return;

  Game.hype = clamp(Game.hype + line.delta.hype);
  Game.clarity = clamp(Game.clarity + line.delta.clarity);
  Game.traction = clamp(Game.traction + line.delta.traction);

  if (line.level === 'best') {
    Game.streak += 1;
    Game.partnerLikes += 1;
    $('investor-reaction').className = 'mascot-bubble liked';
    $('investor-reaction').textContent = Game.streak >= 2 ? 'Now this sounds fundable.' : phase.lesson;
    pop(`+${line.delta.hype} hype`, 'var(--mb-green)');
  } else if (line.level === 'okay') {
    Game.streak = 0;
    $('investor-reaction').className = 'mascot-bubble';
    $('investor-reaction').textContent = 'Good direction. Make it more concrete.';
    pop('+signal', 'var(--mb-gold)');
  } else {
    Game.streak = 0;
    Game.mistakes += 1;
    $('investor-reaction').className = 'mascot-bubble disliked';
    $('investor-reaction').textContent = 'That sounds generic. Give me proof.';
    pop('-clarity', 'var(--mb-red)');
  }

  updateHUD();
  renderFeedback(line, phase);
}

function renderFeedback(line, phase) {
  const choices = $('choices');
  choices.innerHTML = `
    <div class="feedback-card ${line.level}">
      <div class="feedback-label">${line.level === 'best' ? 'Partner nods' : line.level === 'okay' ? 'Needs sharper proof' : 'Partner checks out'}</div>
      <h2>${line.text}</h2>
      <p>${phase.lesson}</p>
      <button class="btn-primary btn-large" id="continue-btn">${shouldAskObjection() ? 'Handle objection' : 'Next slide'}</button>
    </div>
  `;
  $('continue-btn').onclick = () => {
    if (shouldAskObjection()) renderObjection();
    else nextPhase();
  };
}

function shouldAskObjection() {
  return Game.objectionEvery.has(Game.phaseIndex) && !Game.usedObjections.includes(Game.phaseIndex);
}

function renderObjection() {
  const pool = OBJECTIONS.filter((_, index) => !Game.usedObjections.includes(`q${index}`));
  const q = pool[Math.floor(Math.random() * pool.length)] || OBJECTIONS[0];
  const qIndex = OBJECTIONS.indexOf(q);
  Game.usedObjections.push(Game.phaseIndex, `q${qIndex}`);
  Game.currentObjection = q;

  $('card-category').textContent = 'Investor objection';
  $('card-question').textContent = q.q;
  $('investor-reaction').className = 'mascot-bubble';
  $('investor-reaction').textContent = 'Answer fast. Confidence matters.';

  const answers = shuffle([
    { good: true, text: q.best },
    { good: false, text: q.weak }
  ]);

  $('choices').innerHTML = `
    <div class="objection-card">
      <div class="objection-icon">Q</div>
      <h2>${q.q}</h2>
      <p>Choose the answer that makes the business feel real.</p>
    </div>
    <div class="line-grid compact">
      ${answers.map((answer, index) => `
        <button class="pitch-line" data-answer="${index}">
          <span>${answer.good ? 'Prepared' : 'Hand-wave'}</span>
          <strong>${answer.text}</strong>
        </button>
      `).join('')}
    </div>
  `;

  document.querySelectorAll('[data-answer]').forEach(btn => {
    btn.onclick = () => answerObjection(answers[Number(btn.dataset.answer)], q);
  });
}

function answerObjection(answer, q) {
  if (answer.good) {
    Game.hype = clamp(Game.hype + 9);
    Game.clarity = clamp(Game.clarity + 8);
    Game.partnerLikes += 1;
    $('investor-reaction').className = 'mascot-bubble liked';
    $('investor-reaction').textContent = q.lesson;
    pop('Objection handled', 'var(--mb-green)');
  } else {
    Game.hype = clamp(Game.hype - 13);
    Game.clarity = clamp(Game.clarity - 10);
    Game.mistakes += 1;
    $('investor-reaction').className = 'mascot-bubble disliked';
    $('investor-reaction').textContent = 'That answer creates more diligence, not more conviction.';
    pop('Confidence hit', 'var(--mb-red)');
  }

  updateHUD();
  $('choices').innerHTML = `
    <div class="feedback-card ${answer.good ? 'best' : 'weak'}">
      <div class="feedback-label">${answer.good ? 'Clean answer' : 'Weak answer'}</div>
      <h2>${answer.text}</h2>
      <p>${q.lesson}</p>
      <button class="btn-primary btn-large" id="continue-btn">Next slide</button>
    </div>
  `;
  $('continue-btn').onclick = nextPhase;
}

function nextPhase() {
  Game.phaseIndex += 1;
  updateHUD();
  renderPhase();
}

function finishGame() {
  if (Game.gameOver) return;
  Game.gameOver = true;
  clearInterval(timerInterval);
  updateHUD();

  const score = Math.round((Game.hype * 0.45) + (Game.clarity * 0.35) + (Game.traction * 0.2));
  if (score >= 72 && Game.mistakes <= 3) showWin(score);
  else showLoss(score);
}

function showWin(score) {
  clearPlayArea();
  const valuation = Math.max(6, Math.round((score / 100) * 22 + Game.partnerLikes * 1.5));
  $('valuation').textContent = `$${valuation}M`;
  $('final-score').textContent = `${score}%`;
  $('final-time').textContent = `${Game.timeLeft}s`;
  $('final-reactions').textContent = Game.partnerLikes;
  $('partner-quote').textContent = Game.traction >= 65
    ? 'The traction slide made the round feel obvious.'
    : 'The story is crisp. Keep proving repeatable growth.';
  $('win-reason').textContent = `Fundable pitch: ${score}% readiness, ${Game.partnerLikes} partner conviction moments.`;
  $('win-screen').classList.add('active');
}

function showLoss(score) {
  clearPlayArea();
  $('loss-reason').textContent = `The pitch landed at ${score}% readiness. Partners need more proof before investing.`;
  $('loss-tip').textContent = Game.traction < 55
    ? 'Bring harder traction: revenue, retention, usage, or a clear customer pull signal.'
    : Game.clarity < 60
      ? 'Cut vague language. Use specific customers, numbers, and a narrow wedge.'
      : 'Objections matter. Prepare answers for moat, switching, acquisition, and failure points.';
  $('loss-screen').classList.add('active');
}

function clearPlayArea() {
  document.querySelectorAll('.score-pop').forEach(el => el.remove());
  document.body.classList.add('game-ended');
  $('card-category').textContent = 'Final decision';
  $('card-question').textContent = '';
  $('choices').innerHTML = '';
  $('investor-reaction').className = 'mascot-bubble liked';
  $('investor-reaction').textContent = Game.hype >= 70 ? 'The room is leaning in.' : 'The room needs more proof.';
}

function pop(text, color) {
  const el = document.createElement('div');
  el.className = 'score-pop';
  el.textContent = text;
  el.style.color = color;
  el.style.left = '50%';
  el.style.top = '30%';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

init();
