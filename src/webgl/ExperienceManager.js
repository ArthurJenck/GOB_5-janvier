import { states } from './config/states';
import OffersManager from './offers/OffersManager';
import PlayersManager from './players/PlayersManager';
import BackgroundManager from './ui/BackgroundManager';
import DaysManager from './ui/DaysManager';
import OverlayManager from './ui/OverlayManager';

export default class ExperienceManager {
    constructor(options = {}) {
        this.scene = options.scene;
        this.debugger = options.debugger;
        this.renderSize = options.renderSize;
        this.camera = options.camera;

        this.experienceStarted = false;

        this.backgroundManager = this.createBackgroundManager();
        this.daysManager = this.createDaysManager();
        this.overlayManager = this.createOverlayManager();
        this.offersManager = this.createOffersManager();
        this.playersManager = this.createPlayersManager();

        this.state = this.setupState('experience');

        this.setupEventListeners();
    }

    startExperience() {
        console.log('start');
        this.daysManager.start();
        this.playersManager.start();
        this.offersManager.start();
    }

    stopExperience() {
        this.offersManager.stop();
        this.playersManager.stop();
    }

    tick(time, delta, elapsed) {
        if (!this.experienceStarted) return;

        if (this.daysManager.remaining <= 0) {
            this.switchState('ending');
        }

        this.offersManager.tick(elapsed);
        this.playersManager.tick(elapsed);
        this.overlayManager.tick(elapsed);
    }

    resize() {
        this.offersManager.resize();
    }

    createBackgroundManager() {
        const backgroundManager = new BackgroundManager({ scene: this.scene, debugger: this.debugger });
        return backgroundManager;
    }

    createOverlayManager() {
        const overlayManager = new OverlayManager();
        return overlayManager;
    }

    createDaysManager() {
        const daysManager = new DaysManager({
            debugger: this.debugger,
        });
        return daysManager;
    }

    createOffersManager() {
        const offersManager = new OffersManager({
            scene: this.scene,
            debugger: this.debugger,
            renderSize: this.renderSize,
            camera: this.camera,
        });

        return offersManager;
    }

    createPlayersManager() {
        const playersManager = new PlayersManager({
            scene: this.scene,
            debugger: this.debugger,
            offersManager: this.offersManager,
        });

        return playersManager;
    }

    setupState(state) {
        this.switchState(state);
        return state;
    }

    switchState(state) {
        if (this.state) {
            states[this.state].onLeave(this);
            const previousStateElement = document.querySelector(states[this.state].domElement);
            if (!previousStateElement) return;
            previousStateElement.style.display = 'none';
        }

        states[state].onEnter(this);
        const newStateElement = document.querySelector(states[state].domElement);
        if (!newStateElement) return;
        newStateElement.style.display = 'flex';

        this.state = state;

        return state;
    }

    /**
     * Events
     */
    setupEventListeners() {
        const startBtn = document.querySelector('.start-btn');
        if (startBtn) startBtn.addEventListener('click', this.startBtnClickHandler.bind(this));
    }

    startBtnClickHandler() {
        this.switchState('experience');
    }

    /**
     * Debug
     */
    createDebugFolder() {
        if (!this.debugger) return;

        return sceneFolder;
    }
}
