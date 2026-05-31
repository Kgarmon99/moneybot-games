// game.js
const stocks = [
    { ticker: "PEPL", name: "People's Coffee", pe: 15, div: "3.5%", growth: "+8%", hype: "Solid quarterly earnings.", isGood: true, finalMultiplier: 1.4 },
    { ticker: "DOGE", name: "DogeCoinz", pe: "N/A", div: "0%", growth: "???", hype: "Elon tweeted a meme about a dog!", isGood: false, finalMultiplier: 0.1 },
    { ticker: "AMZN", name: "River Corp", pe: 45, div: "0%", growth: "+25%", hype: "Building new fulfillment centers.", isGood: true, finalMultiplier: 1.8 },
    { ticker: "GME", name: "GameSpot", pe: -20, div: "0%", growth: "-10%", hype: "Reddit is going crazy! Short squeeze!!!", isGood: false, finalMultiplier: 0.3 },
    { ticker: "AAPL", name: "Fruit Computers", pe: 28, div: "0.5%", growth: "+15%", hype: "Releasing a new VR headset.", isGood: true, finalMultiplier: 1.6 },
    { ticker: "SPAC", name: "Blank Check Inc.", pe: "N/A", div: "0%", growth: "0%", hype: "We promise we will buy something cool.", isGood: false, finalMultiplier: 0.05 },
    { ticker: "JNJ", name: "Johnson Products", pe: 18, div: "2.8%", growth: "+5%", hype: "Boring, stable, consumer goods.", isGood: true, finalMultiplier: 1.2 },
    { ticker: "WE", name: "WeDesk", pe: -100, div: "0%", growth: "-50%", hype: "The CEO says we are a tech company, not real estate.", isGood: false, finalMultiplier: 0.01 },
    { ticker: "VTI", name: "Total Market Index", pe: 20, div: "1.5%", growth: "+10%", hype: "Owns a piece of every company in America.", isGood: true, finalMultiplier: 1.5 },
    { ticker: "TSLA", name: "E-Motors", pe: 65, div: "0%", growth: "+40%", hype: "Self-driving taxis coming next year... maybe.", isGood: false, finalMultiplier: 0.8 } // Overvalued example
];

// State
let portfolio = [];
let netWorth = 10000;
let cash = 10000;
let currentYear = 2026;
let cardQueue = [...stocks].sort(() => Math.random() - 0.5); // Shuffle
let activeCardEl = null;

// UI
const nwDisplay = document.getElementById('nwDisplay');
const yearDisplay = document.getElementById('yearDisplay');
const stockCount = document.getElementById('stockCount');
const cardContainer = document.getElementById('card-container');

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('btn-pass').addEventListener('click', () => handleSwipe('left'));
document.getElementById('btn-buy').addEventListener('click', () => handleSwipe('right'));

function startGame() {
    portfolio = [];
    netWorth = 10000;
    cash = 10000;
    currentYear = 2026;
    cardQueue = [...stocks].sort(() => Math.random() - 0.5);
    
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.add('hidden');
    
    updateUI();
    renderNextCard();
}

function updateUI() {
    nwDisplay.innerText = `$${Math.floor(cash).toLocaleString()}`;
    yearDisplay.innerText = currentYear;
    stockCount.innerText = portfolio.length;
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
                <span class="data-label">Proj. Growth</span>
                <span class="data-value">${stock.growth}</span>
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
    
    if (cardQueue.length === 0 || cash < 1000) {
        endGame();
        return;
    }

    const stock = cardQueue.shift();
    const card = document.createElement('div');
    card.className = 'stock-card';
    card.innerHTML = createCardHTML(stock);
    cardContainer.appendChild(card);
    activeCardEl = card;

    // Setup Hammer.js for swipe gestures
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
    });

    hammer.on('panend', (e) => {
        const x = e.deltaX;
        if (x > 100) {
            handleSwipe('right', stock); // Buy
        } else if (x < -100) {
            handleSwipe('left', stock); // Pass
        } else {
            // Snap back
            card.style.transform = '';
            card.querySelector('.stamp.buy').style.opacity = 0;
            card.querySelector('.stamp.pass').style.opacity = 0;
        }
    });
}

function handleSwipe(direction, passedStock = null) {
    if (!activeCardEl) return;
    
    const stock = passedStock || stocks.find(s => s.ticker === activeCardEl.querySelector('.card-ticker').innerText);
    const flyX = direction === 'right' ? 500 : -500;
    
    activeCardEl.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
    activeCardEl.style.transform = `translate(${flyX}px, 0) rotate(${flyX * 0.05}deg)`;
    activeCardEl.style.opacity = 0;

    if (direction === 'right') {
        if (window.mbAudio) window.mbAudio.playCoin();
        cash -= 1000;
        portfolio.push({ stock: stock, invested: 1000 });
    } else {
        if (window.mbAudio) window.mbAudio.playHit();
    }

    currentYear++;
    updateUI();

    setTimeout(() => {
        activeCardEl = null;
        renderNextCard();
    }, 400);
}

function endGame() {
    let finalValue = cash;
    let reviewHTML = "";

    portfolio.forEach(pos => {
        const endVal = pos.invested * pos.stock.finalMultiplier;
        finalValue += endVal;
    });

    document.getElementById('end-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = `$${Math.floor(finalValue).toLocaleString()}`;
    
    if (finalValue > 10000) {
        document.getElementById('end-title').innerText = "PROFITABLE!";
        document.getElementById('end-title').style.color = "#00ff88";
        document.getElementById('end-desc').innerText = "You ignored the hype and bought solid assets.";
        if (window.mbAudio) window.mbAudio.playWin();
    } else {
        document.getElementById('end-title').innerText = "REKT.";
        document.getElementById('end-title').style.color = "#ff3366";
        document.getElementById('end-desc').innerText = "You got caught holding the bag on meme stocks.";
        if (window.mbAudio) window.mbAudio.playGameOver();
    }
}