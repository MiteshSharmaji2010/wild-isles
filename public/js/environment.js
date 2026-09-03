// ============================================================
// WILD ISLES
// VEYRA ISLAND
// ENVIRONMENT SYSTEM v0.5
// REALISTIC VEGETATION + ROCKS + BUSHES
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class VeyraEnvironment {

    constructor(scene, terrain) {

        this.scene = scene;
        this.terrain = terrain;

        // ----------------------------------------------------
        // GROUPS
        // ----------------------------------------------------

        this.worldGroup =
            new THREE.Group();

        this.treeGroup =
            new THREE.Group();

        this.bushGroup =
            new THREE.Group();

        this.rockGroup =
            new THREE.Group();

        this.grassGroup =
            new THREE.Group();

        this.worldGroup.add(
            this.treeGroup
        );

        this.worldGroup.add(
            this.bushGroup
        );

        this.worldGroup.add(
            this.rockGroup
        );

        this.worldGroup.add(
            this.grassGroup
        );

        this.scene.add(
            this.worldGroup
        );

        // ----------------------------------------------------
        // ARRAYS
        // ----------------------------------------------------

        this.trees = [];
        this.bushes = [];
        this.rocks = [];
        this.grass = [];

        // ----------------------------------------------------
        // SHARED MATERIALS
        // ----------------------------------------------------

        this.createMaterials();

        // ----------------------------------------------------
        // SHARED GEOMETRIES
        // ----------------------------------------------------

        this.createGeometries();

        // ----------------------------------------------------
        // WORLD
        // ----------------------------------------------------

        this.createForest();
        this.createBushes();
        this.createRocks();
        this.createGrass();

        console.log(
            "Veyra Environment v0.5 READY"
        );
    }

    // ========================================================
    // MATERIALS
    // ========================================================

    createMaterials() {

        this.trunkMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x493525,
                roughness: 0.98,
                metalness: 0
            });

        this.branchMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x3c2b20,
                roughness: 1
            });

        this.leafMaterials = [

            new THREE.MeshStandardMaterial({
                color: 0x24452a,
                roughness: 0.96
            }),

            new THREE.MeshStandardMaterial({
                color: 0x315934,
                roughness: 0.96
            }),

            new THREE.MeshStandardMaterial({
                color: 0x3b6538,
                roughness: 0.96
            }),

            new THREE.MeshStandardMaterial({
                color: 0x294d30,
                roughness: 0.96
            })
        ];

        this.bushMaterials = [

            new THREE.MeshStandardMaterial({
                color: 0x315532,
                roughness: 1
            }),

            new THREE.MeshStandardMaterial({
                color: 0x42683a,
                roughness: 1
            }),

            new THREE.MeshStandardMaterial({
                color: 0x52753d,
                roughness: 1
            })
        ];

        this.grassMaterials = [

            new THREE.MeshStandardMaterial({
                color: 0x4e713d,
                roughness: 1,
                side: THREE.DoubleSide
            }),

            new THREE.MeshStandardMaterial({
                color: 0x648548,
                roughness: 1,
                side: THREE.DoubleSide
            }),

            new THREE.MeshStandardMaterial({
                color: 0x3d6337,
                roughness: 1,
                side: THREE.DoubleSide
            })
        ];

        this.rockMaterials = [

            new THREE.MeshStandardMaterial({
                color: 0x555954,
                roughness: 1
            }),

            new THREE.MeshStandardMaterial({
                color: 0x666762,
                roughness: 0.98
            }),

            new THREE.MeshStandardMaterial({
                color: 0x484c48,
                roughness: 1
            })
        ];
    }

    // ========================================================
    // GEOMETRIES
    // ========================================================

    createGeometries() {

        this.trunkGeometry =
            new THREE.CylinderGeometry(
                0.38,
                0.62,
                4.8,
                8
            );

        this.branchGeometry =
            new THREE.CylinderGeometry(
                0.12,
                0.20,
                2.2,
                6
            );

        this.leafGeometry =
            new THREE.IcosahedronGeometry(
                2.3,
                1
            );

        this.leafSmallGeometry =
            new THREE.IcosahedronGeometry(
                1.65,
                1
            );

        this.bushGeometry =
            new THREE.IcosahedronGeometry(
                1.25,
                1
            );

        this.grassGeometry =
            new THREE.ConeGeometry(
                0.55,
                2.0,
                5
            );

        this.rockGeometries = [

            new THREE.DodecahedronGeometry(
                1.5,
                1
            ),

            new THREE.IcosahedronGeometry(
                1.5,
                1
            ),

            new THREE.DodecahedronGeometry(
                1.2,
                1
            )
        ];
    }

    // ========================================================
    // RANDOM
    // ========================================================

    random(min, max) {

        return min +
            Math.random() *
            (max - min);
    }

    // ========================================================
    // TREE
    // ========================================================

    createTree(
        x,
        z,
        scale = 1
    ) {

        const group =
            new THREE.Group();

        // ----------------------------------------------------
        // TRUNK
        // ----------------------------------------------------

        const trunk =
            new THREE.Mesh(
                this.trunkGeometry,
                this.trunkMaterial
            );

        trunk.position.y =
            2.4;

        trunk.scale.set(
            1,
            this.random(
                0.9,
                1.25
            ),
            1
        );

        trunk.rotation.z =
            this.random(
                -0.035,
                0.035
            );

        trunk.castShadow = true;
        trunk.receiveShadow = true;

        group.add(
            trunk
        );

        // ----------------------------------------------------
        // MAIN FOLIAGE
        // ----------------------------------------------------

        const leafMaterial =
            this.leafMaterials[
                Math.floor(
                    Math.random() *
                    this.leafMaterials.length
                )
            ];

        const lower =
            new THREE.Mesh(
                this.leafGeometry,
                leafMaterial
            );

        lower.position.y =
            5.0;

        lower.scale.set(
            this.random(0.9, 1.25),
            this.random(0.9, 1.2),
            this.random(0.9, 1.25)
        );

        lower.rotation.y =
            Math.random() *
            Math.PI;

        lower.castShadow = true;
        lower.receiveShadow = true;

        group.add(
            lower
        );

        // ----------------------------------------------------
        // UPPER FOLIAGE
        // ----------------------------------------------------

        const upper =
            new THREE.Mesh(
                this.leafSmallGeometry,
                leafMaterial
            );

        upper.position.y =
            7.0;

        upper.scale.set(
            this.random(0.85, 1.15),
            this.random(0.9, 1.25),
            this.random(0.85, 1.15)
        );

        upper.rotation.y =
            Math.random() *
            Math.PI;

        upper.castShadow = true;

        group.add(
            upper
        );

        // ----------------------------------------------------
        // SMALL SIDE BRANCH
        // ----------------------------------------------------

        if (Math.random() > 0.45) {

            const branch =
                new THREE.Mesh(
                    this.branchGeometry,
                    this.branchMaterial
                );

            branch.position.set(
                this.random(
                    -0.55,
                    0.55
                ),
                4.0,
                this.random(
                    -0.35,
                    0.35
                )
            );

            branch.rotation.z =
                this.random(
                    -0.8,
                    0.8
                );

            branch.rotation.x =
                this.random(
                    -0.5,
                    0.5
                );

            branch.castShadow =
                true;

            group.add(
                branch
            );
        }

        // ----------------------------------------------------
        // POSITION
        // ----------------------------------------------------

        const height =
            this.terrain.getGroundHeight(
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

        this.treeGroup.add(
            group
        );

        this.trees.push(
            group
        );
    }

    // ========================================================
    // FOREST
    // ========================================================

    createForest() {

        const count = 360;

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
                this.random(
                    55,
                    295
                );

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
                distance < 48 ||
                distance > 302
            ) {
                continue;
            }

            const height =
                this.terrain.getGroundHeight(
                    x,
                    z
                );

            // Don't cover high mountains
            if (height > 68) {
                continue;
            }

            // Don't place trees on steep slopes
            const slope =
                this.terrain.getSlopeAngle(
                    x,
                    z
                );

            if (
                slope >
                THREE.MathUtils.degToRad(35)
            ) {
                continue;
            }

            // Coast vegetation reduction
            if (
                distance > 275 &&
                Math.random() < 0.7
            ) {
                continue;
            }

            const scale =
                this.random(
                    0.72,
                    1.45
                );

            this.createTree(
                x,
                z,
                scale
            );
        }
    }

    // ========================================================
    // BUSH
    // ========================================================

    createBush(
        x,
        z,
        scale = 1
    ) {

        const group =
            new THREE.Group();

        const material =
            this.bushMaterials[
                Math.floor(
                    Math.random() *
                    this.bushMaterials.length
                )
            ];

        const bush =
            new THREE.Mesh(
                this.bushGeometry,
                material
            );

        bush.position.y =
            0.75;

        bush.scale.set(
            this.random(1.0, 1.5),
            this.random(0.65, 1.0),
            this.random(0.9, 1.4)
        );

        bush.castShadow = true;
        bush.receiveShadow = true;

        group.add(
            bush
        );

        // Small second part
        if (Math.random() > 0.35) {

            const small =
                new THREE.Mesh(
                    this.bushGeometry,
                    material
                );

            small.position.set(
                this.random(
                    -0.7,
                    0.7
                ),
                0.55,
                this.random(
                    -0.6,
                    0.6
                )
            );

            small.scale.setScalar(
                this.random(
                    0.45,
                    0.75
                )
            );

            small.castShadow =
                true;

            group.add(
                small
            );
        }

        const height =
            this.terrain.getGroundHeight(
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

        this.bushGroup.add(
            group
        );

        this.bushes.push(
            group
        );
    }

    // ========================================================
    // BUSHES
    // ========================================================

    createBushes() {

        const count = 300;

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
                this.random(
                    45,
                    300
                );

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
                distance < 40 ||
                distance > 305
            ) {
                continue;
            }

            const height =
                this.terrain.getGroundHeight(
                    x,
                    z
                );

            if (
                height > 70 ||
                height < 1
            ) {
                continue;
            }

            const slope =
                this.terrain.getSlopeAngle(
                    x,
                    z
                );

            if (
                slope >
                THREE.MathUtils.degToRad(38)
            ) {
                continue;
            }

            this.createBush(
                x,
                z,
                this.random(
                    0.55,
                    1.15
                )
            );
        }
    }

    // ========================================================
    // ROCK
    // ========================================================

    createRock(
        x,
        z,
        scale = 1
    ) {

        const index =
            Math.floor(
                Math.random() *
                this.rockGeometries.length
            );

        const geometry =
            this.rockGeometries[
                index
            ];

        const material =
            this.rockMaterials[
                Math.floor(
                    Math.random() *
                    this.rockMaterials.length
                )
            ];

        const rock =
            new THREE.Mesh(
                geometry,
                material
            );

        const height =
            this.terrain.getGroundHeight(
                x,
                z
            );

        rock.position.set(
            x,
            height +
                0.5 *
                scale,
            z
        );

        rock.scale.set(
            scale *
                this.random(
                    1.0,
                    1.5
                ),

            scale *
                this.random(
                    0.65,
                    1.1
                ),

            scale *
                this.random(
                    0.9,
                    1.35
                )
        );

        rock.rotation.set(
            this.random(
                -0.2,
                0.2
            ),

            Math.random() *
            Math.PI,

            this.random(
                -0.2,
                0.2
            )
        );

        rock.castShadow = true;
        rock.receiveShadow = true;

        this.rockGroup.add(
            rock
        );

        this.rocks.push(
            rock
        );
    }

    // ========================================================
    // ROCKS
    // ========================================================

    createRocks() {

        const count = 170;

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
                this.random(
                    60,
                    320
                );

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
                distance > 325
            ) {
                continue;
            }

            const height =
                this.terrain.getGroundHeight(
                    x,
                    z
                );

            if (
                height > 105
            ) {
                continue;
            }

            this.createRock(
                x,
                z,
                this.random(
                    0.35,
                    1.8
                )
            );
        }
    }

    // ========================================================
    // GRASS
    // ========================================================

    createGrassBlade(
        x,
        z,
        scale = 1
    ) {

        const material =
            this.grassMaterials[
                Math.floor(
                    Math.random() *
                    this.grassMaterials.length
                )
            ];

        const grass =
            new THREE.Mesh(
                this.grassGeometry,
                material
            );

        const height =
            this.terrain.getGroundHeight(
                x,
                z
            );

        grass.position.set(
            x,
            height +
                0.75 *
                scale,
            z
        );

        grass.scale.set(
            scale *
                this.random(
                    0.65,
                    1.2
                ),

            scale *
                this.random(
                    0.7,
                    1.3
                ),

            scale *
                this.random(
                    0.65,
                    1.2
                )
        );

        grass.rotation.y =
            Math.random() *
            Math.PI;

        grass.castShadow = false;
        grass.receiveShadow = true;

        this.grassGroup.add(
            grass
        );

        this.grass.push(
            grass
        );
    }

    // ========================================================
    // GRASS
    // ========================================================

    createGrass() {

        const count = 850;

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
                this.random(
                    35,
                    295
                );

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
                this.terrain.getGroundHeight(
                    x,
                    z
                );

            if (
                height < 2 ||
                height > 75
            ) {
                continue;
            }

            const slope =
                this.terrain.getSlopeAngle(
                    x,
                    z
                );

            if (
                slope >
                THREE.MathUtils.degToRad(42)
            ) {
                continue;
            }

            this.createGrassBlade(
                x,
                z,
                this.random(
                    0.3,
                    0.8
                )
            );
        }
    }

    // ========================================================
    // WIND
    // ========================================================

    update(
        delta,
        elapsedTime
    ) {

        if (
            !this.grass ||
            this.grass.length === 0
        ) {
            return;
        }

        // Very light wind animation
        // Only rotates objects slightly,
        // keeping performance reasonable.

        const wind =
            Math.sin(
                elapsedTime * 1.2
            ) * 0.025;

        for (
            let i = 0;
            i < this.grass.length;
            i++
        ) {

            const grass =
                this.grass[i];

            grass.rotation.z =
                wind *
                Math.sin(
                    i * 0.7
                );
        }

        // Trees move very slightly.
        // No heavy animation.

        const treeWind =
            Math.sin(
                elapsedTime * 0.35
            ) * 0.008;

        for (
            let i = 0;
            i < this.trees.length;
            i++
        ) {

            const tree =
                this.trees[i];

            tree.rotation.z =
                treeWind *
                Math.sin(
                    i * 0.35
                );
        }
    }
}
