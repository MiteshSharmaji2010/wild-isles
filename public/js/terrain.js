// ============================================================
// WILD ISLES
// VEYRA ISLAND
// TERRAIN SYSTEM v0.2
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class VeyraTerrain {

    constructor(scene) {

        this.scene = scene;

        this.size = 900;
        this.segments = 180;

        this.mesh = null;

        this.create();
    }

    // ========================================================
    // TERRAIN HEIGHT
    // ========================================================

    getHeight(x, z) {

        const distance =
            Math.sqrt(
                x * x +
                z * z
            );

        // ----------------------------------------------------
        // ISLAND SHAPE
        // ----------------------------------------------------

        const islandShape =
            Math.max(
                0,
                1 - distance / 430
            );

        // ----------------------------------------------------
        // LARGE HILLS
        // ----------------------------------------------------

        const large =
            Math.sin(x * 0.012) *
            Math.cos(z * 0.010) *
            22;

        // ----------------------------------------------------
        // MEDIUM TERRAIN
        // ----------------------------------------------------

        const medium =
            Math.sin(
                x * 0.035 + 2.0
            ) *
            Math.cos(
                z * 0.028
            ) *
            8;

        // ----------------------------------------------------
        // SMALL DETAIL
        // ----------------------------------------------------

        const small =
            Math.sin(x * 0.09) *
            Math.cos(z * 0.075) *
            2.5;

        let height =
            (
                large +
                medium +
                small
            ) * islandShape;

        // ----------------------------------------------------
        // CENTRAL MOUNTAIN
        // ----------------------------------------------------

        const mountainDistance =
            Math.sqrt(
                Math.pow(x + 80, 2) +
                Math.pow(z + 40, 2)
            );

        if (mountainDistance < 170) {

            const mountainFactor =
                1 -
                mountainDistance / 170;

            height +=
                Math.pow(
                    Math.max(
                        0,
                        mountainFactor
                    ),
                    2
                ) * 95;
        }

        // ----------------------------------------------------
        // SECONDARY HILLS
        // ----------------------------------------------------

        const hillDistance =
            Math.sqrt(
                Math.pow(x - 190, 2) +
                Math.pow(z + 120, 2)
            );

        if (hillDistance < 120) {

            const hillFactor =
                1 -
                hillDistance / 120;

            height +=
                Math.pow(
                    Math.max(
                        0,
                        hillFactor
                    ),
                    2
                ) * 35;
        }

        // ----------------------------------------------------
        // COAST
        // ----------------------------------------------------

        if (distance > 300) {

            const coastFactor =
                Math.min(
                    1,
                    (distance - 300) / 130
                );

            height -=
                coastFactor * 24;
        }

        // ----------------------------------------------------
        // BEACH FLATTENING
        // ----------------------------------------------------

        if (distance > 330) {

            const beachFactor =
                Math.min(
                    1,
                    (distance - 330) / 55
                );

            height =
                height *
                (1 - beachFactor * 0.65);

            height -=
                beachFactor * 2;
        }

        return height;
    }

    // ========================================================
    // CREATE TERRAIN
    // ========================================================

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

        // ----------------------------------------------------
        // MODIFY VERTICES
        // ----------------------------------------------------

        for (
            let i = 0;
            i < position.count;
            i++
        ) {

            const x =
                position.getX(i);

            const z =
                position.getY(i);

            const height =
                this.getHeight(
                    x,
                    z
                );

            position.setZ(
                i,
                height
            );
        }

        // ----------------------------------------------------
        // ROTATE INTO WORLD
        // ----------------------------------------------------

        geometry.rotateX(
            -Math.PI / 2
        );

        geometry.computeVertexNormals();

        // ----------------------------------------------------
        // TERRAIN MATERIAL
        // ----------------------------------------------------

        const material =
            new THREE.MeshStandardMaterial({

                color: 0x536b43,

                roughness: 0.96,

                metalness: 0.0,

                flatShading: false
            });

        // ----------------------------------------------------
        // MESH
        // ----------------------------------------------------

        this.mesh =
            new THREE.Mesh(
                geometry,
                material
            );

        this.mesh.receiveShadow =
            true;

        this.mesh.castShadow =
            true;

        this.scene.add(
            this.mesh
        );

        console.log(
            "Veyra Island terrain created."
        );
    }
}
