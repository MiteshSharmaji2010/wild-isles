// ============================================================
// WILD ISLES
// VEYRA ISLAND
// ENVIRONMENT SYSTEM v0.1
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class VeyraEnvironment {

    constructor(scene, terrain) {

        this.scene = scene;
        this.terrain = terrain;

        this.trees = [];
        this.rocks = [];
        this.grass = [];

        this.treeGroup = new THREE.Group();
        this.rockGroup = new THREE.Group();
        this.grassGroup = new THREE.Group();

        this.scene.add(this.treeGroup);
        this.scene.add(this.rockGroup);
        this.scene.add(this.grassGroup);

        this.createForest();
        this.createRocks();
        this.createGrass();

        console.log("Veyra Environment: READY");
    }

    // ========================================================
    // TREE
    // ========================================================

    createTree(x, z, scale = 1) {

        const group = new THREE.Group();

        const trunkMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x5b4028,
                roughness: 1
            });

        const leafMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x294b2c,
                roughness: 0.95
            });

        // ----------------------------------------------------
        // TRUNK
        // ----------------------------------------------------

        const trunkGeometry =
            new THREE.CylinderGeometry(
                0.45,
                0.65,
                5,
                7
            );

        const trunk =
            new THREE.Mesh(
                trunkGeometry,
                trunkMaterial
            );

        trunk.position.y = 2.5;

        trunk.castShadow = true;
        trunk.receiveShadow = true;

        group.add(trunk);

        // ----------------------------------------------------
        // LOWER FOLIAGE
        // ----------------------------------------------------

        const lowerGeometry =
            new THREE.SphereGeometry(
                2.5,
                8,
                6
            );

        const lower =
            new THREE.Mesh(
                lowerGeometry,
                leafMaterial
            );

        lower.position.y = 5.2;

        lower.scale.set(
            1.15,
            1.0,
            1.15
        );

        lower.castShadow = true;

        group.add(lower);

        // ----------------------------------------------------
        // UPPER FOLIAGE
        // ----------------------------------------------------

        const upperGeometry =
            new THREE.SphereGeometry(
                2.0,
                8,
                6
            );

        const upper =
            new THREE.Mesh(
                upperGeometry,
                leafMaterial
            );

        upper.position.y = 7.1;

        upper.scale.set(
            1.05,
            1.1,
            1.05
        );

        upper.castShadow = true;

        group.add(upper);

        // ----------------------------------------------------
        // POSITION
        // ----------------------------------------------------

        const height =
            this.terrain.getHeight(
                x,
                z
            );

        group.position.set(
            x,
            height,
            z
        );

        group.scale.setScalar(
            scale
        );

        group.rotation.y =
            Math.random() *
            Math.PI *
            2;

        this.treeGroup.add(group);

        this.trees.push(group);
    }

    // ========================================================
    // FOREST
    // ========================================================

    createForest() {

        const count = 280;

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;

            // Keep trees away from very center
            // and away from beach.

            const radius =
                75 +
                Math.random() *
                235;

            const x =
                Math.cos(angle) *
                radius;

            const z =
                Math.sin(angle) *
                radius;

            const distance =
                Math.sqrt(
                    x * x +
                    z * z
                );

            if (
                distance < 55 ||
                distance > 305
            ) {
                continue;
            }

            const height =
                this.terrain.getHeight(
                    x,
                    z
                );

            // Avoid very high mountain areas.

            if (height > 65) {
                continue;
            }

            const scale =
                0.75 +
                Math.random() *
                0.65;

            this.createTree(
                x,
                z,
                scale
            );
        }
    }

    // ========================================================
    // ROCK
    // ========================================================

    createRock(x, z, scale = 1) {

        const material =
            new THREE.MeshStandardMaterial({
                color: 0x555851,
                roughness: 1,
                metalness: 0
            });

        const geometry =
            new THREE.DodecahedronGeometry(
                1.8,
                0
            );

        const rock =
            new THREE.Mesh(
                geometry,
                material
            );

        const height =
            this.terrain.getHeight(
                x,
                z
            );

        rock.position.set(
            x,
            height + 0.8,
            z
        );

        rock.scale.set(
            scale * 1.4,
            scale,
            scale * 1.15
        );

        rock.rotation.set(
            Math.random(),
            Math.random() * Math.PI,
            Math.random()
        );

        rock.castShadow = true;
        rock.receiveShadow = true;

        this.rockGroup.add(rock);

        this.rocks.push(rock);
    }

    // ========================================================
    // ROCK FIELD
    // ========================================================

    createRocks() {

        const count = 120;

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;

            const radius =
                70 +
                Math.random() *
                240;

            const x =
                Math.cos(angle) *
                radius;

            const z =
                Math.sin(angle) *
                radius;

            const distance =
                Math.sqrt(
                    x * x +
                    z * z
                );

            if (
                distance > 305
            ) {
                continue;
            }

            const height =
                this.terrain.getHeight(
                    x,
                    z
                );

            if (height > 85) {
                continue;
            }

            this.createRock(
                x,
                z,
                0.45 +
                Math.random() * 1.3
            );
        }
    }

    // ========================================================
    // GRASS PATCH
    // ========================================================

    createGrassPatch(
        x,
        z,
        scale = 1
    ) {

        const material =
            new THREE.MeshStandardMaterial({
                color: 0x547342,
                roughness: 1,
                side: THREE.DoubleSide
            });

        const geometry =
            new THREE.ConeGeometry(
                0.7,
                2.2,
                4
            );

        const grass =
            new THREE.Mesh(
                geometry,
                material
            );

        const height =
            this.terrain.getHeight(
                x,
                z
            );

        grass.position.set(
            x,
            height + 1,
            z
        );

        grass.scale.setScalar(
            scale
        );

        grass.rotation.y =
            Math.random() *
            Math.PI;

        this.grassGroup.add(grass);

        this.grass.push(grass);
    }

    // ========================================================
    // GRASS
    // ========================================================

    createGrass() {

        const count = 450;

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;

            const radius =
                40 +
                Math.random() *
                270;

            const x =
                Math.cos(angle) *
                radius;

            const z =
                Math.sin(angle) *
                radius;

            const distance =
                Math.sqrt(
                    x * x +
                    z * z
                );

            if (
                distance > 300
            ) {
                continue;
            }

            const height =
                this.terrain.getHeight(
                    x,
                    z
                );

            if (
                height < 2 ||
                height > 75
            ) {
                continue;
            }

            this.createGrassPatch(
                x,
                z,
                0.35 +
                Math.random() * 0.55
            );
        }
    }

    // ========================================================
    // UPDATE
    // ========================================================

    update(
        delta,
        elapsedTime
    ) {

        // Lightweight environment update.
        // Detailed wind animation will be added later.
    }
}
