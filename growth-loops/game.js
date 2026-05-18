/**
 * Growth Loops — Upgraded
 * YC Lesson: Build sustainable growth, not one-off hacks
 * Puzzle connection game - link acquisition to retention to referral
 */

const Game = {
  score: 0,
  round: 1,
  maxRounds: 10,
  loops: [],
  connections: [],
  nodes: [],
  activeLoop: null,
  gameOver: false,
  won: false,
  selectedNode: null
};

const NODE_TYPES = [
  { type: "acquisition", name: "Acquire", emoji: "🎯", color: "#00ff88", desc: "Get new users" },
  { type: "activation", name: "Activate", emoji: "⚡", color: "#ffcc00", desc: "Users take first key action" },
  { type: "retention", name: "Retain", emoji: "🔒", color: "#ff6600", desc: "Users come back" },
  { type: "revenue", name: "Monetize", emoji: "💰", color: "#ff3366", desc: "Users pay" },
  { type: "referral", name: "Refer", emoji: "🔄", color: "#aa00ff", desc: "Users invite friends" }
];

const CHALLENGES = [
  { name: "Viral Loop", nodes: ["acquisition", "activation", "referral", "acquisition"], bonus: 100, desc: "User invites → new user signs up → activates → invites more" },
  { name: "Sticky Product", nodes: ["acquisition", "activation", "retention", "revenue"], bonus: 80, desc: "Get users, activate them, keep them, monetize" },
  { name: "Paid Growth", nodes: ["revenue", "acquisition", "activation", "revenue"], bonus: 90, desc: "Revenue funds ads → acquire → activate → pay" },
  { name: "Content Loop", nodes: ["acquisition", "retention", "referral", "acquisition"], bonus: 70, desc: "Content brings users → they stay → share → bring more" },
  { name: "Network Effects", nodes: ["activation", "retention", "referral", "acquisition", "activation"], bonus: 120, desc: "Each user makes product better for next user" }
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
    score: 0, round: 1, maxRounds: 10,
    loops: [], connections: [], nodes: [],
    activeLoop: null, gameOver: false, won: false,
    selectedNode: null
  });
  
  $('start-screen').classList.remove('active');
  $('win-screen').classList.remove('active');
  $('loss-screen').classList.remove('active');
  
  generateNodes();
  updateHUD();
  renderGame();
}

function generateNodes() {
  Game.nodes = [];
  const types = NODE_TYPES;
  for (let i = 0; i < 15; i++) {
    const t = types[i % types.length];
    Game.nodes.push({
      id: i,
      ...t,
      x: (i % 5) * 20 + 10 + Math.random() * 10,
      y: Math.floor(i / 5) * 30 + 15 + Math.random() * 10,
      connected: false
    });
  }
  // Shuffle
  Game.nodes.sort(() => Math.random() - 0.5);
}

function updateHUD() {
  $('score').textContent = Game.score;
  $('round').textContent = `Loop ${Game.round}/${Game.maxRounds}`;
  
  const loopsEl = $('loops-display');
  if (loopsEl) loopsEl.textContent = `${Game.loops.length} loops built`;
}

function renderGame() {
  const container = $('choices');
  container.innerHTML = '';
  
  // Current challenge
  const challenge = CHALLENGES[(Game.round - 1) % CHALLENGES.length];
  
  const challengeCard = document.createElement('div');
  challengeCard.className = 'card animate-fade-in';
  challengeCard.innerHTML = `
    <div style="text-align:center;margin-bottom:12px;">
      <span style="font-size:32px;">🎯</span>
      <div style="font-size:20px;font-weight:700;color:var(--accent);margin-top:8px;">${challenge.name}</div>
      <div style="font-size:13px;color:var(--text-dim);margin-top:4px;">${challenge.desc}</div>
    </div>
    <div style="display:flex;justify-content:center;gap:8px;margin-top:12px;">
      ${challenge.nodes.map(n => {
        const nodeType = NODE_TYPES.find(t => t.type === n);
        return `<span style="background:${nodeType.color}22;color:${nodeType.color};padding:4px 10px;border-radius:12px;font-size:12px;font-weight:700;">${nodeType.emoji} ${nodeType.name}</span>`;
      }).join(' → ')}
    </div>
    <div style="text-align:center;margin-top:8px;font-size:12px;color:var(--accent-3);">Bonus: +${challenge.bonus} pts</div>
  `;
  container.appendChild(challengeCard);
  
  // Node grid
  const gridPanel = document.createElement('div');
  gridPanel.innerHTML = '<div class="panel-title" style="margin-top:20px;">Connect the Loop</div>';
  
  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:10px;';
  
  Game.nodes.forEach(node => {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.style.cssText = `text-align:center;padding:12px 8px;border-top:3px solid ${node.color};opacity:${node.connected ? '0.5' : '1'};`;
    btn.innerHTML = `
      <div style="font-size:24px;">${node.emoji}</div>
      <div style="font-size:11px;font-weight:700;margin-top:4px;">${node.name}</div>
    `;
    btn.onclick = () => selectNode(node);
    grid.appendChild(btn);
  });
  
  gridPanel.appendChild(grid);
  container.appendChild(gridPanel);
  
  // Connection status
  if (Game.connections.length > 0) {
    const statusPanel = document.createElement('div');
    statusPanel.style.cssText = 'margin-top:16px;padding:12px;background:rgba(0,0,0,0.2);border-radius:8px;';
    statusPanel.innerHTML = `
      <div style="font-size:12px;color:var(--text-dim);margin-bottom:8px;">Current connection:</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${Game.connections.map(n => `
          <span style="background:${n.color}22;color:${n.color};padding:4px 10px;border-radius:12px;font-size:12px;">
            ${n.emoji} ${n.name}
          </span>
        `).join(' → ')}
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="btn-primary" style="flex:1;padding:10px;font-size:14px;" onclick="submitLoop()">🔗 Submit Loop</button>
        <button class="btn-danger" style="flex:1;padding:10px;font-size:14px;" onclick="resetConnection()">🔄 Reset</button>
      </div>
    `;
    container.appendChild(statusPanel);
  }
  
  // Built loops
  if (Game.loops.length > 0) {
    const loopsPanel = document.createElement('div');
    loopsPanel.innerHTML = '<div class="panel-title" style="margin-top:20px;">Built Loops</div>';
    
    Game.loops.forEach(loop => {
      const badge = document.createElement('div');
      badge.className = 'card';
      badge.style.marginBottom = '8px';
      badge.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:20px;">🔄</span>
          <div style="flex:1;">
            <div style="font-weight:700;">${loop.name}</div>
            <div style="font-size:12px;color:var(--text-dim);">+${loop.score} pts</div>
          </div>
        </div>
      `;
      loopsPanel.appendChild(badge);
    });
    
    container.appendChild(loopsPanel);
  }
}

function selectNode(node) {
  if (node.connected) return;
  
  if (Game.connections.length === 0) {
    Game.connections.push(node);
    showFloatingText(`${node.name} selected`, node.color);
  } else {
    const last = Game.connections[Game.connections.length - 1];
    if (last.id === node.id) return; // Can't connect to self
    
    // Check if connection is valid (different type or same type allowed)
    Game.connections.push(node);
    showFloatingText(`Connected!`, 'var(--success)');
  }
  
  renderGame();
}

function resetConnection() {
  Game.connections = [];
  showFloatingText('Reset', 'var(--text-dim)');
  renderGame();
}

function submitLoop() {
  if (Game.connections.length < 3) {
    showFloatingText('Need at least 3 nodes!', 'var(--danger)');
    return;
  }
  
  const challenge = CHALLENGES[(Game.round - 1) % CHALLENGES.length];
  const nodeTypes = Game.connections.map(n => n.type);
  
  // Check if loop matches challenge
  let matchScore = 0;
  challenge.nodes.forEach((needed, i) => {
    if (nodeTypes.includes(needed)) matchScore += 10;
  });
  
  // Bonus for length
  const lengthBonus = Game.connections.length * 5;
  
  // Check if it's a loop (starts and ends with same type ideally)
  const isLoop = nodeTypes[0] === nodeTypes[nodeTypes.length - 1];
  const loopBonus = isLoop ? 50 : 0;
  
  const totalScore = matchScore + lengthBonus + loopBonus + (matchScore > 30 ? challenge.bonus : 0);
  
  Game.score += totalScore;
  Game.loops.push({
    name: challenge.name,
    score: totalScore,
    nodes: [...Game.connections]
  });
  
  // Mark nodes as used
  Game.connections.forEach(n => { n.connected = true; });
  Game.connections = [];
  
  showFloatingText(`Loop built! +${totalScore} pts`, 'var(--success)');
  
  Game.round++;
  
  // Regenerate if running low
  const availableNodes = Game.nodes.filter(n => !n.connected);
  if (availableNodes.length < 5) {
    generateNodes();
  }
  
  updateHUD();
  checkGameOver();
  if (!Game.gameOver) renderGame();
}

function checkGameOver() {
  if (Game.score >= 500) {
    Game.won = true;
    Game.gameOver = true;
    showWin();
  } else if (Game.round > Game.maxRounds) {
    Game.gameOver = true;
    showLoss();
  }
}

function showWin() {
  $('win-screen').classList.add('active');
  $('win-reason').textContent = `Built ${Game.loops.length} growth loops for ${Game.score} points! You understand sustainable growth.`;
}

function showLoss() {
  $('loss-screen').classList.add('active');
  $('loss-reason').textContent = `Built ${Game.loops.length} loops for ${Game.score} points. Needed 500.`;
  $('loss-tip').textContent = "Connect nodes in a cycle: Acquisition → Activation → Retention → Revenue → Referral → Acquisition. The loop must close!";
}

function showFloatingText(text, color) {
  const el = document.createElement('div');
  el.className = 'score-pop';
  el.style.color = color;
  el.textContent = text;
  el.style.left = '50%';
  el.style.top = '40%';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

init();
