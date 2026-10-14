import Offer from './Offer';

const params = {
    // spawnThreshold: 0.005,
    spawnThreshold: 0.1,
};

export default class OffersManager {
    constructor(options = {}) {
        this.scene = options.scene;
        this.debugger = options.debugger;
        this.renderSize = options.renderSize;

        this.offers = [];

        this.lastSpawnedAt = 0;

        this.debugFolder = this.createDebugFolder();
    }

    decideIfSpawnOffer() {
        if (Math.random() < params.spawnThreshold) {
            this.spawnOffer();
        }
    }

    spawnOffer() {
        const position = {
            x: (Math.random() * 2 - 1) * 3,
            y: (Math.random() * 2 - 1) * 3,
        };

        const offer = new Offer({ position });

        this.offers.push(offer);
        this.scene.add(offer);

        return offer;
    }

    removeAllOffers() {
        this.offers.forEach((offer) => {
            offer.geometry.dispose();
            offer.material.dispose();
            this.scene.remove(offer);
        });
        this.offers.length = 0;

        return this.offers;
    }

    /**
     * Debug
     */
    createDebugFolder() {
        if (!this.debugger) return;

        const offersFolder = this.debugger.addFolder({ title: 'Offers' });
        offersFolder.addButton({ title: 'Spawn offer' }).on('click', () => {
            this.spawnOffer();
        });
        offersFolder.addButton({ title: 'Remove all offers' }).on('click', () => {
            this.removeAllOffers();
        });

        return offersFolder;
    }
}
