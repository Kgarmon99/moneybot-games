/* MoneyBot Theme Park 3D - Three.js Game Engine (RCT Edition) */
import * as THREE from './vendor/three.module.js';

// ==========================================================================
// GAME STATE & PARK CONFIGURATION
// ==========================================================================
const CONFIG = {
  gridSize: 3, // 3x3 Park Grid
  cellSize: 12, // Spacing between plots
  targetNetWorth: 1000000,
  initialCash: 15000,
  tickRateMs: 2000, // 1 Day = 2.0s
};

const RIDE_TYPES = {
  COASTER: {
    name: 'Compound Coaster',
    cost: 5000,
    dailyCashflow: 600,
    excitement: 98,
    principle: 'Reinvesting profits expands track capacity and compounds daily ticket revenue exponentially!',
    color: 0x00E676,
  },
  WHEEL: {
    name: 'Diversification Wheel',
    cost: 3500,
    dailyCashflow: 400,
    excitement: 92,
    principle: 'Diversifying gondolas across stocks, bonds, and real estate keeps guest attendance stable year-round.',
    color: 0xFFD700,
  },
  BUMPERS: {
    name: 'Bull & Bear Bumpers',
    cost: 2800,
    dailyCashflow: 320,
    excitement: 88,
    principle: 'Navigating market volatility cycles builds financial resilience through all market conditions.',
    color: 0x00F0FF,
  },
  SPLASH: {
    name: 'Emergency Splash',
    cost: 2200,
    dailyCashflow: 250,
    excitement: 85,
    principle: 'A strong liquid cash buffer protects the park against sudden breakdown emergencies.',
    color: 0x0099FF,
  },
  HAUNTED: {
    name: 'Toxic Debt Mansion',
    cost: 4000,
    dailyCashflow: 450,
    excitement: 90,
    principle: 'Conquering toxic debt eliminates high APR interest payments haunting your park treasury.',
    color: 0xFF3D71,
  },
  CONCESSION: {
    name: 'Cashflow Concessions',
    cost: 1500,
    dailyCashflow: 180,
    excitement: 80,
    principle: 'High-margin snack stands provide reliable, steady passive cashflow per visitor.',
    color: 0xFFAA00,
  },
};

const GUEST_THOUGHTS = [
  "The Compound Coaster yield loops are incredible! Best ticket price ever!",
  "I'm keeping my emergency fund intact for the Cashflow Concession snacks!",
  "The Diversification Ferris Wheel view gives me total peace of mind.",
  "Bumping through the Bull & Bear market cycles is thrilling!",
  "10/10 park! Reinvesting my time here was the best decision today!",
  "The Emergency Splash Mountain splash pool is so refreshing!",
  "Debt Mansion ghosts cured me of taking 24% APR loans forever!",
];

const state = {
  started: false,
  paused: false,
  speed: 1,
  gameOver: false,
  won: false,

  // Financial Metrics
  cash: CONFIG.initialCash,
  netWorth: CONFIG.initialCash,
  debt: 0,
  guests: 120,
  happiness: 98,
  stars: 1,
  
  day: 1,
  year: 1,
  
  // Grid & Rides
  plots: [], // 3x3 array
  selectedPlotIndex: null,
  selectedGuest: null,
  
  audioEnabled: true,

  // Camera Orbit & POV Mode
  cameraAngle: Math.PI / 4,
  cameraElevation: 0.8,
  cameraRadius: 42,
  isDragging: false,
  previousMousePosition: { x: 0, y: 0 },
  
  isPovMode: false,
  povRide: null,
};

// ==========================================================================
// WEB AUDIO SYNTHESIZER
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

  playCash() {
    if (!state.audioEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  playBuild() {
    if (!state.audioEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.18, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.25);
    });
  }

  playVictory() {
    if (!state.audioEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  }
}

const audio = new SoundSynth();

// ==========================================================================
// THREE.JS SCENE, CAMERA, & LIGHTS
// ==========================================================================
let scene, camera, renderer;
let parkGroup, guestsGroup;
let raycaster, mouse;
let clock = new THREE.Clock();
let animatedRides = [];
let walkingGuests = [];

function initThree() {
  const container = document.getElementById('canvas-container');

  // Scene & Atmosphere
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050810);
  scene.fog = new THREE.FogExp2(0x050810, 0.012);

  // Isometric Theme Park Camera
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 300);
  updateCameraPosition();

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambient);

  const sunLight = new THREE.DirectionalLight(0x00E676, 1.2);
  sunLight.position.set(20, 40, 15);
  sunLight.castShadow = true;
  scene.add(sunLight);

  const cyanLight = new THREE.PointLight(0x00F0FF, 1.5, 50);
  cyanLight.position.set(-15, 12, -15);
  scene.add(cyanLight);

  // Raycaster for Plot Selection & Guest Inspection
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Root Groups
  parkGroup = new THREE.Group();
  guestsGroup = new THREE.Group();
  scene.add(parkGroup);
  scene.add(guestsGroup);

  // Build Theme Park Grid
  buildParkGround();
  initGridPlots();
  spawnGuestBots();

  // Event Listeners for Orbit Controls & Interactivity
  window.addEventListener('resize', onWindowResize);
  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('wheel', onMouseWheel, { passive: true });
}

function updateCameraPosition() {
  if (state.isPovMode && state.povRide) return; // Managed in render loop for POV

  const x = Math.sin(state.cameraAngle) * Math.cos(state.cameraElevation) * state.cameraRadius;
  const y = Math.sin(state.cameraElevation) * state.cameraRadius;
  const z = Math.cos(state.cameraAngle) * Math.cos(state.cameraElevation) * state.cameraRadius;
  
  camera.position.set(x, y, z);
  camera.lookAt(0, 0, 0);
}

// ==========================================================================
// PROCEDURAL PARK GROUND & 3D RIDE MODELS
// ==========================================================================
function buildParkGround() {
  // Main Cobblestone Park Base
  const groundGeo = new THREE.BoxGeometry(42, 0.4, 42);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0a101d,
    roughness: 0.8,
    metalness: 0.2,
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.position.y = -0.2;
  groundMesh.receiveShadow = true;
  parkGroup.add(groundMesh);

  // Decorative Border Fence / Glowing Rails
  const fenceGeo = new THREE.BoxGeometry(43, 0.8, 0.3);
  const fenceMat = new THREE.MeshBasicMaterial({ color: 0x00E676 });
  
  const f1 = new THREE.Mesh(fenceGeo, fenceMat);
  const f2 = new THREE.Mesh(fenceGeo, fenceMat);
  f1.position.set(0, 0.2, 21.2);
  f2.position.set(0, 0.2, -21.2);
  parkGroup.add(f1);
  parkGroup.add(f2);

  // Central Fountain Plaza
  const fountainBaseGeo = new THREE.CylinderGeometry(2.5, 2.8, 0.6, 16);
  const fountainMat = new THREE.MeshStandardMaterial({ color: 0x00F0FF, metalness: 0.8 });
  const fountain = new THREE.Mesh(fountainBaseGeo, fountainMat);
  fountain.position.set(0, 0.3, 0);
  parkGroup.add(fountain);
}

function initGridPlots() {
  const startOffset = -12;
  let index = 0;

  for (let r = 0; r < CONFIG.gridSize; r++) {
    for (let c = 0; c < CONFIG.gridSize; c++) {
      const x = startOffset + c * CONFIG.cellSize;
      const z = startOffset + r * CONFIG.cellSize;

      // Skip center plot for the Fountain Plaza
      if (r === 1 && c === 1) {
        state.plots.push({ index, isCenter: true, ride: null });
        index++;
        continue;
      }

      // Plot Base Mesh
      const plotGeo = new THREE.BoxGeometry(9.5, 0.25, 9.5);
      const plotMat = new THREE.MeshStandardMaterial({
        color: 0x111b2b,
        roughness: 0.6,
        metalness: 0.4,
      });
      const plotMesh = new THREE.Mesh(plotGeo, plotMat);
      plotMesh.position.set(x, 0.05, z);
      plotMesh.userData = { plotIndex: index };
      plotMesh.receiveShadow = true;
      parkGroup.add(plotMesh);

      // Plot Border Wireframe
      const edgeGeo = new THREE.EdgesGeometry(plotGeo);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x00E676 });
      const wireframe = new THREE.LineSegments(edgeGeo, edgeMat);
      wireframe.position.set(x, 0.06, z);
      parkGroup.add(wireframe);

      state.plots.push({
        index,
        x,
        z,
        mesh: plotMesh,
        wireframe,
        ride: null,
      });

      index++;
    }
  }
}

// ==========================================================================
// PROCEDURAL 3D KINETIC RIDE CREATORS
// ==========================================================================
function buildRideMesh(type, level = 1) {
  const rideGroup = new THREE.Group();

  if (type === 'COASTER') {
    // Compound Coaster: Looping Track Spline & Car
    const trackCurve = new THREE.TorusGeometry(3.5, 0.15, 12, 32, Math.PI * 1.8);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x00E676, metalness: 0.9, emissive: 0x00E676, emissiveIntensity: 0.3 });
    const trackMesh = new THREE.Mesh(trackCurve, trackMat);
    trackMesh.rotation.x = Math.PI / 2;
    trackMesh.position.y = 3.5;
    rideGroup.add(trackMesh);

    // Coaster Car
    const carGeo = new THREE.BoxGeometry(0.8, 0.5, 1.2);
    const carMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });
    const carMesh = new THREE.Mesh(carGeo, carMat);
    carMesh.position.set(3.5, 3.5, 0);
    rideGroup.add(carMesh);

    // Track Support Towers
    const towerGeo = new THREE.CylinderGeometry(0.15, 0.2, 3.5, 8);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x334455 });
    [-2, 2].forEach(tx => {
      const t = new THREE.Mesh(towerGeo, towerMat);
      t.position.set(tx, 1.75, 0);
      rideGroup.add(t);
    });

    animatedRides.push({ group: rideGroup, carMesh, type: 'COASTER', angle: 0 });

  } else if (type === 'WHEEL') {
    // Diversification Ferris Wheel
    const wheelGeo = new THREE.TorusGeometry(3.2, 0.15, 12, 32);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.9, emissive: 0xFFD700, emissiveIntensity: 0.3 });
    const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
    wheelMesh.position.y = 4.2;
    rideGroup.add(wheelMesh);

    // Gondolas
    const gondolaColors = [0x00E676, 0x00F0FF, 0xFFD700, 0xFF3D71];
    const gondolas = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const gGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
      const gMat = new THREE.MeshStandardMaterial({ color: gondolaColors[i % 4] });
      const gMesh = new THREE.Mesh(gGeo, gMat);
      gMesh.position.set(Math.cos(angle) * 3.2, 4.2 + Math.sin(angle) * 3.2, 0);
      rideGroup.add(gMesh);
      gondolas.push({ mesh: gMesh, angleOffset: angle });
    }

    // Support A-Frame
    const standGeo = new THREE.CylinderGeometry(0.15, 0.25, 4.2, 8);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x445566 });
    const s1 = new THREE.Mesh(standGeo, standMat);
    const s2 = new THREE.Mesh(standGeo, standMat);
    s1.rotation.z = 0.3;
    s2.rotation.z = -0.3;
    s1.position.set(-1.2, 2.1, 0);
    s2.position.set(1.2, 2.1, 0);
    rideGroup.add(s1);
    rideGroup.add(s2);

    animatedRides.push({ group: rideGroup, wheelMesh, gondolas, type: 'WHEEL', angle: 0 });

  } else if (type === 'BUMPERS') {
    // Bull & Bear Bumper Arena
    const floorGeo = new THREE.BoxGeometry(6.5, 0.3, 6.5);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x00F0FF, metalness: 0.8, emissive: 0x00F0FF, emissiveIntensity: 0.2 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = 0.15;
    rideGroup.add(floor);

    // Bumper Cars
    const cars = [];
    [0x00E676, 0xFF3D71, 0xFFD700].forEach((col, idx) => {
      const carGeo = new THREE.SphereGeometry(0.6, 12, 8);
      const carMat = new THREE.MeshStandardMaterial({ color: col });
      const c = new THREE.Mesh(carGeo, carMat);
      c.scale.y = 0.6;
      c.position.set((idx - 1) * 1.8, 0.5, (idx % 2 === 0 ? 1 : -1) * 1.5);
      rideGroup.add(c);
      cars.push({ mesh: c, vx: (Math.random() - 0.5) * 2, vz: (Math.random() - 0.5) * 2 });
    });

    animatedRides.push({ group: rideGroup, cars, type: 'BUMPERS' });

  } else if (type === 'SPLASH') {
    // Emergency Splash Mountain
    const mountainGeo = new THREE.ConeGeometry(3.5, 4.5, 8);
    const mountainMat = new THREE.MeshStandardMaterial({ color: 0x0066cc, roughness: 0.4 });
    const mountain = new THREE.Mesh(mountainGeo, mountainMat);
    mountain.position.y = 2.25;
    rideGroup.add(mountain);

    // Water Splash Pool
    const poolGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.2, 16);
    const poolMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.8 });
    const pool = new THREE.Mesh(poolGeo, poolMat);
    pool.position.set(0, 0.2, 2.5);
    rideGroup.add(pool);

    animatedRides.push({ group: rideGroup, type: 'SPLASH', time: 0 });

  } else if (type === 'HAUNTED') {
    // Toxic Debt Mansion
    const castleGeo = new THREE.BoxGeometry(4.5, 3.5, 4.5);
    const castleMat = new THREE.MeshStandardMaterial({ color: 0x221133, roughness: 0.9 });
    const castle = new THREE.Mesh(castleGeo, castleMat);
    castle.position.y = 1.75;
    rideGroup.add(castle);

    // Glowing Red Debt Skull Banner
    const roofGeo = new THREE.ConeGeometry(2.5, 2.0, 4);
    const roofMat = new THREE.MeshBasicMaterial({ color: 0xFF3D71 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 4.5;
    rideGroup.add(roof);

  } else if (type === 'CONCESSION') {
    // Cashflow Concessions Kiosk
    const kioskGeo = new THREE.CylinderGeometry(1.8, 2.0, 2.2, 8);
    const kioskMat = new THREE.MeshStandardMaterial({ color: 0xFFAA00, roughness: 0.3 });
    const kiosk = new THREE.Mesh(kioskGeo, kioskMat);
    kiosk.position.y = 1.1;
    rideGroup.add(kiosk);

    // Spinning Coin Roof Sign
    const signGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.15, 16);
    const signMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.rotation.x = Math.PI / 2;
    sign.position.y = 2.8;
    rideGroup.add(sign);

    animatedRides.push({ group: rideGroup, signMesh: sign, type: 'CONCESSION' });
  }

  return rideGroup;
}

function spawnGuestBots() {
  for (let i = 0; i < 20; i++) {
    const geo = new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00E676 : 0x00F0FF });
    const guest = new THREE.Mesh(geo, mat);
    
    guest.position.set((Math.random() - 0.5) * 30, 0.4, (Math.random() - 0.5) * 30);
    guest.userData = {
      guestId: i + 1,
      cash: 150 + Math.floor(Math.random() * 300),
      happiness: 85 + Math.floor(Math.random() * 15),
      favRide: ['Compound Coaster', 'Diversification Wheel', 'Bull & Bear Bumpers'][i % 3],
      thought: GUEST_THOUGHTS[i % GUEST_THOUGHTS.length],
      targetX: (Math.random() - 0.5) * 30,
      targetZ: (Math.random() - 0.5) * 30,
      speed: 1.5 + Math.random() * 1.5,
    };
    
    guestsGroup.add(guest);
    walkingGuests.push(guest);
  }
}

// ==========================================================================
// ANIMATION & SIMULATION TICK
// ==========================================================================
let tickTimer = 0;

function updateSimulation(delta) {
  if (!state.started || state.paused || state.gameOver || state.won) return;

  // Animate 3D Rides
  animatedRides.forEach(r => {
    if (r.type === 'COASTER') {
      r.angle += delta * 2.0;
      r.carMesh.position.x = Math.cos(r.angle) * 3.5;
      r.carMesh.position.z = Math.sin(r.angle) * 3.5;
      r.carMesh.rotation.y = -r.angle;

      // Handle First-Person Ride Cam POV
      if (state.isPovMode && state.povRide === r) {
        const carWorldPos = new THREE.Vector3();
        r.carMesh.getWorldPosition(carWorldPos);
        camera.position.set(carWorldPos.x, carWorldPos.y + 0.8, carWorldPos.z);
        const lookTarget = new THREE.Vector3(
          carWorldPos.x + Math.cos(r.angle + 0.5) * 3,
          carWorldPos.y + 0.8,
          carWorldPos.z + Math.sin(r.angle + 0.5) * 3
        );
        camera.lookAt(lookTarget);
      }

    } else if (r.type === 'WHEEL') {
      r.angle += delta * 0.8;
      r.wheelMesh.rotation.z = r.angle;
      r.gondolas.forEach(g => {
        const currentAngle = r.angle + g.angleOffset;
        g.mesh.position.x = Math.cos(currentAngle) * 3.2;
        g.mesh.position.y = 4.2 + Math.sin(currentAngle) * 3.2;
      });
    } else if (r.type === 'CONCESSION') {
      r.signMesh.rotation.z += delta * 2.0;
    }
  });

  // Animate Walking Guest Bots
  walkingGuests.forEach(g => {
    const dx = g.userData.targetX - g.position.x;
    const dz = g.userData.targetZ - g.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.5) {
      g.userData.targetX = (Math.random() - 0.5) * 30;
      g.userData.targetZ = (Math.random() - 0.5) * 30;
    } else {
      g.position.x += (dx / dist) * g.userData.speed * delta;
      g.position.z += (dz / dist) * g.userData.speed * delta;
    }
  });

  // Financial Daily Tick Timer
  tickTimer += delta * state.speed;
  if (tickTimer >= (CONFIG.tickRateMs / 1000)) {
    tickTimer = 0;
    processDailyFinancialTick();
  }
}

function processDailyFinancialTick() {
  state.day++;
  if (state.day > 30) {
    state.day = 1;
    state.year++;
  }

  // Calculate Daily Cashflow from Rides & Concessions
  let dailyTicketRevenue = 0;
  let totalAssetValue = state.cash;

  state.plots.forEach(plot => {
    if (plot.ride) {
      const rideInfo = RIDE_TYPES[plot.ride.type];
      const yieldAmount = rideInfo.dailyCashflow * (plot.ride.ticketPrice || 15) / 15 * plot.ride.level;
      dailyTicketRevenue += yieldAmount;
      totalAssetValue += rideInfo.cost * plot.ride.level;
    }
  });

  // Apply Revenue
  state.cash += Math.floor(dailyTicketRevenue);
  
  // Apply Loan Debt Interest (if active)
  if (state.debt > 0) {
    const dailyInterest = Math.floor(state.debt * (0.24 / 365));
    state.cash -= dailyInterest;
    if (state.cash < -25000) {
      triggerGameOver('Emergency loan debt interest overwhelmed ticket sales, forcing park foreclosure.');
      return;
    }
  }

  state.netWorth = Math.floor(totalAssetValue - state.debt);

  // Calculate Park Stars
  if (state.netWorth >= 1000000) state.stars = 5;
  else if (state.netWorth >= 350000) state.stars = 4;
  else if (state.netWorth >= 100000) state.stars = 3;
  else if (state.netWorth >= 35000) state.stars = 2;
  else state.stars = 1;

  // Check Win Condition
  if (state.stars === 5 && !state.won) {
    triggerWin();
  }

  updateHUD(dailyTicketRevenue);
}

// ==========================================================================
// UI & HUD CONTROLLER
// ==========================================================================
function updateHUD(dailyRevenue) {
  document.getElementById('hud-date').textContent = `Year ${state.year} • Day ${state.day}`;
  document.getElementById('metric-cash').textContent = `$${state.cash.toLocaleString()}`;
  document.getElementById('metric-cashflow').textContent = `+$${Math.floor(dailyRevenue).toLocaleString()}/day`;
  document.getElementById('metric-networth').textContent = `$${state.netWorth.toLocaleString()}`;
  
  const starsText = '⭐'.repeat(state.stars) + '☆'.repeat(5 - state.stars);
  document.getElementById('metric-stars').textContent = `Rating: ${starsText}`;
  
  document.getElementById('metric-guests').textContent = `${120 + state.stars * 180} Guests`;
}

function showTicker(text) {
  const ticker = document.getElementById('event-ticker');
  const tickerText = document.getElementById('ticker-text');
  tickerText.textContent = text;
  ticker.classList.remove('hidden');

  clearTimeout(ticker._timer);
  ticker._timer = setTimeout(() => {
    ticker.classList.add('hidden');
  }, 3500);
}

function triggerWin() {
  state.won = true;
  audio.playVictory();
  document.getElementById('win-networth').textContent = `$${state.netWorth.toLocaleString()}`;
  document.getElementById('win-guests').textContent = `${120 + state.stars * 180} Guests`;
  document.getElementById('win-modal').classList.remove('hidden');
}

function triggerGameOver(reason) {
  state.gameOver = true;
  document.getElementById('gameover-reason').textContent = reason;
  document.getElementById('gameover-days').textContent = `${(state.year - 1) * 30 + state.day} Days`;
  document.getElementById('gameover-modal').classList.remove('hidden');
}

// ==========================================================================
// INTERACTION & RAYCASTING
// ==========================================================================
function onPointerDown(event) {
  state.isDragging = true;
  state.previousMousePosition = { x: event.clientX, y: event.clientY };

  if (!state.started || state.paused || state.gameOver || state.won) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Check Guest Bot Selection First
  const guestIntersects = raycaster.intersectObjects(guestsGroup.children, true);
  if (guestIntersects.length > 0) {
    const guestObj = guestIntersects[0].object;
    inspectGuest(guestObj);
    return;
  }

  // Check Park Plot / Ride Selection
  const intersects = raycaster.intersectObjects(parkGroup.children, true);
  if (intersects.length > 0) {
    let targetObj = intersects[0].object;
    while (targetObj.parent && targetObj.userData.plotIndex === undefined) {
      targetObj = targetObj.parent;
    }

    if (targetObj.userData.plotIndex !== undefined) {
      const index = targetObj.userData.plotIndex;
      selectPlot(index);
    }
  }
}

function onPointerMove(event) {
  if (!state.isDragging || state.isPovMode) return;

  const deltaX = event.clientX - state.previousMousePosition.x;
  const deltaY = event.clientY - state.previousMousePosition.y;

  state.cameraAngle -= deltaX * 0.005;
  state.cameraElevation = Math.max(0.2, Math.min(Math.PI / 2 - 0.1, state.cameraElevation + deltaY * 0.005));

  updateCameraPosition();
  state.previousMousePosition = { x: event.clientX, y: event.clientY };
}

function onPointerUp() {
  state.isDragging = false;
}

function onMouseWheel(event) {
  if (state.isPovMode) return;
  state.cameraRadius = Math.max(20, Math.min(80, state.cameraRadius + event.deltaY * 0.05));
  updateCameraPosition();
}

function inspectGuest(guestObj) {
  state.selectedGuest = guestObj;
  const data = guestObj.userData;
  document.getElementById('guest-name').textContent = `Park Visitor #${data.guestId}`;
  document.getElementById('guest-thought').textContent = `"${data.thought}"`;
  document.getElementById('guest-cash').textContent = `$${data.cash}`;
  document.getElementById('guest-happiness').textContent = `${data.happiness}% Satisfied`;
  document.getElementById('guest-fav').textContent = data.favRide;
  document.getElementById('guest-modal').classList.remove('hidden');
}

function selectPlot(index) {
  state.selectedPlotIndex = index;
  const plot = state.plots[index];

  if (plot.isCenter) return;

  if (plot.ride) {
    // Open Inspector for existing ride
    const rideInfo = RIDE_TYPES[plot.ride.type];
    document.getElementById('inspector-title').textContent = rideInfo.name;
    document.getElementById('inspector-badge').textContent = `Level ${plot.ride.level} Attraction`;
    document.getElementById('inspector-cashflow').textContent = `+$${rideInfo.dailyCashflow * plot.ride.level}/day`;
    document.getElementById('inspector-price').textContent = `$${plot.ride.ticketPrice || 15}`;
    document.getElementById('inspector-excitement').textContent = `${rideInfo.excitement}% Thrill`;
    document.getElementById('inspector-value').textContent = `$${rideInfo.cost * plot.ride.level}`;
    document.getElementById('inspector-principle').textContent = rideInfo.principle;
    document.getElementById('inspector-upgrade-cost').textContent = `Cost: $${rideInfo.cost * 1.5}`;
    
    document.getElementById('inspector-modal').classList.remove('hidden');
  } else {
    showTicker(`Selected Plot #${index + 1}. Choose an attraction blueprint from the bottom drawer to construct!`);
  }
}

function buildRideOnSelectedPlot(type) {
  if (state.selectedPlotIndex === null) {
    showTicker('Select an empty park plot first!');
    return;
  }

  const plot = state.plots[state.selectedPlotIndex];
  if (plot.ride) {
    showTicker('This plot already has an attraction!');
    return;
  }

  const rideInfo = RIDE_TYPES[type];
  if (state.cash < rideInfo.cost) {
    showTicker(`Insufficient Treasury Cash! Need $${rideInfo.cost.toLocaleString()}.`);
    return;
  }

  // Deduct cost and spawn 3D Ride
  state.cash -= rideInfo.cost;
  const rideMesh = buildRideMesh(type, 1);
  rideMesh.position.set(plot.x, 0.2, plot.z);
  parkGroup.add(rideMesh);

  plot.ride = { type, level: 1, ticketPrice: 15, mesh: rideMesh };
  audio.playBuild();
  showTicker(`${rideInfo.name} constructed! Ticket revenue +$${rideInfo.dailyCashflow}/day!`);
}

// ==========================================================================
// EVENT BINDINGS
// ==========================================================================
function bindEvents() {
  // Build Drawer Buttons
  document.querySelectorAll('.build-card[data-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      if (type !== 'PAY_DEBT') {
        buildRideOnSelectedPlot(type);
      }
    });
  });

  // Modal Controls
  document.getElementById('btn-start-game').addEventListener('click', () => {
    audio.init();
    state.started = true;
    document.getElementById('title-modal').classList.add('hidden');
    showTicker('MoneyBot Theme Park Opened! Select a plot to construct your first ride!');
  });

  document.getElementById('btn-close-inspector').addEventListener('click', () => {
    document.getElementById('inspector-modal').classList.add('hidden');
  });

  document.getElementById('btn-close-guest').addEventListener('click', () => {
    document.getElementById('guest-modal').classList.add('hidden');
  });

  document.getElementById('btn-gift-coupon').addEventListener('click', () => {
    if (state.selectedGuest && state.cash >= 10) {
      state.cash -= 10;
      state.selectedGuest.userData.happiness = Math.min(100, state.selectedGuest.userData.happiness + 12);
      audio.playCash();
      showTicker('Gifted $10 Snack Coupon! Guest Happiness Increased!');
      document.getElementById('guest-modal').classList.add('hidden');
    }
  });

  // First-Person Ride Cam POV Mode
  document.getElementById('btn-ride-pov').addEventListener('click', () => {
    if (state.selectedPlotIndex !== null) {
      const plot = state.plots[state.selectedPlotIndex];
      if (plot.ride && plot.ride.type === 'COASTER') {
        const animRide = animatedRides.find(r => r.type === 'COASTER');
        if (animRide) {
          state.isPovMode = true;
          state.povRide = animRide;
          document.getElementById('inspector-modal').classList.add('hidden');
          document.getElementById('ride-cam-badge').classList.remove('hidden');
          showTicker('🎥 ON-RIDE POV ACTIVATED: Riding the Compound Coaster!');
        }
      } else {
        showTicker('First-Person POV is currently available on the Compound Coaster!');
      }
    }
  });

  document.getElementById('btn-exit-ride-cam').addEventListener('click', () => {
    state.isPovMode = false;
    state.povRide = null;
    document.getElementById('ride-cam-badge').classList.add('hidden');
    updateCameraPosition();
    showTicker('Exited First-Person POV.');
  });

  // Ticket Price Adjusters
  document.getElementById('btn-price-minus').addEventListener('click', () => {
    if (state.selectedPlotIndex !== null) {
      const plot = state.plots[state.selectedPlotIndex];
      if (plot.ride) {
        plot.ride.ticketPrice = Math.max(5, (plot.ride.ticketPrice || 15) - 5);
        document.getElementById('inspector-price').textContent = `$${plot.ride.ticketPrice}`;
      }
    }
  });

  document.getElementById('btn-price-plus').addEventListener('click', () => {
    if (state.selectedPlotIndex !== null) {
      const plot = state.plots[state.selectedPlotIndex];
      if (plot.ride) {
        plot.ride.ticketPrice = Math.min(50, (plot.ride.ticketPrice || 15) + 5);
        document.getElementById('inspector-price').textContent = `$${plot.ride.ticketPrice}`;
      }
    }
  });

  // Financial Ledger P&L
  document.getElementById('btn-ledger').addEventListener('click', () => {
    let rev = 0;
    state.plots.forEach(p => {
      if (p.ride) rev += RIDE_TYPES[p.ride.type].dailyCashflow * (p.ride.ticketPrice || 15) / 15 * p.ride.level;
    });

    document.getElementById('ledger-revenue').textContent = `+$${Math.floor(rev).toLocaleString()}/day`;
    document.getElementById('ledger-concessions').textContent = `+$${Math.floor(rev * 0.25).toLocaleString()}/day`;
    document.getElementById('ledger-maintenance').textContent = `-$${Math.floor(rev * 0.15).toLocaleString()}/day`;
    document.getElementById('ledger-net').textContent = `+$${Math.floor(rev * 1.1).toLocaleString()}/day`;
    document.getElementById('ledger-modal').classList.remove('hidden');
  });

  document.getElementById('btn-close-ledger').addEventListener('click', () => {
    document.getElementById('ledger-modal').classList.add('hidden');
  });

  document.getElementById('btn-close-ledger-body').addEventListener('click', () => {
    document.getElementById('ledger-modal').classList.add('hidden');
  });

  document.getElementById('btn-upgrade-ride').addEventListener('click', () => {
    if (state.selectedPlotIndex !== null) {
      const plot = state.plots[state.selectedPlotIndex];
      if (plot.ride) {
        const rideInfo = RIDE_TYPES[plot.ride.type];
        const cost = rideInfo.cost * 1.5;
        if (state.cash >= cost) {
          state.cash -= cost;
          plot.ride.level++;
          audio.playBuild();
          showTicker(`Upgraded ${rideInfo.name} to Level ${plot.ride.level}! Ticket income boosted!`);
          document.getElementById('inspector-modal').classList.add('hidden');
        } else {
          showTicker(`Insufficient cash for upgrade! Need $${cost}.`);
        }
      }
    }
  });

  document.getElementById('btn-demolish-ride').addEventListener('click', () => {
    if (state.selectedPlotIndex !== null) {
      const plot = state.plots[state.selectedPlotIndex];
      if (plot.ride) {
        const rideInfo = RIDE_TYPES[plot.ride.type];
        const refund = Math.floor(rideInfo.cost * 0.7);
        state.cash += refund;
        parkGroup.remove(plot.ride.mesh);
        plot.ride = null;
        audio.playCash();
        showTicker(`Sold attraction for 70% refund (+$${refund}).`);
        document.getElementById('inspector-modal').classList.add('hidden');
      }
    }
  });

  document.getElementById('btn-restart-win').addEventListener('click', restartGame);
  document.getElementById('btn-restart-loss').addEventListener('click', restartGame);

  document.getElementById('btn-speed').addEventListener('click', () => {
    state.speed = state.speed === 1 ? 2 : 1;
    document.getElementById('btn-speed').textContent = `${state.speed}x`;
  });

  document.getElementById('btn-pause').addEventListener('click', () => {
    state.paused = !state.paused;
    document.getElementById('btn-pause').textContent = state.paused ? 'PLAY' : 'PAUSE';
  });

  document.getElementById('btn-audio').addEventListener('click', () => {
    state.audioEnabled = !state.audioEnabled;
    document.getElementById('btn-audio').textContent = state.audioEnabled ? 'SOUND' : 'MUTED';
  });

  document.getElementById('btn-reset-cam').addEventListener('click', () => {
    state.isPovMode = false;
    state.povRide = null;
    document.getElementById('ride-cam-badge').classList.add('hidden');
    state.cameraAngle = Math.PI / 4;
    state.cameraElevation = 0.8;
    state.cameraRadius = 42;
    updateCameraPosition();
  });
}

function restartGame() {
  state.started = true;
  state.paused = false;
  state.gameOver = false;
  state.won = false;
  state.cash = CONFIG.initialCash;
  state.netWorth = CONFIG.initialCash;
  state.debt = 0;
  state.day = 1;
  state.year = 1;
  state.stars = 1;
  state.isPovMode = false;
  state.povRide = null;

  // Clear existing rides
  state.plots.forEach(plot => {
    if (plot.ride) {
      parkGroup.remove(plot.ride.mesh);
      plot.ride = null;
    }
  });

  document.getElementById('win-modal').classList.add('hidden');
  document.getElementById('gameover-modal').classList.add('hidden');
  document.getElementById('ride-cam-badge').classList.add('hidden');
  showTicker('New Theme Park Run Initialized!');
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==========================================================================
// MAIN RENDER LOOP
// ==========================================================================
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  updateSimulation(delta);
  renderer.render(scene, camera);
}

// Start Three.js Engine
initThree();
bindEvents();
animate();
