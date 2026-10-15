import { Color } from 'three';

const params = {
    color: '#fff',
};

export default class BackgroundManager {
    constructor(options = {}) {
        this.scene = options.scene;
        this.debugger = options.debugger;

        this.scene.background = new Color(params.color);
        this.debugFolder = this.createDebugFolder();
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

        backgroundFolder.addBinding(params, 'color').on('change', ({ value }) => {
            this.scene.background.set(value);
        });

        return backgroundFolder;
    }
}
