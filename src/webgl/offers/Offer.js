import gsap, { Linear } from 'gsap';
import { BoxGeometry, CanvasTexture, Mesh, MeshBasicMaterial, NearestFilter, SRGBColorSpace } from 'three';
import Text from './Text';

const possibleStatusesThreshold = {
    denied: { userPercentage: 1, playerPercentage: 1 },
    ghosted: { userPercentage: 0.1, playerPercentage: 0 },
    accepted: { userPercentage: 0, playerPercentage: 0.2 },
};

export default class Offer {
    constructor(options = {}) {
        this.position = options.position;
        this.spawnedAt = options.spawnedAt;
        this.ttl = options.ttl;
        this.normalizedPosition = options.normalizedPosition;
        this.scene = options.scene;
        this.onComplete = options.onComplete;
        this.fontPromise = Text.loadFont();

        this.isAppliedTo = false;
        this.disposed = false;

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

        draw('#004B00', [[0, 0, 32, 32]]);
        draw('#007000', [
            [2, 1, 28, 30],
            [1, 3, 30, 26],
        ]);
        draw('#079507', [
            [4, 3, 24, 26],
            [3, 5, 26, 22],
        ]);
        draw('#1DC31D', [
            [6, 5, 20, 22],
            [5, 7, 22, 18],
        ]);
        draw('#33D930', [
            [7, 6, 18, 2],
            [6, 8, 2, 16],
            [8, 26, 17, 1],
        ]);
        draw('#4AF04A', [
            [8, 6, 15, 1],
            [6, 9, 1, 12],
        ]);
        draw('#008000', [
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
            '#006B00',
            questionMark.map(([x, y, width, height]) => [x + 2, y + 1, width, height]),
        );
        draw('#DFFFE0', questionMark);
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
                offerStatus.userStatus = key;
            }

            if (random < threshold.playerPercentage) {
                offerStatus.playerStatus = key;
            }
        }

        return offerStatus;
    }

    apply(from = 'user') {
        const status = from === 'user' ? this.status.userStatus : this.status.playerStatus;
        const tl = gsap.timeline({
            onComplete: () => this.showResult(status),
        });
        tl.to(this.mesh.rotation, {
            y: Math.PI,
            duration: 0.2,
            ease: Linear.easeNone,
            repeat: status === 'ghosted' ? -1 : 0,
        });

        this.rotationTimeline = tl;

        return status;
    }

    async showResult(status) {
        const font = await this.fontPromise;
        if (this.disposed) return;
        if (!font) return this.onComplete();

        this.scene.remove(this.mesh);
        this.text = this.createText(font, status);
        this.scene.add(this.text);
        this.textTimeline = this.text.play(this.onComplete);
    }

    createText(font, type) {
        const text = new Text({ font, type });
        text.position.set(this.position.x, this.position.y, 0.4);
        return text;
    }

    dispose() {
        this.disposed = true;
        this.rotationTimeline?.kill();
        this.textTimeline?.kill();
        this.scene.remove(this.mesh);
        if (this.text) {
            this.scene.remove(this.text);
            this.text.dispose();
        }
        this.geometry.dispose();
        this.material.map.dispose();
        this.material.dispose();
    }

    positionMesh(mesh) {
        mesh.position.x = this.position.x;
        mesh.position.y = this.position.y;
        if (this.text) this.text.position.set(this.position.x, this.position.y, 0.4);
    }
}
