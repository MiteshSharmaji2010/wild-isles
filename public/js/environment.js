// ============================================================
// WILD ISLES
// VEYRA ISLAND
// ENVIRONMENT SYSTEM v0.6
//
// Forest
// Trees
// Bushes
// Rocks
// Grass
// Biome-aware placement
// Water-safe placement
// Mountain-aware placement
// Performance optimized
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class VeyraEnvironment {

    constructor(scene, terrain) {

        this.scene = scene;
        this.terrain = terrain;

        // ====================================================
        // WORLD SETTINGS
        // ====================================================

        this.worldSize = 820;

        this.waterLevel = 1.8;

        this.beachLevel = 5.5;

        this.minTreeHeight = 5.5;

        this.maxTreeSlope = 28;

        this.maxBushSlope = 34;

        this.maxRockSlope = 52;

        // ====================================================
        // OBJECT COUNTS
        // ====================================================

        this.treeCount = 360;
        this.bushCount = 280;
        this.rockCount = 180;
        this.grassCount = 700;

        // ====================================================
        // ARRAYS
        // ====================================================

        this.trees = [];
        this.bushes = [];
        this.rocks = [];
        this.grass = [];

        // ====================================================
        // SHARED GEOMETRIES
        // ====================================================

        this.treeTrunkGeometry =
            new THREE.CylinderGeometry(
                0.18,
                0.28,
                3.2,
                7
            );

        this.treeCrownGeometry =
            new THREE.SphereGeometry(
                1.35,
                8,
                6
            );

        this.smallTreeCrownGeometry =
            new THREE.SphereGeometry(
                0.9,
                7,
                5
            );

        this.bushGeometry =
            new THREE.SphereGeometry(
                0.65,
                7,
                5
            );

        this.rockGeometry =
            new THREE.DodecahedronGeometry(
                1,
                0
            );

        this.grassGeometry =
            new THREE.PlaneGeometry(
                0.45,
                1.0
            );

        // ====================================================
        // MATERIALS
        // ====================================================

        this.treeTrunkMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x4a3322,
                roughness: 1.0,
                metalness: 0
            });

        this.treeCrownMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x29472d,
                roughness: 1.0,
                metalness: 0
            });

        this.smallTreeCrownMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x355a35,
                roughness: 1.0,
                metalness: 0
            });

        this.bushMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x315234,
                roughness: 1.0,
                metalness: 0
            });

        this.rockMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x62645e,
                roughness: 0.96,
                metalness: 0.02
            });

        this.grassMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x41633c,
                roughness: 1,
                metalness: 0,
                side: THREE.DoubleSide,
                transparent: true,
                alphaTest: 0.15
            });

        // ====================================================
        // CREATE ENVIRONMENT
        // ====================================================

        this.createTrees();
        this.createBushes();
        this.createRocks();
        this.createGrass();

        console.log(
            "Veyra Environment v0.6 READY"
        );
    }

    // ========================================================
    // RANDOM
    // ========================================================

    random(min, max) {

        return (
            min +
            Math.random() *
            (max - min)
        );
    }

    // ========================================================
    // RANDOM WORLD POSITION
    // ========================================================

    randomPosition() {

        const radius =
            Math.sqrt(
                Math.random()
            ) *
            395;

        const angle =
            Math.random() *
            Math.PI *
            2;

        return {
            x:
                Math.cos(angle) *
                radius,

            z:
                Math.sin(angle) *
                radius
        };
    }

    // ========================================================
    // TERRAIN DATA
    // ========================================================

    getTerrainData(x, z) {

        const height =
            this.terrain.getGroundHeight(
                x,
                z
            );

        const slope =
            this.terrain.getSlopeDegrees(
                x,
                z
            );

        const distance =
            Math.sqrt(
                x * x +
                z * z
            );

        let biome =
            "forest";

        if (
            distance > 335 &&
            height < 6
        ) {

            biome = "beach";

        }
        else if (
            height > 82
        ) {

            biome = "mountain";

        }
        else if (
            height > 48
        ) {

            biome = "highland";

        }
        else if (
            slope > 30
        ) {

            biome = "rock";

        }
        else if (
            height < 8
        ) {

            biome = "grassland";
        }

        return {
            height,
            slope,
            distance,
            biome
        };
    }

    // ========================================================
    // WATER CHECK
    // ========================================================

    isUnderwater(
        x,
        z
    ) {

        const ground =
            this.terrain.getGroundHeight(
                x,
                z
            );

        return (
            ground <
            this.waterLevel
        );
    }

    // ========================================================
    // WATER BUFFER CHECK
    // ========================================================

    isTooCloseToWater(
        x,
        z,
        buffer = 2
    ) {

        const centerHeight =
            this.terrain.getGroundHeight(
                x,
                z
            );

        if (
            centerHeight <
            this.waterLevel +
            buffer
        ) {

            return true;
        }

        // Sample around position
        const samples = 8;

        for (
            let i = 0;
            i < samples;
            i++
        ) {

            const angle =
                (i / samples) *
                Math.PI *
                2;

            const sx =
                x +
                Math.cos(angle) *
                buffer;

            const sz =
                z +
                Math.sin(angle) *
                buffer;

            const height =
                this.terrain.getGroundHeight(
                    sx,
                    sz
                );

            if (
                height <
                this.waterLevel
            ) {

                return true;
            }
        }

        return false;
    }

    // ========================================================
    // VALID TREE POSITION
    // ========================================================

    isValidTreePosition(
        x,
        z
    ) {

        const data =
            this.getTerrainData(
                x,
                z
            );

        // Never underwater
        if (
            data.height <=
            this.waterLevel + 0.5
        ) {

            return false;
        }

        // Water buffer
        if (
            this.isTooCloseToWater(
                x,
                z,
                2.5
            )
        ) {

            return false;
        }

        // Beach should stay mostly open
        if (
            data.biome === "beach"
        ) {

            return false;
        }

        // Mountains should not have normal forest trees
        if (
            data.biome === "mountain"
        ) {

            return false;
        }

        // Very steep terrain
        if (
            data.slope >
            this.maxTreeSlope
        ) {

            return false;
        }

        // Trees prefer forest/highland/grassland
        if (
            data.biome !== "forest" &&
            data.biome !== "highland" &&
            data.biome !== "grassland"
        ) {

            return false;
        }

        return true;
    }

    // ========================================================
    // CREATE TREE
    // ========================================================

    createTree(
        x,
        z
    ) {

        const data =
            this.getTerrainData(
                x,
                z
            );

        const tree =
            new THREE.Group();

        tree.name =
            "VeyraTree";

        // ----------------------------------------------------
        // HEIGHT
        // ----------------------------------------------------

        let trunkHeight =
            this.random(
                2.8,
                4.4
            );

        if (
            data.biome ===
            "highland"
        ) {

            trunkHeight *=
                0.85;
        }

        // ----------------------------------------------------
        // TRUNK
        // ----------------------------------------------------

        const trunk =
            new THREE.Mesh(
                this.treeTrunkGeometry,
                this.treeTrunkMaterial
            );

        trunk.scale.y =
            trunkHeight / 3.2;

        trunk.position.y =
            trunkHeight * 0.5;

        trunk.castShadow = true;

        tree.add(
            trunk
        );

        // ----------------------------------------------------
        // MAIN CROWN
        // ----------------------------------------------------

        const crown =
            new THREE.Mesh(
                this.treeCrownGeometry,
                this.treeCrownMaterial
            );

        crown.position.y =
            trunkHeight + 0.9;

        crown.scale.set(
            this.random(
                0.85,
                1.15
            ),
            this.random(
                0.9,
                1.25
            ),
            this.random(
                0.85,
                1.15
            )
        );

        crown.castShadow = true;

        tree.add(
            crown
        );

        // ----------------------------------------------------
        // SECOND CROWN
        // ----------------------------------------------------

        const crown2 =
            new THREE.Mesh(
                this.smallTreeCrownGeometry,
                this.smallTreeCrownMaterial
            );

        crown2.position.set(
            this.random(
                -0.35,
                0.35
            ),
            trunkHeight + 1.8,
            this.random(
                -0.35,
                0.35
            )
        );

        crown2.scale.set(
            1,
            0.8,
            1
        );

        crown2.castShadow = true;

        tree.add(
            crown2
        );

        // ----------------------------------------------------
        // POSITION
        // ----------------------------------------------------

        const ground =
            data.height;

        tree.position.set(
            x,
            ground,
            z
        );

        // ----------------------------------------------------
        // ROTATION
        // ----------------------------------------------------

        tree.rotation.y =
            Math.random() *
            Math.PI *
            2;

        // ----------------------------------------------------
        // SCALE VARIATION
        // ----------------------------------------------------

        const scale =
            this.random(
                0.75,
                1.35
            );

        tree.scale.setScalar(
            scale
        );

        this.scene.add(
            tree
        );

        this.trees.push(
            tree
        );
    }

    // ========================================================
    // CREATE TREES
    // ========================================================

    createTrees() {

        let created = 0;

        let attempts = 0;

        const maxAttempts =
            this.treeCount * 12;

        while (
            created <
            this.treeCount &&
            attempts <
            maxAttempts
        ) {

            attempts++;

            const pos =
                this.randomPosition();

            if (
                !this.isValidTreePosition(
                    pos.x,
                    pos.z
                )
            ) {

                continue;
            }

            // Keep trees away from exact island center
            // to leave room for player/spawn/structures.
            const centerDistance =
                Math.sqrt(
                    pos.x * pos.x +
                    pos.z * pos.z
                );

            if (
                centerDistance < 18
            ) {

                continue;
            }

            this.createTree(
                pos.x,
                pos.z
            );

            created++;
        }

        console.log(
            `Trees created: ${created}`
        );
    }

    // ========================================================
    // VALID BUSH POSITION
    // ========================================================

    isValidBushPosition(
        x,
        z
    ) {

        const data =
            this.getTerrainData(
                x,
                z
            );

        // Underwater
        if (
            data.height <=
            this.waterLevel + 0.35
        ) {

            return false;
        }

        // Close to water
        if (
            this.isTooCloseToWater(
                x,
                z,
                1.3
            )
        ) {

            return false;
        }

        // Very steep
        if (
            data.slope >
            this.maxBushSlope
        ) {

            return false;
        }

        // No bushes on high mountain peaks
        if (
            data.height > 78
        ) {

            return false;
        }

        // Beach only occasional bushes
        if (
            data.biome === "beach"
        ) {

            return Math.random() <
                0.10;
        }

        return true;
    }

    // ========================================================
    // CREATE BUSH
    // ========================================================

    createBush(
        x,
        z
    ) {

        const height =
            this.terrain.getGroundHeight(
                x,
                z
            );

        const bush =
            new THREE.Mesh(
                this.bushGeometry,
                this.bushMaterial
            );

        const scale =
            this.random(
                0.55,
                1.25
            );

        bush.scale.set(
            scale,
            this.random(
                0.65,
                1.0
            ),
            scale
        );

        bush.position.set(
            x,
            height +
            scale * 0.35,
            z
        );

        bush.rotation.y =
            Math.random() *
            Math.PI *
            2;

        bush.castShadow = true;

        bush.receiveShadow = true;

        this.scene.add(
            bush
        );

        this.bushes.push(
            bush
        );
    }

    // ========================================================
    // CREATE BUSHES
    // ========================================================

    createBushes() {

        let created = 0;

        let attempts = 0;

        const maxAttempts =
            this.bushCount * 10;

        while (
            created <
            this.bushCount &&
            attempts <
            maxAttempts
        ) {

            attempts++;

            const pos =
                this.randomPosition();

            if (
                !this.isValidBushPosition(
                    pos.x,
                    pos.z
                )
            ) {

                continue;
            }

            this.createBush(
                pos.x,
                pos.z
            );

            created++;
        }

        console.log(
            `Bushes created: ${created}`
        );
    }

    // ========================================================
    // VALID ROCK POSITION
    // ========================================================

    isValidRockPosition(
        x,
        z
    ) {

        const data =
            this.getTerrainData(
                x,
                z
            );

        // Never underwater
        if (
            data.height <
            this.waterLevel + 0.15
        ) {

            return false;
        }

        // No rocks inside water
        if (
            this.isUnderwater(
                x,
                z
            )
        ) {

            return false;
        }

        // Rocks can exist on steep areas
        if (
            data.slope >
            this.maxRockSlope
        ) {

            return false;
        }

        return true;
    }

    // ========================================================
    // CREATE ROCK
    // ========================================================

    createRock(
        x,
        z
    ) {

        const height =
            this.terrain.getGroundHeight(
                x,
                z
            );

        const rock =
            new THREE.Mesh(
                this.rockGeometry,
                this.rockMaterial
            );

        const scaleX =
            this.random(
                0.45,
                1.8
            );

        const scaleY =
            this.random(
                0.35,
                1.15
            );

        const scaleZ =
            this.random(
                0.45,
                1.6
            );

        rock.scale.set(
            scaleX,
            scaleY,
            scaleZ
        );

        rock.position.set(
            x,
            height +
            scaleY * 0.35,
            z
        );

        rock.rotation.set(
            this.random(
                -0.25,
                0.25
            ),
            Math.random() *
            Math.PI *
            2,
            this.random(
                -0.25,
                0.25
            )
        );

        rock.castShadow = true;

        rock.receiveShadow = true;

        this.scene.add(
            rock
        );

        this.rocks.push(
            rock
        );
    }

    // ========================================================
    // CREATE ROCKS
    // ========================================================

    createRocks() {

        let created = 0;

        let attempts = 0;

        const maxAttempts =
            this.rockCount * 10;

        while (
            created <
            this.rockCount &&
            attempts <
            maxAttempts
        ) {

            attempts++;

            const pos =
                this.randomPosition();

            if (
                !this.isValidRockPosition(
                    pos.x,
                    pos.z
                )
            ) {

                continue;
            }

            this.createRock(
                pos.x,
                pos.z
            );

            created++;
        }

        console.log(
            `Rocks created: ${created}`
        );
    }

    // ========================================================
    // VALID GRASS POSITION
    // ========================================================

    isValidGrassPosition(
        x,
        z
    ) {

        const data =
            this.getTerrainData(
                x,
                z
            );

        // Never underwater
        if (
            data.height <
            this.waterLevel + 0.25
        ) {

            return false;
        }

        // No grass on steep rocks
        if (
            data.slope >
            38
        ) {

            return false;
        }

        // No grass on high mountain peaks
        if (
            data.height >
            88
        ) {

            return false;
        }

        return true;
    }

    // ========================================================
    // CREATE GRASS
    // ========================================================

    createGrassBlade(
        x,
        z
    ) {

        const height =
            this.terrain.getGroundHeight(
                x,
                z
            );

        const grass =
            new THREE.Mesh(
                this.grassGeometry,
                this.grassMaterial
            );

        const scale =
            this.random(
                0.55,
                1.25
            );

        grass.scale.set(
            scale,
            scale,
            scale
        );

        grass.position.set(
            x,
            height +
            0.45 * scale,
            z
        );

        grass.rotation.y =
            Math.random() *
            Math.PI *
            2;

        grass.castShadow = false;

        grass.receiveShadow = false;

        this.scene.add(
            grass
        );

        this.grass.push(
            grass
        );
    }

    // ========================================================
    // CREATE GRASS
    // ========================================================

    createGrass() {

        let created = 0;

        let attempts = 0;

        const maxAttempts =
            this.grassCount * 8;

        while (
            created <
            this.grassCount &&
            attempts <
            maxAttempts
        ) {

            attempts++;

            const pos =
                this.randomPosition();

            if (
                !this.isValidGrassPosition(
                    pos.x,
                    pos.z
                )
            ) {

                continue;
            }

            this.createGrassBlade(
                pos.x,
                pos.z
            );

            created++;
        }

        console.log(
            `Grass created: ${created}`
        );
    }

    // ========================================================
    // UPDATE
    // ========================================================

    update(
        deltaTime,
        elapsedTime
    ) {

        // Very lightweight vegetation movement.
        // Avoid expensive per-frame transformations.

        if (
            !this.trees.length
        ) {

            return;
        }

        const wind =
            Math.sin(
                elapsedTime *
                0.8
            ) *
            0.008;

        // Only animate a small number of trees
        // to keep mobile performance good.

        const animatedCount =
            Math.min(
                this.trees.length,
                80
            );

        for (
            let i = 0;
            i < animatedCount;
            i++
        ) {

            const tree =
                this.trees[i];

            const original =
                tree.userData.baseRotation;

            if (
                original === undefined
            ) {

                tree.userData.baseRotation =
                    tree.rotation.z;
            }

            tree.rotation.z =
                tree.userData.baseRotation +
                wind;
        }
    }

    // ========================================================
    // GET COUNTS
    // ========================================================

    getCounts() {

        return {

            trees:
                this.trees.length,

            bushes:
                this.bushes.length,

            rocks:
                this.rocks.length,

            grass:
                this.grass.length
        };
    }

    // ========================================================
    // REMOVE ALL
    // ========================================================

    clear() {

        // ----------------------------------------------------
        // TREES
        // ----------------------------------------------------

        for (
            const tree of this.trees
        ) {

            this.scene.remove(
                tree
            );
        }

        // ----------------------------------------------------
        // BUSHES
        // ----------------------------------------------------

        for (
            const bush of this.bushes
        ) {

            this.scene.remove(
                bush
            );
        }

        // ----------------------------------------------------
        // ROCKS
        // ----------------------------------------------------

        for (
            const rock of this.rocks
        ) {

            this.scene.remove(
                rock
            );
        }

        // ----------------------------------------------------
        // GRASS
        // ----------------------------------------------------

        for (
            const grass of this.grass
        ) {

            this.scene.remove(
                grass
            );
        }

        this.trees.length = 0;
        this.bushes.length = 0;
        this.rocks.length = 0;
        this.grass.length = 0;
    }

    // ========================================================
    // DISPOSE
    // ========================================================

    dispose() {

        this.clear();

        // Shared geometries
        this.treeTrunkGeometry.dispose();
        this.treeCrownGeometry.dispose();
        this.smallTreeCrownGeometry.dispose();
        this.bushGeometry.dispose();
        this.rockGeometry.dispose();
        this.grassGeometry.dispose();

        // Shared materials
        this.treeTrunkMaterial.dispose();
        this.treeCrownMaterial.dispose();
        this.smallTreeCrownMaterial.dispose();
        this.bushMaterial.dispose();
        this.rockMaterial.dispose();
        this.grassMaterial.dispose();
    }
}
