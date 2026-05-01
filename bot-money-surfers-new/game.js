const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const LANE_WIDTH = 100;
const PLAYER_Y = 0.8;
const HORIZON_Y = 0.25;
const COLLISION_Y_TOLERANCE = 55;

// MoneyBot mascot image
const playerImg = new Image();
playerImg.src = '../../moneybot-code/references/mascot/canonical-operator-reference.png';

// Sound effects (using Web Audio API for generated sounds)
const AudioManager = {
  ctx: null,
  
  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },
  
  playCoin() {
    if (!this.ctx) this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  },
  
  playTrainWarning() {
    if (!this.ctx) this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  },
  
  playGameOver() {
    if (!this.ctx) this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  },
  
  playRunwayLow() {
    if (!this.ctx) this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
};

// Floating text manager
const FloatingText = {
  items: [],
  
  add(x, y, text, type) {
    const el = document.createElement('div');
    el.className = `floating-text ${type}`;
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    
    setTimeout(() => el.remove(), 1000);
  }
};

const game = {
  state: 'menu',
  score: 0,
  coins: 0,
  runway: 100,
  maxRunway: 100,
  lane: 1,
  targetLane: 1,
  playerX: 0,
  speed: 8,
  items: [],
  particles: [],
  cashflowStreak: 0,
  lastRunwayWarning: 0,
  
  resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.playerX = this.getLaneX(1);
  },
  
  getLaneX(lane) {
    const startX = (canvas.width - LANE_WIDTH * 3) / 2;
    return startX + lane * LANE_WIDTH + LANE_WIDTH / 2;
  },
  
  start() {
    this.state = 'playing';
    this.score = 0;
    this.coins = 0;
    this.runway = 30; // Start with 30 months of runway
    this.maxRunway = 100;
    this.lane = 1;
    this.targetLane = 1;
    this.playerX = this.getLaneX(1);
    this.speed = 8;
    this.items = [];
    this.particles = [];
    this.cashflowStreak = 0;
    this.lastRunwayWarning = 0;
    
    AudioManager.init();
    
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    
    this.updateUI();
    this.loop();
  },
  
  restart() {
    this.start();
  },
  
  gameOver(reason) {
    this.state = 'gameover';
    AudioManager.playGameOver();
    
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('finalCoins').textContent = this.coins;
    document.getElementById('finalRunway').textContent = Math.floor(this.runway);
    document.getElementById('gameOverReason').textContent = reason;
    
    // Set tip based on performance
    const tipEl = document.getElementById('gameOverTip');
    if (this.coins < 10) {
      tipEl.textContent = "Collect more income! Each coin extends your runway.";
    } else if (this.runway < 10) {
      tipEl.textContent = "Watch your runway! Avoid expenses (trains) to preserve cash.";
    } else {
      tipEl.textContent = "Great cashflow! Keep that streak going to build wealth.";
    }
    
    document.getElementById('gameOverScreen').classList.remove('hidden');
  },
  
  move(dir) {
    if (this.state !== 'playing') return;
    const newLane = this.targetLane + dir;
    if (newLane >= 0 && newLane <= 2) {
      this.targetLane = newLane;
    }
  },
  
  spawn() {
    const lane = Math.floor(Math.random() * 3);
    // Trains are expenses, coins are income
    const isTrain = Math.random() > 0.55; // Slightly more coins than trains
    this.items.push({
      type: isTrain ? 'train' : 'coin',
      lane: lane,
      y: canvas.height * HORIZON_Y - 80,
      collected: false,
      warned: false
    });
  },
  
  update() {
    if (this.state !== 'playing') return;
    
    this.score++;
    this.speed = Math.min(18, 8 + this.score / 400);
    
    // Runway naturally depletes over time (burn rate)
    this.runway -= 0.03;
    
    // Warning when runway is low
    if (this.runway < 10 && Date.now() - this.lastRunwayWarning > 2000) {
      AudioManager.playRunwayLow();
      this.lastRunwayWarning = Date.now();
    }
    
    // Game over if runway hits zero
    if (this.runway <= 0) {
      this.runway = 0;
      this.gameOver("Runway depleted — cashflow couldn't keep up!");
      return;
    }
    
    // Smooth lane movement
    const targetX = this.getLaneX(this.targetLane);
    this.playerX += (targetX - this.playerX) * 0.2;
    this.lane = this.targetLane;
    
    // Spawn items
    if (Math.random() < 0.025) this.spawn();

    const playerY = canvas.height * PLAYER_Y;
    
    // Update items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.y += this.speed;
      
      const pos = this.getPos(item.lane, item.y);
      
      // Warning sound for trains getting close
      if (item.type === 'train' && !item.warned && item.lane === this.lane) {
        const distToPlayer = Math.abs(item.y - playerY);
        if (distToPlayer < 200 && distToPlayer > 100) {
          AudioManager.playTrainWarning();
          item.warned = true;
        }
      }
      
      // Collision detection
      const sameLane = item.lane === this.lane;
      const atPlayerY = Math.abs(item.y - playerY) <= COLLISION_Y_TOLERANCE;
      
      if (sameLane && atPlayerY && !item.collected) {
        if (item.type === 'train') {
          // Hit an expense — big runway penalty
          this.runway -= 15;
          this.cashflowStreak = 0;
          AudioManager.playTrainWarning();
          FloatingText.add(pos.x, pos.y - 50, "-15 months!", "expense");
          
          if (this.runway <= 0) {
            this.runway = 0;
            this.gameOver("Major expense hit — runway collapsed!");
            return;
          }
        } else {
          // Collected income — extend runway
          item.collected = true;
          this.coins++;
          this.cashflowStreak++;
          
          // More runway for streaks
          const streakBonus = Math.min(this.cashflowStreak * 0.5, 5);
          const incomeValue = 3 + streakBonus;
          this.runway = Math.min(this.maxRunway, this.runway + incomeValue);
          
          AudioManager.playCoin();
          this.createParticles(pos.x, pos.y);
          
          const streakText = this.cashflowStreak > 2 ? ` ${this.cashflowStreak}x streak!` : '';
          FloatingText.add(pos.x, pos.y - 50, `+${incomeValue.toFixed(1)} months${streakText}`, "income");
        }
      }
      
      if (item.y > canvas.height + 200 || item.collected) {
        this.items.splice(i, 1);
      }
    }
    
    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.5;
      p.life -= 0.05;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    
    this.updateUI();
  },
  
  updateUI() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('coins').textContent = this.coins;
    document.getElementById('runwayValue').textContent = Math.floor(this.runway) + ' months';
    
    const runwayPercent = (this.runway / this.maxRunway) * 100;
    const runwayFill = document.getElementById('runwayFill');
    runwayFill.style.width = Math.min(100, runwayPercent) + '%';
    
    // Color shift based on runway health
    if (runwayPercent > 50) {
      runwayFill.style.background = 'linear-gradient(90deg, #00E676 0%, #00C853 100%)';
    } else if (runwayPercent > 25) {
      runwayFill.style.background = 'linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%)';
    } else {
      runwayFill.style.background = 'linear-gradient(90deg, #FB7185 0%, #EF4444 100%)';
    }
  },
  
  getPos(lane, y) {
    const horizonY = canvas.height * HORIZON_Y;
    const playerY = canvas.height * PLAYER_Y;
    const t = Math.max(0, Math.min(1, (y - horizonY) / (playerY - horizonY)));
    const scale = 0.3 + t * 0.7;
    const laneX = this.getLaneX(lane);
    const centerX = canvas.width / 2;
    const screenX = centerX + (laneX - centerX) * scale;
    return { x: screenX, y: y, scale: scale };
  },
  
  createParticles(x, y) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 12 - 6,
        life: 1,
        color: Math.random() > 0.5 ? '#00E676' : '#FBBF24'
      });
    }
  },
  
  draw() {
    // Background
    ctx.fillStyle = '#07111F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const horizonY = canvas.height * HORIZON_Y;
    
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, horizonY);
    grad.addColorStop(0, '#0B1628');
    grad.addColorStop(1, '#1a2a3a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, horizonY);
    
    // City skyline
    this.drawCity(horizonY);
    
    // Track
    this.drawTrack(horizonY);
    
    // Items (sorted by Y for depth)
    this.items.sort((a, b) => a.y - b.y);
    this.items.forEach(item => {
      if (!item.collected) {
        const pos = this.getPos(item.lane, item.y);
        if (pos.y > horizonY - 50) {
          if (item.type === 'train') {
            this.drawTrain(pos.x, pos.y, pos.scale);
          } else {
            this.drawCoin(pos.x, pos.y, pos.scale);
          }
        }
      }
    });
    
    // Player
    this.drawPlayer();
    
    // Particles
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  },
  
  drawCity(y) {
    const buildings = [
      { x: 0.05, w: 0.08, h: 0.35 },
      { x: 0.12, w: 0.06, h: 0.5 },
      { x: 0.78, w: 0.1, h: 0.4 },
      { x: 0.88, w: 0.07, h: 0.55 }
    ];
    
    buildings.forEach(b => {
      const x = b.x * canvas.width;
      const w = b.w * canvas.width;
      const h = b.h * y;
      
      // Building
      ctx.fillStyle = '#0B1628';
      ctx.fillRect(x, y - h, w, h);
      
      // Windows
      ctx.fillStyle = 'rgba(0, 230, 118, 0.15)';
      for (let wy = y - h + 20; wy < y - 15; wy += 35) {
        for (let wx = x + 10; wx < x + w - 8; wx += 20) {
          if ((wx + wy) % 60 < 35) ctx.fillRect(wx, wy, 8, 12);
        }
      }
      
      // Roof detail
      ctx.fillStyle = 'rgba(0, 230, 118, 0.3)';
      ctx.fillRect(x + w * 0.2, y - h - 5, w * 0.6, 5);
    });
  },
  
  drawTrack(y) {
    const playerY = canvas.height * PLAYER_Y;
    const w = LANE_WIDTH * 3;
    
    // Track surface
    ctx.fillStyle = '#0B1628';
    ctx.beginPath();
    ctx.moveTo(canvas.width/2 - w*0.2, y);
    ctx.lineTo(canvas.width/2 + w*0.2, y);
    ctx.lineTo(canvas.width/2 + w*0.8, playerY);
    ctx.lineTo(canvas.width/2 - w*0.8, playerY);
    ctx.closePath();
    ctx.fill();
    
    // Lane lines
    ctx.strokeStyle = 'rgba(0, 230, 118, 0.2)';
    ctx.lineWidth = 2;
    for (let i = 1; i < 3; i++) {
      const t = i / 3;
      const x1 = canvas.width/2 - w*0.2 + t * w*0.4;
      const x2 = canvas.width/2 - w*0.8 + t * w*1.6;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, playerY);
      ctx.stroke();
    }
    
    // Third rail (danger)
    ctx.strokeStyle = '#FB7185';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width/2 - w*0.22, y);
    ctx.lineTo(canvas.width/2 - w*0.85, playerY);
    ctx.stroke();
  },
  
  drawTrain(x, y, s) {
    const w = 90 * s;
    const h = 140 * s;
    
    // Train body
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x - w/2, y - h, w, h);
    
    // Window
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(x - w/2 + w*0.1, y - h + h*0.1, w*0.8, h*0.2);
    
    // Stripe
    ctx.fillStyle = '#FB7185';
    ctx.fillRect(x - w/2, y - h*0.4, w, h*0.05);
    
    // Headlights
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(x - w*0.25, y - h*0.05, 10*s, 0, Math.PI*2);
    ctx.arc(x + w*0.25, y - h*0.05, 10*s, 0, Math.PI*2);
    ctx.fill();
    
    // Expense label
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${14*s}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('EXPENSE', x, y - h*0.55);
  },
  
  drawCoin(x, y, s) {
    const size = 32 * s;
    const rot = Date.now() / 150;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(Math.abs(Math.sin(rot)), 1);
    
    // Outer ring
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.75, 0, Math.PI * 2);
    ctx.fill();
    
    // $ symbol
    ctx.fillStyle = '#92400E';
    ctx.font = `bold ${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 2);
    
    ctx.restore();
  },
  
  drawPlayer() {
    const y = canvas.height * PLAYER_Y;
    const size = 70;
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(this.playerX, y + 30, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Player (MoneyBot mascot)
    if (playerImg.complete && playerImg.naturalWidth > 0) {
      ctx.drawImage(playerImg, this.playerX - size/2, y - size - 10, size, size);
    } else {
      // Fallback: MoneyBot green square with face
      ctx.fillStyle = '#00E676';
      ctx.fillRect(this.playerX - size/2, y - size, size, size);
      
      // Eyes
      ctx.fillStyle = '#07111F';
      ctx.fillRect(this.playerX - 15, y - size + 20, 10, 10);
      ctx.fillRect(this.playerX + 5, y - size + 20, 10, 10);
      
      // Smile
      ctx.beginPath();
      ctx.arc(this.playerX, y - size + 35, 15, 0.2, Math.PI - 0.2);
      ctx.strokeStyle = '#07111F';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  },
  
  loop() {
    if (this.state !== 'playing') return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
};

// Initialize
game.resize();
window.addEventListener('resize', () => game.resize());

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') game.move(-1);
  if (e.key === 'ArrowRight') game.move(1);
});

// Touch controls
let touchStartX = 0;
canvas.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 40) game.move(dx > 0 ? 1 : -1);
}, { passive: true });

// Prevent zoom/scroll on mobile
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());
