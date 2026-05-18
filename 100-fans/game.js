/**
 * 100 Fans — Upgraded
 * YC Lesson: First 100 fans are the hardest, then compound growth kicks in
 * Viral growth simulation - each fan brings friends
 */

const Game = {
  fans: 0,
  target: 100,
  day: 1,
  maxDays: 60,
  reputation: 0,
  viralCoeff: 0,
  contentQuality: 1,
  channels: [
    { name: "Twitter", unlocked: true, efficiency: 1, emoji: "🐦" },
    { name: "Reddit", unlocked: false, efficiency: 2, cost: 10, emoji: "🤖" },
    { name: "TikTok", unlocked: false, efficiency: 3, cost: 25, emoji: "🎵" },
    { name: "Newsletter", unlocked: false, efficiency: 4, cost: 50, emoji: "📧" },
    { name: "Podcast", unlocked: false, efficiency: 5, cost: 80, emoji: "🎙️" }
  ],
  actions: [],
  milestones: [],
  gameOver: false,
  won: false
};

const ACTIONS = [
  { name: "Personal DM", emoji: "💬", effort: 5, fans: 1, quality: 0.5, desc: "Reach out 1-by-1. Slow but authentic." },
  { name: "Share Story", emoji: "✍️", effort: 10, fans: 3, quality: 1, desc: "Write about your journey. Medium reach." },
  { name: "Build in Public", emoji: "🏗️", effort: 15, fans: 5, quality: 2, desc: "Share wins and losses. High engagement." },
  { name: "Help Someone", emoji: "🤝", effort: 8, fans: 2, quality: 1.5, desc: "Answer questions, solve problems." },
  { name: "Create Content", emoji: "🎨", effort: 20, fans: 8, quality: 2.5, desc: "Video, blog, or tool. High effort, high reward." },
  { name: "Launch on PH", emoji: "🚀", effort: 30, fans: 15, quality: 3, desc: "Product Hunt launch. One-time big boost." }
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
    fans: 0, target: 100, day: 1, maxDays: 60,
    reputation: 0, viralCoeff: 0, contentQuality: 1,
    channels: [
      { name: "Twitter", unlocked: true, efficiency: 1, emoji: "🐦" },
      { name: "Reddit", unlocked: false, efficiency: 2, cost: 10, emoji: "🤖" },
      { name: "TikTok", unlocked: false, efficiency: 3, cost: 25, emoji: "🎵" },
      { name: "Newsletter", unlocked: false, efficiency: 4, cost: 50, emoji: "📧" },
      { name: "Podcast", unlocked: false, efficiency: 5, cost: 80, emoji: "🎙️" }
    ],
    actions: [], milestones: [], gameOver: false, won: false
  });
  
  $('start-screen').classList.remove('active');
  $('win-screen').classList.remove('active');
  $('loss-screen').classList.remove('active');
  
  updateHUD();
  renderGame();
  startLoop();
}

let loopInterval;
function startLoop() {
  if (loopInterval) clearInterval(loopInterval);
  loopInterval = setInterval(() => {
    if (Game.gameOver) { clearInterval(loopInterval); return; }
    tick();
  }, 2000);
}

function tick() {
  // Viral growth: each fan has chance to bring friends
  const unlockedChannels = Game.channels.filter(c => c.unlocked);
  const totalEfficiency = unlockedChannels.reduce((sum, c) => sum + c.efficiency, 0);
  
  if (Game.fans > 0 && Game.viralCoeff > 0) {
    const newFans = Math.floor(Game.fans * Game.viralCoeff * 0.1 * totalEfficiency);
    if (newFans > 0) {
      Game.fans += newFans;
      showFloatingText(`+${newFans} viral fans!`, 'var(--accent-3)');
    }
  }
  
  Game.day++;
  updateHUD();
  checkGameOver();
}

function updateHUD() {
  $('score').textContent = `${Game.fans} fans`;
  $('round').textContent = `Day ${Game.day}/${Game.maxDays}`;
  
  const fanBar = $('fan-bar');
  if (fanBar) {
    fanBar.style.width = Math.min((Game.fans / Game.target) * 100, 100) + '%';
  }
  
  const viralEl = $('viral-display');
  if (viralEl) viralEl.textContent = `Viral: ${Game.viralCoeff.toFixed(1)}x`;
}

function renderGame() {
  const container = $('choices');
  container.innerHTML = '';
  
  // Fan counter
  const counter = document.createElement('div');
  counter.className = 'card animate-fade-in';
  counter.style.textAlign = 'center';
  counter.innerHTML = `
    <div style="font-size:48px;margin-bottom:8px;">👥</div>
    <div style="font-size:36px;font-weight:800;color:var(--accent);">${Game.fans} / ${Game.target}</div>
    <div style="font-size:14px;color:var(--text-dim);">True Fans</div>
    <div class="progress-bar" style="margin-top:12px;">
      <div class="progress-fill" id="fan-bar" style="width:${Math.min((Game.fans / Game.target) * 100, 100)}%"></div>
    </div>
  `;
  container.appendChild(counter);
  
  // Growth actions
  const actionsPanel = document.createElement('div');
  actionsPanel.innerHTML = '<div class="panel-title" style="margin-top:20px;">Get Your First Fans</div>';
  
  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;';
  
  ACTIONS.forEach(action => {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.style.borderTop = '3px solid var(--accent)';
    btn.innerHTML = `
      <div style="font-size:28px;margin-bottom:6px;">${action.emoji}</div>
      <div style="font-weight:700;font-size:13px;">${action.name}</div>
      <div style="font-size:11px;color:var(--text-dim);margin:4px 0;">${action.desc}</div>
      <div style="font-size:12px;">
        <span style="color:var(--success)">+${action.fans} fans</span>
        <span style="color:var(--accent-3)">+${action.quality} quality</span>
      </div>
    `;
    btn.onclick = () => doAction(action);
    grid.appendChild(btn);
  });
  
  actionsPanel.appendChild(grid);
  container.appendChild(actionsPanel);
  
  // Channels
  const channelPanel = document.createElement('div');
  channelPanel.innerHTML = '<div class="panel-title" style="margin-top:20px;">Channels (Reputation: ' + Game.reputation + ')</div>';
  
  const channelGrid = document.createElement('div');
  channelGrid.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
  
  Game.channels.forEach(ch => {
    const badge = document.createElement('button');
    badge.className = 'choice-btn';
    badge.style.opacity = ch.unlocked ? '1' : '0.5';
    badge.innerHTML = `
      <span style="font-size:20px;">${ch.emoji}</span>
      <span style="font-weight:700;">${ch.name}</span>
      ${ch.unlocked ? '<span style="color:var(--success)">✅</span>' : `<span style="color:var(--accent-3)">${ch.cost} rep</span>`}
    `;
    if (!ch.unlocked) {
      badge.onclick = () => unlockChannel(ch);
    }
    channelGrid.appendChild(badge);
  });
  
  channelPanel.appendChild(channelGrid);
  container.appendChild(channelPanel);
  
  // Viral coefficient display
  const viralPanel = document.createElement('div');
  viralPanel.style.cssText = 'text-align:center;margin-top:16px;padding:12px;background:rgba(0,0,0,0.2);border-radius:8px;';
  viralPanel.innerHTML = `
    <div style="font-size:14px;color:var(--text-dim);">Viral Coefficient: <span id="viral-display" style="color:var(--accent);font-weight:700;">${Game.viralCoeff.toFixed(1)}x</span></div>
    <div style="font-size:12px;color:var(--text-dim);margin-top:4px;">${Game.viralCoeff >= 1 ? '🔥 Each fan brings more fans!' : 'Build quality to unlock viral growth'}</div>
  `;
  container.appendChild(viralPanel);
}

function doAction(action) {
  Game.fans += action.fans;
  Game.reputation += action.effort;
  Game.contentQuality += action.quality * 0.1;
  Game.viralCoeff = Math.min(Game.contentQuality * 0.2, 3);
  
  // Milestones
  const milestones = [1, 5, 10, 25, 50, 75, 100];
  milestones.forEach(m => {
    if (Game.fans >= m && !Game.milestones.includes(m)) {
      Game.milestones.push(m);
      showMilestone(m);
    }
  });
  
  showFloatingText(`+${action.fans} fans!`, 'var(--success)');
  updateHUD();
  checkGameOver();
}

function unlockChannel(ch) {
  if (Game.reputation < ch.cost || ch.unlocked) return;
  Game.reputation -= ch.cost;
  ch.unlocked = true;
  showFloatingText(`${ch.emoji} ${ch.name} unlocked!`, 'var(--accent-3)');
  renderGame();
}

function showMilestone(n) {
  const msgs = {
    1: "🎉 Your first fan! The hardest one.",
    5: "📈 Word of mouth starting...",
    10: "🔥 Double digits! Keep going.",
    25: "💫 Quarter way! You're building something real.",
    50: "🚀 Halfway! Momentum is building.",
    75: "⚡ Viral growth kicking in!",
    100: "🏆 100 TRUE FANS! You did it!"
  };
  
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:20%;left:50%;transform:translateX(-50%);z-index:200;text-align:center;pointer-events:none;';
  div.innerHTML = `
    <div style="font-size:32px;font-weight:800;color:var(--accent);text-shadow:0 0 30px rgba(0,255,136,0.5);animation:pulse 1s ease;">${msgs[n]}</div>
  `;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2500);
}

function checkGameOver() {
  if (Game.fans >= Game.target) {
    Game.won = true;
    Game.gameOver = true;
    clearInterval(loopInterval);
    showWin();
  } else if (Game.day >= Game.maxDays) {
    Game.gameOver = true;
    clearInterval(loopInterval);
    showLoss();
  }
}

function showWin() {
  $('win-screen').classList.add('active');
  $('win-reason').textContent = `Reached ${Game.fans} true fans in ${Game.day} days! Viral coefficient: ${Game.viralCoeff.toFixed(1)}x`;
}

function showLoss() {
  $('loss-screen').classList.add('active');
  $('loss-reason').textContent = `Only ${Game.fans} fans in ${Game.day} days. Needed ${Game.target}.`;
  $('loss-tip').textContent = Game.contentQuality < 2
    ? "Focus on quality over quantity. Build in public and help people genuinely."
    : "Unlock more channels and do bigger launches. The compound effect takes time.";
}

function showFloatingText(text, color) {
  const el = document.createElement('div');
  el.className = 'score-pop';
  el.style.color = color;
  el.textContent = text;
  el.style.left = (40 + Math.random() * 20) + '%';
  el.style.top = '35%';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

init();
