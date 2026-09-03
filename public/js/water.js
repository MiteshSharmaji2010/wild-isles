// ============================================================
// WILD ISLES
// VEYRA ISLAND
// WATER SYSTEM v0.1
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class VeyraWater {

    constructor(scene) {

        this.scene = scene;

        this.ocean = null;
        this.shallowWater = null;

        this.createOcean();
        this.createShallowWater();

        console.log("Veyra Water System: READY");
    }

    // ========================================================
    // OCEAN
    // ========================================================

    createOcean() {

        const geometry = new THREE.PlaneGeometry(
            3000,
            3000,
            1,
            1
        );

        geometry.rotateX(-Math.PI / 2);

        const material = new THREE.MeshStandardMaterial({
            color: 0x245b68,
            roughness: 0.18,
            metalness: 0.05,
            transparent: true,
            opacity: 0.88
        });

        this.ocean = new THREE.Mesh(
            geometry,
            material
        );

        // Sea level
        this.ocean.position.y = 2;

        this.ocean.receiveShadow = true;

        this.scene.add(
            this.ocean
        );
    }

    // ========================================================
    // SHALLOW WATER
    // ========================================================

    createShallowWater() {

        const geometry = new THREE.RingGeometry(
            340,
            470,
            128
        );

        geometry.rotateX(-Math.PI / 2);

        const material = new THREE.MeshStandardMaterial({
            color: 0x4d8f91,
            roughness: 0.25,
            metalness: 0.0,
            transparent: true,
            opacity: 0.42,
            side: THREE.DoubleSide
        });

        this.shallowWater = new THREE.Mesh(
            geometry,
            material
        );

        this.shallowWater.position.y = 2.8;

        this.scene.add(
            this.shallowWater
        );
    }

    // ========================================================
    // UPDATE
    // ========================================================

    update(delta, elapsedTime) {

        if (!this.ocean) {
            return;
        }

        // Very subtle water movement.
        // We keep it lightweight for mobile performance.

        const wave =
            Math.sin(elapsedTime * 0.35) * 0.08;

        this.ocean.position.y =
            2 + wave;

        if (this.shallowWater) {

            this.shallowWater.position.y =
                2.8 + wave * 0.5;
        }
    }
}
