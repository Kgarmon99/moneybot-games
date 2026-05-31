// --- State ---
let gameState = 'START';
let cash = 100000;
let flips = 0;

// Property State
let hasProperty = false;
let debt = 0;
let propValue = 0;
let condition = 0; // 0 to 100
let basePrice = 0;

let lastTime = 0;
let tickTimer = 0;

// Config
const HOLDING_RATE = 0.05; // 5% of debt added per second as interest/taxes
const RENO_COST = 5000;
const RENO_VALUE_ADD = 9000; // Value created per click

// FX
const canvas = document.getElementById('fxCanvas');
const ctx = canvas.getContext('2d');
let cw, ch;
let particles = [];
let floatingTexts = [];

// DOM
const cashDisplay = document.getElementById('cashDisplay');
const valueDisplay = document.getElementById('valueDisplay');
const debtDisplay = document.getElementById('debtDisplay');
const btnBuy = document.getElementById('btn-buy');
const btnReno = document.getElementById('btn-renovate');
const btnSell = document.getElementById('btn-sell');
const propName = document.getElementById('prop-name');
const houseVisual = document.getElementById('house-visual');
const condWrapper = document.getElementById('condition-wrapper');
const condFill = document.getElementById('condition-fill');

// Init
function resize() {
    const rect = document.getElementById('game-container').getBoundingClientRect();
    cw = canvas.width = rect.width;
    ch = canvas.height = rect.height;
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
}
window.addEventListener('resize', resize);
resize();

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

btnBuy.addEventListener('click', buyProperty);
btnReno.addEventListener('click', renovateProperty);
btnSell.addEventListener('click', sellProperty);

function startGame() {
    gameState = 'PLAYING';
    cash = 100000;
    flips = 0;
    hasProperty = false;
    debt = 0;
    propValue = 0;
    particles = [];
    floatingTexts = [];
    
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.add('hidden');
    
    generateNewListing();
    updateUI();
    
    if(!lastTime) requestAnimationFrame(loop);
}

function generateNewListing() {
    hasProperty = false;
    debt = 0;
    condition = Math.floor(Math.random() * 20) + 10; // 10-30% starting condition
    
    // Scale up as you get richer
    const scaleMultiplier = Math.max(1, Math.floor(cash / 100000));
    basePrice = (Math.floor(Math.random() * 50) + 50) * 1000 * scaleMultiplier; // $50k - $100k
    propValue = 0;
    
    const names = ["Foreclosed Crackhouse", "Abandoned Motel", "Fire-Damaged Shack", "Meth Lab Ruins", "Moldy Duplex"];
    propName.innerText = names[Math.floor(Math.random() * names.length)];
    
    houseVisual.className = 'empty';
    condWrapper.classList.add('hidden');
    
    btnBuy.classList.remove('hidden');
    btnBuy.innerHTML = `BUY WITH HARD MONEY<br><span>$${(basePrice).toLocaleString()}</span>`;
    btnBuy.disabled = false;
    
    btnReno.classList.add('hidden');
    btnSell.classList.add('hidden');
}

function buyProperty() {
    if (window.mbAudio) window.mbAudio.playCoin();
    
    hasProperty = true;
    debt = basePrice; // We take a loan for the full purchase price
    propValue = basePrice * 0.8; // Instant depreciation on buying junk
    
    houseVisual.className = 'distressed';
    condWrapper.classList.remove('hidden');
    
    btnBuy.classList.add('hidden');
    btnReno.classList.remove('hidden');
    btnSell.classList.remove('hidden');
    
    createParticles(cw/2, ch/2, '#cc00ff', 20);
    createFloatingText(cw/2, ch/2, "LOAN ACQUIRED", '#ff3366');
    
    updateUI();
}

function renovateProperty() {
    if (cash >= RENO_COST && condition < 100) {
        cash -= RENO_COST;
        condition = Math.min(100, condition + 15);
        propValue += RENO_VALUE_ADD;
        
        if (window.mbAudio) window.mbAudio.playHit();
        
        // Visual updates
        createParticles(cw/2, ch/2 + 50, '#ffaa00', 15);
        createFloatingText(cw/2, ch/2, "+$" + RENO_VALUE_ADD.toLocaleString(), '#00ff88');
        
        houseVisual.classList.remove('shake');
        void houseVisual.offsetWidth;
        houseVisual.classList.add('shake');
        
        if (condition >= 90) {
            houseVisual.className = 'luxury';
            propName.innerText = "Luxury Flip";
            btnReno.disabled = true;
        } else if (condition >= 50) {
            houseVisual.className = 'renovated';
            propName.innerText = "Modernized Home";
        }
        
        updateUI();
    } else if (cash < RENO_COST) {
        createFloatingText(cw/2, ch/2, "OUT OF CASH!", '#ff3366');
    }
}

function sellProperty() {
    // Pay off loan, get remaining value
    const profit = propValue - debt;
    cash += profit;
    
    if (window.mbAudio) window.mbAudio.playWin();
    
    createParticles(cw/2, ch/2, profit >= 0 ? '#00ff88' : '#ff3366', 40);
    createFloatingText(cw/2, ch/2 - 50, profit >= 0 ? "PROFIT: +$" + profit.toLocaleString() : "LOSS: -$" + Math.abs(profit).toLocaleString(), profit >= 0 ? '#00ff88' : '#ff3366');
    
    flips++;
    generateNewListing();
    updateUI();
}

// --- Loop ---
function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    if (gameState === 'PLAYING') {
        update(dt);
        drawFX();
    }

    requestAnimationFrame(loop);
}

function update(dt) {
    if (hasProperty) {
        tickTimer += dt;
        if (tickTimer > 1000) { // Every 1 second
            tickTimer = 0;
            
            // Holding cost drains cash OR adds to debt if out of cash
            const interest = Math.floor(debt * HOLDING_RATE);
            debt += interest; // Hard money loans accrue fast
            
            document.getElementById('debt-box').classList.remove('pulse-red');
            void document.getElementById('debt-box').offsetWidth;
            document.getElementById('debt-box').classList.add('pulse-red');
            
            createFloatingText(cw/2 + 50, 100, "-$" + interest + " INT", '#ff3366');
            
            updateUI();
            
            // Bankruptcy check
            if (debt > propValue * 1.5 && cash < RENO_COST) {
                endGame();
            }
        }
    }
    updateParticles(dt);
}

function updateUI() {
    cashDisplay.innerText = "$" + Math.floor(cash).toLocaleString();
    
    if (hasProperty) {
        valueDisplay.innerText = "$" + Math.floor(propValue).toLocaleString();
        debtDisplay.innerText = "$" + Math.floor(debt).toLocaleString();
        
        condFill.style.width = condition + "%";
        if (condition < 40) condFill.style.backgroundColor = 'var(--mb-red)';
        else if (condition < 80) condFill.style.backgroundColor = 'var(--mb-orange)';
        else condFill.style.backgroundColor = 'var(--mb-green)';
        
        btnSell.innerHTML = `SELL PROPERTY<br><span>Lock Value</span>`;
        
        // Color debt red if underwater
        if (debt > propValue) {
            debtDisplay.style.color = 'var(--mb-red)';
        } else {
            debtDisplay.style.color = '#fff';
        }
    } else {
        valueDisplay.innerText = "$0";
        debtDisplay.innerText = "$0";
        debtDisplay.style.color = '#fff';
    }
}

function endGame() {
    gameState = 'GAMEOVER';
    if (window.mbAudio) window.mbAudio.playGameOver();
    
    document.getElementById('end-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = flips;
}

// --- FX ---
function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
            life: 1.0, color: color, size: Math.random() * 4 + 2
        });
    }
}

function createFloatingText(x, y, text, color) {
    floatingTexts.push({ x: x, y: y, text: text, color: color, life: 1.0, vy: -1.5 });
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life -= dt * 0.002;
        if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ft.y += ft.vy; ft.life -= dt * 0.001;
        if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
}

function drawFX() {
    ctx.clearRect(0, 0, cw, ch);
    for (let p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10; ctx.shadowColor = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center'; ctx.font = 'bold 20px Orbitron';
    for (let ft of floatingTexts) {
        ctx.globalAlpha = ft.life;
        ctx.fillStyle = ft.color;
        ctx.shadowBlur = 10; ctx.shadowColor = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1.0; ctx.shadowBlur = 0;
}
