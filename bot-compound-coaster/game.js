/* Compound Coaster 3D - Three.js Game Engine */
import * as THREE from './vendor/three.module.js';

// ==========================================================================
// GAME STATE & CONFIGURATION
// ==========================================================================
const CONFIG = {
  lanes: [-2.5, 0, 2.5],
  baseSpeed: 0.6,
  boostSpeed: 1.2,
  targetNetWorth: 1000000,
  initialPrincipal: 10000,
  baseApy: 0.07,
  monthsPerSec: 1.5,
  laneChangeSpeed: 12.0,
  spawnInterval: 12, // Z units between spawn clusters
};

const state = {
  started: false,
  paused: false,
  gameOver: false,
  won: false,
  
  // Player State
  currentLaneIndex: 1, // Center lane
  targetX: 0,
  currentX: 0,
  carY: 0,
  isBoosting: false,
  boostTimer: 0,
  shields: 1,
  
  // Financial Metrics
  netWorth: CONFIG.initialPrincipal,
  principal: CONFIG.initialPrincipal,
  apy: CONFIG.baseApy,
  compoundMultiplier: 1.0,
  monthsElapsed: 0,
  yearsElapsed: 0,
  
  // Motion & Physics
  distance: 0,
  speed: CONFIG.baseSpeed,
  
  // Audio
  audioEnabled: true,
};

// ==========================================================================
// PROCEDURAL WEB AUDIO SYNTHESIZER
// ==========================================================================
class SoundSynth {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCoin() {
    if (!state.audioEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6
    
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playRing() {
    if (!state.audioEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.15, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.2);
    });
  }

  playBoost() {
    if (!state.audioEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playDebtHit() {
    if (!state.audioEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  playShield() {
    if (!state.audioEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playVictory() {
    if (!state.audioEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.2, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.4);
    });
  }
}

const audio = new SoundSynth();

// ==========================================================================
// THREE.JS SCENE SETUP
// ==========================================================================
let scene, camera, renderer;
let coasterMesh, trackGroup, itemsGroup, particlesGroup;
let clock = new THREE.Clock();
let activeItems = [];
let particles = [];

function initThree() {
  const container = document.getElementById('canvas-container');
  
  // Scene & Fog
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050810);
  scene.fog = new THREE.FogExp2(0x050810, 0.015);

  // Camera
  camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 300);
  camera.position.set(0, 3.5, -7);
  camera.lookAt(0, 1, 10);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x00E676, 1.2);
  dirLight.position.set(10, 20, -10);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const cyanLight = new THREE.PointLight(0x00F0FF, 2, 30);
  cyanLight.position.set(0, 5, 5);
  scene.add(cyanLight);

  // Groups
  trackGroup = new THREE.Group();
  itemsGroup = new THREE.Group();
  particlesGroup = new THREE.Group();
  scene.add(trackGroup);
  scene.add(itemsGroup);
  scene.add(particlesGroup);

  // Build World Objects
  buildCoasterVehicle();
  buildTrackSegment();

  // Event Listeners
  window.addEventListener('resize', onWindowResize);
}

// ==========================================================================
// PROCEDURAL MESH GENERATORS
// ==========================================================================
function buildCoasterVehicle() {
  const carGroup = new THREE.Group();

  // Main Car Body
  const bodyGeo = new THREE.BoxGeometry(1.6, 0.7, 2.4);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0a1526,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x00E676,
    emissiveIntensity: 0.2,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.5;
  bodyMesh.castShadow = true;
  carGroup.add(bodyMesh);

  // Neon Side Stripes
  const stripeGeo = new THREE.BoxGeometry(1.65, 0.1, 2.2);
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });
  const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
  stripeMesh.position.y = 0.55;
  carGroup.add(stripeMesh);

  // Windshield
  const glassGeo = new THREE.ConeGeometry(0.7, 0.8, 4);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x00F0FF,
    transparent: true,
    opacity: 0.7,
    roughness: 0.1,
  });
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  glassMesh.rotation.y = Math.PI / 4;
  glassMesh.rotation.x = -Math.PI / 6;
  glassMesh.position.set(0, 0.9, 0.3);
  carGroup.add(glassMesh);

  // Rear Thrusters
  const thrusterGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.6, 8);
  const thrusterMat = new THREE.MeshBasicMaterial({ color: 0x00E676 });
  const t1 = new THREE.Mesh(thrusterGeo, thrusterMat);
  const t2 = new THREE.Mesh(thrusterGeo, thrusterMat);
  t1.rotation.x = Math.PI / 2;
  t2.rotation.x = Math.PI / 2;
  t1.position.set(-0.5, 0.5, -1.2);
  t2.position.set(0.5, 0.5, -1.2);
  carGroup.add(t1);
  carGroup.add(t2);

  // Coaster Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 12);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 });
  [-0.8, 0.8].forEach(x => {
    [-0.8, 0.8].forEach(z => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.25, z);
      carGroup.add(wheel);
    });
  });

  coasterMesh = carGroup;
  scene.add(coasterMesh);
}

function buildTrackSegment() {
  // Create 3 glowing tubular rails running along Z
  const railGeo = new THREE.CylinderGeometry(0.08, 0.08, 200, 12);
  const railMat = new THREE.MeshBasicMaterial({ color: 0x00E676 });

  CONFIG.lanes.forEach(xPos => {
    // Left & Right sub-rails for each lane
    const railL = new THREE.Mesh(railGeo, railMat);
    const railR = new THREE.Mesh(railGeo, railMat);
    railL.rotation.x = Math.PI / 2;
    railR.rotation.x = Math.PI / 2;
    railL.position.set(xPos - 0.6, 0.05, 90);
    railR.position.set(xPos + 0.6, 0.05, 90);
    trackGroup.add(railL);
    trackGroup.add(railR);
  });

  // Cross-ties / Sleepers along the track
  const tieGeo = new THREE.BoxGeometry(7, 0.08, 0.2);
  const tieMat = new THREE.MeshStandardMaterial({ color: 0x111927, metalness: 0.8 });
  for (let z = 0; z < 180; z += 2.5) {
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 0, z);
    trackGroup.add(tie);
  }

  // Grid Floor Ground
  const gridHelper = new THREE.GridHelper(200, 40, 0x00F0FF, 0x003344);
  gridHelper.position.set(0, -0.2, 90);
  trackGroup.add(gridHelper);
}

// ==========================================================================
// ITEM & OBSTACLE SPAWNER
// ==========================================================================
let nextSpawnZ = 30;

function spawnItemCluster() {
  const laneIndex = Math.floor(Math.random() * 3);
  const xPos = CONFIG.lanes[laneIndex];
  const zPos = state.distance + nextSpawnZ;

  const rand = Math.random();
  let type = 'DIVIDEND_GEM';
  
  if (rand < 0.50) {
    type = 'DIVIDEND_GEM';
  } else if (rand < 0.70) {
    type = 'APY_RING';
  } else if (rand < 0.82) {
    type = 'SHIELD';
  } else {
    type = 'DEBT_HAZARD';
  }

  let mesh;

  if (type === 'DIVIDEND_GEM') {
    // Glowing Green Octahedron
    const geo = new THREE.OctahedronGeometry(0.5, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x00E676,
      emissive: 0x00E676,
      emissiveIntensity: 0.8,
      roughness: 0.1,
    });
    mesh = new THREE.Mesh(geo, mat);
  } else if (type === 'APY_RING') {
    // Golden Torus
    const geo = new THREE.TorusGeometry(0.6, 0.12, 8, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      emissive: 0xFFD700,
      emissiveIntensity: 0.9,
      metalness: 0.9,
    });
    mesh = new THREE.Mesh(geo, mat);
  } else if (type === 'SHIELD') {
    // Cyan Shield Icon
    const geo = new THREE.IcosahedronGeometry(0.5, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x00F0FF,
      emissive: 0x00F0FF,
      emissiveIntensity: 0.8,
    });
    mesh = new THREE.Mesh(geo, mat);
  } else {
    // Red Debt Hazard Box
    const geo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xFF3D71,
      emissive: 0xFF3D71,
      emissiveIntensity: 0.9,
      roughness: 0.3,
    });
    mesh = new THREE.Mesh(geo, mat);
  }

  mesh.position.set(xPos, 0.8, zPos);
  itemsGroup.add(mesh);

  activeItems.push({
    mesh,
    type,
    x: xPos,
    z: zPos,
    collected: false,
  });

  nextSpawnZ += 12 + Math.random() * 8;
}

function createBurstParticles(pos, colorHex) {
  for (let i = 0; i < 12; i++) {
    const geo = new THREE.SphereGeometry(0.08, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: colorHex });
    const p = new THREE.Mesh(geo, mat);
    p.position.copy(pos);
    p.userData = {
      vx: (Math.random() - 0.5) * 0.2,
      vy: Math.random() * 0.2 + 0.1,
      vz: (Math.random() - 0.5) * 0.2,
      life: 1.0,
    };
    particlesGroup.add(p);
    particles.push(p);
  }
}

function updateParticles(delta) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.position.x += p.userData.vx;
    p.position.y += p.userData.vy;
    p.position.z += p.userData.vz;
    p.userData.life -= delta * 2;
    p.scale.setScalar(Math.max(0, p.userData.life));

    if (p.userData.life <= 0) {
      particlesGroup.remove(p);
      particles.splice(i, 1);
    }
  }
}

// ==========================================================================
// GAME LOGIC & FINANCIAL CALCULATIONS
// ==========================================================================
function updateGame(delta) {
  if (!state.started || state.paused || state.gameOver || state.won) return;

  // Handle Boosting
  if (state.isBoosting) {
    state.speed = CONFIG.boostSpeed;
    state.boostTimer -= delta;
    if (state.boostTimer <= 0) {
      state.isBoosting = false;
      document.getElementById('speedlines-overlay').classList.add('hidden');
    }
  } else {
    state.speed = CONFIG.baseSpeed;
  }

  // Motion Progression
  state.distance += state.speed * delta * 40;
  
  // Smooth Lane Transition
  state.targetX = CONFIG.lanes[state.currentLaneIndex];
  state.currentX += (state.targetX - state.currentX) * CONFIG.laneChangeSpeed * delta;
  
  // Update Coaster Position & Camera Follow
  coasterMesh.position.x = state.currentX;
  coasterMesh.position.z = state.distance;
  
  // Exponential Compound Elevation Curve: Y increases mathematically as distance grows
  const curveHeight = Math.pow(state.distance * 0.002, 1.8) * 4;
  coasterMesh.position.y = curveHeight;
  
  // Camera follows coaster closely
  camera.position.x = state.currentX * 0.6;
  camera.position.z = state.distance - 6.5;
  camera.position.y = curveHeight + 2.8;
  camera.lookAt(state.currentX * 0.8, curveHeight + 1.0, state.distance + 8);

  // Move Track Floor forward to create infinite loop feel
  trackGroup.position.z = Math.floor(state.distance / 10) * 10;

  // Spawn New Items Ahead
  while (nextSpawnZ < state.distance + 120) {
    spawnItemCluster();
  }

  // Check Item Collisions & Rotations
  for (let i = activeItems.length - 1; i >= 0; i--) {
    const item = activeItems[i];
    item.mesh.rotation.y += delta * 2.5;

    // Collision check
    const dz = Math.abs(item.z - state.distance);
    const dx = Math.abs(item.x - state.currentX);

    if (dz < 1.2 && dx < 1.0 && !item.collected) {
      item.collected = true;
      itemsGroup.remove(item.mesh);

      if (item.type === 'DIVIDEND_GEM') {
        state.netWorth += 1500 * state.compoundMultiplier;
        state.compoundMultiplier += 0.05;
        audio.playCoin();
        createBurstParticles(item.mesh.position, 0x00E676);
        showTicker('Dividend Reinvested! +$1,500 & Multiplier Up!');
      } else if (item.type === 'APY_RING') {
        state.apy += 0.008; // +0.8% APY
        audio.playRing();
        createBurstParticles(item.mesh.position, 0xFFD700);
        showTicker('APY Return Rate Increased! Compounding Accelerated!');
      } else if (item.type === 'SHIELD') {
        state.shields += 1;
        audio.playShield();
        createBurstParticles(item.mesh.position, 0x00F0FF);
        showTicker('Emergency Shield Acquired!');
      } else if (item.type === 'DEBT_HAZARD') {
        if (state.shields > 0) {
          state.shields--;
          audio.playShield();
          createBurstParticles(item.mesh.position, 0x00F0FF);
          showTicker('Shield Absorbed 24% APR Debt Collision!');
        } else {
          state.netWorth -= 3500;
          state.compoundMultiplier = Math.max(0.8, state.compoundMultiplier - 0.15);
          audio.playDebtHit();
          createBurstParticles(item.mesh.position, 0xFF3D71);
          showTicker('Toxic 24% APR Debt Hit! Net Worth Reduced!');
          
          if (state.netWorth <= 0) {
            triggerGameOver('Toxic 24% APR debt compounded faster than yields, causing financial derailment.');
          }
        }
      }
    }

    // Cleanup old items behind camera
    if (item.z < state.distance - 15) {
      itemsGroup.remove(item.mesh);
      activeItems.splice(i, 1);
    }
  }

  // Financial Time & Compounding Loop
  state.monthsElapsed += delta * CONFIG.monthsPerSec;
  state.yearsElapsed = Math.floor(state.monthsElapsed / 12) + 1;
  const currentMonthNum = Math.floor(state.monthsElapsed % 12) + 1;

  // Monthly Compound Interest Calculation
  const monthlyRate = state.apy / 12;
  state.netWorth += state.netWorth * monthlyRate * state.compoundMultiplier * delta * 0.8;

  // Update Particles
  updateParticles(delta);

  // Check Victory Condition ($1,000,000 F.I.R.E. Net Worth)
  if (state.netWorth >= CONFIG.targetNetWorth && !state.won) {
    triggerWin();
  }

  // Update UI HUD
  updateHUD(currentMonthNum);
}

// ==========================================================================
// UI & HUD CONTROLLER
// ==========================================================================
function updateHUD(monthNum) {
  document.getElementById('hud-date').textContent = `Year ${state.yearsElapsed} • Month ${monthNum}`;
  document.getElementById('metric-networth').textContent = `$${Math.floor(state.netWorth).toLocaleString()}`;
  document.getElementById('metric-growth-rate').textContent = `+${(state.apy * 100).toFixed(1)}% APY`;
  document.getElementById('metric-multiplier').textContent = `${state.compoundMultiplier.toFixed(2)}x`;
  
  const annualYield = Math.floor(state.netWorth * state.apy * state.compoundMultiplier);
  document.getElementById('metric-yield').textContent = `+$${annualYield.toLocaleString()}/yr`;

  const fireRatio = Math.min(100, Math.floor((state.netWorth / CONFIG.targetNetWorth) * 100));
  document.getElementById('fire-fill').style.width = `${fireRatio}%`;
  document.getElementById('metric-fire-text').textContent = `${fireRatio}% of $1M Goal`;

  document.getElementById('metric-shield-count').textContent = state.shields > 0 ? `READY (${state.shields})` : 'NO SHIELD';
}

function showTicker(text) {
  const ticker = document.getElementById('event-ticker');
  const tickerText = document.getElementById('ticker-text');
  tickerText.textContent = text;
  ticker.classList.remove('hidden');

  clearTimeout(ticker._timer);
  ticker._timer = setTimeout(() => {
    ticker.classList.add('hidden');
  }, 3000);
}

function triggerWin() {
  state.won = true;
  audio.playVictory();
  document.getElementById('win-networth').textContent = `$${Math.floor(state.netWorth).toLocaleString()}`;
  document.getElementById('win-years').textContent = `${state.yearsElapsed} Years ${Math.floor(state.monthsElapsed % 12)} Months`;
  document.getElementById('win-apy').textContent = `${(state.apy * 100).toFixed(1)}% APY`;
  document.getElementById('win-modal').classList.remove('hidden');
}

function triggerGameOver(reason) {
  state.gameOver = true;
  document.getElementById('gameover-reason').textContent = reason;
  document.getElementById('gameover-years').textContent = `${state.yearsElapsed} Years`;
  document.getElementById('gameover-networth').textContent = `$${Math.floor(state.netWorth).toLocaleString()}`;
  document.getElementById('gameover-modal').classList.remove('hidden');
}

// ==========================================================================
// CONTROLS & EVENT LISTENERS
// ==========================================================================
function bindEvents() {
  // Keyboard Listeners
  window.addEventListener('keydown', e => {
    if (!state.started || state.gameOver || state.won) return;

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      if (state.currentLaneIndex > 0) state.currentLaneIndex--;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      if (state.currentLaneIndex < 2) state.currentLaneIndex++;
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
      activateBoost();
    }
  });

  // Touch Button Controls
  document.getElementById('touch-left').addEventListener('click', () => {
    if (state.currentLaneIndex > 0) state.currentLaneIndex--;
  });

  document.getElementById('touch-right').addEventListener('click', () => {
    if (state.currentLaneIndex < 2) state.currentLaneIndex++;
  });

  document.getElementById('touch-boost').addEventListener('click', () => {
    activateBoost();
  });

  // Modal Buttons
  document.getElementById('btn-start-game').addEventListener('click', () => {
    audio.init();
    state.started = true;
    document.getElementById('title-modal').classList.add('hidden');
    showTicker('Coaster Launched! Steer through lanes and collect Dividend Gems!');
  });

  document.getElementById('btn-restart-win').addEventListener('click', restartGame);
  document.getElementById('btn-restart-loss').addEventListener('click', restartGame);

  document.getElementById('btn-pause').addEventListener('click', () => {
    state.paused = !state.paused;
    document.getElementById('btn-pause').textContent = state.paused ? '▶' : '❚❚';
  });

  document.getElementById('btn-audio').addEventListener('click', () => {
    state.audioEnabled = !state.audioEnabled;
    document.getElementById('btn-audio').textContent = state.audioEnabled ? '🔊' : '🔇';
  });
}

function activateBoost() {
  if (!state.isBoosting) {
    state.isBoosting = true;
    state.boostTimer = 2.5;
    audio.playBoost();
    document.getElementById('speedlines-overlay').classList.remove('hidden');
    showTicker('DRIP Turbo Reinvestment Boost Engaged!');
  }
}

function restartGame() {
  state.started = true;
  state.paused = false;
  state.gameOver = false;
  state.won = false;
  state.netWorth = CONFIG.initialPrincipal;
  state.principal = CONFIG.initialPrincipal;
  state.apy = CONFIG.baseApy;
  state.compoundMultiplier = 1.0;
  state.monthsElapsed = 0;
  state.yearsElapsed = 0;
  state.distance = 0;
  state.currentLaneIndex = 1;
  state.currentX = 0;
  state.shields = 1;
  nextSpawnZ = 30;

  // Clear existing items
  activeItems.forEach(item => itemsGroup.remove(item.mesh));
  activeItems = [];

  document.getElementById('win-modal').classList.add('hidden');
  document.getElementById('gameover-modal').classList.add('hidden');
  showTicker('New Coaster Run Launched!');
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==========================================================================
// MAIN ANIMATION LOOP
// ==========================================================================
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  updateGame(delta);
  renderer.render(scene, camera);
}

// Start Three.js Engine
initThree();
bindEvents();
animate();
