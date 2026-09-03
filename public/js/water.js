// ============================================================
// WILD ISLES
// VEYRA ISLAND
// WATER SYSTEM v0.2
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class VeyraWater {

    constructor(scene) {

        this.scene = scene;

        this.ocean = null;
        this.shallowWater = null;
        this.beach = null;
        this.rocks = [];

        this.createOcean();
        this.createShallowWater();
        this.createBeach();
        this.createCoastRocks();

        console.log(
            "Veyra Water System: READY"
        );
    }

    // ========================================================
    // OCEAN
    // ========================================================

    createOcean() {

        const geometry =
            new THREE.PlaneGeometry(
                3000,
                3000,
                1,
                1
            );

        geometry.rotateX(
            -Math.PI / 2
        );

        const material =
            new THREE.MeshStandardMaterial({

                color: 0x245c68,

                roughness: 0.16,

                metalness: 0.03,

                transparent: true,

                opacity: 0.88,

                side: THREE.DoubleSide
            });

        this.ocean =
            new THREE.Mesh(
                geometry,
                material
            );

        this.ocean.position.y =
            1.8;

        this.ocean.receiveShadow =
            true;

        this.scene.add(
            this.ocean
        );
    }

    // ========================================================
    // SHALLOW WATER
    // ========================================================

    createShallowWater() {

        const geometry =
            new THREE.RingGeometry(
                338,
                465,
                128
            );

        geometry.rotateX(
            -Math.PI / 2
        );

        const material =
            new THREE.MeshStandardMaterial({

                color: 0x57999a,

                roughness: 0.24,

                metalness: 0,

                transparent: true,

                opacity: 0.48,

                side: THREE.DoubleSide
            });

        this.shallowWater =
            new THREE.Mesh(
                geometry,
                material
            );

        this.shallowWater.position.y =
            2.5;

        this.scene.add(
            this.shallowWater
        );
    }

    // ========================================================
    // BEACH
    // ========================================================

    createBeach() {

        const geometry =
            new THREE.RingGeometry(
                325,
                390,
                128
            );

        geometry.rotateX(
            -Math.PI / 2
        );

        const material =
            new THREE.MeshStandardMaterial({

                color: 0xbca875,

                roughness: 1.0,

                metalness: 0.0,

                side: THREE.DoubleSide
            });

        this.beach =
            new THREE.Mesh(
                geometry,
                material
            );

        this.beach.position.y =
            1.6;

        this.beach.receiveShadow =
            true;

        this.scene.add(
            this.beach
        );
    }

    // ========================================================
    // COAST ROCKS
    // ========================================================

    createCoastRocks() {

        const rockMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x4a514b,

                roughness: 0.95,

                metalness: 0.0
            });

        const rockCount = 65;

        for (
            let i = 0;
            i < rockCount;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;

            const radius =
                315 +
                Math.random() * 75;

            const x =
                Math.cos(angle) *
                radius;

            const z =
                Math.sin(angle) *
                radius;

            const size =
                1.5 +
                Math.random() * 5;

            const geometry =
                new THREE.DodecahedronGeometry(
                    size,
                    0
                );

            const rock =
                new THREE.Mesh(
                    geometry,
                    rockMaterial
                );

            rock.position.set(
                x,
                1.5 +
                Math.random() * 3,
                z
            );

            rock.rotation.set(
                Math.random() * 0.6,
                Math.random() * Math.PI,
                Math.random() * 0.6
            );

            rock.scale.y =
                0.55 +
                Math.random() * 0.6;

            rock.castShadow =
                true;

            rock.receiveShadow =
                true;

            this.scene.add(
                rock
            );

            this.rocks.push(
                rock
            );
        }
    }

    // ========================================================
    // WATER UPDATE
    // ========================================================

    update(
        delta,
        elapsedTime
    ) {

        if (!this.ocean) {
            return;
        }

        const wave =
            Math.sin(
                elapsedTime * 0.35
            ) * 0.08;

        this.ocean.position.y =
            1.8 + wave;

        if (this.shallowWater) {

            this.shallowWater.position.y =
                2.5 +
                wave * 0.5;
        }
    }
}
