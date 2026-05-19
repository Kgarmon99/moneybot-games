/**
 * Freelancer to Agency — MoneyBot Game
 * Core: week-by-week business sim with cashflow, hiring, and scaling.
 */

// ============================
// GAME STATE
// ============================
const STATE = {
  week: 1,
  cash: 5000,
  revenue: 0,
  profit: 0,
  hourlyRate: 75,
  marketRate: 75,
  employees: [],
  projects: [],
  offers: [],
  invoices: [],
  overhead: {
    software: 50,
    insurance: 0,
    rent: 0,
  },
  satisfaction: 100,
  reputation: 50,
  stage: 'solo', // solo, team, agency
  peakCash: 5000,
  totalBilled: 0,
  gameOver: false,
  won: false,
};

const STAGES = {
  solo: { name: 'Solo Freelancer', minEmployees: 0, maxEmployees: 0 },
  team: { name: 'Small Team', minEmployees: 1, maxEmployees: 4 },
  agency: { name: 'Full Agency', minEmployees: 5, maxEmployees: 20 },
};

const WIN_REVENUE = 1000000;
const WIN_EMPLOYEES = 10;
const STARTING_CASH = 5000;
const WEEKS_PER_YEAR = 52;

// ============================
// CLIENT / PROJECT DATA
// ============================
const CLIENT_NAMES = [
  'TechStart Inc', 'GreenLeaf Co', 'UrbanBuild', 'CloudNine SaaS',
  'MediCare Plus', 'EduLearn', 'RetailMax', 'FoodieApp',
  'FitTrack', 'BankSecure', 'TravelGo', 'MusicStream',
  'AutoDrive', 'HomeSmart', 'PetPal', 'StyleHub',
  'CryptoVault', 'HealthFirst', 'LegalEase', 'ShopLocal',
];

const PROJECT_TYPES = [
  { name: 'Website Redesign', baseHours: 40, complexity: 'low' },
  { name: 'Mobile App', baseHours: 120, complexity: 'high' },
  { name: 'Brand Identity', baseHours: 30, complexity: 'low' },
  { name: 'E-commerce Build', baseHours: 80, complexity: 'med' },
  { name: 'API Integration', baseHours: 60, complexity: 'med' },
  { name: 'Dashboard Build', baseHours: 50, complexity: 'med' },
  { name: 'Migration Project', baseHours: 100, complexity: 'high' },
  { name: 'Landing Pages', baseHours: 20, complexity: 'low' },
];

function complexityMultiplier(c) {
  return c === 'high' ? 1.5 : c === 'med' ? 1.2 : 1.0;
}

function complexityLabel(c) {
  return c === 'high' ? 'Complex' : c === 'med' ? 'Medium' : 'Simple';
}

// ============================
// CONTRACTOR POOL
// ============================
const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Skyler', 'Dakota'];
const LAST_NAMES = ['Chen', 'Patel', 'Kim', 'Singh', 'Rodriguez', 'Smith', 'Johnson', 'Lee', 'Wong', 'Gupta'];

function generateContractor() {
  const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  const qualityRoll = Math.random();
  const quality = qualityRoll > 0.7 ? 'high' : qualityRoll > 0.3 ? 'med' : 'low';
  const rate = quality === 'high' ? randInt(80, 120) : quality === 'med' ? randInt(50, 75) : randInt(25, 45);
  const speed = quality === 'high' ? randInt(35, 50) : quality === 'med' ? randInt(25, 35) : randInt(15, 25);
  return { id: `emp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name, quality, rate, speed, hired: false };
}

// ============================
// UTILITIES
// ============================
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function fmt$(n) { return '$' + Math.round(n).toLocaleString(); }
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

// ============================
// DOM REFS
// ============================
const $ = (id) => document.getElementById(id);
const screens = {
  start: $('screen-start'),
  game: $('screen-game'),
};

// ============================
// SCREEN MANAGEMENT
// ============================
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

function toggleModal(id, show) {
  const el = $(id);
  if (show) el.classList.remove('hidden');
  else el.classList.add('hidden');
}

// ============================
// GAME INITIALIZATION
// ============================
function initGame() {
  STATE.week = 1;
  STATE.cash = STARTING_CASH;
  STATE.revenue = 0;
  STATE.profit = 0;
  STATE.hourlyRate = 75;
  STATE.marketRate = 75;
  STATE.employees = [];
  STATE.projects = [];
  STATE.offers = [];
  STATE.invoices = [];
  STATE.overhead = { software: 50, insurance: 0, rent: 0 };
  STATE.satisfaction = 100;
  STATE.reputation = 50;
  STATE.stage = 'solo';
  STATE.peakCash = STARTING_CASH;
  STATE.totalBilled = 0;
  STATE.gameOver = false;
  STATE.won = false;

  generateOffers();
  updateHUD();
  renderClients();
  renderProjects();
  showScreen('game');
}

// ============================
// OFFER GENERATION
// ============================
function generateOffers() {
  const count = clamp(randInt(2, 4), 2, 4);
  STATE.offers = [];
  for (let i = 0; i < count; i++) {
    const type = pick(PROJECT_TYPES);
    const client = pick(CLIENT_NAMES);
    const complexity = type.complexity;
    const hours = Math.round(type.baseHours * (0.8 + Math.random() * 0.4));
    const budget = Math.round(hours * STATE.marketRate * complexityMultiplier(complexity) * (0.9 + Math.random() * 0.3));
    const deadline = randInt(2, 6);
    STATE.offers.push({
      id: `offer_${Date.now()}_${i}`,
      client,
      type: type.name,
      hours,
      budget,
      deadline,
      complexity,
    });
  }
}

// ============================
// HUD UPDATE
// ============================
function updateHUD() {
  $('hud-cash').textContent = fmt$(STATE.cash);
  $('hud-revenue').textContent = fmt$(STATE.revenue);
  $('hud-week').textContent = STATE.week;
  $('hud-team').textContent = 1 + STATE.employees.length;

  const pct = Math.min(100, (STATE.revenue / WIN_REVENUE) * 100);
  $('progress-bar').style.width = pct + '%';
  $('progress-text').textContent = `${fmt$(STATE.revenue)} / ${fmt$(WIN_REVENUE)}`;

  // Cash color warning
  const cashEl = $('hud-cash');
  if (STATE.cash < 1000) cashEl.style.color = 'var(--mb-red)';
  else if (STATE.cash < 3000) cashEl.style.color = 'var(--mb-gold)';
  else cashEl.style.color = 'var(--mb-green)';

  // Stage badge
  const badge = $('stage-badge');
  const teamSize = 1 + STATE.employees.length;
  if (teamSize >= 5) { STATE.stage = 'agency'; badge.textContent = STAGES.agency.name; }
  else if (teamSize >= 2) { STATE.stage = 'team'; badge.textContent = STAGES.team.name; }
  else { STATE.stage = 'solo'; badge.textContent = STAGES.solo.name; }
}

// ============================
// RENDER CLIENTS
// ============================
function renderClients() {
  const list = $('client-list');
  list.innerHTML = '';
  if (STATE.offers.length === 0) {
    list.innerHTML = '<div class="client-card" style="text-align:center;color:var(--mb-muted)">No new clients this week</div>';
    return;
  }
  STATE.offers.forEach((offer, idx) => {
    const card = document.createElement('div');
    card.className = 'client-card';
    card.style.animationDelay = `${idx * 0.08}s`;
    card.innerHTML = `
      <div class="client-header">
        <span class="client-name">${offer.client}</span>
        <span class="client-budget">${fmt$(offer.budget)}</span>
      </div>
      <div class="client-meta">
        <span class="meta-tag">${offer.type}</span>
        <span class="meta-tag">${offer.hours} hrs</span>
        <span class="meta-tag">${offer.deadline} wks</span>
        <span class="meta-tag complexity-${offer.complexity}">${complexityLabel(offer.complexity)}</span>
      </div>
      <div class="client-actions">
        <button class="btn-primary btn-small" data-action="accept" data-id="${offer.id}">Accept</button>
        <button class="btn-secondary btn-small" data-action="reject" data-id="${offer.id}">Pass</button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll('[data-action="accept"]').forEach(btn => {
    btn.addEventListener('click', () => acceptOffer(btn.dataset.id));
  });
  list.querySelectorAll('[data-action="reject"]').forEach(btn => {
    btn.addEventListener('click', () => rejectOffer(btn.dataset.id));
  });
}

// ============================
// RENDER PROJECTS
// ============================
function renderProjects() {
  const list = $('active-list');
  list.innerHTML = '';
  if (STATE.projects.length === 0) {
    list.innerHTML = '<div class="project-card" style="text-align:center;color:var(--mb-muted);border-left:none">No active projects</div>';
    return;
  }
  STATE.projects.forEach((proj, idx) => {
    const progress = Math.min(100, ((proj.totalHours - proj.hoursRemaining) / proj.totalHours) * 100);
    const isLate = proj.weeksLeft <= 0 && proj.hoursRemaining > 0;
    const isDone = proj.hoursRemaining <= 0;
    const card = document.createElement('div');
    card.className = 'project-card' + (isLate ? ' at-risk' : '');
    card.style.animationDelay = `${idx * 0.06}s`;
    card.innerHTML = `
      <div class="project-header">
        <span class="project-name">${proj.client} — ${proj.type}</span>
        <span class="project-status ${isLate ? 'late' : ''}">${isDone ? 'Done' : isLate ? 'OVERDUE' : proj.weeksLeft + ' wks left'}</span>
      </div>
      <div class="project-bar">
        <div class="project-bar-fill ${isLate ? 'late' : ''}" style="width:${progress}%"></div>
      </div>
      <div class="project-meta">
        <span>${proj.hoursRemaining} hrs remaining</span>
        <span>${fmt$(proj.budget)}</span>
      </div>
    `;
    list.appendChild(card);
  });
}

// ============================
// ACCEPT / REJECT OFFERS
// ============================
function acceptOffer(id) {
  const offer = STATE.offers.find(o => o.id === id);
  if (!offer) return;

  const activeCount = STATE.projects.filter(p => p.hoursRemaining > 0).length;
  const maxProjects = 2 + Math.floor(STATE.employees.length * 0.5);
  if (activeCount >= maxProjects) {
    toast('At capacity! Hire more help.', 'neg');
    return;
  }

  STATE.projects.push({
    id: `proj_${Date.now()}`,
    client: offer.client,
    type: offer.type,
    totalHours: offer.hours,
    hoursRemaining: offer.hours,
    budget: offer.budget,
    deadline: offer.deadline,
    weeksLeft: offer.deadline,
    complexity: offer.complexity,
    status: 'active',
  });

  STATE.offers = STATE.offers.filter(o => o.id !== id);
  renderClients();
  renderProjects();
  toast(`Project accepted: ${offer.client}`, 'pos');
}

function rejectOffer(id) {
  const offer = STATE.offers.find(o => o.id === id);
  STATE.offers = STATE.offers.filter(o => o.id !== id);
  renderClients();
  if (offer) toast(`Passed on ${offer.client}`, 'gold');
}

// ============================
// NEXT WEEK LOGIC
// ============================
function nextWeek() {
  if (STATE.gameOver) return;

  // 1. Calculate capacity and work done
  const totalCapacity = 40 + STATE.employees.reduce((sum, e) => sum + e.speed, 0);
  let remainingCapacity = totalCapacity;

  // Priority: overdue projects first, then by deadline
  const activeProjects = STATE.projects.filter(p => p.hoursRemaining > 0);
  activeProjects.sort((a, b) => a.weeksLeft - b.weeksLeft);

  activeProjects.forEach(proj => {
    if (remainingCapacity <= 0) return;
    const work = Math.min(proj.hoursRemaining, remainingCapacity);
    proj.hoursRemaining -= work;
    remainingCapacity -= work;
  });

  // 2. Update project deadlines
  STATE.projects.forEach(proj => {
    if (proj.hoursRemaining > 0) {
      proj.weeksLeft -= 1;
    }
  });

  // 3. Complete projects → invoice (net-30 = 2-4 week delay)
  const completed = STATE.projects.filter(p => p.hoursRemaining <= 0 && p.status === 'active');
  completed.forEach(proj => {
    proj.status = 'invoiced';
    const delay = randInt(2, 4);
    STATE.invoices.push({
      id: `inv_${Date.now()}_${Math.random()}`,
      amount: proj.budget,
      dueWeek: STATE.week + delay,
      client: proj.client,
    });
  });

  // 4. Collect invoices
  const paid = STATE.invoices.filter(inv => inv.dueWeek <= STATE.week);
  let weeklyRevenue = 0;
  paid.forEach(inv => {
    // Late payment chance
    if (Math.random() < 0.15) {
      inv.dueWeek += randInt(1, 3);
      toast(`Late payment from ${inv.client}`, 'neg');
      STATE.satisfaction = clamp(STATE.satisfaction - 3, 0, 100);
    } else {
      STATE.cash += inv.amount;
      STATE.revenue += inv.amount;
      STATE.totalBilled += inv.amount;
      weeklyRevenue += inv.amount;
      STATE.satisfaction = clamp(STATE.satisfaction + 2, 0, 100);
    }
  });
  STATE.invoices = STATE.invoices.filter(inv => inv.dueWeek > STATE.week);

  // 5. Pay overhead
  const teamSize = 1 + STATE.employees.length;
  const overheadSoftware = STATE.overhead.software + (teamSize > 1 ? 30 * (teamSize - 1) : 0);
  const overheadInsurance = teamSize >= 3 ? 200 : 0;
  const overheadRent = teamSize >= 5 ? 800 : teamSize >= 2 ? 300 : 0;
  const totalOverhead = overheadSoftware + overheadInsurance + overheadRent;

  // 6. Pay contractors
  const payroll = STATE.employees.reduce((sum, e) => sum + (e.rate * 40), 0);

  const totalExpenses = totalOverhead + payroll;
  STATE.cash -= totalExpenses;
  STATE.profit = STATE.revenue - (STARTING_CASH - STATE.cash);

  // 7. Satisfaction decay for overdue projects
  const overdue = STATE.projects.filter(p => p.hoursRemaining > 0 && p.weeksLeft < 0);
  if (overdue.length > 0) {
    STATE.satisfaction = clamp(STATE.satisfaction - overdue.length * 5, 0, 100);
  }

  // 8. Reputation based on satisfaction
  STATE.reputation = clamp(STATE.reputation + (STATE.satisfaction - 50) * 0.1, 10, 100);

  // 9. Update peak cash
  if (STATE.cash > STATE.peakCash) STATE.peakCash = STATE.cash;

  // 10. Advance week
  STATE.week++;

  // 11. Generate new offers
  generateOffers();

  // 12. Market rate drifts
  STATE.marketRate = clamp(STATE.marketRate + randInt(-3, 5), 50, 250);

  // 13. Update UI
  updateHUD();
  renderClients();
  renderProjects();
  showWeeklySummary(weeklyRevenue, totalExpenses, payroll, totalOverhead);

  // 14. Check win/loss
  checkEndGame();
}

function showWeeklySummary(revenue, expenses, payroll, overhead) {
  const el = $('weekly-summary');
  el.classList.remove('hidden');
  const profit = revenue - expenses;
  el.innerHTML = `
    <h4>Week ${STATE.week - 1} Summary</h4>
    <div class="summary-row"><span class="sum-label">Revenue collected</span><span class="sum-value pos">+${fmt$(revenue)}</span></div>
    <div class="summary-row"><span class="sum-label">Payroll</span><span class="sum-value neg">-${fmt$(payroll)}</span></div>
    <div class="summary-row"><span class="sum-label">Overhead</span><span class="sum-value neg">-${fmt$(overhead)}</span></div>
    <div class="summary-row"><span class="sum-label">Weekly profit</span><span class="sum-value ${profit >= 0 ? 'pos' : 'neg'}">${profit >= 0 ? '+' : ''}${fmt$(profit)}</span></div>
    <div class="summary-row"><span class="sum-label">Pending invoices</span><span class="sum-value">${STATE.invoices.length}</span></div>
  `;
}

// ============================
// END GAME CHECK
// ============================
function checkEndGame() {
  const teamSize = 1 + STATE.employees.length;

  // Win conditions
  if (STATE.revenue >= WIN_REVENUE || teamSize >= WIN_EMPLOYEES) {
    STATE.gameOver = true;
    STATE.won = true;
    const reason = STATE.revenue >= WIN_REVENUE
      ? `You hit ${fmt$(WIN_REVENUE)} in revenue!`
      : `You built a team of ${teamSize} people!`;
    $('win-reason').textContent = reason;
    $('win-weeks').textContent = STATE.week;
    $('win-revenue').textContent = fmt$(STATE.revenue);
    $('win-team').textContent = teamSize;
    $('win-profit').textContent = fmt$(STATE.profit);
    toggleModal('modal-win', true);
    return;
  }

  // Loss condition
  if (STATE.cash <= 0) {
    STATE.gameOver = true;
    STATE.won = false;
    $('loss-weeks').textContent = STATE.week;
    $('loss-revenue').textContent = fmt$(STATE.revenue);
    $('loss-peak').textContent = fmt$(STATE.peakCash);
    toggleModal('modal-loss', true);
    return;
  }

  // Warning
  if (STATE.cash < 1500) {
    toast('⚠️ Cash is critically low!', 'neg');
  }
}

// ============================
// RATE MODAL
// ============================
function openRateModal() {
  $('rate-current').textContent = STATE.hourlyRate;
  $('rate-slider').value = STATE.hourlyRate;
  $('rate-market').textContent = STATE.marketRate;
  updateRateReaction();
  toggleModal('modal-rate', true);
}

function updateRateReaction() {
  const val = parseInt($('rate-slider').value);
  $('rate-current').textContent = val;
  const ratio = val / STATE.marketRate;
  const el = $('rate-reaction');
  if (ratio > 1.3) { el.textContent = 'Expensive'; el.className = 'rate-reaction high'; }
  else if (ratio < 0.7) { el.textContent = 'Underpriced'; el.className = 'rate-reaction low'; }
  else { el.textContent = 'Fair'; el.className = 'rate-reaction fair'; }
}

function saveRate() {
  STATE.hourlyRate = parseInt($('rate-slider').value);
  toggleModal('modal-rate', false);
  toast(`Rate set to $${STATE.hourlyRate}/hr`, 'pos');
}

// ============================
// HIRE MODAL
// ============================
function openHireModal() {
  const pool = $('hire-pool');
  pool.innerHTML = '';
  const candidates = [generateContractor(), generateContractor(), generateContractor()];
  candidates.forEach(c => {
    const card = document.createElement('div');
    card.className = 'hire-card';
    card.innerHTML = `
      <div class="hire-info">
        <div class="hire-name">${c.name}</div>
        <div class="hire-details">$${c.rate}/hr · ${c.speed} hrs/wk</div>
        <div class="hire-quality quality-${c.quality}">${c.quality === 'high' ? '★★★ Expert' : c.quality === 'med' ? '★★ Solid' : '★ Junior'}</div>
      </div>
      <button class="btn-primary btn-small" data-hire="${c.id}">Hire</button>
    `;
    card.querySelector('[data-hire]').addEventListener('click', () => hireContractor(c));
    pool.appendChild(card);
  });
  toggleModal('modal-hire', true);
}

function hireContractor(candidate) {
  const cost = candidate.rate * 40; // first week upfront
  if (STATE.cash < cost + 500) {
    toast('Not enough cash to hire!', 'neg');
    return;
  }
  STATE.cash -= cost;
  STATE.employees.push({ ...candidate, hired: true });
  updateHUD();
  toggleModal('modal-hire', false);
  toast(`Hired ${candidate.name}!`, 'pos');

  // Auto-update overhead
  const teamSize = 1 + STATE.employees.length;
  if (teamSize >= 3 && STATE.overhead.insurance === 0) {
    STATE.overhead.insurance = 200;
    toast('Insurance required for 3+ team', 'gold');
  }
  if (teamSize >= 5 && STATE.overhead.rent === 0) {
    STATE.overhead.rent = 800;
    toast('Office rent added for 5+ team', 'gold');
  }
}

// ============================
// TOAST
// ============================
let toastTimer;
function toast(msg, type = 'pos') {
  const el = $('toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    el.classList.add('hidden');
  }, 2500);
}

// ============================
// EVENT LISTENERS
// ============================
$('btn-start').addEventListener('click', initGame);
$('btn-next').addEventListener('click', nextWeek);
$('btn-rate').addEventListener('click', openRateModal);
$('btn-hire').addEventListener('click', openHireModal);
$('btn-rate-save').addEventListener('click', saveRate);
$('btn-hire-close').addEventListener('click', () => toggleModal('modal-hire', false));
$('btn-restart-win').addEventListener('click', initGame);
$('btn-restart-loss').addEventListener('click', initGame);
$('rate-slider').addEventListener('input', updateRateReaction);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    toggleModal('modal-rate', false);
    toggleModal('modal-hire', false);
  }
  if (e.key === 'Enter' && !$('modal-rate').classList.contains('hidden')) {
    saveRate();
  }
});

// Prevent zoom on double-tap
document.addEventListener('dblclick', (e) => {
  if (e.target.tagName === 'BUTTON') e.preventDefault();
}, { passive: false });

// ============================
// INIT
// ============================
showScreen('start');
