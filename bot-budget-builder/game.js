// Budget Boss Logic
let state = {
    month: 1,
    income: 3000,
    netWorth: 0,
    emergency: 0,
    budget: {}, // current month allocation
    investments: 0
};

const categories = [
    { id: 'housing', name: 'Housing & Utils', icon: '🏠', min: 1000, default: 1000 },
    { id: 'food', name: 'Food & Groceries', icon: '🛒', min: 300, default: 300 },
    { id: 'transport', name: 'Transport', icon: '🚗', min: 200, default: 200 },
    { id: 'fun', name: 'Lifestyle & Fun', icon: '🎉', min: 0, default: 100 },
    { id: 'emergency', name: 'Emergency Fund', icon: '🛡️', min: 0, default: 0 },
    { id: 'invest', name: 'Investments', icon: '📈', min: 0, default: 0 }
];

const events = [
    { title: "Flat Tire!", desc: "You ran over a nail. Need a new tire.", cost: -200, type: 'expense' },
    { title: "Medical Bill", desc: "Unexpected trip to urgent care.", cost: -400, type: 'expense' },
    { title: "Wedding Trip", desc: "Your friend is getting married out of state.", cost: -500, type: 'expense' },
    { title: "Appliance Broke", desc: "The fridge died.", cost: -300, type: 'expense' },
    { title: "Speeding Ticket", desc: "Caught going 15 over.", cost: -150, type: 'expense' },
    { title: "Bonus!", desc: "Crushed it at work. Take home extra cash.", cost: 300, type: 'income' },
    { title: "Quiet Month", desc: "Nothing broke. No surprises. Nice.", cost: 0, type: 'neutral' }
];

// Audio Setup
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    
    if (type === 'click') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'success') {
        osc.type = 'square'; osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'error') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now);
        gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'bankrupt') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.8);
        gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.start(now); osc.stop(now + 0.8);
    }
}

const els = {
    screens: document.querySelectorAll('.screen'),
    hudMonth: document.getElementById('month-val'),
    hudNW: document.getElementById('nw-val'),
    hudEF: document.getElementById('ef-val'),
    incomeVal: document.getElementById('income-val'),
    ltbVal: document.getElementById('ltb-val'),
    ltbContainer: document.getElementById('ltb-container'),
    catList: document.getElementById('categories-list'),
    runBtn: document.getElementById('run-month-btn'),
    eventModal: document.getElementById('event-modal'),
    evIcon: document.getElementById('event-icon'),
    evTitle: document.getElementById('event-title'),
    evDesc: document.getElementById('event-desc'),
    evImpact: document.getElementById('event-impact'),
    evStatus: document.getElementById('event-status'),
    eomEF: document.getElementById('eom-ef'),
    eomInv: document.getElementById('eom-inv'),
    eomNW: document.getElementById('eom-nw'),
    eomTip: document.getElementById('eom-tip')
};

function format(n) { return '$' + n.toLocaleString(); }

function showScreen(id) {
    els.screens.forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function startGame() {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    state = { month: 1, income: 3000, netWorth: 0, emergency: 0, budget: {}, investments: 0 };
    initMonth();
    showScreen('budget-screen');
}

function initMonth() {
    // Set defaults
    categories.forEach(c => state.budget[c.id] = c.default);
    
    // Auto-allocate any remainder to fun/buffer if it exists
    let allocated = categories.reduce((sum, c) => sum + state.budget[c.id], 0);
    if(state.income - allocated > 0) {
        state.budget['fun'] += (state.income - allocated);
    }
    
    updateHUD();
    renderCategories();
    updateLTB();
}

function updateHUD() {
    els.hudMonth.innerText = state.month;
    els.hudNW.innerText = format(state.netWorth);
    els.hudNW.className = 'val ' + (state.netWorth < 0 ? 'danger-text' : '');
    els.hudEF.innerText = format(state.emergency);
    els.incomeVal.innerText = format(state.income);
}

function renderCategories() {
    els.catList.innerHTML = '';
    categories.forEach(c => {
        let div = document.createElement('div');
        div.className = 'category-row';
        div.innerHTML = `
            <div class="cat-info">
                <div class="cat-icon">${c.icon}</div>
                <div class="cat-details">
                    <span class="cat-name">${c.name}</span>
                    <span class="cat-min">Min: ${format(c.min)}</span>
                </div>
            </div>
            <div class="cat-controls">
                <button class="adj-btn" onclick="adjust('${c.id}', -100)">-</button>
                <div class="cat-amt" id="amt-${c.id}">${format(state.budget[c.id])}</div>
                <button class="adj-btn" onclick="adjust('${c.id}', 100)">+</button>
            </div>
        `;
        els.catList.appendChild(div);
    });
}

function getLTB() {
    let allocated = categories.reduce((sum, c) => sum + state.budget[c.id], 0);
    return state.income - allocated;
}

function adjust(id, change) {
    let cat = categories.find(c => c.id === id);
    let current = state.budget[id];
    let ltb = getLTB();
    
    if(change > 0 && ltb < change) { playSound('error'); return; } // Not enough left
    if(change < 0 && current + change < cat.min) { playSound('error'); return; } // Below minimum
    
    playSound('click');
    state.budget[id] += change;
    document.getElementById(`amt-${id}`).innerText = format(state.budget[id]);
    updateLTB();
}

function updateLTB() {
    let ltb = getLTB();
    els.ltbVal.innerText = format(ltb);
    
    if(ltb === 0) {
        els.ltbVal.className = 'ltb-amount zero';
        els.runBtn.disabled = false;
    } else {
        els.ltbVal.className = 'ltb-amount ' + (ltb < 0 ? 'negative' : '');
        els.runBtn.disabled = true;
    }
}

function runMonth() {
    playSound('success');
    
    // Process Budget (Add to savings/investments)
    state.emergency += state.budget.emergency;
    state.investments += state.budget.invest;
    
    // Base Net worth calculation (Liquid cash + investments)
    state.netWorth = state.emergency + state.investments;

    // Pick Event
    let ev = events[Math.floor(Math.random() * events.length)];
    els.evTitle.innerText = ev.title;
    els.evDesc.innerText = ev.desc;
    
    let impactStr = "";
    let statusStr = "";
    
    if(ev.type === 'expense') {
        els.evIcon.innerText = '⚠️';
        els.evImpact.className = 'event-impact negative';
        els.evImpact.innerText = format(ev.cost);
        
        // Deduct logic
        if(state.emergency >= Math.abs(ev.cost)) {
            state.emergency += ev.cost; // deduct
            statusStr = `Covered by Emergency Fund! EF Remaining: ${format(state.emergency)}`;
            playSound('error');
        } else {
            // Drain EF, rest goes to debt
            let remainingCost = Math.abs(ev.cost) - state.emergency;
            state.emergency = 0;
            state.netWorth -= remainingCost; // Debt!
            statusStr = `Emergency Fund drained! You went into DEBT by ${format(remainingCost)}.`;
            playSound('bankrupt');
        }
    } else if(ev.type === 'income') {
        els.evIcon.innerText = '🎉';
        els.evImpact.className = 'event-impact positive';
        els.evImpact.innerText = "+" + format(ev.cost);
        state.emergency += ev.cost;
        statusStr = `Added to Emergency / Cash buffer.`;
        playSound('success');
    } else {
        els.evIcon.innerText = '☕';
        els.evImpact.className = 'event-impact';
        els.evImpact.innerText = "$0";
        statusStr = `Business as usual.`;
        playSound('click');
    }

    // Investment Growth (Market averages 0.5% a month)
    let marketReturn = 0;
    if(state.investments > 0) {
        marketReturn = Math.floor(state.investments * 0.005);
        state.investments += marketReturn;
    }

    // Recalculate Final Net Worth
    state.netWorth = state.emergency + state.investments;

    els.evStatus.innerText = statusStr;
    els.eventModal.classList.remove('hidden');
    
    // Prepare EOM Screen behind the modal
    els.eomEF.innerText = format(state.emergency);
    els.eomInv.innerText = format(state.investments) + (marketReturn > 0 ? ` (+${format(marketReturn)})` : '');
    els.eomNW.innerText = format(state.netWorth);
    els.eomNW.className = 'pl-value ' + (state.netWorth < 0 ? 'danger-text' : 'highlight');
    
    // Generate Tip
    if(state.netWorth < 0) els.eomTip.innerText = "💡 You're in debt! Cut your Fun budget to zero and rebuild that Emergency Fund.";
    else if(state.emergency < 1000) els.eomTip.innerText = "💡 Your Emergency Fund is dangerously low. Try to get it to $1,000 to cover surprise expenses.";
    else if(state.budget.invest === 0) els.eomTip.innerText = "💡 You have a solid cash buffer. Time to start allocating to Investments to grow your Net Worth!";
    else els.eomTip.innerText = "💡 Perfect balance. Your investments are compounding and your downside is protected.";
}

function closeEvent() {
    els.eventModal.classList.add('hidden');
    if(state.netWorth < 0 && state.month >= 3) {
        // Give them a grace period of 2 months, then bankruptcy hits if they stay negative
        document.getElementById('final-months').innerText = state.month;
        showScreen('game-over-screen');
        playSound('bankrupt');
    } else {
        showScreen('eom-screen');
    }
}

function nextMonth() {
    state.month++;
    if(state.month % 6 === 0) state.income += 200; // Small raise every 6 months
    initMonth();
    showScreen('budget-screen');
}