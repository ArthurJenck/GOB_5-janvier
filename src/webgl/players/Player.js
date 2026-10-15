import { Sprite } from 'three';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';

const noise = new SimplexNoise();

const params = {
    baseSpeed: 0.7,
    randomSpeedFactor: 1.8,
    baseReactionTime: 0.1,
    randomReactionTimeFactor: 0.7,
    reactionTimeVariation: 0.15,
    instantReactionChance: 0.1,
    maxHesitationChance: 0.2,
    baseHesitationTime: 0.15,
    randomHesitationTimeFactor: 0.35,
    maxPauseTime: 1,
    idleSpeedFactor: 0.5,
    idleAmplitude: 0.045,
    movingAmplitude: 0.015,
    baseNoiseFrequency: 0.6,
    randomNoiseFrequencyFactor: 0.8,
};

export default class Player {
    constructor(options = {}) {
        this.material = options.material;
        this.bounds = options.bounds;
        this.position = { ...options.position };

        this.hasWon = false;
        this.state = 'idle';
        this.target = null;
        this.nextActionAt = 0;
        this.hesitationAt = Infinity;
        this.hesitationUntil = 0;

        this.profile = this.createProfile();
        this.idlePosition = this.getIdlePosition();
        this.mesh = this.createSprite();
        this.mesh.position.set(this.position.x, this.position.y, 0);
    }

    tick(time, delta, offers) {
        if (this.target && !offers.includes(this.target)) {
            this.decideNextAction(time, offers);
            this.updateSpritePosition(time);
            return null;
        }

        if (this.state === 'idle') {
            if (offers.length === 0) {
                this.moveTowards(this.idlePosition, this.profile.speed * params.idleSpeedFactor, delta);
            } else {
                const { nearestOffer } = this.findNearestOffer(offers);
                this.chooseTarget(nearestOffer, time);
            }
        }

        if (this.state === 'hesitating') {
            if (offers.length === 0) {
                this.startIdle();
            } else if (time >= this.nextActionAt) {
                const { nearestOffer } = this.findNearestOffer(offers);
                if (nearestOffer) this.chooseTarget(nearestOffer, time);
            }
        }

        if (this.state === 'reacting' && time >= this.nextActionAt) this.startMoving(time);
        if (this.state === 'moving') this.moveToOffer(time, delta);

        this.updateSpritePosition(time);

        if (this.state === 'moving' && this.isTouching(this.target)) return this.target;
        return null;
    }

    createProfile() {
        const instantReaction = Math.random() < params.instantReactionChance;
        const idlePositions = ['center', 'corner', 'last'];

        return {
            speed: params.baseSpeed + Math.random() * params.randomSpeedFactor,
            reactionTime: instantReaction
                ? 0
                : params.baseReactionTime + Math.random() * params.randomReactionTimeFactor,
            hesitationChance: Math.random() * params.maxHesitationChance,
            pauseTime: instantReaction ? 0 : Math.random() * params.maxPauseTime,
            idlePosition: idlePositions[Math.floor(Math.random() * idlePositions.length)],
            cornerX: Math.random() < 0.5 ? -1 : 1,
            cornerY: Math.random() < 0.5 ? -1 : 1,
            noiseFrequency: params.baseNoiseFrequency + Math.random() * params.randomNoiseFrequencyFactor,
            noisePhase: Math.random() * 1000,
        };
    }

    getReactionTime() {
        if (this.profile.reactionTime === 0) return 0;
        return this.profile.reactionTime + Math.random() * params.reactionTimeVariation;
    }

    getIdlePosition() {
        if (this.profile.idlePosition === 'last') return { ...this.position };

        const centerX = (this.bounds.minX + this.bounds.maxX) / 2;
        const centerY = (this.bounds.minY + this.bounds.maxY) / 2;

        if (this.profile.idlePosition === 'center') return { x: centerX, y: centerY };

        return {
            x: this.profile.cornerX < 0 ? this.bounds.minX : this.bounds.maxX,
            y: this.profile.cornerY < 0 ? this.bounds.minY : this.bounds.maxY,
        };
    }

    createSprite() {
        const mesh = new Sprite(this.material);
        mesh.scale.setScalar(0.1);

        return mesh;
    }

    setBounds(bounds) {
        this.bounds = bounds;
        if (this.state === 'idle' && this.profile.idlePosition !== 'last') {
            this.idlePosition = this.getIdlePosition();
        }
    }

    setMaterial(material) {
        if (this.mesh.material === material) return;
        this.mesh.material = material;
        this.mesh.material.needsUpdate = true;
    }

    findNearestOffer(offers) {
        let nearestOffer = null;
        let nearestDistance = Infinity;

        offers.forEach((offer) => {
            const dx = offer.position.x - this.position.x;
            const dy = offer.position.y - this.position.y;
            const distance = Math.hypot(dx, dy);

            if (distance < nearestDistance) {
                nearestOffer = offer;
                nearestDistance = distance;
            }
        });

        return { nearestOffer, nearestDistance };
    }

    chooseTarget(offer, time) {
        this.target = offer;
        this.state = 'reacting';
        this.nextActionAt = time + this.getReactionTime();
    }

    startMoving(time) {
        this.state = 'moving';
        this.hesitationAt = Infinity;
        this.hesitationUntil = 0;

        if (Math.random() < this.profile.hesitationChance) {
            const dx = this.target.position.x - this.position.x;
            const dy = this.target.position.y - this.position.y;
            const duration = Math.hypot(dx, dy) / this.profile.speed;
            this.hesitationAt = time + duration * (0.25 + Math.random() * 0.5);
        }
    }

    startIdle(time) {
        this.target = null;
        this.state = 'idle';
        this.hesitationAt = Infinity;
        this.hesitationUntil = 0;
        this.idlePosition = this.getIdlePosition();
    }

    moveTowards(position, speed, delta) {
        const dx = position.x - this.position.x;
        const dy = position.y - this.position.y;
        const distance = Math.hypot(dx, dy);
        if (distance === 0) return;

        const step = Math.min(distance, speed * delta);
        this.position.x += (dx / distance) * step;
        this.position.y += (dy / distance) * step;
    }

    moveToOffer(time, delta) {
        if (time >= this.hesitationAt) {
            this.hesitationUntil = time + params.baseHesitationTime + Math.random() * params.randomHesitationTimeFactor;
            this.hesitationAt = Infinity;
        }

        if (time < this.hesitationUntil) return;
        this.moveTowards(this.target.position, this.profile.speed, delta);
    }

    decideNextAction(time, offers) {
        this.target = null;

        if (!offers || offers.length === 0) {
            this.startIdle(time);
            return;
        }

        if (this.profile.pauseTime > 0 && Math.random() < this.profile.hesitationChance) {
            this.state = 'hesitating';
            this.nextActionAt = time + this.profile.pauseTime;
            return;
        }

        const { nearestOffer } = this.findNearestOffer(offers);
        this.chooseTarget(nearestOffer, time);
    }

    updateSpritePosition(time) {
        const frequency = this.profile.noiseFrequency;
        const phase = this.profile.noisePhase;
        const amplitude = this.state === 'moving' ? params.movingAmplitude : params.idleAmplitude;

        this.mesh.position.x = this.position.x + noise.noise(time * frequency + phase, phase) * amplitude;
        this.mesh.position.y = this.position.y + noise.noise(phase, time * frequency + phase) * amplitude;
    }

    isTouching(offer) {
        const halfWidth = (this.mesh.scale.x + offer.geometry.parameters.width) / 2;
        const halfHeight = (this.mesh.scale.y + offer.geometry.parameters.height) / 2;

        return (
            Math.abs(this.mesh.position.x - offer.mesh.position.x) <= halfWidth &&
            Math.abs(this.mesh.position.y - offer.mesh.position.y) <= halfHeight
        );
    }

    apply(offersManager, offer) {
        const status = offersManager.applyToOffer(offer, 'player');
        this.hasWon = status === 'accepted';
    }
}
