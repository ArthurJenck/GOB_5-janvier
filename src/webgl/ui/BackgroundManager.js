import gsap from 'gsap';
import { Color } from 'three';

const params = {
    color: '#fff',
    duration: 40,
    delay: 20,
};

export default class BackgroundManager {
    constructor(options = {}) {
        this.scene = options.scene;
        this.debugger = options.debugger;

        this.scene.background = new Color(params.color);
        this.debugFolder = this.createDebugFolder();
        this.tween = this.setupTween();
    }

    setupTween() {
        return gsap.to(params, {
            color: '#015824',
            duration: params.duration,
            delay: params.delay,
            onUpdate: () => {
                this.changeColor(params.color);
            },
        });
    }

    changeColor(newColor) {
        this.scene.background.set(newColor);
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
