const gameData = [
  {
    category: "MARKET MOVERS",
    clues: [
      { value: 200, q: "This index tracks the 500 largest U.S. publicly traded companies.", options: ["What is the Dow Jones?", "What is the S&P 500?", "What is the Nasdaq?", "What is the Russell 2000?"], answer: 1 },
      { value: 400, q: "A prolonged period of falling stock prices, typically by 20% or more, is known by this animal's name.", options: ["What is a Bull Market?", "What is a Bear Market?", "What is a Hawk Market?", "What is a Wolf Market?"], answer: 1 },
      { value: 600, q: "This term describes spreading your investments around so that your exposure to any one type of asset is limited.", options: ["What is Diversification?", "What is Compounding?", "What is Arbitrage?", "What is Shorting?"], answer: 0 },
      { value: 800, q: "A company’s first time selling shares to the public is called an IPO, which stands for this.", options: ["What is Initial Public Offering?", "What is Internal Profit Objective?", "What is Investment Portfolio Option?", "What is Index Price Output?"], answer: 0 },
      { value: 1000, q: "This strategy involves investing a fixed dollar amount on a regular basis, regardless of the share price.", options: ["What is Day Trading?", "What is Value Investing?", "What is Dollar-Cost Averaging?", "What is Market Timing?"], answer: 2 }
    ]
  },
  {
    category: "CRYPTO & WEB3",
    clues: [
      { value: 200, q: "Created by the pseudonymous Satoshi Nakamoto, this was the first decentralized cryptocurrency.", options: ["What is Ethereum?", "What is Bitcoin?", "What is Dogecoin?", "What is Solana?"], answer: 1 },
      { value: 400, q: "This technology is the underlying decentralized, distributed public ledger that powers most cryptocurrencies.", options: ["What is a Database?", "What is the Blockchain?", "What is Cloud Storage?", "What is the Metaverse?"], answer: 1 },
      { value: 600, q: "These unique digital identifiers are recorded in a blockchain, and are often used to certify ownership of digital art.", options: ["What are ETFs?", "What are NFTs?", "What are APIs?", "What are URLs?"], answer: 1 },
      { value: 800, q: "When a crypto holder stores their private keys offline on a physical device, it's referred to as this.", options: ["What is Cold Storage?", "What is Hot Wallet?", "What is Cloud Mining?", "What is Staking?"], answer: 0 },
      { value: 1000, q: "This event roughly every four years cuts the reward for mining Bitcoin transactions in half.", options: ["What is the Fork?", "What is the Merge?", "What is the Halving?", "What is the Burn?"], answer: 2 }
    ]
  },
  {
    category: "STARTUP WORLD",
    clues: [
      { value: 200, q: "A startup that reaches a valuation of $1 billion or more is called this mythical creature.", options: ["What is a Dragon?", "What is a Pegasus?", "What is a Unicorn?", "What is a Griffin?"], answer: 2 },
      { value: 400, q: "This is the rate at which a new company is spending its venture capital to finance overhead before generating positive cash flow.", options: ["What is the Churn Rate?", "What is the Burn Rate?", "What is the Run Rate?", "What is the Growth Rate?"], answer: 1 },
      { value: 600, q: "When a startup fundamentally changes its business model or product direction to meet market demand.", options: ["What is a Pivot?", "What is a Merger?", "What is an Acquisition?", "What is a Spin-off?"], answer: 0 },
      { value: 800, q: "This is the amount of time a company has before it runs out of cash, assuming current income and expenses stay constant.", options: ["What is Runway?", "What is Float?", "What is Lead Time?", "What is Grace Period?"], answer: 0 },
      { value: 1000, q: "The condition of making just enough money to pay the founders' basic living expenses.", options: ["What is Seed Stage?", "What is Ramen Profitability?", "What is Break-even?", "What is Bootstrapping?"], answer: 1 }
    ]
  },
  {
    category: "TAX TRAPS",
    clues: [
      { value: 200, q: "In the U.S., this deadline for filing individual income tax returns usually falls on April 15th.", options: ["What is Tax Day?", "What is Audit Day?", "What is Fiscal End?", "What is Q1 Close?"], answer: 0 },
      { value: 400, q: "Profits from the sale of an asset held for more than one year are taxed at this generally lower rate.", options: ["What is Income Tax?", "What is Long-term Capital Gains?", "What is Short-term Capital Gains?", "What is Dividend Tax?"], answer: 1 },
      { value: 600, q: "A tax penalty is applied if you withdraw from this type of retirement account before age 59½.", options: ["What is a 401(k)?", "What is a Brokerage?", "What is a Checking Account?", "What is an HSA?"], answer: 0 },
      { value: 800, q: "The rule preventing you from claiming a loss on a security if you buy a substantially identical one within 30 days.", options: ["What is the Wash-Sale Rule?", "What is the Margin Rule?", "What is the Day-Trade Rule?", "What is the FIFO Rule?"], answer: 0 },
      { value: 1000, q: "This form is used by independent contractors to report income, rather than a W-2.", options: ["What is a 1040?", "What is a 1099?", "What is a W-4?", "What is an I-9?"], answer: 1 }
    ]
  },
  {
    category: "PERSONAL FINANCE",
    clues: [
      { value: 200, q: "A pool of money set aside specifically for unplanned expenses, usually 3-6 months of living costs.", options: ["What is a Slush Fund?", "What is an Emergency Fund?", "What is a Trust Fund?", "What is a Sinking Fund?"], answer: 1 },
      { value: 400, q: "This is the three-digit number representing your creditworthiness, usually ranging from 300 to 850.", options: ["What is a FICO Score?", "What is a Routing Number?", "What is an SSN?", "What is a PIN?"], answer: 0 },
      { value: 600, q: "Earning interest on your interest, Albert Einstein supposedly called it the 8th wonder of the world.", options: ["What is Simple Interest?", "What is Compound Interest?", "What is Annual Percentage Yield?", "What is Inflation?"], answer: 1 },
      { value: 800, q: "The strategy of paying off debts from smallest balance to largest balance to build momentum.", options: ["What is the Debt Avalanche?", "What is the Debt Snowball?", "What is Debt Consolidation?", "What is Forbearance?"], answer: 1 },
      { value: 1000, q: "With this type of IRA, you pay taxes on the money upfront, but your withdrawals in retirement are tax-free.", options: ["What is a Traditional IRA?", "What is a SEP IRA?", "What is a Roth IRA?", "What is a SIMPLE IRA?"], answer: 2 }
    ]
  }
];

// Game State
let score = 0;
let cluesAnswered = 0;
const totalClues = gameData.length * 5;

// DOM Elements
const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score-display');
const modal = document.getElementById('question-modal');
const modalCategory = document.getElementById('modal-category');
const modalValue = document.getElementById('modal-value');
const modalQuestion = document.getElementById('modal-question');
const modalOptions = document.getElementById('modal-options');
const overlay = document.getElementById('result-overlay');
const resultTitle = document.getElementById('result-title');
const resultDesc = document.getElementById('result-desc');
const resultBtn = document.getElementById('result-btn');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

function initGame() {
  score = 0;
  cluesAnswered = 0;
  updateScore();
  renderBoard();
  gameOverModal.classList.add('hidden');
}

function renderBoard() {
  boardEl.innerHTML = '';
  gameData.forEach((colData, colIndex) => {
    const colEl = document.createElement('div');
    colEl.className = 'column';

    const headerEl = document.createElement('div');
    headerEl.className = 'category-header';
    headerEl.innerText = colData.category;
    colEl.appendChild(headerEl);

    colData.clues.forEach((clue, clueIndex) => {
      const cellEl = document.createElement('div');
      cellEl.className = 'clue-cell';
      cellEl.innerText = `$${clue.value}`;
      cellEl.dataset.col = colIndex;
      cellEl.dataset.row = clueIndex;

      cellEl.addEventListener('click', () => handleClueClick(cellEl, colIndex, clueIndex));
      colEl.appendChild(cellEl);
    });

    boardEl.appendChild(colEl);
  });
}

function handleClueClick(cellEl, colIndex, clueIndex) {
  if (cellEl.classList.contains('disabled')) return;

  const clue = gameData[colIndex].clues[clueIndex];
  const category = gameData[colIndex].category;

  // Setup Modal
  modalCategory.innerText = category;
  modalValue.innerText = `$${clue.value}`;
  modalQuestion.innerText = clue.q;
  
  modalOptions.innerHTML = '';
  clue.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = opt;
    btn.addEventListener('click', () => handleAnswer(cellEl, clue, idx));
    modalOptions.appendChild(btn);
  });

  overlay.classList.add('hidden');
  modal.classList.remove('hidden');
}

function handleAnswer(cellEl, clue, selectedIdx) {
  const isCorrect = selectedIdx === clue.answer;
  
  if (isCorrect) {
    score += clue.value;
    resultTitle.innerText = "CORRECT!";
    resultTitle.className = "correct";
    resultDesc.innerText = `You earned $${clue.value}`;
  } else {
    score -= clue.value;
    resultTitle.innerText = "WRONG!";
    resultTitle.className = "wrong";
    resultDesc.innerText = `You lost $${clue.value}\n\nCorrect Answer:\n${clue.options[clue.answer]}`;
  }

  updateScore();
  
  // Disable cell
  cellEl.classList.add('disabled');
  cluesAnswered++;

  // Show result overlay inside modal
  overlay.classList.remove('hidden');
}

resultBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  
  if (cluesAnswered >= totalClues) {
    setTimeout(showGameOver, 500);
  }
});

function updateScore() {
  scoreEl.innerText = `$${score}`;
  if (score > 0) {
    scoreEl.className = 'score-value positive';
  } else if (score < 0) {
    scoreEl.className = 'score-value negative';
  } else {
    scoreEl.className = 'score-value';
  }
}

function showGameOver() {
  finalScoreEl.innerText = `$${score}`;
  if (score > 0) finalScoreEl.style.color = 'var(--mb-green)';
  else if (score < 0) finalScoreEl.style.color = 'var(--mb-red)';
  else finalScoreEl.style.color = 'white';
  
  gameOverModal.classList.remove('hidden');
}

restartBtn.addEventListener('click', initGame);

// Start
initGame();