const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const LANE_WIDTH = 100;
const PLAYER_Y = 0.8;
const HORIZON_Y = 0.25;
const COLLISION_Y_TOLERANCE = 55;

// MoneyBot mascot image
const playerImg = new Image();
playerImg.src = '../../moneybot-code/references/mascot/canonical-operator-reference.png';

// Achievement definitions
const ACHIEVEMENTS = {
  first100: { id: 'first100', name: 'Century Club', desc: 'Collect 100 coins', icon: '🪙', condition: (g) => g.coins >= 100 },
  streak10: { id: 'streak10', name: 'Hot Streak', desc: '10x combo streak', icon: '🔥', condition: (g) => g.cashflowStreak >= 10 },
  marathon: { id: 'marathon', name: 'Marathon Runner', desc: 'Travel 1000 distance', icon: '🏃', condition: (g) => g.score >= 1000 },
  saver: { id: 'saver', name: 'Smart Saver', desc: 'Reach 80 months runway', icon: '🏦', condition: (g) => g.runway >= 80 },
  survivor: { id: 'survivor', name: 'Survivor', desc: 'Survive 60 seconds', icon: '⏱️', condition: (g) => g.survivalTime >= 60 },
  powerUser: { id: 'powerUser', name: 'Power Player', desc: 'Use 3 power-ups in one run', icon: '⚡', condition: (g) => g.powerUpsUsed >= 3 }
};

// Financial tips
const MONEY_TIPS = [
  "Emergency funds protect against unexpected expenses!",
  "Cash flow is king — track what comes in and out.",
  "The 50/30/20 rule: 50% needs, 30% wants, 20% save.",
  "Compound interest is the 8th wonder of the world.",
  "Pay yourself first — save before spending.",
  "Avoid lifestyle creep as income grows.",
  "Diversification reduces risk.",
  "Time in the market beats timing the market.",
  "Your runway = months you can survive without income.",
  "Small daily savings add up to big results!",
  "Debt with high interest? Pay it off first.",
  "Invest in yourself — skills increase earning power."
];

// Sound effects and music (Web Audio API)
const AudioManager = {
  ctx: null,
  musicOscillators: [],
  isMusicPlaying: false,
  masterGain: null,
  
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4;
      this.masterGain.connect(this.ctx.destination);
    }
  },
  
  playCoin() {
    if (!this.ctx) this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  },
  
  playPowerUp() {
    if (!this.ctx) this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  },
  
  playShieldBreak() {
    if (!this.ctx) this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  },
  
  playTrainWarning() {
    if (!this.ctx) this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
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
    gain.connect(this.masterGain);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
    this.stopMusic();
  },
  
  playRunwayLow() {
    if (!this.ctx) this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  },
  
  playLevelUp() {
    if (!this.ctx) this.init();
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  },
  
  startMusic() {
    if (this.isMusicPlaying || !this.ctx) return;
    this.isMusicPlaying = true;
    this.playMusicLoop();
  },
  
  stopMusic() {
    this.isMusicPlaying = false;
    this.musicOscillators.forEach(osc => {
      try { osc.stop(); } catch(e) {}
    });
    this.musicOscillators = [];
  },
  
  playMusicLoop() {
    if (!this.isMusicPlaying) return;
    const now = this.ctx.currentTime;
    const baseFreq = 110; // A2
    const notes = [0, 4, 7, 12, 7, 4, 0, -5]; // Simple arpeggio pattern
    
    notes.forEach((semitone, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      
      const freq = baseFreq * Math.pow(2, semitone / 12);
      osc.frequency.value = freq;
      osc.type = 'triangle';
      
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      
      gain.gain.setValueAtTime(0, now + i * 0.25);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.25 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.25 + 0.2);
      
      osc.start(now + i * 0.25);
      osc.stop(now + i * 0.25 + 0.25);
      this.musicOscillators.push(osc);
    });
    
    setTimeout(() => this.playMusicLoop(), 2000);
  }
};

// Haptic feedback for mobile
const Haptics = {
  light() {
    if (navigator.vibrate) navigator.vibrate(10);
  },
  medium() {
    if (navigator.vibrate) navigator.vibrate(20);
  },
  heavy() {
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
  },
  coin() {
    if (navigator.vibrate) navigator.vibrate(5);
  },
  powerUp() {
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
  }
};

// Screen shake effect
const ScreenShake = {
  intensity: 0,
  decay: 0.9,
  
  add(intensity) {
    this.intensity = Math.min(this.intensity + intensity, 20);
  },
  
  update() {
    this.intensity *= this.decay;
    if (this.intensity < 0.5) this.intensity = 0;
  },
  
  getOffset() {
    if (this.intensity === 0) return { x: 0, y: 0 };
    return {
      x: (Math.random() - 0.5) * this.intensity,
      y: (Math.random() - 0.5) * this.intensity
    };
  }
};

// Floating text manager
const FloatingText = {
  items: [],
  
  add(x, y, text, type, scale = 1) {
    const el = document.createElement('div');
    el.className = `floating-text ${type}`;
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.transform = `scale(${scale})`;
    document.body.appendChild(el);
    
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = `scale(${scale * 1.3}) translateY(-40px)`;
      setTimeout(() => el.remove(), 300);
    }, 800);
  }
};

// Particle system
class ParticleSystem {
  constructor() {
    this.particles = [];
  }
  
  emit(x, y, count, type) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * (type === 'explosion' ? 15 : 8),
        vy: -Math.random() * (type === 'explosion' ? 12 : 8) - 3,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        size: 3 + Math.random() * 5,
        color: this.getColor(type),
        type
      });
    }
  }
  
  getColor(type) {
    const colors = {
      coin: ['#FBBF24', '#F59E0B', '#FCD34D'],
      income: ['#00E676', '#00C853', '#69F0AE'],
      expense: ['#FB7185', '#EF4444', '#DC2626'],
      shield: ['#60A5FA', '#3B82F6', '#93C5FD'],
      multiplier: ['#A78BFA', '#8B5CF6', '#C4B5FD'],
      magnet: ['#F472B6', '#EC4899', '#FBCFE8'],
      explosion: ['#FBBF24', '#EF4444', '#F59E0B']
    };
    const palette = colors[type] || colors.coin;
    return palette[Math.floor(Math.random() * palette.length)];
  }
  
  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4;
      p.vx *= 0.98;
      p.life -= p.decay;
      
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }
  
  draw(ctx) {
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
}

// Background parallax layers
class ParallaxBackground {
  constructor() {
    this.layers = [
      { speed: 0.1, offset: 0, items: this.generateBuildings(15, 0.3, 0.6) },
      { speed: 0.3, offset: 0, items: this.generateBuildings(10, 0.4, 0.8) },
      { speed: 0.6, offset: 0, items: this.generateBuildings(6, 0.5, 1.0) }
    ];
    this.stars = this.generateStars(50);
  }
  
  generateBuildings(count, minH, maxH) {
    const buildings = [];
    let x = 0;
    for (let i = 0; i < count; i++) {
      const width = 30 + Math.random() * 60;
      buildings.push({
        x: x,
        width: width,
        height: minH + Math.random() * (maxH - minH),
        windows: Math.random() > 0.3,
        color: `hsl(${210 + Math.random() * 30}, ${20 + Math.random() * 20}%, ${10 + Math.random() * 15}%)`
      });
      x += width + 5 + Math.random() * 20;
    }
    return buildings;
  }
  
  generateStars(count) {
    return Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random() * 0.6,
      size: 0.5 + Math.random() * 1.5,
      twinkle: Math.random() * Math.PI * 2
    }));
  }
  
  update(speed) {
    this.layers.forEach(layer => {
      layer.offset -= speed * layer.speed;
      const totalWidth = layer.items.reduce((sum, b) => sum + b.width + 25, 0);
      if (Math.abs(layer.offset) > totalWidth / 2) {
        layer.offset = 0;
      }
    });
  }
  
  draw(ctx, canvas) {
    const horizonY = canvas.height * HORIZON_Y;
    
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, horizonY);
    grad.addColorStop(0, '#050a12');
    grad.addColorStop(0.5, '#0B1628');
    grad.addColorStop(1, '#1a2a3a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, horizonY);
    
    // Stars
    const time = Date.now() / 1000;
    this.stars.forEach(star => {
      const twinkle = 0.5 + 0.5 * Math.sin(time * 2 + star.twinkle);
      ctx.globalAlpha = twinkle * 0.8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x * canvas.width, star.y * horizonY, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    // Moon
    ctx.fillStyle = 'rgba(255, 255, 230, 0.9)';
    ctx.beginPath();
    ctx.arc(canvas.width * 0.8, horizonY * 0.3, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 230, 0.2)';
    ctx.beginPath();
    ctx.arc(canvas.width * 0.8, horizonY * 0.3, 45, 0, Math.PI * 2);
    ctx.fill();
    
    // Building layers
    this.layers.forEach((layer, layerIndex) => {
      const alpha = 0.3 + layerIndex * 0.25;
      const scale = 0.5 + layerIndex * 0.25;
      
      layer.items.forEach(b => {
        const x = b.x + layer.offset + canvas.width / 2;
        const w = b.width * scale;
        const h = b.height * horizonY * scale;
        
        if (x + w < 0 || x > canvas.width) return;
        
        // Building body
        ctx.fillStyle = b.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(x, horizonY - h, w, h);
        
        // Windows
        if (b.windows && layerIndex > 0) {
          ctx.fillStyle = 'rgba(0, 230, 118, 0.2)';
          for (let wy = horizonY - h + 10; wy < horizonY - 10; wy += 20 * scale) {
            for (let wx = x + 5; wx < x + w - 5; wx += 15 * scale) {
              if ((wx + wy) % 50 < 30) {
                ctx.fillRect(wx, wy, 6 * scale, 8 * scale);
              }
            }
          }
        }
        
        // Roof detail
        ctx.fillStyle = 'rgba(0, 230, 118, 0.15)';
        ctx.fillRect(x + w * 0.2, horizonY - h - 3, w * 0.6, 3);
      });
    });
    
    ctx.globalAlpha = 1;
  }
}

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
  baseSpeed: 8,
  items: [],
  cashflowStreak: 0,
  lastRunwayWarning: 0,
  level: 1,
  survivalTime: 0,
  startTime: 0,
  powerUpsUsed: 0,
  achievements: new Set(),
  unlockedAchievements: [],
  currentTip: '',
  lastTipTime: 0,
  
  // Power-up states
  activePowerUps: {
    shield: 0,
    multiplier: 0,
    magnet: 0
  },
  
  // Game systems
  particles: new ParticleSystem(),
  background: new ParallaxBackground(),
  
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
    this.runway = 30;
    this.maxRunway = 100;
    this.lane = 1;
    this.targetLane = 1;
    this.playerX = this.getLaneX(1);
    this.speed = 8;
    this.baseSpeed = 8;
    this.items = [];
    this.cashflowStreak = 0;
    this.lastRunwayWarning = 0;
    this.level = 1;
    this.survivalTime = 0;
    this.startTime = Date.now();
    this.powerUpsUsed = 0;
    this.unlockedAchievements = [];
    this.currentTip = MONEY_TIPS[0];
    this.lastTipTime = Date.now();
    
    this.activePowerUps = { shield: 0, multiplier: 0, magnet: 0 };
    this.particles = new ParticleSystem();
    
    AudioManager.init();
    AudioManager.startMusic();
    
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('pauseScreen').classList.add('hidden');
    document.getElementById('tutorialScreen').classList.add('hidden');
    
    this.updateUI();
    this.loop();
  },
  
  restart() {
    this.start();
  },
  
  pause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      AudioManager.stopMusic();
      document.getElementById('pauseScreen').classList.remove('hidden');
    }
  },
  
  resume() {
    if (this.state === 'paused') {
      this.state = 'playing';
      AudioManager.startMusic();
      document.getElementById('pauseScreen').classList.add('hidden');
      this.loop();
    }
  },
  
  gameOver(reason) {
    this.state = 'gameover';
    AudioManager.playGameOver();
    Haptics.heavy();
    
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
    
    // Show achievements earned
    const achievementsEl = document.getElementById('achievementsEarned');
    if (this.unlockedAchievements.length > 0) {
      achievementsEl.innerHTML = this.unlockedAchievements.map(a => 
        `<div class="achievement-badge"><span class="achievement-icon">${a.icon}</span><span>${a.name}</span></div>`
      ).join('');
      achievementsEl.style.display = 'flex';
    } else {
      achievementsEl.style.display = 'none';
    }
    
    document.getElementById('gameOverScreen').classList.remove('hidden');
  },
  
  move(dir) {
    if (this.state !== 'playing') return;
    const newLane = this.targetLane + dir;
    if (newLane >= 0 && newLane <= 2) {
      this.targetLane = newLane;
      Haptics.light();
    }
  },
  
  spawn() {
    const lane = Math.floor(Math.random() * 3);
    const rand = Math.random();
    
    // Determine item type with level-based difficulty
    let type;
    const trainChance = 0.4 + (this.level * 0.02); // More trains at higher levels
    
    if (rand < 0.08) {
      // Power-up (8% chance)
      const powerUpTypes = ['shield', 'multiplier', 'magnet'];
      type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    } else if (rand < trainChance) {
      type = 'train';
    } else {
      type = 'coin';
    }
    
    this.items.push({
      type,
      lane,
      y: canvas.height * HORIZON_Y - 80,
      collected: false,
      warned: false
    });
  },
  
  checkAchievements() {
    Object.values(ACHIEVEMENTS).forEach(ach => {
      if (!this.achievements.has(ach.id) && ach.condition(this)) {
        this.achievements.add(ach.id);
        this.unlockedAchievements.push(ach);
        FloatingText.add(canvas.width / 2, canvas.height / 2, `🏆 ${ach.name}!`, 'achievement', 1.5);
        Haptics.powerUp();
        AudioManager.playPowerUp();
      }
    });
  },
  
  update() {
    if (this.state !== 'playing') return;
    
    this.score++;
    this.survivalTime = (Date.now() - this.startTime) / 1000;
    
    // Level progression
    const newLevel = 1 + Math.floor(this.score / 500);
    if (newLevel > this.level) {
      this.level = newLevel;
      this.baseSpeed = Math.min(18, 8 + this.level * 1.5);
      AudioManager.playLevelUp();
      FloatingText.add(canvas.width / 2, canvas.height / 3, `LEVEL ${this.level}!`, 'level', 2);
      Haptics.powerUp();
    }
    
    // Speed increases with level and score
    this.speed = Math.min(22, this.baseSpeed + this.score / 600);
    
    // Update background parallax
    this.background.update(this.speed * 0.1);
    
    // Runway naturally depletes (burn rate)
    const burnRate = 0.025 + (this.level * 0.005);
    this.runway -= burnRate;
    
    // Update power-up timers
    Object.keys(this.activePowerUps).forEach(key => {
      if (this.activePowerUps[key] > 0) {
        this.activePowerUps[key] -= 1/60;
        if (this.activePowerUps[key] <= 0) {
          this.activePowerUps[key] = 0;
        }
      }
    });
    
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
    
    // Spawn items (frequency increases with level)
    const spawnRate = 0.02 + (this.level * 0.003);
    if (Math.random() < spawnRate) this.spawn();

    const playerY = canvas.height * PLAYER_Y;
    const magnetRange = 150;
    
    // Update items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.y += this.speed;
      
      // Magnet effect pulls coins toward player
      if (this.activePowerUps.magnet > 0 && item.type === 'coin' && !item.collected) {
        const pos = this.getPos(item.lane, item.y);
        const dx = this.playerX - pos.x;
        const dy = playerY - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < magnetRange && dist > 30) {
          item.lane += (this.lane - item.lane) * 0.1;
          item.y += (playerY - item.y) * 0.1;
        }
      }
      
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
      const sameLane = Math.abs(item.lane - this.lane) < 0.5;
      const atPlayerY = Math.abs(item.y - playerY) <= COLLISION_Y_TOLERANCE;
      
      if (sameLane && atPlayerY && !item.collected) {
        if (item.type === 'train') {
          // Hit an expense
          if (this.activePowerUps.shield > 0) {
            // Shield absorbs the hit
            this.activePowerUps.shield = 0;
            AudioManager.playShieldBreak();
            Haptics.heavy();
            ScreenShake.add(10);
            FloatingText.add(pos.x, pos.y - 50, "SHIELD BROKEN!", "shield");
            this.particles.emit(pos.x, pos.y, 20, 'explosion');
          } else {
            this.runway -= 15;
            this.cashflowStreak = 0;
            AudioManager.playTrainWarning();
            Haptics.heavy();
            ScreenShake.add(15);
            FloatingText.add(pos.x, pos.y - 50, "-15 months!", "expense");
            this.particles.emit(pos.x, pos.y, 15, 'expense');
            
            if (this.runway <= 0) {
              this.runway = 0;
              this.gameOver("Major expense hit — runway collapsed!");
              return;
            }
          }
          item.collected = true;
        } else if (['shield', 'multiplier', 'magnet'].includes(item.type)) {
          // Power-up collected
          item.collected = true;
          this.powerUpsUsed++;
          this.activePowerUps[item.type] = 10; // 10 seconds
          AudioManager.playPowerUp();
          Haptics.powerUp();
          FloatingText.add(pos.x, pos.y - 50, `${item.type.toUpperCase()} ACTIVATED!`, item.type);
          this.particles.emit(pos.x, pos.y, 25, item.type);
        } else {
          // Collected income
          item.collected = true;
          this.coins++;
          this.cashflowStreak++;
          
          // Multiplier doubles income value
          const multiplier = this.activePowerUps.multiplier > 0 ? 2 : 1;
          const streakBonus = Math.min(this.cashflowStreak * 0.5, 5);
          const incomeValue = (3 + streakBonus) * multiplier;
          this.runway = Math.min(this.maxRunway, this.runway + incomeValue);
          
          AudioManager.playCoin();
          Haptics.coin();
          this.particles.emit(pos.x, pos.y, 12, 'coin');
          
          const streakText = this.cashflowStreak > 2 ? ` ${this.cashflowStreak}x streak!` : '';
          const multiplierText = multiplier > 1 ? ' 2x!' : '';
          FloatingText.add(pos.x, pos.y - 50, `+${incomeValue.toFixed(1)} months${streakText}${multiplierText}`, "income");
        }
      }
      
      if (item.y > canvas.height + 200 || item.collected) {
        this.items.splice(i, 1);
      }
    }
    
    // Update particles
    this.particles.update();
    
    // Update screen shake
    ScreenShake.update();
    
    // Check achievements
    this.checkAchievements();
    
    // Rotate tips every 15 seconds
    if (Date.now() - this.lastTipTime > 15000) {
      this.currentTip = MONEY_TIPS[Math.floor(Math.random() * MONEY_TIPS.length)];
      this.lastTipTime = Date.now();
    }
    
    this.updateUI();
  },
  
  updateUI() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('coins').textContent = this.coins;
    document.getElementById('runwayValue').textContent = Math.floor(this.runway) + ' months';
    document.getElementById('level').textContent = 'LVL ' + this.level;
    document.getElementById('combo').textContent = this.cashflowStreak > 1 ? `${this.cashflowStreak}x STREAK` : '';
    document.getElementById('moneyTip').textContent = this.currentTip;
    
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
    
    // Update power-up indicators
    const shieldEl = document.getElementById('shieldIndicator');
    const multiplierEl = document.getElementById('multiplierIndicator');
    const magnetEl = document.getElementById('magnetIndicator');
    
    shieldEl.style.opacity = this.activePowerUps.shield > 0 ? '1' : '0.3';
    multiplierEl.style.opacity = this.activePowerUps.multiplier > 0 ? '1' : '0.3';
    magnetEl.style.opacity = this.activePowerUps.magnet > 0 ? '1' : '0.3';
    
    shieldEl.querySelector('.powerup-timer').style.width = (this.activePowerUps.shield / 10 * 100) + '%';
    multiplierEl.querySelector('.powerup-timer').style.width = (this.activePowerUps.multiplier / 10 * 100) + '%';
    magnetEl.querySelector('.powerup-timer').style.width = (this.activePowerUps.magnet / 10 * 100) + '%';
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
  
  draw() {
    const shake = ScreenShake.getOffset();
    ctx.save();
    ctx.translate(shake.x, shake.y);
    
    // Background
    ctx.fillStyle = '#07111F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const horizonY = canvas.height * HORIZON_Y;
    
    // Parallax background
    this.background.draw(ctx, canvas);
    
    // Track
    this.drawTrack(horizonY);
    
    // Items (sorted by Y for depth)
    this.items.sort((a, b) => a.y - b.y);
    this.items.forEach(item => {
      if (!item.collected) {
        const pos = this.getPos(item.lane, item.y);
        if (pos.y > horizonY - 50) {
          switch(item.type) {
            case 'train': this.drawTrain(pos.x, pos.y, pos.scale); break;
            case 'coin': this.drawCoin(pos.x, pos.y, pos.scale); break;
            case 'shield': this.drawPowerUp(pos.x, pos.y, pos.scale, 'shield'); break;
            case 'multiplier': this.drawPowerUp(pos.x, pos.y, pos.scale, 'multiplier'); break;
            case 'magnet': this.drawPowerUp(pos.x, pos.y, pos.scale, 'magnet'); break;
          }
        }
      }
    });
    
    // Player
    this.drawPlayer();
    
    // Particles
    this.particles.draw(ctx);
    
    ctx.restore();
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
  
  drawPowerUp(x, y, s, type) {
    const size = 35 * s;
    const bounce = Math.sin(Date.now() / 200) * 3;
    
    const colors = {
      shield: { bg: '#3B82F6', icon: '🛡️' },
      multiplier: { bg: '#8B5CF6', icon: '⚡' },
      magnet: { bg: '#EC4899', icon: '🧲' }
    };
    
    const config = colors[type];
    
    ctx.save();
    ctx.translate(x, y + bounce);
    
    // Glow
    ctx.shadowColor = config.bg;
    ctx.shadowBlur = 20;
    
    // Background
    ctx.fillStyle = config.bg;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    // Icon
    ctx.font = `${size * 0.8}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.icon, 0, 2);
    
    ctx.restore();
  },
  
  drawPlayer() {
    const y = canvas.height * PLAYER_Y;
    const size = 70;
    
    // Shield effect
    if (this.activePowerUps.shield > 0) {
      ctx.save();
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 + Math.sin(Date.now() / 100) * 0.2})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.playerX, y - size/2, size * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    
    // Magnet effect ring
    if (this.activePowerUps.magnet > 0) {
      ctx.save();
      ctx.strokeStyle = `rgba(236, 72, 153, ${0.2 + Math.sin(Date.now() / 150) * 0.1})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.playerX, y - size/2, size * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    
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
    
    // Multiplier glow
    if (this.activePowerUps.multiplier > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(139, 92, 246, ${0.2 + Math.sin(Date.now() / 100) * 0.1})`;
      ctx.beginPath();
      ctx.arc(this.playerX, y - size/2, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') game.move(-1);
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') game.move(1);
  if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
    if (game.state === 'playing') game.pause();
    else if (game.state === 'paused') game.resume();
  }
  if (e.key === ' ' && game.state === 'menu') game.start();
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

// Pause button
document.getElementById('pauseBtn').addEventListener('click', () => game.pause());

// Tutorial functions
function showTutorial() {
  document.getElementById('tutorialScreen').classList.remove('hidden');
}

function hideTutorial() {
  document.getElementById('tutorialScreen').classList.add('hidden');
}

// Prevent zoom/scroll on mobile
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());
