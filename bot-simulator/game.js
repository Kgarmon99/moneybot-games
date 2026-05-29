const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let cw, ch;
function resize() {
    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Images
const imgYield = new Image(); imgYield.src = '../assets/moneybot-running-3d.jpg';
const imgGrowth = new Image(); imgGrowth.src = '../assets/moneybot-super.jpg';
const imgGold = new Image(); imgGold.src = '../assets/goldbot.jpg';
const imgBroke = new Image(); imgBroke.src = '../assets/brokebot.jpg';

// Game State
let gameState = 'START';
let netWorth = 0;
let displayNetWorth = 0;
let passiveIncome = 0;
let displayPassiveIncome = 0;
let hitPauseTimer = 0;

const GOAL = 100000;

// UI
const nwDisplay = document.getElementById('nwDisplay');
const roiDisplay = document.getElementById('roiDisplay');
const btnWork = document.getElementById('manualWorkBtn');
const btnYield = document.getElementById('buyYieldBot');
const btnGrowth = document.getElementById('buyGrowthBot');
const btnGold = document.getElementById('buyGoldBot');

const costs = {
    yield: 100,
    growth: 500,
    gold: 5000
};

const yields = {
    yield: 5,
    growth: 30,
    gold: 500
};

// Entities
let bots = [];
let liabilities = [];
let particles = [];
let floatingTexts = [];
let lastTime = 0;

// Token Drawer
function drawToken(img, x, y, radius, borderColor) {
    if (!img.complete) return;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.shadowColor = borderColor;
    ctx.shadowBlur = 15;
    ctx.clip();
    const size = Math.min(img.width, img.height);
    const sx = (img.width - size) / 2;
    const sy = (img.height - size) / 2;
    ctx.drawImage(img, sx, sy, size, size, x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
    ctx.restore();
}

function createParticles(x, y, color, count, speedFactor = 1) {
    for (let i=0; i<count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 15 * speedFactor,
            vy: (Math.random() - 0.5) * 15 * speedFactor,
            life: 1,
            color,
            radius: Math.random() * 4 + 2
        });
    }
}

function createFloatingText(x, y, text, color) {
    floatingTexts.push({ x, y, text, color, life: 1 });
}

// Interactions
btnWork.addEventListener('mousedown', (e) => {
    if (gameState !== 'PLAYING') return;
    netWorth += 10;
    hitPauseTimer = 20;
    if (window.mbAudio) window.mbAudio.playSelect();
    
    // Spawn text at button center
    const rect = btnWork.getBoundingClientRect();
    createFloatingText(rect.left + rect.width/2, rect.top - 20, "+$10", "#00ccff");
    createParticles(rect.left + rect.width/2, rect.top, '#00ccff', 5);
});

function buyBot(type) {
    if (netWorth >= costs[type]) {
        netWorth -= costs[type];
        passiveIncome += yields[type];
        
        let color, img;
        if (type === 'yield') { color = '#00ff88'; img = imgYield; }
        else if (type === 'growth') { color = '#ffaa00'; img = imgGrowth; }
        else { color = '#ffcc00'; img = imgGold; }
        
        bots.push({
            x: Math.random() * (cw - 100) + 50,
            y: Math.random() * (ch - 350) + 200, // Below manual button, above shop
            radius: 35,
            type: type,
            color: color,
            img: img,
            timer: 0,
            pulse: 0
        });
        
        if (window.mbAudio) window.mbAudio.playCoin();
        createParticles(cw/2, ch/2, color, 20, 2);
        document.getElementById('game-container').classList.add('flash-green');
        setTimeout(() => document.getElementById('game-container').classList.remove('flash-green'), 300);
    }
}

btnYield.addEventListener('click', () => buyBot('yield'));
btnGrowth.addEventListener('click', () => buyBot('growth'));
btnGold.addEventListener('click', () => buyBot('gold'));

// Click to destroy liabilities
window.addEventListener('pointerdown', (e) => {
    if (gameState !== 'PLAYING') return;
    const mx = e.clientX;
    const my = e.clientY;
    
    for (let i = liabilities.length - 1; i >= 0; i--) {
        let l = liabilities[i];
        const dist = Math.hypot(mx - l.x, my - l.y);
        if (dist < l.radius + 15) {
            // Destroyed!
            liabilities.splice(i, 1);
            createParticles(l.x, l.y, '#ff3366', 20, 2);
            createFloatingText(l.x, l.y, "DESTROYED!", "#00ff88");
            if (window.mbAudio) window.mbAudio.playHit();
            hitPauseTimer = 50;
            break; // Only click one at a time
        }
    }
});

function updateGame(dt) {
    if (gameState !== 'PLAYING') return;

    if (hitPauseTimer > 0) {
        hitPauseTimer -= dt;
        return;
    }

    // Shop button states
    btnYield.disabled = netWorth < costs.yield;
    btnGrowth.disabled = netWorth < costs.growth;
    btnGold.disabled = netWorth < costs.gold;

    // Rolling Numbers
    let activeDiff = netWorth - displayNetWorth;
    if (Math.abs(activeDiff) > 1) displayNetWorth += activeDiff * 0.15;
    else displayNetWorth = netWorth;

    let passiveDiff = passiveIncome - displayPassiveIncome;
    if (Math.abs(passiveDiff) > 1) displayPassiveIncome += passiveDiff * 0.15;
    else displayPassiveIncome = passiveIncome;

    nwDisplay.innerText = `$${Math.floor(displayNetWorth).toLocaleString()}`;
    roiDisplay.innerText = `$${Math.floor(displayPassiveIncome).toLocaleString()}/sec`;

    // Win condition
    if (netWorth >= GOAL) {
        endGame();
    }

    // Update Bots (Generate Income)
    for (let b of bots) {
        b.timer += dt;
        if (b.pulse > 0) b.pulse -= dt * 0.005;
        
        if (b.timer >= 1000) { // 1 second
            b.timer -= 1000;
            const amt = yields[b.type];
            netWorth += amt;
            b.pulse = 5;
            createFloatingText(b.x, b.y - b.radius, `+$${amt}`, b.color);
        }
        
        // Gentle float
        b.y += Math.sin(Date.now() / 300 + b.x) * 0.5;
    }

    // Spawn Liabilities (BrokeBots)
    // Chance increases as passive income increases
    if (bots.length > 0 && Math.random() < 0.001 + (passiveIncome / 100000)) {
        // Target a random bot
        const targetBot = bots[Math.floor(Math.random() * bots.length)];
        
        liabilities.push({
            x: Math.random() < 0.5 ? -50 : cw + 50,
            y: Math.random() * ch,
            radius: 30,
            target: targetBot,
            attached: false
        });
        
        if (window.mbAudio) window.mbAudio.playGameOver(); // Ominous warning
    }

    // Update Liabilities
    for (let i = liabilities.length - 1; i >= 0; i--) {
        let l = liabilities[i];
        
        if (!l.attached) {
            // Move toward target
            const dx = l.target.x - l.x;
            const dy = l.target.y - l.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < 10) {
                l.attached = true;
                l.x = l.target.x + 20;
                l.y = l.target.y - 20;
                createFloatingText(l.x, l.y, "VIRUS ATTACHED!", "#ff3366");
                document.getElementById('game-container').classList.add('shake');
                setTimeout(() => document.getElementById('game-container').classList.remove('shake'), 200);
            } else {
                l.x += (dx / dist) * 2;
                l.y += (dy / dist) * 2;
            }
        } else {
            // Drain the bot!
            l.x = l.target.x + 20; // stick to it
            l.y = l.target.y - 20;
            
            if (Math.random() < 0.05) { // Frequent small drains
                const drain = Math.floor(yields[l.target.type] * 0.5);
                netWorth -= drain;
                createFloatingText(l.x, l.y, `-$${drain}`, "#ff3366");
                createParticles(l.x, l.y, '#ff3366', 2);
            }
        }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.radius *= 0.95;
        p.life -= dt / 500;
        if (p.life <= 0 || p.radius < 0.5) particles.splice(i, 1);
    }
    
    // Update Floating Text
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ft.y -= dt * (0.05 * ft.life);
        ft.life -= dt / 1000;
        if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
}

function draw() {
    // Cyberpunk motion blur
    ctx.fillStyle = 'rgba(5, 5, 8, 0.4)';
    ctx.fillRect(0, 0, cw, ch);
    
    // Draw Connections between bots (Factory Network)
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < bots.length; i++) {
        for (let j = i + 1; j < bots.length; j++) {
            const dist = Math.hypot(bots[i].x - bots[j].x, bots[i].y - bots[j].y);
            if (dist < 200) {
                ctx.moveTo(bots[i].x, bots[i].y);
                ctx.lineTo(bots[j].x, bots[j].y);
            }
        }
    }
    ctx.stroke();

    // Draw Bots
    for (let b of bots) {
        if (b.pulse > 0) {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius + b.pulse * 2, 0, Math.PI*2);
            ctx.fillStyle = b.color;
            ctx.globalAlpha = 0.3;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        drawToken(b.img, b.x, b.y, b.radius, b.color);
    }

    // Draw Liabilities
    for (let l of liabilities) {
        // Red connection string if attached
        if (l.attached) {
            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(l.target.x, l.target.y);
            ctx.strokeStyle = '#ff3366';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        drawToken(imgBroke, l.x, l.y, l.radius, '#ff3366');
    }

    // Generic Particles
    for (let p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius || 3, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Floating Texts
    ctx.textAlign = 'center';
    for (let ft of floatingTexts) {
        const scale = ft.life > 0.8 ? 1 + (ft.life - 0.8) * 2 : 1;
        ctx.save();
        ctx.translate(ft.x, ft.y);
        ctx.scale(scale, scale);
        
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.font = 'bold 24px Courier New';
        ctx.fillText(ft.text, 0, 0);
        
        ctx.restore();
    }
    ctx.globalAlpha = 1;
}

function loop(time) {
    const dt = time - lastTime;
    lastTime = time;
    
    updateGame(dt);
    draw();
    
    requestAnimationFrame(loop);
}

function startGame() {
    gameState = 'PLAYING';
    netWorth = 0;
    passiveIncome = 0;
    bots = [];
    liabilities = [];
    particles = [];
    floatingTexts = [];
    hitPauseTimer = 0;
    
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    
    if (window.mbAudio) window.mbAudio.playLevelUp();
}

function endGame() {
    gameState = 'GAMEOVER';
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('finalScore').innerText = `$${Math.floor(netWorth).toLocaleString()}`;
    if (window.mbAudio) window.mbAudio.playLevelUp();
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

requestAnimationFrame(time => {
    lastTime = time;
    loop(time);
});