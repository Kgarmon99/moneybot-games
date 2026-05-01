const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const els = {
  runwayValue: document.querySelector("#runwayValue"),
  netWorthValue: document.querySelector("#netWorthValue"),
  debtValue: document.querySelector("#debtValue"),
  streakValue: document.querySelector("#streakValue"),
  waveLabel: document.querySelector("#waveLabel"),
  waveName: document.querySelector("#waveName"),
  waveFill: document.querySelector("#waveFill"),
  coachText: document.querySelector("#coachText"),
  heldChip: document.querySelector("#heldChip"),
  billsValue: document.querySelector("#billsValue"),
  shieldValue: document.querySelector("#shieldValue"),
  debtPayValue: document.querySelector("#debtPayValue"),
  investValue: document.querySelector("#investValue"),
  learnValue: document.querySelector("#learnValue"),
  riskValue: document.querySelector("#riskValue"),
  pauseButton: document.querySelector("#pauseButton"),
  restartButton: document.querySelector("#restartButton"),
  deployButton: document.querySelector("#deployButton"),
  startModal: document.querySelector("#startModal"),
  startButton: document.querySelector("#startButton"),
  resultModal: document.querySelector("#resultModal"),
  resultEyebrow: document.querySelector("#resultEyebrow"),
  resultTitle: document.querySelector("#resultTitle"),
  resultText: document.querySelector("#resultText"),
  resultStats: document.querySelector("#resultStats"),
  continueButton: document.querySelector("#continueButton"),
  modalRestartButton: document.querySelector("#modalRestartButton"),
  toastLayer: document.querySelector("#toastLayer")
};

const waves = [
  { name: "Stabilize", duration: 23, bills: 1100, spawn: 0.82, expenseRate: 0.18, riskRate: 0.06, lesson: "Bills first stopped the leak." },
  { name: "Build the shield", duration: 25, bills: 1180, spawn: 0.75, expenseRate: 0.2, riskRate: 0.09, lesson: "Emergency cash bought decision time." },
  { name: "Kill drag", duration: 27, bills: 1260, spawn: 0.68, expenseRate: 0.22, riskRate: 0.1, lesson: "Debt payoff lowered the next wave's drag." },
  { name: "Compound carefully", duration: 28, bills: 1340, spawn: 0.62, expenseRate: 0.24, riskRate: 0.13, lesson: "Upside worked because the base was stable." },
  { name: "Buy leverage", duration: 29, bills: 1420, spawn: 0.56, expenseRate: 0.27, riskRate: 0.15, lesson: "Skill turned income into a stronger default." },
  { name: "Stress test", duration: 31, bills: 1540, spawn: 0.5, expenseRate: 0.3, riskRate: 0.18, lesson: "A resilient system survived stacked pressure." }
];

const systems = {
  bills: { label: "Bills", color: "#fbbf24" },
  shield: { label: "Shield", color: "#38bdf8" },
  debt: { label: "Debt", color: "#fb7185" },
  invest: { label: "Invest", color: "#00e676" },
  learn: { label: "Skill", color: "#69f0ae" },
  diversify: { label: "Risk", color: "#38bdf8" }
};

const keys = new Set();
let state;
let rafId = 0;

function freshState() {
  return {
    mode: "start",
    waveIndex: 0,
    waveTime: waves[0].duration,
    last: performance.now(),
    spawnTimer: 0,
    shockTimer: 7,
    paused: false,
    player: { x: 195, y: 392, r: 18, tx: 195, ty: 392, speed: 245 },
    items: [],
    particles: [],
    popups: [],
    held: 0,
    cash: 900,
    shield: 700,
    debt: 2600,
    investments: 1900,
    billsPaid: 0,
    debtPaidThisWave: 0,
    skill: 0,
    diversification: 0,
    streak: 0,
    score: 0,
    best: Number(localStorage.getItem("capitalCommandBest") || 0),
    coachMood: 0
  };
}

function currency(value) {
  return `$${Math.round(value).toLocaleString()}`;
}

function wave() {
  return waves[state.waveIndex];
}

function monthlyBurn() {
  return Math.max(650, wave().bills + Math.ceil(state.debt * 0.032) - state.skill * 95);
}

function runway() {
  return Math.max(0, (state.cash + state.shield) / monthlyBurn());
}

function netWorth() {
  return Math.round(state.cash + state.shield + state.investments - state.debt);
}

function riskLabel() {
  if (state.diversification >= 4) return "Low";
  if (state.diversification >= 2) return "Med";
  return "High";
}

function currentScore() {
  const runwayPoints = Math.min(3000, runway() * 720);
  const worthPoints = Math.max(0, netWorth() * 0.5);
  const streakPoints = state.streak * 420;
  const debtPoints = Math.max(0, 2600 - state.debt);
  return Math.round(runwayPoints + worthPoints + streakPoints + debtPoints + state.score);
}

function startGame() {
  state.mode = "play";
  state.last = performance.now();
  closeModal(els.startModal);
  coach("Catch income, then allocate. Cover obligations before chasing upside.");
  loop();
}

function resetGame() {
  cancelAnimationFrame(rafId);
  state = freshState();
  state.mode = "play";
  closeModal(els.resultModal);
  closeModal(els.startModal);
  renderHud();
  coach("New run. Build the base, then accelerate.");
  loop();
}

function loop(now = performance.now()) {
  const dt = Math.min(0.033, (now - state.last) / 1000);
  state.last = now;

  if (state.mode === "play" && !state.paused) update(dt);
  draw();
  rafId = requestAnimationFrame(loop);
}

function update(dt) {
  const p = state.player;
  const axisX = Number(keys.has("arrowright") || keys.has("d")) - Number(keys.has("arrowleft") || keys.has("a"));
  const axisY = Number(keys.has("arrowdown") || keys.has("s")) - Number(keys.has("arrowup") || keys.has("w"));
  if (axisX || axisY) {
    const length = Math.hypot(axisX, axisY) || 1;
    p.tx = clamp(p.x + (axisX / length) * p.speed * dt * 4, 28, canvas.width - 28);
    p.ty = clamp(p.y + (axisY / length) * p.speed * dt * 4, 80, canvas.height - 32);
  }
  p.x += (p.tx - p.x) * Math.min(1, dt * 10);
  p.y += (p.ty - p.y) * Math.min(1, dt * 10);

  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawnItem();
    state.spawnTimer = Math.max(0.28, wave().spawn - state.skill * 0.025);
  }

  state.shockTimer -= dt;
  if (state.shockTimer <= 0) {
    applyShock();
    state.shockTimer = 7 + Math.random() * 5;
  }

  state.waveTime -= dt;
  if (state.waveTime <= 0) completeWave();

  for (const item of state.items) {
    item.y += item.vy * dt;
    item.spin += dt * item.spinRate;
    const hit = Math.hypot(item.x - p.x, item.y - p.y) < item.r + p.r;
    if (hit) collectItem(item);
    if (item.y > canvas.height + 40 && item.kind === "expense") {
      item.dead = true;
      payPressure(item.value, "Expense slipped through.");
    }
  }

  state.items = state.items.filter((item) => !item.dead && item.y < canvas.height + 60);

  for (const particle of state.particles) {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 120 * dt;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);

  for (const popup of state.popups) {
    popup.life -= dt;
    popup.y -= dt * 34;
  }
  state.popups = state.popups.filter((popup) => popup.life > 0);

  if (state.cash + state.shield < -50 || runway() <= 0) endGame(false, "Cashflow pressure won this run.", "Cover bills and build shield before pushing upside.");
  renderHud();
}

function spawnItem() {
  const r = Math.random();
  let kind = "income";
  if (r < wave().riskRate) kind = "risk";
  else if (r < wave().riskRate + wave().expenseRate) kind = "expense";
  else if (r > 0.88) kind = "boost";

  const value = kind === "income" ? 120 + state.skill * 20 : kind === "boost" ? 220 : kind === "risk" ? 280 : 180;
  state.items.push({
    kind,
    value,
    x: 28 + Math.random() * (canvas.width - 56),
    y: -28,
    r: kind === "boost" ? 16 : 18,
    vy: 92 + state.waveIndex * 12 + Math.random() * 54,
    spin: Math.random() * Math.PI * 2,
    spinRate: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2)
  });
}

function collectItem(item) {
  item.dead = true;
  burst(item.x, item.y, colorForKind(item.kind), 12);
  haptic(item.kind === "income" ? 12 : 28);

  if (item.kind === "income") {
    state.held += item.value;
    state.score += 30;
    popup(`+${currency(item.value)}`, item.x, item.y, "#69f0ae");
    coach("Income is fuel. Route it into a system.");
  } else if (item.kind === "boost") {
    state.held += item.value;
    state.score += 60;
    popup("leverage cash", item.x, item.y, "#fbbf24");
    coach("Bonus cash. Decide what buys the most resilience.");
  } else if (item.kind === "expense") {
    payPressure(item.value, "Expense hit cashflow.");
    popup(`-${currency(item.value)}`, item.x, item.y, "#fb7185");
  } else {
    volatilityHit(item.value, item.x, item.y);
  }
}

function allocate(system) {
  if (state.mode !== "play" || state.paused) return;
  const amount = Math.min(state.held, 220 + state.skill * 35);
  if (amount <= 0) {
    toast("Catch income first.");
    return;
  }

  state.held -= amount;
  state.score += 20;
  document.querySelector(`[data-system="${system}"]`)?.classList.add("is-active");
  setTimeout(() => document.querySelector(`[data-system="${system}"]`)?.classList.remove("is-active"), 170);
  haptic(14);

  if (system === "bills") {
    state.billsPaid += amount;
    coach("Bills covered. Runway leak closing.");
  } else if (system === "shield") {
    state.shield += amount;
    coach("Shield stronger. Surprises get smaller.");
  } else if (system === "debt") {
    const paid = Math.min(state.debt, amount);
    state.debt -= paid;
    state.debtPaidThisWave += paid;
    coach("Debt pressure down. Future drag gets lighter.");
  } else if (system === "invest") {
    state.investments += amount;
    coach("Compound engine fed. Stability lets it work.");
  } else if (system === "learn") {
    state.cash += Math.round(amount * 0.15);
    state.skill = Math.min(5, state.skill + amount / 900);
    coach("Skill upgraded. Future income gets richer.");
  } else if (system === "diversify") {
    state.diversification = Math.min(5, state.diversification + amount / 700);
    coach("Risk spread out. Volatility loses teeth.");
  }

  burst(canvas.width - 42, canvas.height - 34, systems[system].color, 10);
  popup(systems[system].label, canvas.width - 76, canvas.height - 46, systems[system].color);
  renderHud();
}

function deployHeld() {
  const order = ["bills", "shield", "debt", "invest", "learn", "diversify"];
  const needsBills = state.billsPaid < wave().bills;
  allocate(needsBills ? "bills" : order[Math.min(order.length - 1, state.waveIndex)]);
}

function completeWave() {
  const w = wave();
  const billGap = Math.max(0, w.bills - state.billsPaid);
  const debtInterest = Math.ceil(state.debt * 0.032);
  state.cash -= billGap * 0.65 + debtInterest;
  state.investments = Math.round(state.investments * (state.diversification >= 2 ? 1.018 : 1.009));
  const stable = billGap === 0 && state.shield > 250 && state.cash + state.shield > 0;
  state.streak = stable ? state.streak + 1 : 0;
  state.cash += Math.round(state.skill * 85);

  if (state.cash + state.shield < -50 || runway() <= 0) {
    endGame(false, "Runway broke under pressure.", "Next run: cover fixed costs and keep a shield before investing.");
    return;
  }

  if (state.waveIndex === waves.length - 1) {
    endGame(true, rankTitle(), `Final lesson: ${w.lesson} Educational content only. Not investment advice.`);
    return;
  }

  state.mode = "between";
  showResult({
    eyebrow: "Wave clear",
    title: stable ? "Runway up." : "Lesson unlocked.",
    text: `${w.lesson} ${billGap ? `${currency(billGap)} of bills leaked into cash.` : "Obligations were covered."}`,
    final: false
  });
}

function nextWave() {
  state.waveIndex += 1;
  state.waveTime = wave().duration;
  state.spawnTimer = 0;
  state.shockTimer = 6;
  state.billsPaid = 0;
  state.debtPaidThisWave = 0;
  state.items = [];
  state.particles = [];
  state.popups = [];
  state.mode = "play";
  closeModal(els.resultModal);
  coach(`Wave ${state.waveIndex + 1}: ${wave().name}. ${wave().lesson}`);
}

function endGame(won, title, text) {
  state.mode = "over";
  const score = currentScore();
  if (won) {
    state.best = Math.max(state.best, score);
    localStorage.setItem("capitalCommandBest", String(state.best));
  }
  showResult({
    eyebrow: won ? "Final score" : "Runway broke",
    title,
    text,
    final: true,
    won
  });
}

function applyShock() {
  if (Math.random() > 0.48 + wave().riskRate) return;
  const base = 210 + state.waveIndex * 58;
  const mitigated = Math.round(base * Math.max(0.32, 1 - state.diversification * 0.15));
  if (state.shield >= mitigated) {
    state.shield -= mitigated;
    toast("Shield saved the month.");
    coach("Emergency fund absorbed a shock.");
    burst(canvas.width * 0.5, 92, "#38bdf8", 22);
  } else {
    const gap = mitigated - state.shield;
    state.shield = 0;
    state.cash -= gap;
    toast("Shock hit cash. Rebuild the shield.");
    coach("The shield was thin. Next income needs protection.");
  }
}

function volatilityHit(value, x, y) {
  const damage = Math.round(value * Math.max(0.25, 1 - state.diversification * 0.16));
  state.investments = Math.max(0, state.investments - damage);
  state.score = Math.max(0, state.score - 35);
  popup(`risk -${currency(damage)}`, x, y, "#38bdf8");
  coach("Concentration made volatility expensive.");
}

function payPressure(value, message) {
  const fromShield = Math.min(state.shield, Math.round(value * 0.65));
  state.shield -= fromShield;
  state.cash -= value - fromShield;
  state.score = Math.max(0, state.score - 20);
  coach(message);
}

function showResult({ eyebrow, title, text, final }) {
  state.paused = true;
  els.resultEyebrow.textContent = eyebrow;
  els.resultTitle.textContent = title;
  els.resultText.textContent = text;
  els.resultStats.innerHTML = [
    ["Score", currentScore().toLocaleString()],
    ["Runway", `${runway().toFixed(1)} mo`],
    ["Net worth", currency(netWorth())],
    ["Best", state.best.toLocaleString()]
  ].map(([label, value]) => `<span>${label}<strong>${value}</strong></span>`).join("");
  els.continueButton.textContent = final ? "Play again" : "Next wave";
  openModal(els.resultModal);
}

function openModal(modal) {
  modal.classList.add("is-open");
}

function closeModal(modal) {
  modal.classList.remove("is-open");
}

function renderHud() {
  els.runwayValue.textContent = `${runway().toFixed(1)} mo`;
  els.netWorthValue.textContent = currency(netWorth());
  els.debtValue.textContent = currency(state.debt);
  els.streakValue.textContent = String(state.streak);
  els.waveLabel.textContent = `Wave ${state.waveIndex + 1} of ${waves.length}`;
  els.waveName.textContent = wave().name;
  els.waveFill.style.width = `${(1 - state.waveTime / wave().duration) * 100}%`;
  els.heldChip.textContent = `${currency(state.held)} held`;
  els.billsValue.textContent = `${currency(state.billsPaid)} / ${currency(wave().bills)}`;
  els.shieldValue.textContent = currency(state.shield);
  els.debtPayValue.textContent = `${currency(state.debtPaidThisWave)} paid`;
  els.investValue.textContent = currency(state.investments);
  els.learnValue.textContent = `Level ${Math.floor(state.skill)}`;
  els.riskValue.textContent = riskLabel();
}

function draw() {
  drawBackground();
  drawSystemsPreview();
  for (const item of state.items) drawItem(item);
  for (const particle of state.particles) drawParticle(particle);
  drawPlayer();
  for (const popup of state.popups) drawPopup(popup);
  if (state.paused && state.mode === "play") drawPause();
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, "#10233e");
  g.addColorStop(1, "#07111f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "#69f0ae";
  ctx.lineWidth = 1;
  const offset = (performance.now() / 70) % 32;
  for (let y = -32 + offset; y < canvas.height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let x = 0; x < canvas.width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = "rgba(248,250,252,0.86)";
  ctx.font = "800 12px system-ui";
  ctx.fillText("Catch income. Avoid pressure. Allocate held cash.", 18, 28);
  ctx.fillStyle = "#69f0ae";
  ctx.fillText(`${Math.max(0, Math.ceil(state.waveTime))}s`, canvas.width - 48, 28);
}

function drawSystemsPreview() {
  const billsRatio = clamp(state.billsPaid / wave().bills, 0, 1);
  drawMeter(18, 44, canvas.width - 36, 8, billsRatio, "#fbbf24", "Bills");
  drawMeter(18, 60, canvas.width - 36, 8, clamp(state.shield / 2200, 0, 1), "#38bdf8", "Shield");
}

function drawMeter(x, y, w, h, ratio, color) {
  ctx.fillStyle = "rgba(248,250,252,0.11)";
  roundRect(x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = color;
  roundRect(x, y, w * ratio, h, h / 2);
  ctx.fill();
}

function drawPlayer() {
  const p = state.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.shadowColor = "rgba(0,230,118,0.55)";
  ctx.shadowBlur = 20;
  const body = ctx.createLinearGradient(-22, -22, 22, 24);
  body.addColorStop(0, "#69f0ae");
  body.addColorStop(1, "#38bdf8");
  ctx.fillStyle = body;
  roundRect(-22, -24, 44, 48, 15);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.arc(0, -7, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#07111f";
  roundRect(-13, -11, 26, 9, 999);
  ctx.fill();
  ctx.fillStyle = "#38bdf8";
  roundRect(-9, -10, 10, 7, 999);
  ctx.fill();
  ctx.restore();
}

function drawItem(item) {
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(item.spin);
  if (item.kind === "income" || item.kind === "boost") drawCoin(item.kind === "boost");
  if (item.kind === "expense") drawBill();
  if (item.kind === "risk") drawStorm();
  ctx.restore();
}

function drawCoin(boost) {
  ctx.fillStyle = boost ? "#fbbf24" : "#00e676";
  ctx.beginPath();
  ctx.arc(0, 0, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(7,17,31,0.45)";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#07111f";
  ctx.font = "950 15px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(boost ? "+" : "$", 0, 1);
}

function drawBill() {
  ctx.fillStyle = "#fb7185";
  roundRect(-18, -13, 36, 26, 7);
  ctx.fill();
  ctx.strokeStyle = "rgba(7,17,31,0.45)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-10, -3, 20, 4);
}

function drawStorm() {
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.moveTo(-13, -17);
  ctx.lineTo(15, -17);
  ctx.lineTo(4, 1);
  ctx.lineTo(15, 1);
  ctx.lineTo(-9, 20);
  ctx.lineTo(-1, 5);
  ctx.lineTo(-14, 5);
  ctx.closePath();
  ctx.fill();
}

function drawParticle(particle) {
  ctx.save();
  ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
  ctx.fillStyle = particle.color;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPopup(popup) {
  ctx.save();
  ctx.globalAlpha = clamp(popup.life / 0.9, 0, 1);
  ctx.fillStyle = popup.color;
  ctx.font = "950 15px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(popup.text, popup.x, popup.y);
  ctx.restore();
}

function drawPause() {
  ctx.fillStyle = "rgba(7,17,31,0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f8fafc";
  ctx.font = "950 32px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.25;
    const speed = 40 + Math.random() * 120;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 2 + Math.random() * 3,
      color,
      life: 0.45 + Math.random() * 0.35,
      maxLife: 0.8
    });
  }
}

function popup(text, x, y, color) {
  state.popups.push({ text, x, y, color, life: 0.9 });
}

function colorForKind(kind) {
  if (kind === "expense") return "#fb7185";
  if (kind === "risk") return "#38bdf8";
  if (kind === "boost") return "#fbbf24";
  return "#00e676";
}

function coach(text) {
  els.coachText.textContent = text;
}

function toast(text) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = text;
  els.toastLayer.append(el);
  setTimeout(() => el.remove(), 2200);
}

function haptic(ms) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

function rankTitle() {
  const score = currentScore();
  if (score > 9000) return "Capital commander.";
  if (score > 6500) return "Resilient operator.";
  return "System builder.";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundRect(x, y, w, h, r) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function pointerToCanvas(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height
  };
}

document.querySelectorAll(".system-node").forEach((button) => {
  button.addEventListener("click", () => allocate(button.dataset.system));
});

els.startButton.addEventListener("click", startGame);
els.restartButton.addEventListener("click", resetGame);
els.modalRestartButton.addEventListener("click", resetGame);
els.deployButton.addEventListener("click", deployHeld);
els.continueButton.addEventListener("click", () => {
  state.paused = false;
  if (state.mode === "over") resetGame();
  else nextWave();
});
els.pauseButton.addEventListener("click", () => {
  if (state.mode !== "play") return;
  state.paused = !state.paused;
  coach(state.paused ? "Paused. The best money systems can stop and inspect." : "Back in command.");
});

canvas.addEventListener("pointerdown", (event) => {
  const point = pointerToCanvas(event);
  state.player.tx = point.x;
  state.player.ty = point.y;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (!canvas.hasPointerCapture(event.pointerId)) return;
  const point = pointerToCanvas(event);
  state.player.tx = point.x;
  state.player.ty = point.y;
});

canvas.addEventListener("pointerup", (event) => {
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);
  if (key === " ") {
    event.preventDefault();
    if (state.mode === "play") state.paused = !state.paused;
  }
  if (/^[1-6]$/.test(key)) {
    event.preventDefault();
    allocate(["bills", "shield", "debt", "invest", "learn", "diversify"][Number(key) - 1]);
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

state = freshState();
renderHud();
draw();
