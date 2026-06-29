const canvas = document.querySelector("#holoCanvas");
const ctx = canvas.getContext("2d");
const form = document.querySelector("#advisorForm");
const challengeInput = document.querySelector("#challenge");
const domainInput = document.querySelector("#domain");
const timeframeInput = document.querySelector("#timeframe");
const intensityInput = document.querySelector("#intensity");
const intensityLabel = document.querySelector("#intensityLabel");
const charCount = document.querySelector("#charCount");
const responseTitle = document.querySelector("#responseTitle");
const responseText = document.querySelector("#responseText");
const actionStack = document.querySelector("#actionStack");
const avatarMood = document.querySelector("#avatarMood");
const saveBtn = document.querySelector("#saveBtn");
const clearBtn = document.querySelector("#clearBtn");
const memoryList = document.querySelector("#memoryList");
const holoDomain = document.querySelector("#holoDomain");
const holoTimeframe = document.querySelector("#holoTimeframe");

const storageKey = "kg50-transmissions";
const maxChallengeLength = Number(challengeInput.getAttribute("maxlength")) || 240;
let latestTransmission = null;
let pulse = 0;
const particles = Array.from({ length: 34 }, (_, index) => ({
  angle: (Math.PI * 2 * index) / 34,
  radius: 150 + (index % 7) * 18,
  speed: 0.002 + (index % 5) * 0.0007
}));

const domainProfiles = {
  build: {
    title: "Ship the smallest scary version.",
    lens: "Your future is built by visible reps, not private perfection.",
    action: ["Define the paid or user-facing outcome.", "Remove one dependency that lets you delay.", "Publish a version before the day cools off."]
  },
  money: {
    title: "Buy freedom before flex.",
    lens: "KG50 cares less about looking up and more about staying untrapped.",
    action: ["Separate survival cash from ambition cash.", "Kill or renegotiate one recurring leak.", "Make the next dollar easier to track."]
  },
  body: {
    title: "Energy is the operating system.",
    lens: "The older you is not impressed by a win that costs the body.",
    action: ["Do the recovery move first.", "Pick the workout you can repeat tired.", "Set a hard stop before your focus degrades."]
  },
  relationships: {
    title: "Say the clean thing early.",
    lens: "A delayed truth becomes emotional debt with interest.",
    action: ["Name the real request in one sentence.", "Ask one direct question.", "Repair the smallest avoidant behavior today."]
  },
  creative: {
    title: "Make the artifact undeniable.",
    lens: "Taste without output is just a private museum.",
    action: ["Choose the strongest image or hook.", "Cut the clever part that slows the piece.", "Release a rough-but-alive version."]
  }
};

const modeVoices = {
  mentor: {
    open: "Listen. I remember this exact fork.",
    close: "You do not need a perfect life plan. You need one clean rep that compounds.",
    mood: "Direct Mode"
  },
  operator: {
    open: "Transmission received. Here is the move.",
    close: "Execute, measure, adjust. No ceremony.",
    mood: "Operator Mode"
  },
  savage: {
    open: "Holy shit lol, yes, this is the moment where excuses try to wear a suit.",
    close: "Future you is not mad. Future you is just bored of watching you negotiate with delay.",
    mood: "No-Flinch Mode"
  }
};

function getMemories() {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey)) || [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setMemories(memories) {
  localStorage.setItem(storageKey, JSON.stringify(memories.slice(0, 6)));
}

function selectedMode() {
  return new FormData(form).get("mode") || "mentor";
}

function cssColor(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function timeframeLine(timeframe) {
  const lines = {
    today: "Today, you win by making the decision smaller and the action visible.",
    week: "This week, momentum matters more than intensity. Stack five boring wins.",
    quarter: "This quarter, build the system that makes the right move automatic.",
    year: "This year, stop optimizing for applause and optimize for optionality."
  };
  return lines[timeframe] || lines.today;
}

function intensityLine(value) {
  if (value <= 3) return "Be kind, but do not be vague.";
  if (value <= 7) return "You already know enough to move.";
  return "The cost is not the hard work. The cost is staying available to the wrong future.";
}

function buildTransmission() {
  const challenge = challengeInput.value.trim() || "I need a sharper next move.";
  const domain = domainProfiles[domainInput.value] || domainProfiles.build;
  const mode = modeVoices[selectedMode()] || modeVoices.mentor;
  const timeframe = timeframeInput.value;
  const intensity = Number(intensityInput.value);
  const cleanChallenge = challenge.replace(/\s+/g, " ");

  return {
    id: Date.now(),
    title: domain.title,
    mood: mode.mood,
    text: `${mode.open} You asked: "${cleanChallenge}" ${domain.lens} ${timeframeLine(timeframe)} ${intensityLine(intensity)} ${mode.close}`,
    actions: domain.action.map((action, index) => {
      const labels = ["First move", "Constraint", "Proof"];
      return { label: labels[index], text: action };
    }),
    savedAt: new Date().toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
  };
}

function renderTransmission(transmission) {
  responseTitle.textContent = transmission.title;
  responseText.textContent = transmission.text;
  avatarMood.textContent = transmission.mood;
  actionStack.replaceChildren(...transmission.actions.map((action) => {
    const card = document.createElement("div");
    const label = document.createElement("span");
    const text = document.createElement("p");

    card.className = "action-card";
    label.textContent = action.label;
    text.textContent = action.text;
    card.append(label, text);
    return card;
  }));
  saveBtn.disabled = false;
}

function createMemoryItem(memory) {
  const item = document.createElement("article");
  const title = document.createElement("strong");
  const text = document.createElement("p");

  item.className = "memory-item";
  title.textContent = `${memory.savedAt} - ${memory.title}`;
  text.textContent = `${memory.text.slice(0, 132)}${memory.text.length > 132 ? "..." : ""}`;
  item.append(title, text);
  return item;
}

function renderMemories() {
  const memories = getMemories();
  memoryList.replaceChildren();

  if (!memories.length) {
    const empty = document.createElement("div");
    const title = document.createElement("strong");
    const text = document.createElement("p");

    empty.className = "memory-item";
    title.textContent = "No saves yet";
    text.textContent = "Ask KG50, then save the transmissions worth repeating.";
    empty.append(title, text);
    memoryList.append(empty);
    return;
  }

  memoryList.append(...memories.map(createMemoryItem));
}

function updateCharCount() {
  charCount.textContent = `${challengeInput.value.length}/${maxChallengeLength}`;
}

function syncReadouts() {
  const selectedDomain = domainInput.options[domainInput.selectedIndex]?.textContent || "Build / business";
  const selectedTimeframe = timeframeInput.options[timeframeInput.selectedIndex]?.textContent || "Today";

  document.body.dataset.mode = selectedMode();
  holoDomain.textContent = selectedDomain;
  holoTimeframe.textContent = selectedTimeframe;
}

function drawHologram() {
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const mode = cssColor("--mode") || "#74f5c5";
  const mode2 = cssColor("--mode-2") || "#62e7ff";
  pulse += 0.018;

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const aura = ctx.createRadialGradient(cx, cy, 20, cx, cy, 310);
  aura.addColorStop(0, colorWithAlpha(mode, 0.24));
  aura.addColorStop(0.46, colorWithAlpha(mode2, 0.13));
  aura.addColorStop(1, "rgba(98,231,255,0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, cy, 310 + Math.sin(pulse) * 8, 0, Math.PI * 2);
  ctx.fill();

  drawParticles(cx, cy, mode, mode2);

  ctx.strokeStyle = colorWithAlpha(mode2, 0.68);
  ctx.lineWidth = 5;
  roundedRect(cx - 108, cy - 214, 216, 252, 90);
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.strokeStyle = colorWithAlpha(mode, 0.44);
  roundedRect(cx - 78, cy - 174, 156, 178, 68);
  ctx.stroke();

  drawFeature(cx - 44, cy - 94, 28, 9);
  drawFeature(cx + 44, cy - 94, 28, 9);

  ctx.strokeStyle = colorWithAlpha("#ffcc66", 0.82);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 42, cy - 15);
  ctx.quadraticCurveTo(cx, cy + 14 + Math.sin(pulse * 1.7) * 5, cx + 42, cy - 15);
  ctx.stroke();

  ctx.strokeStyle = colorWithAlpha(mode2, 0.38);
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx - 140, cy + 208);
  ctx.quadraticCurveTo(cx - 86, cy + 76, cx - 76, cy + 18);
  ctx.moveTo(cx + 140, cy + 208);
  ctx.quadraticCurveTo(cx + 86, cy + 76, cx + 76, cy + 18);
  ctx.stroke();

  for (let i = 0; i < 18; i += 1) {
    const y = 118 + i * 27 + Math.sin(pulse * 2 + i) * 2;
    ctx.strokeStyle = i % 4 === 0 ? "rgba(255,204,102,0.22)" : colorWithAlpha(mode2, 0.18);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 184 + Math.sin(i) * 14, y);
    ctx.lineTo(cx + 184 + Math.cos(i) * 14, y);
    ctx.stroke();
  }

  ctx.strokeStyle = colorWithAlpha(mode, 0.58);
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse(cx, cy + 218, 116 + i * 42, 22 + i * 6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
  requestAnimationFrame(drawHologram);
}

function colorWithAlpha(color, alpha) {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const value = hex.length === 3
      ? hex.split("").map((char) => char + char).join("")
      : hex;
    const number = Number.parseInt(value, 16);
    const r = (number >> 16) & 255;
    const g = (number >> 8) & 255;
    const b = number & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}

function drawParticles(cx, cy, mode, mode2) {
  particles.forEach((particle, index) => {
    const angle = particle.angle + pulse * particle.speed * 90;
    const x = cx + Math.cos(angle) * particle.radius;
    const y = cy + 18 + Math.sin(angle) * (particle.radius * 0.22);
    const size = 1.4 + (index % 4) * 0.55;

    ctx.fillStyle = index % 3 === 0 ? colorWithAlpha(mode, 0.52) : colorWithAlpha(mode2, 0.38);
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function roundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
}

function drawFeature(x, y, width, height) {
  ctx.fillStyle = "rgba(98,231,255,0.72)";
  ctx.shadowColor = "rgba(98,231,255,0.95)";
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

intensityInput.addEventListener("input", () => {
  intensityLabel.textContent = intensityInput.value;
});

challengeInput.addEventListener("input", updateCharCount);
domainInput.addEventListener("change", syncReadouts);
timeframeInput.addEventListener("change", syncReadouts);
form.addEventListener("change", syncReadouts);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  latestTransmission = buildTransmission();
  renderTransmission(latestTransmission);
});

saveBtn.addEventListener("click", () => {
  if (!latestTransmission) return;
  const memories = getMemories().filter((memory) => memory.id !== latestTransmission.id);
  setMemories([latestTransmission, ...memories]);
  renderMemories();
});

clearBtn.addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  renderMemories();
});

updateCharCount();
syncReadouts();
renderMemories();
drawHologram();
