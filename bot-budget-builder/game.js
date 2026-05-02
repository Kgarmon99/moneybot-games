// Budget Boss Logic - Interactive & Realistic Edition
let state = {
    month: 1,
    income: 3000,
    netWorth: 0,
    emergency: 0,
    debt: 0, // Credit Card Debt
    budget: {}, // current month allocation
    investments: 0,
    hiddenRisks: [] // Stores pending consequences of bad choices
};

const categories = [
    { id: 'housing', name: 'Rent/Mortgage', icon: '🏠', min: 1200, default: 1200, type: 'fixed', color: '#38BDF8' }, // Blue
    { id: 'transport', name: 'Car Payment', icon: '🚗', min: 300, default: 300, type: 'fixed', color: '#A855F7' },   // Purple
    { id: 'food', name: 'Food & Groceries', icon: '🛒', min: 250, default: 400, type: 'variable', color: '#FBBF24' }, // Gold
    { id: 'fun', name: 'Lifestyle & Fun', icon: '🎉', min: 0, default: 100, type: 'variable', color: '#FB7185' },    // Red
    { id: 'emergency', name: 'Emergency Fund', icon: '🛡️', min: 0, default: 0, type: 'variable', color: '#00E676' },   // Green
    { id: 'invest', name: 'Investments', icon: '📈', min: 0, default: 0, type: 'variable', color: '#00C853' },      // Dark Green
    { id: 'debt_pay', name: 'Pay Credit Card', icon: '💳', min: 0, default: 0, type: 'variable', color: '#E11D48' }  // Dark Red
];

const events = [
    { 
        type: 'choice', title: "Check Engine Light", desc: "Your car is making a weird noise.", 
        choices: [
            { text: "Take to mechanic", cost: 250, risk: null },
            { text: "Ignore it (Save cash)", cost: 0, risk: { desc: "Ignored car repair", chance: 0.5, cost: 800 } }
        ]
    },
    { 
        type: 'choice', title: "Weekend Trip", desc: "Friends invited you to an out-of-town festival.", 
        choices: [
            { text: "Go & live it up", cost: 400, risk: null },
            { text: "Stay home (FOMO)", cost: 0, risk: null }
        ]
    },
    { 
        type: 'forced', title: "Dental Emergency", desc: "You cracked a tooth. Urgent root canal needed.", 
        cost: -300 
    },
    { 
        type: 'forced', title: "Side Hustle Pays Off!", desc: "You sold some old electronics online.", 
        cost: 200, isIncome: true 
    },
    { 
        type: 'forced', title: "Quiet Month", desc: "No surprises. Boring is good for wealth.", 
        cost: 0 
    },
    { 
        type: 'choice', title: "New Phone Released", desc: "Your current phone is slow, but works.", 
        choices: [
            { text: "Upgrade immediately", cost: 800, risk: null },
            { text: "Keep the old one", cost: 0, risk: null }
        ]
    }
];

// Audio Setup - Defer creation until user interaction to prevent iOS Safari crash
let audioCtx = null;
function initAudio() {
    if(!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if(audioCtx.state === 'suspended') audioCtx.resume();
}

function playSound(type) {
    if(!audioCtx) return;
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

let els = {};

document.addEventListener('DOMContentLoaded', () => {
    els = {
        screens: document.querySelectorAll('.screen'),
        hudMonth: document.getElementById('month-val'),
        hudNW: document.getElementById('nw-val'),
        hudEF: document.getElementById('ef-val'),
        ccPill: document.getElementById('cc-pill'),
        ccVal: document.getElementById('cc-val'),
        incomeVal: document.getElementById('income-val'),
        ltbVal: document.getElementById('ltb-val'),
        ltbContainer: document.getElementById('ltb-container'),
        fixedList: document.getElementById('fixed-categories'),
        varList: document.getElementById('variable-categories'),
        runBtn: document.getElementById('run-month-btn'),
        eventModal: document.getElementById('event-modal'),
        evIcon: document.getElementById('event-icon'),
        evTitle: document.getElementById('event-title'),
        evDesc: document.getElementById('event-desc'),
        evImpact: document.getElementById('event-impact'),
        evStatus: document.getElementById('event-status'),
        evChoices: document.getElementById('event-choices'),
        evContinue: document.getElementById('event-continue-btn'),
        eomEF: document.getElementById('eom-ef'),
        eomInv: document.getElementById('eom-inv'),
        eomCCRow: document.getElementById('eom-cc-row'),
        eomCC: document.getElementById('eom-cc'),
        eomNW: document.getElementById('eom-nw'),
        eomTip: document.getElementById('eom-tip')
    };
});

function format(n) { return '$' + Math.floor(n).toLocaleString(); }

function showScreen(id) {
    els.screens.forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function startGame() {
    initAudio();
    state = { month: 1, income: 3000, netWorth: 0, emergency: 0, debt: 0, budget: {}, investments: 0, hiddenRisks: [] };
    initMonth();
    showScreen('budget-screen');
}

function initMonth() {
    // Interest hits the credit card (2% per month ~ 24% APR)
    if(state.debt > 0) {
        state.debt = Math.floor(state.debt * 1.02);
    }

    // Determine mandatory CC minimum payment (just interest + 1% balance)
    let ccMin = 0;
    if(state.debt > 0) {
        ccMin = Math.max(25, Math.floor(state.debt * 0.03));
        categories.find(c => c.id === 'debt_pay').min = ccMin;
        categories.find(c => c.id === 'debt_pay').default = ccMin;
    }

    // Set defaults
    categories.forEach(c => state.budget[c.id] = c.default);
    
    // Auto-allocate any remainder to fun/buffer if it exists
    let allocated = categories.reduce((sum, c) => {
        if(c.id === 'debt_pay' && state.debt === 0) return sum;
        return sum + state.budget[c.id];
    }, 0);
    
    if(state.income - allocated > 0) {
        state.budget['fun'] += (state.income - allocated);
    } else if (state.income - allocated < 0) {
        // If mandatory minimums exceed income (trouble!)
        state.budget['fun'] = 0;
        state.budget['food'] = categories.find(c=>c.id==='food').min;
    }
    
    updateHUD();
    renderCategories();
    updateLTB();
}

function updateHUD() {
    els.hudMonth.innerText = state.month;
    
    // Net worth = Cash + Investments - Debt
    state.netWorth = state.emergency + state.investments - state.debt;
    
    els.hudNW.innerText = format(state.netWorth);
    els.hudNW.className = 'val ' + (state.netWorth < 0 ? 'danger-text' : '');
    els.hudEF.innerText = format(state.emergency);
    els.incomeVal.innerText = format(state.income);

    if(state.debt > 0) {
        els.ccPill.classList.remove('hidden');
        els.ccVal.innerText = '-' + format(state.debt);
    } else {
        els.ccPill.classList.add('hidden');
    }
}

function renderCategories() {
    els.fixedList.innerHTML = '';
    els.varList.innerHTML = '';
    
    categories.forEach(c => {
        if(c.id === 'debt_pay' && state.debt === 0) return; // Hide debt pay if no debt
        
        let isFixed = c.type === 'fixed';
        let div = document.createElement('div');
        div.className = `category-row ${isFixed ? 'fixed' : ''}`;
        
        let controls = isFixed 
            ? `<div class="cat-controls locked"><div class="cat-amt">${format(state.budget[c.id])}</div></div>`
            : `<div class="cat-controls">
                <button class="adj-btn" onclick="adjust('${c.id}', -50)">-</button>
                <div class="cat-amt" id="amt-${c.id}">${format(state.budget[c.id])}</div>
                <button class="adj-btn" onclick="adjust('${c.id}', 50)">+</button>
               </div>`;

        div.innerHTML = `
            <div class="cat-info">
                <div class="cat-color-dot" style="background-color: ${c.color}; box-shadow: 0 0 8px ${c.color}80;"></div>
                <div class="cat-icon">${c.icon}</div>
                <div class="cat-details">
                    <span class="cat-name">${c.name}</span>
                    ${!isFixed ? `<span class="cat-min">Min: ${format(c.min)}</span>` : '<span class="cat-min">LOCKED</span>'}
                </div>
            </div>
            ${controls}
        `;
        
        if(isFixed) els.fixedList.appendChild(div);
        else els.varList.appendChild(div);
    });
}

function getLTB() {
    let allocated = categories.reduce((sum, c) => {
        if(c.id === 'debt_pay' && state.debt === 0) return sum;
        return sum + state.budget[c.id];
    }, 0);
    return state.income - allocated;
}

function adjust(id, change) {
    let cat = categories.find(c => c.id === id);
    let current = state.budget[id];
    let ltb = getLTB();
    
    if(change > 0 && ltb < change) { playSound('error'); return; } // Not enough left
    if(change < 0 && current + change < cat.min) { playSound('error'); return; } // Below minimum
    if(id === 'debt_pay' && current + change > state.debt) { playSound('error'); return; } // Don't overpay debt
    
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
    
    updatePieChart(ltb);
}

function updatePieChart(ltb) {
    let conicStr = [];
    let currentPct = 0;
    
    categories.forEach(c => {
        if (c.id === 'debt_pay' && state.debt === 0) return;
        let amt = state.budget[c.id];
        if (amt > 0) {
            let pct = (amt / state.income) * 100;
            conicStr.push(`${c.color} ${currentPct}% ${currentPct + pct}%`);
            currentPct += pct;
        }
    });
    
    // Unallocated gets dark grey
    if (ltb > 0) {
        conicStr.push(`#1E293B ${currentPct}% 100%`);
    }
    
    // Fallback if completely empty
    if(conicStr.length === 0) conicStr.push(`#1E293B 0% 100%`);
    
    document.getElementById('budget-pie').style.background = `conic-gradient(${conicStr.join(', ')})`;
}

function chargeExpense(cost) {
    let actualCost = Math.abs(cost);
    let paidFromEF = 0;
    let paidFromCC = 0;

    if(state.emergency >= actualCost) {
        state.emergency -= actualCost;
        paidFromEF = actualCost;
    } else {
        paidFromEF = state.emergency;
        paidFromCC = actualCost - state.emergency;
        state.emergency = 0;
        state.debt += paidFromCC;
    }
    
    return { ef: paidFromEF, cc: paidFromCC };
}

function runMonth() {
    playSound('success');
    
    // Process Budget (Add to savings/investments)
    state.emergency += state.budget.emergency;
    state.investments += state.budget.invest;
    if(state.debt > 0) state.debt -= state.budget.debt_pay;
    
    // Check hidden risks first!
    let activeRisk = null;
    for(let i=0; i<state.hiddenRisks.length; i++) {
        if(Math.random() < state.hiddenRisks[i].chance) {
            activeRisk = state.hiddenRisks[i];
            state.hiddenRisks.splice(i, 1);
            break;
        }
    }

    els.evChoices.innerHTML = '';
    els.evImpact.classList.add('hidden');
    els.evStatus.classList.add('hidden');
    els.evContinue.classList.add('hidden');

    if(activeRisk) {
        // A risk triggered!
        triggerForcedEvent("Consequences!", activeRisk.desc + ` This will cost you ${format(activeRisk.cost)}.`, -activeRisk.cost);
    } else {
        // Pick normal Event
        let ev = events[Math.floor(Math.random() * events.length)];
        els.evTitle.innerText = ev.title;
        els.evDesc.innerText = ev.desc;
        
        if(ev.type === 'choice') {
            els.evIcon.innerText = '🤔';
            ev.choices.forEach((choice, idx) => {
                let btn = document.createElement('button');
                btn.className = 'btn-choice ' + (choice.cost > 0 ? 'safe' : (choice.risk ? 'risk' : ''));
                btn.innerHTML = `<span>${choice.text}</span> <span class="choice-cost">${choice.cost > 0 ? format(-choice.cost) : 'Free'}</span>`;
                btn.onclick = () => makeChoice(choice);
                els.evChoices.appendChild(btn);
            });
        } else {
            triggerForcedEvent(ev.title, ev.desc, ev.cost, ev.isIncome);
        }
    }

    els.eventModal.classList.remove('hidden');
}

function makeChoice(choice) {
    els.evChoices.innerHTML = ''; // Clear choices
    
    if(choice.risk) {
        state.hiddenRisks.push(choice.risk);
        els.evImpact.classList.remove('hidden');
        els.evImpact.className = 'event-impact';
        els.evImpact.innerText = "Risk Accepted";
        els.evStatus.innerText = "You saved money today... hopefully it doesn't come back to bite you.";
        els.evStatus.classList.remove('hidden');
        els.evContinue.classList.remove('hidden');
        playSound('click');
        prepareEOM();
        return;
    }

    if(choice.cost > 0) {
        let result = chargeExpense(-choice.cost);
        els.evImpact.classList.remove('hidden');
        els.evImpact.className = 'event-impact negative';
        els.evImpact.innerText = format(-choice.cost);
        
        els.evStatus.classList.remove('hidden');
        if(result.cc > 0) {
            els.evStatus.innerText = `EF drained. ${format(result.cc)} went to CREDIT CARD DEBT!`;
            playSound('bankrupt');
        } else {
            els.evStatus.innerText = `Paid entirely from Cash Buffer!`;
            playSound('error');
        }
    } else {
        els.evImpact.classList.remove('hidden');
        els.evImpact.className = 'event-impact';
        els.evImpact.innerText = "$0";
        els.evStatus.classList.remove('hidden');
        els.evStatus.innerText = "Prudent choice.";
        playSound('success');
    }
    
    els.evContinue.classList.remove('hidden');
    prepareEOM();
}

function triggerForcedEvent(title, desc, cost, isIncome=false) {
    els.evTitle.innerText = title;
    els.evDesc.innerText = desc;
    els.evImpact.classList.remove('hidden');
    els.evStatus.classList.remove('hidden');
    els.evContinue.classList.remove('hidden');

    if(cost < 0) {
        els.evIcon.innerText = '⚠️';
        let result = chargeExpense(cost);
        els.evImpact.className = 'event-impact negative';
        els.evImpact.innerText = format(cost);
        
        if(result.cc > 0) {
            els.evStatus.innerText = `EF drained. ${format(result.cc)} went to CREDIT CARD DEBT!`;
            playSound('bankrupt');
        } else {
            els.evStatus.innerText = `Covered safely by Cash Buffer!`;
            playSound('error');
        }
    } else if(isIncome) {
        els.evIcon.innerText = '🎉';
        els.evImpact.className = 'event-impact positive';
        els.evImpact.innerText = "+" + format(cost);
        state.emergency += cost; // send to buffer
        els.evStatus.innerText = `Added to Cash Buffer.`;
        playSound('success');
    } else {
        els.evIcon.innerText = '☕';
        els.evImpact.className = 'event-impact';
        els.evImpact.innerText = "$0";
        els.evStatus.innerText = `Business as usual.`;
        playSound('click');
    }
    prepareEOM();
}

function prepareEOM() {
    // Investment Growth (Market averages 0.8% a month in this universe)
    let marketReturn = 0;
    if(state.investments > 0) {
        marketReturn = Math.floor(state.investments * 0.008);
        state.investments += marketReturn;
    }

    state.netWorth = state.emergency + state.investments - state.debt;

    els.eomEF.innerText = format(state.emergency);
    els.eomInv.innerText = format(state.investments) + (marketReturn > 0 ? ` (+${format(marketReturn)})` : '');
    els.eomNW.innerText = format(state.netWorth);
    els.eomNW.className = 'pl-value ' + (state.netWorth < 0 ? 'danger-text' : 'highlight');
    
    if(state.debt > 0) {
        els.eomCCRow.classList.remove('hidden');
        let interest = Math.floor(state.debt * 0.02); // Just for display on EOM
        els.eomCC.innerText = `-${format(state.debt)} (inc. ${format(interest)} interest)`;
    } else {
        els.eomCCRow.classList.add('hidden');
    }
    
    // Generate Tip
    if(state.debt > 1000) els.eomTip.innerText = "💡 SHARK ALERT! Credit card debt is spiraling. Cut all fun spending to 0 and pay it off immediately.";
    else if(state.netWorth < 0) els.eomTip.innerText = "💡 You're in debt! Cut your Fun budget to zero and rebuild that Cash Buffer.";
    else if(state.emergency < 1000) els.eomTip.innerText = "💡 Your Cash Buffer is dangerously low. Try to get it to $1,000 to cover surprise expenses without using credit.";
    else if(state.budget.invest === 0) els.eomTip.innerText = "💡 You have a solid cash buffer. Time to start allocating to Investments to grow your Net Worth!";
    else els.eomTip.innerText = "💡 Perfect balance. Your investments are compounding and your downside is protected.";
}

function closeEvent() {
    els.eventModal.classList.add('hidden');
    if(state.debt > state.income * 2) {
        // Bankruptcy: Debt is 2x monthly income
        document.getElementById('final-months').innerText = state.month;
        showScreen('game-over-screen');
        playSound('bankrupt');
    } else {
        showScreen('eom-screen');
    }
}

// Ensure everything is loaded before attaching global scope functions
window.startGame = startGame;
window.adjust = adjust;
window.runMonth = runMonth;
window.closeEvent = closeEvent;
window.nextMonth = nextMonth;
window.makeChoice = makeChoice;