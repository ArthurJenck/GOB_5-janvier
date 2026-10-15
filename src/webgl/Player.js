import gsap, { Linear } from 'gsap';
import { Sprite } from 'three';

const params = {
    randomMovingThreshold: 0.5,
    baseSpeed: 0.2,
    randomSpeedFactor: 0.5,
};

export default class Player {
    constructor(options = {}) {
        this.material = options.material;

        this.speed = this.getSpeed();
        this.mesh = this.createSprite();
    }

    getSpeed() {
        const speed = params.baseSpeed + Math.random() * params.randomSpeedFactor;
        return speed;
    }

    createSprite() {
        const mesh = new Sprite(this.material);
        mesh.scale.setScalar(0.1);

        return mesh;
    }

    setMaterial(material) {
        this.mesh.material = material;
        this.mesh.material.needsUpdate = true;
    }

    findNearestOffer(offers) {
        this.position = this.mesh.position;

        if (!offers || offers.length === 0) return { nearestOffer: null, nearestDistance: Infinity };

        const distances = offers.map((offer) => {
            const startPosition = this.mesh.position;
            const targetPosition = offer.mesh.position;
            const dx = targetPosition.x - startPosition.x;
            const dy = targetPosition.y - startPosition.y;

            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance;
        });

        const nearestDistance = Math.min(...distances);
        const indexOfNearest = distances.indexOf(Math.min(...distances));
        return { nearestOffer: offers[indexOfNearest], nearestDistance };
    }

    moveToOffer(offer) {
        gsap.killTweensOf(this.position);
        gsap.to(this.position, {
            x: offer.position.x,
            y: offer.position.y,
            duration: this.speed,
            ease: Linear.easeNone,
        });
    }

    findIntersectingOffer(offers) {
        return offers.find((offer) => {
            const halfWidth = (this.mesh.scale.x + offer.geometry.parameters.width) / 2;
            const halfHeight = (this.mesh.scale.y + offer.geometry.parameters.height) / 2;

            return (
                Math.abs(this.mesh.position.x - offer.mesh.position.x) <= halfWidth &&
                Math.abs(this.mesh.position.y - offer.mesh.position.y) <= halfHeight
            );
        });
    }

    apply(offersManager, offer) {
        offersManager.applyToOffer(offer);
    }
}
