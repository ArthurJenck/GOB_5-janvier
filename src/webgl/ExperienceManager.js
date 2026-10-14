import BackgroundManager from './BackgroundManager';
import DaysManager from './DaysManager';
import OffersManager from './OffersManager';

export default class ExperienceManager {
    constructor(options = {}) {
        this.scene = options.scene;
        this.debugger = options.debugger;
        this.renderSize = options.renderSize;

        this.ellapsed = 0;

        this.backgroundManager = this.createBackgroundManager();
        this.daysManager = this.createDaysManager();
        this.offersManager = this.createOffersManager();
    }

    startExperience() {
        console.log('start');
        this.daysManager.start();
    }

    tick() {
        this.ellapsed++;
        this.offersManager.decideIfSpawnOffer();
    }

    createBackgroundManager() {
        return new BackgroundManager({ scene: this.scene, debugger: this.debugger });
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
        });

        return offersManager;
    }

    /**
     * Debug
     */
    createDebugFolder() {
        if (!this.debugger) return;

        return sceneFolder;
    }
}
