// Lemonade Empire - Game Logic
let state = {
    day: 1,
    cash: 20.00,
    inv: { lemons: 0, sugar: 0, cups: 0 },
    cogs: 0, // tracking spending for the day
    weather: 0, // 0=Hot, 1=Warm, 2=Cool, 3=Rain
    weatherNames: ['☀️ Hot', '🌤️ Warm', '☁️ Cool', '🌧️ Rain'],
    weatherDemand: [1.5, 1.0, 0.7, 0.4], // multiplier
    recipeMode: 2, // 1=Diluted, 2=Standard, 3=Premium
    price: 1.00
};

let dailyStats = { sold: 0, revenue: 0, cogs: 0 };

// DOM Elements
const els = {
    cash: document.getElementById('cash-val'),
    day: document.getElementById('day-val'),
    weather: document.getElementById('weather-val'),
    screens: document.querySelectorAll('.screen'),
    invLemons: document.getElementById('inv-lemons'),
    invSugar: document.getElementById('inv-sugar'),
    invCups: document.getElementById('inv-cups'),
    recipeVal: document.getElementById('recipe-val'),
    priceVal: document.getElementById('price-val'),
    recipeSlider: document.getElementById('recipe-slider'),
    priceSlider: document.getElementById('price-slider'),
    prepWarning: document.getElementById('prep-warning'),
    simLog: document.getElementById('sim-log'),
    simSold: document.getElementById('sim-sold'),
    simRev: document.getElementById('sim-rev'),
    endDayBtn: document.getElementById('end-day-btn')
};

function formatMoney(num) { return '$' + num.toFixed(2); }

function updateHUD() {
    els.cash.innerText = formatMoney(state.cash);
    els.day.innerText = state.day;
    els.weather.innerText = state.weatherNames[state.weather];
    
    els.invLemons.innerText = state.inv.lemons;
    els.invSugar.innerText = state.inv.sugar;
    els.invCups.innerText = state.inv.cups;
}

function showScreen(id) {
    els.screens.forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function rollWeather() {
    const r = Math.random();
    if(r < 0.4) state.weather = 0; // Hot
    else if(r < 0.7) state.weather = 1; // Warm
    else if(r < 0.9) state.weather = 2; // Cool
    else state.weather = 3; // Rain
}

// Phase 1: Prep
function initPrep() {
    rollWeather();
    dailyStats = { sold: 0, revenue: 0, cogs: 0 };
    updateHUD();
    updateStrategy();
    showScreen('prep-screen');
    
    // Check Bankruptcy
    if(state.cash < 1.0 && state.inv.cups === 0) {
        showScreen('game-over-screen');
    }
}

function buy(item, qty, cost) {
    if(state.cash >= cost) {
        state.cash -= cost;
        state.inv[item] += qty;
        dailyStats.cogs += cost; // Log expense for today's P&L
        updateHUD();
        updateStrategy();
    } else {
        els.prepWarning.innerText = "❌ Not enough cash!";
        els.prepWarning.style.color = "var(--mb-red)";
        setTimeout(() => els.prepWarning.innerText="", 2000);
    }
}

function updateStrategy() {
    state.recipeMode = parseInt(els.recipeSlider.value);
    state.price = parseFloat(els.priceSlider.value);
    
    const names = ["Diluted", "Standard", "Premium"];
    els.recipeVal.innerText = names[state.recipeMode - 1];
    els.priceVal.innerText = formatMoney(state.price);
    
    // Validate if they can make even 1 cup
    let reqL = state.recipeMode;
    let reqS = state.recipeMode;
    
    if(state.inv.cups < 1 || state.inv.lemons < reqL || state.inv.sugar < reqS) {
        els.prepWarning.innerText = "⚠️ You don't have enough supplies to make a single cup!";
        els.prepWarning.style.color = "var(--mb-gold)";
    } else {
        els.prepWarning.innerText = "✅ Ready for business.";
        els.prepWarning.style.color = "var(--mb-green)";
    }
}

// Phase 2: Simulation
async function startDay() {
    showScreen('sim-screen');
    els.simLog.innerHTML = "";
    els.simSold.innerText = "0";
    els.simRev.innerText = "$0.00";
    els.endDayBtn.classList.add('hidden');
    
    let baseDemand = 20; // potential customers
    let weatherMult = state.weatherDemand[state.weather];
    
    // Price elasticity: $1 is baseline. Cheaper = more demand, Expensive = less.
    // Quality elasticity: Premium recipe allows higher prices.
    let perceivedValue = (state.recipeMode * 1.5) / state.price; 
    let demandMult = Math.min(2.0, Math.max(0.1, perceivedValue));
    
    let totalCustomers = Math.floor(baseDemand * weatherMult * demandMult);
    // Add random noise
    totalCustomers += Math.floor((Math.random() - 0.5) * 5);
    if(totalCustomers < 0) totalCustomers = 0;
    
    let reqL = state.recipeMode;
    let reqS = state.recipeMode;
    
    // Run simulation loop
    for(let i=0; i<totalCustomers; i++) {
        await new Promise(r => setTimeout(r, 300)); // Sleep 300ms
        
        // Can we make a cup?
        if(state.inv.cups >= 1 && state.inv.lemons >= reqL && state.inv.sugar >= reqS) {
            // Sell!
            state.inv.cups--;
            state.inv.lemons -= reqL;
            state.inv.sugar -= reqS;
            state.cash += state.price;
            
            dailyStats.sold++;
            dailyStats.revenue += state.price;
            
            logSim(`Sold a cup for ${formatMoney(state.price)}`, 'success');
        } else {
            logSim(`Missed sale: Out of supplies!`, 'fail');
            break; // End simulation loop early if out of supplies
        }
        
        els.simSold.innerText = dailyStats.sold;
        els.simRev.innerText = formatMoney(dailyStats.revenue);
        updateHUD();
    }
    
    if(dailyStats.sold === 0 && totalCustomers > 0) {
        logSim(`No sales. Check supplies.`, 'fail');
    } else if(totalCustomers <= 0) {
        logSim(`No customers wanted lemonade at this price/weather.`, 'fail');
    } else {
        logSim(`Day complete.`, '');
    }
    
    els.endDayBtn.classList.remove('hidden');
}

function logSim(msg, type) {
    let div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.innerText = msg;
    els.simLog.appendChild(div);
    els.simLog.scrollTop = els.simLog.scrollHeight;
}

// Phase 3: P&L
function endDay() {
    showScreen('eod-screen');
    document.getElementById('eod-day').innerText = `(Day ${state.day})`;
    
    document.getElementById('pl-rev').innerText = formatMoney(dailyStats.revenue);
    document.getElementById('pl-cogs').innerText = "-" + formatMoney(dailyStats.cogs);
    
    let net = dailyStats.revenue - dailyStats.cogs;
    let netEl = document.getElementById('pl-net');
    netEl.innerText = formatMoney(net);
    netEl.className = net >= 0 ? 'positive' : 'negative';
    
    // Provide a MoneyBot business tip
    let tip = "";
    if(net < 0) tip = "💡 Operating at a loss! You bought more inventory than you sold. Try adjusting your price or recipe to match the weather demand.";
    else if(state.inv.cups === 0) tip = "💡 You sold out of cups! You left money on the table. Buy more inventory tomorrow.";
    else if(dailyStats.sold === 0) tip = "💡 Zero sales! If it's raining or your price is too high, customers will walk away.";
    else tip = "💡 Profitable day! Reinvest your cashflow to buy more inventory and scale the business.";
    
    document.getElementById('eod-tip').innerText = tip;
}

function nextDay() {
    state.day++;
    initPrep();
}

// Start Game
initPrep();