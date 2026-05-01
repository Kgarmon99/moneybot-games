const TARGET_WEALTH = 100;
const START_TIME = 120; // seconds
const BASE_ASSET_PRICE = 10;
const MAX_INFLATION = 10.0;
const INFLATION_PER_PRINT = 0.02;
const CASH_PER_PRINT = 5;
const INFLATION_COOLING_RATE = 0.05; // per second

let state = {
    cash: 0,
    wealth: 0,
    inflation: 1.0,
    timeLeft: START_TIME,
    isPlaying: false,
    lastTick: 0
};

// Elements
const wealthEl = document.getElementById('wealth-display');
const timeEl = document.getElementById('time-display');
const cashEl = document.getElementById('cash-display');
const priceEl = document.getElementById('price-display');
const buyBtn = document.getElementById('buy-btn');
const inflationTextEl = document.getElementById('inflation-text');
const inflationBarEl = document.getElementById('inflation-bar');
const printerBtn = document.getElementById('printer-btn');
const particlesEl = document.getElementById('particles');
const mascotImg = document.getElementById('mascot-img');
const mascotSpeech = document.getElementById('mascot-speech');

// Modals
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalBtn = document.getElementById('modal-btn');

function formatMoney(num) {
    return '$' + Math.floor(num).toLocaleString();
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function getCurrentAssetPrice() {
    return BASE_ASSET_PRICE * state.inflation;
}

function getInflationPercentage() {
    return Math.floor((state.inflation - 1.0) * 100);
}

function spawnText(x, y, text, color = 'var(--mb-green-soft)') {
    const el = document.createElement('div');
    el.className = 'pop-text';
    el.textContent = text;
    el.style.color = color;
    el.style.left = `${x - 20}px`;
    el.style.top = `${y - 20}px`;
    particlesEl.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function updateHUD() {
    wealthEl.textContent = `${state.wealth} / ${TARGET_WEALTH}`;
    timeEl.textContent = formatTime(Math.max(0, state.timeLeft));
    cashEl.textContent = formatMoney(state.cash);
    
    const currentPrice = getCurrentAssetPrice();
    priceEl.textContent = formatMoney(currentPrice);
    
    // Inflation UI
    const infPct = getInflationPercentage();
    inflationTextEl.textContent = `${infPct}%`;
    
    // Max 1000% visual bar
    const barPct = Math.min(100, (infPct / 900) * 100); 
    inflationBarEl.style.width = `${barPct}%`;

    // Buy Button State
    buyBtn.disabled = state.cash < currentPrice;

    // Visual Warnings
    if (state.inflation > 8.0) {
        inflationTextEl.classList.add('danger');
        printerBtn.classList.add('overheat');
        mascotImg.className = 'panic';
        showSpeech("IT'S WORTHLESS!");
    } else if (state.inflation > 5.0) {
        inflationTextEl.classList.add('danger');
        printerBtn.classList.add('overheat');
        mascotImg.className = 'nervous';
        showSpeech("Slow down! Prices!");
    } else if (state.inflation > 2.0) {
        inflationTextEl.classList.remove('danger');
        printerBtn.classList.remove('overheat');
        mascotImg.className = '';
        showSpeech("Inflation rising...");
    } else {
        inflationTextEl.classList.remove('danger');
        printerBtn.classList.remove('overheat');
        mascotImg.className = '';
        hideSpeech();
    }
}

let speechTimeout;
function showSpeech(text) {
    mascotSpeech.textContent = text;
    mascotSpeech.classList.add('show');
    clearTimeout(speechTimeout);
    speechTimeout = setTimeout(() => hideSpeech(), 2000);
}

function hideSpeech() {
    mascotSpeech.classList.remove('show');
}

function handlePrint(e) {
    if (!state.isPlaying) return;

    state.cash += CASH_PER_PRINT;
    state.inflation += INFLATION_PER_PRINT;

    let x = e.clientX || (window.innerWidth / 2);
    let y = e.clientY || (window.innerHeight * 0.8);
    if (e.touches && e.touches.length > 0) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
    }
    
    x += (Math.random() - 0.5) * 40;
    y += (Math.random() - 0.5) * 40;

    spawnText(x, y, `+$${CASH_PER_PRINT}`);
    updateHUD();

    if (navigator.vibrate) navigator.vibrate(15);
}

function handleBuy(e) {
    if (!state.isPlaying) return;
    
    const price = getCurrentAssetPrice();
    if (state.cash >= price) {
        state.cash -= price;
        state.wealth += 1;
        
        let x = e.clientX || (window.innerWidth / 2);
        let y = e.clientY || 100;
        
        spawnText(x, y, "+1 Asset", "var(--mb-gold)");
        priceEl.classList.add('price-pulse');
        setTimeout(() => priceEl.classList.remove('price-pulse'), 400);
        
        if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
        updateHUD();
    }
}

function endGame(win, reason) {
    state.isPlaying = false;
    modal.classList.add('active');
    
    if (win) {
        modalTitle.textContent = "Economic Master!";
        modalTitle.style.color = "var(--mb-green)";
        modalDesc.textContent = "You secured real wealth before the bubble burst. " + reason;
    } else {
        modalTitle.textContent = "Economy Collapsed!";
        modalTitle.style.color = "var(--mb-red)";
        modalDesc.textContent = reason;
    }
    modalBtn.textContent = "PLAY AGAIN";
}

function startGame() {
    state = {
        cash: 0,
        wealth: 0,
        inflation: 1.0,
        timeLeft: START_TIME,
        isPlaying: true,
        lastTick: performance.now()
    };
    modal.classList.remove('active');
    updateHUD();
    requestAnimationFrame(gameLoop);
}

function gameLoop(now) {
    if (!state.isPlaying) return;

    const dt = (now - state.lastTick) / 1000;
    state.lastTick = now;

    // Time decay
    state.timeLeft -= dt;

    // Inflation cooling
    if (state.inflation > 1.0) {
        state.inflation -= INFLATION_COOLING_RATE * dt;
        if (state.inflation < 1.0) state.inflation = 1.0;
    }

    updateHUD();

    // Check Win/Loss
    if (state.wealth >= TARGET_WEALTH) {
        endGame(true, `Finished with ${formatTime(state.timeLeft)} remaining.`);
        return;
    }
    
    if (state.inflation >= MAX_INFLATION) {
        endGame(false, `Hyperinflation! A loaf of bread costs $1,000,000. Your cash is worthless.`);
        return;
    }

    if (state.timeLeft <= 0) {
        endGame(false, "Time's up! You didn't acquire enough real assets.");
        return;
    }

    requestAnimationFrame(gameLoop);
}

// Events
printerBtn.addEventListener('mousedown', handlePrint);
printerBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handlePrint(e); }, {passive: false});

buyBtn.addEventListener('click', handleBuy);
modalBtn.addEventListener('click', startGame);

// Init state (Modal is visible by default)
updateHUD();