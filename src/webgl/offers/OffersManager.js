import { Raycaster } from 'three';
import Offer from './Offer';

const params = {
    startOffersCount: 20,
    // spawnCooldown: 60,
    spawnCooldown: 20,
    // spawnRandomThreshold: 0.005,
    spawnRandomThreshold: 0.8,
    offerTtl: 200,
};

export default class OffersManager {
    constructor(options = {}) {
        this.scene = options.scene;
        this.debugger = options.debugger;
        this.camera = options.camera;
        this.audioManager = options.audioManager;
        this.mousemoveHandler = options.mousemoveHandler;
        this.cursor = options.cursor;

        this.offers = [];
        this.lastSpawnedAt = 0;
        this.intersects = [];
        this.active = false;

        this.debugFolder = this.createDebugFolder();

        this.raycaster = new Raycaster();

        this.setupEventListeners();
    }

    tick(elasped) {
        if (!this.active) return;

        this.decideIfSpawnOffer(elasped);

        this.offers.forEach((offer) => {
            if (!offer.isAppliedTo && elasped - offer.spawnedAt >= offer.ttl) this.removeOffer(offer);
        });
    }

    start() {
        this.active = true;

        for (let i = 0; i < params.startOffersCount; i++) {
            this.spawnOffer();
        }
    }

    decideIfSpawnOffer(elasped) {
        if (elasped - this.lastSpawnedAt > params.spawnCooldown && Math.random() < params.spawnRandomThreshold) {
            this.spawnOffer(elasped);
        }
    }

    spawnOffer(spawnedAt = 0) {
        const normalizedPosition = {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
        };

        const offer = new Offer({
            position: this.getOfferPosition(normalizedPosition),
            normalizedPosition,
            ttl: params.offerTtl,
            spawnedAt: spawnedAt,
            scene: this.scene,
            onComplete: () => this.removeOffer(offer),
            audioManager: this.audioManager,
        });

        this.offers.push(offer);
        this.scene.add(offer.mesh);
        this.lastSpawnedAt = spawnedAt;

        return offer;
    }

    getOfferPosition(normalizedPosition) {
        const halfSize = 0.25;
        const distance = Math.max(0, this.camera.position.z - halfSize);
        const halfHeight = Math.tan((this.camera.fov * Math.PI) / 360) * distance;
        const halfWidth = halfHeight * this.camera.aspect;

        return {
            x: this.camera.position.x + normalizedPosition.x * Math.max(0, halfWidth - halfSize),
            y: this.camera.position.y + normalizedPosition.y * Math.max(0, halfHeight - halfSize),
        };
    }

    resize() {
        this.offers.forEach((offer) => {
            offer.position = this.getOfferPosition(offer.normalizedPosition);
            offer.positionMesh(offer.mesh);
        });
    }

    raycast() {
        this.raycaster.setFromCamera(this.cursor, this.camera);
        this.intersects = this.raycaster.intersectObjects(
            this.offers.filter((offer) => !offer.isAppliedTo).map((offer) => offer.mesh),
            false,
        );
        return this.intersects;
    }

    applyToOffer(offer, from = 'user') {
        if (offer.isAppliedTo) return;

        offer.isAppliedTo = true;
        return offer.apply(from);
    }

    removeOffer(offer) {
        if (offer.disposed) return;
        offer.dispose();

        const index = this.offers.indexOf(offer);
        if (index !== -1) this.offers.splice(index, 1);
    }

    removeAllOffers() {
        [...this.offers].forEach((offer) => {
            this.removeOffer(offer);
        });

        return this.offers;
    }

    stop() {
        this.active = false;
        this.removeAllOffers();
    }

    /**
     * Events
     */
    setupEventListeners() {
        window.addEventListener('pointerdown', this.pointerdownHandler.bind(this));
        window.addEventListener('pointerup', this.pointerupHandler.bind(this));
    }

    pointerdownHandler(e) {
        this.isPointerDown = true;
    }

    pointerupHandler(e) {
        this.isPointerDown = false;

        if (this.intersects.length === 0) return;

        const firstTarget = this.intersects[0].object;
        const offer = this.offers.find((offer) => offer.mesh === firstTarget);
        if (offer) this.applyToOffer(offer);
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
