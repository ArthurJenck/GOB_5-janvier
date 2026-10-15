import gsap from 'gsap';
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';

export default class Offer {
    constructor(options = {}) {
        this.position = options.position;
        this.spawnedAt = options.spawnedAt;
        this.ttl = options.ttl;

        this.isAppliedTo = false;

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

    apply() {
        const tl = new gsap.timeline();
        tl.to(this.mesh.rotation, { y: Math.PI, duration: 0.2 });
        return tl;
    }

    positionMesh(mesh) {
        mesh.position.x = this.position.x;
        mesh.position.y = this.position.y;
    }
}
