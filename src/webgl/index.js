import { WebGLRenderer } from 'three';
import { Pane } from 'tweakpane';
import GlobalScene from './GlobalScene';

export default class WebGLApplication {
    constructor() {
        this.renderWidth = window.innerWidth;
        this.renderHeight = window.innerHeight;

        this.renderer = this.createRenderer();
        this.debugger = this.createDebugger();
        this.scene = this.createScene();

        this.camera = this.scene.camera;

        this.resize();

        this.setupEventListeners();
    }

    /**
     * Public
     */

    /**
     * Private
     */
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

    resize() {
        this.renderer.setSize(this.renderWidth, this.renderHeight);

        this.scene.resize(this.renderWidth, this.renderHeight);
    }

    update() {}

    render = () => {
        this.renderer.render(this.scene, this.camera);
    };

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
        const gui = new Pane({ title: 'Debug' });

        return gui;
    }
}
