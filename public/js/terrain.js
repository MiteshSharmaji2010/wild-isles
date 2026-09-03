// ============================================================
// WILD ISLES
// VEYRA ISLAND
// TERRAIN SYSTEM v0.6
//
// Procedural Island Terrain
// Mountains
// Hills
// Valleys
// Beaches
// Biomes
// Slopes
// Safe Player Positions
// Terrain Collision Support
// Vertex Colors
// ============================================================

import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ============================================================
// TERRAIN CLASS
// ============================================================

export class VeyraTerrain {

    constructor(scene) {

        this.scene = scene;

        // =====================================================
        // WORLD SIZE
        // =====================================================

        this.size = 900;

        this.segments = 220;

        this.islandRadius = 430;

        this.waterLevel = 1.8;

        this.maxWalkableSlope = 38;

        // =====================================================
        // TERRAIN SETTINGS
        // =====================================================

        this.minHeight = 0;

        this.maxHeight = 120;

        this.geometry = null;

        this.mesh = null;

        // =====================================================
        // CREATE
        // =====================================================

        this.create();

        console.log(
            "Veyra Terrain v0.6 READY"
        );
    }


    // ========================================================
    // SMOOTHSTEP
    // ========================================================

    smoothstep(
        edge0,
        edge1,
        value
    ) {

        if (
            edge0 === edge1
        ) {

            return 0;
        }

        const t =
            THREE.MathUtils.clamp(
                (
                    value -
                    edge0
                ) /
                (
                    edge1 -
                    edge0
                ),
                0,
                1
            );

        return (
            t *
            t *
            (
                3 -
                2 * t
            )
        );
    }


    // ========================================================
    // DETERMINISTIC NOISE
    // ========================================================

    noise2D(
        x,
        z
    ) {

        const value =
            Math.sin(
                x * 12.9898 +
                z * 78.233
            ) *
            43758.5453;

        return (
            value -
            Math.floor(value)
        ) * 2 - 1;
    }


    // ========================================================
    // SMOOTH NOISE
    // ========================================================

    smoothNoise(
        x,
        z,
        scale = 1
    ) {

        x /= scale;
        z /= scale;

        const x0 =
            Math.floor(x);

        const z0 =
            Math.floor(z);

        const x1 =
            x0 + 1;

        const z1 =
            z0 + 1;

        const sx =
            this.smoothstep(
                0,
                1,
                x - x0
            );

        const sz =
            this.smoothstep(
                0,
                1,
                z - z0
            );

        const n00 =
            this.noise2D(
                x0,
                z0
            );

        const n10 =
            this.noise2D(
                x1,
                z0
            );

        const n01 =
            this.noise2D(
                x0,
                z1
            );

        const n11 =
            this.noise2D(
                x1,
                z1
            );

        const nx0 =
            THREE.MathUtils.lerp(
                n00,
                n10,
                sx
            );

        const nx1 =
            THREE.MathUtils.lerp(
                n01,
                n11,
                sx
            );

        return THREE.MathUtils.lerp(
            nx0,
            nx1,
            sz
        );
    }


    // ========================================================
    // TERRAIN NOISE
    // ========================================================

    getTerrainNoise(
        x,
        z
    ) {

        let value = 0;

        // Large land shapes
        value +=
            this.smoothNoise(
                x,
                z,
                170
            ) * 28;

        // Medium hills
        value +=
            this.smoothNoise(
                x + 300,
                z - 180,
                75
            ) * 13;

        // Smaller terrain detail
        value +=
            this.smoothNoise(
                x - 120,
                z + 220,
                32
            ) * 4;

        // Fine detail
        value +=
            this.smoothNoise(
                x + 500,
                z + 500,
                12
            ) * 1.4;

        return value;
    }


    // ========================================================
    // HEIGHT
    // ========================================================

    getHeight(
        x,
        z
    ) {

        const distance =
            Math.sqrt(
                x * x +
                z * z
            );

        // ====================================================
        // ISLAND MASK
        // ====================================================

        const islandMask =
            1 -
            this.smoothstep(
                this.islandRadius * 0.72,
                this.islandRadius,
                distance
            );


        // ====================================================
        // BASE LAND
        // ====================================================

        let height =
            7 +
            this.getTerrainNoise(
                x,
                z
            );


        // ====================================================
        // MAIN MOUNTAIN RANGE
        // ====================================================

        const mountainDistance =
            Math.sqrt(
                Math.pow(
                    (x + 95) / 1.2,
                    2
                ) +
                Math.pow(
                    (z + 55) * 1.5,
                    2
                )
            );

        const mountainMask =
            1 -
            this.smoothstep(
                80,
                280,
                mountainDistance
            );

        const mountainNoise =
            this.smoothNoise(
                x + 700,
                z - 500,
                55
            );

        height +=
            mountainMask *
            (
                45 +
                mountainNoise * 18
            );


        // ====================================================
        // SECONDARY HILLS
        // ====================================================

        const hillNoise =
            this.smoothNoise(
                x - 420,
                z + 330,
                95
            );

        height +=
            Math.max(
                0,
                hillNoise
            ) * 15;


        // ====================================================
        // NORTHERN HILLS
        // ====================================================

        const northFactor =
            this.smoothstep(
                -40,
                -300,
                z
            );

        height +=
            northFactor *
            Math.max(
                0,
                this.smoothNoise(
                    x + 200,
                    z + 800,
                    70
                )
            ) *
            22;


        // ====================================================
        // CENTRAL VALLEY
        // ====================================================

        const valleyDistance =
            Math.sqrt(
                Math.pow(
                    (x - 20) / 1.5,
                    2
                ) +
                Math.pow(
                    (z - 30) * 1.2,
                    2
                )
            );

        const valleyMask =
            1 -
            this.smoothstep(
                45,
                160,
                valleyDistance
            );

        height -=
            valleyMask *
            10;


        // ====================================================
        // COASTAL FALL OFF
        // ====================================================

        if (
            distance >
            this.islandRadius * 0.55
        ) {

            const coastFactor =
                this.smoothstep(
                    this.islandRadius * 0.55,
                    this.islandRadius,
                    distance
                );

            height =
                THREE.MathUtils.lerp(
                    height,
                    this.waterLevel - 1,
                    coastFactor
                );
        }


        // ====================================================
        // BEACH FLATTENING
        // ====================================================

        const beachFactor =
            this.smoothstep(
                this.islandRadius * 0.76,
                this.islandRadius * 0.92,
                distance
            );

        if (
            beachFactor > 0
        ) {

            height =
                THREE.MathUtils.lerp(
                    height,
                    3.2,
                    beachFactor
                );
        }


        // ====================================================
        // ISLAND EDGE
        // ====================================================

        height =
            THREE.MathUtils.lerp(
                this.waterLevel - 1,
                height,
                islandMask
            );


        // ====================================================
        // LIMIT
        // ====================================================

        return THREE.MathUtils.clamp(
            height,
            this.minHeight,
            this.maxHeight
        );
    }


    // ========================================================
    // GROUND HEIGHT
    // ========================================================

    getGroundHeight(
        x,
        z
    ) {

        return this.getHeight(
            x,
            z
        );
    }


    // ========================================================
    // TERRAIN NORMAL
    // ========================================================

    getNormal(
        x,
        z
    ) {

        const sample = 1.0;

        const hL =
            this.getHeight(
                x - sample,
                z
            );

        const hR =
            this.getHeight(
                x + sample,
                z
            );

        const hD =
            this.getHeight(
                x,
                z - sample
            );

        const hU =
            this.getHeight(
                x,
                z + sample
            );

        const normal =
            new THREE.Vector3(
                hL - hR,
                sample * 2,
                hD - hU
            );

        normal.normalize();

        return normal;
    }


    // ========================================================
    // SLOPE ANGLE
    // ========================================================

    getSlopeAngle(
        x,
        z
    ) {

        const normal =
            this.getNormal(
                x,
                z
            );

        const angle =
            Math.acos(
                THREE.MathUtils.clamp(
                    normal.y,
                    -1,
                    1
                )
            );

        return angle;
    }


    // ========================================================
    // SLOPE DEGREES
    // ========================================================

    getSlopeDegrees(
        x,
        z
    ) {

        return THREE.MathUtils.radToDeg(
            this.getSlopeAngle(
                x,
                z
            )
        );
    }


    // ========================================================
    // ISLAND CHECK
    // ========================================================

    isInsideIsland(
        x,
        z
    ) {

        const distance =
            Math.sqrt(
                x * x +
                z * z
            );

        return (
            distance <
            this.islandRadius
        );
    }


    // ========================================================
    // WALKABLE CHECK
    // ========================================================

    isWalkable(
        x,
        z
    ) {

        if (
            !this.isInsideIsland(
                x,
                z
            )
        ) {

            return false;
        }

        const height =
            this.getGroundHeight(
                x,
                z
            );

        if (
            height <=
            this.waterLevel + 0.2
        ) {

            return false;
        }

        const slope =
            this.getSlopeDegrees(
                x,
                z
            );

        if (
            slope >
            this.maxWalkableSlope
        ) {

            return false;
        }

        return true;
    }


    // ========================================================
    // SAFE GROUND HEIGHT
    // ========================================================

    getSafeGroundHeight(
        x,
        z
    ) {

        if (
            !this.isWalkable(
                x,
                z
            )
        ) {

            return null;
        }

        return this.getGroundHeight(
            x,
            z
        );
    }


    // ========================================================
    // FIND SAFE POSITION
    // ========================================================

    findSafePosition(
        centerX = 0,
        centerZ = 0,
        searchRadius = 150
    ) {

        // ====================================================
        // FIRST ATTEMPT
        // ====================================================

        if (
            this.isWalkable(
                centerX,
                centerZ
            )
        ) {

            return {
                x: centerX,
                y: this.getGroundHeight(
                    centerX,
                    centerZ
                ),
                z: centerZ
            };
        }


        // ====================================================
        // RANDOM SEARCH
        // ====================================================

        for (
            let i = 0;
            i < 300;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;

            const radius =
                Math.random() *
                searchRadius;

            const x =
                centerX +
                Math.cos(angle) *
                radius;

            const z =
                centerZ +
                Math.sin(angle) *
                radius;

            if (
                !this.isInsideIsland(
                    x,
                    z
                )
            ) {

                continue;
            }

            if (
                this.isWalkable(
                    x,
                    z
                )
            ) {

                return {
                    x,
                    y: this.getGroundHeight(
                        x,
                        z
                    ),
                    z
                };
            }
        }


        // ====================================================
        // FALLBACK
        // ====================================================

        return {
            x: 0,
            y: this.getGroundHeight(
                0,
                0
            ),
            z: 0
        };
    }


    // ========================================================
    // BIOME
    // ========================================================

    getBiome(
        x,
        z
    ) {

        const height =
            this.getGroundHeight(
                x,
                z
            );

        const distance =
            Math.sqrt(
                x * x +
                z * z
            );

        // ====================================================
        // WATER
        // ====================================================

        if (
            height <=
            this.waterLevel
        ) {

            return "water";
        }


        // ====================================================
        // BEACH
        // ====================================================

        if (
            distance >
            this.islandRadius * 0.78
        ) {

            return "beach";
        }


        // ====================================================
        // MOUNTAIN
        // ====================================================

        if (
            height > 70
        ) {

            return "mountain";
        }


        // ====================================================
        // SNOW
        // ====================================================

        if (
            height > 100
        ) {

            return "snow";
        }


        // ====================================================
        // FOREST
        // ====================================================

        const forestNoise =
            this.smoothNoise(
                x + 1200,
                z - 800,
                100
            );

        if (
            forestNoise > 0.05
        ) {

            return "forest";
        }


        // ====================================================
        // HIGHLAND
        // ====================================================

        if (
            height > 40
        ) {

            return "highland";
        }


        // ====================================================
        // DEFAULT
        // ====================================================

        return "grassland";
    }


    // ========================================================
    // VERTEX COLOR
    // ========================================================

    getVertexColor(
        x,
        z,
        height
    ) {

        const color =
            new THREE.Color();


        // ====================================================
        // WATER
        // ====================================================

        if (
            height <=
            this.waterLevel + 0.5
        ) {

            color.set(
                0x6e9c86
            );

            return color;
        }


        // ====================================================
        // BEACH
        // ====================================================

        if (
            height < 6
        ) {

            color.set(
                0xc8b889
            );

            return color;
        }


        // ====================================================
        // SNOW
        // ====================================================

        if (
            height > 100
        ) {

            color.set(
                0xd8e0df
            );

            return color;
        }


        // ====================================================
        // ROCK
        // ====================================================

        if (
            height > 72
        ) {

            color.set(
                0x77756f
            );

            return color;
        }


        // ====================================================
        // FOREST / GRASS
        // ====================================================

        const variation =
            this.smoothNoise(
                x,
                z,
                25
            );

        if (
            variation > 0.25
        ) {

            color.set(
                0x4d7045
            );

        } else if (
            variation < -0.25
        ) {

            color.set(
                0x658450
            );

        } else {

            color.set(
                0x587b49
            );
        }

        return color;
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

        geometry.rotateX(
            -Math.PI / 2
        );


        // ====================================================
        // HEIGHT DATA
        // ====================================================

        const position =
            geometry.attributes.position;

        const colors = [];


        for (
            let i = 0;
            i < position.count;
            i++
        ) {

            const x =
                position.getX(
                    i
                );

            const z =
                position.getZ(
                    i
                );

            const height =
                this.getHeight(
                    x,
                    z
                );

            position.setY(
                i,
                height
            );


            // =================================================
            // VERTEX COLOR
            // =================================================

            const color =
                this.getVertexColor(
                    x,
                    z,
                    height
                );

            colors.push(
                color.r,
                color.g,
                color.b
            );
        }


        // ====================================================
        // COLOR ATTRIBUTE
        // ====================================================

        geometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(
                colors,
                3
            )
        );


        // ====================================================
        // NORMALS
        // ====================================================

        geometry.computeVertexNormals();


        // ====================================================
        // MATERIAL
        // ====================================================

        const material =
            new THREE.MeshStandardMaterial({

                vertexColors: true,

                roughness: 0.95,

                metalness: 0.0,

                side:
                    THREE.FrontSide
            });


        // ====================================================
        // MESH
        // ====================================================

        const mesh =
            new THREE.Mesh(
                geometry,
                material
            );

        mesh.receiveShadow = true;

        mesh.castShadow = false;

        this.scene.add(
            mesh
        );


        // ====================================================
        // STORE REFERENCES
        // ====================================================

        this.geometry =
            geometry;

        this.mesh =
            mesh;

        console.log(
            "Terrain mesh created:",
            `${this.size}x${this.size}`,
            `segments: ${this.segments}`
        );
    }


    // ========================================================
    // TERRAIN INFO
    // ========================================================

    getTerrainInfo(
        x,
        z
    ) {

        const height =
            this.getGroundHeight(
                x,
                z
            );

        const slope =
            this.getSlopeDegrees(
                x,
                z
            );

        const biome =
            this.getBiome(
                x,
                z
            );

        return {

            x,
            z,

            height,

            slope,

            biome,

            walkable:
                this.isWalkable(
                    x,
                    z
                ),

            insideIsland:
                this.isInsideIsland(
                    x,
                    z
                )
        };
    }


    // ========================================================
    // DISPOSE
    // ========================================================

    dispose() {

        if (
            this.mesh
        ) {

            this.scene.remove(
                this.mesh
            );
        }

        if (
            this.geometry
        ) {

            this.geometry.dispose();

            this.geometry =
                null;
        }

        if (
            this.mesh &&
            this.mesh.material
        ) {

            this.mesh.material.dispose();
        }

        this.mesh =
            null;

        console.log(
            "Veyra Terrain disposed"
        );
    }
}
