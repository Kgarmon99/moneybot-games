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
const imgMoneyBot = new Image();
imgMoneyBot.src = '../assets/moneybot-super.jpg';
const imgGoldBot = new Image();
imgGoldBot.src = '../assets/goldbot.jpg';

// Game State
let gameState = 'START'; // START, PLAYING, GAMEOVER
let age = 22;
let activeCash = 0;
let passiveIncome = 0;
let forgeXP = 0;
let forgeLevel = 1;
const FIRE_GOAL = 10000; // $10,000/mo passive income to FIRE

let lastTime = 0;
let ageTimer = 0;

// UI Elements
const ageDisplay = document.getElementById('ageDisplay');
const activeCashDisplay = document.getElementById('activeCashDisplay');
const passiveIncomeDisplay = document.getElementById('passiveIncomeDisplay');
const forgeLevelDisplay = document.getElementById('forgeLevelDisplay');
const forgeProgress = document.getElementById('forgeProgress');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const endTitle = document.getElementById('endTitle');
const endSubtitle = document.getElementById('endSubtitle');

// Input
const mouse = { x: cw/2, y: ch/4, isDown: false };
window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('pointerdown', () => mouse.isDown = true);
window.addEventListener('pointerup', () => mouse.isDown = false);

// Entities
const player = {
    x: cw/2,
    y: ch/4,
    radius: 40,
    targetX: cw/2,
    targetY: ch/4
};

const forge = {
    x: cw/2,
    y: ch - 120,
    radius: 60,
    pulse: 0
};

let activeCoins = [];
let hazards = []; // NEW: Expenses/Burn Rate hazards
let passiveParticles = [];
let floatingTexts = [];
let particles = [];

function drawToken(img, x, y, radius, borderColor) {
    if (!img.complete) return;
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.closePath();
    
    // Drop shadow / glow
    ctx.shadowColor = borderColor;
    ctx.shadowBlur = 20;
    
    // Mask
    ctx.clip();
    
    // Draw image centered and scaled
    const size = Math.min(img.width, img.height);
    const sx = (img.width - size) / 2;
    const sy = (img.height - size) / 2;
    
    ctx.drawImage(img, sx, sy, size, size, x - radius, y - radius, radius * 2, radius * 2);
    
    ctx.restore();
    
    // Border
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = borderColor;
    ctx.shadowColor = borderColor;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();
}

function spawnCoin() {
    activeCoins.push({
        x: Math.random() * (cw - 40) + 20,
        y: -20,
        speed: 2 + Math.random() * 3 + (age - 22) * 0.15, // Speeds up FASTER as you age
        value: 100 + Math.floor(Math.random() * 100)
    });
}

function spawnHazard() {
    hazards.push({
        x: Math.random() * (cw - 40) + 20,
        y: -20,
        speed: 3 + Math.random() * 4 + (age - 22) * 0.1, 
        radius: 12
    });
}

function createParticles(x, y, color, count) {
    for (let i=0; i<count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1,
            color
        });
    }
}

function createFloatingText(x, y, text, color) {
    floatingTexts.push({ x, y, text, color, life: 1 });
}

function updateGame(dt) {
    if (gameState !== 'PLAYING') return;

    // Age
    ageTimer += dt;
    if (ageTimer > 2000) { // 2 seconds = 1 year
        age++;
        ageTimer = 0;
        ageDisplay.innerText = age;
        
        if (age >= 65 && passiveIncome < FIRE_GOAL) {
            endGame(false);
        }
    }

    // Passive Income Generation
    if (passiveIncome > 0 && Math.random() < passiveIncome / 100000) {
        passiveParticles.push({
            x: forge.x + (Math.random()-0.5)*50,
            y: forge.y - 40,
            vx: (Math.random() - 0.5) * 5,
            vy: - (5 + Math.random() * 5),
            life: 1
        });
    }

    // Update Passive Particles (Visual only, flying up)
    for (let i = passiveParticles.length - 1; i >= 0; i--) {
        let p = passiveParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt / 1000;
        if (p.life <= 0 || p.y < -20) {
            passiveParticles.splice(i, 1);
        }
    }

    // Player Movement (lerp to mouse)
    player.x += (mouse.x - player.x) * 0.1;
    player.y += (mouse.y - player.y) * 0.1;

    // Spawning active coins and hazards
    if (Math.random() < 0.05 + (forgeLevel * 0.01)) {
        spawnCoin();
    }
    if (Math.random() < 0.02 + (age - 22) * 0.001) { // More hazards as you age
        spawnHazard();
    }

    // Update Active Coins
    for (let i = activeCoins.length - 1; i >= 0; i--) {
        let c = activeCoins[i];
        c.y += c.speed;
        
        // Collision with player
        const dx = c.x - player.x;
        const dy = c.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < player.radius + 15) {
            activeCash += c.value;
            activeCashDisplay.innerText = `$${activeCash.toLocaleString()}`;
            createFloatingText(c.x, c.y, `+$${c.value}`, '#00ff88');
            createParticles(c.x, c.y, '#00ff88', 5);
            if(window.parent && window.parent.mbAudio) window.parent.mbAudio.playSelect();
            activeCoins.splice(i, 1);
            continue;
        }

        // Missed coin
        if (c.y > ch + 20) {
            activeCoins.splice(i, 1);
        }
    }

    // Update Hazards
    for (let i = hazards.length - 1; i >= 0; i--) {
        let h = hazards[i];
        h.y += h.speed;
        
        // Collision with player
        const dx = h.x - player.x;
        const dy = h.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < player.radius + h.radius) {
            // Penalize
            const penalty = Math.min(activeCash, 500);
            activeCash -= penalty;
            activeCashDisplay.innerText = `$${activeCash.toLocaleString()}`;
            createFloatingText(h.x, h.y, `-$${penalty} BURN RATE!`, '#ff3366');
            createParticles(h.x, h.y, '#ff3366', 15);
            if(window.parent && window.parent.mbAudio) window.parent.mbAudio.playHit();
            
            // Screen shake (CSS class toggling approach)
            document.getElementById('game-container').classList.add('shake');
            setTimeout(() => document.getElementById('game-container').classList.remove('shake'), 200);

            hazards.splice(i, 1);
            continue;
        }

        if (h.y > ch + 20) {
            hazards.splice(i, 1);
        }
    }

    // Deposit to Forge
    const fdx = player.x - forge.x;
    const fdy = player.y - forge.y;
    const fdist = Math.sqrt(fdx*fdx + fdy*fdy);
    
    if (fdist < player.radius + forge.radius + 20 && activeCash > 0) {
        // Transfer cash
        const transferAmount = Math.min(activeCash, Math.max(10, activeCash * 0.1));
        activeCash -= transferAmount;
        forgeXP += transferAmount;
        activeCashDisplay.innerText = `$${Math.floor(activeCash).toLocaleString()}`;
        
        // Visuals
        forge.pulse = 1;
        createParticles(player.x, player.y + player.radius, '#ffaa00', 2);
        
        // Level up forge
        const xpRequired = 1000 * Math.pow(1.5, forgeLevel - 1);
        forgeProgress.style.width = Math.min(100, (forgeXP / xpRequired) * 100) + '%';
        
        if (forgeXP >= xpRequired) {
            forgeLevel++;
            forgeXP -= xpRequired;
            passiveIncome += 250 + (forgeLevel * 100);
            forgeLevelDisplay.innerText = forgeLevel;
            passiveIncomeDisplay.innerText = `$${passiveIncome.toLocaleString()}/mo`;
            createFloatingText(forge.x, forge.y - 80, "FORGE UPGRADE!", '#ffaa00');
            if(window.parent && window.parent.mbAudio) window.parent.mbAudio.playLevelUp();
            
            if (passiveIncome >= FIRE_GOAL) {
                endGame(true);
            }
        }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt / 500;
        if (p.life <= 0) particles.splice(i, 1);
    }
    
    // Floating Text
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ft.y -= dt * 0.05;
        ft.life -= dt / 1000;
        if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
}

function draw() {
    ctx.clearRect(0, 0, cw, ch);
    
    // Background Grid effect
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<cw; i+=50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, ch); ctx.stroke();
    }
    for(let i=0; i<ch; i+=50) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(cw, i); ctx.stroke();
    }

    // Forge (GoldBot)
    forge.x = cw/2; // keep centered on resize
    forge.y = ch - 120;
    
    if (forge.pulse > 0) {
        forge.pulse -= 0.05;
        ctx.save();
        ctx.beginPath();
        ctx.arc(forge.x, forge.y, forge.radius + forge.pulse * 20, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255, 170, 0, ${forge.pulse * 0.3})`;
        ctx.fill();
        ctx.restore();
    }
    
    // Draw connections/laser from forge to top if passive income is high
    if (passiveIncome > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(forge.x, forge.y);
        ctx.lineTo(cw - 150, 40); // towards passive income UI
        ctx.lineWidth = Math.min(20, passiveIncome / 500);
        ctx.strokeStyle = 'rgba(255, 170, 0, 0.2)';
        ctx.stroke();
        ctx.restore();
    }

    drawToken(imgGoldBot, forge.x, forge.y, forge.radius, '#ffaa00');

    // Passive Particles (Gold)
    ctx.fillStyle = '#ffaa00';
    for (let p of passiveParticles) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 10;
        ctx.restore();
    }

    // Active Coins
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 10;
    for (let c of activeCoins) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 10, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Hazards (Red Burn Rate)
    ctx.fillStyle = '#ff3366';
    ctx.shadowColor = '#ff3366';
    ctx.shadowBlur = 15;
    for (let h of hazards) {
        ctx.beginPath();
        ctx.moveTo(h.x, h.y - h.radius);
        ctx.lineTo(h.x + h.radius, h.y);
        ctx.lineTo(h.x, h.y + h.radius);
        ctx.lineTo(h.x - h.radius, h.y);
        ctx.closePath();
        ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Player (Super MoneyBot)
    drawToken(imgMoneyBot, player.x, player.y, player.radius, '#00ff88');

    // Generic Particles
    for (let p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Floating Texts
    ctx.font = 'bold 20px Courier New';
    ctx.textAlign = 'center';
    for (let ft of floatingTexts) {
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.fillText(ft.text, ft.x, ft.y);
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
    age = 22;
    activeCash = 0;
    passiveIncome = 0;
    forgeXP = 0;
    forgeLevel = 1;
    activeCoins = [];
    hazards = [];
    particles = [];
    floatingTexts = [];
    passiveParticles = [];
    ageTimer = 0;
    
    ageDisplay.innerText = age;
    activeCashDisplay.innerText = '$0';
    passiveIncomeDisplay.innerText = '$0/mo';
    forgeLevelDisplay.innerText = forgeLevel;
    forgeProgress.style.width = '0%';
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

function endGame(won) {
    gameState = 'GAMEOVER';
    gameOverScreen.classList.remove('hidden');
    
    if (won) {
        if(window.parent && window.parent.mbAudio) window.parent.mbAudio.playLevelUp();
        endTitle.innerText = "FIRE ACHIEVED!";
        endTitle.style.color = "#ffaa00";
        endSubtitle.innerText = `You escaped the rat race at age ${age} with $${passiveIncome.toLocaleString()}/mo in passive income!`;
    } else {
        if(window.parent && window.parent.mbAudio) window.parent.mbAudio.playGameOver();
        endTitle.innerText = "TRADITIONAL RETIREMENT";
        endTitle.style.color = "#888";
        endSubtitle.innerText = `You reached 65, but didn't hit FIRE. Time to rely on Social Security!`;
    }
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

requestAnimationFrame(time => {
    lastTime = time;
    loop(time);
});
