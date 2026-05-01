const canvas = document.getElementById('chart');
const ctx = canvas.getContext('2d');
const cashEl = document.getElementById('cash');
const portfolioEl = document.getElementById('portfolio');
const timerEl = document.getElementById('timer');
const buyBtn = document.getElementById('buyBtn');
const sellBtn = document.getElementById('sellBtn');
const buyPriceEl = document.getElementById('buyPrice');
const shareCountEl = document.getElementById('shareCount');
const trendEl = document.getElementById('trend');
const volEl = document.getElementById('volatility');
const historyEl = document.getElementById('history');

// Modal
const modal = document.getElementById('modal');
const modalIcon = document.getElementById('modalIcon');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const statsRow = document.getElementById('statsRow');
const actionBtn = document.getElementById('actionBtn');
const finalValueEl = document.getElementById('finalValue');
const finalReturnEl = document.getElementById('finalReturn');
const tradeCountEl = document.getElementById('tradeCount');

// Add combo display to HTML dynamically
const comboDisplay = document.createElement('div');
comboDisplay.id = 'comboDisplay';
comboDisplay.style.cssText = 'position:absolute; top:10px; left:50%; transform:translateX(-50%); font-size:14px; font-weight:800; color:#FBBF24; text-align:center; opacity:0; transition:all 0.3s; z-index:10;';
document.querySelector('.chart-container').appendChild(comboDisplay);

// Event overlay
const eventOverlay = document.createElement('div');
eventOverlay.id = 'eventOverlay';
eventOverlay.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:32px; font-weight:900; text-shadow:0 0 30px rgba(255,255,255,0.5); pointer-events:none; opacity:0; transition:all 0.5s; z-index:20; text-align:center;';
document.querySelector('.chart-container').appendChild(eventOverlay);

// Chart data
const MAX_POINTS = 60;
let priceHistory = [];
let candleData = []; // {open, high, low, close}
let currentPrice = 100;
let targetPrice = 100;
let trend = 0;
let volatility = 2;
let phaseTimer = 0;

// Game state
let state = {
    isPlaying: false,
    timeLeft: 60,
    cash: 1000,
    shares: 0,
    avgCost: 0,
    trades: 0,
    lastTime: 0,
    
    // Combo system
    combo: 0,
    comboMultiplier: 1,
    lastTradeProfit: 0,
    
    // Power-ups
    powerUps: {
        timeFreeze: { active: false, duration: 0 },
        doubleProfit: { active: false, duration: 0 },
        autoSell: { active: false, duration: 0, targetPrice: 0 }
    },
    
    // Events
    currentEvent: null,
    eventTimer: 0,
    
    // Particles
    particles: [],
    screenShake: 0
};

// Event types
const MARKET_EVENTS = {
    FLASH_CRASH: { name: '💥 FLASH CRASH', color: '#FB7185', effect: 'price', value: -30, duration: 3 },
    BULL_RUN: { name: '🚀 BULL RUN', color: '#00E676', effect: 'price', value: 25, duration: 4 },
    WHALE_PUMP: { name: '🐋 WHALE PUMP', color: '#38BDF8', effect: 'price', value: 40, duration: 2 },
    TIME_FREEZE: { name: '❄️ TIME FREEZE', color: '#A78BFA', effect: 'powerup', powerup: 'timeFreeze', duration: 5 },
    DOUBLE_UP: { name: '💎 DOUBLE UP', color: '#FBBF24', effect: 'powerup', powerup: 'doubleProfit', duration: 8 }
};

function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resize);
resize();

function formatMoney(num) {
    return '$' + num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function spawnParticle(x, y, color, type = 'spark') {
    state.particles.push({
        x, y, color, type,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200 - 100,
        life: 1.0,
        size: Math.random() * 4 + 2
    });
}

function spawnExplosion(x, y, color) {
    for(let i = 0; i < 15; i++) {
        spawnParticle(x, y, color);
    }
}

function spawnFloatText(text, color, size = '20px', duration = 1000) {
    const el = document.createElement('div');
    el.className = 'float-text';
    el.style.cssText = `color:${color}; font-size:${size}; position:absolute; left:50%; top:40%; transform:translate(-50%,-50%); font-weight:900; pointer-events:none; animation:floatUp ${duration}ms ease-out forwards; z-index:50;`;
    el.textContent = text;
    document.querySelector('.chart-container').appendChild(el);
    setTimeout(() => el.remove(), duration);
}

function updateComboDisplay() {
    if (state.combo > 1) {
        comboDisplay.innerHTML = `🔥 COMBO x${state.combo}<br><span style="font-size:12px;color:#00E676">${state.comboMultiplier.toFixed(1)}x PROFIT</span>`;
        comboDisplay.style.opacity = '1';
        comboDisplay.style.transform = 'translateX(-50%) scale(1.2)';
        setTimeout(() => {
            comboDisplay.style.transform = 'translateX(-50%) scale(1)';
        }, 100);
    } else {
        comboDisplay.style.opacity = '0';
    }
}

function triggerEvent() {
    const events = Object.keys(MARKET_EVENTS);
    const eventKey = events[Math.floor(Math.random() * events.length)];
    const event = MARKET_EVENTS[eventKey];
    
    state.currentEvent = event;
    state.eventTimer = event.duration;
    
    // Visual feedback
    eventOverlay.innerHTML = event.name;
    eventOverlay.style.color = event.color;
    eventOverlay.style.opacity = '1';
    eventOverlay.style.transform = 'translate(-50%,-50%) scale(1.5)';
    
    setTimeout(() => {
        eventOverlay.style.transform = 'translate(-50%,-50%) scale(1)';
    }, 100);
    
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    
    // Apply effect
    if (event.effect === 'price') {
        targetPrice = Math.max(10, currentPrice + event.value);
        volatility = 5;
    } else if (event.effect === 'powerup') {
        state.powerUps[event.powerup].active = true;
        state.powerUps[event.powerup].duration = event.duration;
        spawnFloatText(`${event.powerup.toUpperCase()} ACTIVATED!`, event.color, '16px', 2000);
    }
    
    setTimeout(() => {
        eventOverlay.style.opacity = '0';
        state.currentEvent = null;
    }, event.duration * 1000);
}

function updateMarket(dt) {
    // Handle power-ups
    Object.keys(state.powerUps).forEach(key => {
        const pu = state.powerUps[key];
        if (pu.active) {
            pu.duration -= dt;
            if (pu.duration <= 0) {
                pu.active = false;
                if (key === 'autoSell' && state.shares > 0) {
                    handleSell(true);
                }
            }
        }
    });
    
    // Time freeze effect
    const timeScale = state.powerUps.timeFreeze.active ? 0.2 : 1;
    
    // Event timer
    if (state.eventTimer > 0) {
        state.eventTimer -= dt;
    }
    
    phaseTimer -= dt;
    if (phaseTimer <= 0 && !state.currentEvent) {
        phaseTimer = 1.5 + Math.random() * 2;
        trend = (Math.random() - 0.5) * 2;
        volatility = state.currentEvent ? 5 : (1 + Math.random() * 3);
        
        // Random event trigger (15% chance)
        if (Math.random() < 0.15 && state.timeLeft < 55) {
            triggerEvent();
        }
        
        if (trend > 0.5) { trendEl.textContent = '🚀 MEGA BULL'; trendEl.style.color = '#00FF41'; trendEl.style.textShadow = '0 0 10px #00FF41'; }
        else if (trend > 0.2) { trendEl.textContent = '📈 BULL RUN'; trendEl.style.color = '#00FF41'; trendEl.style.textShadow = 'none'; }
        else if (trend > -0.2) { trendEl.textContent = '🔄 CHOPPY'; trendEl.style.color = '#FBBF24'; trendEl.style.textShadow = 'none'; }
        else if (trend > -0.5) { trendEl.textContent = '📉 BEARISH'; trendEl.style.color = '#FF003C'; trendEl.style.textShadow = 'none'; }
        else { trendEl.textContent = '🩸 CRASHING'; trendEl.style.color = '#FF003C'; trendEl.style.textShadow = '0 0 10px #FF003C'; }
        
        volEl.textContent = `Vol: ${volatility > 3 ? 'EXTREME' : volatility > 2 ? 'HIGH' : 'NORMAL'}`;
    }
    
    // Random walk with momentum
    const noise = (Math.random() - 0.5) * volatility * 3;
    const momentum = trend * volatility;
    targetPrice += (noise + momentum) * timeScale;
    
    if (targetPrice < 5) { targetPrice = 10; trend = 0.5; }
    if (targetPrice > 300) { targetPrice = 280; trend = -0.5; }
    
    currentPrice += (targetPrice - currentPrice) * 8 * dt * timeScale;
    
    // Update candle data
    if (Math.random() < 0.15 * timeScale) {
        const lastCandle = candleData[candleData.length - 1];
        if (lastCandle && !lastCandle.closed) {
            lastCandle.close = currentPrice;
            lastCandle.high = Math.max(lastCandle.high, currentPrice);
            lastCandle.low = Math.min(lastCandle.low, currentPrice);
            if (Math.random() < 0.3) {
                lastCandle.closed = true;
            }
        } else {
            candleData.push({
                open: currentPrice,
                high: currentPrice,
                low: currentPrice,
                close: currentPrice,
                closed: false
            });
        }
        
        if (candleData.length > MAX_POINTS) candleData.shift();
    }
    
    // Auto-sell check
    if (state.powerUps.autoSell.active && state.shares > 0 && currentPrice >= state.powerUps.autoSell.targetPrice) {
        handleSell(true);
        state.powerUps.autoSell.active = false;
    }
}

function drawChart() {
    ctx.save();
    
    // Screen shake
    if (state.screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * state.screenShake, (Math.random() - 0.5) * state.screenShake);
        state.screenShake *= 0.9;
        if (state.screenShake < 0.5) state.screenShake = 0;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (candleData.length < 2) {
        ctx.restore();
        return;
    }
    
    const prices = candleData.map(c => c.close);
    const minP = Math.min(...prices) * 0.95;
    const maxP = Math.max(...prices) * 1.05;
    const range = maxP - minP || 1;
    
    const candleWidth = canvas.width / MAX_POINTS * 0.7;
    const spacing = canvas.width / MAX_POINTS;
    
    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        const y = canvas.height - (i / 4) * canvas.height;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    
    // Draw candles
    candleData.forEach((candle, i) => {
        const x = i * spacing + spacing / 2;
        const yOpen = canvas.height - ((candle.open - minP) / range) * canvas.height;
        const yClose = canvas.height - ((candle.close - minP) / range) * canvas.height;
        const yHigh = canvas.height - ((candle.high - minP) / range) * canvas.height;
        const yLow = canvas.height - ((candle.low - minP) / range) * canvas.height;
        
        const isGreen = candle.close >= candle.open;
        const color = isGreen ? '#00FF41' : '#FF003C';
        
        ctx.shadowBlur = 5;
        ctx.shadowColor = color;
        
        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();
        
        // Body
        ctx.fillStyle = color;
        const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
        const bodyY = Math.min(yOpen, yClose);
        ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
        
        ctx.shadowBlur = 0;
    });
    
    // Draw current price indicator
    const lastCandle = candleData[candleData.length - 1];
    const lastY = canvas.height - ((lastCandle.close - minP) / range) * canvas.height;
    
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, lastY);
    ctx.lineTo(canvas.width, lastY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Price tag
    ctx.fillStyle = '#000000';
    ctx.fillRect(canvas.width - 70, lastY - 15, 70, 20);
    ctx.fillStyle = '#00F0FF';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00F0FF';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(formatMoney(currentPrice), canvas.width - 5, lastY - 2);
    ctx.shadowBlur = 0;
    
    // Draw avg cost line if holding
    if (state.shares > 0) {
        const avgY = canvas.height - ((state.avgCost - minP) / range) * canvas.height;
        if (avgY > 0 && avgY < canvas.height) {
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(0, avgY);
            ctx.lineTo(canvas.width, avgY);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = '#FBBF24';
            ctx.font = '11px Inter';
            ctx.textAlign = 'left';
            ctx.fillText('YOUR COST', 10, avgY - 5);
        }
    }
    
    ctx.restore();
}

function updateParticles(dt) {
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 300 * dt; // Gravity
        p.life -= dt * 2;
        
        if (p.life <= 0) {
            state.particles.splice(i, 1);
        } else {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
}

function updateUI() {
    cashEl.textContent = formatMoney(state.cash);
    
    const portfolioValue = state.shares * currentPrice;
    portfolioEl.textContent = formatMoney(portfolioValue);
    
    // Color code portfolio based on profit/loss
    if (state.shares > 0) {
        const profit = portfolioValue - (state.shares * state.avgCost);
        portfolioEl.style.color = profit >= 0 ? '#00E676' : '#FB7185';
    } else {
        portfolioEl.style.color = '#FBBF24';
    }
    
    buyPriceEl.textContent = `@ ${formatMoney(currentPrice)}`;
    shareCountEl.textContent = `${Math.floor(state.shares)} Shares`;
    
    buyBtn.disabled = state.cash < currentPrice;
    sellBtn.disabled = state.shares <= 0;
    
    // Update button states for power-ups
    if (state.powerUps.doubleProfit.active) {
        buyBtn.style.boxShadow = '0 0 20px #FBBF24';
        sellBtn.style.boxShadow = '0 0 20px #FBBF24';
    } else {
        buyBtn.style.boxShadow = '';
        sellBtn.style.boxShadow = '';
    }
}

function addHistoryItem(type, amount, price, profit = null) {
    const item = document.createElement('div');
    item.className = `trade-item ${type}`;
    
    const isProfit = profit && profit >= 0;
    const profitText = profit !== null 
        ? `<span style="color: ${isProfit ? '#00E676' : '#FB7185'}; font-size:11px;">${isProfit ? '▲' : '▼'} ${formatMoney(Math.abs(profit))}</span>`
        : '';
    
    let text = type === 'buy' 
        ? `Bought ${Math.floor(amount)} shares`
        : `Sold ${Math.floor(amount)} shares @ ${formatMoney(price)}`;
        
    item.innerHTML = `<span>${text}</span>${profitText}`;
    item.style.animation = 'slideIn 0.3s ease-out';
    historyEl.prepend(item);
    
    if (historyEl.children.length > 6) {
        historyEl.removeChild(historyEl.lastChild);
    }
}

function handleBuy(fromAuto = false) {
    if (!state.isPlaying || state.cash < currentPrice) return;
    
    const maxShares = Math.floor(state.cash / currentPrice);
    const sharesToBuy = fromAuto ? maxShares : maxShares;
    if (sharesToBuy <= 0) return;
    
    const cost = sharesToBuy * currentPrice;
    
    const totalCost = (state.shares * state.avgCost) + cost;
    state.shares += sharesToBuy;
    state.avgCost = totalCost / state.shares;
    state.cash -= cost;
    state.trades++;
    
    // Auto-sell setup if not already active
    if (!state.powerUps.autoSell.active && !fromAuto) {
        state.powerUps.autoSell.targetPrice = currentPrice * 1.15; // Auto sell at 15% profit
    }
    
    addHistoryItem('buy', sharesToBuy, currentPrice);
    spawnFloatText(`BOUGHT ${sharesToBuy}`, '#00E676', '18px');
    
    // Visual effects
    const rect = buyBtn.getBoundingClientRect();
    const containerRect = canvas.getBoundingClientRect();
    spawnExplosion(rect.left - containerRect.left + rect.width/2, rect.top - containerRect.top, '#00E676');
    
    if (navigator.vibrate) navigator.vibrate(15);
    updateUI();
}

function handleSell(fromAuto = false) {
    if (!state.isPlaying || state.shares <= 0) return;
    
    const revenue = state.shares * currentPrice;
    const costBasis = state.shares * state.avgCost;
    let profit = revenue - costBasis;
    
    // Apply combo multiplier
    if (profit > 0) {
        profit *= state.comboMultiplier;
        state.combo++;
        state.comboMultiplier = 1 + (state.combo * 0.25); // 25% more per combo
    } else {
        state.combo = 0;
        state.comboMultiplier = 1;
    }
    
    // Apply double profit power-up
    if (state.powerUps.doubleProfit.active && profit > 0) {
        profit *= 2;
    }
    
    const finalRevenue = costBasis + profit;
    
    addHistoryItem('sell', state.shares, currentPrice, profit);
    
    // Visual effects
    const rect = sellBtn.getBoundingClientRect();
    const containerRect = canvas.getBoundingClientRect();
    
    if (profit > 0) {
        spawnFloatText(`+${formatMoney(profit)}`, '#00E676', `${20 + Math.min(state.combo * 3, 20)}px`);
        spawnExplosion(rect.left - containerRect.left + rect.width/2, rect.top - containerRect.top, '#00E676');
        state.screenShake = Math.min(profit / 50, 10);
        
        // Big profit celebration
        if (profit > 100) {
            spawnFloatText('NICE TRADE!', '#FBBF24', '24px', 1500);
            if (navigator.vibrate) navigator.vibrate([30, 30, 30, 30]);
        }
    } else {
        spawnFloatText(`${formatMoney(profit)}`, '#FB7185', '18px');
        spawnExplosion(rect.left - containerRect.left + rect.width/2, rect.top - containerRect.top, '#FB7185');
    }
    
    state.cash += finalRevenue;
    state.shares = 0;
    state.avgCost = 0;
    state.trades++;
    
    updateComboDisplay();
    updateUI();
}

function gameLoop(now) {
    if (!state.isPlaying) return;
    
    const dt = Math.min((now - state.lastTime) / 1000, 0.1);
    state.lastTime = now;
    
    const timeScale = state.powerUps.timeFreeze.active ? 0.2 : 1;
    state.timeLeft -= dt * timeScale;
    
    if (state.timeLeft <= 0) {
        endGame();
        return;
    }
    
    timerEl.textContent = Math.ceil(state.timeLeft) + 's';
    if (state.timeLeft <= 10) {
        timerEl.style.color = '#FB7185';
        timerEl.style.textShadow = '0 0 20px rgba(251,113,133,0.5)';
        if (Math.floor(state.timeLeft) !== Math.floor(state.timeLeft + dt * timeScale)) {
            if (navigator.vibrate) navigator.vibrate(50);
        }
    }
    
    updateMarket(dt);
    drawChart();
    updateParticles(dt);
    updateUI();
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    state = {
        isPlaying: true,
        timeLeft: 60,
        cash: 1000,
        shares: 0,
        avgCost: 0,
        trades: 0,
        lastTime: performance.now(),
        combo: 0,
        comboMultiplier: 1,
        lastTradeProfit: 0,
        powerUps: {
            timeFreeze: { active: false, duration: 0 },
            doubleProfit: { active: false, duration: 0 },
            autoSell: { active: false, duration: 0, targetPrice: 0 }
        },
        currentEvent: null,
        eventTimer: 0,
        particles: [],
        screenShake: 0
    };
    
    currentPrice = 100;
    targetPrice = 100;
    candleData = [];
    for (let i = 0; i < 10; i++) {
        candleData.push({
            open: 100, high: 100, low: 100, close: 100, closed: true
        });
    }
    phaseTimer = 0;
    
    historyEl.innerHTML = '';
    timerEl.style.color = '#fff';
    timerEl.style.textShadow = 'none';
    comboDisplay.style.opacity = '0';
    
    modal.classList.remove('active');
    statsRow.style.display = 'none';
    
    resize();
    requestAnimationFrame(gameLoop);
}

function endGame() {
    state.isPlaying = false;
    
    if (state.shares > 0) {
        const revenue = state.shares * currentPrice;
        state.cash += revenue;
    }
    
    const profit = state.cash - 1000;
    const returnPct = ((state.cash - 1000) / 1000) * 100;
    
    // Determine rank
    let rank = 'Paper Hands';
    let rankEmoji = '📄';
    if (returnPct >= 500) { rank = 'Wall Street Legend'; rankEmoji = '👑'; }
    else if (returnPct >= 300) { rank = 'Diamond Hands'; rankEmoji = '💎'; }
    else if (returnPct >= 150) { rank = 'Market Master'; rankEmoji = '🏆'; }
    else if (returnPct >= 50) { rank = 'Smart Money'; rankEmoji = '🧠'; }
    else if (returnPct >= 0) { rank = 'Break Even'; rankEmoji = '😐'; }
    
    modalIcon.textContent = rankEmoji;
    modalTitle.textContent = rank;
    modalSubtitle.innerHTML = profit >= 0 
        ? `You turned $1,000 into <b>${formatMoney(state.cash)}</b>!<br>Combo streak: ${state.combo}x` 
        : `You lost ${formatMoney(Math.abs(profit))}.<br>Better luck next time!`;
    
    finalValueEl.textContent = formatMoney(state.cash);
    finalReturnEl.textContent = `${returnPct > 0 ? '+' : ''}${returnPct.toFixed(1)}%`;
    finalReturnEl.style.color = returnPct >= 0 ? '#00E676' : '#FB7185';
    tradeCountEl.textContent = state.trades;
    
    statsRow.style.display = 'flex';
    actionBtn.textContent = 'TRADE AGAIN';
    modal.classList.add('active');
    
    if (navigator.vibrate) navigator.vibrate(returnPct >= 0 ? [50, 50, 100] : [200]);
}

// Event listeners
buyBtn.addEventListener('click', handleBuy);
buyBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleBuy(); }, {passive: false});

sellBtn.addEventListener('click', handleSell);
sellBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleSell(); }, {passive: false});

actionBtn.addEventListener('click', startGame);
actionBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startGame(); }, {passive: false});

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
    if (!state.isPlaying) return;
    if (e.code === 'Space' || e.key === 'b' || e.key === 'B') handleBuy();
    if (e.code === 'Enter' || e.key === 's' || e.key === 'S') handleSell();
});

// Initial draw
resize();
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, canvas.width, canvas.height);
