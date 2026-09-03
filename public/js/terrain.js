// ============================================================
// WILD ISLES
// VEYRA WORLD TERRAIN SYSTEM
// Chunk-Based Huge Open World Terrain
// Version 1.0
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class VeyraTerrain {

    constructor(scene) {

        this.scene = scene;

        // ====================================================
        // HUGE WORLD SETTINGS
        // ====================================================

        this.worldSize = 16384;
        this.worldHalfSize = this.worldSize / 2;

        this.chunkSize = 256;

        // 2 = 5 x 5 chunks visible
        // Mobile 1 = 3 x 3 chunks visible
        this.renderRadius = window.innerWidth <= 900 ? 1 : 2;

        this.maxLoadedChunks =
            window.innerWidth <= 900 ? 9 : 25;

        this.chunkSegments =
            window.innerWidth <= 900 ? 24 : 32;

        this.waterLevel = 1.8;

        this.maxWalkableSlope = 38;

        // ====================================================
        // CHUNK STORAGE
        // ====================================================

        this.chunks = new Map();
        this.loadedChunks = new Map();

        this.currentCenterChunk = {
            x: 0,
            z: 0
        };

        this.initialized = false;

        // ====================================================
        // MATERIALS
        // ====================================================

        this.terrainMaterial = new THREE.MeshStandardMaterial({

            vertexColors: true,

            roughness: 0.92,

            metalness: 0.02,

            side: THREE.FrontSide

        });

        // ====================================================
        // HEIGHT SETTINGS
        // ====================================================

        this.baseHeight = 2;

        this.maxTerrainHeight = 150;

        // ====================================================
        // WORLD SEED
        // ====================================================

        this.seed = 73421;

        console.log(
            "Veyra Terrain v1.0 HUGE WORLD READY"
        );
    }

    // ========================================================
    // BASIC UTILITIES
    // ========================================================

    clamp(value, min, max) {

        return Math.max(
            min,
            Math.min(max, value)
        );
    }

    lerp(a, b, t) {

        return a + (b - a) * t;

    }

    smoothstep(edge0, edge1, x) {

        let t =
            this.clamp(
                (x - edge0) /
                (edge1 - edge0),
                0,
                1
            );

        return t * t * (3 - 2 * t);

    }

    // ========================================================
    // DETERMINISTIC HASH
    // ========================================================

    hash2D(x, z) {

        const value =
            Math.sin(
                x * 127.1 +
                z * 311.7 +
                this.seed * 74.7
            ) *
            43758.5453123;

        return value - Math.floor(value);

    }

    // ========================================================
    // SMOOTH NOISE
    // ========================================================

    noise2D(x, z) {

        const x0 = Math.floor(x);
        const z0 = Math.floor(z);

        const x1 = x0 + 1;
        const z1 = z0 + 1;

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
            this.hash2D(x0, z0);

        const n10 =
            this.hash2D(x1, z0);

        const n01 =
            this.hash2D(x0, z1);

        const n11 =
            this.hash2D(x1, z1);

        const nx0 =
            this.lerp(
                n00,
                n10,
                sx
            );

        const nx1 =
            this.lerp(
                n01,
                n11,
                sx
            );

        return this.lerp(
            nx0,
            nx1,
            sz
        );

    }

    // ========================================================
    // FRACTAL NOISE
    // ========================================================

    smoothNoise(
        x,
        z,
        scale = 100,
        octaves = 4
    ) {

        let total = 0;

        let amplitude = 1;

        let frequency = 1 / scale;

        let normalization = 0;

        for (
            let i = 0;
            i < octaves;
            i++
        ) {

            total +=
                this.noise2D(
                    x * frequency,
                    z * frequency
                ) *
                amplitude;

            normalization += amplitude;

            amplitude *= 0.5;

            frequency *= 2;

        }

        return total / normalization;

    }

    // ========================================================
    // DOMAIN WARP
    // ========================================================

    getWarpedCoordinates(x, z) {

        const warpStrength = 55;

        const wx =
            (
                this.smoothNoise(
                    x + 5000,
                    z + 7000,
                    420,
                    3
                ) -
                0.5
            ) *
            warpStrength;

        const wz =
            (
                this.smoothNoise(
                    x - 8000,
                    z + 3000,
                    420,
                    3
                ) -
                0.5
            ) *
            warpStrength;

        return {

            x: x + wx,

            z: z + wz

        };

    }

    // ========================================================
    // CONTINENT / LAND MASK
    // ========================================================

    getLandMask(x, z) {

        const distance =
            Math.sqrt(
                x * x +
                z * z
            );

        // Main continental structure
        const continent =
            this.smoothNoise(
                x,
                z,
                3200,
                5
            );

        // Large secondary land formations
        const macro =
            this.smoothNoise(
                x + 900,
                z - 1300,
                1800,
                4
            );

        // Very large scale shape
        const mega =
            this.smoothNoise(
                x - 4200,
                z + 3500,
                6000,
                3
            );

        let mask =
            continent * 0.52 +
            macro * 0.30 +
            mega * 0.18;

        // Keep central Veyra region strongly land-based
        const centerProtection =
            1 -
            this.smoothstep(
                0,
                1800,
                distance
            );

        mask =
            mask * 0.72 +
            centerProtection * 0.28;

        return mask;

    }

    // ========================================================
    // LARGE MOUNTAIN MASK
    // ========================================================

    getMountainHeight(x, z) {

        const warped =
            this.getWarpedCoordinates(
                x,
                z
            );

        const largeMountains =
            this.smoothNoise(
                warped.x,
                warped.z,
                1100,
                5
            );

        const mountainRidges =
            this.smoothNoise(
                warped.x + 1500,
                warped.z - 900,
                420,
                5
            );

        const ridge =
            Math.abs(
                mountainRidges -
                0.5
            ) * 2;

        const ridgeShape =
            Math.pow(
                ridge,
                2.4
            );

        const mountains =
            Math.max(
                0,
                largeMountains - 0.46
            ) *
            2.0;

        return (
            mountains * 48 +
            ridgeShape * 34
        );

    }

    // ========================================================
    // HEIGHT GENERATOR
    // ========================================================

    getHeight(x, z) {

        if (
            !Number.isFinite(x) ||
            !Number.isFinite(z)
        ) {

            return this.waterLevel;

        }

        const warped =
            this.getWarpedCoordinates(
                x,
                z
            );

        const landMask =
            this.getLandMask(
                x,
                z
            );

        // ----------------------------------------------------
        // CONTINENT BASE
        // ----------------------------------------------------

        let base =
            (
                landMask -
                0.43
            ) *
            42;

        // ----------------------------------------------------
        // LARGE TERRAIN
        // ----------------------------------------------------

        const continentalNoise =
            this.smoothNoise(
                warped.x,
                warped.z,
                900,
                5
            );

        const regionalNoise =
            this.smoothNoise(
                warped.x + 2000,
                warped.z - 1500,
                360,
                4
            );

        const detailNoise =
            this.smoothNoise(
                warped.x - 5000,
                warped.z + 2200,
                90,
                3
            );

        base +=
            (
                continentalNoise -
                0.5
            ) *
            45;

        base +=
            (
                regionalNoise -
                0.5
            ) *
            22;

        base +=
            (
                detailNoise -
                0.5
            ) *
            5;

        // ----------------------------------------------------
        // MOUNTAINS
        // ----------------------------------------------------

        base +=
            this.getMountainHeight(
                warped.x,
                warped.z
            );

        // ----------------------------------------------------
        // SPECIAL CENTRAL VALLEY
        // ----------------------------------------------------

        const valleyDistance =
            Math.abs(
                x * 0.65 +
                z * 0.35
            );

        const valleyMask =
            1 -
            this.smoothstep(
                50,
                600,
                valleyDistance
            );

        base -=
            valleyMask * 12;

        // ----------------------------------------------------
        // NORTHERN FROST REGION
        // ----------------------------------------------------

        const northFactor =
            this.smoothstep(
                1200,
                5200,
                -z
            );

        base +=
            northFactor * 18;

        // ----------------------------------------------------
        // ASHEN / DESERT REGION
        // ----------------------------------------------------

        const southFactor =
            this.smoothstep(
                1800,
                5200,
                z
            );

        base +=
            southFactor * 5;

        // ----------------------------------------------------
        // COASTAL FALL OFF
        // ----------------------------------------------------

        const coastNoise =
            this.smoothNoise(
                x,
                z,
                650,
                3
            );

        const coastDistance =
            Math.sqrt(
                x * x +
                z * z
            );

        const coastFactor =
            this.smoothstep(
                6200,
                8000,
                coastDistance
            );

        base -=
            coastFactor *
            (
                22 +
                coastNoise * 18
            );

        // ----------------------------------------------------
        // OCEAN
        // ----------------------------------------------------

        if (landMask < 0.40) {

            const oceanDepth =
                this.smoothstep(
                    0.40,
                    0.20,
                    landMask
                );

            base =
                this.waterLevel -
                oceanDepth * 45;

        }

        // ----------------------------------------------------
        // BEACH
        // ----------------------------------------------------

        if (
            base >
            this.waterLevel &&
            base <
            this.waterLevel + 5
        ) {

            base =
                this.lerp(
                    base,
                    this.waterLevel + 2.5,
                    0.55
                );

        }

        return this.clamp(
            base,
            -45,
            this.maxTerrainHeight
        );

    }

    // ========================================================
    // GROUND HEIGHT
    // ========================================================

    getGroundHeight(x, z) {

        return this.getHeight(
            x,
            z
        );

    }

    // ========================================================
    // NORMAL
    // ========================================================

    getNormal(x, z) {

        const sample = 1.5;

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

    getSlopeAngle(x, z) {

        const normal =
            this.getNormal(
                x,
                z
            );

        return Math.acos(
            this.clamp(
                normal.y,
                -1,
                1
            )
        );

    }

    // ========================================================
    // SLOPE DEGREES
    // ========================================================

    getSlopeDegrees(x, z) {

        return (
            this.getSlopeAngle(
                x,
                z
            ) *
            180 /
            Math.PI
        );

    }

    // ========================================================
    // WALKABLE
    // ========================================================

    isWalkable(x, z) {

        const height =
            this.getGroundHeight(
                x,
                z
            );

        if (
            height <=
            this.waterLevel + 0.35
        ) {

            return false;

        }

        const slope =
            this.getSlopeDegrees(
                x,
                z
            );

        return (
            slope <=
            this.maxWalkableSlope
        );

    }

    // ========================================================
    // WORLD BOUNDS
    // ========================================================

    isInsideWorld(x, z) {

        return (
            x >= -this.worldHalfSize &&
            x <= this.worldHalfSize &&
            z >= -this.worldHalfSize &&
            z <= this.worldHalfSize
        );

    }

    // ========================================================
    // OLD COMPATIBILITY METHOD
    // ========================================================

    isInsideIsland(x, z) {

        return this.isInsideWorld(
            x,
            z
        );

    }

    // ========================================================
    // SAFE GROUND
    // ========================================================

    getSafeGroundHeight(
        x,
        z,
        maxAttempts = 12
    ) {

        if (
            this.isWalkable(
                x,
                z
            )
        ) {

            return this.getGroundHeight(
                x,
                z
            );

        }

        for (
            let i = 0;
            i < maxAttempts;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;

            const distance =
                4 +
                Math.random() *
                20;

            const nx =
                x +
                Math.cos(angle) *
                distance;

            const nz =
                z +
                Math.sin(angle) *
                distance;

            if (
                this.isWalkable(
                    nx,
                    nz
                )
            ) {

                return this.getGroundHeight(
                    nx,
                    nz
                );

            }

        }

        return this.waterLevel + 1;

    }

    // ========================================================
    // FIND SAFE POSITION
    // ========================================================

    findSafePosition(
        centerX = 0,
        centerZ = 0,
        searchRadius = 150
    ) {

        // Try center first
        if (
            this.isWalkable(
                centerX,
                centerZ
            )
        ) {

            return {

                x: centerX,

                y:
                    this.getGroundHeight(
                        centerX,
                        centerZ
                    ),

                z: centerZ

            };

        }

        for (
            let i = 0;
            i < 100;
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
                !this.isInsideWorld(
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

                    y:
                        this.getGroundHeight(
                            x,
                            z
                        ),

                    z

                };

            }

        }

        return {

            x: centerX,

            y:
                Math.max(
                    this.getGroundHeight(
                        centerX,
                        centerZ
                    ),
                    this.waterLevel + 1
                ),

            z: centerZ

        };

    }

    // ========================================================
    // BIOME
    // ========================================================

    getBiome(x, z) {

        const height =
            this.getHeight(
                x,
                z
            );

        if (
            height <=
            this.waterLevel
        ) {

            return "ocean";

        }

        // North = Frost Peak
        if (
            z < -2500 &&
            height > 55
        ) {

            return "snow";

        }

        // South = Ashen Desert
        if (
            z > 2500
        ) {

            const desertNoise =
                this.smoothNoise(
                    x,
                    z,
                    500,
                    3
                );

            if (
                desertNoise >
                0.42
            ) {

                return "desert";

            }

        }

        if (
            height > 95
        ) {

            return "mountain";

        }

        if (
            height > 68
        ) {

            return "highland";

        }

        const forestNoise =
            this.smoothNoise(
                x + 300,
                z - 600,
                220,
                4
            );

        if (
            forestNoise >
            0.54
        ) {

            return "forest";

        }

        if (
            height <
            this.waterLevel + 5
        ) {

            return "beach";

        }

        // Eastern industrial region
        if (
            x > 2200 &&
            z > -1200 &&
            z < 1800
        ) {

            return "industrial";

        }

        // Western village region
        if (
            x < -1800 &&
            z > -1200 &&
            z < 1800
        ) {

            return "village";

        }

        return "grassland";

    }

    // ========================================================
    // VERTEX COLOR
    // ========================================================

    getVertexColor(
        x,
        y,
        z
    ) {

        const biome =
            this.getBiome(
                x,
                z
            );

        let color =
            new THREE.Color();

        switch (biome) {

            case "ocean":

                color.setRGB(
                    0.10,
                    0.25,
                    0.28
                );

                break;

            case "beach":

                color.setRGB(
                    0.68,
                    0.61,
                    0.43
                );

                break;

            case "desert":

                color.setRGB(
                    0.67,
                    0.48,
                    0.28
                );

                break;

            case "snow":

                color.setRGB(
                    0.84,
                    0.87,
                    0.88
                );

                break;

            case "mountain":

                color.setRGB(
                    0.30,
                    0.32,
                    0.31
                );

                break;

            case "highland":

                color.setRGB(
                    0.34,
                    0.40,
                    0.27
                );

                break;

            case "forest":

                color.setRGB(
                    0.18,
                    0.34,
                    0.18
                );

                break;

            case "industrial":

                color.setRGB(
                    0.25,
                    0.29,
                    0.26
                );

                break;

            case "village":

                color.setRGB(
                    0.28,
                    0.42,
                    0.24
                );

                break;

            default:

                color.setRGB(
                    0.25,
                    0.43,
                    0.22
                );

        }

        // Rock exposure on high slopes
        const slope =
            this.getSlopeDegrees(
                x,
                z
            );

        if (
            slope > 42 &&
            biome !== "snow"
        ) {

            color.lerp(
                new THREE.Color(
                    0.30,
                    0.30,
                    0.28
                ),
                0.55
            );

        }

        // High altitude snow tint
        if (
            y > 105
        ) {

            color.lerp(
                new THREE.Color(
                    0.82,
                    0.84,
                    0.86
                ),
                this.clamp(
                    (y - 105) / 30,
                    0,
                    1
                )
            );

        }

        return color;

    }

    // ========================================================
    // CHUNK COORDINATES
    // ========================================================

    worldToChunk(
        x,
        z
    ) {

        return {

            x:
                Math.floor(
                    x /
                    this.chunkSize
                ),

            z:
                Math.floor(
                    z /
                    this.chunkSize
                )

        };

    }

    chunkToWorld(
        chunkX,
        chunkZ
    ) {

        return {

            x:
                chunkX *
                this.chunkSize,

            z:
                chunkZ *
                this.chunkSize

        };

    }

    getChunkKey(
        chunkX,
        chunkZ
    ) {

        return (
            `${chunkX},${chunkZ}`
        );

    }

    // ========================================================
    // CREATE CHUNK
    // ========================================================

    createChunk(
        chunkX,
        chunkZ
    ) {

        const key =
            this.getChunkKey(
                chunkX,
                chunkZ
            );

        if (
            this.loadedChunks.has(key)
        ) {

            return this.loadedChunks.get(
                key
            );

        }

        const startX =
            chunkX *
            this.chunkSize;

        const startZ =
            chunkZ *
            this.chunkSize;

        const geometry =
            new THREE.PlaneGeometry(
                this.chunkSize,
                this.chunkSize,
                this.chunkSegments,
                this.chunkSegments
            );

        const position =
            geometry.attributes.position;

        const colors = [];

        for (
            let i = 0;
            i < position.count;
            i++
        ) {

            const localX =
                position.getX(i);

            const localZ =
                -position.getY(i);

            const worldX =
                startX +
                localX +
                this.chunkSize / 2;

            const worldZ =
                startZ +
                localZ +
                this.chunkSize / 2;

            const height =
                this.getHeight(
                    worldX,
                    worldZ
                );

            position.setZ(
                i,
                height
            );

            const color =
                this.getVertexColor(
                    worldX,
                    height,
                    worldZ
                );

            colors.push(
                color.r,
                color.g,
                color.b
            );

        }

        geometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(
                colors,
                3
            )
        );

        geometry.computeVertexNormals();

        const mesh =
            new THREE.Mesh(
                geometry,
                this.terrainMaterial
            );

        // PlaneGeometry is XY
        // Convert to XZ terrain
        mesh.rotation.x =
            -Math.PI / 2;

        mesh.position.set(
            startX +
            this.chunkSize / 2,

            0,

            startZ +
            this.chunkSize / 2
        );

        mesh.receiveShadow = true;

        mesh.castShadow = false;

        mesh.userData.chunkX =
            chunkX;

        mesh.userData.chunkZ =
            chunkZ;

        mesh.userData.type =
            "terrain";

        this.scene.add(
            mesh
        );

        const chunk = {

            key,

            x: chunkX,

            z: chunkZ,

            mesh,

            geometry,

            lastUsed:
                performance.now()

        };

        this.loadedChunks.set(
            key,
            chunk
        );

        this.chunks.set(
            key,
            chunk
        );

        return chunk;

    }

    // ========================================================
    // REMOVE CHUNK
    // ========================================================

    removeChunk(
        chunkX,
        chunkZ
    ) {

        const key =
            this.getChunkKey(
                chunkX,
                chunkZ
            );

        const chunk =
            this.loadedChunks.get(
                key
            );

        if (!chunk) {

            return;

        }

        this.scene.remove(
            chunk.mesh
        );

        if (
            chunk.geometry
        ) {

            chunk.geometry.dispose();

        }

        this.loadedChunks.delete(
            key
        );

    }

    // ========================================================
    // REQUIRED CHUNKS
    // ========================================================

    getRequiredChunks(
        centerX,
        centerZ
    ) {

        const center =
            this.worldToChunk(
                centerX,
                centerZ
            );

        const result = [];

        for (
            let z =
                center.z -
                this.renderRadius;

            z <=
            center.z +
            this.renderRadius;

            z++
        ) {

            for (
                let x =
                    center.x -
                    this.renderRadius;

                x <=
                center.x +
                this.renderRadius;

                x++
            ) {

                const world =
                    this.chunkToWorld(
                        x,
                        z
                    );

                const centerWorldX =
                    world.x +
                    this.chunkSize / 2;

                const centerWorldZ =
                    world.z +
                    this.chunkSize / 2;

                if (
                    this.isInsideWorld(
                        centerWorldX,
                        centerWorldZ
                    )
                ) {

                    result.push({

                        x,

                        z,

                        distance:
                            Math.hypot(
                                x -
                                center.x,

                                z -
                                center.z
                            )

                    });

                }

            }

        }

        result.sort(
            (a, b) =>
                a.distance -
                b.distance
        );

        return result;

    }

    // ========================================================
    // STREAM CHUNKS
    // ========================================================

    updateStreaming(
        playerX,
        playerZ
    ) {

        if (
            !Number.isFinite(playerX) ||
            !Number.isFinite(playerZ)
        ) {

            return;

        }

        const center =
            this.worldToChunk(
                playerX,
                playerZ
            );

        const changed =
            center.x !==
                this.currentCenterChunk.x ||
            center.z !==
                this.currentCenterChunk.z;

        if (
            !changed &&
            this.initialized
        ) {

            return;

        }

        this.currentCenterChunk.x =
            center.x;

        this.currentCenterChunk.z =
            center.z;

        const required =
            this.getRequiredChunks(
                playerX,
                playerZ
            );

        // ----------------------------------------------------
        // LOAD
        // ----------------------------------------------------

        for (
            const item of required
        ) {

            const key =
                this.getChunkKey(
                    item.x,
                    item.z
                );

            if (
                !this.loadedChunks.has(
                    key
                )
            ) {

                this.createChunk(
                    item.x,
                    item.z
                );

            }

            const chunk =
                this.loadedChunks.get(
                    key
                );

            if (chunk) {

                chunk.lastUsed =
                    performance.now();

            }

        }

        // ----------------------------------------------------
        // UNLOAD FAR CHUNKS
        // ----------------------------------------------------

        const unloadDistance =
            this.renderRadius + 1;

        for (
            const [
                key,
                chunk
            ]
            of this.loadedChunks
        ) {

            const distance =
                Math.max(
                    Math.abs(
                        chunk.x -
                        center.x
                    ),

                    Math.abs(
                        chunk.z -
                        center.z
                    )
                );

            if (
                distance >
                unloadDistance
            ) {

                this.removeChunk(
                    chunk.x,
                    chunk.z
                );

            }

        }

        this.enforceChunkLimit();

        this.initialized = true;

    }

    // ========================================================
    // CHUNK LIMIT
    // ========================================================

    enforceChunkLimit() {

        if (
            this.loadedChunks.size <=
            this.maxLoadedChunks
        ) {

            return;

        }

        const chunks =
            Array.from(
                this.loadedChunks.values()
            );

        chunks.sort(
            (
                a,
                b
            ) =>
                a.lastUsed -
                b.lastUsed
        );

        while (
            this.loadedChunks.size >
            this.maxLoadedChunks
        ) {

            const chunk =
                chunks.shift();

            if (!chunk) {

                break;

            }

            this.removeChunk(
                chunk.x,
                chunk.z
            );

        }

    }

    // ========================================================
    // MAIN UPDATE
    // ========================================================

    update(
        playerX,
        playerZ
    ) {

        this.updateStreaming(
            playerX,
            playerZ
        );

    }

    // ========================================================
    // CREATE / INITIALIZE
    // ========================================================

    create(
        centerX = 0,
        centerZ = 0
    ) {

        this.updateStreaming(
            centerX,
            centerZ
        );

        return this;

    }

    // ========================================================
    // TERRAIN INFORMATION
    // ========================================================

    getTerrainInfo(
        x,
        z
    ) {

        const height =
            this.getHeight(
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

        const chunk =
            this.worldToChunk(
                x,
                z
            );

        return {

            x,

            z,

            height,

            slope,

            slopeDegrees: slope,

            biome,

            walkable:
                this.isWalkable(
                    x,
                    z
                ),

            chunkX:
                chunk.x,

            chunkZ:
                chunk.z,

            water:
                height <=
                this.waterLevel

        };

    }

    // ========================================================
    // WORLD STATS
    // ========================================================

    getStats() {

        return {

            worldSize:
                this.worldSize,

            chunkSize:
                this.chunkSize,

            totalPossibleChunks:
                Math.ceil(
                    this.worldSize /
                    this.chunkSize
                ) *
                Math.ceil(
                    this.worldSize /
                    this.chunkSize
                ),

            loadedChunks:
                this.loadedChunks.size,

            renderRadius:
                this.renderRadius,

            worldHalfSize:
                this.worldHalfSize

        };

    }

    // ========================================================
    // DISPOSE
    // ========================================================

    dispose() {

        for (
            const chunk
            of this.loadedChunks.values()
        ) {

            if (
                chunk.mesh
            ) {

                this.scene.remove(
                    chunk.mesh
                );

            }

            if (
                chunk.geometry
            ) {

                chunk.geometry.dispose();

            }

        }

        this.loadedChunks.clear();

        this.chunks.clear();

        if (
            this.terrainMaterial
        ) {

            this.terrainMaterial.dispose();

        }

        this.scene = null;

    }

}

// ============================================================
// END OF TERRAIN SYSTEM
// ============================================================
