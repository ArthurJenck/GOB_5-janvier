import { states } from './config/states';
import AudioManager from './audio/AudioManager';
import OffersManager from './offers/OffersManager';
import PlayersManager from './players/PlayersManager';
import BackgroundManager from './ui/BackgroundManager';
import DaysManager from './ui/DaysManager';
import OverlayManager from './ui/OverlayManager';
import ScreenShakeManager from './ui/ScreenShakeManager';
import { Vector2 } from 'three';

const params = {
    kettleSoundDelay: 61,
    delay: 40,
};

export default class ExperienceManager {
    constructor(options = {}) {
        this.scene = options.scene;
        this.debugger = options.debugger;
        this.renderSize = options.renderSize;
        this.camera = options.camera;

        this.cursor = new Vector2();
        this.experienceStarted = false;

        this.audioManager = this.createAudioManager();
        this.backgroundManager = this.createBackgroundManager();
        this.daysManager = this.createDaysManager();
        this.overlayManager = this.createOverlayManager();
        this.screenShakeManager = this.createScreenShakeManager();
        this.offersManager = this.createOffersManager();
        this.playersManager = this.createPlayersManager();

        this.state = this.setupState('intro');

        this.setupEventListeners();
    }

    startExperience() {
        this.audioManager.startExperience();
        this.backgroundManager.start();
        this.overlayManager.start();
        this.screenShakeManager.start(this.daysManager.remaining);
        this.daysManager.start();
        this.playersManager.start();
        this.offersManager.start();
    }

    stopExperience() {
        this.backgroundManager.stop();
        this.overlayManager.stop();
        this.screenShakeManager.stop();
        this.daysManager.stop();
        this.offersManager.stop();
        this.playersManager.stop();
    }

    tick(time, delta, frame) {
        if (!this.experienceStarted) return;

        if (this.daysManager.remaining <= 0) {
            this.switchState('ending');
            return;
        }

        this.screenShakeManager.tick(delta);
        this.offersManager.tick(frame);
        this.playersManager.tick(time, delta / 1000);
        this.overlayManager.tick(delta);
    }

    resize() {
        this.offersManager.resize();
        this.playersManager.resize();
    }

    createAudioManager() {
        const audioManager = new AudioManager({
            kettleDelay: params.kettleSoundDelay,
        });
        return audioManager;
    }

    createBackgroundManager() {
        const backgroundManager = new BackgroundManager({
            scene: this.scene,
            debugger: this.debugger,
            delay: params.delay,
        });
        return backgroundManager;
    }

    createOverlayManager() {
        const overlayManager = new OverlayManager();
        return overlayManager;
    }

    createScreenShakeManager() {
        const screenShakeManager = new ScreenShakeManager({ delay: params.delay });
        return screenShakeManager;
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
            camera: this.camera,
            audioManager: this.audioManager,
            mousemoveHandler: this.mousemoveHandler,
            cursor: this.cursor,
        });

        return offersManager;
    }

    createPlayersManager() {
        const playersManager = new PlayersManager({
            scene: this.scene,
            debugger: this.debugger,
            offersManager: this.offersManager,
            camera: this.camera,
            renderSize: this.renderSize,
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
        const restartBtn = document.querySelector('.restart-btn', this.startBtnClickHandler.bind(this));
        if (restartBtn) restartBtn.addEventListener('click', this.startBtnClickHandler.bind(this));

        window.addEventListener('mousemove', this.mousemoveHandler.bind(this));
    }

    startBtnClickHandler() {
        this.audioManager.resume();
        this.switchState('experience');
    }

    mousemoveHandler(e) {
        const x = this.screenShakeManager.x;
        const y = this.screenShakeManager.y;
        const { width, height } = this.renderSize;

        this.cursor.x = ((e.clientX - x) / width) * 2 - 1;
        this.cursor.y = -((e.clientY - y) / height) * 2 + 1;

        const intersects = this.offersManager.raycast();

        const domElement = document.querySelector('body');
        if (intersects.length > 0) {
            domElement.style.cursor = 'pointer';
        } else {
            domElement.style.cursor = 'default';
        }
    }

    /**
     * Debug
     */
    createDebugFolder() {
        if (!this.debugger) return;

        return sceneFolder;
    }
}
