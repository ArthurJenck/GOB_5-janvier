import gsap, { Power2, Sine } from 'gsap';
import { Mesh, MeshBasicMaterial } from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const params = {
    accepted: { words: ['Gagné', 'Accepté', 'Pris', 'Jackpot'], color: 0x35c759 },
    denied: { words: ['Perdu', 'Refusé', 'Non', 'Pas cette fois', 'Désolé', 'Navré', ':/'], color: 0xe83f4b },
    size: 0.06,
    depth: 0.02,
};

let fontPromise;

export default class Text extends Mesh {
    constructor(options = {}) {
        const { words, color } = params[options.type];
        const word = words[Math.floor(Math.random() * words.length)];
        const geometry = new TextGeometry(word, {
            font: options.font,
            size: params.size,
            depth: params.depth,
            curveSegments: 4,
        });
        geometry.center();

        super(geometry, new MeshBasicMaterial({ color, depthTest: false }));

        this.renderOrder = 1;
    }

    static loadFont() {
        if (!fontPromise) {
            fontPromise = new FontLoader().loadAsync('/fonts/pixelify.json').catch((error) => {
                console.error('Unable to load the text font', error);
                return null;
            });
        }

        return fontPromise;
    }

    play(onComplete) {
        const timeline = gsap.timeline({ onComplete });

        timeline.from(this.scale, { x: 0, y: 0, z: 0, duration: 0.45, ease: Power2.easeOut }, 0);
        timeline.from(this.rotation, { z: -Math.PI * 6, duration: 0.45, ease: Power2.out }, 0);
        timeline.to(this.rotation, { y: -0.12, duration: 0.2, ease: Sine.easeInOut }, '+=0.8');
        timeline.to(this.rotation, { y: 0.12, duration: 0.6, repeat: 2, yoyo: true, ease: Sine.easeInOut });
        timeline.to(this.scale, { x: 0, y: 0, z: 0, duration: 0.2, ease: Power2.easeIn });

        return timeline;
    }

    dispose() {
        this.geometry.dispose();
        this.material.dispose();
    }
}
