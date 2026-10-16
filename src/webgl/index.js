import { gsap } from 'gsap';
import { WebGLRenderer } from 'three';
import { Pane } from 'tweakpane';
import ExperienceManager from './ExperienceManager';
import GlobalScene from './scene/GlobalScene';

export default class WebGLApplication {
    constructor() {
        this.renderWidth = window.innerWidth;
        this.renderHeight = window.innerHeight;
        this.renderSize = { width: this.renderWidth, height: this.renderHeight };

        this.renderer = this.createRenderer();
        this.debugger = this.createDebugger();
        this.scene = this.createScene();
        this.camera = this.scene.camera;
        this.experienceManager = this.createExperienceManager();

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

    resize() {
        this.renderSize.width = this.renderWidth;
        this.renderSize.height = this.renderHeight;
        this.renderer.setSize(this.renderWidth, this.renderHeight);

        this.scene.resize(this.renderWidth, this.renderHeight);
        this.experienceManager.resize();
    }

    update(time, delta, elapsed) {
        this.experienceManager.tick(time, delta, elapsed);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Events
     */
    setupEventListeners() {
        window.addEventListener('resize', this.resizeHandler.bind(this));
        gsap.ticker.add(this.tickHandler.bind(this));
    }

    resizeHandler() {
        this.renderWidth = window.innerWidth;
        this.renderHeight = window.innerHeight;

        this.resize();
    }

    tickHandler = (time, delta, elapsed) => {
        this.update(time, delta, elapsed);
        this.render();
    };

    /**
     * Debug
     */
    createDebugger() {
        if (import.meta.env.PROD) return;
        const gui = new Pane({ title: 'Debug', expanded: false });

        return gui;
    }
}
