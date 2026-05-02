import * as THREE from 'three';
import { CONFIG } from './config.js';

const ERA_DATA = {
  barter:        { color: 0x00ff44, hex: '#00ff44', num: '01' },
  commodity:     { color: 0x00ccff, hex: '#00ccff', num: '02' },
  coins:         { color: 0xffcc00, hex: '#ffcc00', num: '03' },
  paper:         { color: 0x00ffcc, hex: '#00ffcc', num: '04' },
  gold_standard: { color: 0xffd700, hex: '#ffd700', num: '05' },
  digital:       { color: 0xcc66ff, hex: '#cc66ff', num: '06' },
};

export class World {
  constructor(scene) {
    this.scene = scene;
    this.loader = new THREE.TextureLoader();
    this.terminals = [];
    this.terminalPoints = [];
  }

  async init() {
    const floorTex = await this.loader.loadAsync('assets/floor_texture-png.webp');
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(20, 20);
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(100, 10, CONFIG.COLORS.NEON_GREEN, 0x333333);
    grid.position.y = 0.01;
    this.scene.add(grid);

    const skyTex = await this.loader.loadAsync('assets/space_skybox-png.webp');
    this.scene.background = skyTex;

    this.scene.fog = new THREE.FogExp2(0x000000, 0.015);

    this.createTerminals();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  createTerminals() {
    CONFIG.STORY.filter(s => s.pos).forEach(story => {
      const era = ERA_DATA[story.id] || { color: 0x00ff00, hex: '#00ff00', num: '??' };
      const label = story.label || story.name;

      const terminal = new THREE.Group();
      terminal.position.set(story.pos.x, 0, story.pos.z);

      const animated = {};

      // ── Pedestal base ──────────────────────────────────────────
      const baseGeom = new THREE.CylinderGeometry(1.6, 2.0, 0.4, 32);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x111111, metalness: 0.95, roughness: 0.15
      });
      const base = new THREE.Mesh(baseGeom, baseMat);
      base.position.y = 0.2;
      terminal.add(base);

      // Base accent ring (era-colored rim)
      const baseRimGeom = new THREE.TorusGeometry(1.85, 0.04, 8, 64);
      const baseRimMat = new THREE.MeshBasicMaterial({ color: era.color });
      const baseRim = new THREE.Mesh(baseRimGeom, baseRimMat);
      baseRim.rotation.x = Math.PI / 2;
      baseRim.position.y = 0.38;
      terminal.add(baseRim);

      // ── Pillar ─────────────────────────────────────────────────
      const pillarGeom = new THREE.CylinderGeometry(0.18, 0.22, 2.2, 12);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0x1c1c1c, metalness: 0.85, roughness: 0.25
      });
      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.y = 1.5;
      terminal.add(pillar);

      // ── Ground ring (large, slow rotate) ──────────────────────
      const groundRingGeom = new THREE.TorusGeometry(1.6, 0.07, 16, 100);
      const groundRingMat = new THREE.MeshBasicMaterial({ color: era.color });
      const groundRing = new THREE.Mesh(groundRingGeom, groundRingMat);
      groundRing.rotation.x = Math.PI / 2;
      groundRing.position.y = 0.42;
      terminal.add(groundRing);
      animated.groundRing = groundRing;

      // ── Outer ground ring (counter-rotating, dimmer) ───────────
      const outerRingGeom = new THREE.TorusGeometry(2.05, 0.04, 16, 100);
      const outerRingMat = new THREE.MeshBasicMaterial({
        color: era.color, transparent: true, opacity: 0.4
      });
      const outerRing = new THREE.Mesh(outerRingGeom, outerRingMat);
      outerRing.rotation.x = Math.PI / 2;
      outerRing.position.y = 0.42;
      terminal.add(outerRing);
      animated.outerRing = outerRing;

      // ── Light beam ─────────────────────────────────────────────
      const beamGeom = new THREE.CylinderGeometry(0.06, 0.5, 4.5, 8, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: era.color, transparent: true, opacity: 0.07, side: THREE.BackSide
      });
      const beam = new THREE.Mesh(beamGeom, beamMat);
      beam.position.y = 2.85;
      terminal.add(beam);
      animated.beam = beam;

      // ── Floating orb (core) ────────────────────────────────────
      const coreGeom = new THREE.SphereGeometry(0.32, 32, 32);
      const coreMat = new THREE.MeshBasicMaterial({ color: era.color });
      const core = new THREE.Mesh(coreGeom, coreMat);
      core.position.y = 2.6;
      terminal.add(core);
      animated.core = core;

      // Inner bright core
      const innerGeom = new THREE.SphereGeometry(0.13, 24, 24);
      const innerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const inner = new THREE.Mesh(innerGeom, innerMat);
      inner.position.y = 2.6;
      terminal.add(inner);
      animated.inner = inner;

      // ── Orbit ring around core ─────────────────────────────────
      const orbitGeom = new THREE.TorusGeometry(0.55, 0.025, 8, 64);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: era.color, transparent: true, opacity: 0.75
      });
      const orbit = new THREE.Mesh(orbitGeom, orbitMat);
      orbit.position.y = 2.6;
      terminal.add(orbit);
      animated.orbit = orbit;

      // Second orbit ring (tilted differently)
      const orbit2Geom = new THREE.TorusGeometry(0.55, 0.025, 8, 64);
      const orbit2Mat = new THREE.MeshBasicMaterial({
        color: era.color, transparent: true, opacity: 0.45
      });
      const orbit2 = new THREE.Mesh(orbit2Geom, orbit2Mat);
      orbit2.position.y = 2.6;
      orbit2.rotation.z = Math.PI / 2;
      terminal.add(orbit2);
      animated.orbit2 = orbit2;

      // ── Holographic screen ─────────────────────────────────────
      const screenGeom = new THREE.PlaneGeometry(1.6, 1.1);
      const screenMat = new THREE.MeshBasicMaterial({
        color: era.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide
      });
      const screen = new THREE.Mesh(screenGeom, screenMat);
      screen.position.set(0, 2.6, 0.55);
      terminal.add(screen);
      animated.screen = screen;

      // ── Label sprite ───────────────────────────────────────────
      const labelSprite = this.createLabel(label, era.num, era.hex);
      labelSprite.position.y = 4.5;
      terminal.add(labelSprite);

      // ── Point light (era-colored) ──────────────────────────────
      const coreLight = new THREE.PointLight(era.color, 2.5, 10);
      coreLight.position.y = 2.6;
      terminal.add(coreLight);
      animated.light = coreLight;

      this.scene.add(terminal);
      this.terminals.push({ mesh: terminal, storyId: story.id, animated });
    });
  }

  drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  createLabel(text, eraNum, hexColor) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 256;

    const W = canvas.width;
    const H = canvas.height;
    const r = 20;
    const pad = 30;

    const hexR = parseInt(hexColor.slice(1, 3), 16);
    const hexG = parseInt(hexColor.slice(3, 5), 16);
    const hexB = parseInt(hexColor.slice(5, 7), 16);

    // ── Background ───────────────────────────────────────────────
    this.drawRoundRect(ctx, 0, 0, W, H, r);
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, `rgba(${hexR * 0.10 | 0}, ${hexG * 0.10 | 0}, ${hexB * 0.10 | 0}, 0.97)`);
    bg.addColorStop(0.5, `rgba(8, 8, 12, 0.95)`);
    bg.addColorStop(1, `rgba(0, 0, 0, 0.97)`);
    ctx.fillStyle = bg;
    ctx.fill();

    // ── Glowing border ───────────────────────────────────────────
    this.drawRoundRect(ctx, 1, 1, W - 2, H - 2, r);
    ctx.strokeStyle = hexColor;
    ctx.lineWidth = 4;
    ctx.shadowColor = hexColor;
    ctx.shadowBlur = 22;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner border highlight
    this.drawRoundRect(ctx, 6, 6, W - 12, H - 12, r - 4);
    ctx.strokeStyle = `rgba(${hexR}, ${hexG}, ${hexB}, 0.18)`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // ── Scanlines ────────────────────────────────────────────────
    for (let y = 0; y < H; y += 5) {
      ctx.fillStyle = 'rgba(0,0,0,0.07)';
      ctx.fillRect(0, y, W, 2);
    }

    // ── Top accent bar ────────────────────────────────────────────
    const topGrad = ctx.createLinearGradient(pad, 0, W - pad, 0);
    topGrad.addColorStop(0, 'transparent');
    topGrad.addColorStop(0.15, hexColor);
    topGrad.addColorStop(0.85, hexColor);
    topGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = topGrad;
    ctx.fillRect(pad, 10, W - pad * 2, 3);

    // Bottom accent bar
    ctx.fillStyle = topGrad;
    ctx.fillRect(pad, H - 13, W - pad * 2, 3);

    // ── Corner accent marks ───────────────────────────────────────
    const al = 24, ao = 12;
    ctx.strokeStyle = hexColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = hexColor;
    ctx.shadowBlur = 12;
    [[ao, ao, 1, 1], [W - ao, ao, -1, 1], [ao, H - ao, 1, -1], [W - ao, H - ao, -1, -1]].forEach(([x, y, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + sx * al, y);
      ctx.moveTo(x, y); ctx.lineTo(x, y + sy * al);
      ctx.stroke();
    });
    ctx.shadowBlur = 0;

    // ── ERA NUMBER label ──────────────────────────────────────────
    const eraY = 80;
    ctx.font = 'bold 34px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '4px';

    ctx.shadowColor = hexColor;
    ctx.shadowBlur = 16;
    ctx.fillStyle = `rgba(${hexR}, ${hexG}, ${hexB}, 0.55)`;
    ctx.fillText(`— ERA ${eraNum} —`, W / 2, eraY);
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(${hexR}, ${hexG}, ${hexB}, 0.85)`;
    ctx.fillText(`— ERA ${eraNum} —`, W / 2, eraY);

    // ── Divider ───────────────────────────────────────────────────
    const divY = eraY + 40;
    const divGrad = ctx.createLinearGradient(pad * 2, 0, W - pad * 2, 0);
    divGrad.addColorStop(0, 'transparent');
    divGrad.addColorStop(0.2, hexColor);
    divGrad.addColorStop(0.8, hexColor);
    divGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = hexColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(pad * 2, divY);
    ctx.lineTo(W - pad * 2, divY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // ── Main label text ───────────────────────────────────────────
    const labelY = divY + (H - divY) / 2 + 2;
    let fontSize = 60;
    ctx.font = `bold ${fontSize}px Orbitron, sans-serif`;
    while (ctx.measureText(text).width > W - pad * 2 && fontSize > 20) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px Orbitron, sans-serif`;
    }
    // Glow pass
    ctx.fillStyle = `rgba(${hexR}, ${hexG}, ${hexB}, 0.2)`;
    ctx.shadowColor = hexColor;
    ctx.shadowBlur = 32;
    ctx.fillText(text, W / 2, labelY);
    // White solid text
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, W / 2, labelY);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(6.4, 6.4 * (256 / 1024), 1);
    return sprite;
  }

  update(time) {
    this.terminals.forEach((t, idx) => {
      const a = t.animated;
      const offset = t.mesh.position.x * 0.3;

      // Floating bob
      const bob = Math.sin(time * 1.8 + offset) * 0.28;

      if (a.core) {
        a.core.position.y = 2.6 + bob;
        a.core.scale.setScalar(1 + Math.sin(time * 3.5 + offset) * 0.1);
      }
      if (a.inner) {
        a.inner.position.y = 2.6 + bob;
        a.inner.scale.setScalar(0.8 + Math.sin(time * 5 + offset) * 0.2);
      }

      // Orbit rings spin independently
      if (a.orbit) {
        a.orbit.position.y = 2.6 + bob;
        a.orbit.rotation.x = time * 1.5;
        a.orbit.rotation.z = time * 0.4;
      }
      if (a.orbit2) {
        a.orbit2.position.y = 2.6 + bob;
        a.orbit2.rotation.y = time * 1.8;
        a.orbit2.rotation.z = time * -0.6;
      }

      // Ground rings counter-rotate
      if (a.groundRing) a.groundRing.rotation.z = time * 0.45;
      if (a.outerRing)  a.outerRing.rotation.z  = time * -0.28;

      // Screen wobble
      if (a.screen) {
        a.screen.position.y = 2.6 + bob;
        a.screen.rotation.y = Math.sin(time * 0.6 + offset) * 0.18;
        a.screen.material.opacity = 0.12 + Math.sin(time * 2 + offset) * 0.06;
      }

      // Light pulse
      if (a.light) {
        a.light.position.y = 2.6 + bob;
        a.light.intensity = 2.0 + Math.sin(time * 2.5 + offset) * 0.8;
      }

      // Beam flicker
      if (a.beam) {
        a.beam.material.opacity = 0.05 + Math.sin(time * 1.2 + offset) * 0.03;
      }
    });
  }
}
