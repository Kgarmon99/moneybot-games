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
const imgBrokeBot = new Image();
imgBrokeBot.src = '../assets/brokebot.jpg';

// Game State
let gameState = 'START';
let netWorth = 5000;
let timeRemaining = 60;
let stuckDebts = 0;

let lastTime = 0;
let secondTimer = 0;

// UI Elements
const timeDisplay = document.getElementById('timeDisplay');
const nwDisplay = document.getElementById('nwDisplay');
const debtDisplay = document.getElementById('debtDisplay');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const endTitle = document.getElementById('endTitle');
const endSubtitle = document.getElementById('endSubtitle');
const finalScore = document.getElementById('finalScore');
const gameContainer = document.getElementById('game-container');

// Input
const mouse = { x: cw/2, y: ch/2, isDown: false };
window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('pointerdown', () => mouse.isDown = true);
window.addEventListener('pointerup', () => mouse.isDown = false);

// Entities
const player = {
    x: cw/2,
    y: ch/2,
    radius: 35
};

const brokebot = {
    x: cw/2,
    y: 80,
    radius: 45,
    targetX: cw/2,
    fireTimer: 0
};

let projectiles = []; // Red credit cards
let payments = []; // Green principal payments
let particles = [];
let floatingTexts = [];

// Helper: draw bounded tokens cleanly
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
            color
        });
    }
}

function createFloatingText(x, y, text, color) {
    floatingTexts.push({ x, y, text, color, life: 1 });
}

function updateGame(dt) {
    if (gameState !== 'PLAYING') return;

    // Time & Interest Deduction
    secondTimer += dt;
    if (secondTimer > 1000) {
        timeRemaining--;
        secondTimer = 0;
        timeDisplay.innerText = `${timeRemaining}s`;
        
        // Deduct interest based on debt load
        if (stuckDebts > 0) {
            const interest = stuckDebts * 50;
            netWorth -= interest;
            createFloatingText(player.x, player.y - 50, `-$${interest} INTEREST`, '#ff3366');
        }

        if (timeRemaining <= 0) {
            endGame(netWorth > 0);
        } else if (netWorth <= 0) {
            endGame(false);
        }
    }

    nwDisplay.innerText = `$${Math.floor(netWorth).toLocaleString()}`;
    debtDisplay.innerText = `${stuckDebts} CARDS`;

    // Player Movement (Debt makes you sluggish)
    // Base lerp is 0.15. Each debt subtracts 0.02, min 0.02.
    const friction = Math.max(0.015, 0.15 - (stuckDebts * 0.015));
    player.x += (mouse.x - player.x) * friction;
    player.y += (mouse.y - player.y) * friction;

    // Clamp player to screen
    player.x = Math.max(player.radius, Math.min(cw - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(ch - player.radius, player.y));

    // Brokebot Movement (Moves along the top, trying to align with player)
    brokebot.targetX = player.x;
    brokebot.x += (brokebot.targetX - brokebot.x) * 0.03;

    // Brokebot Firing
    brokebot.fireTimer += dt;
    const fireRate = Math.max(300, 1000 - (60 - timeRemaining) * 10); // Shoots faster as time goes on
    if (brokebot.fireTimer > fireRate) {
        brokebot.fireTimer = 0;
        
        // Calculate angle to player
        const angle = Math.atan2(player.y - brokebot.y, player.x - brokebot.x);
        
        projectiles.push({
            x: brokebot.x,
            y: brokebot.y,
            vx: Math.cos(angle) * 7,
            vy: Math.sin(angle) * 7,
            width: 24,
            height: 16,
            rotation: angle
        });
        
        if (window.mbAudio) window.mbAudio.playSelect(); // quiet blip for shooting
    }

    // Spawn Payments randomly
    if (Math.random() < 0.01) {
        payments.push({
            x: Math.random() * (cw - 60) + 30,
            y: -20,
            vy: 3 + Math.random() * 2,
            radius: 15
        });
    }

    // Update Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += 0.1;
        
        // Collision with player
        const dx = p.x - player.x;
        const dy = p.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < player.radius + 10) {
            stuckDebts++;
            createParticles(p.x, p.y, '#ff3366', 10);
            createFloatingText(p.x, p.y, "DEBT ADDED!", '#ff3366');
            if (window.mbAudio) window.mbAudio.playHit();
            
            gameContainer.classList.add('shake');
            setTimeout(() => gameContainer.classList.remove('shake'), 300);
            
            projectiles.splice(i, 1);
            continue;
        }

        // Off screen
        if (p.y > ch + 20 || p.x < -20 || p.x > cw + 20) {
            projectiles.splice(i, 1);
        }
    }

    // Update Payments
    for (let i = payments.length - 1; i >= 0; i--) {
        let p = payments[i];
        p.y += p.vy;
        
        const dx = p.x - player.x;
        const dy = p.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < player.radius + p.radius) {
            netWorth += 1000;
            if (stuckDebts > 0) {
                createFloatingText(player.x, player.y, "DEBT CLEARED!", '#00ff88');
                createParticles(player.x, player.y, '#00ff88', 30, 2);
                if (window.mbAudio) window.mbAudio.playNoise(0.3, 0.5); // Explosion sound
                stuckDebts = 0; // Clear all debt
            } else {
                createFloatingText(player.x, player.y, "+$1000", '#00ff88');
                createParticles(p.x, p.y, '#00ff88', 10);
                if (window.mbAudio) window.mbAudio.playCoin();
            }
            
            payments.splice(i, 1);
            continue;
        }

        if (p.y > ch + 20) {
            payments.splice(i, 1);
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
    
    // Background Radial Lines (Focus on center)
    ctx.save();
    ctx.translate(cw/2, ch/2);
    ctx.strokeStyle = 'rgba(255, 51, 102, 0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<Math.PI*2; i+=0.2) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(i) * Math.max(cw, ch), Math.sin(i) * Math.max(cw, ch));
        ctx.stroke();
    }
    ctx.restore();

    // Draw Payments (Green circles)
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 15;
    for (let p of payments) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', p.x, p.y);
        ctx.fillStyle = '#00ff88'; // reset
    }
    ctx.shadowBlur = 0;

    // Draw Projectiles (Red Credit Cards)
    ctx.fillStyle = '#ff3366';
    ctx.shadowColor = '#ff3366';
    ctx.shadowBlur = 10;
    for (let p of projectiles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);
        
        // Chip detail
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(-p.width/2 + 2, -p.height/2 + 2, 6, 4);
        
        ctx.restore();
    }
    ctx.shadowBlur = 0;

    // Draw Player (MoneyBot)
    drawToken(imgMoneyBot, player.x, player.y, player.radius, '#00ff88');
    
    // Draw Stuck Debts visually ON the player
    if (stuckDebts > 0) {
        ctx.fillStyle = '#ff3366';
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 10;
        for (let i=0; i<stuckDebts; i++) {
            const angle = (Date.now() / 500) + (i * ((Math.PI * 2) / stuckDebts));
            const orbitR = player.radius + 15;
            const sx = player.x + Math.cos(angle) * orbitR;
            const sy = player.y + Math.sin(angle) * orbitR;
            
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(angle);
            ctx.fillRect(-8, -5, 16, 10);
            ctx.restore();
        }
        ctx.shadowBlur = 0;
    }

    // Draw BrokeBot (Enemy)
    drawToken(imgBrokeBot, brokebot.x, brokebot.y, brokebot.radius, '#ff3366');
    
    // Line connecting Brokebot to player if firing soon
    if (brokebot.fireTimer > 800) {
        ctx.beginPath();
        ctx.moveTo(brokebot.x, brokebot.y);
        ctx.lineTo(player.x, player.y);
        ctx.strokeStyle = `rgba(255, 51, 102, ${(brokebot.fireTimer - 800) / 200 * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

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
    netWorth = 5000;
    timeRemaining = 60;
    stuckDebts = 0;
    projectiles = [];
    payments = [];
    particles = [];
    floatingTexts = [];
    secondTimer = 0;
    brokebot.fireTimer = 0;
    
    timeDisplay.innerText = `${timeRemaining}s`;
    nwDisplay.innerText = `$${netWorth.toLocaleString()}`;
    debtDisplay.innerText = `0 CARDS`;
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    // Play init sound if audio engine ready
    if (window.mbAudio) {
        // init interaction triggers audio ctx
        window.mbAudio.playLevelUp();
    }
}

function endGame(won) {
    gameState = 'GAMEOVER';
    gameOverScreen.classList.remove('hidden');
    
    if (won) {
        if (window.mbAudio) window.mbAudio.playLevelUp();
        endTitle.innerText = "SURVIVED!";
        endTitle.style.color = "#00ff88";
        endSubtitle.innerText = "You successfully dodged BrokeBot's debt trap!";
    } else {
        if (window.mbAudio) window.mbAudio.playGameOver();
        endTitle.innerText = "BANKRUPT!";
        endTitle.style.color = "#ff3366";
        endSubtitle.innerText = "The interest payments completely drained you.";
    }
    finalScore.innerText = `$${Math.floor(netWorth).toLocaleString()}`;
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

requestAnimationFrame(time => {
    lastTime = time;
    loop(time);
});