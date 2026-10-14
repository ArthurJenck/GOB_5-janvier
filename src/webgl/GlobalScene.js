import CameraManager from './CameraManager';
import { BoxGeometry, Mesh, MeshBasicMaterial, Scene } from 'three';
import LightsManager from './LightsManager';
import Background from './Background';

export default class GlobalScene extends Scene {
    constructor(options = {}) {
        super();

        this.renderer = options.renderer;
        this.debugger = options.debugger;

        this.cameraManager = this.createCameraManager();
        this.lightsManager = this.createLightsManager();
        this.box = this.createBox();

        this.backgroundManager = this.createBackground();
    }

    get camera() {
        return this.cameraManager.camera;
    }

    createBox() {
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new Mesh(geometry, material);

        this.add(mesh);
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

    createBackground() {
        return new Background({ scene: this, debugger: this.debugger });
    }

    resize(width, height) {
        this.renderWidth = width;
        this.renderHeight = height;

        this.cameraManager.resize(width, height);
    }

    /**
     * Debug
     */
    createDebugFolder() {
        if (!this.debugger) return;

        return sceneFolder;
    }
}
