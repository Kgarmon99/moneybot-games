/**
 * The First Hire — Upgraded
 * YC Lesson: First hires define culture, hire for slope not intercept
 * Candidate matching puzzle - evaluate resumes, interview, build team
 */

const Game = {
  candidates: [],
  hired: [],
  score: 0,
  round: 1,
  maxRounds: 8,
  culture: { speed: 50, quality: 50, autonomy: 50 },
  gameOver: false,
  won: false,
  currentCandidate: null,
  phase: 'review'
};

const ROLES = [
  { title: "Full-Stack Engineer", emoji: "👨‍💻", skills: ["React", "Node", "AWS"], mustHave: "React", redFlag: "Junior only" },
  { title: "Product Designer", emoji: "👩‍🎨", skills: ["Figma", "User Research", "Prototyping"], mustHave: "Figma", redFlag: "No portfolio" },
  { title: "Growth Marketer", emoji: "📈", skills: ["SEO", "Content", "Analytics"], mustHave: "Analytics", redFlag: "No metrics" },
  { title: "Customer Success", emoji: "🤝", skills: ["Communication", "Empathy", "Problem-solving"], mustHave: "Empathy", redFlag: "Avoids conflict" },
  { title: "DevOps Engineer", emoji: "⚙️", skills: ["Docker", "K8s", "CI/CD"], mustHave: "Docker", redFlag: "Manual deploys" }
];

const CANDIDATE_POOL = [
  { name: "Alex Chen", emoji: "🧑", exp: "5yr", role: "Full-Stack Engineer", skills: ["React", "Node", "AWS", "GraphQL"], traits: ["Fast learner", "Startup vet"], culture: { speed: +15, quality: +5, autonomy: +10 }, score: 95 },
  { name: "Jordan Smith", emoji: "👩", exp: "3yr", role: "Full-Stack Engineer", skills: ["Vue", "Python", "AWS"], traits: ["Junior only", "Needs mentorship"], culture: { speed: -5, quality: +10, autonomy: -10 }, score: 60 },
  { name: "Morgan Lee", emoji: "🧑", exp: "7yr", role: "Product Designer", skills: ["Figma", "Sketch", "User Research"], traits: ["Design leader", "Portfolio: 50+ projects"], culture: { speed: +5, quality: +20, autonomy: +15 }, score: 90 },
  { name: "Casey Brown", emoji: "👩", exp: "2yr", role: "Product Designer", skills: ["Adobe XD", "Illustrator"], traits: ["No portfolio", "Great personality"], culture: { speed: +10, quality: -10, autonomy: +5 }, score: 45 },
  { name: "Riley Park", emoji: "🧑", exp: "4yr", role: "Growth Marketer", skills: ["SEO", "Content", "Analytics", "Paid Ads"], traits: ["Data-driven", "Grew last startup 10x"], culture: { speed: +20, quality: +5, autonomy: +10 }, score: 92 },
  { name: "Taylor Kim", emoji: "👩", exp: "1yr", role: "Growth Marketer", skills: ["Social Media", "Influencers"], traits: ["No metrics", "Great network"], culture: { speed: +15, quality: -5, autonomy: +5 }, score: 50 },
  { name: "Quinn Jones", emoji: "🧑", exp: "6yr", role: "Customer Success", skills: ["Communication", "Empathy", "Salesforce"], traits: ["Ex-Zendesk", "99% CSAT"], culture: { speed: +5, quality: +15, autonomy: +5 }, score: 88 },
  { name: "Avery Wilson", emoji: "👩", exp: "3yr", role: "Customer Success", skills: ["Communication", "Problem-solving"], traits: ["Avoids conflict", "People pleaser"], culture: { speed: -5, quality: -5, autonomy: -10 }, score: 40 },
  { name: "Skyler Patel", emoji: "🧑", exp: "8yr", role: "DevOps Engineer", skills: ["Docker", "K8s", "CI/CD", "Terraform"], traits: ["Ex-Netflix", "Built from 10 to 1000 servers"], culture: { speed: +10, quality: +20, autonomy: +15 }, score: 93 },
  { name: "Drew Garcia", emoji: "👩", exp: "4yr", role: "DevOps Engineer", skills: ["Docker", "Manual deploys", "Bash"], traits: ["Manual deploys", "Scared of K8s"], culture: { speed: -15, quality: -10, autonomy: -5 }, score: 35 }
];

function $(id) { return document.getElementById(id); }

function init() {
  $('start-btn').onclick = startGame;
  $('replay-btn').onclick = startGame;
  $('try-again-btn').onclick = startGame;
  $('start-screen').classList.add('active');
}

function startGame() {
  Object.assign(Game, {
    candidates: [...CANDIDATE_POOL].sort(() => Math.random() - 0.5).slice(0, 8),
    hired: [], score: 0, round: 1, maxRounds: 8,
    culture: { speed: 50, quality: 50, autonomy: 50 },
    gameOver: false, won: false, currentCandidate: null, phase: 'review'
  });
  
  $('start-screen').classList.remove('active');
  $('win-screen').classList.remove('active');
  $('loss-screen').classList.remove('active');
  
  updateHUD();
  renderGame();
}

function updateHUD() {
  $('score').textContent = Game.score;
  $('round').textContent = `Candidate ${Game.round}/${Game.maxRounds}`;
  
  const teamSize = $('team-size');
  if (teamSize) teamSize.textContent = `${Game.hired.length} hired`;
}

function renderGame() {
  const container = $('choices');
  container.innerHTML = '';
  
  if (Game.phase === 'review') {
    renderReview(container);
  } else if (Game.phase === 'interview') {
    renderInterview(container);
  }
}

function renderReview(container) {
  if (Game.round > Game.candidates.length) {
    endGame();
    return;
  }
  
  const c = Game.candidates[Game.round - 1];
  Game.currentCandidate = c;
  
  const card = document.createElement('div');
  card.className = 'card animate-fade-in';
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
      <span style="font-size:48px;">${c.emoji}</span>
      <div>
        <div style="font-size:22px;font-weight:700;">${c.name}</div>
        <div style="font-size:14px;color:var(--text-dim);">${c.role} • ${c.exp} experience</div>
      </div>
    </div>
    
    <div style="background:rgba(0,0,0,0.2);padding:16px;border-radius:8px;margin-bottom:16px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--accent);margin-bottom:8px;">Skills</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${c.skills.map(s => `<span style="background:rgba(0,255,136,0.1);color:var(--accent);padding:4px 10px;border-radius:12px;font-size:12px;">${s}</span>`).join('')}
      </div>
    </div>
    
    <div style="background:rgba(0,0,0,0.2);padding:16px;border-radius:8px;margin-bottom:16px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--accent-3);margin-bottom:8px;">Traits</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${c.traits.map(t => {
          const isGood = !t.includes('Junior') && !t.includes('No ') && !t.includes('Avoids') && !t.includes('Manual') && !t.includes('Scared');
          return `<span style="background:${isGood ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)'};color:${isGood ? 'var(--success)' : 'var(--danger)'};padding:4px 10px;border-radius:12px;font-size:12px;">${t}</span>`;
        }).join('')}
      </div>
    </div>
    
    <div style="display:flex;gap:10px;">
      <button class="btn-primary" style="flex:1;" onclick="interviewCandidate()">🎤 Interview</button>
      <button class="btn-danger" style="flex:1;" onclick="rejectCandidate()">❌ Reject</button>
    </div>
  `;
  
  container.appendChild(card);
  
  // Show team so far
  if (Game.hired.length > 0) {
    const teamPanel = document.createElement('div');
    teamPanel.innerHTML = '<div class="panel-title" style="margin-top:20px;">Your Team</div>';
    const teamGrid = document.createElement('div');
    teamGrid.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
    Game.hired.forEach(h => {
      const badge = document.createElement('span');
      badge.style.cssText = 'background:rgba(0,255,136,0.1);color:var(--accent);padding:6px 12px;border-radius:16px;font-size:12px;';
      badge.textContent = `${h.emoji} ${h.name} (${h.role})`;
      teamGrid.appendChild(badge);
    });
    teamPanel.appendChild(teamGrid);
    container.appendChild(teamPanel);
  }
}

function interviewCandidate() {
  Game.phase = 'interview';
  renderGame();
}

function renderInterview(container) {
  const c = Game.currentCandidate;
  const role = ROLES.find(r => r.title === c.role);
  
  const card = document.createElement('div');
  card.className = 'card animate-fade-in';
  card.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:48px;">🎤</span>
      <div style="font-size:20px;font-weight:700;color:var(--accent);margin-top:8px;">Interview: ${c.name}</div>
    </div>
    
    <div class="scenario-text">
      <strong>Role:</strong> ${c.role}<br>
      <strong>Must-have:</strong> ${role.mustHave}<br>
      <strong>Red flag:</strong> ${role.redFlag}
    </div>
    
    <div style="font-size:16px;margin-bottom:16px;">Ask an interview question:</div>
  `;
  
  container.appendChild(card);
  
  const questions = [
    { q: "Tell me about a time you shipped something fast.", good: c.score > 70, tip: "Speed matters at startups." },
    { q: "What's your biggest failure and what did you learn?", good: c.score > 60, tip: "Self-awareness is key." },
    { q: "How do you handle ambiguity?", good: c.score > 65, tip: "Startups are ambiguous." }
  ];
  
  const grid = document.createElement('div');
  grid.className = 'choice-grid';
  
  questions.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `<div style="font-weight:700;">${q.q}</div>`;
    btn.onclick = () => showInterviewResult(q);
    grid.appendChild(btn);
  });
  
  container.appendChild(grid);
}

function showInterviewResult(q) {
  const c = Game.currentCandidate;
  const isGood = q.good;
  
  const container = $('choices');
  container.innerHTML = '';
  
  const result = document.createElement('div');
  result.className = 'card animate-fade-in';
  result.style.borderColor = isGood ? 'var(--success)' : 'var(--danger)';
  result.innerHTML = `
    <div style="font-size:20px;font-weight:700;color:${isGood ? 'var(--success)' : 'var(--danger)'};margin-bottom:12px;">
      ${isGood ? '✅ Strong Answer' : '⚠️ Concerning Answer'}
    </div>
    <div style="font-style:italic;margin-bottom:16px;padding:12px;background:rgba(0,0,0,0.2);border-radius:8px;">
      "${isGood ? 'I shipped X in 2 weeks by focusing on the core use case and cutting scope.' : 'I prefer to have clear requirements before starting.'}"
    </div>
    <div style="font-size:14px;color:var(--text-dim);margin-bottom:16px;">
      💡 ${q.tip} ${isGood ? 'This candidate shows startup fit.' : 'This might be a risk in an early-stage environment.'}
    </div>
    <div style="display:flex;gap:10px;">
      <button class="btn-primary" style="flex:1;" onclick="hireCandidate()">✅ Hire (+${c.score} pts)</button>
      <button class="btn-danger" style="flex:1;" onclick="rejectCandidate()">❌ Pass</button>
    </div>
  `;
  
  container.appendChild(result);
}

function hireCandidate() {
  const c = Game.currentCandidate;
  Game.hired.push(c);
  Game.score += c.score;
  
  // Update culture
  Game.culture.speed += c.culture.speed;
  Game.culture.quality += c.culture.quality;
  Game.culture.autonomy += c.culture.autonomy;
  
  showFloatingText(`Hired ${c.name}! +${c.score} pts`, 'var(--success)');
  nextRound();
}

function rejectCandidate() {
  showFloatingText('Candidate rejected', 'var(--danger)');
  nextRound();
}

function nextRound() {
  Game.round++;
  Game.phase = 'review';
  Game.currentCandidate = null;
  updateHUD();
  renderGame();
}

function endGame() {
  Game.gameOver = true;
  
  const avgScore = Game.hired.length > 0 ? Math.round(Game.score / Game.hired.length) : 0;
  
  if (Game.hired.length >= 3 && avgScore >= 75) {
    Game.won = true;
    showWin(avgScore);
  } else {
    showLoss(avgScore);
  }
}

function showWin(avgScore) {
  $('win-screen').classList.add('active');
  $('win-reason').textContent = `Built a ${Game.hired.length}-person team with avg score ${avgScore}! Culture: Speed ${Game.culture.speed}, Quality ${Game.culture.quality}.`;
}

function showLoss(avgScore) {
  $('loss-screen').classList.add('active');
  $('loss-reason').textContent = `Hired ${Game.hired.length} people with avg score ${avgScore}.`;
  $('loss-tip').textContent = Game.hired.length < 3
    ? "You were too picky! At a startup, you need to move fast and hire learners."
    : "Check for red flags in traits. Skills can be taught, attitude can't.";
}

function showFloatingText(text, color) {
  const el = document.createElement('div');
  el.className = 'score-pop';
  el.style.color = color;
  el.textContent = text;
  el.style.left = '50%';
  el.style.top = '40%';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

init();
