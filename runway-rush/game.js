/**
 * Burn Rate — YC Startup School
 * Tower Defense: Place revenue towers to destroy expenses before they burn your cash
 */

const Game = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  
  // Game state
  month: 1,
  maxMonths: 12,
  cash: 50000,
  revenue: 0,
  expenses: 0,
  
  // Tower defense
  path: [],
  towers: [],
  enemies: [],
  projectiles: [],
  particles: [],
  selectedTower: null,
  waveActive: false,
  waveEnemies: [],
  waveSpawned: 0,
  spawnTimer: 0,
  
  // Map grid
  cols: 12,
  rows: 10,
  cellSize: 0,
  
  // Tower types
  towerTypes: {
    saas: { name: 'SaaS', cost: 5000, damage: 15, range: 3, fireRate: 800, color: '#00E676', emoji: '💻', desc: 'Recurring revenue' },
    consulting: { name: 'Consult', cost: 3000, damage: 40, range: 2.5, fireRate: 1500, color: '#FBBF24', emoji: '💼', desc: 'High damage' },
    content: { name: 'Content', cost: 2000, damage: 8, range: 4, fireRate: 600, color: '#60A5FA', emoji: '📝', desc: 'Fast, cheap' },
    enterprise: { name: 'Enterprise', cost: 10000, damage: 100, range: 2, fireRate: 2500, color: '#A78BFA', emoji: '🏢', desc: 'Slow, massive' },
    cut: { name: 'Cost Cut', cost: 0, damage: 0, range: 2, fireRate: 0, color: '#FB7185', emoji: '✂️', desc: 'Slows enemies', isAura: true }
  },
  
  // Enemy types (expenses)
  enemyTypes: {
    rent: { name: 'Rent', health: 30, speed: 1.2, reward: 2000, color: '#FB7185', emoji: '🏠' },
    servers: { name: 'Servers', health: 15, speed: 2, reward: 500, color: '#60A5FA', emoji: '☁️' },
    salary: { name: 'Salary', health: 50, speed: 0.8, reward: 5000, color: '#FBBF24', emoji: '👤' },
    marketing: { name: 'Marketing', health: 20, speed: 1.5, reward: 1500, color: '#A78BFA', emoji: '📢' },
    legal: { name: 'Legal', health: 40, speed: 0.6, reward: 3000, color: '#F87171', emoji: '⚖️' },
    aws: { name: 'AWS Bill', health: 25, speed: 1.8, reward: 1000, color: '#FB923C', emoji: '📈' }
  },
  
  // Waves (months)
  waves: [
    { month: 1, title: 'The Beginning', enemies: [{ type: 'rent', count: 3 }, { type: 'servers', count: 2 }] },
    { month: 2, title: 'First Hire', enemies: [{ type: 'salary', count: 2 }, { type: 'rent', count: 2 }] },
    { month: 3, title: 'Growth Mode', enemies: [{ type: 'marketing', count: 4 }, { type: 'servers', count: 3 }] },
    { month: 4, title: 'Scaling Up', enemies: [{ type: 'salary', count: 3 }, { type: 'aws', count: 3 }] },
    { month: 5, title: 'The Crunch', enemies: [{ type: 'rent', count: 4 }, { type: 'salary', count: 3 }, { type: 'legal', count: 1 }] },
    { month: 6, title: 'Mid-Year Review', enemies: [{ type: 'aws', count: 5 }, { type: 'marketing', count: 4 }] },
    { month: 7, title: 'Hiring Spree', enemies: [{ type: 'salary', count: 5 }, { type: 'rent', count: 3 }] },
    { month: 8, title: 'Marketing Blitz', enemies: [{ type: 'marketing', count: 6 }, { type: 'aws', count: 4 }] },
    { month: 9, title: 'Legal Troubles', enemies: [{ type: 'legal', count: 3 }, { type: 'salary', count: 4 }] },
    { month: 10, title: 'Server Costs', enemies: [{ type: 'aws', count: 7 }, { type: 'servers', count: 5 }] },
    { month: 11, title: 'The Squeeze', enemies: [{ type: 'rent', count: 5 }, { type: 'salary', count: 5 }, { type: 'aws', count: 4 }] },
    { month: 12, title: 'Final Push', enemies: [{ type: 'salary', count: 6 }, { type: 'legal', count: 3 }, { type: 'aws', count: 5 }, { type: 'marketing', count: 4 }] }
  ],
  
  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Input
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleClick({ clientX: touch.clientX, clientY: touch.clientY });
    });
    
    // Tower selection
    document.querySelectorAll('.tower-card').forEach(card => {
      card.addEventListener('click', () => this.selectTower(card.dataset.tower));
    });
    
    // Buttons
    document.getElementById('start-btn').addEventListener('click', () => this.start());
    document.getElementById('how-btn').addEventListener('click', () => this.showHow());
    document.getElementById('how-back').addEventListener('click', () => this.hideHow());
    document.getElementById('wave-start').addEventListener('click', () => this.startWave());
    document.getElementById('replay-btn').addEventListener('click', () => this.start());
    document.getElementById('try-btn').addEventListener('click', () => this.start());
    
    this.generatePath();
    this.loop();
  },
  
  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height - 140; // Account for HUD and tower bar
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.cellSize = Math.min(this.width / this.cols, this.height / this.rows);
    this.generatePath();
  },
  
  generatePath() {
    // Create a winding path across the grid
    this.path = [];
    const startY = Math.floor(this.rows / 2);
    
    // Simple winding path
    for (let x = 0; x < this.cols; x++) {
      const y = startY + Math.sin(x * 0.8) * 2;
      this.path.push({ x: x + 0.5, y: Math.max(1, Math.min(this.rows - 2, y)) + 0.5 });
    }
  },
  
  start() {
    this.month = 1;
    this.cash = 50000;
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.waveActive = false;
    this.waveEnemies = [];
    this.waveSpawned = 0;
    
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('win-screen').classList.add('hidden');
    document.getElementById('loss-screen').classList.add('hidden');
    
    this.updateHUD();
    this.showWaveScreen();
  },
  
  showWaveScreen() {
    console.log('showWaveScreen called, month:', this.month);
    const wave = this.waves[this.month - 1];
    document.getElementById('wave-number').textContent = `Month ${wave.month}`;
    document.getElementById('wave-title').textContent = wave.title;
    
    const enemyList = wave.enemies.map(e => {
      const type = this.enemyTypes[e.type];
      return `${type.name}: $${type.reward}`;
    }).join(', ');
    document.getElementById('wave-enemies').textContent = enemyList;
    
    const ws = document.getElementById('wave-screen');
    ws.classList.remove('hidden');
    ws.style.display = 'flex';
    console.log('Wave screen should be visible now');
  },
  
  startWave() {
    document.getElementById('wave-screen').classList.add('hidden');
    
    const wave = this.waves[this.month - 1];
    this.waveEnemies = [];
    wave.enemies.forEach(e => {
      for (let i = 0; i < e.count; i++) {
        this.waveEnemies.push(e.type);
      }
    });
    
    this.waveSpawned = 0;
    this.spawnTimer = 0;
    this.waveActive = true;
  },
  
  selectTower(type) {
    document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
    
    if (this.selectedTower === type) {
      this.selectedTower = null;
      return;
    }
    
    const towerType = this.towerTypes[type];
    if (this.cash >= towerType.cost) {
      this.selectedTower = type;
      document.querySelector(`[data-tower="${type}"]`).classList.add('selected');
    }
  },
  
  handleClick(e) {
    if (!this.selectedTower || !this.waveActive) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    // Check if on path
    if (this.isOnPath(col, row)) return;
    
    // Check if occupied
    if (this.towers.some(t => t.col === col && t.row === row)) return;
    
    // Place tower
    const towerType = this.towerTypes[this.selectedTower];
    if (this.cash >= towerType.cost) {
      this.cash -= towerType.cost;
      this.towers.push({
        type: this.selectedTower,
        col,
        row,
        lastFire: 0,
        ...towerType
      });
      
      // Spawn particles
      this.spawnParticles(col * this.cellSize + this.cellSize / 2, row * this.cellSize + this.cellSize / 2, towerType.color);
      
      this.selectedTower = null;
      document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
      this.updateHUD();
    }
  },
  
  isOnPath(col, row) {
    return this.path.some(p => {
      const pc = Math.floor(p.x);
      const pr = Math.floor(p.y);
      return Math.abs(pc - col) <= 0 && Math.abs(pr - row) <= 0;
    });
  },
  
  update(dt) {
    if (!this.waveActive) return;
    
    // Spawn enemies
    this.spawnTimer += dt;
    if (this.spawnTimer > 1000 && this.waveSpawned < this.waveEnemies.length) {
      const type = this.enemyTypes[this.waveEnemies[this.waveSpawned]];
      this.enemies.push({
        ...type,
        pathIndex: 0,
        x: this.path[0].x * this.cellSize,
        y: this.path[0].y * this.cellSize,
        maxHealth: type.health,
        slowTimer: 0
      });
      this.waveSpawned++;
      this.spawnTimer = 0;
    }
    
    // Update enemies
    this.enemies.forEach((enemy, i) => {
      // Move along path
      const target = this.path[Math.min(enemy.pathIndex + 1, this.path.length - 1)];
      const tx = target.x * this.cellSize;
      const ty = target.y * this.cellSize;
      const dx = tx - enemy.x;
      const dy = ty - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      let speed = enemy.speed * this.cellSize * 0.02;
      if (enemy.slowTimer > 0) {
        speed *= 0.5;
        enemy.slowTimer -= dt;
      }
      
      if (dist < 5) {
        enemy.pathIndex++;
        if (enemy.pathIndex >= this.path.length - 1) {
          // Reached end - damage cash
          this.cash -= enemy.reward;
          this.enemies.splice(i, 1);
          this.updateHUD();
          
          if (this.cash <= 0) {
            this.gameOver(false);
          }
          return;
        }
      } else {
        enemy.x += (dx / dist) * speed;
        enemy.y += (dy / dist) * speed;
      }
    });
    
    // Update towers
    const now = Date.now();
    this.towers.forEach(tower => {
      if (tower.isAura) {
        // Cost cut aura slows nearby enemies
        this.enemies.forEach(enemy => {
          const dx = enemy.x - (tower.col * this.cellSize + this.cellSize / 2);
          const dy = enemy.y - (tower.row * this.cellSize + this.cellSize / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < tower.range * this.cellSize) {
            enemy.slowTimer = 100;
          }
        });
        return;
      }
      
      if (now - tower.lastFire < tower.fireRate) return;
      
      // Find target
      let target = null;
      let minDist = Infinity;
      
      this.enemies.forEach(enemy => {
        const dx = enemy.x - (tower.col * this.cellSize + this.cellSize / 2);
        const dy = enemy.y - (tower.row * this.cellSize + this.cellSize / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < tower.range * this.cellSize && dist < minDist) {
          minDist = dist;
          target = enemy;
        }
      });
      
      if (target) {
        tower.lastFire = now;
        this.projectiles.push({
          x: tower.col * this.cellSize + this.cellSize / 2,
          y: tower.row * this.cellSize + this.cellSize / 2,
          target,
          damage: tower.damage,
          speed: 8,
          color: tower.color
        });
      }
    });
    
    // Update projectiles
    this.projectiles.forEach((proj, i) => {
      if (!this.enemies.includes(proj.target)) {
        this.projectiles.splice(i, 1);
        return;
      }
      
      const dx = proj.target.x - proj.x;
      const dy = proj.target.y - proj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 10) {
        proj.target.health -= proj.damage;
        this.spawnParticles(proj.x, proj.y, proj.color, 5);
        
        if (proj.target.health <= 0) {
          this.cash += proj.target.reward;
          this.enemies.splice(this.enemies.indexOf(proj.target), 1);
          this.spawnParticles(proj.target.x, proj.target.y, '#00E676', 15);
          this.updateHUD();
        }
        
        this.projectiles.splice(i, 1);
      } else {
        proj.x += (dx / dist) * proj.speed;
        proj.y += (dy / dist) * proj.speed;
      }
    });
    
    // Update particles
    this.particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      p.vy += 0.1;
      if (p.life <= 0) this.particles.splice(i, 1);
    });
    
    // Check wave complete (only if wave was active)
    if (this.waveActive && this.waveSpawned >= this.waveEnemies.length && this.enemies.length === 0) {
      this.waveActive = false;
      this.month++;
      
      if (this.month > this.maxMonths) {
        this.gameOver(true);
      } else {
        this.showWaveScreen();
      }
    }
    
    // Check loss
    if (this.cash <= 0) {
      this.gameOver(false);
    }
  },
  
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= this.cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * this.cellSize, 0);
      ctx.lineTo(c * this.cellSize, this.height);
      ctx.stroke();
    }
    for (let r = 0; r <= this.rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * this.cellSize);
      ctx.lineTo(this.width, r * this.cellSize);
      ctx.stroke();
    }
    
    // Draw path
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.3)';
    ctx.lineWidth = this.cellSize * 0.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    this.path.forEach((p, i) => {
      const x = p.x * this.cellSize;
      const y = p.y * this.cellSize;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Path glow
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.1)';
    ctx.lineWidth = this.cellSize * 0.8;
    ctx.stroke();
    
    // Draw spawn point
    const start = this.path[0];
    ctx.fillStyle = 'rgba(251, 113, 133, 0.3)';
    ctx.beginPath();
    ctx.arc(start.x * this.cellSize, start.y * this.cellSize, this.cellSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw base (cash pile)
    const end = this.path[this.path.length - 1];
    ctx.fillStyle = 'rgba(0, 230, 118, 0.3)';
    ctx.beginPath();
    ctx.arc(end.x * this.cellSize, end.y * this.cellSize, this.cellSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00E676';
    ctx.font = `${this.cellSize * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💰', end.x * this.cellSize, end.y * this.cellSize);
    
    // Draw towers
    this.towers.forEach(tower => {
      const x = tower.col * this.cellSize + this.cellSize / 2;
      const y = tower.row * this.cellSize + this.cellSize / 2;
      const size = this.cellSize * 0.35;
      
      // Range indicator (subtle)
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, tower.range * this.cellSize, 0, Math.PI * 2);
      ctx.stroke();
      
      // Tower body
      ctx.fillStyle = tower.color;
      ctx.shadowColor = tower.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Emoji
      ctx.fillStyle = '#fff';
      ctx.font = `${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tower.emoji, x, y);
    });
    
    // Draw enemies
    this.enemies.forEach(enemy => {
      const size = this.cellSize * 0.25;
      
      // Health bar
      const barWidth = this.cellSize * 0.5;
      const barHeight = 4;
      const healthPct = enemy.health / enemy.maxHealth;
      
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(enemy.x - barWidth / 2, enemy.y - size - 8, barWidth, barHeight);
      
      ctx.fillStyle = healthPct > 0.5 ? '#00E676' : healthPct > 0.25 ? '#FBBF24' : '#FB7185';
      ctx.fillRect(enemy.x - barWidth / 2, enemy.y - size - 8, barWidth * healthPct, barHeight);
      
      // Enemy body
      ctx.fillStyle = enemy.color;
      ctx.shadowColor = enemy.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Emoji
      ctx.fillStyle = '#fff';
      ctx.font = `${size * 1.2}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(enemy.emoji, enemy.x, enemy.y);
    });
    
    // Draw projectiles
    this.projectiles.forEach(proj => {
      ctx.fillStyle = proj.color;
      ctx.shadowColor = proj.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    
    // Draw particles
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    
    // Placement preview
    if (this.selectedTower) {
      // This would need mouse position tracking
    }
  },
  
  spawnParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 2,
        life: 1,
        color,
        size: Math.random() * 3 + 1
      });
    }
  },
  
  updateHUD() {
    const runway = Math.floor(this.cash / 8000); // Approximate
    document.getElementById('runway').textContent = runway > 99 ? '∞' : Math.max(0, runway);
    document.getElementById('cash').textContent = '$' + (this.cash / 1000).toFixed(0) + 'K';
    document.getElementById('burn').textContent = '$8K';
    document.getElementById('month-text').textContent = `Month ${this.month} of ${this.maxMonths}`;
    document.getElementById('month-fill').style.width = (this.month / this.maxMonths * 100) + '%';
    
    // Update tower affordability
    document.querySelectorAll('.tower-card').forEach(card => {
      const type = card.dataset.tower;
      const cost = this.towerTypes[type].cost;
      if (this.cash < cost) {
        card.classList.add('disabled');
      } else {
        card.classList.remove('disabled');
      }
    });
    
    // Color coding
    const runwayStat = document.getElementById('runway-stat');
    runwayStat.classList.remove('danger', 'warning');
    if (runway <= 2) runwayStat.classList.add('danger');
    else if (runway <= 4) runwayStat.classList.add('warning');
  },
  
  gameOver(won) {
    this.waveActive = false;
    
    if (won) {
      document.getElementById('final-cash').textContent = '$' + (this.cash / 1000).toFixed(0) + 'K';
      document.getElementById('final-towers').textContent = this.towers.length;
      document.getElementById('win-screen').classList.remove('hidden');
    } else {
      document.getElementById('loss-reason').textContent = `Your runway ran out in month ${this.month}.`;
      
      let tip = 'Build recurring revenue early. SaaS towers compound over time.';
      const hasSaaS = this.towers.some(t => t.type === 'saas');
      const hasCut = this.towers.some(t => t.type === 'cut');
      
      if (!hasSaaS) tip = 'You didn\'t build any SaaS revenue. Recurring revenue is the foundation of runway.';
      else if (!hasCut) tip = 'You never cut costs. Cost Cut towers slow enemies and buy you time.';
      
      document.getElementById('loss-tip').textContent = tip;
      document.getElementById('loss-screen').classList.remove('hidden');
    }
  },
  
  showHow() {
    document.getElementById('how-screen').classList.remove('hidden');
  },
  
  hideHow() {
    document.getElementById('how-screen').classList.add('hidden');
  },
  
  loop() {
    const now = Date.now();
    const dt = now - (this.lastTime || now);
    this.lastTime = now;
    
    this.update(dt);
    this.draw();
    
    requestAnimationFrame(() => this.loop());
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => Game.init());
