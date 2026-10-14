import gsap from 'gsap';
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';

export default class Offer {
    constructor(options = {}) {
        this.position = options.position;
        this.normalizedPosition = options.normalizedPosition;
        this.spawnedAt = options.spawnedAt;
        this.ttl = options.ttl;

        this.geometry = this.createGeometry();
        this.material = this.createMaterial();
        this.mesh = this.createMesh();
    }

    createGeometry() {
        const geometry = new BoxGeometry(0.5, 0.5, 0.5);
        return geometry;
    }

    createMaterial() {
        const material = new MeshBasicMaterial({ color: 0x02b500 });
        return material;
    }

    createMesh() {
        const mesh = new Mesh(this.geometry, this.material);

        this.positionMesh(mesh);

        return mesh;
    }

    apply(scene) {
        gsap.to(this.mesh.rotation, { y: Math.PI, duration: 0.2 }).then(() => this.destroy(scene));
    }

    positionMesh(mesh) {
        mesh.position.x = this.position.x;
        mesh.position.y = this.position.y;
    }

    destroy(scene) {
        scene.remove(this.mesh);
        this.geometry.dispose();
        this.material.dispose();
    }
}
