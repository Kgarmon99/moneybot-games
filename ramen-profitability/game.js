/**
 * Ramen Profitability — Upgraded
 * YC Lesson: Minimize burn, extend runway, get to ramen profitable
 * Resource survival game - manage minimal budget to reach profitability
 */

const Game = {
  cash: 5000,
  runway: 12,
  revenue: 0,
  expenses: 2000,
  mrr: 0,
  users: 0,
  day: 1,
  maxDays: 90,
  decisions: [],
  gameOver: false,
  won: false,
  history: []
};

const DAILY_DECISIONS = [
  {
    category: "Product",
    emoji: "💻",
    choices: [
      { text: "Ship feature fast", cost: 0, mrr: 200, users: 5, desc: "Cut scope, ship today. Revenue +$200/mo" },
      { text: "Polish for 3 days", cost: 0, mrr: 0, users: 0, desc: "No revenue yet, but better quality" },
      { text: "Add enterprise feature", cost: 500, mrr: 1000, users: 1, desc: "Expensive but high-value customer" }
    ]
  },
  {
    category: "Marketing",
    emoji: "📣",
    choices: [
      { text: "Post on Twitter daily", cost: 0, mrr: 100, users: 3, desc: "Free marketing, slow but steady" },
      { text: "Run $500 ad campaign", cost: 500, mrr: 400, users: 10, desc: "Fast users but burns cash" },
      { text: "Write SEO content", cost: 0, mrr: 50, users: 2, desc: "Long-term play, minimal immediate return" }
    ]
  },
  {
    category: "Sales",
    emoji: "💰",
    choices: [
      { text: "Cold email 50 prospects", cost: 0, mrr: 300, users: 2, desc: "Time-intensive but targeted" },
      { text: "Offer annual discount", cost: 0, mrr: 500, users: 1, desc: "Cash upfront, lower LTV" },
      { text: "Demo to warm lead", cost: 0, mrr: 800, users: 1, desc: "High conversion, takes time" }
    ]
  },
  {
    category: "Operations",
    emoji: "⚙️",
    choices: [
      { text: "Work from home", cost: -500, mrr: 0, users: 0, desc: "Save $500/mo on office" },
      { text: "Hire contractor", cost: 2000, mrr: 0, users: 0, desc: "Speeds development but expensive" },
      { text: "Cut AWS costs", cost: -200, mrr: 0, users: 0, desc: "Optimize infrastructure spend" }
    ]
  },
  {
    category: "Founder",
    emoji: "👤",
    choices: [
      { text: "Ramen diet ($5/day)", cost: -150, mrr: 0, users: 0, desc: "Personal savings extend runway" },
      { text: "Take $2K salary", cost: 2000, mrr: 0, users: 0, desc: "Sustainable but burns fast" },
      { text: "Consult on weekends", cost: -1000, mrr: 0, users: 0, desc: "+$1K/mo but splits focus" }
    ]
  }
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
    cash: 5000, runway: 12, revenue: 0, expenses: 2000, mrr: 0,
    users: 0, day: 1, maxDays: 90, decisions: [],
    gameOver: false, won: false, history: []
  });
  
  $('start-screen').classList.remove('active');
  $('win-screen').classList.remove('active');
  $('loss-screen').classList.remove('active');
  
  updateHUD();
  renderGame();
}

function updateHUD() {
  $('score').textContent = `$${Game.mrr}/mo MRR`;
  $('round').textContent = `Day ${Game.day}/${Game.maxDays}`;
  
  const cashEl = $('cash-display');
  if (cashEl) cashEl.textContent = `$${Game.cash.toLocaleString()}`;
  
  const runwayEl = $('runway-display');
  if (runwayEl) runwayEl.textContent = `${Game.runway}mo`;
  
  const userEl = $('user-display');
  if (userEl) userEl.textContent = `${Game.users} users`;
}

function renderGame() {
  const container = $('choices');
  container.innerHTML = '';
  
  // Financial dashboard
  const dashboard = document.createElement('div');
  dashboard.className = 'card animate-fade-in';
  dashboard.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;text-align:center;">
      <div>
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;">Cash</div>
        <div style="font-size:20px;font-weight:700;color:var(--accent);" id="cash-display">$${Game.cash.toLocaleString()}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;">MRR</div>
        <div style="font-size:20px;font-weight:700;color:var(--success);" id="mrr-display">$${Game.mrr}</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;">Runway</div>
        <div style="font-size:20px;font-weight:700;color:${Game.runway < 3 ? 'var(--danger)' : 'var(--accent)'};" id="runway-display">${Game.runway}mo</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;">Users</div>
        <div style="font-size:20px;font-weight:700;color:var(--accent-3);" id="user-display">${Game.users}</div>
      </div>
    </div>
    <div class="progress-bar" style="margin-top:12px;">
      <div class="progress-fill ${Game.mrr >= Game.expenses ? '' : Game.runway < 3 ? 'danger' : 'warning'}" 
           style="width:${Math.min((Game.mrr / Math.max(Game.expenses, 1)) * 100, 100)}%;"></div>
    </div>
    <div style="text-align:center;font-size:11px;color:var(--text-dim);margin-top:4px;">
      ${Game.mrr >= Game.expenses ? '✅ Ramen Profitable!' : `Need $${Game.expenses - Game.mrr} more MRR to break even`}
    </div>
  `;
  container.appendChild(dashboard);
  
  // Daily decision
  const decision = DAILY_DECISIONS[Math.floor(Math.random() * DAILY_DECISIONS.length)];
  
  const decisionPanel = document.createElement('div');
  decisionPanel.innerHTML = `
    <div class="panel-title" style="margin-top:20px;">${decision.emoji} ${decision.category} Decision</div>
    <div style="font-size:14px;color:var(--text-dim);margin-bottom:12px;">Day ${Game.day}: Choose how to spend your time</div>
  `;
  container.appendChild(decisionPanel);
  
  const grid = document.createElement('div');
  grid.className = 'choice-grid';
  
  decision.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    const costColor = choice.cost > 0 ? 'var(--danger)' : choice.cost < 0 ? 'var(--success)' : 'var(--text-dim)';
    btn.innerHTML = `
      <div style="font-weight:700;margin-bottom:4px;">${choice.text}</div>
      <div style="font-size:12px;color:var(--text-dim);">${choice.desc}</div>
      <div style="font-size:12px;margin-top:4px;">
        ${choice.cost > 0 ? `<span style="color:var(--danger)">-$${choice.cost}</span>` : choice.cost < 0 ? `<span style="color:var(--success)">+$${Math.abs(choice.cost)}</span>` : '<span style="color:var(--text-dim)">Free</span>'}
        ${choice.mrr > 0 ? ` • <span style="color:var(--success)">+$${choice.mrr}/mo</span>` : ''}
        ${choice.users > 0 ? ` • <span style="color:var(--accent-3)">+${choice.users} users</span>` : ''}
      </div>
    `;
    btn.onclick = () => makeDecision(choice);
    if (choice.cost > 0 && Game.cash < choice.cost) {
      btn.style.opacity = '0.4';
      btn.style.cursor = 'not-allowed';
    }
    grid.appendChild(btn);
  });
  
  container.appendChild(grid);
}

function makeDecision(choice) {
  if (choice.cost > 0 && Game.cash < choice.cost) return;
  
  Game.cash -= choice.cost;
  Game.mrr += choice.mrr;
  Game.users += choice.users;
  Game.day += 1;
  
  // Update expenses based on decisions
  if (choice.cost < 0) {
    Game.expenses += choice.cost; // Reduce expenses
  } else if (choice.cost > 1000) {
    Game.expenses += 500; // Hiring increases burn
  }
  
  // Recalculate runway
  const netBurn = Math.max(Game.expenses - Game.mrr, 0);
  Game.runway = netBurn > 0 ? Math.floor(Game.cash / netBurn) : 99;
  
  Game.history.push({ day: Game.day, mrr: Game.mrr, cash: Game.cash });
  
  // Floating feedback
  const feedback = [];
  if (choice.mrr > 0) feedback.push(`+$${choice.mrr}/mo`);
  if (choice.users > 0) feedback.push(`+${choice.users} users`);
  if (choice.cost < 0) feedback.push(`Saved $${Math.abs(choice.cost)}`);
  if (feedback.length > 0) {
    showFloatingText(feedback.join(' • '), choice.mrr > 0 ? 'var(--success)' : 'var(--accent)');
  }
  
  updateHUD();
  checkGameOver();
  if (!Game.gameOver) renderGame();
}

function checkGameOver() {
  // Win: Ramen profitable (MRR >= expenses) and sustainable
  if (Game.mrr >= Game.expenses && Game.users >= 10) {
    Game.won = true;
    Game.gameOver = true;
    showWin();
    return;
  }
  
  // Loss: Out of cash
  if (Game.cash <= 0) {
    Game.gameOver = true;
    showLoss("You ran out of cash!");
    return;
  }
  
  // Loss: Time's up
  if (Game.day >= Game.maxDays) {
    Game.gameOver = true;
    if (Game.mrr >= Game.expenses) {
      Game.won = true;
      showWin();
    } else {
      showLoss("90 days up! Didn't reach ramen profitability.");
    }
    return;
  }
}

function showWin() {
  $('win-screen').classList.add('active');
  $('win-reason').textContent = `Ramen profitable at $${Game.mrr}/mo MRR with ${Game.users} users in ${Game.day} days! You survived on minimal burn.`;
}

function showLoss(reason) {
  $('loss-screen').classList.add('active');
  $('loss-reason').textContent = reason;
  $('loss-tip').textContent = Game.mrr > 0
    ? `You had $${Game.mrr}/mo MRR but needed $${Game.expenses}/mo. Focus on revenue-generating activities.`
    : "You need to ship and sell! Every day without revenue burns runway.";
}

function showFloatingText(text, color) {
  const el = document.createElement('div');
  el.className = 'score-pop';
  el.style.color = color;
  el.textContent = text;
  el.style.left = '50%';
  el.style.top = '35%';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

init();
