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
const imgVenture = new Image(); imgVenture.src = '../assets/moneybot-driving.svg';
const imgIndex = new Image(); imgIndex.src = '../assets/moneybot-idle.svg';
const imgFire = new Image(); imgFire.src = '../assets/moneybot-celebrating.svg';
const imgBroke = new Image(); imgBroke.src = '../assets/brokebot.jpg';

// Game State
let gameState = 'START';
let netWorth = 0;
let displayNetWorth = 0;
let passiveIncome = 0;
let displayPassiveIncome = 0;
let hitPauseTimer = 0;

const GOAL = 10000000;

// Upgrades & Modifiers
let clickValue = 10;
let globalMult = 1;
let autoClicker = false;
let autoClickTimer = 0;
let boughtAutoClicker = false;
let boughtOverclock = false;
let boughtCoffee = false;
let boughtFrenzyCap = false;
let boughtFirewall = false;
let boughtQuantum = false;
let boughtCompound = false;

// Frenzy
let frenzyMeter = 0;
let isFrenzy = false;

// UI
const nwDisplay = document.getElementById('nwDisplay');
const roiDisplay = document.getElementById('roiDisplay');
const btnWork = document.getElementById('manualWorkBtn');
const manualText = document.getElementById('manualText');
const manualIcon = document.getElementById('manualIcon');
const comboFill = document.getElementById('comboFill');
const vignette = document.getElementById('vignette');
const gameContainer = document.getElementById('game-container');
const nwBox = document.getElementById('nwBox');

const btnYield = document.getElementById('buyYieldBot');
const btnGrowth = document.getElementById('buyGrowthBot');
const btnGold = document.getElementById('buyGoldBot');
const btnVenture = document.getElementById('buyVentureBot');
const btnIndex = document.getElementById('buyIndexBot');
const btnFire = document.getElementById('buyFireBot');

const tabBots = document.getElementById('tabBots');
const tabUpgrades = document.getElementById('tabUpgrades');
const botsShop = document.getElementById('botsShop');
const upgradesShop = document.getElementById('upgradesShop');

const btnCoffee = document.getElementById('buyCoffee');
const btnAutoClick = document.getElementById('buyAutoClick');
const btnFrenzyCap = document.getElementById('buyFrenzyCap');
const btnOverclock = document.getElementById('buyOverclock');
const btnFirewall = document.getElementById('buyFirewall');
const btnQuantum = document.getElementById('buyQuantum');
const btnCompound = document.getElementById('buyCompound');

const costs = {
    yield: 100,
    growth: 500,
    gold: 5000,
    venture: 25000,
    index: 100000,
    fire: 1000000
};

const yields = {
    yield: 5,
    growth: 30,
    gold: 500,
    venture: 3000,
    index: 15000,
    fire: 200000
};

// Entities
let bots = [];
let liabilities = [];
let particles = [];
let floatingTexts = [];
let packets = [];
let shockwaves = [];
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

// Shop Tabs
tabBots.addEventListener('click', () => {
    tabBots.classList.add('active');
    tabUpgrades.classList.remove('active');
    botsShop.classList.remove('hidden');
    upgradesShop.classList.add('hidden');
});

tabUpgrades.addEventListener('click', () => {
    tabUpgrades.classList.add('active');
    tabBots.classList.remove('active');
    upgradesShop.classList.remove('hidden');
    botsShop.classList.add('hidden');
});

function updateShopUI() {
    // Update bot ROIs globally
    document.getElementById('roi-yield').innerText = `+$${(yields.yield * globalMult).toLocaleString()} / sec`;
    document.getElementById('roi-growth').innerText = `+$${(yields.growth * globalMult).toLocaleString()} / sec`;
    document.getElementById('roi-gold').innerText = `+$${(yields.gold * globalMult).toLocaleString()} / sec`;
    document.getElementById('roi-venture').innerText = `+$${(yields.venture * globalMult).toLocaleString()} / sec`;
    document.getElementById('roi-index').innerText = `+$${(yields.index * globalMult).toLocaleString()} / sec`;
    document.getElementById('roi-fire').innerText = `+$${(yields.fire * globalMult).toLocaleString()} / sec`;
}

// Interactions
btnWork.addEventListener('pointerdown', (e) => {
    if (gameState !== 'PLAYING') return;
    executeManualClick();
});

function executeManualClick() {
    const amt = clickValue * globalMult * (isFrenzy ? 5 : 1);
    netWorth += amt;
    hitPauseTimer = isFrenzy ? 25 : 10;
    
    if (window.mbAudio) {
        if (isFrenzy) window.mbAudio.playCoin(); 
        else window.mbAudio.playSelect();
    }
    
    // Add frenzy
    if (!isFrenzy) {
        frenzyMeter += 15;
        if (frenzyMeter >= 100) {
            isFrenzy = true;
            frenzyMeter = 100;
            vignette.classList.add('frenzy');
            gameContainer.classList.add('frenzy-shake');
            if (window.mbAudio) window.mbAudio.playLevelUp();
            createFloatingText(cw/2, ch/2, "FRENZY MODE!", "#00ccff");
        }
    }
    
    // Visuals
    const rect = btnWork.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    
    // Squeeze effect
    btnWork.style.transform = 'scale(0.9)';
    setTimeout(() => btnWork.style.transform = 'none', 50);

    createFloatingText(cx + (Math.random()-0.5)*40, cy - 30 + (Math.random()-0.5)*20, `+$${amt}`, isFrenzy ? "#00ccff" : "#00ff88");
    createParticles(cx, cy, isFrenzy ? '#00ccff' : '#00ff88', isFrenzy ? 10 : 5);
    
    // Pulse HUD immediately
    nwBox.classList.remove('hud-pulse');
    void nwBox.offsetWidth;
    nwBox.classList.add('hud-pulse');
}

function buyBot(type) {
    if (netWorth >= costs[type]) {
        netWorth -= costs[type];
        passiveIncome += (yields[type] * globalMult);
        
        let color, img;
        if (type === 'yield') { color = '#00ff88'; img = imgYield; }
        else if (type === 'growth') { color = '#ffaa00'; img = imgGrowth; }
        else if (type === 'gold') { color = '#ffcc00'; img = imgGold; }
        else if (type === 'venture') { color = '#cc00ff'; img = imgVenture; }
        else if (type === 'index') { color = '#00ffff'; img = imgIndex; }
        else { color = '#ff3300'; img = imgFire; }
        
        bots.push({
            x: Math.random() * (cw - 80) + 40,
            y: -100, // Drop from sky
            targetY: Math.random() * (ch - 380) + 180,
            radius: window.innerWidth < 600 ? 25 : 35, // Smaller bots on mobile
            type: type,
            color: color,
            img: img,
            timer: 0,
            pulse: 0,
            landed: false
        });
        
        if (window.mbAudio) window.mbAudio.playCoin();
    }
}

btnYield.addEventListener('click', () => buyBot('yield'));
btnGrowth.addEventListener('click', () => buyBot('growth'));
btnGold.addEventListener('click', () => buyBot('gold'));
btnVenture.addEventListener('click', () => buyBot('venture'));
btnIndex.addEventListener('click', () => buyBot('index'));
btnFire.addEventListener('click', () => buyBot('fire'));

btnCoffee.addEventListener('click', () => {
    if (netWorth >= 500 && !boughtCoffee) {
        netWorth -= 500;
        boughtCoffee = true;
        clickValue = 50;
        btnCoffee.innerHTML = `<div class="bot-name">COFFEE MACHINE</div><div class="bot-roi">PURCHASED</div>`;
        btnCoffee.disabled = true;
        createFloatingText(cw/2, ch/2, "CAFFEINE BOOST!", "#00ff88");
        if (window.mbAudio) window.mbAudio.playLevelUp();
    }
});

btnAutoClick.addEventListener('click', () => {
    if (netWorth >= 2500 && !boughtAutoClicker) {
        netWorth -= 2500;
        boughtAutoClicker = true;
        autoClicker = true;
        btnAutoClick.innerHTML = `<div class="bot-name">AUTO-CLICKER</div><div class="bot-roi">PURCHASED</div>`;
        btnAutoClick.disabled = true;
        createFloatingText(cw/2, ch/2, "AUTO-CLICKER ONLINE!", "#00ccff");
        if (window.mbAudio) window.mbAudio.playLevelUp();
    }
});

btnFrenzyCap.addEventListener('click', () => {
    if (netWorth >= 10000 && !boughtFrenzyCap) {
        netWorth -= 10000;
        boughtFrenzyCap = true;
        btnFrenzyCap.innerHTML = `<div class="bot-name">FRENZY CAP</div><div class="bot-roi">PURCHASED</div>`;
        btnFrenzyCap.disabled = true;
        createFloatingText(cw/2, ch/2, "FRENZY CAPACITY UPGRADED!", "#00ccff");
        if (window.mbAudio) window.mbAudio.playLevelUp();
    }
});

btnOverclock.addEventListener('click', () => {
    if (netWorth >= 25000 && !boughtOverclock) {
        netWorth -= 25000;
        boughtOverclock = true;
        globalMult *= 2;
        passiveIncome *= 2; 
        updateShopUI();
        
        btnOverclock.innerHTML = `<div class="bot-name">OVERCLOCK</div><div class="bot-roi">PURCHASED</div>`;
        btnOverclock.disabled = true;
        createFloatingText(cw/2, ch/2, "SYSTEM OVERCLOCK ACTIVE!", "#ffaa00");
        if (window.mbAudio) window.mbAudio.playLevelUp();
    }
});

btnFirewall.addEventListener('click', () => {
    if (netWorth >= 100000 && !boughtFirewall) {
        netWorth -= 100000;
        boughtFirewall = true;
        btnFirewall.innerHTML = `<div class="bot-name">FIREWALL</div><div class="bot-roi">PURCHASED</div>`;
        btnFirewall.disabled = true;
        createFloatingText(cw/2, ch/2, "SECURITY FIREWALL ONLINE!", "#00ff88");
        if (window.mbAudio) window.mbAudio.playLevelUp();
    }
});

btnQuantum.addEventListener('click', () => {
    if (netWorth >= 500000 && !boughtQuantum) {
        netWorth -= 500000;
        boughtQuantum = true;
        globalMult *= 3;
        passiveIncome *= 3; 
        updateShopUI();
        
        btnQuantum.innerHTML = `<div class="bot-name">QUANTUM COMP</div><div class="bot-roi">PURCHASED</div>`;
        btnQuantum.disabled = true;
        createFloatingText(cw/2, ch/2, "QUANTUM ALGORITHMS ACTIVE!", "#cc00ff");
        if (window.mbAudio) window.mbAudio.playLevelUp();
    }
});

btnCompound.addEventListener('click', () => {
    if (netWorth >= 5000000 && !boughtCompound) {
        netWorth -= 5000000;
        boughtCompound = true;
        globalMult *= 5;
        passiveIncome *= 5; 
        updateShopUI();
        
        btnCompound.innerHTML = `<div class="bot-name">COMPOUND ENGINE</div><div class="bot-roi">PURCHASED</div>`;
        btnCompound.disabled = true;
        createFloatingText(cw/2, ch/2, "EXPONENTIAL GROWTH ACHIEVED!", "#ffaa00");
        if (window.mbAudio) window.mbAudio.playLevelUp();
    }
});

// Click to destroy liabilities
window.addEventListener('pointerdown', (e) => {
    if (gameState !== 'PLAYING') return;
    const mx = e.clientX;
    const my = e.clientY;
    
    for (let i = liabilities.length - 1; i >= 0; i--) {
        let l = liabilities[i];
        const dist = Math.hypot(mx - l.x, my - l.y);
        if (dist < l.radius + 15) {
            liabilities.splice(i, 1);
            createParticles(l.x, l.y, '#ff3366', 30, 3);
            createFloatingText(l.x, l.y, "DESTROYED!", "#00ff88");
            if (window.mbAudio) window.mbAudio.playHit();
            hitPauseTimer = 50;
            break;
        }
    }
});

function updateGame(dt) {
    if (gameState !== 'PLAYING') return;

    if (hitPauseTimer > 0) {
        hitPauseTimer -= dt;
        return;
    }

    // Auto Clicker
    if (autoClicker) {
        autoClickTimer += dt;
        if (autoClickTimer >= 200) { // 5x sec
            autoClickTimer -= 200;
            executeManualClick();
        }
    }

    // Frenzy Logic
    if (!isFrenzy) {
        if (frenzyMeter > 0) frenzyMeter -= dt * (boughtFrenzyCap ? 0.01 : 0.02); // Drain slowly
    } else {
        frenzyMeter -= dt * (boughtFrenzyCap ? 0.025 : 0.05); // Frenzy drains over time
        if (frenzyMeter <= 0) {
            isFrenzy = false;
            vignette.classList.remove('frenzy');
            gameContainer.classList.remove('frenzy-shake');
        }
    }
    comboFill.style.width = Math.min(100, Math.max(0, frenzyMeter)) + '%';
    
    if (isFrenzy) {
        manualText.innerHTML = `FRENZY MODE<br>+$${clickValue * globalMult * 5}`;
        btnWork.style.borderColor = '#00ccff';
        btnWork.style.color = '#fff';
    } else {
        manualText.innerHTML = `MANUAL LABOR<br>+$${clickValue * globalMult}`;
        btnWork.style.borderColor = '#00ff88';
        btnWork.style.color = '#00ff88';
    }

    // Shop button states
    btnYield.disabled = netWorth < costs.yield;
    btnGrowth.disabled = netWorth < costs.growth;
    btnGold.disabled = netWorth < costs.gold;
    btnVenture.disabled = netWorth < costs.venture;
    btnIndex.disabled = netWorth < costs.index;
    btnFire.disabled = netWorth < costs.fire;
    
    if (!boughtCoffee) btnCoffee.disabled = netWorth < 500;
    if (!boughtAutoClicker) btnAutoClick.disabled = netWorth < 2500;
    if (!boughtFrenzyCap) btnFrenzyCap.disabled = netWorth < 10000;
    if (!boughtOverclock) btnOverclock.disabled = netWorth < 25000;
    if (!boughtFirewall) btnFirewall.disabled = netWorth < 100000;
    if (!boughtQuantum) btnQuantum.disabled = netWorth < 500000;
    if (!boughtCompound) btnCompound.disabled = netWorth < 5000000;

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

    // Update Bots (Generate Packets)
    for (let b of bots) {
        if (!b.landed) {
            b.y += (b.targetY - b.y) * 0.2;
            if (Math.abs(b.targetY - b.y) < 2) {
                b.y = b.targetY;
                b.landed = true;
                shockwaves.push({x: b.x, y: b.y, radius: b.radius, maxRadius: 150, life: 1, color: b.color});
                createParticles(b.x, b.y, b.color, 30, 2);
                if (window.mbAudio) window.mbAudio.playHit();
                gameContainer.classList.add('shake');
                setTimeout(() => gameContainer.classList.remove('shake'), 200);
            }
        } else {
            b.timer += dt * (isFrenzy ? 2 : 1); // Overclock during frenzy
            if (b.pulse > 0) b.pulse -= dt * 0.005;
            
            if (b.timer >= 1000) { 
                b.timer -= 1000;
                const amt = yields[b.type] * globalMult;
                
                // Shoot packet to HUD
                const nwRect = nwBox.getBoundingClientRect();
                packets.push({
                    x: b.x, y: b.y,
                    tx: nwRect.left + nwRect.width/2,
                    ty: nwRect.bottom, // Target bottom of HUD instead of middle for better tracking on mobile
                    amt: amt,
                    color: b.color,
                    speed: 15 + Math.random() * 10
                });
                
                b.pulse = 10;
                createFloatingText(b.x, b.y - b.radius, `+$${amt}`, b.color);
            }
            
            // Gentle float
            b.y = b.targetY + Math.sin(Date.now() / 300 + b.x) * 5;
        }
    }

    // Update Packets (Visual Economy)
    for (let i = packets.length - 1; i >= 0; i--) {
        let p = packets[i];
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist < p.speed) {
            netWorth += p.amt;
            hitPauseTimer = 10;
            
            nwBox.classList.remove('hud-pulse');
            void nwBox.offsetWidth;
            nwBox.classList.add('hud-pulse');
            
            createParticles(p.tx, p.ty, p.color, 8);
            if (window.mbAudio && Math.random() < 0.2) window.mbAudio.playCoin(); 
            packets.splice(i, 1);
        } else {
            p.x += (dx/dist) * p.speed;
            p.y += (dy/dist) * p.speed;
            if (Math.random() > 0.5) createParticles(p.x, p.y, p.color, 1, 0.2); // Trail
        }
    }

    // Spawn Liabilities (BrokeBots)
    if (bots.length > 0 && Math.random() < 0.002 + (passiveIncome / 500000)) {
        const targetBot = bots[Math.floor(Math.random() * bots.length)];
        if (targetBot.landed) {
            liabilities.push({
                x: Math.random() < 0.5 ? -50 : cw + 50,
                y: Math.random() * ch,
                radius: 30,
                target: targetBot,
                attached: false
            });
            if (window.mbAudio) window.mbAudio.playGameOver();
        }
    }

    // Update Liabilities
    for (let i = liabilities.length - 1; i >= 0; i--) {
        let l = liabilities[i];
        
        if (!l.attached) {
            const dx = l.target.x - l.x;
            const dy = l.target.y - l.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < 10) {
                l.attached = true;
                l.x = l.target.x + 20;
                l.y = l.target.y - 20;
                createFloatingText(l.x, l.y, "VIRUS ATTACHED!", "#ff3366");
                gameContainer.classList.add('shake');
                setTimeout(() => gameContainer.classList.remove('shake'), 200);
            } else {
                l.x += (dx / dist) * 2;
                l.y += (dy / dist) * 2;
            }
        } else {
            l.x = l.target.x + 20; 
            l.y = l.target.y - 20;
            
            if (Math.random() < 0.05) { 
                const drain = Math.floor(yields[l.target.type] * globalMult * (boughtFirewall ? 0.1 : 0.5));
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
    
    // Update Shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
        let s = shockwaves[i];
        s.radius += (s.maxRadius - s.radius) * 0.1;
        s.life -= 0.05;
        if (s.life <= 0) shockwaves.splice(i, 1);
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
    ctx.fillStyle = 'rgba(5, 5, 8, 0.4)';
    ctx.fillRect(0, 0, cw, ch);
    
    // Draw Connections between bots (Factory Network)
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const connectDist = window.innerWidth < 600 ? 150 : 250; // Shorter lines on mobile
    for (let i = 0; i < bots.length; i++) {
        if (!bots[i].landed) continue;
        for (let j = i + 1; j < bots.length; j++) {
            if (!bots[j].landed) continue;
            const dist = Math.hypot(bots[i].x - bots[j].x, bots[i].y - bots[j].y);
            if (dist < connectDist) {
                ctx.moveTo(bots[i].x, bots[i].y);
                ctx.lineTo(bots[j].x, bots[j].y);
            }
        }
    }
    ctx.stroke();

    // Draw data pulses on the network lines
    const time = Date.now() / 1000;
    ctx.fillStyle = '#00ff88';
    for (let i = 0; i < bots.length; i++) {
        if (!bots[i].landed) continue;
        for (let j = i + 1; j < bots.length; j++) {
            if (!bots[j].landed) continue;
            const dist = Math.hypot(bots[i].x - bots[j].x, bots[i].y - bots[j].y);
            if (dist < connectDist) {
                const t = (time * 2 + i + j) % 1; 
                const px = bots[i].x + (bots[j].x - bots[i].x) * t;
                const py = bots[i].y + (bots[j].y - bots[i].y) * t;
                ctx.beginPath();
                ctx.arc(px, py, window.innerWidth < 600 ? 2 : 3, 0, Math.PI*2);
                ctx.fill();
            }
        }
    }

    // Draw Shockwaves
    for (let s of shockwaves) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2);
        ctx.strokeStyle = s.color;
        ctx.globalAlpha = s.life;
        ctx.lineWidth = 5 * s.life;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    // Draw Packets (Visual Economy)
    for (let p of packets) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI*2);
        ctx.fillStyle = '#fff';
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

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
        if (l.attached) {
            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(l.target.x, l.target.y);
            ctx.strokeStyle = '#ff3366';
            ctx.lineWidth = boughtFirewall ? 1 : 3;
            ctx.stroke();
        }
        drawToken(imgBroke, l.x, l.y, l.radius, '#ff3366');
    }

    // Particles
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
        ctx.font = window.innerWidth < 600 ? 'bold 18px Courier New' : 'bold 24px Courier New';
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
    clickValue = 10;
    globalMult = 1;
    autoClicker = false;
    autoClickTimer = 0;
    boughtAutoClicker = false;
    boughtOverclock = false;
    boughtCoffee = false;
    boughtFrenzyCap = false;
    boughtFirewall = false;
    boughtQuantum = false;
    boughtCompound = false;
    
    // Reset Buttons text and state
    btnCoffee.innerHTML = `<div class="bot-name">COFFEE MACHINE</div><div class="bot-roi">+$50 / Click</div><div class="bot-cost">Cost: $500</div>`;
    btnAutoClick.innerHTML = `<div class="bot-name">AUTO-CLICKER</div><div class="bot-roi">5 Clicks / sec</div><div class="bot-cost">Cost: $2,500</div>`;
    btnFrenzyCap.innerHTML = `<div class="bot-name">FRENZY CAP</div><div class="bot-roi">2x Frenzy Duration</div><div class="bot-cost">Cost: $10,000</div>`;
    btnOverclock.innerHTML = `<div class="bot-name">OVERCLOCK</div><div class="bot-roi">Global 2x Yield</div><div class="bot-cost">Cost: $25,000</div>`;
    btnFirewall.innerHTML = `<div class="bot-name">FIREWALL</div><div class="bot-roi">80% Less Virus Drain</div><div class="bot-cost">Cost: $100,000</div>`;
    btnQuantum.innerHTML = `<div class="bot-name">QUANTUM COMP</div><div class="bot-roi">Global 3x Yield</div><div class="bot-cost">Cost: $500,000</div>`;
    btnCompound.innerHTML = `<div class="bot-name">COMPOUND ENGINE</div><div class="bot-roi">Global 5x Yield</div><div class="bot-cost">Cost: $5,000,000</div>`;
    
    updateShopUI();
    bots = [];
    liabilities = [];
    particles = [];
    floatingTexts = [];
    packets = [];
    shockwaves = [];
    hitPauseTimer = 0;
    frenzyMeter = 0;
    isFrenzy = false;
    
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