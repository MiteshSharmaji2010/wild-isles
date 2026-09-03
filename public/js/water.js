// ============================================================
// WILD ISLES
// public/js/water.js
// Veyra Island - Realistic Water System v0.7
// ============================================================

import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class VeyraWater {

    constructor(scene) {

        this.scene = scene;

        this.waterLevel = 1.8;

        this.size = 1000;

        this.time = 0;

        this.waveHeight = 0.12;

        this.waveSpeed = 0.35;

        this.waterMesh = null;
        this.shoreMesh = null;

        this.createWater();
        this.createShoreline();

        console.log("Veyra Water v0.7 READY");
    }


    // ========================================================
    // MAIN WATER
    // ========================================================

    createWater() {

        const geometry = new THREE.PlaneGeometry(
            this.size,
            this.size,
            120,
            120
        );

        geometry.rotateX(-Math.PI / 2);

        const material = new THREE.MeshStandardMaterial({

            color: 0x245f68,

            roughness: 0.15,

            metalness: 0.05,

            transparent: true,

            opacity: 0.82,

            side: THREE.DoubleSide
        });

        this.waterMesh = new THREE.Mesh(
            geometry,
            material
        );

        this.waterMesh.position.y = this.waterLevel;

        this.waterMesh.receiveShadow = true;

        this.scene.add(this.waterMesh);

        this.waterGeometry = geometry;

        this.originalPositions =
            geometry.attributes.position.array.slice();
    }


    // ========================================================
    // SHORELINE
    // ========================================================

    createShoreline() {

        const geometry = new THREE.RingGeometry(
            390,
            465,
            160
        );

        geometry.rotateX(-Math.PI / 2);

        const material = new THREE.MeshStandardMaterial({

            color: 0xc8b889,

            roughness: 1.0,

            metalness: 0,

            transparent: true,

            opacity: 0.65,

            side: THREE.DoubleSide
        });

        this.shoreMesh = new THREE.Mesh(
            geometry,
            material
        );

        this.shoreMesh.position.y =
            this.waterLevel - 0.03;

        this.scene.add(this.shoreMesh);
    }


    // ========================================================
    // WATER ANIMATION
    // ========================================================

    update(deltaTime, elapsedTime) {

        if (!this.waterMesh) return;

        this.time += deltaTime || 0.016;

        const geometry = this.waterGeometry;

        const position =
            geometry.attributes.position;

        const original =
            this.originalPositions;

        for (
            let i = 0;
            i < position.count;
            i++
        ) {

            const x = original[i * 3];

            const z = original[i * 3 + 2];

            const wave1 =
                Math.sin(
                    x * 0.035 +
                    this.time * this.waveSpeed
                ) * this.waveHeight;

            const wave2 =
                Math.cos(
                    z * 0.045 +
                    this.time * this.waveSpeed * 0.8
                ) * this.waveHeight * 0.65;

            const wave3 =
                Math.sin(
                    (x + z) * 0.018 +
                    this.time * 0.25
                ) * 0.06;

            position.setY(
                i,
                wave1 + wave2 + wave3
            );
        }

        position.needsUpdate = true;

        geometry.computeVertexNormals();


        // ====================================================
        // SUBTLE WATER MATERIAL ANIMATION
        // ====================================================

        if (this.waterMesh.material) {

            this.waterMesh.material.opacity =
                0.78 +
                Math.sin(this.time * 0.5) * 0.025;
        }
    }


    // ========================================================
    // WATER HEIGHT
    // ========================================================

    getWaterLevel() {

        return this.waterLevel;
    }


    // ========================================================
    // CHECK WATER
    // ========================================================

    isWater(x, z) {

        const distance =
            Math.sqrt(
                x * x +
                z * z
            );

        return distance > 410;
    }


    // ========================================================
    // CLEANUP
    // ========================================================

    dispose() {

        if (this.waterMesh) {

            this.waterMesh.geometry.dispose();

            this.waterMesh.material.dispose();

            this.scene.remove(
                this.waterMesh
            );

            this.waterMesh = null;
        }

        if (this.shoreMesh) {

            this.shoreMesh.geometry.dispose();

            this.shoreMesh.material.dispose();

            this.scene.remove(
                this.shoreMesh
            );

            this.shoreMesh = null;
        }
    }
}
