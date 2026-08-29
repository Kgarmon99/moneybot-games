"use strict";
const $ = (s) => document.querySelector(s),
  canvas = $("#gameCanvas"),
  ctx = canvas.getContext("2d");
const els = {
  runway: $("#runwayValue"),
  worth: $("#netWorthValue"),
  debt: $("#debtValue"),
  streak: $("#streakValue"),
  waveLabel: $("#waveLabel"),
  waveName: $("#waveName"),
  waveFill: $("#waveFill"),
  coach: $("#coachText"),
  held: $("#heldChip"),
  bills: $("#billsValue"),
  shield: $("#shieldValue"),
  debtPaid: $("#debtPayValue"),
  invest: $("#investValue"),
  skill: $("#learnValue"),
  risk: $("#riskValue"),
  projection: $("#projection"),
  pause: $("#pauseButton"),
  sound: $("#soundButton"),
  pauseModal: $("#pauseModal"),
  resume: $("#resumeButton"),
  pauseRestart: $("#pauseRestartButton"),
  restart: $("#restartButton"),
  deploy: $("#deployButton"),
  startModal: $("#startModal"),
  start: $("#startButton"),
  result: $("#resultModal"),
  eyebrow: $("#resultEyebrow"),
  title: $("#resultTitle"),
  text: $("#resultText"),
  stats: $("#resultStats"),
  timeline: $("#timeline"),
  coaching: $("#coaching"),
  replay: $("#replayChoices"),
  continue: $("#continueButton"),
  modalRestart: $("#modalRestartButton"),
  toasts: $("#toastLayer"),
};
const systems = ["bills", "shield", "debt", "invest", "learn", "diversify"],
  labels = {
    bills: "Bills",
    shield: "Shield",
    debt: "Debt",
    invest: "Invest",
    learn: "Skill",
    diversify: "Diversify",
  };
const waves = [
  {
    name: "Stabilize",
    duration: 23,
    bills: 1100,
    spawn: 0.82,
    expense: 0.18,
    risk: 0.06,
  },
  {
    name: "Build the shield",
    duration: 25,
    bills: 1180,
    spawn: 0.75,
    expense: 0.2,
    risk: 0.09,
  },
  {
    name: "Kill drag",
    duration: 27,
    bills: 1260,
    spawn: 0.68,
    expense: 0.22,
    risk: 0.1,
  },
  {
    name: "Compound carefully",
    duration: 28,
    bills: 1340,
    spawn: 0.62,
    expense: 0.24,
    risk: 0.13,
  },
  {
    name: "Buy leverage",
    duration: 29,
    bills: 1420,
    spawn: 0.56,
    expense: 0.27,
    risk: 0.15,
  },
  {
    name: "Stress test",
    duration: 31,
    bills: 1540,
    spawn: 0.5,
    expense: 0.3,
    risk: 0.18,
  },
];
let state,
  raf = 0,
  audioContext = null,
  soundOn = localStorage.getItem("capitalCommandSound") === "on",
  returnFocus = null,
  activeModal = null;
const keys = new Set();
const money = (n) => `$${Math.round(n).toLocaleString()}`,
  clamp = (n, a, b) => Math.max(a, Math.min(b, n));
function rng(s) {
  s.seed = (s.seed * 1664525 + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
function burn(s = state) {
  return Math.max(
    650,
    waves[s.waveIndex].bills + Math.ceil(s.debt * 0.032) - s.skill * 95,
  );
}
function runway(s = state) {
  return Math.max(0, (s.cash + s.shield) / burn(s));
}
function worth(s = state) {
  return Math.round(s.cash + s.shield + s.investments - s.debt);
}
function allocationAmount(s) {
  return Math.min(s.held, 220 + s.skill * 35);
}
/* The single pure financial rule used by preview and commit. */
function applyAllocation(source, system) {
  const s = { ...source },
    amount = allocationAmount(source);
  if (amount <= 0 || systems.indexOf(system) > source.waveIndex)
    return { state: s, amount: 0 };
  s.held -= amount;
  s.score += 20;
  s.allocations = {
    ...source.allocations,
    [system]: source.allocations[system] + amount,
  };
  if (system === "bills") s.billsPaid += amount;
  if (system === "shield") s.shield += amount;
  if (system === "debt") {
    const paid = Math.min(s.debt, amount);
    s.debt -= paid;
    s.debtPaidThisWave += paid;
    s.avoidedInterest += paid * 0.032;
  } else if (system === "invest") s.investments += amount;
  else if (system === "learn") {
    s.cash += Math.round(amount * 0.15);
    s.skill = Math.min(5, s.skill + amount / 900);
  } else if (system === "diversify")
    s.diversification = Math.min(5, s.diversification + amount / 700);
  return { state: s, amount };
}
function snapshot(s) {
  const copy = structuredClone(s);
  copy.items = [];
  copy.particles = [];
  copy.popups = [];
  copy.paused = false;
  copy.mode = "play";
  copy.last = performance.now();
  return copy;
}
function fresh() {
  return {
    mode: "start",
    paused: false,
    waveIndex: 0,
    waveTime: waves[0].duration,
    last: performance.now(),
    spawnTimer: 0,
    shockTimer: 7,
    seed: 240806,
    player: { x: 195, y: 300, tx: 195, ty: 300, r: 18, speed: 245 },
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
    allocations: Object.fromEntries(systems.map((x) => [x, 0])),
    waveHistory: [],
    events: [],
    snapshots: [],
    billsMissed: 0,
    shocks: 0,
    avoidedInterest: 0,
    startRunway: 0,
    startWorth: 0,
    startInvestments: 1900,
  };
}
function start() {
  state.mode = "play";
  state.startRunway = runway();
  state.startWorth = worth();
  state.snapshots[0] = snapshot(state);
  state.last = performance.now();
  closeModal(els.startModal, false);
  coach("Wave 1 unlock: Bills. Cover obligations first.");
  loop();
}
function reset() {
  cancelAnimationFrame(raf);
  state = fresh();
  state.mode = "play";
  state.startRunway = runway();
  state.startWorth = worth();
  state.snapshots[0] = snapshot(state);
  closeModal(els.pauseModal, false);
  closeModal(els.result, false);
  closeModal(els.startModal, false);
  render();
  coach("New run. Bills are your first command system.");
  loop();
}
function loop(now = performance.now()) {
  const dt = Math.min(0.033, (now - state.last) / 1000);
  state.last = now;
  if (state.mode === "play" && !state.paused) update(dt);
  draw();
  raf = requestAnimationFrame(loop);
}
function update(dt) {
  const p = state.player,
    ax =
      +(keys.has("arrowright") || keys.has("d")) -
      +(keys.has("arrowleft") || keys.has("a")),
    ay =
      +(keys.has("arrowdown") || keys.has("s")) -
      +(keys.has("arrowup") || keys.has("w"));
  if (ax || ay) {
    const l = Math.hypot(ax, ay) || 1;
    p.tx = clamp(p.x + (ax / l) * p.speed * dt * 4, 25, 365);
    p.ty = clamp(p.y + (ay / l) * p.speed * dt * 4, 78, 334);
  }
  p.x += (p.tx - p.x) * Math.min(1, dt * 10);
  p.y += (p.ty - p.y) * Math.min(1, dt * 10);
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawn();
    state.spawnTimer = Math.max(
      0.28,
      waves[state.waveIndex].spawn - state.skill * 0.025,
    );
  }
  state.shockTimer -= dt;
  if (state.shockTimer <= 0) {
    shock();
    state.shockTimer = 7 + rng(state) * 5;
  }
  state.waveTime -= dt;
  if (state.waveTime <= 0) return finishWave();
  for (const i of state.items) {
    i.y += i.vy * dt;
    i.spin += dt * i.spinRate;
    if (Math.hypot(i.x - p.x, i.y - p.y) < i.r + p.r) collect(i);
    if (i.y > 400) i.dead = true;
  }
  state.items = state.items.filter((i) => !i.dead);
  for (const p of state.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
  if (state.cash + state.shield < 0) return end(false);
  render();
}
function spawn() {
  const r = rng(state);
  let kind = "income";
  const w = waves[state.waveIndex];
  if (r < w.risk) kind = "risk";
  else if (r < w.risk + w.expense) kind = "expense";
  else if (r > 0.88) kind = "boost";
  state.items.push({
    kind,
    value:
      kind === "income"
        ? 120 + state.skill * 20
        : kind === "boost"
          ? 220
          : kind === "risk"
            ? 280
            : 180,
    x: 28 + rng(state) * 334,
    y: 42,
    r: 17,
    vy: 92 + state.waveIndex * 12 + rng(state) * 54,
    spin: 0,
    spinRate: 2,
  });
}
function collect(i) {
  i.dead = true;
  burst(i.x, i.y, kindColor(i.kind));
  if (i.kind === "income" || i.kind === "boost") {
    state.held += i.value;
    state.score += i.kind === "boost" ? 60 : 30;
    coach("Income held. Preview updates exactly before you commit.");
  } else if (i.kind === "expense") {
    const from = Math.min(state.shield, Math.round(i.value * 0.65));
    state.shield -= from;
    state.cash -= i.value - from;
    state.events.push({
      wave: state.waveIndex + 1,
      text: `Expense ${money(i.value)}; shield absorbed ${money(from)}.`,
    });
  } else {
    const damage = Math.round(
      i.value * Math.max(0.25, 1 - state.diversification * 0.16),
    );
    state.investments = Math.max(0, state.investments - damage);
    state.events.push({
      wave: state.waveIndex + 1,
      text: `Market risk reduced investments ${money(damage)}.`,
    });
  }
  render();
}
function allocate(system) {
  if (state.mode !== "play" || state.paused) return;
  if (systems.indexOf(system) > state.waveIndex) {
    toast(`${labels[system]} unlocks in wave ${systems.indexOf(system) + 1}.`);
    return;
  }
  const result = applyAllocation(state, system);
  if (!result.amount) {
    toast("Catch income first.");
    return;
  }
  state = result.state;
  state.events.push({
    wave: state.waveIndex + 1,
    text: `Allocated ${money(result.amount)} to ${labels[system]}.`,
  });
  const b = document.querySelector(`[data-system="${system}"]`);
  b.classList.add("is-active");
  setTimeout(() => b.classList.remove("is-active"), 360);
  tone(360 + systems.indexOf(system) * 55);
  coach(
    `${labels[system]} received ${money(result.amount)} — exactly as projected.`,
  );
  render();
}
function deploy() {
  const unlocked = systems.slice(0, state.waveIndex + 1);
  let target = "bills";
  if (state.billsPaid >= waves[state.waveIndex].bills)
    target = unlocked[unlocked.length - 1];
  allocate(target);
}
function finishWave() {
  const w = waves[state.waveIndex],
    gap = Math.max(0, w.bills - state.billsPaid),
    interest = Math.ceil(state.debt * 0.032),
    before = worth();
  state.billsMissed += gap;
  state.cash -= gap * 0.65 + interest;
  state.investments = Math.round(
    state.investments * (state.diversification >= 2 ? 1.018 : 1.009),
  );
  state.cash += Math.round(state.skill * 85);
  const stable =
    gap === 0 && state.shield > 250 && state.cash + state.shield > 0;
  state.streak = stable ? state.streak + 1 : 0;
  state.waveHistory.push({
    wave: state.waveIndex + 1,
    name: w.name,
    billsGap: Math.round(gap),
    interest,
    netChange: worth() - before,
    stable,
  });
  state.events.push({
    wave: state.waveIndex + 1,
    text: `Wave closed: ${gap ? `${money(gap)} bills missed` : `bills covered`}; ${money(interest)} interest.`,
  });
  if (state.cash + state.shield < 0) return end(false);
  if (state.waveIndex === 5) return end(true);
  state.mode = "between";
  state.paused = true;
  showResult(
    false,
    stable ? "Wave secured." : "Pressure survived.",
    `${gap ? money(gap) + " in bills rolled into cash pressure." : "All bills were covered."} ${labels[systems[state.waveIndex + 1]]} unlocks next.`,
  );
}
function next() {
  state.waveIndex++;
  state.waveTime = waves[state.waveIndex].duration;
  state.spawnTimer = 0;
  state.shockTimer = 6;
  state.billsPaid = 0;
  state.debtPaidThisWave = 0;
  state.items = [];
  state.paused = false;
  state.mode = "play";
  state.snapshots[state.waveIndex] = snapshot(state);
  closeModal(els.result);
  coach(
    `Wave ${state.waveIndex + 1}: ${labels[systems[state.waveIndex]]} unlocked.`,
  );
  render();
}
function shock() {
  if (rng(state) > 0.48 + waves[state.waveIndex].risk) return;
  const base = 210 + state.waveIndex * 58,
    hit = Math.round(base * Math.max(0.32, 1 - state.diversification * 0.15));
  state.shocks++;
  if (state.shield >= hit) {
    state.shield -= hit;
    state.events.push({
      wave: state.waveIndex + 1,
      text: `Shock ${money(hit)} fully absorbed by shield.`,
    });
    coach("Shield saved the month.");
  } else {
    const gap = hit - state.shield;
    state.shield = 0;
    state.cash -= gap;
    state.events.push({
      wave: state.waveIndex + 1,
      text: `Shock broke shield; ${money(gap)} hit cash.`,
    });
  }
}
function score() {
  return Math.round(
    Math.min(3000, runway() * 720) +
      Math.max(0, worth() * 0.5) +
      state.streak * 420 +
      Math.max(0, 2600 - state.debt) +
      state.score,
  );
}
function decisionAnalysis() {
  const a = state.allocations,
    entries = systems.map((x) => [x, a[x]]).sort((x, y) => y[1] - x[1]);
  let strong = "Bills coverage protected your cashflow.";
  if (state.billsMissed === 0 && a.bills > 0)
    strong = "Bills were fully covered, preventing avoidable runway loss.";
  else if (state.shocks && a.shield > 0)
    strong = "Shield allocations absorbed shocks before they reached cash.";
  else if (a.debt > 0)
    strong = `Debt payments avoided about ${money(state.avoidedInterest)} in next-wave interest.`;
  let weak = "No major weakness detected; test a different allocation mix.";
  if (state.billsMissed > 0)
    weak = `Bills were underfunded by ${money(state.billsMissed)} across the run.`;
  else if (state.shocks && a.shield === 0)
    weak = "No shield allocation left shocks exposed to cash.";
  else if (a.invest > 0 && state.diversification < 1)
    weak = "Investing before diversification increased drawdown exposure.";
  else if (entries[0][1] > 0)
    weak = `${labels[entries[entries.length - 1][0]]} received the least attention.`;
  return { strong, weak };
}
function end(won) {
  state.mode = "over";
  state.paused = true;
  showResult(
    true,
    won ? "Command Report" : "Runway broke",
    won
      ? "Six waves complete. Review the evidence before replaying."
      : "Pressure exceeded liquid reserves. Review the evidence and replay from any reached wave.",
  );
}
function showResult(final, title, text) {
  els.eyebrow.textContent = final
    ? "Final Command Report"
    : `Wave ${state.waveIndex + 1} report`;
  els.title.textContent = title;
  els.text.textContent = text;
  const analysis = decisionAnalysis(),
    stats = final
      ? [
          ["Score", score().toLocaleString()],
          ["Start runway", `${state.startRunway.toFixed(1)} mo`],
          ["End runway", `${runway().toFixed(1)} mo`],
          ["Start net worth", money(state.startWorth)],
          ["End net worth", money(worth())],
          ["Bills missed", money(state.billsMissed)],
          ["Shocks", state.shocks],
          ["Avoided interest", money(state.avoidedInterest)],
          [
            "Investment change",
            money(state.investments - state.startInvestments),
          ],
          ...systems.map((s) => [labels[s], money(state.allocations[s])]),
        ]
      : [
          ["Runway", `${runway().toFixed(1)} mo`],
          ["Net worth", money(worth())],
          ["Bills gap", money(state.waveHistory.at(-1)?.billsGap || 0)],
          ["Unlocked next", labels[systems[state.waveIndex + 1]]],
        ];
  els.stats.innerHTML = stats
    .map(([l, v]) => `<span>${l}<strong>${v}</strong></span>`)
    .join("");
  els.timeline.innerHTML = (
    final
      ? state.events
      : state.events.filter((e) => e.wave === state.waveIndex + 1)
  )
    .slice(-12)
    .map((e) => `<p><strong>W${e.wave}</strong> ${e.text}</p>`)
    .join("");
  els.coaching.innerHTML = `<strong>Strongest:</strong> ${analysis.strong}<br><strong>Weakest:</strong> ${analysis.weak}`;
  els.replay.innerHTML = final
    ? state.snapshots
        .map(
          (_, i) =>
            `<button type="button" data-replay="${i}" aria-label="Replay from wave ${i + 1}">W${i + 1}</button>`,
        )
        .join("")
    : "";
  els.continue.textContent = final ? "Play again" : "Next wave";
  openModal(els.result);
}
function replayFrom(i) {
  const prior = state.snapshots[i];
  if (!prior) return;
  cancelAnimationFrame(raf);
  state = snapshot(prior);
  state.snapshots = state.snapshots.slice(0, i + 1);
  state.waveHistory = state.waveHistory.slice(0, i);
  state.events = state.events.filter((e) => e.wave <= i);
  state.waveTime = waves[i].duration;
  state.mode = "play";
  state.paused = false;
  closeModal(els.result);
  coach(`Evidence replay: wave ${i + 1}. Try a different decision.`);
  render();
  loop();
}
function preview() {
  const unlocked = systems.slice(0, state.waveIndex + 1),
    target =
      state.billsPaid < waves[state.waveIndex].bills
        ? "bills"
        : unlocked.at(-1),
    r = applyAllocation(state, target);
  if (!r.amount) return "Next allocation: catch income first.";
  const parts = [];
  if (target === "bills")
    parts.push(`bills ${money(state.billsPaid)} → ${money(r.state.billsPaid)}`);
  if (target === "shield")
    parts.push(`shield ${money(state.shield)} → ${money(r.state.shield)}`);
  if (target === "debt")
    parts.push(`debt ${money(state.debt)} → ${money(r.state.debt)}`);
  if (target === "invest")
    parts.push(
      `investments ${money(state.investments)} → ${money(r.state.investments)}`,
    );
  if (target === "learn")
    parts.push(`skill ${state.skill.toFixed(2)} → ${r.state.skill.toFixed(2)}`);
  if (target === "diversify")
    parts.push(
      `risk buffer ${state.diversification.toFixed(2)} → ${r.state.diversification.toFixed(2)}`,
    );
  return `Deploy ${money(r.amount)} to ${labels[target]}: ${parts[0]}. Held ${money(state.held)} → ${money(r.state.held)}.`;
}
function render() {
  els.runway.textContent = `${runway().toFixed(1)} mo`;
  els.worth.textContent = money(worth());
  els.debt.textContent = money(state.debt);
  els.streak.textContent = state.streak;
  els.waveLabel.textContent = `Wave ${state.waveIndex + 1} of 6`;
  els.waveName.textContent = waves[state.waveIndex].name;
  els.waveFill.style.width = `${clamp(1 - state.waveTime / waves[state.waveIndex].duration, 0, 1) * 100}%`;
  els.held.textContent = `${money(state.held)} held`;
  els.bills.textContent = `${money(state.billsPaid)} / ${money(waves[state.waveIndex].bills)}`;
  els.shield.textContent = money(state.shield);
  els.debtPaid.textContent = `${money(state.debtPaidThisWave)} paid`;
  els.invest.textContent = money(state.investments);
  els.skill.textContent = `Level ${Math.floor(state.skill)}`;
  els.risk.textContent =
    state.diversification >= 4
      ? "Low risk"
      : state.diversification >= 2
        ? "Medium risk"
        : "High risk";
  els.projection.textContent = preview();
  document.querySelectorAll(".system-node").forEach((b, i) => {
    const locked = i > state.waveIndex;
    b.disabled = locked;
    b.setAttribute("aria-disabled", locked);
    const lockLabel = b.querySelector("em");
    if (lockLabel) lockLabel.textContent = locked ? `Wave ${i + 1}` : "";
    b.setAttribute(
      "aria-label",
      locked
        ? `${labels[systems[i]]}, locked until wave ${i + 1}`
        : `${labels[systems[i]]}, unlocked. ${b.querySelector("small").textContent}`,
    );
  });
}
function draw() {
  const t = performance.now() / 1000,
    sweep = Math.sin(t * 0.2) * 18,
    g = ctx.createLinearGradient(0, 0, 390, 360);
  g.addColorStop(0, "#0c1c31");
  g.addColorStop(0.52, "#07111f");
  g.addColorStop(1, "#02050a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 390, 360);
  ctx.save();
  ctx.globalAlpha = 0.78;
  ctx.lineWidth = 16;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(98, 217, 255, 0.15)";
  ctx.beginPath();
  ctx.moveTo(-42, 280 + sweep);
  ctx.bezierCurveTo(70, 206, 150, 198, 244, 110 + sweep * 0.22);
  ctx.bezierCurveTo(312, 45, 376, 45, 438, 8);
  ctx.stroke();
  ctx.lineWidth = 10;
  ctx.strokeStyle = "rgba(143, 255, 199, 0.18)";
  ctx.beginPath();
  ctx.moveTo(-30, 122 - sweep * 0.24);
  ctx.bezierCurveTo(76, 72, 154, 88, 236, 152);
  ctx.bezierCurveTo(298, 202, 354, 218, 430, 174);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(248, 250, 252, 0.1)";
  for (let y = 74; y < 338; y += 44) {
    ctx.beginPath();
    ctx.moveTo(18, y);
    ctx.bezierCurveTo(106, y - 22, 184, y + 26, 372, y - 12);
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = "#dbeafe";
  ctx.font = "800 12px system-ui";
  ctx.fillText("Catch income · avoid pressure", 16, 24);
  ctx.fillStyle = "#69f0ae";
  ctx.fillText(`${Math.max(0, Math.ceil(state.waveTime))}s`, 350, 24);
  for (const i of state.items) {
    ctx.save();
    ctx.translate(i.x, i.y);
    ctx.shadowBlur = 18;
    ctx.shadowColor = kindColor(i.kind);
    ctx.fillStyle = kindColor(i.kind);
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#07111f";
    ctx.font = "900 14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
      i.kind === "income" ? "$" : i.kind === "boost" ? "+" : "!",
      0,
      5,
    );
    ctx.restore();
  }
  for (const p of state.particles) {
    ctx.globalAlpha = clamp(p.life / 0.85, 0, 1) * 0.72;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const p = state.player;
  ctx.save();
  ctx.shadowBlur = 22;
  ctx.shadowColor = "rgba(0, 230, 118, 0.5)";
  ctx.fillStyle = "#8fffc7";
  ctx.beginPath();
  ctx.roundRect(p.x - 21, p.y - 22, 42, 44, [18, 13, 20, 15]);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#07111f";
  ctx.roundRect(p.x - 13, p.y - 8, 26, 8, 4);
  ctx.fill();
  ctx.restore();
}
function burst(x, y, color) {
  for (let i = 0; i < 7; i++) {
    const a = (i * Math.PI * 2) / 7;
    state.particles.push({
      x,
      y,
      vx: Math.cos(a) * 48,
      vy: Math.sin(a) * 48,
      r: 2 + (i % 3),
      color,
      life: 0.85,
    });
  }
}
function kindColor(k) {
  return k === "expense"
    ? "#fb7185"
    : k === "risk"
      ? "#38bdf8"
      : k === "boost"
        ? "#fbbf24"
        : "#00e676";
}
function coach(t) {
  els.coach.textContent = t;
}
function toast(t) {
  const e = document.createElement("div");
  e.className = "toast";
  e.textContent = t;
  els.toasts.append(e);
  setTimeout(() => e.remove(), 1800);
}
function tone(freq = 440) {
  if (!soundOn) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioContext ||= new AC();
    if (audioContext.state === "suspended")
      audioContext.resume().catch(() => {});
    const o = audioContext.createOscillator(),
      g = audioContext.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.035, audioContext.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
    o.connect(g).connect(audioContext.destination);
    o.start();
    o.stop(audioContext.currentTime + 0.08);
  } catch {
    soundOn = false;
    syncSound();
  }
}
function focusables(m) {
  return [
    ...m.querySelectorAll(
      'button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])',
    ),
  ];
}
function openModal(m) {
  returnFocus = document.activeElement;
  activeModal = m;
  m.inert = false;
  m.classList.add("is-open");
  m.setAttribute("aria-hidden", "false");
  focusables(m)[0]?.focus();
}
function closeModal(m, restore = true) {
  if (!m.classList.contains("is-open")) return;
  m.classList.remove("is-open");
  m.setAttribute("aria-hidden", "true");
  m.inert = true;
  if (activeModal === m) activeModal = null;
  if (restore && returnFocus && document.contains(returnFocus))
    returnFocus.focus();
}
function setPaused(v) {
  if (state.mode !== "play") return;
  state.paused = v;
  els.pause.setAttribute("aria-label", v ? "Resume game" : "Pause game");
  if (v) openModal(els.pauseModal);
  else closeModal(els.pauseModal);
  coach(v ? "Paused. Inspect the exact projection." : "Back in command.");
}
function syncSound() {
  els.sound.textContent = soundOn ? "Sound on" : "Sound";
  els.sound.setAttribute("aria-pressed", soundOn);
}
document
  .querySelectorAll(".system-node")
  .forEach((b) =>
    b.addEventListener("click", () => allocate(b.dataset.system)),
  );
els.start.addEventListener("click", start);
els.restart.addEventListener("click", reset);
els.modalRestart.addEventListener("click", reset);
els.pauseRestart.addEventListener("click", reset);
els.deploy.addEventListener("click", deploy);
els.continue.addEventListener("click", () =>
  state.mode === "over" ? reset() : next(),
);
els.pause.addEventListener("click", () => setPaused(!state.paused));
els.resume.addEventListener("click", () => setPaused(false));
els.sound.addEventListener("click", () => {
  soundOn = !soundOn;
  localStorage.setItem("capitalCommandSound", soundOn ? "on" : "off");
  syncSound();
  tone(520);
});
els.replay.addEventListener("click", (e) => {
  const b = e.target.closest("[data-replay]");
  if (b) replayFrom(Number(b.dataset.replay));
});
canvas.addEventListener("pointerdown", (e) => {
  const r = canvas.getBoundingClientRect();
  state.player.tx = ((e.clientX - r.left) / r.width) * 390;
  state.player.ty = ((e.clientY - r.top) / r.height) * 360;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointermove", (e) => {
  if (!canvas.hasPointerCapture(e.pointerId)) return;
  const r = canvas.getBoundingClientRect();
  state.player.tx = ((e.clientX - r.left) / r.width) * 390;
  state.player.ty = ((e.clientY - r.top) / r.height) * 360;
});
window.addEventListener("keydown", (e) => {
  if (activeModal && e.key === "Tab") {
    const f = focusables(activeModal),
      first = f[0],
      last = f.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
    return;
  }
  const k = e.key.toLowerCase();
  keys.add(k);
  if (/^[1-6]$/.test(k)) {
    e.preventDefault();
    allocate(systems[+k - 1]);
  }
  if ((k === " " || k === "escape") && state.mode === "play") {
    e.preventDefault();
    setPaused(!state.paused);
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
state = fresh();
syncSound();
render();
draw();
window.CapitalCommand = {
  applyAllocation,
  freshState: fresh,
  getState: () => state,
  preview,
  replayFrom,
  refresh: render,
};
