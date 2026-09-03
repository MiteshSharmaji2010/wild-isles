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

        const distance = Math.sqrt(
            x * x + z * z
        );

        // Main island shape
        const islandShape = Math.max(
            0,
            1 - distance / 430
        );

        // Large natural hills
        const large =
            Math.sin(x * 0.012) *
            Math.cos(z * 0.010) *
            22;

        // Medium terrain variation
        const medium =
            Math.sin(x * 0.035 + 2.0) *
            Math.cos(z * 0.028) *
            8;

        // Small terrain detail
        const small =
            Math.sin(x * 0.09) *
            Math.cos(z * 0.075) *
            2.5;

        let height =
            (large + medium + small) *
            islandShape;

        // Central mountain range
        const mountainDistance = Math.sqrt(
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

        // Lower coastline
        if (distance > 330) {

            const coastFactor = Math.min(
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

            const height =
                this.getHeight(x, z);

            position.setZ(i, height);
        }

        geometry.rotateX(-Math.PI / 2);

        geometry.computeVertexNormals();

        const material =
            new THREE.MeshStandardMaterial({
                color: 0x526b43,
                roughness: 1.0,
                metalness: 0.0
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
