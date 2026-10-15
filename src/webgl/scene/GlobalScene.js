import { Scene } from 'three';
import CameraManager from './CameraManager';
import LightsManager from './LightsManager';

export default class GlobalScene extends Scene {
    constructor(options = {}) {
        super();

        this.renderer = options.renderer;
        this.debugger = options.debugger;

        this.cameraManager = this.createCameraManager();
        this.lightsManager = this.createLightsManager();
    }

    get camera() {
        return this.cameraManager.camera;
    }

    createCameraManager() {
        const cameraManager = new CameraManager({
            renderer: this.renderer,
            debugger: this.debugger,
        });

        return cameraManager;
    }

    createLightsManager() {
        const lightsManager = new LightsManager({
            scene: this,
            renderer: this.renderer,
            debugger: this.debugger,
            cameraManager: this.cameraManager,
        });

        return lightsManager;
    }

    resize(width, height) {
        this.renderWidth = width;
        this.renderHeight = height;

        this.cameraManager.resize(width, height);
    }
}
