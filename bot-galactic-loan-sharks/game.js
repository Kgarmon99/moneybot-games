const scenarios = [
  {
    name: "Zyx'thor the Graduate",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=zyx&backgroundColor=7c3aed&baseColor=22c55e",
    scenario: "Zorblaxian student heading to Galactic University - needs 20,000 credits",
    dialogue: "I just got accepted to Galactic University! Tuition is 25,000 credits per cycle. I need to borrow about 20,000 credits for my first year. Everyone keeps talking about 'federal vs private' loans... a loan is a loan, right? ...Right?",
    options: [
      {
        id: "1a", type: "Federal Direct Loan", apr: 5.5, term: "120 mo", total: 26160, profit: 6160,
        finePrint: "Fixed rate. Income-driven repayment. Loan forgiveness programs available.",
        tip: "Always exhaust federal student loans FIRST. They have protections no private loan can match.",
        realWorld: "A fair price for $20k in education with full borrower protections.",
        reaction: "Fixed rate and income-based options? That's actually reassuring.", optimal: true
      },
      {
        id: "1b", type: "Private Student Loan", apr: 8.99, term: "120 mo", total: 30360, profit: 10360,
        finePrint: "Variable rate. Requires cosigner. No income-based options or forgiveness.",
        tip: "Private loans are a leading cause of debt crises. Rates can climb to 14%+.",
        realWorld: "You'd pay nearly as much in interest as you borrowed. Avoid these.",
        reaction: "Wait — the rate can go UP? And if I lose my job I still have to pay?", optimal: false
      }
    ]
  },
  {
    name: "Kira Stellanova",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=kira&backgroundColor=ec4899&baseColor=06b6d4",
    scenario: "Nebulite teen buying her first hover-pod - needs 10,000 credits",
    dialogue: "I saved 2,000 credits from my job. I found a hover-pod for 12,000, so I need to borrow 10,000. My credit history is 'none', so the rates aren't great. The dealer says their financing is 'so easy!'",
    options: [
      {
        id: "2a", type: "Credit Union Auto Loan", apr: 7.9, term: "48 mo", total: 11664, profit: 1664,
        finePrint: "Requires CU membership. Best rates for first-time buyers. Negotiating power.",
        tip: "Get pre-approved by a credit union BEFORE visiting a dealership.",
        realWorld: "Reasonable for a first auto loan with no credit history.",
        reaction: "Fixed rate, 4 years and it's mine. I should've come here first.", optimal: true
      },
      {
        id: "2c", type: "Buy Here Pay Here Lot", apr: 23.9, term: "60 mo", total: 17220, profit: 7220,
        finePrint: "No credit check! GPS tracker on car. Miss ONE payment = instant repo.",
        tip: "BHPH lots profit from repossessions. They sell the SAME car over and over.",
        realWorld: "Interest is 72% of what you borrowed! Never rent-to-own or use BHPH.",
        reaction: "GPS tracker?! Miss ONE payment and they just take it without warning?", optimal: false
      }
    ]
  }
];

let currentIndex = 0;
let totalProfit = 0;
let optimalCount = 0;

const els = {
  startScreen: document.getElementById('start-screen'),
  gameScreen: document.getElementById('game-screen'),
  resultsScreen: document.getElementById('results-screen'),
  modal: document.getElementById('feedback-modal'),
  victimVal: document.getElementById('victim-val'),
  profitVal: document.getElementById('profit-val'),
  borrowerImg: document.getElementById('borrower-img'),
  borrowerName: document.getElementById('borrower-name'),
  borrowerScenario: document.getElementById('borrower-scenario'),
  borrowerDialogue: document.getElementById('borrower-dialogue'),
  loanOptions: document.getElementById('loan-options'),
  feedbackTitle: document.getElementById('feedback-title'),
  feedbackReaction: document.getElementById('feedback-reaction'),
  feedbackProfit: document.getElementById('feedback-profit'),
  feedbackRealWorld: document.getElementById('feedback-realworld'),
  feedbackTip: document.getElementById('feedback-tip'),
  finalProfit: document.getElementById('final-profit'),
  finalOptimal: document.getElementById('final-optimal'),
  finalVerdict: document.getElementById('final-verdict')
};

function formatMoney(n) { return '$' + n.toLocaleString(); }

function startGame() {
  els.startScreen.classList.remove('active');
  els.gameScreen.classList.add('active');
  currentIndex = 0;
  totalProfit = 0;
  optimalCount = 0;
  loadScenario();
}

function loadScenario() {
  const s = scenarios[currentIndex];
  els.victimVal.innerText = `${currentIndex + 1}/${scenarios.length}`;
  els.profitVal.innerText = formatMoney(totalProfit);
  els.borrowerImg.src = s.avatar;
  els.borrowerName.innerText = s.name;
  els.borrowerScenario.innerText = s.scenario;
  els.borrowerDialogue.innerText = `"${s.dialogue}"`;
  
  els.loanOptions.innerHTML = '';
  s.options.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'loan-card';
    div.onclick = () => selectLoan(opt);
    div.innerHTML = `
      <div class="loan-card-header">
        <span class="loan-type">${opt.type}</span>
        <span class="loan-profit">Bank Profit: ${formatMoney(opt.profit)}</span>
      </div>
      <div class="loan-stats">
        <span>APR: ${opt.apr}%</span>
        <span>Term: ${opt.term}</span>
        <span>Total: ${formatMoney(opt.total)}</span>
      </div>
      <div class="loan-fineprint">${opt.finePrint}</div>
    `;
    els.loanOptions.appendChild(div);
  });
}

function selectLoan(opt) {
  totalProfit += opt.profit;
  if (opt.optimal) optimalCount++;
  
  els.feedbackTitle.innerText = opt.optimal ? "✅ FAIR LENDING" : "⚠️ SHARK ALERT!";
  els.feedbackTitle.style.color = opt.optimal ? "var(--mb-green)" : "var(--mb-red)";
  els.feedbackReaction.innerText = `Borrower: "${opt.reaction}"`;
  els.feedbackProfit.innerText = formatMoney(opt.profit);
  els.feedbackRealWorld.innerText = opt.realWorld;
  els.feedbackTip.innerText = opt.tip;
  
  els.modal.classList.remove('hidden');
}

function nextScenario() {
  els.modal.classList.add('hidden');
  currentIndex++;
  if (currentIndex < scenarios.length) {
    loadScenario();
  } else {
    showResults();
  }
}

function showResults() {
  els.gameScreen.classList.remove('active');
  els.resultsScreen.classList.add('active');
  
  els.finalProfit.innerText = formatMoney(totalProfit);
  els.finalOptimal.innerText = `${optimalCount}/${scenarios.length}`;
  
  let verdict = "";
  if (optimalCount === scenarios.length) {
    verdict = "You're a Saint! You prioritized borrower safety over predatory profits. The galaxy is a better place.";
  } else if (optimalCount > 0) {
    verdict = "A Mixed Bag. You made some honest deals, but the allure of shark profits was too strong for others.";
  } else {
    verdict = "Total Loan Shark! You exploited every victim for maximum profit. Your bank account is full, but the galaxy fears you.";
  }
  els.finalVerdict.innerText = verdict;
}
