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

// Chart data
const MAX_POINTS = 50;
let priceHistory = [];
let currentPrice = 100;
let targetPrice = 100;
let trend = 0; // -1 to 1
let volatility = 2; // 1 to 5
let phaseTimer = 0;

// Game state
let state = {
    isPlaying: false,
    timeLeft: 60,
    cash: 1000,
    shares: 0,
    avgCost: 0,
    trades: 0,
    lastTime: 0
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

function spawnFloatText(text, color) {
    const el = document.createElement('div');
    el.className = 'float-text';
    el.style.color = color;
    el.textContent = text;
    el.style.left = '50%';
    el.style.top = '40%';
    el.style.transform = 'translate(-50%, -50%)';
    document.querySelector('.chart-container').appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function updateMarket(dt) {
    phaseTimer -= dt;
    if (phaseTimer <= 0) {
        // Change market phase
        phaseTimer = 2 + Math.random() * 3;
        trend = (Math.random() - 0.5) * 2; // -1 to 1
        volatility = 1 + Math.random() * 4;
        
        if (trend > 0.5) { trendEl.textContent = '🚀 Mega Bull'; trendEl.style.color = 'var(--mb-green)'; }
        else if (trend > 0) { trendEl.textContent = '📈 Bull Run'; trendEl.style.color = 'var(--mb-green)'; }
        else if (trend > -0.5) { trendEl.textContent = '📉 Bear Market'; trendEl.style.color = 'var(--mb-red)'; }
        else { trendEl.textContent = '🩸 Market Crash'; trendEl.style.color = 'var(--mb-red)'; }
        
        volEl.textContent = `Vol: ${volatility > 3 ? 'High' : 'Normal'}`;
    }
    
    // Random walk with drift
    const noise = (Math.random() - 0.5) * volatility * 2;
    const drift = trend * (volatility / 2);
    targetPrice += noise + drift;
    
    // Boundaries (don't let price go to 0 or infinity)
    if (targetPrice < 10) targetPrice = 10 + Math.random()*10;
    if (targetPrice > 500) targetPrice = 500 - Math.random()*20;
    
    // Smooth price movement
    currentPrice += (targetPrice - currentPrice) * 10 * dt;
    
    // Add point to chart (roughly 10 times a second)
    if (Math.random() < 0.2) {
        priceHistory.push(currentPrice);
        if (priceHistory.length > MAX_POINTS) priceHistory.shift();
    }
}

function drawChart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (priceHistory.length < 2) return;
    
    const minP = Math.min(...priceHistory) * 0.9;
    const maxP = Math.max(...priceHistory) * 1.1;
    const range = maxP - minP;
    
    const dx = canvas.width / (MAX_POINTS - 1);
    
    // Determine color based on overall trend
    const isUp = priceHistory[priceHistory.length-1] >= priceHistory[0];
    const color = isUp ? '#00E676' : '#FB7185';
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2);
    ctx.stroke();
    
    // Draw fill
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for(let i=0; i<priceHistory.length; i++) {
        const x = i * dx;
        const y = canvas.height - ((priceHistory[i] - minP) / range) * canvas.height;
        ctx.lineTo(x, y);
    }
    ctx.lineTo((priceHistory.length-1)*dx, canvas.height);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, isUp ? 'rgba(0, 230, 118, 0.2)' : 'rgba(251, 113, 133, 0.2)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    for(let i=0; i<priceHistory.length; i++) {
        const x = i * dx;
        const y = canvas.height - ((priceHistory[i] - minP) / range) * canvas.height;
        if(i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Draw current price dot
    const lastX = (priceHistory.length-1)*dx;
    const lastY = canvas.height - ((priceHistory[priceHistory.length-1] - minP) / range) * canvas.height;
    
    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Draw avg cost line if holding
    if (state.shares > 0) {
        const avgY = canvas.height - ((state.avgCost - minP) / range) * canvas.height;
        if (avgY > 0 && avgY < canvas.height) {
            ctx.beginPath();
            ctx.moveTo(0, avgY); ctx.lineTo(canvas.width, avgY);
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
}

function updateUI() {
    cashEl.textContent = formatMoney(state.cash);
    portfolioEl.textContent = formatMoney(state.shares * currentPrice);
    
    buyPriceEl.textContent = `@ ${formatMoney(currentPrice)}`;
    shareCountEl.textContent = `${Math.floor(state.shares)} Shares`;
    
    // Can only buy if have enough cash for at least 1 share
    buyBtn.disabled = state.cash < currentPrice;
    
    // Can only sell if have shares
    sellBtn.disabled = state.shares <= 0;
}

function addHistoryItem(type, amount, price, profit = null) {
    const item = document.createElement('div');
    item.className = `trade-item ${type}`;
    
    let text = type === 'buy' 
        ? `Bought ${Math.floor(amount)} @ ${formatMoney(price)}`
        : `Sold ${Math.floor(amount)} @ ${formatMoney(price)}`;
        
    let rightSide = type === 'sell' && profit !== null
        ? `<span style="color: ${profit >= 0 ? 'var(--mb-green)' : 'var(--mb-red)'}">${profit >= 0 ? '+' : ''}${formatMoney(profit)}</span>`
        : '';
        
    item.innerHTML = `<span>${text}</span>${rightSide}`;
    historyEl.prepend(item);
    
    if (historyEl.children.length > 5) {
        historyEl.removeChild(historyEl.lastChild);
    }
}

function handleBuy() {
    if (!state.isPlaying || state.cash < currentPrice) return;
    
    // Buy as many shares as possible
    const sharesToBuy = Math.floor(state.cash / currentPrice);
    if (sharesToBuy <= 0) return;
    
    const cost = sharesToBuy * currentPrice;
    
    // Update avg cost
    const totalCost = (state.shares * state.avgCost) + cost;
    state.shares += sharesToBuy;
    state.avgCost = totalCost / state.shares;
    
    state.cash -= cost;
    state.trades++;
    
    addHistoryItem('buy', sharesToBuy, currentPrice);
    spawnFloatText('BOUGHT', '#00E676');
    if (navigator.vibrate) navigator.vibrate(20);
    updateUI();
}

function handleSell() {
    if (!state.isPlaying || state.shares <= 0) return;
    
    const revenue = state.shares * currentPrice;
    const profit = revenue - (state.shares * state.avgCost);
    
    addHistoryItem('sell', state.shares, currentPrice, profit);
    spawnFloatText(profit >= 0 ? `+${formatMoney(profit)}` : `-${formatMoney(Math.abs(profit))}`, profit >= 0 ? '#00E676' : '#FB7185');
    
    state.cash += revenue;
    state.shares = 0;
    state.avgCost = 0;
    state.trades++;
    
    if (navigator.vibrate) navigator.vibrate([10, 20]);
    updateUI();
}

function gameLoop(now) {
    if (!state.isPlaying) return;
    
    const dt = Math.min((now - state.lastTime) / 1000, 0.1);
    state.lastTime = now;
    
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
        endGame();
        return;
    }
    
    timerEl.textContent = Math.ceil(state.timeLeft) + 's';
    if (state.timeLeft <= 10) timerEl.style.color = 'var(--mb-red)';
    
    updateMarket(dt);
    drawChart();
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
        lastTime: performance.now()
    };
    
    currentPrice = 100;
    targetPrice = 100;
    priceHistory = Array(MAX_POINTS).fill(100);
    phaseTimer = 0;
    
    historyEl.innerHTML = '';
    timerEl.style.color = 'var(--mb-white)';
    modal.classList.remove('active');
    statsRow.style.display = 'none';
    
    resize();
    requestAnimationFrame(gameLoop);
}

function endGame() {
    state.isPlaying = false;
    
    // Auto sell remaining shares
    if (state.shares > 0) {
        state.cash += state.shares * currentPrice;
        state.shares = 0;
    }
    
    const profit = state.cash - 1000;
    const returnPct = ((state.cash - 1000) / 1000) * 100;
    
    modalIcon.textContent = profit >= 0 ? '💰' : '📉';
    modalTitle.textContent = profit >= 0 ? 'Market Wizard!' : 'Liquidated!';
    modalSubtitle.textContent = profit >= 0 ? "You beat the market." : "The market beat you.";
    
    finalValueEl.textContent = formatMoney(state.cash);
    finalReturnEl.textContent = `${returnPct > 0 ? '+' : ''}${returnPct.toFixed(1)}%`;
    finalReturnEl.style.color = returnPct >= 0 ? 'var(--mb-green)' : 'var(--mb-red)';
    tradeCountEl.textContent = state.trades;
    
    statsRow.style.display = 'flex';
    actionBtn.textContent = 'PLAY AGAIN';
    modal.classList.add('active');
    
    if (navigator.vibrate) navigator.vibrate(profit >= 0 ? [50, 50, 50] : [100, 200]);
}

buyBtn.addEventListener('click', handleBuy);
buyBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleBuy(); }, {passive: false});

sellBtn.addEventListener('click', handleSell);
sellBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleSell(); }, {passive: false});

actionBtn.addEventListener('click', startGame);
actionBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startGame(); }, {passive: false});

// Initial draw
resize();
ctx.fillStyle = '#050A12';
ctx.fillRect(0, 0, canvas.width, canvas.height);