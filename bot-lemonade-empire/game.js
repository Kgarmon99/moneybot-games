// Lemonade Empire: The Hustle - Extreme Juice Edition
let state = {
    day: 1,
    cash: 25.00,
    cups: 0, // Simplified inventory: just cups ready to sell
    cogs: 0, 
    weather: 0, // 0=Hot, 1=Warm, 2=Cool, 3=Rain
    weatherNames: ['🔥 Heatwave', '☀️ Perfect', '☁️ Cloudy', '🌧️ Stormy'],
    weatherDemand: [2.0, 1.2, 0.6, 0.2], 
    skyClasses: ['hot', 'warm', 'cool', 'rain'],
    price: 1.50,
    upgradesOwned: [],
    currentEvent: null
};

// Upgrades System
const upgrades = [
    { id: 'sign', name: 'Neon Sign', cost: 15, desc: '+30% Traffic', icon: '🚥' },
    { id: 'ice', name: 'Ice Machine', cost: 40, desc: 'Hot weather sales double', icon: '🧊' },
    { id: 'mascot', name: 'Robot Automation', cost: 100, desc: 'Customers pay any price', icon: '🤖' },
    { id: 'social', name: 'Viral Marketing', cost: 250, desc: 'Massive Foot Traffic', icon: '📱' },
    { id: 'truck', name: 'Food Truck', cost: 600, desc: 'Ultimate Empire Status', icon: '🚚' }
];

// Daily Random Events (Simplified)
const events = [
    { text: "Local marathon today! Massive traffic.", effect: (d) => d * 2.0 },
    { text: "Health inspector rumors. People are wary.", effect: (d) => d * 0.7 },
    { text: "Viral TikTok! Lemonade is trending.", effect: (d) => d * 2.5 },
    { text: "Quiet day in the neighborhood.", effect: (d) => d * 1.0 },
    { text: "Supply shortage! Lemonade mix costs double today.", effect: (d) => d * 1.0, flag: 'expensive_mix' }
];

let dailyStats = { sold: 0, revenue: 0, cogs: 0 };

// Audio Context (Juice!)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'buy') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    }
}

// DOM Elements
const els = {
    cash: document.getElementById('cash-val'),
    day: document.getElementById('day-val'),
    weather: document.getElementById('weather-val'),
    screens: document.querySelectorAll('.screen'),
    invCups: document.getElementById('inv-cups'),
    priceVal: document.getElementById('price-val'),
    priceSlider: document.getElementById('price-slider'),
    prepWarning: document.getElementById('prep-warning'),
    simLog: document.getElementById('sim-log'),
    simSold: document.getElementById('sim-sold'),
    simRev: document.getElementById('sim-rev'),
    endDayBtn: document.getElementById('end-day-btn'),
    skyBg: document.getElementById('sky-bg'),
    streetView: document.getElementById('street-view'),
    lemonadeStand: document.getElementById('lemonade-stand'),
    upgradeSign: document.getElementById('upgrade-sign'),
    newsText: document.getElementById('news-text'),
    upgradesContainer: document.getElementById('upgrades-container')
};

const EMOJIS = ['👨', '👩', '👱‍♂️', '👱‍♀️', '👴', '👵', '👮‍♂️', '👷‍♀️', '🏃', '🏃‍♀️'];

function formatMoney(num) { return '$' + num.toFixed(2); }

function updateHUD() {
    els.cash.innerText = formatMoney(state.cash);
    els.day.innerText = state.day;
    els.weather.innerText = state.weatherNames[state.weather];
    els.invCups.innerText = state.cups;
}

function showScreen(id) {
    els.screens.forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function rollWeatherAndEvents() {
    const r = Math.random();
    if(r < 0.3) state.weather = 0; // Hot
    else if(r < 0.6) state.weather = 1; // Warm
    else if(r < 0.8) state.weather = 2; // Cool
    else state.weather = 3; // Rain

    // Apply sky visuals
    els.skyBg.className = 'sky ' + state.skyClasses[state.weather];

    // Roll Event
    state.currentEvent = events[Math.floor(Math.random() * events.length)];
    els.newsText.innerText = state.currentEvent.text;
}

function renderUpgrades() {
    els.upgradesContainer.innerHTML = '';
    upgrades.forEach(upg => {
        let isOwned = state.upgradesOwned.includes(upg.id);
        let div = document.createElement('div');
        div.className = 'upgrade-item';
        div.innerHTML = `
            <div class="upgrade-info">
                <span class="upgrade-name">${upg.icon} ${upg.name}</span>
                <span class="upgrade-desc">${upg.desc}</span>
            </div>
            ${isOwned 
                ? `<span class="upgrade-owned">OWNED</span>`
                : `<button class="btn-small" onclick="buyUpgrade('${upg.id}', ${upg.cost})">${formatMoney(upg.cost)}</button>`
            }
        `;
        els.upgradesContainer.appendChild(div);
    });
}

function initPrep() {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    rollWeatherAndEvents();
    dailyStats = { sold: 0, revenue: 0, cogs: 0 };
    renderUpgrades();
    updateHUD();
    updateStrategy();
    showScreen('prep-screen');
    
    // Check Bankruptcy
    if(state.cash < 5.0 && state.cups === 0) { // Costs $5 to buy minimum mix
        document.getElementById('final-days').innerText = state.day - 1;
        showScreen('game-over-screen');
    }
}

function buyMix(qty, baseCost) {
    let cost = baseCost;
    if(state.currentEvent.flag === 'expensive_mix') cost *= 2;

    if(state.cash >= cost) {
        state.cash -= cost;
        state.cups += qty;
        dailyStats.cogs += cost; 
        playSound('buy');
        updateHUD();
        updateStrategy();
    } else {
        playSound('error');
        els.prepWarning.innerText = "❌ Not enough cash!";
        els.prepWarning.style.color = "var(--mb-red)";
        setTimeout(() => updateStrategy(), 2000);
    }
}

function buyUpgrade(id, cost) {
    if(state.cash >= cost) {
        state.cash -= cost;
        state.upgradesOwned.push(id);
        playSound('buy');
        updateHUD();
        renderUpgrades();
        
        // Visual stand upgrade
        if(id === 'sign') els.upgradeSign.classList.remove('hidden');
    } else {
        playSound('error');
    }
}

function updateStrategy() {
    state.price = parseFloat(els.priceSlider.value);
    els.priceVal.innerText = formatMoney(state.price);
    
    if(state.cups < 1) {
        els.prepWarning.innerText = "⚠️ You have 0 cups to sell! Buy restock first.";
        els.prepWarning.style.color = "var(--mb-gold)";
        document.getElementById('start-day-btn').disabled = true;
    } else {
        els.prepWarning.innerText = "✅ Ready to hustle.";
        els.prepWarning.style.color = "var(--mb-green)";
        document.getElementById('start-day-btn').disabled = false;
    }
}

function spawnVisualCustomer(bought) {
    let cust = document.createElement('div');
    cust.className = 'customer';
    
    // Assign random color variation
    const r = Math.random();
    if(r > 0.75) cust.classList.add('color-1');
    else if(r > 0.5) cust.classList.add('color-2');
    else if(r > 0.25) cust.classList.add('color-3');
    
    els.streetView.appendChild(cust);

    setTimeout(() => {
        if(bought) {
            // Stand bounce
            els.lemonadeStand.classList.add('bounce');
            setTimeout(() => els.lemonadeStand.classList.remove('bounce'), 150);

            // Float text
            let text = document.createElement('div');
            text.className = 'float-text cash';
            text.innerText = '+' + formatMoney(state.price);
            text.style.left = '55%';
            text.style.bottom = '70px';
            els.streetView.appendChild(text);
            setTimeout(() => text.remove(), 1000);
        } else {
            let text = document.createElement('div');
            text.className = 'float-text fail';
            text.innerText = '👎';
            text.style.left = '45%';
            text.style.bottom = '60px';
            els.streetView.appendChild(text);
            setTimeout(() => text.remove(), 1000);
        }
    }, 2000); // Trigger mid-walk

    setTimeout(() => cust.remove(), 4000);
}

function spawnRain() {
    let drop = document.createElement('div');
    drop.className = 'raindrop';
    drop.style.left = Math.random() * 100 + '%';
    els.streetView.appendChild(drop);
    setTimeout(() => drop.remove(), 500);
}

async function startDay() {
    showScreen('sim-screen');
    els.simLog.innerHTML = "";
    els.simSold.innerText = "0";
    els.simRev.innerText = "$0.00";
    els.endDayBtn.classList.add('hidden');
    
    // Clean up old visual customers
    document.querySelectorAll('.customer, .float-text, .raindrop').forEach(e => e.remove());

    let rainInterval;
    if(state.weather === 3) {
        rainInterval = setInterval(spawnRain, 50);
    }
    
    let baseDemand = 25; 
    let weatherMult = state.weatherDemand[state.weather];
    
    // Upgrades
    if(state.upgradesOwned.includes('ice') && state.weather === 0) weatherMult *= 2;
    if(state.upgradesOwned.includes('sign')) baseDemand *= 1.3;
    if(state.upgradesOwned.includes('social')) baseDemand *= 2.5;
    if(state.upgradesOwned.includes('truck')) baseDemand *= 2.0; // Stacks!

    // Price elasticity simplified
    let perceivedValue = 1.5 / state.price; // $1.50 is "fair" baseline
    if(state.upgradesOwned.includes('mascot')) perceivedValue = 2.0; // Mascot hacks demand
    
    let demandMult = Math.min(2.5, Math.max(0.1, perceivedValue));
    
    // Event multiplier
    demandMult = state.currentEvent.effect(demandMult);

    let totalCustomers = Math.floor(baseDemand * weatherMult * demandMult);
    totalCustomers += Math.floor((Math.random() - 0.5) * 5); // noise
    if(totalCustomers < 0) totalCustomers = 0;
    
    logSim(`Day started! Expecting ~${totalCustomers} foot traffic.`, 'event');

    for(let i=0; i<totalCustomers; i++) {
        await new Promise(r => setTimeout(r, 400)); // Sleep 400ms per customer
        
        // Random walk-aways based on price vs quality
        if(Math.random() > perceivedValue && !state.upgradesOwned.includes('mascot')) {
            spawnVisualCustomer(false);
            continue;
        }

        if(state.cups >= 1) {
            // Sell!
            state.cups--;
            state.cash += state.price;
            
            dailyStats.sold++;
            dailyStats.revenue += state.price;
            
            playSound('coin');
            spawnVisualCustomer(true);
            logSim(`Sold a cup for ${formatMoney(state.price)}`, 'success');
        } else {
            spawnVisualCustomer(false);
            logSim(`Missed sale: Out of cups!`, 'fail');
            playSound('error');
            break; 
        }
        
        els.simSold.innerText = dailyStats.sold;
        els.simRev.innerText = formatMoney(dailyStats.revenue);
        updateHUD();
    }
    
    if(rainInterval) clearInterval(rainInterval);

    if(dailyStats.sold === 0 && totalCustomers > 0) {
        logSim(`No sales. Check pricing vs weather.`, 'fail');
    } else if(totalCustomers <= 0) {
        logSim(`Ghost town. No one wanted lemonade today.`, 'fail');
    } else {
        logSim(`Day complete. Closing up shop.`, 'event');
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

function endDay() {
    showScreen('eod-screen');
    document.getElementById('eod-day').innerText = `(Day ${state.day})`;
    
    document.getElementById('pl-rev').innerText = formatMoney(dailyStats.revenue);
    document.getElementById('pl-cogs').innerText = "-" + formatMoney(dailyStats.cogs);
    
    let net = dailyStats.revenue - dailyStats.cogs;
    let netEl = document.getElementById('pl-net');
    netEl.innerText = formatMoney(net);
    netEl.className = net >= 0 ? 'positive' : 'negative';
    
    let tip = "";
    if(net < 0) tip = "💡 Loss! You bought more inventory than you sold. Try dropping your price to drive volume, or investing in the Neon Sign to drive traffic.";
    else if(state.cups === 0) tip = "💡 You sold out! You left money on the table. Buy more batches tomorrow.";
    else if(dailyStats.sold === 0) tip = "💡 Zero sales! If it's raining or your price is too high, customers walk away.";
    else if(state.cash > 600 && !state.upgradesOwned.includes('truck')) tip = "💡 You have enough cash to buy the Food Truck! Upgrade to reach the endgame.";
    else if(state.cash > 50 && state.upgradesOwned.length < 5) tip = "💡 High cash balance! Reinvest your profits into permanent Business Upgrades.";
    else tip = "💡 Solid profit! You're building a real empire. Keep compounding.";
    
    document.getElementById('eod-tip').innerText = tip;
}

function nextDay() {
    state.day++;
    initPrep();
}

// Start
initPrep();