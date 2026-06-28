const collections = [
    {
        title: 'Classic Finance',
        desc: 'Portfolio, compounding, risk, markets, and core money vocabulary.',
        path: '#all-games',
        cta: '8 games',
        accent: '#00E676'
    },
    {
        title: 'Startup School',
        desc: 'Runway, pivots, hiring, growth, users, and founder finance.',
        path: '../games/',
        cta: 'Open hub',
        accent: '#38BDF8'
    },
    {
        title: 'Arcade & Labs',
        desc: 'Fast experiments and skill-building practice surfaces.',
        path: '../market-surfers/',
        cta: 'Play extras',
        accent: '#FBBF24'
    }
];

const games = [
    { title: 'Investment Tycoon', code: 'IT', path: '../moneybot-rush-pro/', group: 'classic', concept: 'Investing', desc: 'Build a financial empire from scratch.', accent: '#00E676', thumb: 'investment-tycoon.png' },
    { title: 'Portfolio Balancer', code: 'PB', path: '../portfolio-balancer/', group: 'classic', concept: 'Allocation', desc: 'Match assets and keep your portfolio balanced.', accent: '#38BDF8', thumb: 'portfolio-balancer.png' },
    { title: 'Wealth Tower', code: 'WT', path: '../wealth-tower/', group: 'classic', concept: 'Wealth building', desc: 'Stack smart choices into a taller financial base.', accent: '#A78BFA', thumb: 'wealth-tower.png' },
    { title: 'Financial Wordle', code: 'FW', path: '../financial-wordle/', group: 'classic', concept: 'Vocabulary', desc: 'Sharpen finance terms through fast puzzle reps.', accent: '#FBBF24', thumb: 'financial-wordle.png' },
    { title: 'Market Racer', code: 'MR', path: '../market-racer/', group: 'classic', concept: 'Markets', desc: 'Race through market trends and timing shifts.', accent: '#FB7185', thumb: 'market-racer.png' },
    { title: 'Compound 2048', code: 'C2', path: '../compound-2048/', group: 'classic', concept: 'Compounding', desc: 'Merge small gains into bigger outcomes.', accent: '#69F0AE', thumb: 'compound-2048.png' },
    { title: 'Diversification Drop', code: 'DD', path: '../diversification-drop/', group: 'classic', concept: 'Diversification', desc: 'Balance risk and reward as assets fall into play.', accent: '#38BDF8', thumb: 'diversification-drop.png' },
    { title: 'Risk Tetris', code: 'RT', path: '../risk-tetris/', group: 'classic', concept: 'Risk', desc: 'Manage exposure before the stack gets unstable.', accent: '#FBBF24', thumb: 'risk-tetris.png' },
    { title: 'Cashflow Runner', code: 'CR', path: '../games/cashflow-runner/', group: 'arcade', concept: 'Cashflow', desc: 'Collect income, dodge debt, and survive the quarter.', accent: '#00E676', thumb: 'cashflow-runner.png' },
    { title: 'Burn Rate', code: 'BR', path: '../games/runway-rush/', group: 'startup', concept: 'Runway', desc: 'Manage burn before your cash hits zero.', accent: '#FB7185', thumb: 'burn-rate.png' },
    { title: 'The Pivot', code: 'PV', path: '../games/the-pivot/', group: 'startup', concept: 'Customer signals', desc: 'Read the market and find product-market fit.', accent: '#38BDF8', thumb: 'the-pivot.png' },
    { title: "Do Things That Don't Scale", code: 'DS', path: '../games/do-things-that-dont-scale/', group: 'startup', concept: 'Early users', desc: 'Win early traction through direct founder work.', accent: '#A78BFA', thumb: 'do-things-that-dont-scale.png' },
    { title: 'Demo Day Dash', code: 'DD', path: '../games/demo-day-dash/', group: 'startup', concept: 'Pitching', desc: 'Keep attention high and communicate the business clearly.', accent: '#FBBF24', thumb: 'demo-day-dash.png' },
    { title: 'The First Hire', code: 'FH', path: '../games/the-first-hire/', group: 'startup', concept: 'Hiring', desc: 'Pick the teammate who matches the company stage.', accent: '#69F0AE', thumb: 'the-first-hire.png' },
    { title: 'Ramen Profitability', code: 'RP', path: '../games/ramen-profitability/', group: 'startup', concept: 'Default alive', desc: 'Get lean enough to survive without panic funding.', accent: '#FBBF24', thumb: 'ramen-profitability.png' },
    { title: '100 Fans', code: '100', path: '../games/100-fans/', group: 'startup', concept: 'True fans', desc: 'Find the first users who care enough to pull you forward.', accent: '#38BDF8', thumb: '100-fans.png' },
    { title: 'The Term Sheet', code: 'TS', path: '../games/the-term-sheet/', group: 'startup', concept: 'Fundraising', desc: 'Understand dilution, valuation, and deal structure.', accent: '#A78BFA', thumb: 'the-term-sheet.png' },
    { title: 'Growth Loops', code: 'GL', path: '../games/growth-loops/', group: 'startup', concept: 'Distribution', desc: 'Build compounding growth into the product itself.', accent: '#00E676', thumb: 'growth-loops.png' },
    { title: 'Market Surfers', code: 'MS', path: '../market-surfers/', group: 'arcade', concept: 'Reaction', desc: 'Ride market movement in a fast arcade loop.', accent: '#38BDF8', thumb: 'market-surfers.png' },
    { title: 'Speaking Mastery', code: 'SM', path: '../apps/speaking-mastery/', group: 'lab', concept: 'Communication', desc: 'Practice clear delivery and sharper speaking reps.', accent: '#FBBF24', thumb: 'speaking-mastery.png' }
];

const collectionGrid = document.getElementById('collections');
const gameGrid = document.getElementById('game-grid');
const filterButtons = Array.from(document.querySelectorAll('.filter-button'));

function renderCollections() {
    collectionGrid.innerHTML = collections.map((item) => `
        <a class="collection-card" href="${item.path}" style="--accent: ${item.accent}">
            <h3>${item.title}</h3>
            <p>${item.desc}</p>
            <span>${item.cta}</span>
        </a>
    `).join('');
}

function renderGames(filter = 'all') {
    const visibleGames = filter === 'all' ? games : games.filter((game) => game.group === filter);
    gameGrid.innerHTML = visibleGames.map((game) => `
        <a class="game-card" href="${game.path}" style="--accent: ${game.accent}">
            <div class="game-art">
                <img src="assets/thumbnails/${game.thumb}" alt="${game.title} thumbnail" decoding="async">
                <div class="game-code">${game.code}</div>
            </div>
            <div class="game-body">
                <div class="game-meta-row">
                    <span class="tag">${game.group}</span>
                    <span class="concept">${game.concept}</span>
                </div>
                <h3>${game.title}</h3>
                <p>${game.desc}</p>
                <div class="game-footer">
                    <span class="concept">MoneyBot</span>
                    <span class="play-button">Play</span>
                </div>
            </div>
        </a>
    `).join('');
}

function loadProgress() {
    const progressKeys = ['tycoon-save', 'portfolio-balancer-score', 'wealth-tower-score', 'moneybotHighScore', 'market-racer-score', 'compound2048-score', 'diversification-drop-score', 'risk-tetris-score'];
    let gamesCompleted = 0;

    progressKeys.forEach((key) => {
        if (localStorage.getItem(key)) {
            gamesCompleted += 1;
        }
    });
    const percent = Math.min(100, Math.round((gamesCompleted / 8) * 100));

    document.getElementById('games-completed').textContent = gamesCompleted;
    document.getElementById('progress-label').textContent = gamesCompleted;
    document.getElementById('progress-fill').style.width = percent + '%';
    document.getElementById('game-count').textContent = games.length;
}

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        filterButtons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        renderGames(button.dataset.filter);
    });
});

renderCollections();
renderGames();
loadProgress();
setInterval(loadProgress, 5000);

const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
});

const grid = document.querySelector('.game-grid');
grid.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.game-card');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { width, height } = rect;
    const rotateX = (y / height - 0.5) * -18;
    const rotateY = (x / width - 0.5) * 18;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
});

grid.addEventListener('mouseleave', () => {
    const cards = grid.querySelectorAll('.game-card');
    cards.forEach(card => {
        card.style.transform = '';
    });
});
