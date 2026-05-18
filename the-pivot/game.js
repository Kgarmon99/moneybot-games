/**
 * The Pivot — Upgraded
 * YC Lesson: Talk to users, validate before building
 * Card-based validation game with signal collection
 */

const Game = {
  week: 1,
  maxWeeks: 12,
  idea: null,
  signal: 0,
  runway: 12,
  interviews: 0,
  gameOver: false,
  won: false,
  currentCustomer: null,
  hand: [],
  discard: [],
};

const IDEAS = [
  {
    name: "AI Meeting Summarizer",
    emoji: "🤖",
    difficulty: "medium",
    pitch: "Automatically summarize Zoom calls and extract action items.",
    target: "Busy professionals who attend 5+ meetings daily",
    customers: [
      { name: "Sarah", role: "Product Manager", emoji: "👩‍💼", quote: "I waste 2 hours daily on meetings. If this saves me time, I'd pay $20/mo.", signal: 20, tip: "Strong pain point + willingness to pay = good signal!" },
      { name: "Mike", role: "Engineering Lead", emoji: "👨‍💻", quote: "My team already uses Notion. Why switch?", signal: -5, tip: "Competition is fine, but need clear differentiation." },
      { name: "Lisa", role: "Startup Founder", emoji: "👩‍🚀", quote: "I'd try it for free, but $20 is too much for a solo founder.", signal: 5, tip: "Price sensitivity detected - consider freemium." },
      { name: "Tom", role: "Consultant", emoji: "👨‍💼", quote: "My clients would love meeting recaps. Can I white-label this?", signal: 25, tip: "B2B2C opportunity - high signal!" },
      { name: "Anna", role: "Remote Worker", emoji: "👩‍💻", quote: "Across time zones, this would be amazing. But does it work with Teams?", signal: 10, tip: "Platform expansion opportunity." }
    ]
  },
  {
    name: "Micro-SaaS for Dentists",
    emoji: "🦷",
    difficulty: "hard",
    pitch: "Automated appointment reminders and review generation for dental practices.",
    target: "Small dental practices with 1-5 chairs",
    customers: [
      { name: "Dr. Chen", role: "Dentist", emoji: "👨‍⚕️", quote: "No-shows cost me $200 each. If this reduces them by 50%, I'm in.", signal: 25, tip: "Clear ROI calculation - excellent signal!" },
      { name: "Maria", role: "Office Manager", emoji: "👩‍⚖️", quote: "We already use Dentrix. Integration would need to be seamless.", signal: 5, tip: "Integration requirements - plan for this early." },
      { name: "Dr. Patel", role: "Orthodontist", emoji: "👩‍⚕️", quote: "My patients are teens. They don't read emails. Does it do SMS?", signal: 10, tip: "Channel preference matters for your target demographic." },
      { name: "James", role: "Dental Chain Owner", emoji: "👨‍💼", quote: "For 50 locations, we need enterprise features. Can you scale?", signal: 15, tip: "Enterprise path detected - but focus on SMB first." },
      { name: "Rachel", role: "Hygienist", emoji: "👩‍⚕️", quote: "Patients complain about reminder calls. Automated would be great!", signal: 15, tip: "Multiple stakeholders feeling pain = strong signal." }
    ]
  },
  {
    name: "Neighborhood Tool Library",
    emoji: "🔧",
    difficulty: "easy",
    pitch: "Borrow tools from neighbors instead of buying. Like a library for power tools.",
    target: "Homeowners in suburban neighborhoods",
    customers: [
      { name: "Bob", role: "Homeowner", emoji: "👨‍🔧", quote: "I bought a $400 drill for one project. This would save me hundreds!", signal: 20, tip: "Clear cost savings narrative." },
      { name: "Carol", role: "Retiree", emoji: "👩‍🦳", quote: "I'd lend my tools if I knew they'd come back in good condition.", signal: 10, tip: "Trust mechanism needed - deposits or insurance." },
      { name: "Dave", role: "Landlord", emoji: "👨‍💼", quote: "I own 5 properties. This could save me thousands per year.", signal: 25, tip: "Power user with high lifetime value!" },
      { name: "Emma", role: "Minimalist", emoji: "👩", quote: "I don't want to own things. Sharing economy aligns with my values.", signal: 15, tip: "Values alignment can drive adoption." },
      { name: "Frank", role: "Contractor", emoji: "👨‍🔧", quote: "I need tools today, not next week. Is there same-day pickup?", signal: 5, tip: "Speed matters - logistics challenge identified." }
    ]
  }
];

const ACTIONS = [
  { name: "Deep Interview", emoji: "🎤", cost: 2, effect: "draw", desc: "Spend 2 weeks, draw 2 customer cards" },
  { name: "Quick Survey", emoji: "📊", cost: 1, effect: "peek", desc: "Spend 1 week, peek at top 3 cards" },
  { name: "Build MVP", emoji: "🛠️", cost: 4, effect: "validate", desc: "Spend 4 weeks, test with 3 random customers" },
  { name: "The Pivot", emoji: "🔄", cost: 3, effect: "pivot", desc: "Spend 3 weeks, switch to a new idea" }
];

function $(id) { return document.getElementById(id); }

function init() {
  $('start-btn').onclick = startGame;
  $('replay-btn').onclick = startGame;
  $('try-again-btn').onclick = startGame;
  $('start-screen').classList.add('active');
}

function startGame() {
  Game.week = 1;
  Game.signal = 0;
  Game.runway = 12;
  Game.interviews = 0;
  Game.gameOver = false;
  Game.won = false;
  Game.hand = [];
  Game.discard = [];
  
  // Pick random idea
  Game.idea = IDEAS[Math.floor(Math.random() * IDEAS.length)];
  
  // Build deck of all customers
  Game.deck = [...Game.idea.customers];
  shuffle(Game.deck);
  
  $('start-screen').classList.remove('active');
  $('win-screen').classList.remove('active');
  $('loss-screen').classList.remove('active');
  
  updateHUD();
  renderGame();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function drawCards(n) {
  for (let i = 0; i < n && Game.deck.length > 0; i++) {
    Game.hand.push(Game.deck.pop());
  }
}

function updateHUD() {
  $('score').textContent = Game.signal;
  $('round').textContent = `Week ${Game.week}/${Game.maxWeeks}`;
  $('runway').textContent = `${Game.runway}w`;
  
  const runwayPct = (Game.runway / 12) * 100;
  const runwayBar = $('runway-bar');
  if (runwayBar) {
    runwayBar.style.width = runwayPct + '%';
    runwayBar.className = 'progress-fill' + (runwayPct < 30 ? ' danger' : runwayPct < 60 ? ' warning' : '');
  }
  
  const signalPct = Math.min((Game.signal / 50) * 100, 100);
  const signalBar = $('signal-bar');
  if (signalBar) {
    signalBar.style.width = signalPct + '%';
  }
}

function renderGame() {
  const container = $('choices');
  container.innerHTML = '';
  
  // Show current idea
  const ideaPanel = document.createElement('div');
  ideaPanel.className = 'scenario-text animate-fade-in';
  ideaPanel.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
      <span style="font-size:32px;">${Game.idea.emoji}</span>
      <div>
        <div style="font-weight:700;font-size:18px;color:var(--accent);">${Game.idea.name}</div>
        <div style="font-size:13px;color:var(--text-dim);">${Game.idea.pitch}</div>
      </div>
    </div>
    <div style="font-size:14px;color:var(--text-dim);">Target: ${Game.idea.target}</div>
  `;
  container.appendChild(ideaPanel);
  
  // Draw cards if hand is empty
  if (Game.hand.length === 0) {
    drawCards(3);
  }
  
  // Show customer cards
  const cardsPanel = document.createElement('div');
  cardsPanel.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;margin:16px 0;';
  
  Game.hand.forEach((customer, i) => {
    const card = document.createElement('div');
    card.className = 'card animate-slide-in';
    card.style.animationDelay = (i * 0.1) + 's';
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <span style="font-size:28px;">${customer.emoji}</span>
        <div>
          <div style="font-weight:700;">${customer.name}</div>
          <div style="font-size:12px;color:var(--text-dim);">${customer.role}</div>
        </div>
      </div>
      <div style="font-style:italic;margin-bottom:12px;line-height:1.5;">"${customer.quote}"</div>
      <button class="btn-primary" style="width:100%;padding:10px;font-size:13px;" onclick="interviewCustomer(${i})">
        🎤 Interview (+${customer.signal > 0 ? '+' : ''}${customer.signal} signal)
      </button>
    `;
    cardsPanel.appendChild(card);
  });
  
  container.appendChild(cardsPanel);
  
  // Show action buttons
  const actionsPanel = document.createElement('div');
  actionsPanel.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;';
  
  ACTIONS.forEach(action => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `
      <div style="font-weight:700;margin-bottom:4px;">${action.emoji} ${action.name} (${action.cost}w)</div>
      <div style="font-size:12px;color:var(--text-dim);">${action.desc}</div>
    `;
    btn.onclick = () => doAction(action);
    if (action.cost > Game.runway) {
      btn.style.opacity = '0.4';
      btn.style.cursor = 'not-allowed';
    }
    actionsPanel.appendChild(btn);
  });
  
  container.appendChild(actionsPanel);
  updateHUD();
}

function interviewCustomer(index) {
  const customer = Game.hand[index];
  Game.hand.splice(index, 1);
  Game.interviews++;
  
  // Apply signal with animation
  const oldSignal = Game.signal;
  Game.signal += customer.signal;
  Game.runway -= 1;
  Game.week += 1;
  
  // Create feedback card
  const feedback = document.createElement('div');
  feedback.className = 'card animate-fade-in';
  feedback.style.cssText = `border-color: ${customer.signal > 0 ? 'var(--success)' : 'var(--danger)'};`;
  feedback.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
      <span style="font-size:28px;">${customer.emoji}</span>
      <div>
        <div style="font-weight:700;">${customer.name}</div>
        <div style="font-size:20px;color:${customer.signal > 0 ? 'var(--success)' : 'var(--danger)'};">
          ${customer.signal > 0 ? '+' : ''}${customer.signal} signal
        </div>
      </div>
    </div>
    <div style="background:rgba(0,255,136,0.05);padding:12px;border-radius:8px;font-size:14px;">
      💡 <strong>Lesson:</strong> ${customer.tip}
    </div>
    <button class="btn-primary" style="margin-top:12px;width:100%;" onclick="nextWeek()">Continue →</button>
  `;
  
  $('choices').innerHTML = '';
  $('choices').appendChild(feedback);
  updateHUD();
  
  checkGameOver();
}

function doAction(action) {
  if (action.cost > Game.runway) return;
  
  Game.runway -= action.cost;
  Game.week += action.cost;
  
  switch(action.effect) {
    case 'draw':
      drawCards(2);
      showActionResult(`${action.emoji} Deep Interview complete! Drew 2 customer cards.`, 'success');
      break;
    case 'peek':
      const peekCards = Game.deck.slice(0, 3);
      showPeekResult(peekCards);
      return;
    case 'validate':
      if (Game.deck.length >= 3) {
        const testCustomers = [];
        for (let i = 0; i < 3; i++) testCustomers.push(Game.deck.pop());
        let totalSignal = 0;
        testCustomers.forEach(c => totalSignal += c.signal);
        Game.signal += totalSignal;
        showValidationResult(testCustomers, totalSignal);
      } else {
        showActionResult("Not enough customers left to validate!", 'danger');
      }
      return;
    case 'pivot':
      // Switch to new idea
      const oldName = Game.idea.name;
      const remaining = IDEAS.filter(i => i.name !== Game.idea.name);
      Game.idea = remaining[Math.floor(Math.random() * remaining.length)];
      Game.deck = [...Game.idea.customers];
      shuffle(Game.deck);
      Game.hand = [];
      showActionResult(`🔄 PIVOT! Switched from "${oldName}" to "${Game.idea.name}". New customer deck loaded!`, 'warning');
      break;
  }
  
  updateHUD();
  checkGameOver();
}

function showActionResult(msg, type) {
  const div = document.createElement('div');
  div.className = 'card animate-fade-in';
  div.style.borderColor = type === 'success' ? 'var(--success)' : type === 'danger' ? 'var(--danger)' : 'var(--warning)';
  div.innerHTML = `
    <div style="font-size:18px;margin-bottom:16px;">${msg}</div>
    <button class="btn-primary" style="width:100%;" onclick="nextWeek()">Continue →</button>
  `;
  $('choices').innerHTML = '';
  $('choices').appendChild(div);
}

function showPeekResult(cards) {
  const div = document.createElement('div');
  div.className = 'animate-fade-in';
  
  let cardsHtml = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0;">';
  cards.forEach(c => {
    cardsHtml += `
      <div class="card" style="text-align:center;">
        <div style="font-size:28px;margin-bottom:8px;">${c.emoji}</div>
        <div style="font-weight:700;font-size:13px;">${c.name}</div>
        <div style="font-size:11px;color:var(--text-dim);">${c.role}</div>
        <div style="margin-top:8px;font-size:14px;color:${c.signal > 0 ? 'var(--success)' : 'var(--danger)'};">${c.signal > 0 ? '+' : ''}${c.signal}</div>
      </div>
    `;
  });
  cardsHtml += '</div>';
  
  div.innerHTML = `
    <div class="scenario-text">
      📊 Survey Results: Top of customer deck
    </div>
    ${cardsHtml}
    <button class="btn-primary" style="width:100%;" onclick="nextWeek()">Continue →</button>
  `;
  $('choices').innerHTML = '';
  $('choices').appendChild(div);
}

function showValidationResult(customers, totalSignal) {
  const div = document.createElement('div');
  div.className = 'animate-fade-in';
  
  let cardsHtml = '<div style="margin:16px 0;">';
  customers.forEach(c => {
    cardsHtml += `
      <div class="card" style="display:flex;align-items:center;gap:12px;margin:8px 0;">
        <span style="font-size:24px;">${c.emoji}</span>
        <div style="flex:1;">
          <div style="font-weight:700;">${c.name}</div>
          <div style="font-size:12px;color:var(--text-dim);">${c.quote.substring(0, 60)}...</div>
        </div>
        <div style="font-size:18px;font-weight:700;color:${c.signal > 0 ? 'var(--success)' : 'var(--danger)'};">${c.signal > 0 ? '+' : ''}${c.signal}</div>
      </div>
    `;
  });
  cardsHtml += '</div>';
  
  div.innerHTML = `
    <div class="scenario-text">
      🛠️ MVP Test Results
      <div style="margin-top:8px;font-size:24px;font-weight:700;color:${totalSignal > 0 ? 'var(--success)' : 'var(--danger)'}">
        Total: ${totalSignal > 0 ? '+' : ''}${totalSignal} signal
      </div>
    </div>
    ${cardsHtml}
    <button class="btn-primary" style="width:100%;" onclick="nextWeek()">Continue →</button>
  `;
  $('choices').innerHTML = '';
  $('choices').appendChild(div);
  updateHUD();
  checkGameOver();
}

function nextWeek() {
  if (Game.gameOver) return;
  renderGame();
}

function checkGameOver() {
  if (Game.signal >= 50) {
    Game.won = true;
    Game.gameOver = true;
    showWin();
  } else if (Game.runway <= 0 || Game.week >= Game.maxWeeks) {
    Game.gameOver = true;
    showLoss();
  }
}

function showWin() {
  $('win-screen').classList.add('active');
  $('win-reason').textContent = `Validated "${Game.idea.name}" with ${Game.signal} signal in ${Game.week} weeks! You proved product-market fit before running out of runway.`;
}

function showLoss() {
  $('loss-screen').classList.add('active');
  $('loss-reason').textContent = `Ran out of runway after ${Game.week} weeks. Signal: ${Game.signal}/50 needed.`;
  $('loss-tip').textContent = Game.signal > 30 
    ? "You were close! Try doing deep interviews earlier to gather signal faster."
    : "Consider pivoting earlier when customer feedback is weak. Don't fall in love with your first idea!";
}

init();
