/**
 * Do Things That Don't Scale — Upgraded
 * YC Lesson: Manual effort compounds, automate later
 * Clicker/idle hybrid - manually acquire first users
 */

const Game = {
  users: 0,
  target: 100,
  week: 1,
  maxWeeks: 20,
  reputation: 0,
  automation: 0,
  tasksCompleted: 0,
  activeTasks: [],
  history: [],
  gameOver: false,
  won: false
};

const TASKS = [
  { id: 'dm', name: 'Cold DM', emoji: '💬', desc: 'Slide into DMs one by one', baseUsers: 1, baseTime: 2, effort: 5, color: '#00ff88' },
  { id: 'hand', name: 'Hand-Deliver', emoji: '🤝', desc: 'Show up in person with product', baseUsers: 3, baseTime: 5, effort: 10, color: '#ffcc00' },
  { id: 'content', name: 'Write Content', emoji: '✍️', desc: 'Blog post or tweet thread', baseUsers: 5, baseTime: 8, effort: 15, color: '#ff6600' },
  { id: 'referral', name: 'Ask for Referral', emoji: '🔄', desc: 'Each user brings a friend', baseUsers: 2, baseTime: 3, effort: 8, color: '#ff3366' },
  { id: 'hack', name: 'Growth Hack', emoji: '🚀', desc: 'Creative stunt to get attention', baseUsers: 8, baseTime: 12, effort: 20, color: '#aa00ff' }
];

const AUTOMATIONS = [
  { name: 'Email Templates', cost: 20, effect: 1.2, desc: 'x1.2 DM efficiency' },
  { name: 'Delivery Partner', cost: 50, effect: 1.3, desc: 'x1.3 hand-delivery' },
  { name: 'Content Calendar', cost: 80, effect: 1.5, desc: 'x1.5 content reach' },
  { name: 'Referral Program', cost: 100, effect: 2.0, desc: 'x2 referral bonus' },
  { name: 'Viral Loop', cost: 150, effect: 3.0, desc: 'x3 growth hack impact' }
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
    users: 0, target: 100, week: 1, maxWeeks: 20,
    reputation: 0, automation: 0, tasksCompleted: 0,
    activeTasks: [], history: [], gameOver: false, won: false
  });
  
  $('start-screen').classList.remove('active');
  $('win-screen').classList.remove('active');
  $('loss-screen').classList.remove('active');
  
  updateHUD();
  renderGame();
  startGameLoop();
}

let gameInterval;
function startGameLoop() {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    if (Game.gameOver) { clearInterval(gameInterval); return; }
    tick();
  }, 1000);
}

function tick() {
  // Progress active tasks
  Game.activeTasks = Game.activeTasks.filter(task => {
    task.progress += 1;
    if (task.progress >= task.totalTime) {
      completeTask(task);
      return false;
    }
    return true;
  });
  
  renderTasks();
  updateHUD();
}

function completeTask(task) {
  const multiplier = 1 + (Game.automation * 0.1);
  const usersGained = Math.round(task.baseUsers * multiplier);
  Game.users += usersGained;
  Game.reputation += task.effort;
  Game.tasksCompleted++;
  
  // Create floating text
  showFloatingText(`+${usersGained} users!`, task.color);
  
  // Add to history
  Game.history.push({ week: Game.week, task: task.name, users: usersGained });
  
  checkMilestones();
  updateHUD();
  checkGameOver();
}

function showFloatingText(text, color) {
  const el = document.createElement('div');
  el.className = 'score-pop';
  el.style.color = color;
  el.textContent = text;
  el.style.left = (50 + Math.random() * 20) + '%';
  el.style.top = '40%';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function checkMilestones() {
  const milestones = [10, 25, 50, 75, 100];
  milestones.forEach(m => {
    if (Game.users >= m && Game.users - m < 5) {
      showMilestone(m);
    }
  });
}

function showMilestone(n) {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:20%;left:50%;transform:translateX(-50%);z-index:200;text-align:center;pointer-events:none;';
  div.innerHTML = `
    <div style="font-size:48px;font-weight:800;color:var(--accent);text-shadow:0 0 30px rgba(0,255,136,0.5);animation:pulse 1s ease;">
      🎉 ${n} USERS! 🎉
    </div>
    <div style="font-size:16px;color:var(--text-dim);margin-top:8px;">
      ${n === 10 ? "First users are the hardest. Keep going!" :
        n === 25 ? "Word of mouth is starting to work!" :
        n === 50 ? "Halfway there! You're doing things that don't scale." :
        n === 75 ? "The compound effect is kicking in!" :
        "Final push! You're about to hit product-market fit!"}
    </div>
  `;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function updateHUD() {
  $('score').textContent = Game.users;
  $('round').textContent = `Week ${Game.week}/${Game.maxWeeks}`;
  
  const userPct = Math.min((Game.users / Game.target) * 100, 100);
  const userBar = $('user-bar');
  if (userBar) {
    userBar.style.width = userPct + '%';
  }
  
  const weekBar = $('week-bar');
  if (weekBar) {
    weekBar.style.width = (Game.week / Game.maxWeeks * 100) + '%';
  }
}

function renderGame() {
  const container = $('choices');
  container.innerHTML = '';
  
  // Active tasks
  const tasksPanel = document.createElement('div');
  tasksPanel.id = 'active-tasks';
  tasksPanel.innerHTML = '<div class="panel-title">Active Tasks</div>';
  container.appendChild(tasksPanel);
  
  renderTasks();
  
  // Available tasks
  const availablePanel = document.createElement('div');
  availablePanel.innerHTML = '<div class="panel-title" style="margin-top:20px;">Do Things That Don\'t Scale</div>';
  
  const taskGrid = document.createElement('div');
  taskGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;';
  
  TASKS.forEach(task => {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.style.borderTop = `3px solid ${task.color}`;
    btn.innerHTML = `
      <div style="font-size:28px;margin-bottom:8px;">${task.emoji}</div>
      <div style="font-weight:700;font-size:14px;">${task.name}</div>
      <div style="font-size:11px;color:var(--text-dim);margin:4px 0;">${task.desc}</div>
      <div style="font-size:12px;color:var(--accent);">+${task.baseUsers} users | ${task.baseTime}s</div>
    `;
    btn.onclick = () => startTask(task);
    if (Game.activeTasks.length >= 3) {
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    }
    taskGrid.appendChild(btn);
  });
  
  availablePanel.appendChild(taskGrid);
  container.appendChild(availablePanel);
  
  // Automation upgrades
  if (Game.reputation >= 20) {
    const autoPanel = document.createElement('div');
    autoPanel.innerHTML = '<div class="panel-title" style="margin-top:20px;">Automate (Reputation: ' + Game.reputation + ')</div>';
    
    const autoGrid = document.createElement('div');
    autoGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;';
    
    AUTOMATIONS.forEach(auto => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      const owned = Game.automation >= auto.effect;
      btn.innerHTML = `
        <div style="font-weight:700;">${auto.name}</div>
        <div style="font-size:11px;color:var(--text-dim);">${auto.desc}</div>
        <div style="font-size:12px;color:${owned ? 'var(--success)' : 'var(--accent)'};">
          ${owned ? '✅ Owned' : `💰 ${auto.cost} rep`}
        </div>
      `;
      btn.onclick = () => buyAutomation(auto);
      if (owned || Game.reputation < auto.cost) {
        btn.style.opacity = owned ? '0.6' : '0.4';
      }
      autoGrid.appendChild(btn);
    });
    
    autoPanel.appendChild(autoGrid);
    container.appendChild(autoPanel);
  }
}

function startTask(task) {
  if (Game.activeTasks.length >= 3) return;
  
  Game.activeTasks.push({
    ...task,
    progress: 0,
    totalTime: task.baseTime
  });
  
  renderTasks();
}

function renderTasks() {
  const panel = $('active-tasks');
  if (!panel) return;
  
  // Remove old task cards
  while (panel.children.length > 1) panel.removeChild(panel.lastChild);
  
  if (Game.activeTasks.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:20px;text-align:center;color:var(--text-dim);';
    empty.textContent = 'No active tasks. Pick something manual to do!';
    panel.appendChild(empty);
    return;
  }
  
  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:10px;';
  
  Game.activeTasks.forEach(task => {
    const pct = (task.progress / task.totalTime) * 100;
    const card = document.createElement('div');
    card.className = 'card';
    card.style.borderTop = `3px solid ${task.color}`;
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="font-size:20px;">${task.emoji}</span>
        <span style="font-weight:700;font-size:14px;">${task.name}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${pct}%;background:${task.color};"></div>
      </div>
      <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">${task.progress}/${task.totalTime}s</div>
    `;
    grid.appendChild(card);
  });
  
  panel.appendChild(grid);
}

function buyAutomation(auto) {
  if (Game.reputation < auto.cost || Game.automation >= auto.effect) return;
  
  Game.reputation -= auto.cost;
  Game.automation = auto.effect;
  
  showFloatingText(`🔧 ${auto.name} unlocked!`, '#aa00ff');
  renderGame();
}

function checkGameOver() {
  if (Game.users >= Game.target) {
    Game.won = true;
    Game.gameOver = true;
    clearInterval(gameInterval);
    showWin();
  } else if (Game.week >= Game.maxWeeks) {
    Game.gameOver = true;
    clearInterval(gameInterval);
    showLoss();
  }
}

function showWin() {
  $('win-screen').classList.add('active');
  $('win-reason').textContent = `Reached ${Game.users} users in ${Game.week} weeks! You did ${Game.tasksCompleted} manual tasks before automating.`;
}

function showLoss() {
  $('loss-screen').classList.add('active');
  $('loss-reason').textContent = `Only reached ${Game.users}/${Game.target} users in ${Game.week} weeks.`;
  $('loss-tip').textContent = Game.tasksCompleted < 10
    ? "You tried to automate too early. Do things that don't scale first!"
    : "Try focusing on high-impact tasks like growth hacks and referrals.";
}

init();
