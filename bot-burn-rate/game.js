// Burn Rate Drifter Logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function resize() {
    const rect = document.getElementById('app').getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

// UI Elements
const uiStart = document.getElementById('start-screen');
const uiGameOver = document.getElementById('game-over-screen');
const uiHud = document.getElementById('hud');
const scoreEl = document.getElementById('score-val');
const burnEl = document.getElementById('burn-val');
const runwayEl = document.getElementById('runway-val');
const runwayFill = document.getElementById('runway-fill');

// State
let isPlaying = false;
let score = 0; // Net Worth
let baseBurnRate = 1000; // $1k/mo
let currentBurnRate = 1000;
let cash = 12000; // Starts with 12 months runway
let speedY = 8;
let distance = 0;

// Entities
let player = { x: width/2, y: height - 120, width: 40, height: 70, vx: 0, targetX: width/2, angle: 0 };
let obstacles = []; // Red cars, watches (increase burn rate)
let collectibles = []; // Cashflow coins
let particles = [];
let roadLines = [];

// Colors
const COLORS = {
    car: '#00E676',
    window: '#07111F',
    tire: '#111',
    trap: '#FB7185',
    coin: '#FBBF24',
    trail: 'rgba(255,255,255,0.1)'
};

// Input
let lastTouchX = null;
let keys = { left: false, right: false };

function handleInput(e) {
    if(!isPlaying) return;
    const rect = canvas.getBoundingClientRect();
    if(e.touches && e.touches.length > 0) {
        let currentTouchX = e.touches[0].clientX - rect.left;
        if(lastTouchX !== null) {
            player.targetX += (currentTouchX - lastTouchX) * 1.5; 
        }
        lastTouchX = currentTouchX;
    } else if(e.clientX) {
        player.targetX = e.clientX - rect.left;
    }
}

document.addEventListener('mousemove', handleInput);
document.addEventListener('touchmove', handleInput, {passive: true});
document.addEventListener('touchstart', (e) => {
    if(e.touches && e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        lastTouchX = e.touches[0].clientX - rect.left;
    }
}, {passive: true});
document.addEventListener('touchend', () => { lastTouchX = null; });
document.addEventListener('touchcancel', () => { lastTouchX = null; });
document.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if(e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
});
document.addEventListener('keyup', (e) => {
    if(e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if(e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
});

function formatMoney(n) {
    if(n >= 1000) return '$' + (n/1000).toFixed(1) + 'k';
    return '$' + Math.floor(n);
}

function initGame() {
    resize();
    player.x = width/2;
    player.targetX = width/2;
    player.vx = 0;
    
    score = 0;
    currentBurnRate = baseBurnRate;
    cash = currentBurnRate * 12; // 12 months
    speedY = 10;
    distance = 0;
    
    obstacles = [];
    collectibles = [];
    particles = [];
    roadLines = [];
    
    // Init road lines
    for(let i=0; i<height; i+=60) roadLines.push(i);

    uiStart.classList.remove('active');
    uiGameOver.classList.add('hidden');
    uiHud.classList.remove('hidden');
    
    isPlaying = true;
    requestAnimationFrame(loop);
}

function spawnEntity() {
    let x = 40 + Math.random() * (width - 80);
    // 70% chance of coin, 30% trap
    if(Math.random() < 0.7) {
        collectibles.push({ x: x, y: -50, width: 30, height: 30 });
    } else {
        obstacles.push({ x: x, y: -60, width: 40, height: 60 });
    }
}

function createBurst(x, y, color) {
    for(let i=0; i<15; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random()-0.5)*8, vy: (Math.random()-0.5)*8,
            life: 1.0, color: color
        });
    }
}

function update() {
    if(!isPlaying) return;

    // Time/Burn Logic (60fps assumed)
    // Deplete cash based on burn rate. Let's say 1 month passes every 5 seconds.
    // 5 seconds = 300 frames.
    let monthFraction = 1 / 300; 
    cash -= currentBurnRate * monthFraction;
    distance += speedY;
    
    // Speed increases slowly
    speedY += 0.002;

    // Runway calculations
    let monthsLeft = cash / currentBurnRate;
    
    // UI Update
    scoreEl.innerText = formatMoney(score);
    burnEl.innerText = '-' + formatMoney(currentBurnRate) + '/mo';
    runwayEl.innerText = Math.max(0, monthsLeft).toFixed(1) + ' Mo';
    
    let fillPct = Math.max(0, Math.min(100, (monthsLeft / 12) * 100));
    runwayFill.style.width = fillPct + '%';
    if(fillPct < 25) runwayFill.classList.add('low');
    else runwayFill.classList.remove('low');

    if(cash <= 0) {
        gameOver();
        return;
    }

    // Player Movement
    if(keys.left) player.targetX -= 8;
    if(keys.right) player.targetX += 8;
    
    player.targetX = Math.max(player.width/2, Math.min(width - player.width/2, player.targetX));
    let oldX = player.x;
    player.x += (player.targetX - player.x) * 0.2;
    player.vx = player.x - oldX;
    
    // Tilt car based on steering
    player.angle = player.vx * 0.05;

    // Drifting tire marks
    if(Math.abs(player.vx) > 3) {
        particles.push({
            x: player.x - 10, y: player.y + player.height/2,
            vx: 0, vy: speedY*0.5, life: 0.5, color: '#111', size: 4
        });
        particles.push({
            x: player.x + 10, y: player.y + player.height/2,
            vx: 0, vy: speedY*0.5, life: 0.5, color: '#111', size: 4
        });
    }

    // Spawning
    if(Math.random() < 0.05 + (speedY*0.002)) spawnEntity();

    // Move Road
    for(let i=0; i<roadLines.length; i++) {
        roadLines[i] += speedY;
        if(roadLines[i] > height) roadLines[i] = -60;
    }

    let pBox = { x: player.x - player.width/2, y: player.y - player.height/2, w: player.width, h: player.height };

    // Move Collectibles
    for(let i=collectibles.length-1; i>=0; i--) {
        let c = collectibles[i];
        c.y += speedY;
        
        if(c.y > height) { collectibles.splice(i,1); continue; }
        
        if(c.x + c.width/2 > pBox.x && c.x - c.width/2 < pBox.x + pBox.w &&
           c.y + c.width/2 > pBox.y && c.y - c.width/2 < pBox.y + pBox.h) {
            // Collected Cashflow
            let boost = 2000;
            cash += boost;
            score += boost;
            createBurst(c.x, c.y, COLORS.coin);
            collectibles.splice(i, 1);
            
            // Screen Flash green
            ctx.fillStyle = 'rgba(0,230,118,0.2)';
            ctx.fillRect(0,0,width,height);
        }
    }

    // Move Traps
    for(let i=obstacles.length-1; i>=0; i--) {
        let o = obstacles[i];
        o.y += speedY * 0.8; // Move slightly slower than road to simulate traffic
        
        if(o.y > height) { obstacles.splice(i,1); continue; }
        
        if(o.x + o.width/2 > pBox.x && o.x - o.width/2 < pBox.x + pBox.w &&
           o.y + o.height/2 > pBox.y && o.y - o.height/2 < pBox.y + pBox.h) {
            // Hit Lifestyle Creep Trap!
            currentBurnRate += 500; // Permanent burn rate increase
            createBurst(o.x, o.y, COLORS.trap);
            obstacles.splice(i, 1);
            
            // Screen Flash red
            ctx.fillStyle = 'rgba(251,113,133,0.3)';
            ctx.fillRect(0,0,width,height);
            
            // Knockback
            player.vy = 5;
            speedY *= 0.8; // Slow down temporarily
        }
    }

    // Particles
    for(let i=particles.length-1; i>=0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.05;
        if(p.life <= 0) particles.splice(i,1);
    }
}

// Load images
const imgCar = new Image(); imgCar.src = '../assets/moneybot-driving.svg';
const imgFirebot = new Image(); imgFirebot.src = '../assets/firebot.jpg';

function drawCar(x, y, w, h, color) {
    if (color === COLORS.car && imgCar.complete) {
        ctx.drawImage(imgCar, x - w*1.5, y - h*1.5, w*3, h*3);
        return;
    } else if (color === COLORS.enemy && imgFirebot.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, w*1.5, 0, Math.PI*2);
        ctx.clip();
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.drawImage(imgFirebot, x - w*1.5, y - w*1.5, w*3, w*3);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#EF4444';
        ctx.stroke();
        ctx.restore();
        return;
    }

    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect(x - w/2, y - h/2, w, h, 8); ctx.fill();
    
    // Windows
    ctx.fillStyle = COLORS.window;
    ctx.fillRect(x - w/2 + 4, y - h/2 + 15, w - 8, 15); // Windshield
    ctx.fillRect(x - w/2 + 4, y + h/2 - 20, w - 8, 10); // Back window
    
    // Headlights
    if(color === COLORS.car) {
        ctx.fillStyle = '#FFF';
        ctx.shadowColor = '#FFF'; ctx.shadowBlur = 10;
        ctx.fillRect(x - w/2 + 4, y - h/2 - 2, 8, 6);
        ctx.fillRect(x + w/2 - 12, y - h/2 - 2, 8, 6);
        ctx.shadowBlur = 0;
    }
}

function draw() {
    ctx.clearRect(0,0,width,height);

    // Road Lines
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    roadLines.forEach(ly => {
        ctx.fillRect(width/3, ly, 5, 30);
        ctx.fillRect((width/3)*2, ly, 5, 30);
    });

    // Particles (Tire marks & sparks)
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        let s = p.size || 6;
        ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1.0;
    });

    // Collectibles (Coins)
    collectibles.forEach(c => {
        ctx.fillStyle = COLORS.coin;
        ctx.shadowColor = COLORS.coin; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(c.x, c.y, c.width/2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#FFF'; ctx.font = 'bold 16px Outfit'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText('$', c.x, c.y);
        ctx.shadowBlur = 0;
    });

    // Obstacles (Red Cars/Traps)
    obstacles.forEach(o => {
        ctx.save();
        ctx.translate(o.x, o.y);
        drawCar(0, 0, o.width, o.height, COLORS.trap);
        ctx.restore();
    });

    // Player
    if(isPlaying) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);
        drawCar(0, 0, player.width, player.height, COLORS.car);
        ctx.restore();
    }
}

function loop() {
    update();
    draw();
    if(isPlaying) requestAnimationFrame(loop);
}

function gameOver() {
    isPlaying = false;
    uiHud.classList.add('hidden');
    uiGameOver.classList.remove('hidden');
    uiGameOver.classList.add('active');
    
    document.getElementById('final-score').innerText = formatMoney(score);
    document.getElementById('final-burn').innerText = '-' + formatMoney(currentBurnRate) + '/mo';
    
    draw(); // Draw final state
}

document.getElementById('start-btn').addEventListener('click', initGame);
document.getElementById('restart-btn').addEventListener('click', initGame);
