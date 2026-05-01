const FINANCIAL_TERMS = [
  { word: "COMPOUND INTEREST", hint: "Interest calculated on both principal and accumulated interest", category: "Investing" },
  { word: "DIVERSIFICATION", hint: "Spreading investments across different assets to reduce risk", category: "Investing" },
  { word: "LIQUIDITY", hint: "How quickly an asset can be converted to cash", category: "Basics" },
  { word: "PORTFOLIO", hint: "A collection of financial investments", category: "Investing" },
  { word: "DIVIDEND", hint: "A payment made by a corporation to its shareholders", category: "Stocks" },
  { word: "BULL MARKET", hint: "A market condition where prices are rising", category: "Markets" },
  { word: "BEAR MARKET", hint: "A market condition where prices are falling", category: "Markets" },
  { word: "INFLATION", hint: "The rate at which prices increase over time", category: "Economics" },
  { word: "NET WORTH", hint: "Total assets minus total liabilities", category: "Basics" },
  { word: "EMERGENCY FUND", hint: "Savings for unexpected expenses or financial emergencies", category: "Savings" },
  { word: "CREDIT SCORE", hint: "A number representing your creditworthiness", category: "Credit" },
  { word: "MUTUAL FUND", hint: "An investment vehicle pooling money from multiple investors", category: "Investing" },
  { word: "EXCHANGE TRADED FUND", hint: "An ETF tracks an index but trades like a stock", category: "Investing" },
  { word: "ASSET ALLOCATION", hint: "Dividing investments among different categories", category: "Investing" },
  { word: "RISK TOLERANCE", hint: "The degree of variability in returns you can withstand", category: "Psychology" },
  { word: "TIME VALUE OF MONEY", hint: "Money available now is worth more than the same amount later", category: "Basics" },
  { word: "RETURN ON INVESTMENT", hint: "A measure of the profitability of an investment", category: "Metrics" },
  { word: "CAPITAL GAINS", hint: "Profit from the sale of an asset", category: "Taxes" },
  { word: "TAX LOSS HARVESTING", hint: "Selling securities at a loss to offset capital gains", category: "Taxes" },
  { word: "DOLLAR COST AVERAGING", hint: "Investing fixed amounts at regular intervals", category: "Strategy" },
  { word: "REBALANCING", hint: "Adjusting portfolio weights back to target allocations", category: "Strategy" },
  { word: "FIDUCIARY", hint: "Someone legally obligated to act in your best interest", category: "Legal" },
  { word: "EXPENSE RATIO", hint: "The annual fee expressed as a percentage of assets", category: "Fees" },
  { word: "BANKRUPTCY", hint: "Legal process for dealing with debt you cannot repay", category: "Legal" },
  { word: "AMORTIZATION", hint: "The process of paying off debt in regular installments", category: "Loans" },
  { word: "DEPRECIATION", hint: "The decrease in an asset's value over time", category: "Accounting" },
  { word: "LIQUID ASSETS", hint: "Assets that can be quickly converted to cash", category: "Basics" },
  { word: "FIXED INCOME", hint: "Investments paying regular interest or dividends", category: "Investing" },
  { word: "EQUITY", hint: "Ownership interest in a company (stocks)", category: "Stocks" },
  { word: "BOND", hint: "A fixed income instrument representing a loan", category: "Fixed Income" },
  { word: "YIELD", hint: "The income return on an investment", category: "Metrics" },
  { word: "PRINCIPAL", hint: "The original amount of money invested or borrowed", category: "Basics" },
  { word: "APY", hint: "Annual Percentage Yield - includes compound interest", category: "Banking" },
  { word: "APR", hint: "Annual Percentage Rate - the yearly cost of borrowing", category: "Credit" },
  { word: "STOCK OPTION", hint: "A contract giving the right to buy or sell stock", category: "Derivatives" },
  { word: "VESTING", hint: "The process of earning ownership of employer contributions", category: "Retirement" },
  { word: "MATCHING CONTRIBUTION", hint: "Employer deposit matching your retirement contribution", category: "Retirement" },
  { word: "ROTH IRA", hint: "A retirement account with tax-free growth", category: "Retirement" },
  { word: "401K", hint: "An employer-sponsored retirement savings plan", category: "Retirement" },
  { word: "HELOC", hint: "Home Equity Line of Credit", category: "Real Estate" },
  { word: "MORTGAGE", hint: "A loan used to purchase real estate", category: "Real Estate" },
  { word: "DOWN PAYMENT", hint: "An initial payment made when buying on credit", category: "Real Estate" },
  { word: "PRIVATE EQUITY", hint: "Investment funds not listed on public exchanges", category: "Investing" },
  { word: "VENTURE CAPITAL", hint: "Financing provided to startups and small businesses", category: "Investing" },
  { word: "IPO", hint: "Initial Public Offering - when a company first sells stock", category: "Markets" },
  { word: "SHORT SELLING", hint: "Betting that a stock's price will decrease", category: "Trading" },
  { word: "MARGIN CALL", hint: "A demand for additional funds when investments fall", category: "Trading" },
  { word: "HEDGE FUND", hint: "An investment partnership using diverse strategies", category: "Investing" },
  { word: "INDEX FUND", hint: "A fund tracking a market index like the S&P 500", category: "Investing" },
  { word: "TARGET DATE FUND", hint: "A fund adjusting risk as you near retirement", category: "Retirement" },
  { word: "FINANCIAL INDEPENDENCE", hint: "Having enough wealth to live without working", category: "Goals" },
  { word: "PASSIVE INCOME", hint: "Earnings requiring little to no effort to maintain", category: "Income" },
  { word: "CASH FLOW", hint: "The net amount of cash moving in and out", category: "Business" },
  { word: "BUDGET", hint: "A plan for income and expenses over a period", category: "Planning" },
  { word: "EMERGENCY RESERVE", hint: "Cash set aside for unexpected situations", category: "Savings" },
  { word: "CREDIT UTILIZATION", hint: "The ratio of credit used to credit available", category: "Credit" },
  { word: "DEBT TO INCOME RATIO", hint: "Monthly debt payments divided by gross income", category: "Credit" },
  { word: "LIQUID NET WORTH", hint: "Net worth excluding illiquid assets like real estate", category: "Metrics" },
  { word: "SINKING FUND", hint: "Money set aside for a specific future expense", category: "Savings" },
  { word: "OPPORTUNITY COST", hint: "The potential benefit lost when choosing one alternative", category: "Economics" },
  { word: "COMPOUNDING FREQUENCY", hint: "How often interest is added to the principal", category: "Basics" }
];

const MAX_WRONG = 6;
const ROBOT_PARTS = ['part-head', 'part-body', 'part-left-arm', 'part-right-arm', 'part-left-leg', 'part-right-leg'];

let gameState = {
  currentWord: null,
  guessedLetters: [],
  wrongLetters: [],
  wins: 0,
  streak: 0,
  gameOver: false,
  won: false
};

const wordDisplay = document.getElementById('wordDisplay');
const wrongList = document.getElementById('wrongList');
const categoryEl = document.getElementById('category');
const hintEl = document.getElementById('hint');
const winsEl = document.getElementById('wins');
const streakEl = document.getElementById('streak');
const modal = document.getElementById('modal');
const modalIcon = document.getElementById('modalIcon');
const modalTitle = document.getElementById('modalTitle');
const modalWord = document.getElementById('modalWord');
const modalDesc = document.getElementById('modalDesc');
const modalBtn = document.getElementById('modalBtn');

function initGame() {
  // Pick random word
  const term = FINANCIAL_TERMS[Math.floor(Math.random() * FINANCIAL_TERMS.length)];
  gameState.currentWord = term.word.toUpperCase();
  gameState.guessedLetters = [];
  gameState.wrongLetters = [];
  gameState.gameOver = false;
  gameState.won = false;
  
  // Reset UI
  categoryEl.textContent = term.category;
  hintEl.textContent = '';
  wrongList.textContent = '';
  
  // Reset robot parts
  ROBOT_PARTS.forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('visible', 'lost');
  });
  
  // Create word display
  renderWord();
  renderKeyboard();
  
  // Hide modal
  modal.classList.remove('active');
}

function renderWord() {
  wordDisplay.innerHTML = '';
  
  for (let char of gameState.currentWord) {
    const box = document.createElement('div');
    box.className = 'letter-box';
    
    if (char === ' ') {
      box.classList.add('space');
    } else if (gameState.guessedLetters.includes(char)) {
      box.classList.add('filled');
      box.textContent = char;
    }
    
    wordDisplay.appendChild(box);
  }
}

function renderKeyboard() {
  const keyboard = document.getElementById('keyboard');
  keyboard.innerHTML = '';
  
  'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').forEach(letter => {
    const key = document.createElement('div');
    key.className = 'key';
    key.textContent = letter;
    
    if (gameState.guessedLetters.includes(letter)) {
      key.classList.add('correct');
    } else if (gameState.wrongLetters.includes(letter)) {
      key.classList.add('wrong');
    } else {
      key.addEventListener('click', () => guessLetter(letter));
      key.addEventListener('touchstart', (e) => {
        e.preventDefault();
        guessLetter(letter);
      });
    }
    
    keyboard.appendChild(key);
  });
}

function guessLetter(letter) {
  if (gameState.gameOver) return;
  if (gameState.guessedLetters.includes(letter) || gameState.wrongLetters.includes(letter)) return;
  
  const word = gameState.currentWord;
  
  if (word.includes(letter)) {
    gameState.guessedLetters.push(letter);
    if (navigator.vibrate) navigator.vibrate(10);
    
    // Check win
    const allLetters = [...new Set(word.replace(/ /g, ''))];
    if (allLetters.every(l => gameState.guessedLetters.includes(l))) {
      gameWin();
    }
  } else {
    gameState.wrongLetters.push(letter);
    if (navigator.vibrate) navigator.vibrate([30, 20]);
    
    // Show robot part
    const partIndex = gameState.wrongLetters.length - 1;
    if (partIndex < ROBOT_PARTS.length) {
      const part = document.getElementById(ROBOT_PARTS[partIndex]);
      part.classList.add('visible');
    }
    
    // Check lose
    if (gameState.wrongLetters.length >= MAX_WRONG) {
      gameLose();
    }
  }
  
  renderWord();
  renderKeyboard();
  updateWrongLetters();
}

function updateWrongLetters() {
  wrongList.textContent = gameState.wrongLetters.join(' ');
}

function gameWin() {
  gameState.gameOver = true;
  gameState.won = true;
  gameState.wins++;
  gameState.streak++;
  
  winsEl.textContent = gameState.wins;
  streakEl.textContent = gameState.streak;
  
  // Find the term for description
  const term = FINANCIAL_TERMS.find(t => t.word === gameState.currentWord);
  
  modalIcon.textContent = '🎉';
  modalTitle.textContent = 'Word Cracked!';
  modalTitle.className = 'modal-title win';
  modalWord.textContent = gameState.currentWord;
  modalDesc.textContent = term ? term.hint : '';
  
  modal.classList.add('active');
  if (navigator.vibrate) navigator.vibrate([50, 30, 50, 30, 100]);
}

function gameLose() {
  gameState.gameOver = true;
  gameState.won = false;
  gameState.streak = 0;
  streakEl.textContent = 0;
  
  // Mark all parts as lost
  ROBOT_PARTS.forEach(id => {
    const el = document.getElementById(id);
    el.classList.add('lost');
  });
  
  // Reveal word
  const term = FINANCIAL_TERMS.find(t => t.word === gameState.currentWord);
  
  modalIcon.textContent = '💀';
  modalTitle.textContent = 'Liquidated!';
  modalTitle.className = 'modal-title lose';
  modalWord.textContent = gameState.currentWord;
  modalDesc.textContent = term ? term.hint : '';
  
  modal.classList.add('active');
  if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
}

// Keyboard support
window.addEventListener('keydown', (e) => {
  const key = e.key.toUpperCase();
  if (/^[A-Z]$/.test(key)) {
    guessLetter(key);
  }
});

// Modal button
modalBtn.addEventListener('click', initGame);
modalBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  initGame();
});

// Initialize on load
initGame();
