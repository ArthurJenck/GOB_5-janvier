import gsap from 'gsap';
import { Color } from 'three';

const params = {
    color: '#fff',
    duration: 30,
};

export default class BackgroundManager {
    constructor(options = {}) {
        this.scene = options.scene;
        this.debugger = options.debugger;
        this.delay = options.delay;

        this.scene.background = new Color(params.color);
        this.debugFolder = this.createDebugFolder();
    }

    start() {
        this.stop();
        this.tween = this.setupTween();
    }

    stop() {
        this.tween?.kill();
        params.color = '#fff';
        this.changeColor(params.color);
    }

    setupTween() {
        return gsap.to(params, {
            color: '#015824',
            duration: params.duration,
            delay: this.delay,
            onUpdate: () => {
                this.changeColor(params.color);
            },
        });
    }

    changeColor(newColor) {
        this.scene.background.set(newColor);
        document.documentElement.style.backgroundColor = newColor;
    }

    /**
     * Debug
     */
    createDebugFolder() {
        if (!this.debugger) return;

        const backgroundFolder = this.debugger.addFolder({ title: 'Background' });

        return backgroundFolder;
    }
}
