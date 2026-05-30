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
let currentLevel = 1;
let netWorth = 5000;
let displayNetWorth = 5000; // For rolling numbers
let timeRemaining = 60;
let stuckDebts = 0;
let hitPauseTimer = 0; // For freeze-frame impacts

let lastTime = 0;
let secondTimer = 0;

// Level Configs
const levels = {
    1: { duration: 60, startNW: 5000, baseInterest: 100, baseFriction: 0.02, fireRateBase: 1000, fireRateMin: 200, botSpeed: 0.03 },
    2: { duration: 60, startNW: 5000, baseInterest: 150, baseFriction: 0.025, fireRateBase: 800, fireRateMin: 150, botSpeed: 0.045 },
    3: { duration: 60, startNW: 5000, baseInterest: 250, baseFriction: 0.03, fireRateBase: 600, fireRateMin: 100, botSpeed: 0.06 },
    4: { duration: 60, startNW: 5000, baseInterest: 400, baseFriction: 0.04, fireRateBase: 400, fireRateMin: 80, botSpeed: 0.08 },
    5: { duration: 60, startNW: 5000, baseInterest: 600, baseFriction: 0.05, fireRateBase: 300, fireRateMin: 50, botSpeed: 0.1 }
};

// Upgrades State
let boughtEmergency = false;
let boughtRefinance = false;
let boughtHustle = false;
let boughtLawyer = false;
let boughtEMP = false;

// UI Elements
const timeDisplay = document.getElementById('timeDisplay');
const nwDisplay = document.getElementById('nwDisplay');
const debtDisplay = document.getElementById('debtDisplay');
const nwBox = document.getElementById('nwBox');
const debtBox = document.getElementById('debtBox');
const gameContainer = document.getElementById('game-container');
const upgradesShop = document.getElementById('upgradesShop');

// Shop Buttons
const btnEmergency = document.getElementById('buyEmergency');
const btnRefinance = document.getElementById('buyRefinance');
const btnHustle = document.getElementById('buyHustle');
const btnLawyer = document.getElementById('buyLawyer');
const btnEMP = document.getElementById('buyEMP');

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const endTitle = document.getElementById('endTitle');
const endSubtitle = document.getElementById('endSubtitle');
const finalScore = document.getElementById('finalScore');
const btnStart = document.getElementById('startBtn');
const btnRestart = document.getElementById('restartBtn');
const btnNextLevel = document.getElementById('nextLevelBtn');
const levelDisplay = document.getElementById('levelDisplay');

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
    radius: 35,
    shield: false,
    hustleTimer: 0
};

const brokebot = {
    x: cw/2,
    y: 80,
    radius: 45,
    targetX: cw/2,
    fireTimer: 0,
    isPredatory: false
};

let projectiles = []; // Red credit cards
let payments = []; // Green principal payments
let powerups = []; // Emergency Fund & Side Hustle
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
            color,
            radius: Math.random() * 4 + 2 // Dynamic sizing
        });
    }
}

function createFloatingText(x, y, text, color) {
    floatingTexts.push({ x, y, text, color, life: 1 });
}

function updateGame(dt) {
    if (gameState !== 'PLAYING') return;

    // Hit Pause (Freeze frame effect)
    if (hitPauseTimer > 0) {
        hitPauseTimer -= dt;
        return; // Skip game updates to freeze time
    }

    // Rolling Numbers (Lerp display Net Worth)
    const diff = netWorth - displayNetWorth;
    if (Math.abs(diff) > 1) {
        displayNetWorth += diff * 0.1; // Smooth rolling effect
    } else {
        displayNetWorth = netWorth;
    }

    // Time & Interest Deduction
    secondTimer += dt;
    if (secondTimer > 1000) {
        timeRemaining--;
        secondTimer = 0;
        timeDisplay.innerText = `${timeRemaining}s`;
        
        // Deduct interest based on debt load
        if (stuckDebts > 0) {
            const config = levels[currentLevel] || levels[5];
            const interest = stuckDebts * config.baseInterest;
            netWorth -= interest;
            createFloatingText(player.x, player.y - 50, `-$${interest} INTEREST`, '#ff3366');
            debtBox.classList.add('flash-red');
            setTimeout(() => debtBox.classList.remove('flash-red'), 300);
        }

        if (timeRemaining <= 0) {
            endGame(netWorth > 0);
        } else if (netWorth <= 0) {
            endGame(false);
        }
    }

    nwDisplay.innerText = `$${Math.floor(displayNetWorth).toLocaleString()}`;
    debtDisplay.innerText = `${stuckDebts} CARDS`;

    // Shop Button States
    if (!boughtEmergency) btnEmergency.disabled = netWorth < 1000;
    if (!boughtRefinance) btnRefinance.disabled = netWorth < 2500;
    if (!boughtHustle) btnHustle.disabled = netWorth < 3000;
    if (!boughtLawyer) btnLawyer.disabled = netWorth < 10000;
    if (!boughtEMP) btnEMP.disabled = netWorth < 50000;

    // Hustle timer logic
    if (player.hustleTimer > 0) {
        player.hustleTimer -= dt;
        if (Math.random() < 0.1) { // Passive income from hustle
            netWorth += 10;
            createParticles(player.x, player.y, '#ffaa00', 1);
        }
    }

    // Player Movement (Debt makes you sluggish, Hustle gives you a boost)
    const config = levels[currentLevel] || levels[5];
    let friction = Math.max(0.015, 0.15 - (stuckDebts * config.baseFriction));
    if (player.hustleTimer > 0) friction = 0.25; // Even faster full speed during Side Hustle

    player.x += (mouse.x - player.x) * friction;
    player.y += (mouse.y - player.y) * friction;

    // Clamp player to screen
    player.x = Math.max(player.radius, Math.min(cw - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(ch - player.radius, player.y));

    // Brokebot Movement (Moves along the top, trying to align with player)
    brokebot.targetX = player.x;
    const botSpeed = brokebot.isPredatory ? config.botSpeed * 2 : config.botSpeed;
    brokebot.x += (brokebot.targetX - brokebot.x) * botSpeed;

    // Predatory Lending Mode (under 30s)
    if (timeRemaining <= 30 && !brokebot.isPredatory) {
        brokebot.isPredatory = true;
        createFloatingText(cw/2, ch/2, "PREDATORY MODE ENGAGED!", '#ff3366');
        gameContainer.classList.add('flash-red');
        setTimeout(() => gameContainer.classList.remove('flash-red'), 1000);
        if (window.mbAudio) window.mbAudio.playGameOver(); // Ominous sound
    }

    // Brokebot Firing
    brokebot.fireTimer += dt;
    const fireRate = Math.max(config.fireRateMin, config.fireRateBase - (config.duration - timeRemaining) * 15);
    if (brokebot.fireTimer > fireRate) {
        brokebot.fireTimer = 0;
        
        // Calculate angle to player
        const angle = Math.atan2(player.y - brokebot.y, player.x - brokebot.x);
        
        // Base shot
        projectiles.push({
            x: brokebot.x,
            y: brokebot.y,
            vx: Math.cos(angle) * 7,
            vy: Math.sin(angle) * 7,
            width: 24,
            height: 16,
            rotation: angle
        });

        // Predatory spread shot
        if (brokebot.isPredatory) {
            const spread = 0.3;
            projectiles.push({
                x: brokebot.x, y: brokebot.y,
                vx: Math.cos(angle - spread) * 7, vy: Math.sin(angle - spread) * 7,
                width: 24, height: 16, rotation: angle - spread
            });
            projectiles.push({
                x: brokebot.x, y: brokebot.y,
                vx: Math.cos(angle + spread) * 7, vy: Math.sin(angle + spread) * 7,
                width: 24, height: 16, rotation: angle + spread
            });
        }
        
        if (window.mbAudio) window.mbAudio.playSelect(); // quiet blip for shooting
    }

    // Spawn Payments randomly
    if (Math.random() < 0.012) {
        payments.push({
            x: Math.random() * (cw - 60) + 30,
            y: -20,
            vy: 3 + Math.random() * 2,
            radius: 15
        });
    }

    // Spawn Powerups randomly
    if (Math.random() < 0.015) { // 1.5% chance per frame (3x more often)
        const type = Math.random() > 0.5 ? 'SHIELD' : 'HUSTLE';
        powerups.push({
            x: Math.random() * (cw - 60) + 30,
            y: -20,
            vy: 2 + Math.random() * 2,
            radius: 12,
            type: type
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
            if (player.shield) {
                // Shield blocks the card!
                player.shield = false;
                hitPauseTimer = 50; // Freeze frame for 50ms
                createParticles(p.x, p.y, '#00ccff', 20, 1.5);
                createFloatingText(p.x, p.y, "SHIELD BROKEN!", '#00ccff');
                if (window.mbAudio) window.mbAudio.playHit(); // Crunch sound
                
                gameContainer.classList.add('flash-blue');
                setTimeout(() => gameContainer.classList.remove('flash-blue'), 200);
                
                boughtEmergency = false;
                btnEmergency.innerHTML = `<div class="bot-name">EMERGENCY FUND</div><div class="bot-roi" style="color: #00ccff">Block 1 Attack</div><div class="bot-cost">Cost: $1,000</div>`;
            } else {
                // Card sticks
                stuckDebts++;
                hitPauseTimer = 80; // Heavy freeze frame on taking damage
                createParticles(p.x, p.y, '#ff3366', 15, 1.5);
                createFloatingText(p.x, p.y, "DEBT ADDED!", '#ff3366');
                if (window.mbAudio) window.mbAudio.playHit();
                
                gameContainer.classList.add('shake');
                setTimeout(() => gameContainer.classList.remove('shake'), 300);
            }
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
                hitPauseTimer = 100; // Massive freeze frame on explosion
                createFloatingText(player.x, player.y, "DEBT CLEARED!", '#00ff88');
                createParticles(player.x, player.y, '#00ff88', 40, 3);
                if (window.mbAudio) window.mbAudio.playNoise(0.3, 0.5); // Explosion sound
                
                gameContainer.classList.add('flash-blue');
                setTimeout(() => gameContainer.classList.remove('flash-blue'), 300);
                
                stuckDebts = 0; // Clear all debt
            } else {
                createFloatingText(player.x, player.y, "+$1000", '#00ff88');
                createParticles(p.x, p.y, '#00ff88', 15, 1.5);
                if (window.mbAudio) window.mbAudio.playCoin();
            }
            
            payments.splice(i, 1);
            continue;
        }

        if (p.y > ch + 20) {
            payments.splice(i, 1);
        }
    }

    // Update Powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
        let pu = powerups[i];
        pu.y += pu.vy;
        
        const dx = pu.x - player.x;
        const dy = pu.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < player.radius + pu.radius) {
            if (pu.type === 'SHIELD') {
                player.shield = true;
                createFloatingText(player.x, player.y, "EMERGENCY FUND!", '#00ccff');
                createParticles(pu.x, pu.y, '#00ccff', 15);
                btnEmergency.innerHTML = `<div class="bot-name">EMERGENCY FUND</div><div class="bot-roi" style="color:#00ccff">ACTIVE</div>`;
                btnEmergency.disabled = true;
                boughtEmergency = true;
            } else {
                player.hustleTimer = 5000; // 5 seconds of side hustle
                createFloatingText(player.x, player.y, "SIDE HUSTLE!", '#00ff88');
                createParticles(pu.x, pu.y, '#00ff88', 15);
                btnHustle.innerHTML = `<div class="bot-name">SIDE HUSTLE</div><div class="bot-roi" style="color:#00ff88">ACTIVE</div>`;
                btnHustle.disabled = true;
                boughtHustle = true;
            }
            
            if (window.mbAudio) window.mbAudio.playLevelUp(); // Powerup sound
            powerups.splice(i, 1);
            continue;
        }

        if (pu.y > ch + 20) {
            powerups.splice(i, 1);
        }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        
        // Physics: friction
        p.vx *= 0.95;
        p.vy *= 0.95;
        
        // Physics: shrink
        p.radius *= 0.95;
        
        p.life -= dt / 500;
        if (p.life <= 0 || p.radius < 0.5) particles.splice(i, 1);
    }
    
    // Floating Text (with easing)
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ft.y -= dt * (0.05 * ft.life); // Slows down as it fades
        ft.life -= dt / 1000;
        if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
}

function draw() {
    // Advanced trail effect instead of hard clear
    ctx.fillStyle = 'rgba(5, 5, 5, 0.4)'; // Cyberpunk motion blur
    ctx.fillRect(0, 0, cw, ch);
    
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

    // Draw Powerups
    for (let pu of powerups) {
        ctx.beginPath();
        ctx.arc(pu.x, pu.y, pu.radius, 0, Math.PI*2);
        if (pu.type === 'SHIELD') {
            ctx.fillStyle = '#00ccff';
            ctx.shadowColor = '#00ccff';
        } else {
            ctx.fillStyle = '#ffaa00';
            ctx.shadowColor = '#ffaa00';
        }
        ctx.shadowBlur = 15;
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pu.type === 'SHIELD' ? '🛡️' : '⚡', pu.x, pu.y);
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
        
        // Add a subtle trail if predatory
        if (brokebot.isPredatory) {
            ctx.fillStyle = 'rgba(255, 51, 102, 0.3)';
            ctx.fillRect(-p.width, -p.height/2, p.width, p.height);
            ctx.fillStyle = '#ff3366'; // Reset for main card
        }

        ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);
        
        // Chip detail
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(-p.width/2 + 2, -p.height/2 + 2, 6, 4);
        
        ctx.restore();
    }
    ctx.shadowBlur = 0;

    // Draw Player (MoneyBot)
    drawToken(imgMoneyBot, player.x, player.y, player.radius, '#00ff88');
    
    // Draw Shield
    if (player.shield) {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 8, 0, Math.PI*2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#00ccff';
        ctx.shadowColor = '#00ccff';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Draw Hustle Glow
    if (player.hustleTimer > 0) {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 4, 0, Math.PI*2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(255, 170, 0, 0.6)';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
    
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
        if (brokebot.isPredatory) ctx.strokeStyle = `rgba(255, 51, 102, ${(brokebot.fireTimer - 800) / 200 * 0.8})`; // Thicker/more visible in predatory mode
        ctx.lineWidth = brokebot.isPredatory ? 4 : 2;
        ctx.stroke();
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
        // Pop-in scale effect
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
function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    updateGame(dt);
    draw();
    
    requestAnimationFrame(loop);
}

btnEmergency.addEventListener('click', () => {
    if (netWorth >= 1000 && !boughtEmergency) {
        netWorth -= 1000;
        boughtEmergency = true;
        btnEmergency.innerHTML = `<div class="bot-name">EMERGENCY FUND</div><div class="bot-roi" style="color:#00ccff">PURCHASED</div>`;
        btnEmergency.disabled = true;
        player.shield = true;
        createFloatingText(cw/2, ch/2, "EMERGENCY SHIELD ACTIVE!", "#00ccff");
        if (window.mbAudio) window.mbAudio.playLevelUp();
    }
});

btnRefinance.addEventListener('click', () => {
    if (netWorth >= 2500 && !boughtRefinance) {
        netWorth -= 2500;
        boughtRefinance = true;
        btnRefinance.innerHTML = `<div class="bot-name">REFINANCE</div><div class="bot-roi" style="color:#ffaa00">PURCHASED</div>`;
        btnRefinance.disabled = true;
        
        stuckDebts = Math.max(0, stuckDebts - 2);
        if (stuckDebts === 0) debtBox.classList.remove('glow-red');
        createFloatingText(cw/2, ch/2, "-2 DEBT CARDS REFINANCED!", "#ffaa00");
        createParticles(cw/2, ch/2, '#ffaa00', 20);
        if (window.mbAudio) window.mbAudio.playLevelUp();
    }
});

btnHustle.addEventListener('click', () => {
        if (netWorth >= 3000 && !boughtHustle) {
            netWorth -= 3000;
            boughtHustle = true;
            btnHustle.innerHTML = `<div class="bot-name">SIDE HUSTLE</div><div class="bot-roi" style="color:#00ff88">PURCHASED</div>`;
            btnHustle.disabled = true;
            player.hustleTimer += 5000; // Adds 5 seconds to hustle mode
            createFloatingText(cw/2, ch/2, "SIDE HUSTLE ACTIVATED!", "#00ff88");
            if (window.mbAudio) window.mbAudio.playLevelUp();
        }
    });

    btnLawyer.addEventListener('click', () => {
        if (netWorth >= 10000 && !boughtLawyer) {
            netWorth -= 10000;
            boughtLawyer = true;
            btnLawyer.innerHTML = `<div class="bot-name">BANKRUPTCY LAWYER</div><div class="bot-roi" style="color:#cc00ff">PURCHASED</div>`;
            btnLawyer.disabled = true;
        
            stuckDebts = 0;
            debtBox.classList.remove('glow-red');
            createFloatingText(cw/2, ch/2, "BANKRUPTCY DECLARED. DEBT CLEARED!", "#cc00ff");
            createParticles(cw/2, ch/2, '#cc00ff', 30);
            if (window.mbAudio) window.mbAudio.playLevelUp();
        }
    });

    btnEMP.addEventListener('click', () => {
        if (netWorth >= 50000 && !boughtEMP) {
            netWorth -= 50000;
            boughtEMP = true;
            btnEMP.innerHTML = `<div class="bot-name">SHOCKWAVE EMP</div><div class="bot-roi" style="color:#00ffff">PURCHASED</div>`;
            btnEMP.disabled = true;
        
            createFloatingText(brokebot.x, brokebot.y, "EMP SHOCKWAVE!", "#00ffff");
            createParticles(brokebot.x, brokebot.y, '#00ffff', 50);
            gameContainer.classList.add('flash-blue');
        
            setTimeout(() => {
                endGame(true, "BROKEBOT DESTROYED");
            }, 1500);
        
            if (window.mbAudio) window.mbAudio.playLevelUp();
        }
    });

    btnStart.addEventListener('click', () => startGame(true));
    btnRestart.addEventListener('click', () => startGame(true));

    function startGame(startFromLevel1 = true) {
        if (startFromLevel1) {
            currentLevel = 1;
        }
        
        const config = levels[currentLevel] || levels[5];
        gameState = 'PLAYING';
        netWorth = config.startNW;
        timeRemaining = config.duration;
        stuckDebts = 0;
        hitPauseTimer = 0;
        player.shield = false;
        player.hustleTimer = 0;
        brokebot.isPredatory = false;
        
        levelDisplay.innerText = currentLevel;
    
        // Reset Shop
        boughtEmergency = false;
        boughtRefinance = false;
        boughtHustle = false;
        boughtLawyer = false;
        boughtEMP = false;

        btnEmergency.innerHTML = `<div class="bot-name">EMERGENCY FUND</div><div class="bot-roi" style="color: #00ccff">Block 1 Attack</div><div class="bot-cost">Cost: $1,000</div>`;
        btnRefinance.innerHTML = `<div class="bot-name">REFINANCE</div><div class="bot-roi" style="color: #ffaa00">Clear 2 Debt Cards</div><div class="bot-cost">Cost: $2,500</div>`;
        btnHustle.innerHTML = `<div class="bot-name">SIDE HUSTLE</div><div class="bot-roi" style="color: #00ff88">+Speed & Income (5s)</div><div class="bot-cost">Cost: $3,000</div>`;
        btnLawyer.innerHTML = `<div class="bot-name">BANKRUPTCY LAWYER</div><div class="bot-roi" style="color: #cc00ff">Clear ALL DEBT</div><div class="bot-cost">Cost: $10,000</div>`;
        btnEMP.innerHTML = `<div class="bot-name">SHOCKWAVE EMP</div><div class="bot-roi" style="color: #00ffff">Destroy BrokeBot (Win)</div><div class="bot-cost">Cost: $50,000</div>`;
    
        [btnEmergency, btnRefinance, btnHustle, btnLawyer, btnEMP].forEach(b => b.disabled = true);
    
        projectiles = [];
        payments = [];
        powerups = [];
        particles = [];
        floatingTexts = [];
        secondTimer = 0;
        brokebot.fireTimer = 0;
    brokebot.isPredatory = false;
    player.shield = false;
    player.hustleTimer = 0;
    
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

function endGame(survived, reason = "") {
    gameState = 'GAMEOVER';
    gameOverScreen.classList.remove('hidden');
    
    if (survived) {
        if (currentLevel < 5 && reason !== "BROKEBOT DESTROYED") {
            endTitle.innerText = "LEVEL CLEARED!";
            endTitle.style.color = '#ffaa00';
            endSubtitle.innerText = `You survived Level ${currentLevel}. Ready for the next month?`;
            btnNextLevel.classList.remove('hidden');
            btnRestart.classList.add('hidden');
        } else {
            endTitle.innerText = "SURVIVED!";
            endTitle.style.color = '#00ff88';
            endSubtitle.innerText = reason ? reason : "You survived all the debt traps!";
            btnNextLevel.classList.add('hidden');
            btnRestart.classList.remove('hidden');
        }
        finalScore.innerText = `$${Math.floor(netWorth).toLocaleString()}`;
        finalScore.style.color = '#00ff88';
        if (window.mbAudio) window.mbAudio.playWin();
    } else {
        endTitle.innerText = "BANKRUPT!";
        endTitle.style.color = '#ff3366';
        endSubtitle.innerText = "The debt load crushed you.";
        finalScore.innerText = `-$${Math.abs(Math.floor(netWorth)).toLocaleString()}`;
        finalScore.style.color = '#ff3366';
        btnNextLevel.classList.add('hidden');
        btnRestart.classList.remove('hidden');
        if (window.mbAudio) window.mbAudio.playGameOver();
    }
}

document.getElementById('startBtn').addEventListener('click', () => startGame(true));
document.getElementById('restartBtn').addEventListener('click', () => startGame(true));
btnNextLevel.addEventListener('click', () => {
    currentLevel++;
    startGame(false);
});

requestAnimationFrame(time => {
    lastTime = time;
    loop(time);
});