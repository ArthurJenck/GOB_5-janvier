import { Raycaster, Vector2 } from 'three';
import Offer from './Offer';
import gsap from 'gsap';

const params = {
    // spawnCooldown: 60,
    spawnCooldown: 30,
    // spawnRandomThreshold: 0.005,
    spawnRandomThreshold: 0.8,
    offerTtl: 200,
};

export default class OffersManager {
    constructor(options = {}) {
        this.scene = options.scene;
        this.debugger = options.debugger;
        this.renderSize = options.renderSize;
        this.camera = options.camera;

        this.offers = [];
        this.lastSpawnedAt = 0;
        this.intersects = [];
        this.active = false;

        this.debugFolder = this.createDebugFolder();

        this.raycaster = new Raycaster();
        this.cursor = new Vector2();

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
    }

    decideIfSpawnOffer(elasped) {
        if (elasped - this.lastSpawnedAt > params.spawnCooldown && Math.random() < params.spawnRandomThreshold) {
            this.spawnOffer(elasped);
        }
    }

    spawnOffer(spawnedAt) {
        const normalizedPosition = {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
        };

        const offer = new Offer({
            position: this.getOfferPosition(normalizedPosition),
            normalizedPosition,
            ttl: params.offerTtl,
            spawnedAt: spawnedAt,
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
            this.offers.map((offer) => offer.mesh),
            false,
        );
    }

    applyToOffer(offer, from = 'user') {
        if (offer.isAppliedTo) return;

        const tl = gsap.timeline({ onComplete: () => this.removeOffer(offer) });
        tl.add(offer.apply(from));
        offer.isAppliedTo = true;
    }

    removeOffer(offer) {
        this.scene.remove(offer.mesh);
        offer.geometry.dispose();
        offer.material.map.dispose();
        offer.material.dispose();

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
        window.addEventListener('mousemove', this.mousemoveHandler.bind(this));
    }

    pointerdownHandler(e) {
        this.isPointerDown = true;
        this.mousemoveHandler(e);

        this.pointerStartPosition = {
            x: e.clientX,
            y: e.clientY,
        };
    }

    pointerupHandler(e) {
        this.isPointerDown = false;

        if (this.intersects.length === 0) return;

        const firstTarget = this.intersects[0].object;
        const offer = this.offers.find((offer) => offer.mesh === firstTarget);
        if (offer) this.applyToOffer(offer);
    }

    mousemoveHandler(e) {
        this.cursor.x = (e.clientX / this.renderSize.width) * 2 - 1;
        this.cursor.y = -(e.clientY / this.renderSize.height) * 2 + 1;

        this.raycast();

        const domElement = document.querySelector('body');
        if (this.intersects.length > 0) {
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
