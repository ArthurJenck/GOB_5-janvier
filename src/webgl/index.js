import { WebGLRenderer } from 'three';
import { Pane } from 'tweakpane';
import ExperienceManager from './ExperienceManager';
import GlobalScene from './scene/GlobalScene';

export default class WebGLApplication {
    constructor() {
        this.renderWidth = window.innerWidth;
        this.renderHeight = window.innerHeight;
        this.renderSize = { width: this.renderWidth, height: this.renderHeight };
        this.experienceStarted = false;

        this.renderer = this.createRenderer();
        this.debugger = this.createDebugger();
        this.scene = this.createScene();
        this.camera = this.scene.camera;
        this.experienceManager = this.createExperienceManager();
        this.startExperience();

        this.resize();

        this.setupEventListeners();
    }

    createRenderer() {
        const canvas = document.querySelector('canvas');
        const renderer = new WebGLRenderer({
            canvas,
        });

        renderer.setClearColor(0xffffff);
        renderer.shadowMap.enabled = true;

        return renderer;
    }

    createScene() {
        const scene = new GlobalScene({
            renderer: this.renderer,
            debugger: this.debugger,
        });

        return scene;
    }

    createExperienceManager() {
        const experienceManager = new ExperienceManager({
            scene: this.scene,
            debugger: this.debugger,
            renderSize: this.renderSize,
            camera: this.camera,
        });

        return experienceManager;
    }

    startExperience() {
        this.experienceStarted = true;
        this.experienceManager.startExperience();
    }

    resize() {
        this.renderSize.width = this.renderWidth;
        this.renderSize.height = this.renderHeight;
        this.renderer.setSize(this.renderWidth, this.renderHeight);

        this.scene.resize(this.renderWidth, this.renderHeight);
        this.experienceManager.resize();
    }

    update() {
        if (this.experienceStarted) this.experienceManager.tick();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Events
     */
    setupEventListeners() {
        window.addEventListener('resize', this.resizeHandler.bind(this));
        this.tickHandler();
    }

    resizeHandler() {
        this.renderWidth = window.innerWidth;
        this.renderHeight = window.innerHeight;

        this.resize();
    }

    tickHandler = () => {
        window.requestAnimationFrame(this.tickHandler);

        this.update();
        this.render();
    };

    /**
     * Debug
     */
    createDebugger() {
        const gui = new Pane({ title: 'Debug', expanded: false });

        return gui;
    }
}
