import * as THREE from 'three';
import { PlayerController, ThirdPersonCameraController } from './rosie/controls/rosieControls.js';
import { CONFIG } from './config.js';
import { MoneyBot } from './Player.js';
import { World } from './World.js';
import { DialogSystem } from './UI.js';

class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    
    this.clock = new THREE.Clock();
    this.player = null;
    this.controller = null;
    this.cameraController = null;
    this.world = null;
    this.dialog = null;
    this.visitedStories = new Set();
    this.canInteractWith = null;
    this._joystickLocked = false; // tracks last known joystick state

    this.init();
  }

  async init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);

    // World
    this.world = new World(this.scene);
    await this.world.init();
    
    // Player
    this.botInstance = new MoneyBot();
    await this.botInstance.init();
    this.player = this.botInstance.mesh;
    this.scene.add(this.player);
    if (this.botInstance.trailLine) {
        this.scene.add(this.botInstance.trailLine);
    }

    // Controllers
    this.controller = new PlayerController(this.player, {
      moveSpeed: CONFIG.PLAYER.MOVE_SPEED,
      jumpForce: CONFIG.PLAYER.JUMP_FORCE,
      gravity: CONFIG.PLAYER.GRAVITY,
      groundLevel: 0
    });

    this.cameraController = new ThirdPersonCameraController(
      this.camera, 
      this.player, 
      this.renderer.domElement, 
      { distance: 6, height: 3 }
    );

    // UI
    this.dialog = new DialogSystem();

    // Events
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('keydown', (e) => this.onKeyDown(e));

    // Mobile / tap interaction setup
    this._setupMobileInteraction();

    // Show intro story after a brief delay
    setTimeout(() => {
        this.dialog.startStory('intro');
    }, 1000);

    this.animate();
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onKeyDown(e) {
    if (e.code === 'KeyE' && this.canInteractWith && !this.dialog.isDialogActive) {
      this.dialog.startStory(this.canInteractWith.storyId);
      this.visitedStories.add(this.canInteractWith.storyId);
    }
  }

  _setupMobileInteraction() {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const promptEl = document.getElementById('interaction-prompt');

    // Make interaction prompt tappable on any device
    const trigger = () => {
      if (this.canInteractWith && !this.dialog.isDialogActive) {
        this.dialog.startStory(this.canInteractWith.storyId);
        this.visitedStories.add(this.canInteractWith.storyId);
      }
    };

    promptEl.addEventListener('click', trigger);

    let lastTap = 0;
    promptEl.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTap < 300) return;
      lastTap = now;
      e.preventDefault();
      trigger();
    }, { passive: false });

    // On mobile: inject an INTERACT button into the mobile game controls
    // (the joystick UI is created after a brief delay by MobileControls)
    if (isMobile) {
      const injectInteractBtn = () => {
        const mobileControls = document.getElementById('mobile-game-controls');
        if (!mobileControls) { setTimeout(injectInteractBtn, 300); return; }
        if (document.getElementById('mobile-interact-btn')) return;

        const btn = document.createElement('div');
        btn.id = 'mobile-interact-btn';
        btn.style.cssText = `
          position: absolute;
          bottom: 110px;
          right: 20px;
          width: 70px;
          height: 70px;
          background: rgba(0, 255, 0, 0.18);
          border: 2px solid rgba(0, 255, 0, 0.7);
          border-radius: 50%;
          display: none;
          align-items: center;
          justify-content: center;
          color: #00ff00;
          font-size: 11px;
          font-weight: bold;
          font-family: Orbitron, sans-serif;
          letter-spacing: 1px;
          pointer-events: auto;
          touch-action: none;
          user-select: none;
          box-shadow: 0 0 12px rgba(0,255,0,0.3);
          text-align: center;
          line-height: 1.2;
        `;
        btn.innerHTML = 'INTER<br>ACT';

        btn.addEventListener('touchstart', (e) => {
          e.preventDefault();
          btn.style.background = 'rgba(0,255,0,0.35)';
          trigger();
        });
        btn.addEventListener('touchend', () => {
          btn.style.background = 'rgba(0,255,0,0.18)';
        });
        btn.addEventListener('click', trigger);

        mobileControls.appendChild(btn);
        this._mobileInteractBtn = btn;
      };
      setTimeout(injectInteractBtn, 500);
    }
  }

  updateInteractions() {
    let closestTerminal = null;
    let minDist = Infinity;

    this.world.terminals.forEach(terminal => {
      const dist = this.player.position.distanceTo(terminal.mesh.position);
      const story = CONFIG.STORY.find(s => s.id === terminal.storyId);
      
      if (dist < story.triggerDist) {
        if (dist < minDist) {
          minDist = dist;
          closestTerminal = terminal;
        }
      }
    });

    const shouldShow = closestTerminal !== null && !this.dialog.isDialogActive;
    if (shouldShow) {
      this.canInteractWith = closestTerminal;
      this.dialog.showPrompt(true);
    } else {
      this.canInteractWith = null;
      this.dialog.showPrompt(false);
    }

    // Show / hide the mobile INTERACT button alongside the prompt
    if (this._mobileInteractBtn) {
      this._mobileInteractBtn.style.display = shouldShow ? 'flex' : 'none';
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    const isInputLocked = this.dialog && (
      this.dialog.isDialogActive || 
      this.dialog.barterGame.isActive || 
      this.dialog.commodityGame.isActive ||
      this.dialog.mintingGame.isActive ||
      this.dialog.paperGame.isActive ||
      this.dialog.goldStandardGame.isActive ||
      this.dialog.digitalGame.isActive ||
      this.dialog.timelineFinale.isActive ||
      this.dialog.stickerBook.isActive
    );

    if (this.dialog && !isInputLocked) {
      const cameraRotation = this.cameraController.update();
      this.controller.update(deltaTime, cameraRotation);
    }

    // Hide joystick while any dialog / mini-game / overlay is active
    if (isInputLocked !== this._joystickLocked) {
      this._joystickLocked = isInputLocked;
      const joystick = document.getElementById('mobile-game-controls');
      if (joystick) joystick.style.display = isInputLocked ? 'none' : 'block';
    }

    if (this.world) this.world.update(elapsedTime);
    if (this.botInstance) this.botInstance.update(elapsedTime, deltaTime);
    
    this.updateInteractions();

    this.renderer.render(this.scene, this.camera);
  }
}

// Ensure the game starts correctly
window.addEventListener('load', () => {
    const game = new Game();
});