import { SpriteMaterial, TextureLoader } from 'three';
import Player from './Player';

const params = {
    playersCount: 0,
    spawnDelayMin: 8,
    spawnDelayMax: 14,
    spawnMargin: 0.15,
};

export default class PlayersManager {
    constructor(options = {}) {
        this.scene = options.scene;
        this.debugger = options.debugger;
        this.offersManager = options.offersManager;
        this.camera = options.camera;
        this.renderSize = options.renderSize;

        this.players = [];
        this.active = false;
        this.nextSpawnAt = null;

        this.defaultMap = this.loadDefaultMap();
        this.pointerMap = this.loadPointerMap();
        this.defaultMaterial = this.createMaterial(this.defaultMap);
        this.pointerMaterial = this.createMaterial(this.pointerMap);
    }

    tick(time, delta) {
        if (!this.active) return;

        this.decideIfSpawnPlayer(time);

        [...this.players].forEach((player) => {
            if (player.hasWon) return this.removePlayer(player);

            player.setMaterial(this.defaultMaterial);
            const offers = this.offersManager.offers.filter((offer) => !offer.isAppliedTo);
            const reachedOffer = player.tick(time, delta, offers);
            if (!reachedOffer) return;

            player.setMaterial(this.pointerMaterial);
            player.apply(this.offersManager, reachedOffer);

            if (!player.hasWon) {
                const remainingOffers = this.offersManager.offers.filter((offer) => !offer.isAppliedTo);
                player.decideNextAction(time, remainingOffers);
            }
        });
    }

    loadDefaultMap() {
        const map = new TextureLoader().load('cursor.png');
        map.generateMipmaps = false;

        return map;
    }

    loadPointerMap() {
        const map = new TextureLoader().load('pointer.webp');
        map.generateMipmaps = false;

        return map;
    }

    createMaterial(map) {
        this.material = new SpriteMaterial({ map });
        this.material.depthWrite = false;
        this.material.depthTest = false;

        return this.material;
    }

    start() {
        this.active = true;
        this.nextSpawnAt = null;
        this.spawnPlayers();
    }

    spawnPlayer() {
        const bounds = this.getBounds();
        const player = new Player({
            material: this.defaultMaterial,
            bounds,
            position: {
                x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
                y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
            },
        });

        this.scene.add(player.mesh);
        this.players.push(player);

        return player;
    }

    spawnPlayers() {
        for (let i = 0; i < params.playersCount; i++) {
            this.spawnPlayer();
        }
    }

    decideIfSpawnPlayer(time) {
        if (this.nextSpawnAt === null) this.nextSpawnAt = time + this.getSpawnDelay();
        if (time < this.nextSpawnAt) return;

        this.spawnPlayer();
        this.nextSpawnAt = time + this.getSpawnDelay();
    }

    getSpawnDelay() {
        return params.spawnDelayMin + Math.random() * (params.spawnDelayMax - params.spawnDelayMin);
    }

    resize() {
        const bounds = this.getBounds();
        this.players.forEach((player) => player.setBounds(bounds));
    }

    getBounds() {
        const distance = Math.max(0, this.camera.position.z - 0.25);
        const halfHeight = Math.tan((this.camera.fov * Math.PI) / 360) * distance;
        const halfWidth = halfHeight * (this.renderSize.width / this.renderSize.height);
        const width = Math.max(0, halfWidth - params.spawnMargin);
        const height = Math.max(0, halfHeight - params.spawnMargin);

        return {
            minX: this.camera.position.x - width,
            maxX: this.camera.position.x + width,
            minY: this.camera.position.y - height,
            maxY: this.camera.position.y + height,
        };
    }

    removePlayer(player) {
        this.scene.remove(player.mesh);
        const index = this.players.indexOf(player);
        if (index !== -1) this.players.splice(index, 1);
    }

    removeAllPlayers() {
        [...this.players].forEach((player) => {
            this.removePlayer(player);
        });

        this.players = [];

        return this.players;
    }

    stop() {
        this.active = false;
        this.nextSpawnAt = null;
        this.removeAllPlayers();
    }
}
