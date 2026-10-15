import { Sprite, SpriteMaterial, TextureLoader } from 'three';
import Player from './Player';

const params = {
    playersCount: 10,
    playerRange: Infinity,
};

export default class PlayersManager {
    constructor(options = {}) {
        this.scene = options.scene;
        this.debugger = options.debugger;
        this.offersManager = options.offersManager;

        this.players = [];
        this.active = false;

        this.defaultMap = this.loadDefaultMap();
        this.pointerMap = this.loadPointerMap();
        this.defaultMaterial = this.createMaterial(this.defaultMap);
        this.pointerMaterial = this.createMaterial(this.pointerMap);
    }

    tick() {
        if (!this.active) return;

        this.players.forEach((player) => {
            if (player.hasWon) return this.removePlayer(player);

            const offers = this.offersManager.offers.filter((offer) => !offer.isAppliedTo);
            const { nearestOffer, nearestDistance } = player.findNearestOffer(offers);

            if (!nearestOffer || nearestDistance > params.playerRange) return player.setMaterial(this.defaultMaterial);

            player.moveToOffer(nearestOffer);

            const intersectingOffer = player.findIntersectingOffer(offers);
            if (intersectingOffer) {
                player.setMaterial(this.pointerMaterial);
                player.apply(this.offersManager, intersectingOffer);
            } else {
                player.setMaterial(this.defaultMaterial);
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
        this.spawnPlayers();
    }

    spawnPlayers() {
        for (let i = 0; i < params.playersCount; i++) {
            const player = new Player({ material: this.defaultMaterial });

            this.scene.add(player.mesh);
            player.mesh.position.x = (Math.random() * 2 - 1) * 2;
            player.mesh.position.y = (Math.random() * 2 - 1) * 2;
            this.players.push(player);
        }
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
        this.removeAllPlayers();
    }
}
