import CameraManager from './CameraManager';
import { BoxGeometry, Mesh, MeshBasicMaterial, Scene } from 'three';
import LightsManager from './LightsManager';

export default class GlobalScene extends Scene {
    constructor(options = {}) {
        super();

        this.renderer = options.renderer;
        this.debugger = options.debugger;

        this.debugFolder = this.createDebugFolder();

        this.cameraManager = this.createCameraManager();
        this.lightsManager = this.createLightsManager();
        this.box = this.createBox();
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
            debugger: this.debugFolder,
        });

        return cameraManager;
    }

    createLightsManager() {
        const lightsManager = new LightsManager({
            scene: this,
            renderer: this.renderer,
            debugger: this.debugFolder,
            cameraManager: this.cameraManager,
        });

        return lightsManager;
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

        const sceneFolder = this.debugger.addFolder({ title: 'Scene', expanded: false });

        return sceneFolder;
    }
}
