/**
 * Demo Day Dash — Upgraded
 * YC Lesson: Perfect your pitch, handle tough questions
 * Rhythm/pitch game - deliver slides, dodge hard questions
 */

const Game = {
  slide: 0,
  totalSlides: 10,
  hype: 50,
  maxHype: 100,
  investors: 3,
  questionsDodged: 0,
  perfectSlides: 0,
  timeLeft: 180,
  gameOver: false,
  won: false,
  currentPhase: 'pitch', // pitch, question, result
  activeQuestions: [],
  slides: []
};

const SLIDES = [
  { title: "The Problem", emoji: "😤", good: "80% of meetings are wasted", bad: "Meetings are annoying" },
  { title: "Our Solution", emoji: "💡", good: "AI that auto-summarizes calls", bad: "We use AI technology" },
  { title: "Market Size", emoji: "📈", good: "$50B market, 10% growth", bad: "Market is really big" },
  { title: "Traction", emoji: "🚀", good: "1,000 users, 40% MoM growth", bad: "We launched last week" },
  { title: "Business Model", emoji: "💰", good: "$49/mo, 5% churn, 18mo LTV", bad: "We'll figure out monetization later" },
  { title: "Competition", emoji: "⚔️", good: "Incumbents are slow; we move 10x faster", bad: "We have no competitors" },
  { title: "Team", emoji: "👥", good: "Ex-Google PM + ex-Stripe engineer", bad: "We're passionate founders" },
  { title: "The Ask", emoji: "🎯", good: "$500K for 18mo runway to profitability", bad: "We need money to figure things out" },
  { title: "Vision", emoji: "🔮", good: "Every meeting in the world, summarized", bad: "We want to change the world" },
  { title: "Thank You", emoji: "🙏", good: "Questions? We're ready.", bad: "That's all we have." }
];

const QUESTIONS = [
  { text: "What's your moat?", emoji: "🛡️", damage: 15, answer: "Network effects + proprietary data" },
  { text: "Why you? Why now?", emoji: "⏰", damage: 12, answer: "10 years ML exp + GPT-4 just enabled this" },
  { text: "How do you acquire customers?", emoji: "📣", damage: 10, answer: "Product-led growth, $0 CAC so far" },
  { text: "What's your burn rate?", emoji: "🔥", damage: 8, answer: "$15K/mo, 18mo runway post-raise" },
  { text: "Will Google crush you?", emoji: "🦕", damage: 14, answer: "They move slow. We're focused + nimble." },
  { text: "Why not join an incubator?", emoji: "🏢", damage: 10, answer: "We need focus, not networking events." }
];

function $(id) { return document.getElementById(id); }

function init() {
  $('start-btn').onclick = startGame;
  $('replay-btn').onclick = startGame;
  $('try-again-btn').onclick = startGame;
  $('start-screen').classList.add('active');
}

function startGame() {
  Object.assign(Game, {
    slide: 0, totalSlides: 10, hype: 50, maxHype: 100,
    investors: 3, questionsDodged: 0, perfectSlides: 0,
    timeLeft: 180, gameOver: false, won: false,
    currentPhase: 'pitch', activeQuestions: [],
    slides: [...SLIDES].sort(() => Math.random() - 0.5)
  });
  
  $('start-screen').classList.remove('active');
  $('win-screen').classList.remove('active');
  $('loss-screen').classList.remove('active');
  
  updateHUD();
  renderGame();
  startTimer();
}

let timerInterval;
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (Game.gameOver) { clearInterval(timerInterval); return; }
    Game.timeLeft--;
    if (Game.timeLeft <= 0) {
      Game.gameOver = true;
      showLoss();
    }
    updateHUD();
  }, 1000);
}

function updateHUD() {
  $('score').textContent = Math.round(Game.hype) + '% hype';
  $('round').textContent = `Slide ${Game.slide + 1}/${Game.totalSlides}`;
  
  const hypeBar = $('hype-bar');
  if (hypeBar) {
    hypeBar.style.width = Game.hype + '%';
    hypeBar.className = 'progress-fill' + (Game.hype < 30 ? ' danger' : Game.hype < 60 ? ' warning' : '');
  }
  
  const timeMin = Math.floor(Game.timeLeft / 60);
  const timeSec = Game.timeLeft % 60;
  const timeDisplay = $('time-display');
  if (timeDisplay) timeDisplay.textContent = `${timeMin}:${timeSec.toString().padStart(2, '0')}`;
}

function renderGame() {
  const container = $('choices');
  container.innerHTML = '';
  
  if (Game.currentPhase === 'pitch') {
    renderPitch(container);
  } else if (Game.currentPhase === 'question') {
    renderQuestion(container);
  }
}

function renderPitch(container) {
  const slide = Game.slides[Game.slide];
  
  const slideCard = document.createElement('div');
  slideCard.className = 'card animate-fade-in';
  slideCard.style.textAlign = 'center';
  slideCard.style.padding = '30px';
  slideCard.innerHTML = `
    <div style="font-size:48px;margin-bottom:12px;">${slide.emoji}</div>
    <div style="font-size:24px;font-weight:700;color:var(--accent);margin-bottom:8px;">${slide.title}</div>
    <div style="font-size:16px;color:var(--text-dim);margin-bottom:24px;">Choose how to present this slide:</div>
  `;
  container.appendChild(slideCard);
  
  const choiceGrid = document.createElement('div');
  choiceGrid.className = 'choice-grid';
  
  // Good option
  const goodBtn = document.createElement('button');
  goodBtn.className = 'choice-btn';
  goodBtn.innerHTML = `
    <div style="font-weight:700;color:var(--success);">✅ Strong Pitch</div>
    <div style="font-size:13px;margin-top:4px;">${slide.good}</div>
  `;
  goodBtn.onclick = () => deliverSlide(true);
  choiceGrid.appendChild(goodBtn);
  
  // Bad option
  const badBtn = document.createElement('button');
  badBtn.className = 'choice-btn';
  badBtn.innerHTML = `
    <div style="font-weight:700;color:var(--danger);">❌ Weak Pitch</div>
    <div style="font-size:13px;margin-top:4px;">${slide.bad}</div>
  `;
  badBtn.onclick = () => deliverSlide(false);
  choiceGrid.appendChild(badBtn);
  
  container.appendChild(choiceGrid);
  
  // Progress
  const progressDiv = document.createElement('div');
  progressDiv.style.marginTop = '20px';
  progressDiv.innerHTML = `
    <div class="progress-bar">
      <div class="progress-fill" style="width:${(Game.slide / Game.totalSlides) * 100}%"></div>
    </div>
    <div style="text-align:center;font-size:12px;color:var(--text-dim);margin-top:4px;">Pitch Progress</div>
  `;
  container.appendChild(progressDiv);
}

function deliverSlide(isGood) {
  if (isGood) {
    Game.hype = Math.min(Game.hype + 10, Game.maxHype);
    Game.perfectSlides++;
    showFloatingText('+10 HYPE!', 'var(--success)');
  } else {
    Game.hype = Math.max(Game.hype - 8, 0);
    showFloatingText('-8 hype...', 'var(--danger)');
  }
  
  Game.slide++;
  
  // Chance of investor question
  if (Math.random() < 0.4 && Game.slide < Game.totalSlides) {
    Game.currentPhase = 'question';
    spawnQuestion();
  } else if (Game.slide >= Game.totalSlides) {
    endDemoDay();
  }
  
  updateHUD();
  renderGame();
}

function spawnQuestion() {
  const q = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
  Game.activeQuestions = [{ ...q, x: 50, y: 0, speed: 2 + Math.random() * 2 }];
}

function renderQuestion(container) {
  const q = Game.activeQuestions[0];
  
  const questionCard = document.createElement('div');
  questionCard.className = 'card animate-fade-in';
  questionCard.style.textAlign = 'center';
  questionCard.innerHTML = `
    <div style="font-size:40px;margin-bottom:12px;">🎤</div>
    <div style="font-size:20px;font-weight:700;color:var(--accent-2);margin-bottom:8px;">INVESTOR QUESTION</div>
    <div style="font-size:28px;margin:16px 0;">${q.emoji} "${q.text}"</div>
    <div style="font-size:14px;color:var(--text-dim);">Answer correctly to maintain hype!</div>
  `;
  container.appendChild(questionCard);
  
  const choiceGrid = document.createElement('div');
  choiceGrid.className = 'choice-grid';
  
  // Correct answer
  const correctBtn = document.createElement('button');
  correctBtn.className = 'choice-btn';
  correctBtn.innerHTML = `
    <div style="font-weight:700;color:var(--success);">✅ "${q.answer}"</div>
  `;
  correctBtn.onclick = () => answerQuestion(true);
  choiceGrid.appendChild(correctBtn);
  
  // Wrong answers
  const wrongAnswers = [
    "I'm not sure, we'll figure it out",
    "That's a great question...",
    "Our competitors don't have that either",
    "Can we take this offline?"
  ];
  
  wrongAnswers.slice(0, 1).forEach(wa => {
    const wrongBtn = document.createElement('button');
    wrongBtn.className = 'choice-btn';
    wrongBtn.innerHTML = `<div style="font-weight:700;color:var(--danger);">❌ "${wa}"</div>`;
    wrongBtn.onclick = () => answerQuestion(false);
    choiceGrid.appendChild(wrongBtn);
  });
  
  container.appendChild(choiceGrid);
}

function answerQuestion(isCorrect) {
  const q = Game.activeQuestions[0];
  
  if (isCorrect) {
    Game.hype = Math.min(Game.hype + 8, Game.maxHype);
    Game.questionsDodged++;
    showFloatingText('Great answer! +8 hype', 'var(--success)');
  } else {
    Game.hype = Math.max(Game.hype - q.damage, 0);
    showFloatingText(`Ouch! -${q.damage} hype`, 'var(--danger)');
  }
  
  Game.activeQuestions = [];
  Game.currentPhase = 'pitch';
  updateHUD();
  renderGame();
}

function endDemoDay() {
  Game.gameOver = true;
  clearInterval(timerInterval);
  
  if (Game.hype >= 70) {
    Game.won = true;
    showWin();
  } else {
    showLoss();
  }
}

function showFloatingText(text, color) {
  const el = document.createElement('div');
  el.className = 'score-pop';
  el.style.color = color;
  el.textContent = text;
  el.style.left = '50%';
  el.style.top = '30%';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function showWin() {
  $('win-screen').classList.add('active');
  $('win-reason').textContent = `Demo day complete! ${Math.round(Game.hype)}% investor hype. ${Game.perfectSlides}/${Game.totalSlides} perfect slides, ${Game.questionsDodged} tough questions handled.`;
}

function showLoss() {
  $('loss-screen').classList.add('active');
  $('loss-reason').textContent = `Demo day ended with only ${Math.round(Game.hype)}% hype. Investors weren't convinced.`;
  $('loss-tip').textContent = Game.perfectSlides < 5
    ? "Practice your pitch! Use specific numbers and concrete examples."
    : "You handled slides well but struggled with questions. Prepare answers for common investor concerns.";
}

init();
