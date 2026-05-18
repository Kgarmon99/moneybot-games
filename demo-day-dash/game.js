/**
 * Demo Day Dash — MoneyBot Gaming Library
 * YC Lesson: Sell the dream
 * Pitch simulation: 5 phases, 60 seconds, investor reactions
 */

// ==================== GAME STATE ====================
const GameState = {
  phase: 0,
  score: 0,
  timeLeft: 60,
  timerInterval: null,
  reactions: { liked: 0, neutral: 0, disliked: 0 },
  gameOver: false,
  won: false,
  currentQuestion: null,
  questionsAnswered: 0,
  totalQuestions: 5
};

// ==================== PHASES & QUESTIONS ====================
const PHASES = [
  {
    name: "The Hook",
    category: "Hook",
    questions: [
      {
        text: "You have 10 seconds to grab attention. How do you open?",
        choices: [
          { text: "Hi, I'm John and this is my startup...", score: 20, reaction: "disliked", feedback: "Generic. Partners hear 200 pitches a day." },
          { text: "Last year, 10,000 developers lost $50M to API downtime.", score: 100, reaction: "liked", feedback: "Specific, painful, immediate." },
          { text: "We're building the future of cloud infrastructure.", score: 40, reaction: "neutral", feedback: "Vague. What does that mean?" },
          { text: "Our team met at MIT and has 50 years combined experience.", score: 30, reaction: "neutral", feedback: "Credentials don't sell the problem." }
        ]
      }
    ]
  },
  {
    name: "Problem",
    category: "Problem",
    questions: [
      {
        text: "The partner asks: 'Is this really a problem?'",
        choices: [
          { text: "Everyone we talked to said it's annoying.", score: 40, reaction: "neutral", feedback: "'Annoying' isn't painful enough." },
          { text: "Our target users spend 6 hours/week on this, costing $2K/month.", score: 100, reaction: "liked", feedback: "Quantified pain. Perfect." },
          { text: "It's a huge market opportunity worth $50B.", score: 30, reaction: "disliked", feedback: "Market size isn't proof of pain." },
          { text: "We experienced this ourselves as founders.", score: 70, reaction: "liked", feedback: "Founder-market fit is good, but quantify it." }
        ]
      }
    ]
  },
  {
    name: "Solution",
    category: "Solution",
    questions: [
      {
        text: "How do you describe your solution?",
        choices: [
          { text: "We're an AI-powered platform that leverages blockchain...", score: 20, reaction: "disliked", feedback: "Buzzword bingo. Partners hate this." },
          { text: "We built a tool that reduces API debugging from 2 hours to 5 minutes.", score: 100, reaction: "liked", feedback: "Clear, specific, outcome-focused." },
          { text: "It's like Uber but for developer tools.", score: 30, reaction: "disliked", feedback: "'X for Y' is lazy. Explain what you do." },
          { text: "Our proprietary algorithm optimizes workflows.", score: 40, reaction: "neutral", feedback: "'Proprietary' and 'optimizes' are vague." }
        ]
      }
    ]
  },
  {
    name: "Traction",
    category: "Traction",
    questions: [
      {
        text: "Partner: 'What traction do you have?'",
        choices: [
          { text: "We have 500 users and growing fast.", score: 50, reaction: "neutral", feedback: "'Growing fast' is unverifiable." },
          { text: "$50K MRR, 15% MoM growth, 95% retention.", score: 100, reaction: "liked", feedback: "Numbers that matter. Impressive." },
          { text: "We're pre-launch but have 2000 waitlist signups.", score: 60, reaction: "neutral", feedback: "Waitlists are weak signal." },
          { text: "We won a hackathon and got TechCrunch coverage.", score: 30, reaction: "disliked", feedback: "Press and prizes aren't traction." }
        ]
      }
    ]
  },
  {
    name: "The Ask",
    category: "Ask",
    questions: [
      {
        text: "Final question: 'What are you raising?'",
        choices: [
          { text: "We're open to whatever makes sense.", score: 20, reaction: "disliked", feedback: "Vague. Shows lack of planning." },
          { text: "$2M at $10M cap to reach $100K MRR in 18 months.", score: 100, reaction: "liked", feedback: "Specific, milestone-driven, clear use of funds." },
          { text: "$500K to figure out product-market fit.", score: 50, reaction: "neutral", feedback: "Too small for YC scale." },
          { text: "$10M to build the team and expand globally.", score: 30, reaction: "disliked", feedback: "Too much, too vague. Red flag." }
        ]
      }
    ]
  }
];

// ==================== INVESTOR REACTIONS ====================
const INVESTOR_REACTIONS = {
  liked: [
    "Now that's interesting.",
    "Tell me more about that.",
    "This is the kind of clarity we look for.",
    "You've clearly done your homework.",
    "I can see the vision."
  ],
  neutral: [
    "I'm listening...",
    "Okay, go on.",
    "That's one approach.",
    "Hmm, not sure about that.",
    "Maybe. What else?"
  ],
  disliked: [
    "That doesn't sound right.",
    "You're not answering my question.",
    "That feels like a red flag.",
    "I've heard this before.",
    "You need stronger evidence."
  ]
};

// ==================== DOM REFERENCES ====================
const els = {
  score: document.getElementById('score'),
  time: document.getElementById('time'),
  timerFill: document.getElementById('timer-fill'),
  phaseLabel: document.getElementById('phase-label'),
  phaseProgress: document.getElementById('phase-progress'),
  cardCategory: document.getElementById('card-category'),
  cardQuestion: document.getElementById('card-question'),
  choices: document.getElementById('choices'),
  investorFace: document.getElementById('investor-face'),
  investorReaction: document.getElementById('investor-reaction'),
  startScreen: document.getElementById('start-screen'),
  winScreen: document.getElementById('win-screen'),
  lossScreen: document.getElementById('loss-screen'),
  howToScreen: document.getElementById('how-to-screen'),
  startBtn: document.getElementById('start-btn'),
  howToBtn: document.getElementById('how-to-btn'),
  howToBack: document.getElementById('how-to-back'),
  replayBtn: document.getElementById('replay-btn'),
  tryAgainBtn: document.getElementById('try-again-btn'),
  valuation: document.getElementById('valuation'),
  finalScore: document.getElementById('final-score'),
  finalTime: document.getElementById('final-time'),
  finalReactions: document.getElementById('final-reactions'),
  partnerQuote: document.getElementById('partner-quote'),
  lossReason: document.getElementById('loss-reason'),
  lossTip: document.getElementById('loss-tip')
};

// ==================== UTILITIES ====================
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatTime(seconds) {
  return `${seconds}s`;
}

// ==================== GAME FLOW ====================
function startGame() {
  GameState.phase = 0;
  GameState.score = 0;
  GameState.timeLeft = 60;
  GameState.reactions = { liked: 0, neutral: 0, disliked: 0 };
  GameState.gameOver = false;
  GameState.won = false;
  GameState.questionsAnswered = 0;
  
  els.startScreen.classList.add('hidden');
  els.winScreen.classList.add('hidden');
  els.lossScreen.classList.add('hidden');
  
  updateHUD();
  startTimer();
  loadQuestion();
}

function startTimer() {
  GameState.timerInterval = setInterval(() => {
    GameState.timeLeft--;
    updateHUD();
    
    if (GameState.timeLeft <= 0) {
      gameOver(false, "Time's up! You ran out of time.");
    }
  }, 1000);
}

function updateHUD() {
  els.score.textContent = GameState.score;
  els.time.textContent = GameState.timeLeft;
  
  const timerPercent = (GameState.timeLeft / 60) * 100;
  els.timerFill.style.width = `${timerPercent}%`;
  
  if (GameState.timeLeft <= 10) {
    els.timerFill.style.background = 'linear-gradient(90deg, #FF4444, #FF6666)';
  }
  
  const phasePercent = ((GameState.phase + 1) / PHASES.length) * 100;
  els.phaseProgress.style.width = `${phasePercent}%`;
}

function loadQuestion() {
  if (GameState.phase >= PHASES.length) {
    gameOver(true);
    return;
  }
  
  const phase = PHASES[GameState.phase];
  const question = phase.questions[0];
  GameState.currentQuestion = question;
  
  els.phaseLabel.textContent = `Phase ${GameState.phase + 1}: ${phase.name}`;
  els.cardCategory.textContent = phase.category;
  els.cardQuestion.textContent = question.text;
  
  renderChoices(question.choices);
  setInvestorReaction('neutral');
}

function renderChoices(choices) {
  els.choices.innerHTML = '';
  choices.forEach((choice, index) => {
    const btn = document.createElement('button');
    btn.className = 'choice-card';
    btn.innerHTML = `
      <span class="choice-text">${choice.text}</span>
    `;
    btn.addEventListener('click', () => makeChoice(choice));
    els.choices.appendChild(btn);
  });
}

function makeChoice(choice) {
  const speedBonus = Math.floor(GameState.timeLeft / 2);
  const totalPoints = choice.score + speedBonus;
  GameState.score += totalPoints;
  
  GameState.reactions[choice.reaction]++;
  
  setInvestorReaction(choice.reaction, choice.feedback);
  
  updateHUD();
  
  setTimeout(() => {
    GameState.phase++;
    GameState.questionsAnswered++;
    loadQuestion();
  }, 1500);
}

function setInvestorReaction(type, feedback) {
  const faces = { liked: '😊', neutral: '😐', disliked: '😤' };
  
  els.investorFace.textContent = faces[type];
  els.investorReaction.textContent = feedback || randomChoice(INVESTOR_REACTIONS[type]);
  els.investorReaction.className = `mascot-bubble ${type}`;
}

function gameOver(won, reason) {
  GameState.gameOver = true;
  GameState.won = won;
  clearInterval(GameState.timerInterval);
  
  if (won) {
    const baseValuation = 8;
    const bonus = Math.floor(GameState.score / 500);
    const valuation = baseValuation + bonus;
    
    els.valuation.textContent = `$${valuation}M`;
    els.finalScore.textContent = GameState.score;
    els.finalTime.textContent = formatTime(GameState.timeLeft);
    els.finalReactions.textContent = GameState.reactions.liked;
    
    const quotes = [
      "This is the kind of clarity we look for.",
      "I'd like to make an offer.",
      "You clearly understand your customer.",
      "This reminds me of Airbnb's early pitch."
    ];
    els.partnerQuote.textContent = randomChoice(quotes);
    
    els.winScreen.classList.remove('hidden');
  } else {
    els.lossReason.textContent = reason || "The partners weren't convinced.";
    
    let tip = "Great pitches start with the problem, not the solution.";
    if (GameState.reactions.disliked > 2) {
      tip = "You had too many weak answers. Practice being specific and concise.";
    } else if (GameState.reactions.liked === 0) {
      tip = "No strong reactions. You need to be more bold and specific.";
    } else if (GameState.timeLeft <= 5) {
      tip = "You ran out of time. Practice delivering answers in 30 seconds or less.";
    }
    els.lossTip.textContent = tip;
    
    els.lossScreen.classList.remove('hidden');
  }
}

// ==================== EVENT LISTENERS ====================
els.startBtn.addEventListener('click', startGame);
els.replayBtn.addEventListener('click', startGame);
els.tryAgainBtn.addEventListener('click', startGame);
els.howToBtn.addEventListener('click', () => els.howToScreen.classList.remove('hidden'));
els.howToBack.addEventListener('click', () => els.howToScreen.classList.add('hidden'));

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!els.howToScreen.classList.contains('hidden')) {
      els.howToScreen.classList.add('hidden');
    }
  }
  
  if (!els.startScreen.classList.contains('hidden') && e.key === 'Enter') {
    startGame();
  }
});

// ==================== INIT ====================
updateHUD();
