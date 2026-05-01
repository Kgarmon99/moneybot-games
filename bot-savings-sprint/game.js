const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const distanceEl = document.getElementById('distance');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const highScoreEl = document.getElementById('highScore');
const finalScoreEl = document.getElementById('finalScore');
const finalDistEl = document.getElementById('finalDist');

let bestDistance = localStorage.getItem('savingsSprintBestDist') || 0;
highScoreEl.textContent = `${bestDistance}m`;

const STATE = {
    MENU: 0,
    PLAYING: 1,
    GAMEOVER: 2
};
let gameState = STATE.MENU;

// Game Config
const LANE_COUNT = 3;
const LANE_SPACING = 100; // Vertical spacing
const START_SPEED = 400; // px/sec
let currentSpeed = START_SPEED;

let state = {
    lastTime: 0,
    distance: 0,
    netWorth: 0,
    speedMult: 1.0,
    
    player: {
        y: 0, // Target Y (lane)
        currY: 0, // Actual Y (smoothed)
        x: 100, // Fixed X screen position
        size: 30,
        lane: 1, // 0=Top, 1=Mid, 2=Bottom
        isBoosted: false,
        boostTimer: 0
    },
    
    items: [], // coins, obstacles, powerups
    particles: [],
    
    cameraShake: 0
};

// Colors/Emojis
const ASSETS = {
    COIN: { emoji: '💵', type: 'good', val: 50 },
    BAG: { emoji: '💰', type: 'good', val: 200 },
    EXPENSE: { emoji: '🛍️', type: 'bad', penalty: 100 },
    TAX: { emoji: '📄', type: 'bad', penalty: 200 },
    CRASH: { emoji: '📉', type: 'bad', penalty: 500 },
    BOOST: { emoji: '🚀', type: 'boost' }
};

function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    // Update player positions
    const centerY = canvas.height / 2;
    state.player.y = centerY;
    state.player.currY = centerY;
}
window.addEventListener('resize', resize);
resize();

function getLaneY(lane) {
    const centerY = canvas.height / 2;
    return centerY + (lane - 1) * LANE_SPACING;
}

function spawnItem() {
    const lane = Math.floor(Math.random() * 3);
    const x = canvas.width + 50;
    const y = getLaneY(lane);
    
    const r = Math.random();
    let type;
    if (r < 0.6) type = 'COIN';
    else if (r < 0.65) type = 'BAG';
    else if (r < 0.75) type = 'EXPENSE';
    else if (r < 0.85) type = 'TAX';
    else if (r < 0.95) type = 'CRASH';
    else type = 'BOOST';
    
    state.items.push({ x, y, lane, def: ASSETS[type], size: 25, active: true });
}

function spawnParticle(x, y, emoji) {
    state.particles.push({
        x, y, emoji,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 1.0) * 200,
        life: 1.0
    });
}

function spawnText(x, y, text, color) {
    state.particles.push({
        x, y, text, color, isText: true,
        vx: 0, vy: -50, life: 1.0
    });
}

function handleInput(dir) {
    if (gameState !== STATE.PLAYING) return;
    
    if (dir === 'UP' && state.player.lane > 0) {
        state.player.lane--;
    } else if (dir === 'DOWN' && state.player.lane < 2) {
        state.player.lane++;
    }
    state.player.y = getLaneY(state.player.lane);
    if(navigator.vibrate) navigator.vibrate(10);
}

// Touch controls (Swipe)
let touchStartY = 0;
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    touchStartY = e.touches[0].clientY;
}, {passive: false});

canvas.addEventListener('touchend', e => {
    if (gameState !== STATE.PLAYING) return;
    const touchEndY = e.changedTouches[0].clientY;
    const dy = touchEndY - touchStartY;
    if (Math.abs(dy) > 30) {
        if (dy > 0) handleInput('DOWN');
        else handleInput('UP');
    } else {
        // Tap to jump/dodge? 
    }
});

// Keyboard controls
window.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' || e.key === 'w') handleInput('UP');
    if (e.key === 'ArrowDown' || e.key === 's') handleInput('DOWN');
});

function update(dt) {
    if (gameState !== STATE.PLAYING) return;
    
    // Difficulty scaling
    currentSpeed = START_SPEED + (state.distance * 0.5);
    const speed = currentSpeed * state.speedMult;
    
    state.distance += (speed * dt) / 100; // Meters
    
    // Boost logic
    if (state.player.isBoosted) {
        state.player.boostTimer -= dt;
        if (state.player.boostTimer <= 0) {
            state.player.isBoosted = false;
            state.speedMult = 1.0;
        }
    }
    
    // Player smoothing
    state.player.currY += (state.player.y - state.player.currY) * 15 * dt;
    
    // Items
    for (let i = state.items.length - 1; i >= 0; i--) {
        let item = state.items[i];
        if (!item.active) continue;
        
        item.x -= speed * dt;
        
        // Collision (Circle approx)
        const dx = state.player.x - item.x;
        const dy = state.player.currY - item.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < state.player.size + item.size) {
            item.active = false;
            
            if (item.def.type === 'good') {
                state.netWorth += item.def.val;
                spawnText(item.x, item.y, `+$${item.def.val}`, '#00E676');
                if(navigator.vibrate) navigator.vibrate(5);
            } 
            else if (item.def.type === 'bad') {
                if (state.player.isBoosted) {
                    // Smash it!
                    spawnParticle(item.x, item.y, '💥');
                    spawnText(item.x, item.y, "SMASH!", "#FBBF24");
                } else {
                    // Hit
                    state.netWorth -= item.def.penalty;
                    if (state.netWorth < 0) state.netWorth = 0;
                    spawnText(item.x, item.y, `-$${item.def.penalty}`, '#FB7185');
                    state.cameraShake = 15;
                    if(navigator.vibrate) navigator.vibrate([30, 50, 30]);
                    
                    // Bankruptcy Check
                    if (item.def.penalty >= 500 || state.netWorth === 0) {
                        endGame();
                        return;
                    }
                }
            }
            else if (item.def.type === 'boost') {
                state.player.isBoosted = true;
                state.player.boostTimer = 3.0; // 3 secs
                state.speedMult = 2.0;
                spawnText(item.x, item.y, "COMPOUND!", "#38BDF8");
                if(navigator.vibrate) navigator.vibrate([10, 20, 30, 40]);
            }
        }
        
        if (item.x < -50) {
            state.items.splice(i, 1);
        }
    }
    
    // Spawning
    if (Math.random() < 0.03 + (currentSpeed / 20000)) spawnItem();
    
    // Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
        let p = state.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt * 1.5;
        if (p.life <= 0) state.particles.splice(i, 1);
    }
    
    // Camera shake decay
    if (state.cameraShake > 0) state.cameraShake -= dt * 60;
    
    // HUD
    scoreEl.textContent = `$${state.netWorth}`;
    distanceEl.textContent = `${Math.floor(state.distance)}m`;
}

function drawEmoji(x, y, emoji, size) {
    ctx.font = `${size}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(emoji, x, y);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    if (state.cameraShake > 0) {
        ctx.translate((Math.random()-0.5)*state.cameraShake, (Math.random()-0.5)*state.cameraShake);
    }
    
    // Draw Parallax BG
    ctx.fillStyle = '#050A12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Lanes
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    const offset = -(state.distance * 100) % 40;
    
    for(let i=0; i<3; i++) {
        const ly = getLaneY(i);
        ctx.beginPath();
        ctx.moveTo(offset, ly);
        ctx.lineTo(canvas.width, ly);
        ctx.stroke();
    }
    ctx.setLineDash([]);
    
    // Items
    state.items.forEach(item => {
        if (!item.active) return;
        ctx.shadowBlur = 10;
        if (item.def.type === 'good') ctx.shadowColor = 'rgba(0, 230, 118, 0.5)';
        else if (item.def.type === 'bad') ctx.shadowColor = 'rgba(251, 113, 133, 0.5)';
        else ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
        
        drawEmoji(item.x, item.y, item.def.emoji, 30);
        ctx.shadowBlur = 0;
    });
    
    // Player
    ctx.shadowBlur = state.player.isBoosted ? 20 : 10;
    ctx.shadowColor = state.player.isBoosted ? '#38BDF8' : '#00E676';
    drawEmoji(state.player.x, state.player.currY, '🤖', state.player.size * 2);
    
    // Boost effect
    if (state.player.isBoosted) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.beginPath();
        ctx.ellipse(state.player.x - 20, state.player.currY, 40, 20, 0, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
    
    // Particles
    state.particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.life);
        if (p.isText) {
            ctx.fillStyle = p.color;
            ctx.font = '900 24px "Inter", sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.shadowBlur = 10; ctx.shadowColor = p.color;
            ctx.fillText(p.text, p.x, p.y);
            ctx.shadowBlur = 0;
        } else {
            drawEmoji(p.x, p.y, p.emoji, 20);
        }
        ctx.globalAlpha = 1.0;
    });
    
    ctx.restore();
}

function gameLoop(now) {
    const dt = Math.min((now - state.lastTime) / 1000, 0.1);
    state.lastTime = now;
    
    if (gameState === STATE.PLAYING) {
        update(dt);
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    gameState = STATE.PLAYING;
    state = {
        lastTime: performance.now(), distance: 0, netWorth: 100, speedMult: 1.0,
        player: { y: getLaneY(1), currY: getLaneY(1), x: 100, size: 20, lane: 1, isBoosted: false, boostTimer: 0 },
        items: [], particles: [], cameraShake: 0
    };
}

function endGame() {
    gameState = STATE.GAMEOVER;
    
    if (state.distance > bestDistance) {
        bestDistance = Math.floor(state.distance);
        localStorage.setItem('savingsSprintBestDist', bestDistance);
    }
    
    finalScoreEl.textContent = `$${state.netWorth}`;
    finalDistEl.textContent = `${Math.floor(state.distance)}m`;
    
    setTimeout(() => {
        gameOverScreen.classList.remove('hidden');
    }, 500);
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('startBtn').addEventListener('touchstart', (e) => { e.preventDefault(); startGame(); }, {passive: false});

document.getElementById('restartBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('touchstart', (e) => { e.preventDefault(); startGame(); }, {passive: false});

// Init
requestAnimationFrame(gameLoop);