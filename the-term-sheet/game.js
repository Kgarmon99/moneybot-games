/**
 * The Term Sheet — Upgraded
 * YC Lesson: Understand valuation, control, and ownership tradeoffs
 * Negotiation card game - balance founder ownership vs investor terms
 */

const Game = {
  founderOwnership: 100,
  valuation: 2000000,
  cashRaised: 0,
  targetRaise: 500000,
  round: 1,
  maxRounds: 8,
  investorOffers: [],
  acceptedTerms: [],
  gameOver: false,
  won: false
};

const INVESTORS = [
  { name: "Angel Annie", emoji: "👼", type: "Angel", valuation: 2000000, amount: 100000, terms: { board: 0, liquidation: 1, antiDilution: false }, style: "friendly", color: "#00ff88" },
  { name: "VC Victor", emoji: "🏢", type: "Seed VC", valuation: 3000000, amount: 250000, terms: { board: 1, liquidation: 1.5, antiDilution: true }, style: "tough", color: "#ff3366" },
  { name: "Strategic Sam", emoji: "🤝", type: "Strategic", valuation: 2500000, amount: 200000, terms: { board: 0, liquidation: 1, antiDilution: false, strategic: true }, style: "balanced", color: "#ffcc00" },
  { name: "Accelerator Amy", emoji: "🚀", type: "Accelerator", valuation: 1500000, amount: 150000, terms: { board: 0, liquidation: 1, program: true }, style: "helpful", color: "#ff6600" },
  { name: "Corporate Carl", emoji: "🏭", type: "Corporate", valuation: 4000000, amount: 500000, terms: { board: 2, liquidation: 2, antiDilution: true, veto: true }, style: "aggressive", color: "#aa00ff" },
  { name: "Syndicate Sue", emoji: "👥", type: "Syndicate", valuation: 2200000, amount: 300000, terms: { board: 0, liquidation: 1, antiDilution: false }, style: "flexible", color: "#00ccff" }
];

const TERM_EXPLANATIONS = {
  board: "Board seats = control over company decisions",
  liquidation: "Liquidation preference = investor gets X before you on exit",
  antiDilution: "Anti-dilution = investor protected if valuation drops later",
  strategic: "Strategic investor = potential customer/partner access",
  program: "Accelerator program = mentorship + network + demo day",
  veto: "Veto rights = investor can block key decisions"
};

function $(id) { return document.getElementById(id); }

function init() {
  $('start-btn').onclick = startGame;
  $('replay-btn').onclick = startGame;
  $('try-again-btn').onclick = startGame;
  $('start-screen').classList.add('active');
}

function startGame() {
  Object.assign(Game, {
    founderOwnership: 100, valuation: 2000000,
    cashRaised: 0, targetRaise: 500000,
    round: 1, maxRounds: 8,
    investorOffers: [], acceptedTerms: [],
    gameOver: false, won: false
  });
  
  // Generate random offers
  Game.investorOffers = INVESTORS.map(inv => ({
    ...inv,
    id: Math.random().toString(36).substr(2, 9)
  })).sort(() => Math.random() - 0.5).slice(0, 4);
  
  $('start-screen').classList.remove('active');
  $('win-screen').classList.remove('active');
  $('loss-screen').classList.remove('active');
  
  updateHUD();
  renderGame();
}

function updateHUD() {
  $('score').textContent = `${Math.round(Game.founderOwnership)}% owned`;
  $('round').textContent = `Offer ${Game.round}/${Game.maxRounds}`;
  
  const cashEl = $('cash-display');
  if (cashEl) cashEl.textContent = `$${(Game.cashRaised / 1000).toFixed(0)}K / $${(Game.targetRaise / 1000).toFixed(0)}K`;
  
  const valEl = $('valuation-display');
  if (valEl) valEl.textContent = `$${(Game.valuation / 1000000).toFixed(1)}M`;
}

function renderGame() {
  const container = $('choices');
  container.innerHTML = '';
  
  if (Game.round > Game.investorOffers.length) {
    if (Game.cashRaised >= Game.targetRaise) {
      showWin();
    } else {
      showLoss();
    }
    return;
  }
  
  const offer = Game.investorOffers[Game.round - 1];
  
  // Dashboard
  const dashboard = document.createElement('div');
  dashboard.className = 'card animate-fade-in';
  dashboard.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center;">
      <div>
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;">Raised</div>
        <div style="font-size:20px;font-weight:700;color:var(--success);" id="cash-display">$${(Game.cashRaised/1000).toFixed(0)}K / $${(Game.targetRaise/1000).toFixed(0)}K</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;">Valuation</div>
        <div style="font-size:20px;font-weight:700;color:var(--accent);" id="valuation-display">$${(Game.valuation/1000000).toFixed(1)}M</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;">Ownership</div>
        <div style="font-size:20px;font-weight:700;color:${Game.founderOwnership < 50 ? 'var(--danger)' : 'var(--accent)'};">${Math.round(Game.founderOwnership)}%</div>
      </div>
    </div>
    <div class="progress-bar" style="margin-top:12px;">
      <div class="progress-fill ${Game.cashRaised >= Game.targetRaise ? '' : Game.cashRaised < Game.targetRaise * 0.5 ? 'danger' : 'warning'}" 
           style="width:${Math.min((Game.cashRaised / Game.targetRaise) * 100, 100)}%;"></div>
    </div>
  `;
  container.appendChild(dashboard);
  
  // Investor offer card
  const dilution = (offer.amount / (offer.valuation + offer.amount)) * 100;
  const newOwnership = Game.founderOwnership * (1 - dilution / 100);
  
  const offerCard = document.createElement('div');
  offerCard.className = 'card animate-fade-in';
  offerCard.style.borderTop = `4px solid ${offer.color}`;
  offerCard.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <span style="font-size:40px;">${offer.emoji}</span>
      <div>
        <div style="font-size:20px;font-weight:700;">${offer.name}</div>
        <div style="font-size:13px;color:var(--text-dim);">${offer.type} • ${offer.style}</div>
      </div>
    </div>
    
    <div style="background:rgba(0,0,0,0.2);padding:16px;border-radius:8px;margin-bottom:16px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <div style="font-size:11px;color:var(--text-dim);">Offering</div>
          <div style="font-size:22px;font-weight:700;color:var(--success);">$${(offer.amount/1000).toFixed(0)}K</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-dim);">Valuation</div>
          <div style="font-size:22px;font-weight:700;color:var(--accent);">$${(offer.valuation/1000000).toFixed(1)}M</div>
        </div>
      </div>
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1);">
        <div style="font-size:14px;color:var(--text-dim);margin-bottom:8px;">Your ownership after: <span style="color:${newOwnership < 50 ? 'var(--danger)' : 'var(--accent)'};font-weight:700;">${Math.round(newOwnership)}%</span> (currently ${Math.round(Game.founderOwnership)}%)</div>
      </div>
    </div>
    
    <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--accent);margin-bottom:8px;">Term Sheet Terms</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
      ${Object.entries(offer.terms).map(([key, val]) => {
        if (typeof val === 'boolean') {
          return `<div style="display:flex;justify-content:space-between;padding:8px 12px;background:rgba(0,0,0,0.2);border-radius:6px;">
            <span>${key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span style="color:${val ? 'var(--danger)' : 'var(--success)'};font-weight:700;">${val ? '⚠️ YES' : '✅ No'}</span>
          </div>`;
        } else {
          return `<div style="display:flex;justify-content:space-between;padding:8px 12px;background:rgba(0,0,0,0.2);border-radius:6px;">
            <span>${key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span style="color:var(--accent);font-weight:700;">${val}x</span>
          </div>`;
        }
      }).join('')}
    </div>
    
    ${Object.entries(offer.terms).filter(([k]) => TERM_EXPLANATIONS[k]).map(([k]) => `
      <div style="font-size:12px;color:var(--text-dim);margin-bottom:4px;padding-left:12px;border-left:2px solid var(--accent-3);">
        💡 ${TERM_EXPLANATIONS[k]}
      </div>
    `).join('')}
    
    <div style="display:flex;gap:10px;margin-top:20px;">
      <button class="btn-primary" style="flex:1;" onclick="acceptOffer()">✅ Accept</button>
      <button class="btn-danger" style="flex:1;" onclick="rejectOffer()">❌ Pass</button>
    </div>
  `;
  
  container.appendChild(offerCard);
}

function acceptOffer() {
  const offer = Game.investorOffers[Game.round - 1];
  const dilution = offer.amount / (offer.valuation + offer.amount);
  
  Game.cashRaised += offer.amount;
  Game.founderOwnership *= (1 - dilution);
  Game.valuation = offer.valuation;
  Game.acceptedTerms.push(offer);
  
  showFloatingText(`+$${(offer.amount/1000).toFixed(0)}K! Ownership: ${Math.round(Game.founderOwnership)}%`, 'var(--success)');
  
  Game.round++;
  updateHUD();
  renderGame();
}

function rejectOffer() {
  showFloatingText('Offer rejected', 'var(--danger)');
  Game.round++;
  updateHUD();
  renderGame();
}

function showWin() {
  Game.won = true;
  Game.gameOver = true;
  $('win-screen').classList.add('active');
  $('win-reason').textContent = `Raised $${(Game.cashRaised/1000).toFixed(0)}K! You own ${Math.round(Game.founderOwnership)}% with a $${(Game.valuation/1000000).toFixed(1)}M valuation.`;
}

function showLoss() {
  Game.gameOver = true;
  $('loss-screen').classList.add('active');
  $('loss-reason').textContent = `Only raised $${(Game.cashRaised/1000).toFixed(0)}K of $${(Game.targetRaise/1000).toFixed(0)}K needed.`;
  $('loss-tip').textContent = Game.cashRaised > 0
    ? "Don't be too greedy on valuation. A smaller piece of a funded company beats 100% of nothing."
    : "Consider all offers carefully. Even 'friendly' angels can add value beyond cash.";
}

function showFloatingText(text, color) {
  const el = document.createElement('div');
  el.className = 'score-pop';
  el.style.color = color;
  el.textContent = text;
  el.style.left = '50%';
  el.style.top = '40%';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

init();
