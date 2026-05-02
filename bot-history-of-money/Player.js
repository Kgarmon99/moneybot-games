import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CONFIG } from './config.js';

export class MoneyBot {
  constructor() {
    this.mesh = new THREE.Group();
    this.model = null;
    this.mixer = null;
  }

  async init() {
    const loader = new GLTFLoader();
    try {
      const gltf = await new Promise((resolve, reject) => {
        loader.load('assets/chromebot-1.glb', resolve, undefined, reject);
      });
      
      this.model = gltf.scene;
      
      // Center the model and adjust scale
      const box = new THREE.Box3().setFromObject(this.model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      // Reset position so its base is at y=0
      this.model.position.y = -box.min.y;
      
      // Scale it to a smaller size (about 0.9 units high) for better scene fit
      const targetHeight = 0.9;
      const scale = targetHeight / size.y;
      this.model.scale.setScalar(scale);
      
      this.mesh.add(this.model);

      // Trail system initialization
      this.trailPoints = [];
      this.maxTrailPoints = 20;
      this.trailGeometry = new THREE.BufferGeometry();
      this.trailMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00ff00, 
        transparent: true, 
        opacity: 0.6,
        linewidth: 2
      });
      this.trailLine = new THREE.Line(this.trailGeometry, this.trailMaterial);
      this.trailLine.frustumCulled = false;
      // We'll add the trail to the scene directly in the main game or keep it detached from local mesh rotation
      
      // Handle animations if present
      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.model);
        const action = this.mixer.clipAction(gltf.animations[0]);
        action.play();
      }

      // Add a small light to the head area for that "bot" feel
      const eyeLight = new THREE.PointLight(0xffff00, 1, 2);
      eyeLight.position.set(0, 1.2, 0.5);
      this.mesh.add(eyeLight);

    } catch (error) {
      console.error('Error loading chromebot model:', error);
      // Fallback to a simple cube if loading fails
      const fallback = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
      );
      fallback.position.y = 0.5;
      this.mesh.add(fallback);
    }
  }

  update(time, deltaTime) {
    // Gentle hover
    const hoverAmplitude = 0.15;
    const hoverFreq = 1.5;
    this.mesh.position.y = Math.sin(time * hoverFreq) * hoverAmplitude + 0.5;
    
    // Animation mixer update
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }

    // Update trail
    if (this.trailLine) {
        // Record current position
        const currentPos = this.mesh.position.clone();
        // Add current pos to the start
        this.trailPoints.unshift(currentPos);
        
        // Remove old points
        if (this.trailPoints.length > this.maxTrailPoints) {
            this.trailPoints.pop();
        }
        
        // Update buffer geometry
        const positions = new Float32Array(this.trailPoints.length * 3);
        for (let i = 0; i < this.trailPoints.length; i++) {
            positions[i * 3] = this.trailPoints[i].x;
            positions[i * 3 + 1] = this.trailPoints[i].y;
            positions[i * 3 + 2] = this.trailPoints[i].z;
        }
        this.trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.trailGeometry.attributes.position.needsUpdate = true;
    }

    // Subtle tilt
    if (this.model) {
      this.model.rotation.z = Math.sin(time * 0.8) * 0.03;
      this.model.rotation.x = Math.sin(time * 0.4) * 0.02;
    }
  }
}