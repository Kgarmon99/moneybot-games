/**
 * MoneyBot Web Audio API Synthesizer
 * Provides generated sound effects across all games without requiring external assets.
 */

class MoneyBotAudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = false;
        this.initOnInteraction();
    }

    initOnInteraction() {
        const initAudio = () => {
            if (!this.ctx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    this.ctx = new AudioContext();
                    this.enabled = true;
                    console.log("MoneyBot Audio Engine initialized.");
                }
            }
            // Remove listeners once initialized
            document.removeEventListener('click', initAudio);
            document.removeEventListener('touchstart', initAudio);
            document.removeEventListener('keydown', initAudio);
        };

        document.addEventListener('click', initAudio);
        document.addEventListener('touchstart', initAudio);
        document.addEventListener('keydown', initAudio);
    }

    playTone(frequency, type, duration, vol = 0.1, slideFreq = null) {
        if (!this.enabled || !this.ctx) return;
        
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        
        if (slideFreq) {
            osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + duration);
        }

        gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // specific sound effects
    playCoin() {
        this.playTone(880, 'sine', 0.1, 0.1, 1200); // High pitch slide up
        setTimeout(() => this.playTone(1200, 'sine', 0.2, 0.1), 50);
    }

    playHit() {
        this.playTone(150, 'sawtooth', 0.2, 0.2, 50); // Low pitch dropping
        // Add some noise
        this.playNoise(0.2, 0.2);
    }

    playLevelUp() {
        this.playTone(440, 'square', 0.1, 0.1);
        setTimeout(() => this.playTone(554, 'square', 0.1, 0.1), 100);
        setTimeout(() => this.playTone(659, 'square', 0.3, 0.1, 880), 200);
    }

    playGameOver() {
        this.playTone(300, 'sawtooth', 0.4, 0.2, 100);
        setTimeout(() => this.playTone(250, 'sawtooth', 0.4, 0.2, 80), 300);
        setTimeout(() => this.playTone(200, 'sawtooth', 0.8, 0.2, 50), 600);
    }

    playSelect() {
        this.playTone(600, 'sine', 0.1, 0.05);
    }

    playNoise(duration, vol) {
        if (!this.enabled || !this.ctx) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        // Lowpass filter for explosion crunch
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        noise.start();
    }
}

// Global instance
window.mbAudio = new MoneyBotAudioEngine();
