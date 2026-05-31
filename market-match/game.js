// game.js
// --- Realistic Asset Pool ---
const stockPool = [
    // --- Index Funds (Low Risk, Steady) ---
    { ticker: "VOO", name: "S&P 500 ETF", pe: 24, div: "1.4%", risk: "low", drift: 0.003, vol: 0.015, hype: "The Warren Buffett special. Boring but prints money.", isGood: true },
    { ticker: "QQQ", name: "Nasdaq 100", pe: 32, div: "0.6%", risk: "med", drift: 0.004, vol: 0.025, hype: "Heavy on tech. High growth, higher drops.", isGood: true },
    { ticker: "SCHD", name: "US Dividend Equity", pe: 15, div: "3.5%", risk: "low", drift: 0.002, vol: 0.012, hype: "Boomer stocks that pay you cash every quarter.", isGood: true },
    
    // --- Mega-Cap Tech (High Quality, Medium Risk) ---
    { ticker: "AAPL", name: "Apple Inc.", pe: 28, div: "0.5%", risk: "med", drift: 0.0035, vol: 0.02, hype: "They sell $1000 phones to everyone on Earth.", isGood: true },
    { ticker: "MSFT", name: "Microsoft", pe: 35, div: "0.8%", risk: "med", drift: 0.004, vol: 0.02, hype: "Owning enterprise software and AI.", isGood: true },
    { ticker: "NVDA", name: "NVIDIA", pe: 75, div: "0.02%", risk: "high", drift: 0.006, vol: 0.04, hype: "AI GPUs go brrrrr. Priced for absolute perfection.", isGood: true },
    { ticker: "AMZN", name: "Amazon", pe: 60, div: "0%", risk: "med", drift: 0.0035, vol: 0.025, hype: "They control the cloud and your front porch.", isGood: true },
    { ticker: "META", name: "Meta Platforms", pe: 26, div: "0.4%", risk: "med", drift: 0.003, vol: 0.03, hype: "Billions of users, printing ad revenue.", isGood: true },
    
    // --- Value & Blue Chip (Low Volatility, Dividends) ---
    { ticker: "JNJ", name: "Johnson Products", pe: 14, div: "3.0%", risk: "low", drift: 0.0015, vol: 0.01, hype: "Band-aids and baby powder. Recession proof.", isGood: true },
    { ticker: "KO", name: "Coca-Cola", pe: 23, div: "3.1%", risk: "low", drift: 0.0015, vol: 0.01, hype: "Sugar water that pays a reliable dividend.", isGood: true },
    { ticker: "JPM", name: "JPMorgan Chase", pe: 12, div: "2.5%", risk: "med", drift: 0.0025, vol: 0.02, hype: "The fortress bank. Too big to fail.", isGood: true },
    { ticker: "XOM", name: "Exxon Mobil", pe: 13, div: "3.2%", risk: "med", drift: 0.002, vol: 0.025, hype: "Oil money. Highly tied to commodities.", isGood: true },

    // --- High Growth / Speculative (High Risk) ---
    { ticker: "TSLA", name: "Tesla Inc.", pe: 65, div: "0%", risk: "high", drift: 0.003, vol: 0.05, hype: "It's an AI company, not a car company!!", isGood: false },
    { ticker: "PLTR", name: "Palantir", pe: 250, div: "0%", risk: "high", drift: 0.004, vol: 0.06, hype: "Government AI contracts. Cult following.", isGood: false },
    { ticker: "UBER", name: "Uber Tech", pe: 85, div: "0%", risk: "med", drift: 0.003, vol: 0.035, hype: "Finally profitable, but margins are thin.", isGood: true },
    { ticker: "HOOD", name: "Robinhood", pe: 40, div: "0%", risk: "high", drift: 0.002, vol: 0.05, hype: "The casino where retail traders lose money.", isGood: false },

    // --- Meme Stocks & Crypto (Extreme Risk, Rug Pulls) ---
    { ticker: "GME", name: "GameStop", pe: "N/A", div: "0%", risk: "extreme", drift: -0.005, vol: 0.15, hype: "DIAMOND HANDS! APES TOGETHER STRONG!", isGood: false },
    { ticker: "AMC", name: "AMC Entertainment", pe: "N/A", div: "0%", risk: "extreme", drift: -0.008, vol: 0.12, hype: "Free popcorn for shareholders!", isGood: false },
    { ticker: "DJT", name: "Trump Media", pe: "N/A", div: "0%", risk: "extreme", drift: -0.01, vol: 0.20, hype: "Fundamentals do not matter here.", isGood: false },
    { ticker: "BTC", name: "Bitcoin", pe: "N/A", div: "0%", risk: "high", drift: 0.005, vol: 0.06, hype: "Digital gold. Halving cycle incoming.", isGood: true },
    { ticker: "DOGE", name: "Dogecoin", pe: "N/A", div: "0%", risk: "extreme", drift: -0.002, vol: 0.18, hype: "Much wow. Very currency.", isGood: false },
    
    // --- Value Traps & Bankruptcies (The Losers) ---
    { ticker: "WE", name: "WeWork", pe: "N/A", div: "0%", risk: "extreme", drift: -0.05, vol: 0.1, hype: "Community-adjusted EBITDA is the future.", isGood: false },
    { ticker: "PTON", name: "Peloton", pe: "N/A", div: "0%", risk: "high", drift: -0.01, vol: 0.08, hype: "Everyone bought one in 2020. Now they are coat racks.", isGood: false }
];

// --- State ---
let gameState = 'START';
let portfolio = [];
let cash = 10000;
let portfolioValue = 0;
let currentDay = 1;
let cardQueue = [];
let activeCardEl = null;

// Juice State
let streak = 0;
let comboMultiplier = 1;
let particles = [];
let floatingTexts = [];
let lastTime = 0;
let marketTimer = 0;

// --- DOM Elements ---
const canvas = document.getElementById('fxCanvas');
const ctx = canvas.getContext('2d');
let cw, ch;

const nwDisplay = document.getElementById('nwDisplay');
const cashDisplay = document.getElementById('cashDisplay');
const yearDisplay = document.getElementById('yearDisplay');
const cardContainer = document.getElementById('card-container');
const comboMeter = document.getElementById('combo-meter');
const gameContainer = document.getElementById('game-container');

// --- Initialization ---
function resize() {
    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;
    
    // Fix iOS 100vh issue dynamically if 100dvh isn't supported perfectly
    const doc = document.documentElement;
    doc.style.setProperty('--app-height', `${window.innerHeight}px`);
}
window.addEventListener('resize', resize);
resize();

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('btn-pass').addEventListener('click', () => handleSwipe('left'));
document.getElementById('btn-buy').addEventListener('click', () => handleSwipe('right'));

function startGame() {
    gameState = 'PLAYING';
    portfolio = [];
    cash = 10000;
    portfolioValue = 0;
    currentDay = 1;
    streak = 0;
    comboMultiplier = 1;
    particles = [];
    floatingTexts = [];
    cardQueue = [];
    
    // Fill initial queue
    for(let i=0; i<5; i++) generateStock();
    
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.add('hidden');
    gameContainer.classList.remove('glitch');
    
    updateUI();
    renderNextCard();
    
    if(!lastTime) requestAnimationFrame(loop);
}

// --- Infinite Queue ---
function generateStock() {
    const base = stockPool[Math.floor(Math.random() * stockPool.length)];
    // Deep copy
    cardQueue.push(JSON.parse(JSON.stringify(base)));
}

// --- Main Loop (Juice & Market) ---
function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    if (gameState === 'PLAYING') {
        drawFX(dt);
        
        // Market Ticks every 1.5 seconds
        marketTimer += dt;
        if (marketTimer > 1500 && portfolio.length > 0) {
            marketTimer = 0;
            simulateMarket();
        }
    }

    requestAnimationFrame(loop);
}

function simulateMarket() {
    let dayProfit = 0;
    currentDay++;
    
    // Simulate macro market sentiment (-2% to +2% daily market baseline)
    const macroSentiment = (Math.random() - 0.45) * 0.04;

    portfolio.forEach(pos => {
        const divString = pos.stock.div.replace('%', '');
        const divYield = parseFloat(divString) || 0;

        // Realistic Price Action (Random Walk with Drift)
        // drift = expected daily return. vol = daily volatility spread.
        const stockNoise = (Math.random() - 0.5) * pos.stock.vol;
        let percentChange = pos.stock.drift + stockNoise + macroSentiment;
        
        // Meme stocks have a rare chance to violently squeeze, but generally bleed out
        if (pos.stock.risk === 'extreme') {
            if (Math.random() < 0.05) { // 5% chance of a massive pump
                percentChange += (Math.random() * 0.5 + 0.2);
                createFloatingText(cw/2, ch/2 - 100, `🚀 ${pos.stock.ticker} MOON!`, '#cc00ff');
            } else if (Math.random() < 0.15) { // 15% chance of a heavy 20% rug pull
                percentChange -= 0.20;
                gameContainer.classList.add('glitch');
                setTimeout(() => gameContainer.classList.remove('glitch'), 300);
            }
        }

        const gain = pos.value * percentChange;
        pos.value += gain;
        dayProfit += gain;
        
        // Dividend payout logic (simulate quarterly dividend spread across random days)
        if (divYield > 0 && Math.random() < 0.05) { // 5% chance per tick to pay out
            const payout = pos.value * (divYield / 100 / 4); // roughly quarterly slice
            cash += payout;
            createFloatingText(cw/2 - 50, 50, `+$${Math.floor(payout)} DIV (${pos.stock.ticker})`, '#00ff88');
        }
    });

    // Update total portfolio value
    portfolioValue = portfolio.reduce((sum, pos) => sum + pos.value, 0);
    
    // UI Feedback for market movement
    if (dayProfit > 0) {
        createFloatingText(cw/2 + 50, 50, `+$${Math.floor(dayProfit)}`, '#00ff88');
    } else if (dayProfit < 0) {
        createFloatingText(cw/2 + 50, 50, `-$${Math.floor(Math.abs(dayProfit))}`, '#ff3366');
    }

    // End condition (Ran out of money and portfolio tanked)
    if (cash < 1000 && portfolioValue < 1000) {
        endGame();
    }

    updateUI();
}

// --- UI & Rendering ---
function updateUI() {
    cashDisplay.innerText = `$${Math.floor(cash).toLocaleString()}`;
    nwDisplay.innerText = `$${Math.floor(portfolioValue).toLocaleString()}`;
    yearDisplay.innerText = currentDay;
    
    if (streak >= 3) {
        comboMeter.classList.remove('hidden');
        comboMeter.innerText = `STREAK x${comboMultiplier}`;
    } else {
        comboMeter.classList.add('hidden');
    }
}

function createCardHTML(stock) {
    const isPEGood = typeof stock.pe === 'number' && stock.pe > 0 && stock.pe < 30;
    const isDivGood = stock.div !== "0%";

    return `
        <div class="card-header">
            <h2 class="card-ticker">${stock.ticker}</h2>
            <p class="card-company">${stock.name}</p>
        </div>
        <div class="card-body">
            <div class="data-row ${isPEGood ? 'good' : 'bad'}">
                <span class="data-label">P/E Ratio</span>
                <span class="data-value">${stock.pe}</span>
            </div>
            <div class="data-row ${isDivGood ? 'good' : 'bad'}">
                <span class="data-label">Dividend Yield</span>
                <span class="data-value">${stock.div}</span>
            </div>
            <div class="data-row">
                <span class="data-label">Risk Profile</span>
                <span class="data-value" style="text-transform: uppercase;">${stock.risk}</span>
            </div>
            <div class="hype-meter">
                <span class="hype-label">SOCIAL HYPE</span>
                <span class="hype-quote">"${stock.hype}"</span>
            </div>
        </div>
        <div class="stamp buy">BUY</div>
        <div class="stamp pass">PASS</div>
    `;
}

function renderNextCard() {
    cardContainer.innerHTML = '';
    
    // Ensure queue has items
    if (cardQueue.length < 3) {
        for(let i=0; i<3; i++) generateStock();
    }

    const stock = cardQueue.shift();
    const card = document.createElement('div');
    card.className = 'stock-card';
    card.innerHTML = createCardHTML(stock);
    cardContainer.appendChild(card);
    activeCardEl = card;

    // Hammer.js Swipe Setup
    const hammer = new Hammer(card);
    hammer.on('pan', (e) => {
        const x = e.deltaX;
        const rotate = x * 0.05;
        card.style.transform = `translate(${x}px, ${e.deltaY}px) rotate(${rotate}deg)`;
        
        // Show stamps
        const buyStamp = card.querySelector('.stamp.buy');
        const passStamp = card.querySelector('.stamp.pass');
        if (x > 50) {
            buyStamp.style.opacity = Math.min(1, (x-50)/100);
            buyStamp.style.transform = `scale(1) rotate(-15deg)`;
            passStamp.style.opacity = 0;
        } else if (x < -50) {
            passStamp.style.opacity = Math.min(1, Math.abs(x+50)/100);
            passStamp.style.transform = `scale(1) rotate(15deg)`;
            buyStamp.style.opacity = 0;
        } else {
            buyStamp.style.opacity = 0;
            passStamp.style.opacity = 0;
        }
        
        // Emit sparks on hard pan
        if (Math.abs(e.velocityX) > 1 && Math.random() < 0.3) {
            createParticles(e.center.x, e.center.y, x > 0 ? '#00ff88' : '#ff3366', 1);
        }
    });

    hammer.on('panend', (e) => {
        const x = e.deltaX;
        if (x > 100 || e.velocityX > 0.8) {
            handleSwipe('right', stock);
        } else if (x < -100 || e.velocityX < -0.8) {
            handleSwipe('left', stock);
        } else {
            card.style.transform = '';
            card.querySelector('.stamp.buy').style.opacity = 0;
            card.querySelector('.stamp.pass').style.opacity = 0;
        }
    });
}

function handleSwipe(direction, passedStock = null) {
    if (!activeCardEl) return;
    
    const stock = passedStock || cardQueue[0]; // fallback
    const flyX = direction === 'right' ? cw : -cw;
    
    activeCardEl.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
    activeCardEl.style.transform = `translate(${flyX}px, -100px) rotate(${flyX * 0.05}deg)`;
    activeCardEl.style.opacity = 0;

    const rect = activeCardEl.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;

    if (direction === 'right') {
        if (cash >= 1000) {
            // BUY ACTION
            const buyAmount = 1000 * comboMultiplier;
            if (cash >= buyAmount) {
                cash -= buyAmount;
                portfolio.push({ stock: stock, value: buyAmount });
                portfolioValue += buyAmount;
                
                if (stock.isGood) {
                    // Good Buy
                    streak++;
                    comboMultiplier = Math.min(5, 1 + Math.floor(streak/3));
                    if (window.mbAudio) window.mbAudio.playCoin();
                    createParticles(cx, cy, '#00ff88', 30);
                    createFloatingText(cx, cy, `-$${buyAmount}`, '#00ff88');
                    gameContainer.classList.remove('glitch');
                    gameContainer.classList.remove('flash-red');
                    
                    // Flash screen green
                    gameContainer.classList.remove('flash-green');
                    void gameContainer.offsetWidth; // trigger reflow
                    gameContainer.classList.add('flash-green');
                } else {
                    // BAD BUY (Meme stock)
                    streak = 0;
                    comboMultiplier = 1;
                    if (window.mbAudio) window.mbAudio.playHit();
                    createParticles(cx, cy, '#ff3366', 40);
                    createFloatingText(cx, cy, `MEME STOCK!`, '#ff3366');
                    
                    // Glitch the screen
                    gameContainer.classList.add('glitch');
                    gameContainer.classList.remove('flash-red');
                    void gameContainer.offsetWidth; 
                    gameContainer.classList.add('flash-red');
                }
            } else {
                createFloatingText(cx, cy, `NOT ENOUGH CASH!`, '#ffaa00');
            }
        }
    } else {
        // PASS ACTION
        if (window.mbAudio) window.mbAudio.playHit();
        createParticles(cx, cy, '#888', 15);
    }

    updateUI();

    setTimeout(() => {
        activeCardEl = null;
        renderNextCard();
    }, 250); // Faster snap to next card
}

function endGame() {
    gameState = 'GAMEOVER';
    gameContainer.classList.remove('glitch');
    
    let finalValue = cash + portfolioValue;

    document.getElementById('end-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = `$${Math.floor(finalValue).toLocaleString()}`;
    
    if (finalValue > 10000) {
        document.getElementById('end-title').innerText = "PROFITABLE!";
        document.getElementById('end-title').style.color = "#00ff88";
        document.getElementById('end-desc').innerText = `You survived ${currentDay} days in the market and made money.`;
        if (window.mbAudio) window.mbAudio.playWin();
    } else {
        document.getElementById('end-title').innerText = "LIQUIDATED.";
        document.getElementById('end-title').style.color = "#ff3366";
        document.getElementById('end-desc').innerText = `You held the bag on meme stocks and lost everything.`;
        if (window.mbAudio) window.mbAudio.playGameOver();
    }
}

// --- FX Engine (Particles & Floating Text) ---
function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            life: 1.0,
            color: color,
            size: Math.random() * 4 + 2
        });
    }
}

function createFloatingText(x, y, text, color) {
    floatingTexts.push({
        x: x,
        y: y,
        text: text,
        color: color,
        life: 1.0,
        vy: -2
    });
}

function drawFX(dt) {
    ctx.clearRect(0, 0, cw, ch);
    
    // Draw Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt * 0.001; // 1 second life
        
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
    }
    
    // Draw Floating Text
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px Orbitron';
    
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        let ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.life -= dt * 0.0008;
        
        if (ft.life <= 0) {
            floatingTexts.splice(i, 1);
            continue;
        }
        
        ctx.globalAlpha = ft.life;
        ctx.fillStyle = ft.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
    }
    
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
}