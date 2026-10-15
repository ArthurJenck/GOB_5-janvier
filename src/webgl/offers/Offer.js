import gsap from 'gsap';
import { BoxGeometry, CanvasTexture, Mesh, MeshBasicMaterial, NearestFilter, SRGBColorSpace, Vector2 } from 'three';

const possibleStatusesThreshold = {
    denied: { userPercentage: 1, playerPercentage: 1 },
    ghosted: { userPercentage: 0.1, playerPercentage: 0 },
    accepted: { userPercentage: 0.001, playerPercentage: 0.2 },
};

export default class Offer {
    constructor(options = {}) {
        this.position = options.position;
        this.spawnedAt = options.spawnedAt;
        this.ttl = options.ttl;

        this.normalizedPosition = new Vector2();
        this.isAppliedTo = false;

        this.geometry = this.createGeometry();
        this.material = this.createMaterial();
        this.mesh = this.createMesh();
        this.status = this.chooseStatus();
    }

    createGeometry() {
        const geometry = new BoxGeometry(0.5, 0.5, 0.5);
        return geometry;
    }

    createMaterial() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;

        const ctx = canvas.getContext('2d');
        const draw = (color, rectangles) => {
            ctx.fillStyle = color;
            rectangles.forEach(([x, y, width, height]) => ctx.fillRect(x, y, width, height));
        };

        draw('#4b2d00', [[0, 0, 32, 32]]);
        draw('#704500', [
            [2, 1, 28, 30],
            [1, 3, 30, 26],
        ]);
        draw('#956507', [
            [4, 3, 24, 26],
            [3, 5, 26, 22],
        ]);
        draw('#c39a1d', [
            [6, 5, 20, 22],
            [5, 7, 22, 18],
        ]);
        draw('#d9af30', [
            [7, 6, 18, 2],
            [6, 8, 2, 16],
            [8, 26, 17, 1],
        ]);
        draw('#f0c94a', [
            [8, 6, 15, 1],
            [6, 9, 1, 12],
        ]);
        draw('#805400', [
            [25, 8, 2, 17],
            [8, 27, 18, 2],
        ]);

        const questionMark = [
            [11, 5, 10, 3],
            [8, 8, 4, 5],
            [20, 7, 3, 6],
            [17, 13, 5, 3],
            [14, 15, 4, 4],
            [14, 22, 4, 4],
        ];

        draw(
            '#6b4000',
            questionMark.map(([x, y, width, height]) => [x + 2, y + 1, width, height]),
        );
        draw('#fff8df', questionMark);
        draw('#ffffff', [
            [11, 11, 2, 4],
            [15, 25, 3, 3],
        ]);

        const texture = new CanvasTexture(canvas);
        texture.colorSpace = SRGBColorSpace;
        texture.magFilter = NearestFilter;
        texture.minFilter = NearestFilter;
        texture.generateMipmaps = false;

        return new MeshBasicMaterial({ map: texture });
    }

    createMesh() {
        const mesh = new Mesh(this.geometry, this.material);

        this.positionMesh(mesh);

        return mesh;
    }

    chooseStatus() {
        const random = Math.random();
        const offerStatus = { userStatus: 'denied', playerStatus: 'denied' };

        for (const key in possibleStatusesThreshold) {
            if (!Object.hasOwn(possibleStatusesThreshold, key)) continue;

            const threshold = possibleStatusesThreshold[key];

            if (random < threshold.userPercentage) {
                if (key !== 'denied') console.log(random, threshold);
                offerStatus.userStatus = key;
            }

            if (random < threshold.playerPercentage) {
                offerStatus.playerStatus = key;
            }
        }

        return offerStatus;
    }

    apply(from = 'user') {
        console.log(from, this.status);
        const status = from === 'user' ? this.status.userStatus : this.status.playerStatus;

        const tl = new gsap.timeline();
        tl.to(this.mesh.rotation, { y: Math.PI, duration: 0.2, repeat: status === 'ghosted' && Infinity });
        return tl;
    }

    positionMesh(mesh) {
        mesh.position.x = this.position.x;
        mesh.position.y = this.position.y;
    }
}
