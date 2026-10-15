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

        this.ellapsed = 0;

        this.backgroundManager = this.createBackgroundManager();
        this.daysManager = this.createDaysManager();
        this.overlayManager = this.createOverlayManager();
        this.offersManager = this.createOffersManager();
        this.playersManager = this.createPlayersManager();
    }

    startExperience() {
        console.log('start');
        this.daysManager.start();
        this.playersManager.spawnPlayers();
    }

    tick() {
        this.ellapsed++;
        this.offersManager.tick(this.ellapsed);
        this.playersManager.tick(this.ellapsed);
        this.overlayManager.tick(this.ellapsed);
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

    /**
     * Debug
     */
    createDebugFolder() {
        if (!this.debugger) return;

        return sceneFolder;
    }
}
