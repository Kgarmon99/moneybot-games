const INITIAL_CAPITAL = 10000000;
const TOTAL_DEALS = 20;

let capital = INITIAL_CAPITAL;
let dealsLeft = TOTAL_DEALS;
let currentDeal = null;
let currentCardEl = null;

const formatMoney = (amount) => {
  if (amount >= 1000000) return "$" + (amount / 1000000).toFixed(1) + "M";
  if (amount >= 1000) return "$" + (amount / 1000).toFixed(0) + "K";
  if (amount <= -1000000) return "-$" + (Math.abs(amount) / 1000000).toFixed(1) + "M";
  if (amount <= -1000) return "-$" + (Math.abs(amount) / 1000).toFixed(0) + "K";
  return "$" + amount;
};

// Startups Database
const STARTUPS = [
  {
    icon: '🐕', name: 'Bark.AI', tagline: 'AI for Dog Translation',
    ask: 1000000, equity: '20%',
    term: "Pre-revenue, but TikTok went viral.",
    good: false,
    fundResult: { title: "Fad Died", desc: "TikTok banned dog filters. Company went to zero.", impact: -1000000 },
    passResult: { title: "Dodged a Bullet", desc: "It was just a snapchat filter clone.", impact: 0 }
  },
  {
    icon: '📈', name: 'FinFlow', tagline: 'B2B SaaS for Accountants',
    ask: 500000, equity: '10%',
    term: "$50k MRR, growing 20% MoM.",
    good: true,
    fundResult: { title: "Acquired!", desc: "Intuit bought them out for cash.", impact: 2500000 },
    passResult: { title: "Missed Out", desc: "They sold to Intuit. You missed a 5x return.", impact: 0 }
  },
  {
    icon: '⛓️', name: 'ChainLinker', tagline: 'Blockchain for Dentists',
    ask: 2000000, equity: '5%',
    term: "Founder is anonymous 'Satoshi_Tooth'.",
    good: false,
    fundResult: { title: "Rug Pull", desc: "Founder vanished with the treasury.", impact: -2000000 },
    passResult: { title: "Smart Pass", desc: "Interpol just arrested the founder.", impact: 0 }
  },
  {
    icon: '🤖', name: 'PizzaBot', tagline: 'Robotic Pizza Trucks',
    ask: 500000, equity: '5%',
    term: "Working prototype, 50% profit margins.",
    good: true,
    fundResult: { title: "IPO!", desc: "Automated pizza took over the city.", impact: 4000000 },
    passResult: { title: "Missed IPO", desc: "PizzaBot just rang the NYSE bell.", impact: 0 }
  },
  {
    icon: '💧', name: 'CyberJuice', tagline: 'Smart Water Bottles',
    ask: 3000000, equity: '10%',
    term: "Founder previously bankrupted 3 startups.",
    good: false,
    fundResult: { title: "Bankrupt", desc: "Turns out nobody needs Bluetooth water.", impact: -3000000 },
    passResult: { title: "Bullet Dodged", desc: "They burned $50M and shut down.", impact: 0 }
  },
  {
    icon: '🚀', name: 'RocketReturn', tagline: 'Automated Tax Filing',
    ask: 1000000, equity: '15%',
    term: "Backed by Y Combinator. Huge waitlist.",
    good: true,
    fundResult: { title: "Unicorn!", desc: "They hit $100M ARR.", impact: 10000000 },
    passResult: { title: "Huge Mistake", desc: "They are now a decacorn.", impact: 0 }
  },
  {
    icon: '🕶️', name: 'MetaMansion', tagline: 'Virtual Real Estate',
    ask: 5000000, equity: '5%',
    term: "No active users, just a cool CGI trailer.",
    good: false,
    fundResult: { title: "Vaporware", desc: "The Metaverse hype died.", impact: -5000000 },
    passResult: { title: "Saved Capital", desc: "Virtual real estate crashed 99%.", impact: 0 }
  },
  {
    icon: '🏥', name: 'MediSync', tagline: 'API for Health Records',
    ask: 2000000, equity: '10%',
    term: "Signed 3 enterprise hospital clients.",
    good: true,
    fundResult: { title: "Acquired", desc: "Epic Systems bought them.", impact: 8000000 },
    passResult: { title: "Missed Exit", desc: "A rival VC got the 4x return.", impact: 0 }
  },
  {
    icon: '💘', name: 'QuantumSwipe', tagline: 'Next-gen Dating App',
    ask: 1000000, equity: '20%',
    term: "Previous round has 10x Liquidation Preference.",
    good: false,
    fundResult: { title: "Wiped Out", desc: "They sold, but early investors took 100% of the cash.", impact: -1000000 },
    passResult: { title: "Read the Fine Print", desc: "Terms were toxic. Good pass.", impact: 0 }
  },
  {
    icon: '☁️', name: 'CloudScale', tagline: 'Serverless Infra',
    ask: 2000000, equity: '10%',
    term: "Team of ex-Google Cloud engineers.",
    good: true,
    fundResult: { title: "Decacorn!", desc: "They replaced AWS for thousands of startups.", impact: 20000000 },
    passResult: { title: "Oops", desc: "They are the next AWS. You missed out.", impact: 0 }
  },
  {
    icon: '🩸', name: 'TheraBlood', tagline: 'Blood testing in one drop',
    ask: 5000000, equity: '2%',
    term: "Won't let independent labs verify tech.",
    good: false,
    fundResult: { title: "Fraud!", desc: "The machine was just a modified Siemens analyzer.", impact: -5000000 },
    passResult: { title: "Fraud Avoided", desc: "Founder is going to federal prison.", impact: 0 }
  },
  {
    icon: '🏡', name: 'RentBoy', tagline: 'Airbnb for Lawnmowers',
    ask: 500000, equity: '20%',
    term: "Bootstrapped and cash-flow positive.",
    good: true,
    fundResult: { title: "Steady Dividend", desc: "Solid boring business. Pays great dividends.", impact: 1500000 },
    passResult: { title: "Passed on Profits", desc: "Boring but profitable. You missed out.", impact: 0 }
  }
];

// Shuffle array
const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

let deck = [];

// DOM Elements
const capDisplay = document.getElementById('capital-display');
const dealsDisplay = document.getElementById('deals-display');
const cardStack = document.getElementById('card-stack');
const controls = document.getElementById('controls');
const btnPass = document.getElementById('btn-pass');
const btnFund = document.getElementById('btn-fund');

const startScreen = document.getElementById('start-screen');
const btnStart = document.getElementById('start-btn');

const feedbackOverlay = document.getElementById('feedback-overlay');
const fTitle = document.getElementById('feedback-title');
const fDesc = document.getElementById('feedback-desc');
const fImpact = document.getElementById('feedback-impact');
const btnNext = document.getElementById('btn-next');

const endScreen = document.getElementById('end-screen');
const finalScore = document.getElementById('final-score');
const replayBtn = document.getElementById('replay-btn');

// Init
btnStart.addEventListener('click', startGame);
btnNext.addEventListener('click', loadNextPitch);
replayBtn.addEventListener('click', startGame);

btnPass.addEventListener('click', () => handleDecision('pass'));
btnFund.addEventListener('click', () => handleDecision('fund'));

function startGame() {
  capital = INITIAL_CAPITAL;
  dealsLeft = TOTAL_DEALS;
  deck = shuffle([...STARTUPS, ...STARTUPS]).slice(0, TOTAL_DEALS); // pick random 20
  
  updateHUD();
  startScreen.classList.add('hidden');
  endScreen.classList.add('hidden');
  controls.style.display = 'flex';
  
  loadNextPitch();
}

function updateHUD() {
  capDisplay.textContent = formatMoney(capital);
  if (capital < 5000000) capDisplay.style.color = 'var(--neon-red)';
  else capDisplay.style.color = 'var(--neon-green)';
  dealsDisplay.textContent = dealsLeft;
}

function loadNextPitch() {
  feedbackOverlay.classList.add('hidden');
  
  if (dealsLeft <= 0 || capital <= 0) {
    endGame();
    return;
  }
  
  currentDeal = deck.pop();
  
  // Build Card
  cardStack.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'pitch-card';
  card.innerHTML = "<div class='card-header'>" +
      "<div class='company-icon'>" + currentDeal.icon + "</div>" +
      "<div>" +
        "<div class='company-name'>" + currentDeal.name + "</div>" +
        "<div class='company-tagline'>" + currentDeal.tagline + "</div>" +
      "</div>" +
    "</div>" +
    "<div class='card-details'>" +
      "<div class='detail-item'>" +
        "<span class='detail-label'>The Ask</span>" +
        "<span class='detail-value' style='color: var(--neon-green)'>" + formatMoney(currentDeal.ask) + "</span>" +
      "</div>" +
      "<div class='detail-item'>" +
        "<span class='detail-label'>Equity</span>" +
        "<span class='detail-value'>" + currentDeal.equity + "</span>" +
      "</div>" +
    "</div>" +
    "<div class='card-term'>" +
      "<div class='term-label'>Red/Green Flag</div>" +
      "<div>" + currentDeal.term + "</div>" +
    "</div>";
  
  cardStack.appendChild(card);
  currentCardEl = card;
}

function handleDecision(action) {
  if (!currentDeal) return;
  
  let result;
  
  if (action === 'fund') {
    if (capital < currentDeal.ask) {
      alert("Not enough capital to fund this deal!");
      return;
    }
    capital -= currentDeal.ask; // investment
    currentCardEl.classList.add('swiping-right');
    currentCardEl.style.transform = 'translateX(150%) rotate(15deg)';
    result = currentDeal.fundResult;
  } else {
    currentCardEl.classList.add('swiping-left');
    currentCardEl.style.transform = 'translateX(-150%) rotate(-15deg)';
    result = currentDeal.passResult;
  }
  
  currentCardEl.style.opacity = '0';
  
  setTimeout(() => {
    capital += result.impact;
    dealsLeft--;
    updateHUD();
    showFeedback(action, result);
  }, 300);
}

function showFeedback(action, result) {
  fTitle.textContent = result.title;
  fDesc.textContent = result.desc;
  
  if (result.impact > 0) {
    fImpact.textContent = '+' + formatMoney(result.impact);
    fImpact.style.color = 'var(--neon-green)';
  } else if (result.impact < 0) {
    fImpact.textContent = formatMoney(result.impact);
    fImpact.style.color = 'var(--neon-red)';
  } else {
    fImpact.textContent = 'No Change';
    fImpact.style.color = '#888';
  }
  
  feedbackOverlay.classList.remove('hidden');
}

function endGame() {
  controls.style.display = 'none';
  cardStack.innerHTML = '';
  
  endScreen.classList.remove('hidden');
  finalScore.textContent = formatMoney(capital);
  
  const endMascot = document.getElementById('end-mascot');
  const endDesc = document.getElementById('end-desc');
  const endTitle = document.getElementById('end-title');
  
  if (capital <= 0) {
    endMascot.textContent = '💀';
    endTitle.textContent = 'Fund Bankrupt';
    finalScore.style.color = 'var(--neon-red)';
    endDesc.textContent = "You blew the LP's money on vaporware and bad terms.";
  } else if (capital > INITIAL_CAPITAL * 2) {
    endMascot.textContent = '🚀';
    endTitle.textContent = 'Legendary VC';
    finalScore.style.color = 'var(--neon-green)';
    endDesc.textContent = "You found the unicorns and dodged the scams. Incredible returns!";
  } else if (capital > INITIAL_CAPITAL) {
    endMascot.textContent = '📈';
    endTitle.textContent = 'Solid Returns';
    finalScore.style.color = 'var(--neon-green)';
    endDesc.textContent = "A respectable fund lifecycle. LPs are happy.";
  } else {
    endMascot.textContent = '📉';
    endTitle.textContent = 'Underperformed';
    finalScore.style.color = '#ffcc00';
    endDesc.textContent = "You lost money overall. LPs won't back Fund II.";
  }
}