import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class VeyraTerrain {

    constructor(scene) {
        this.scene = scene;

        this.size = 900;
        this.segments = 180;

        this.mesh = null;

        this.create();
    }

    getHeight(x, z) {

        const distance =
            Math.sqrt(x * x + z * z);

        // Island center is higher
        const islandShape =
            Math.max(0, 1 - distance / 430);

        // Large hills
        const large =
            Math.sin(x * 0.012) *
            Math.cos(z * 0.010) *
            22;

        // Medium terrain variation
        const medium =
            Math.sin(x * 0.035 + 2.0) *
            Math.cos(z * 0.028) *
            8;

        // Small natural variation
        const small =
            Math.sin(x * 0.09) *
            Math.cos(z * 0.075) *
            2.5;

        let height =
            (large + medium + small) *
            islandShape;

        // Center mountain region
        const mountainDistance =
            Math.sqrt(
                Math.pow(x + 80, 2) +
                Math.pow(z + 40, 2)
            );

        if (mountainDistance < 170) {

            const mountainFactor =
                1 - mountainDistance / 170;

            height +=
                Math.pow(
                    Math.max(0, mountainFactor),
                    2
                ) * 95;
        }

        // Keep coastline low
        if (distance > 330) {
            const coastFactor =
                Math.min(
                    1,
                    (distance - 330) / 100
                );

            height -= coastFactor * 18;
        }

        return height;
    }

    create() {

        const geometry =
            new THREE.PlaneGeometry(
                this.size,
                this.size,
                this.segments,
                this.segments
            );

        const position =
            geometry.attributes.position;

        for (
            let i = 0;
            i < position.count;
            i++
        ) {

            const x = position.getX(i);
            const z = position.getY(i);

            const y =
                this.getHeight(x, z);

            position.setZ(i, y);
        }

        geometry.rotateX(-Math.PI / 2);

        geometry.computeVertexNormals();

        const material =
            new THREE.MeshStandardMaterial({
                color: 0x596f45,
                roughness: 1,
                metalness: 0
            });

        this.mesh =
            new THREE.Mesh(
                geometry,
                material
            );

        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;

        this.scene.add(this.mesh);

        console.log(
            "Veyra Island terrain created."
        );
    }
}
