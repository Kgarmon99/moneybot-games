/**
 * The Pivot — MoneyBot Gaming Library
 * YC Lesson: Talk to users
 * Customer validation simulation: interview, gather signals, decide
 */

const GameState = {
  week: 1,
  maxWeeks: 10,
  idea: null,
  users: 0,
  retention: 0,
  nps: 0,
  signal: 0,
  interviews: [],
  gameOver: false,
  won: false
};

const IDEAS = [
  {
    name: "A social network for pet owners",
    category: "Social",
    difficulty: "hard",
    customers: [
      { name: "Sarah", role: "Product Manager", avatar: "S", quote: "I don't really see the point. I already use Instagram for my dog.", signal: -15 },
      { name: "Mike", role: "Veterinarian", avatar: "M", quote: "Pet owners need better health tracking, not another social app.", signal: -10 },
      { name: "Lisa", role: "Dog Walker", avatar: "L", quote: "Maybe if it helped me find clients? But social? No.", signal: -5 },
      { name: "Tom", role: "Software Engineer", avatar: "T", quote: "I'd use it if it had a marketplace for pet services.", signal: 5 },
      { name: "Anna", role: "Marketing Director", avatar: "A", quote: "Pet influencers might like it, but that's a tiny market.", signal: -10 }
    ]
  },
  {
    name: "AI-powered code review tool",
    category: "Developer Tools",
    difficulty: "medium",
    customers: [
      { name: "David", role: "CTO", avatar: "D", quote: "We spend 20 hours/week on code review. This could save us.", signal: 20 },
      { name: "Emily", role: "Senior Dev", avatar: "E", quote: "I worry about false positives. Bad suggestions hurt more than help.", signal: -5 },
      { name: "James", role: "Engineering Manager", avatar: "J", quote: "If it integrates with our workflow, I'd pay for this.", signal: 15 },
      { name: "Rachel", role: "Junior Dev", avatar: "R", quote: "I'd love feedback on my code style. This could teach me.", signal: 10 },
      { name: "Chris", role: "Freelancer", avatar: "C", quote: "Too expensive for solo devs. Enterprise only?", signal: -5 }
    ]
  },
  {
    name: "Subscription box for indie hackers",
    category: "E-commerce",
    difficulty: "easy",
    customers: [
      { name: "Alex", role: "Indie Hacker", avatar: "A", quote: "I love trying new tools. But $50/month is steep.", signal: 5 },
      { name: "Maya", role: "Solo Founder", avatar: "M", quote: "Books and tools? Yes. T-shirts and stickers? No thanks.", signal: -5 },
      { name: "Ryan", role: "Bootstrapped Founder", avatar: "R", quote: "If it saves me time finding good tools, I'm in.", signal: 15 },
      { name: "Sophie", role: "Designer", avatar: "S", quote: "I already have too many subscriptions. Convince me.", signal: 0 },
      { name: "Jordan", role: "Developer", avatar: "J", quote: "Community access would be the real value.", signal: 10 }
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
  GameState.week = 1;
  GameState.users = Math.floor(Math.random() * 50) + 10;
  GameState.retention = Math.floor(Math.random() * 30) + 5;
  GameState.nps = Math.floor(Math.random() * 40) - 20;
  GameState.signal = 0;
  GameState.interviews = [];
  GameState.gameOver = false;
  GameState.won = false;
  GameState.idea = IDEAS[Math.floor(Math.random() * IDEAS.length)];

  els.startScreen.classList.add('hidden');
  els.winScreen.classList.add('hidden');
  els.lossScreen.classList.add('hidden');

  updateHUD();
  loadCustomer();
}

function updateHUD() {
  els.score.textContent = GameState.signal;
  els.round.textContent = GameState.week;
}

function loadCustomer() {
  if (GameState.week > GameState.maxWeeks) {
    showDecision();
    return;
  }

  const customer = GameState.idea.customers[GameState.week - 1] || GameState.idea.customers[GameState.idea.customers.length - 1];

  els.cardCategory.textContent = `${customer.name} — ${customer.role}`;
  els.cardQuestion.textContent = `"${customer.quote}"`;

  renderChoices(customer);
}

function renderChoices(customer) {
  els.choices.innerHTML = '';

  const choices = [
    { text: "Dig deeper", desc: "Ask follow-up questions", action: () => { GameState.signal += customer.signal; GameState.users += Math.floor(Math.random() * 10); GameState.retention += Math.floor(Math.random() * 5); GameState.nps += Math.floor(Math.random() * 10) - 3; }},
    { text: "Pitch the solution", desc: "Explain how you solve their problem", action: () => { GameState.signal += customer.signal * 0.5; GameState.users += Math.floor(Math.random() * 5); }},
    { text: "Ask for intro", desc: "Get referrals to other customers", action: () => { GameState.users += Math.floor(Math.random() * 15); GameState.signal += customer.signal * 0.3; }},
    { text: "Move on", desc: "This customer isn't your target", action: () => {} }
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
  updateHUD();
  loadCustomer();
}

function showDecision() {
  els.cardCategory.textContent = "Final Decision";
  els.cardQuestion.textContent = `You've talked to 10 customers. Signal: ${GameState.signal}. Retention: ${GameState.retention}%. NPS: ${GameState.nps}. What's the call?`;

  els.choices.innerHTML = '';
  [
    { text: "Kill it", desc: "This idea has no legs", action: () => makeDecision('kill') },
    { text: "Pivot", desc: "Change direction based on what you learned", action: () => makeDecision('pivot') },
    { text: "Persevere", desc: "Double down, you're onto something", action: () => makeDecision('persevere') }
  ].forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-card';
    btn.innerHTML = `<span class="choice-text">${choice.text}</span><span class="choice-preview">${choice.desc}</span>`;
    btn.addEventListener('click', choice.action);
    els.choices.appendChild(btn);
  });
}

function makeDecision(type) {
  const isGoodIdea = GameState.signal > 20 && GameState.retention > 20 && GameState.nps > 0;

  if (type === 'kill') {
    gameOver(!isGoodIdea, isGoodIdea ? "You killed a promising idea. The data said persevere." : "Good call. The signals weren't there.");
  } else if (type === 'pivot') {
    gameOver(true, "Pivoting based on mixed signals — classic YC move.");
  } else if (type === 'persevere') {
    gameOver(isGoodIdea, isGoodIdea ? "You found product-market fit! The data supports it." : "You persevered on a dead end. The signals said pivot or kill.");
  }
}

function gameOver(won, reason) {
  GameState.gameOver = true;
  GameState.won = won;

  if (won) {
    els.winReason.textContent = reason;
    els.winScreen.classList.remove('hidden');
  } else {
    els.lossReason.textContent = reason;
    els.lossTip.textContent = "Most successful startups pivoted at least once.";
    els.lossScreen.classList.remove('hidden');
  }
}

els.startBtn.addEventListener('click', startGame);
els.replayBtn.addEventListener('click', startGame);
els.tryAgainBtn.addEventListener('click', startGame);

updateHUD();
