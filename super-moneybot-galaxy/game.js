import * as THREE from "./vendor/three.module.js";

const canvas = document.getElementById("gameCanvas");
const gameShell = document.getElementById("gameShell");
const moneyEl = document.getElementById("money");
const netWorthEl = document.getElementById("netWorth");
const iqLevelEl = document.getElementById("iqLevel");
const xpEl = document.getElementById("xp");
const questGateEl = document.getElementById("questGate");
const questShieldEl = document.getElementById("questShield");
const questComboEl = document.getElementById("questCombo");
const radarPlayerEl = document.getElementById("radarPlayer");
const radarGateEl = document.getElementById("radarGate");
const radarHazardEl = document.getElementById("radarHazard");
const phoneToggle = document.getElementById("phoneToggle");
const phoneClose = document.getElementById("phoneClose");
const botPhone = document.getElementById("botPhone");
const phoneNetWorthEl = document.getElementById("phoneNetWorth");
const phoneShieldEl = document.getElementById("phoneShield");
const phoneDistanceEl = document.getElementById("phoneDistance");
const phoneIqEl = document.getElementById("phoneIq");
const phoneXpEl = document.getElementById("phoneXp");
const phoneLivesEl = document.getElementById("phoneLives");
const contextPrompt = document.getElementById("contextPrompt");
const contextPromptText = document.getElementById("contextPromptText");
const entryModal = document.getElementById("entryModal");
const entryContinue = document.getElementById("entryContinue");
const entryLesson = document.getElementById("entryLesson");
const entryReward = document.getElementById("entryReward");
const entryNext = document.getElementById("entryNext");
const panel = document.getElementById("missionPanel");
const panelTitle = document.getElementById("panelTitle");
const panelText = document.getElementById("panelText");
const startBtn = document.getElementById("startBtn");
const toast = document.getElementById("toast");
const tutorialModal = document.getElementById("tutorialModal");
const tutorialSteps = Array.from(document.querySelectorAll(".tutorial-step"));
const tutorialDots = Array.from(document.querySelectorAll(".tutorial-dots span"));
const tutorialPrev = document.getElementById("tutorialPrev");
const tutorialNext = document.getElementById("tutorialNext");
const cockpitOverlay = document.getElementById("cockpitOverlay");
const cockpitBubble = document.getElementById("cockpitBubble");

let tutorialStep = 0;
const hasSeenTutorial = () => localStorage.getItem("smg-tutorial-seen") === "1";
const markTutorialSeen = () => localStorage.setItem("smg-tutorial-seen", "1");

function showTutorial() {
  tutorialStep = 0;
  tutorialModal.setAttribute("aria-hidden", "false");
  updateTutorial();
}

function updateTutorial() {
  tutorialSteps.forEach((step, index) => step.classList.toggle("active", index === tutorialStep));
  tutorialDots.forEach((dot, index) => dot.classList.toggle("active", index === tutorialStep));
  tutorialPrev.textContent = tutorialStep === 0 ? "Skip" : "Back";
  tutorialNext.textContent = tutorialStep === tutorialSteps.length - 1 ? "Launch" : "Next";
}

function hideTutorial() {
  tutorialModal.setAttribute("aria-hidden", "true");
  markTutorialSeen();
}

function setCockpit(text, duration = 3000) {
  if (!cockpitBubble) return;
  cockpitBubble.textContent = text;
  clearTimeout(setCockpit.timer);
  setCockpit.timer = setTimeout(() => {
    cockpitBubble.textContent = "Keep flying, captain.";
  }, duration);
}

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050712, 0.035);

const camera = new THREE.PerspectiveCamera(66, window.innerWidth / window.innerHeight, 0.1, 120);
camera.position.set(0, 5.8, 9.2);
camera.lookAt(0, 0, -12);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x050712, 1);

const lanes = [-4, -2, 0, 2, 4];
const clock = new THREE.Clock();
const collectibles = [];
const hazards = [];
const stars = [];
const state = {
  playing: false,
  won: false,
  lane: 2,
  targetX: 0,
  score: 0,
  shield: 100,
  lives: 3,
  distance: 0,
  combo: 1,
  invulnerable: 0,
  bankReady: false,
  bankEntered: false,
  pausedForBank: false
};

const palette = {
  cyan: 0x5ee7ff,
  green: 0x39f88f,
  gold: 0xffd166,
  red: 0xff4d6d,
  purple: 0x8a7cff,
  white: 0xf8fbff
};

scene.add(new THREE.HemisphereLight(0xbdefff, 0x090b18, 1.3));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
keyLight.position.set(-3, 7, 6);
scene.add(keyLight);
const rimLight = new THREE.PointLight(palette.cyan, 2.8, 24);
rimLight.position.set(3, 2, 2);
scene.add(rimLight);

const ship = createShip();
scene.add(ship);

const gate = createGate();
gate.position.z = -46;
scene.add(gate);

const bank = createBankBeacon();
bank.position.set(lanes[1], 0.12, -28);
scene.add(bank);

const laneGroup = new THREE.Group();
scene.add(laneGroup);
for (const x of lanes) {
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, 0.035, 110),
    new THREE.MeshStandardMaterial({ color: palette.cyan, emissive: palette.cyan, emissiveIntensity: 0.75 })
  );
  strip.position.set(x, -0.72, -31);
  laneGroup.add(strip);
}

for (let i = 0; i < 180; i += 1) {
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(Math.random() * 0.035 + 0.012, 8, 8),
    new THREE.MeshBasicMaterial({ color: [palette.white, palette.cyan, palette.gold][i % 3] })
  );
  star.position.set((Math.random() - 0.5) * 34, Math.random() * 16 - 3, Math.random() * -90);
  stars.push(star);
  scene.add(star);
}

function createShip() {
  const group = new THREE.Group();
  const shipMaterial = (options) => new THREE.MeshStandardMaterial({ ...options, transparent: true, opacity: 1 });
  const body = new THREE.Mesh(
    new THREE.ConeGeometry(0.62, 1.7, 4),
    shipMaterial({ color: palette.green, metalness: 0.45, roughness: 0.28, emissive: 0x0b7f4a, emissiveIntensity: 0.35 })
  );
  body.rotation.x = Math.PI / 2;
  group.add(body);

  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 22, 16),
    shipMaterial({ color: palette.cyan, metalness: 0.2, roughness: 0.12, emissive: palette.cyan, emissiveIntensity: 0.45 })
  );
  cockpit.position.set(0, 0.18, 0.18);
  group.add(cockpit);

  const wingMaterial = shipMaterial({ color: palette.gold, metalness: 0.35, roughness: 0.24 });
  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.12, 0.46), wingMaterial);
  leftWing.position.set(-0.65, -0.1, 0.2);
  leftWing.rotation.z = -0.24;
  group.add(leftWing);
  const rightWing = leftWing.clone();
  rightWing.position.x = 0.65;
  rightWing.rotation.z = 0.24;
  group.add(rightWing);

  const trail = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 1.2, 18),
    new THREE.MeshBasicMaterial({ color: palette.cyan, transparent: true, opacity: 0.54 })
  );
  trail.position.z = 0.95;
  trail.rotation.x = -Math.PI / 2;
  group.add(trail);

  group.position.set(0, 0, 2.4);
  return group;
}

function createGate() {
  const group = new THREE.Group();
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(4.6, 0.08, 16, 96),
    new THREE.MeshStandardMaterial({ color: palette.green, emissive: palette.green, emissiveIntensity: 1.2 })
  );
  group.add(torus);
  const inner = new THREE.Mesh(
    new THREE.TorusGeometry(3.7, 0.055, 16, 96),
    new THREE.MeshStandardMaterial({ color: palette.cyan, emissive: palette.cyan, emissiveIntensity: 1.3 })
  );
  inner.rotation.z = Math.PI / 5;
  group.add(inner);
  return group;
}

function createBankBeacon() {
  const group = new THREE.Group();
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1.15, 0.16, 6),
    new THREE.MeshStandardMaterial({ color: palette.green, emissive: palette.green, emissiveIntensity: 0.55, metalness: 0.25 })
  );
  pad.rotation.y = Math.PI / 6;
  group.add(pad);

  const vault = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.82, 0.58),
    new THREE.MeshStandardMaterial({ color: 0x10263a, emissive: 0x0c8c63, emissiveIntensity: 0.22, roughness: 0.32 })
  );
  vault.position.y = 0.48;
  group.add(vault);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(0.96, 0.58, 4),
    new THREE.MeshStandardMaterial({ color: palette.gold, emissive: 0x8f5d00, emissiveIntensity: 0.28, metalness: 0.35 })
  );
  roof.position.y = 1.1;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(1.38, 0.045, 12, 64),
    new THREE.MeshBasicMaterial({ color: palette.cyan, transparent: true, opacity: 0.78 })
  );
  halo.position.y = 0.5;
  halo.rotation.x = Math.PI / 2;
  group.add(halo);

  group.userData = { baseY: 0.12 };
  return group;
}

function makeCollectible(kind) {
  const color = kind === "fund" ? palette.green : kind === "index" ? palette.cyan : palette.gold;
  const geometry = kind === "index"
    ? new THREE.OctahedronGeometry(0.42, 0)
    : new THREE.CylinderGeometry(0.38, 0.38, 0.16, 28);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color, metalness: 0.42, roughness: 0.22, emissive: color, emissiveIntensity: 0.35 })
  );
  mesh.userData = { kind, hit: false };
  mesh.rotation.x = Math.PI / 2;
  resetObject(mesh, -62 - Math.random() * 12);
  collectibles.push(mesh);
  scene.add(mesh);
}

function makeHazard(kind = "debt") {
  const isImpulse = kind === "impulse";
  const mesh = new THREE.Mesh(
    isImpulse ? new THREE.BoxGeometry(0.9, 0.55, 0.28) : new THREE.DodecahedronGeometry(0.55, 0),
    new THREE.MeshStandardMaterial({
      color: isImpulse ? palette.purple : palette.red,
      roughness: 0.5,
      emissive: isImpulse ? palette.purple : palette.red,
      emissiveIntensity: 0.28
    })
  );
  mesh.userData = { kind, hit: false };
  resetObject(mesh, -66 - Math.random() * 18);
  hazards.push(mesh);
  scene.add(mesh);
}

function resetObject(mesh, z) {
  mesh.position.set(lanes[Math.floor(Math.random() * lanes.length)], Math.random() * 1.3 - 0.05, z);
  mesh.rotation.set(Math.random(), Math.random(), Math.random());
  mesh.userData.hit = false;
}

function moveLane(delta) {
  if (!state.playing || state.pausedForBank) return;
  state.lane = Math.max(0, Math.min(lanes.length - 1, state.lane + delta));
  state.targetX = lanes[state.lane];
}

function useShield() {
  if (!state.playing || state.pausedForBank || state.shield < 34) return;
  state.shield = Math.max(0, state.shield - 34);
  state.invulnerable = 1.1;
  showToast("Emergency shield spent: surprise costs blocked");
}

function startGame() {
  hideTutorial();
  state.playing = true;
  state.won = false;
  state.lane = 2;
  state.targetX = 0;
  state.score = 0;
  state.shield = 100;
  state.lives = 3;
  state.distance = 0;
  state.combo = 1;
  state.invulnerable = 0;
  state.bankReady = false;
  state.bankEntered = false;
  state.pausedForBank = false;
  bank.position.set(lanes[1], 0.12, -28);
  bank.visible = true;
  entryModal.setAttribute("aria-hidden", "true");
  contextPrompt.setAttribute("aria-hidden", "true");
  gameShell.classList.add("playing");
  panel.classList.add("hidden");
  closeBotPhone();
  collectibles.forEach((item, index) => resetObject(item, -28 - index * 9));
  hazards.forEach((item, index) => resetObject(item, -36 - index * 13));
  while (collectibles.length < 15) makeCollectible(["coin", "index", "fund"][collectibles.length % 3]);
  while (hazards.length < 9) makeHazard(hazards.length % 3 === 0 ? "impulse" : "debt");
  showToast("Mission launched: build the shield, dodge debt");
  setCockpit("Collect green funds and cyan index stars. Avoid the red debt meteors!");
  updateHud();
}

function openBank() {
  if (!state.playing || !state.bankReady || state.bankEntered) return;
  state.pausedForBank = true;
  state.bankEntered = true;
  state.bankReady = false;
  state.shield = Math.min(100, state.shield + 24);
  state.score += 250 * state.combo;
  state.combo = Math.min(5, state.combo + 0.5);
  state.invulnerable = 1.4;
  bank.visible = false;
  entryLesson.textContent = "A real buffer turns a surprise bill into a planned expense instead of a mission-ending crash.";
  entryReward.textContent = "+24 shield, +250 money, +0.5x combo";
  entryNext.textContent = "Close the branch, keep the shield above 35%, and finish the galaxy gate run.";
  contextPrompt.setAttribute("aria-hidden", "true");
  entryModal.setAttribute("aria-hidden", "false");
  setCockpit("First Bank tune-up complete. That emergency fund just saved the mission.");
  updateHud();
}

function closeBank() {
  entryModal.setAttribute("aria-hidden", "true");
  state.pausedForBank = false;
  showToast("First Bank reward applied");
}

function endGame(won) {
  state.playing = false;
  state.won = won;
  gameShell.classList.remove("playing");
  panel.classList.remove("hidden");
  panelTitle.textContent = won ? "Galaxy Gate Cleared" : "Mission Failed";
  panelText.textContent = won
    ? `Final score ${Math.round(state.score)}. Your best lesson: consistent assets plus a savings shield can survive a rough galaxy.`
    : `Final score ${Math.round(state.score)}. Rebuild the emergency fund, avoid debt meteors, and launch again.`;
  startBtn.textContent = "Replay Mission";
  showToast(won ? "Mission complete" : "Try another run");
  setCockpit(won ? "Elite work, captain. Consistency wins galaxies." : "Hull breached. Rebuild the shield and try again.");
}

function collect(item) {
  if (item.userData.hit) return;
  item.userData.hit = true;
  const kind = item.userData.kind;
  if (kind === "fund") {
    state.shield = Math.min(100, state.shield + 18);
    state.score += 80 * state.combo;
    showToast("Emergency fund boosted your shield");
  } else if (kind === "index") {
    state.combo = Math.min(5, state.combo + 0.5);
    state.score += 150 * state.combo;
    showToast(`Index star combo x${state.combo.toFixed(1)}`);
    if (state.combo >= 2) setCockpit("2x combo active. Diversified index assets are building momentum!");
  } else {
    state.score += 100 * state.combo;
  }
  resetObject(item, -68 - Math.random() * 22);
}

function hitHazard(hazard) {
  if (hazard.userData.hit || state.invulnerable > 0) return;
  hazard.userData.hit = true;
  state.combo = 1;
  const isImpulse = hazard.userData.kind === "impulse";
  if (isImpulse) setCockpit("Impulse buy! That random spend just reset your combo.");
  else setCockpit("Debt meteor hit. High-interest debt drains momentum fast.");
  const damage = isImpulse ? 18 : 28;
  if (state.shield >= damage) {
    state.shield -= damage;
    showToast(isImpulse ? "Impulse buy slowed your combo" : "Debt meteor hit: shield absorbed the cost");
  } else {
    state.lives -= 1;
    state.shield = 0;
    state.invulnerable = 1.2;
    showToast(isImpulse ? "Impulse buy broke through" : "Debt meteor broke through");
  }
  resetObject(hazard, -76 - Math.random() * 18);
  if (state.lives <= 0) endGame(false);
}

function updateHud() {
  const money = Math.round(state.score);
  const netWorth = 500 + money + Math.round(state.shield * 3);
  const xp = Math.round(state.score / 8 + state.distance * 6);
  const iqLevel = Math.max(1, Math.min(10, Math.floor(xp / 250) + 1));
  const distance = Math.min(100, Math.round(state.distance));
  const shield = Math.round(state.shield);
  const combo = state.combo.toFixed(1);

  moneyEl.textContent = `$${money.toLocaleString()}`;
  netWorthEl.textContent = `$${netWorth.toLocaleString()}`;
  iqLevelEl.textContent = String(iqLevel);
  xpEl.textContent = xp.toLocaleString();

  questGateEl.textContent = `Reach the gate: ${distance}%`;
  questShieldEl.textContent = state.bankEntered ? `First Bank visited: ${shield}% shield` : `Find First Bank: ${shield}% shield`;
  questComboEl.textContent = `Build a 2x asset combo: ${combo}x`;
  questGateEl.classList.toggle("complete", distance >= 100);
  questShieldEl.classList.toggle("complete", state.bankEntered && shield >= 35);
  questComboEl.classList.toggle("complete", state.combo >= 2);

  const lanePercent = 18 + (state.lane / (lanes.length - 1)) * 64;
  radarPlayerEl.style.left = `${lanePercent}%`;
  radarGateEl.style.top = `${Math.max(14, 82 - distance * 0.66)}%`;
  radarHazardEl.style.left = `${hazards[0] ? 18 + (lanes.indexOf(hazards[0].position.x) / (lanes.length - 1)) * 64 : 62}%`;
  radarHazardEl.style.top = `${hazards[0] ? Math.max(20, Math.min(76, 78 + hazards[0].position.z)) : 42}%`;

  phoneNetWorthEl.textContent = `$${netWorth.toLocaleString()} net worth`;
  phoneShieldEl.textContent = `${shield}% shield`;
  phoneDistanceEl.textContent = `${distance}% to gate`;
  phoneIqEl.textContent = `IQ Level ${iqLevel}`;
  phoneXpEl.textContent = `${xp.toLocaleString()} XP`;
  phoneLivesEl.textContent = `${state.lives} lives`;
}

function openBotPhone() {
  botPhone.setAttribute("aria-hidden", "false");
  phoneToggle.setAttribute("aria-expanded", "true");
}

function closeBotPhone() {
  botPhone.setAttribute("aria-hidden", "true");
  phoneToggle.setAttribute("aria-expanded", "false");
}

function toggleBotPhone() {
  if (botPhone.getAttribute("aria-hidden") === "true") openBotPhone();
  else closeBotPhone();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1200);
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.033);
  const activeRun = state.playing && !state.pausedForBank;
  const speed = activeRun ? 18 + state.distance * 0.045 : 5;
  ship.position.x += (state.targetX - ship.position.x) * Math.min(1, dt * 10);
  ship.rotation.z = (state.targetX - ship.position.x) * -0.12;
  ship.rotation.y = Math.sin(performance.now() * 0.004) * 0.05;

  stars.forEach((star) => {
    star.position.z += dt * speed * 0.55;
    if (star.position.z > 8) {
      star.position.z = -90;
      star.position.x = (Math.random() - 0.5) * 34;
      star.position.y = Math.random() * 16 - 3;
    }
  });

  gate.rotation.z += dt * 0.55;
  gate.position.z = -46 + state.distance * 0.484;
  bank.rotation.y += dt * 0.9;
  bank.position.y = bank.userData.baseY + Math.sin(performance.now() * 0.003) * 0.16;

  if (activeRun) {
    state.distance += dt * 4.8;
    state.score += dt * 9 * state.combo;
    state.invulnerable = Math.max(0, state.invulnerable - dt);
    state.shield = Math.max(0, state.shield - dt * 1.2);

    collectibles.forEach((item) => {
      item.position.z += dt * speed;
      item.rotation.y += dt * 2.7;
      item.rotation.z += dt * 1.4;
      if (item.position.z > 7) resetObject(item, -70 - Math.random() * 20);
      if (item.position.distanceTo(ship.position) < 0.92) collect(item);
    });

    hazards.forEach((hazard) => {
      hazard.position.z += dt * (speed * 0.92);
      hazard.rotation.x += dt * 1.7;
      hazard.rotation.y += dt * 2.1;
      if (hazard.position.z > 7) resetObject(hazard, -76 - Math.random() * 24);
      if (hazard.position.distanceTo(ship.position) < 0.98) hitHazard(hazard);
    });

    if (!state.bankEntered) {
      bank.position.z += dt * speed;
      if (bank.position.z > 8) bank.position.set(lanes[3], 0.12, -34);
      state.bankReady = bank.position.distanceTo(ship.position) < 1.55;
      contextPrompt.setAttribute("aria-hidden", String(!state.bankReady));
      contextPromptText.textContent = state.bankReady ? "Enter First Bank" : "";
    }

    if (state.distance >= 100 && gate.position.z >= ship.position.z - 0.15) endGame(true);
    updateHud();
  }

  ship.traverse((child) => {
    if (child.material && child.material.opacity !== undefined) {
      child.material.opacity = state.invulnerable > 0 ? 0.64 + Math.sin(performance.now() * 0.025) * 0.2 : 1;
    }
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") moveLane(-1);
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") moveLane(1);
  if (event.key === " " || event.key.toLowerCase() === "w") useShield();
  if (event.key.toLowerCase() === "e") openBank();
  if (event.key === "Enter" && !state.playing) startGame();
  if (event.key === "Escape") {
    closeBotPhone();
    if (state.pausedForBank) closeBank();
  }
});

let pointerStart = null;
canvas.addEventListener("pointerdown", (event) => {
  pointerStart = event.clientX;
  canvas.setPointerCapture?.(event.pointerId);
});
canvas.addEventListener("pointerup", (event) => {
  if (pointerStart === null) return;
  const delta = event.clientX - pointerStart;
  if (Math.abs(delta) > 24) moveLane(delta > 0 ? 1 : -1);
  pointerStart = null;
  canvas.releasePointerCapture?.(event.pointerId);
});
canvas.addEventListener("pointercancel", () => {
  pointerStart = null;
});

document.getElementById("leftBtn").addEventListener("click", () => moveLane(-1));
document.getElementById("rightBtn").addEventListener("click", () => moveLane(1));
document.getElementById("boostBtn").addEventListener("click", useShield);
startBtn.addEventListener("click", startGame);

tutorialPrev.addEventListener("click", () => {
  if (tutorialStep === 0) {
    hideTutorial();
  } else {
    tutorialStep -= 1;
    updateTutorial();
  }
});

tutorialNext.addEventListener("click", () => {
  if (tutorialStep >= tutorialSteps.length - 1) {
    startGame();
  } else {
    tutorialStep += 1;
    updateTutorial();
  }
});
contextPrompt.addEventListener("click", openBank);
entryContinue.addEventListener("click", closeBank);
phoneToggle.addEventListener("click", toggleBotPhone);
phoneClose.addEventListener("click", closeBotPhone);
document.querySelectorAll(".phone-tabs button").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".phone-tabs button").forEach((button) => {
      button.classList.toggle("active", button === tab);
      button.setAttribute("aria-selected", String(button === tab));
    });
    document.querySelectorAll(".phone-panel").forEach((panelEl) => {
      panelEl.classList.toggle("active", panelEl.id === `phone${tab.dataset.tab[0].toUpperCase()}${tab.dataset.tab.slice(1)}`);
    });
  });
});

updateHud();
if (!hasSeenTutorial()) showTutorial();
animate();
