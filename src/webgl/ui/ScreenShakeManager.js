import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';

const params = {
    maxOffset: 100,
    minSpeed: 2,
    maxSpeed: 20,
};

export default class ScreenShakeManager {
    constructor(options = {}) {
        this.delay = options.delay;

        this.noise = new ImprovedNoise();
        this.active = false;
        this.elapsed = 0;
        this.noiseTime = 0;
        this.x = 0;
        this.y = 0;
    }

    start(duration) {
        this.duration = duration;
        this.elapsed = 0;
        this.noiseTime = 0;
        this.active = true;
    }

    stop() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        document.body.style.transform = '';
    }

    tick(delta) {
        if (!this.active) return;

        this.elapsed += delta / 1000;

        const trauma = Math.min(1, Math.max(0, (this.elapsed - this.delay) / Math.max(1, this.duration - this.delay)));
        const strength = trauma * trauma;
        const speed = params.minSpeed + (params.maxSpeed - params.minSpeed) * strength;
        this.noiseTime += (delta / 1000) * speed;
        this.x = this.noise.noise(this.noiseTime, 0, 0) * params.maxOffset * strength;
        this.y = this.noise.noise(0, this.noiseTime, 1) * params.maxOffset * strength;

        document.body.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
    }
}
