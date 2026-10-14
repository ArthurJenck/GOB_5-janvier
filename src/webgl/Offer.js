import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';

export default class Offer {
    constructor(options = {}) {
        this.position = options.position;

        this.geometry = this.createGeometry();
        this.material = this.createMaterial();
        this.mesh = this.createMesh();

        return this.mesh;
    }

    createGeometry() {
        const geometry = new BoxGeometry(0.5, 0.5, 0.5);
        return geometry;
    }

    createMaterial() {
        const material = new MeshBasicMaterial({ color: 0xff0000 });
        return material;
    }

    createMesh() {
        const mesh = new Mesh(this.geometry, this.material);

        this.positionMesh(mesh);

        return mesh;
    }

    positionMesh(mesh) {
        mesh.position.x = this.position.x;
        mesh.position.y = this.position.y;
    }

    destroy() {
        this.geometry.dispose();
        this.material.dispose();
    }
}
