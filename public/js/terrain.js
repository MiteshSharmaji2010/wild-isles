// ============================================================
// WILD ISLES
// VEYRA ISLAND
// TERRAIN SYSTEM v0.4
// REALISTIC TERRAIN + HEIGHT/SLOPE DATA
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class VeyraTerrain {

    constructor(scene) {

        this.scene = scene;

        this.size = 900;
        this.segments = 220;

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

        const islandShape =
            Math.max(
                0,
                1 - distance / 430
            );

        // Large natural terrain
        const large =
            Math.sin(x * 0.011) *
            Math.cos(z * 0.010) *
            18;

        // Medium terrain
        const medium =
            Math.sin(x * 0.032 + 1.7) *
            Math.cos(z * 0.026) *
            7;

        // Small detail
        const small =
            Math.sin(x * 0.075 + z * 0.02) *
            Math.cos(z * 0.085) *
            2.0;

        let height =
            (large + medium + small) *
            islandShape;

        // ----------------------------------------------------
        // MAIN MOUNTAIN
        // ----------------------------------------------------

        const mountainDistance =
            Math.sqrt(
                Math.pow(x + 80, 2) +
                Math.pow(z + 40, 2)
            );

        if (mountainDistance < 175) {

            const factor =
                1 -
                mountainDistance / 175;

            height +=
                Math.pow(
                    Math.max(0, factor),
                    2.2
                ) * 105;
        }

        // ----------------------------------------------------
        // SECONDARY HILLS
        // ----------------------------------------------------

        const hillDistance =
            Math.sqrt(
                Math.pow(x - 190, 2) +
                Math.pow(z + 120, 2)
            );

        if (hillDistance < 125) {

            const factor =
                1 -
                hillDistance / 125;

            height +=
                Math.pow(
                    Math.max(0, factor),
                    2
                ) * 38;
        }

        // ----------------------------------------------------
        // COAST
        // ----------------------------------------------------

        if (distance > 295) {

            const coastFactor =
                Math.min(
                    1,
                    (distance - 295) / 135
                );

            height -=
                coastFactor * 24;
        }

        if (distance > 330) {

            const beachFactor =
                Math.min(
                    1,
                    (distance - 330) / 55
                );

            height *=
                1 -
                beachFactor * 0.65;

            height -=
                beachFactor * 2;
        }

        return height;
    }

    // ========================================================
    // HEIGHT AT PLAYER POSITION
    // ========================================================

    getGroundHeight(x, z) {

        return this.getHeight(
            x,
            z
        );
    }

    // ========================================================
    // TERRAIN NORMAL
    // ========================================================

    getNormal(x, z) {

        const sample = 0.8;

        const left =
            this.getHeight(
                x - sample,
                z
            );

        const right =
            this.getHeight(
                x + sample,
                z
            );

        const back =
            this.getHeight(
                x,
                z - sample
            );

        const front =
            this.getHeight(
                x,
                z + sample
            );

        const normal =
            new THREE.Vector3(
                left - right,
                sample * 2,
                back - front
            );

        normal.normalize();

        return normal;
    }

    // ========================================================
    // SLOPE ANGLE
    // ========================================================

    getSlopeAngle(x, z) {

        const normal =
            this.getNormal(
                x,
                z
            );

        const up =
            new THREE.Vector3(
                0,
                1,
                0
            );

        const dot =
            THREE.MathUtils.clamp(
                normal.dot(up),
                -1,
                1
            );

        return Math.acos(dot);
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
        // HEIGHT MAP
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

        geometry.rotateX(
            -Math.PI / 2
        );

        geometry.computeVertexNormals();

        // ----------------------------------------------------
        // TERRAIN MATERIAL
        // ----------------------------------------------------

        const material =
            new THREE.MeshStandardMaterial({
                color: 0x526b42,
                roughness: 0.97,
                metalness: 0,
                flatShading: false
            });

        this.mesh =
            new THREE.Mesh(
                geometry,
                material
            );

        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;

        this.scene.add(
            this.mesh
        );

        console.log(
            "Veyra Terrain v0.4 READY"
        );
    }
}
