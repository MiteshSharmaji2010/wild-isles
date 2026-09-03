// ============================================================
// WILD ISLES
// VEYRA WORLD
// public/js/terrain.js
// HUGE WORLD CHUNK TERRAIN SYSTEM v1.0
//
// Features:
// - 16 km x 16 km playable world
// - 256m chunks
// - Dynamic chunk loading/unloading
// - Global deterministic terrain
// - Seamless chunk boundaries
// - Mountains
// - Forest
// - Grassland
// - Highland
// - Snow
// - Desert
// - Coast
// - Ocean
// - Vertex colors
// - Proper normals
// - Slope detection
// - Safe spawn positions
// - Mobile-friendly chunk limits
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class VeyraTerrain {

    constructor(scene) {

        // ========================================================
        // SCENE
        // ========================================================

        this.scene = scene;

        // ========================================================
        // HUGE WORLD SETTINGS
        // ========================================================

        this.worldSize = 16384;
        this.worldHalfSize = this.worldSize / 2;

        this.chunkSize = 256;

        this.chunkSegments = 32;

        this.renderRadius =
            window.innerWidth <= 900 ? 1 : 2;

        this.unloadRadius =
            window.innerWidth <= 900 ? 2 : 3;

        this.maxLoadedChunks =
            window.innerWidth <= 900 ? 9 : 25;

        // ========================================================
        // WORLD HEIGHT SETTINGS
        // ========================================================

        this.waterLevel = 1.8;

        this.beachLevel = 5.5;

        this.maxTerrainHeight = 260;

        this.maxWalkableSlope = 38;

        // ========================================================
        // CHUNK STORAGE
        // ========================================================

        this.chunks = new Map();

        this.loadedChunks = new Map();

        this.chunkMeshes = new Map();

        // ========================================================
        // STREAMING STATE
        // ========================================================

        this.currentChunkX = null;

        this.currentChunkZ = null;

        this.lastPlayerX = null;

        this.lastPlayerZ = null;

        this.enabled = true;

        this.initialized = false;

        // ========================================================
        // SHARED MATERIAL
        // ========================================================

        this.material = new THREE.MeshStandardMaterial({

            vertexColors: true,

            roughness: 0.92,

            metalness: 0.02,

            flatShading: false

        });

        // ========================================================
        // OCEAN / FAR TERRAIN
        // ========================================================

        this.oceanMaterial = new THREE.MeshStandardMaterial({

            color: 0x183f4a,

            roughness: 0.18,

            metalness: 0.02,

            transparent: true,

            opacity: 0.92,

            side: THREE.DoubleSide

        });

        // ========================================================
        // ROOT GROUP
        // ========================================================

        this.root = new THREE.Group();

        this.root.name = "VeyraWorldTerrain";

        this.scene.add(this.root);

        // ========================================================
        // TERRAIN VERSION
        // ========================================================

        this.version = "1.0";

        console.log(
            "WILD ISLES Huge Terrain v1.0 READY"
        );
    }


    // ============================================================
    // BASIC UTILITIES
    // ============================================================

    clamp(value, min, max) {

        return Math.max(
            min,
            Math.min(max, value)
        );
    }


    lerp(a, b, t) {

        return a + (b - a) * t;
    }


    smoothStep(t) {

        t = this.clamp(t, 0, 1);

        return t * t * (3 - 2 * t);
    }


    // ============================================================
    // DETERMINISTIC GLOBAL HASH
    // ============================================================

    hash2D(x, z) {

        let n =
            Math.sin(
                x * 127.1 +
                z * 311.7 +
                918.3
            ) *
            43758.5453123;

        return n - Math.floor(n);
    }


    // ============================================================
    // GLOBAL VALUE NOISE
    // ============================================================

    valueNoise(x, z) {

        const x0 = Math.floor(x);

        const z0 = Math.floor(z);

        const x1 = x0 + 1;

        const z1 = z0 + 1;

        const tx =
            this.smoothStep(x - x0);

        const tz =
            this.smoothStep(z - z0);

        const a =
            this.hash2D(x0, z0);

        const b =
            this.hash2D(x1, z0);

        const c =
            this.hash2D(x0, z1);

        const d =
            this.hash2D(x1, z1);

        const ab =
            this.lerp(a, b, tx);

        const cd =
            this.lerp(c, d, tx);

        return this.lerp(ab, cd, tz);
    }


    // ============================================================
    // FRACTAL NOISE
    // ============================================================

    fractalNoise(x, z, octaves = 5) {

        let value = 0;

        let amplitude = 1;

        let frequency = 1;

        let totalAmplitude = 0;

        for (let i = 0; i < octaves; i++) {

            value +=
                this.valueNoise(
                    x * frequency,
                    z * frequency
                ) * amplitude;

            totalAmplitude += amplitude;

            amplitude *= 0.5;

            frequency *= 2;

        }

        return value / totalAmplitude;
    }


    // ============================================================
    // CONTINENT / LAND MASS
    // ============================================================

    getLandMask(x, z) {

        const nx =
            x / this.worldHalfSize;

        const nz =
            z / this.worldHalfSize;

        const distance =
            Math.sqrt(
                nx * nx +
                nz * nz
            );

        // Main continental body

        let continent =
            1 -
            this.smoothStep(
                (distance - 0.15) / 0.82
            );

        // Large secondary land influence

        const landNoise =
            this.fractalNoise(
                x * 0.00022,
                z * 0.00022,
                4
            );

        continent +=
            (landNoise - 0.5) * 0.42;

        // Western landmass

        const westX =
            (x + 3500) / 2800;

        const westZ =
            (z + 700) / 3300;

        const westDistance =
            Math.sqrt(
                westX * westX +
                westZ * westZ
            );

        const westIsland =
            1 -
            this.smoothStep(
                (westDistance - 0.45) / 0.85
            );

        continent +=
            westIsland * 0.38;

        // Eastern landmass

        const eastX =
            (x - 3900) / 3300;

        const eastZ =
            (z - 1200) / 2700;

        const eastDistance =
            Math.sqrt(
                eastX * eastX +
                eastZ * eastZ
            );

        const eastIsland =
            1 -
            this.smoothStep(
                (eastDistance - 0.40) / 0.82
            );

        continent +=
            eastIsland * 0.32;

        // Northern landmass

        const northX =
            (x - 800) / 3600;

        const northZ =
            (z - 4800) / 2500;

        const northDistance =
            Math.sqrt(
                northX * northX +
                northZ * northZ
            );

        const northIsland =
            1 -
            this.smoothStep(
                (northDistance - 0.35) / 0.8
            );

        continent +=
            northIsland * 0.25;

        return this.clamp(
            continent,
            0,
            1
        );
    }


    // ============================================================
    // GLOBAL TERRAIN HEIGHT
    // ============================================================

    getHeight(x, z) {

        if (!Number.isFinite(x)) x = 0;

        if (!Number.isFinite(z)) z = 0;

        // --------------------------------------------------------
        // Outside world
        // --------------------------------------------------------

        if (
            Math.abs(x) > this.worldHalfSize ||
            Math.abs(z) > this.worldHalfSize
        ) {

            return this.waterLevel - 2;
        }

        // --------------------------------------------------------
        // Land mask
        // --------------------------------------------------------

        const land =
            this.getLandMask(x, z);

        // --------------------------------------------------------
        // Large continental rolling terrain
        // --------------------------------------------------------

        const largeNoise =
            this.fractalNoise(
                x * 0.0017,
                z * 0.0017,
                5
            );

        const mediumNoise =
            this.fractalNoise(
                x * 0.006,
                z * 0.006,
                4
            );

        const smallNoise =
            this.fractalNoise(
                x * 0.025,
                z * 0.025,
                3
            );

        let height =

            largeNoise * 30 +

            mediumNoise * 10 +

            smallNoise * 2;

        // --------------------------------------------------------
        // Large mountain belts
        // --------------------------------------------------------

        const mountainNoise =
            this.fractalNoise(
                x * 0.00075,
                z * 0.00075,
                5
            );

        const mountainMask =
            Math.max(
                0,
                mountainNoise - 0.55
            ) / 0.45;

        height +=
            Math.pow(
                mountainMask,
                1.8
            ) * 190;

        // --------------------------------------------------------
        // Central mountain region
        // --------------------------------------------------------

        const mountainX =
            (x + 1300) / 2100;

        const mountainZ =
            (z + 900) / 3000;

        const centralDistance =
            Math.sqrt(
                mountainX * mountainX +
                mountainZ * mountainZ
            );

        const centralMountain =
            1 -
            this.smoothStep(
                (centralDistance - 0.15) / 0.8
            );

        height +=
            centralMountain *
            mountainNoise *
            95;

        // --------------------------------------------------------
        // Northern highlands
        // --------------------------------------------------------

        if (z > 2600) {

            const northFactor =
                this.clamp(
                    (z - 2600) / 2600,
                    0,
                    1
                );

            height +=
                northFactor *
                mountainNoise *
                70;
        }

        // --------------------------------------------------------
        // Desert region
        // --------------------------------------------------------

        const desertCenterX = 4200;

        const desertCenterZ = -2500;

        const dx =
            x - desertCenterX;

        const dz =
            z - desertCenterZ;

        const desertDistance =
            Math.sqrt(
                dx * dx +
                dz * dz
            );

        const desertMask =
            1 -
            this.smoothStep(
                (desertDistance - 900) / 1900
            );

        const desertNoise =
            this.fractalNoise(
                x * 0.004,
                z * 0.004,
                3
            );

        height +=
            desertMask *
            desertNoise *
            10;

        // --------------------------------------------------------
        // Coast shaping
        // --------------------------------------------------------

        if (land < 0.45) {

            const coastFactor =
                this.smoothStep(
                    land / 0.45
                );

            height *=
                coastFactor;

            height =
                this.lerp(
                    this.waterLevel - 2,
                    height,
                    coastFactor
                );
        }

        // --------------------------------------------------------
        // Beaches
        // --------------------------------------------------------

        if (
            height > this.waterLevel &&
            height < this.beachLevel + 4
        ) {

            const beachFactor =
                this.clamp(
                    (height - this.waterLevel) / 4,
                    0,
                    1
                );

            height =
                this.lerp(
                    this.waterLevel + 0.3,
                    height,
                    beachFactor
                );
        }

        // --------------------------------------------------------
        // Ocean
        // --------------------------------------------------------

        if (land < 0.25) {

            height =
                this.waterLevel -
                2 -
                (0.25 - land) * 12;
        }

        // --------------------------------------------------------
        // Protect starting region
        // --------------------------------------------------------

        const spawnDistance =
            Math.sqrt(
                x * x +
                z * z
            );

        if (spawnDistance < 350) {

            const spawnNoise =
                this.fractalNoise(
                    x * 0.012,
                    z * 0.012,
                    3
                );

            const spawnHeight =
                9 +
                spawnNoise * 3;

            const flatten =
                1 -
                this.smoothStep(
                    spawnDistance / 350
                );

            height =
                this.lerp(
                    height,
                    spawnHeight,
                    flatten
                );
        }

        // --------------------------------------------------------
        // Final limits
        // --------------------------------------------------------

        height =
            this.clamp(
                height,
                this.waterLevel - 8,
                this.maxTerrainHeight
            );

        return height;
    }


    // ============================================================
    // GROUND HEIGHT
    // ============================================================

    getGroundHeight(x, z) {

        return this.getHeight(x, z);
    }


    // ============================================================
    // NORMAL
    // ============================================================

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


    // ============================================================
    // SLOPE ANGLE
    // ============================================================

    getSlopeAngle(x, z) {

        const normal =
            this.getNormal(
                x,
                z
            );

        const dot =
            this.clamp(
                normal.y,
                -1,
                1
            );

        return Math.acos(dot);
    }


    // ============================================================
    // SLOPE DEGREES
    // ============================================================

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


    // ============================================================
    // WORLD BOUNDS
    // ============================================================

    isInsideIsland(x, z) {

        return (

            x >= -this.worldHalfSize &&

            x <= this.worldHalfSize &&

            z >= -this.worldHalfSize &&

            z <= this.worldHalfSize &&

            this.getHeight(x, z) >
                this.waterLevel - 0.05

        );
    }


    // ============================================================
    // WALKABLE
    // ============================================================

    isWalkable(x, z) {

        if (
            x < -this.worldHalfSize ||
            x > this.worldHalfSize ||
            z < -this.worldHalfSize ||
            z > this.worldHalfSize
        ) {

            return false;
        }

        const height =
            this.getHeight(
                x,
                z
            );

        if (
            height <=
            this.waterLevel + 0.15
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


    // ============================================================
    // SAFE GROUND HEIGHT
    // ============================================================

    getSafeGroundHeight(
        x,
        z,
        searchRadius = 24
    ) {

        const centerHeight =
            this.getHeight(
                x,
                z
            );

        if (
            this.isWalkable(
                x,
                z
            )
        ) {

            return centerHeight;
        }

        const samples = 16;

        let bestHeight = null;

        let bestDistance =
            Infinity;

        for (
            let i = 0;
            i < samples;
            i++
        ) {

            const angle =
                (i / samples) *
                Math.PI *
                2;

            const distance =
                searchRadius *
                (0.35 + (i % 4) * 0.2);

            const px =
                x +
                Math.cos(angle) *
                distance;

            const pz =
                z +
                Math.sin(angle) *
                distance;

            if (
                this.isWalkable(
                    px,
                    pz
                )
            ) {

                const h =
                    this.getHeight(
                        px,
                        pz
                    );

                const d =
                    Math.sqrt(
                        (px - x) *
                        (px - x) +
                        (pz - z) *
                        (pz - z)
                    );

                if (
                    d <
                    bestDistance
                ) {

                    bestDistance = d;

                    bestHeight = h;
                }
            }
        }

        if (
            bestHeight !== null
        ) {

            return bestHeight;
        }

        return centerHeight;
    }


    // ============================================================
    // SAFE POSITION SEARCH
    // ============================================================

    findSafePosition(
        centerX = 0,
        centerZ = 0,
        searchRadius = 150
    ) {

        // First try center

        if (
            this.isWalkable(
                centerX,
                centerZ
            )
        ) {

            return {

                x: centerX,

                y:
                    this.getHeight(
                        centerX,
                        centerZ
                    ) + 0.05,

                z: centerZ

            };
        }

        // Search grid

        const step = 12;

        let best = null;

        let bestDistance =
            Infinity;

        for (
            let x = -searchRadius;
            x <= searchRadius;
            x += step
        ) {

            for (
                let z = -searchRadius;
                z <= searchRadius;
                z += step
            ) {

                const px =
                    centerX + x;

                const pz =
                    centerZ + z;

                if (
                    !this.isWalkable(
                        px,
                        pz
                    )
                ) {

                    continue;
                }

                const distance =
                    Math.sqrt(
                        x * x +
                        z * z
                    );

                if (
                    distance <
                    bestDistance
                ) {

                    bestDistance =
                        distance;

                    best = {

                        x: px,

                        y:
                            this.getHeight(
                                px,
                                pz
                            ) + 0.05,

                        z: pz

                    };
                }
            }
        }

        // Emergency fallback

        if (!best) {

            best = {

                x: 0,

                y:
                    this.getHeight(
                        0,
                        0
                    ) + 0.05,

                z: 0

            };
        }

        return best;
    }


    // ============================================================
    // BIOME
    // ============================================================

    getBiome(x, z) {

        const height =
            this.getHeight(
                x,
                z
            );

        const land =
            this.getLandMask(
                x,
                z
            );

        // Ocean

        if (
            height <
            this.waterLevel
        ) {

            return "ocean";
        }

        // Coast

        if (
            height <
            this.beachLevel + 2
        ) {

            return "coast";
        }

        // Snow

        if (
            height > 165
        ) {

            return "snow";
        }

        // Mountain

        if (
            height > 115
        ) {

            return "mountain";
        }

        // Highland

        if (
            height > 70
        ) {

            return "highland";
        }

        // Desert

        const desertCenterX =
            4200;

        const desertCenterZ =
            -2500;

        const dx =
            x - desertCenterX;

        const dz =
            z - desertCenterZ;

        const desertDistance =
            Math.sqrt(
                dx * dx +
                dz * dz
            );

        if (
            desertDistance <
            2500
        ) {

            return "desert";
        }

        // Forest

        const forestNoise =
            this.fractalNoise(
                x * 0.002,
                z * 0.002,
                4
            );

        if (
            forestNoise >
            0.52
        ) {

            return "forest";
        }

        // Grassland

        return "grassland";
    }


    // ============================================================
    // VERTEX COLOR
    // ============================================================

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

        const color =
            new THREE.Color();

        switch (biome) {

            case "ocean":

                color.setRGB(
                    0.08,
                    0.18,
                    0.21
                );

                break;


            case "coast":

                color.setRGB(
                    0.72,
                    0.62,
                    0.42
                );

                break;


            case "desert":

                color.setRGB(
                    0.68,
                    0.48,
                    0.25
                );

                break;


            case "snow":

                color.setRGB(
                    0.88,
                    0.92,
                    0.94
                );

                break;


            case "mountain":

                color.setRGB(
                    0.32,
                    0.34,
                    0.31
                );

                break;


            case "highland":

                color.setRGB(
                    0.28,
                    0.42,
                    0.24
                );

                break;


            case "forest":

                color.setRGB(
                    0.16,
                    0.38,
                    0.16
                );

                break;


            case "grassland":

            default:

                color.setRGB(
                    0.30,
                    0.50,
                    0.22
                );

                break;
        }

        // --------------------------------------------------------
        // Height variation
        // --------------------------------------------------------

        const variation =
            this.valueNoise(
                x * 0.035,
                z * 0.035
            );

        const factor =
            0.90 +
            variation * 0.18;

        color.multiplyScalar(
            factor
        );

        return color;
    }


    // ============================================================
    // CHUNK KEY
    // ============================================================

    getChunkKey(
        chunkX,
        chunkZ
    ) {

        return (
            chunkX +
            "," +
            chunkZ
        );
    }


    // ============================================================
    // WORLD → CHUNK
    // ============================================================

    worldToChunk(
        x,
        z
    ) {

        return {

            x:
                Math.floor(
                    (x +
                        this.worldHalfSize) /
                    this.chunkSize
                ),

            z:
                Math.floor(
                    (z +
                        this.worldHalfSize) /
                    this.chunkSize
                )

        };
    }


    // ============================================================
    // CHUNK → WORLD
    // ============================================================

    chunkToWorld(
        chunkX,
        chunkZ
    ) {

        return {

            x:
                -this.worldHalfSize +
                chunkX *
                this.chunkSize,

            z:
                -this.worldHalfSize +
                chunkZ *
                this.chunkSize

        };
    }


    // ============================================================
    // CREATE CHUNK
    // ============================================================

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
            this.loadedChunks.has(
                key
            )
        ) {

            return this.loadedChunks.get(
                key
            );
        }

        const origin =
            this.chunkToWorld(
                chunkX,
                chunkZ
            );

        // --------------------------------------------------------
        // Geometry
        // --------------------------------------------------------

        const geometry =
            new THREE.PlaneGeometry(

                this.chunkSize,

                this.chunkSize,

                this.chunkSegments,

                this.chunkSegments

            );

        geometry.rotateX(
            -Math.PI / 2
        );

        // --------------------------------------------------------
        // Position vertices
        // --------------------------------------------------------

        const position =
            geometry.attributes.position;

        const colors = [];

        const vertexCount =
            position.count;

        for (
            let i = 0;
            i < vertexCount;
            i++
        ) {

            const localX =
                position.getX(i);

            const localZ =
                position.getZ(i);

            const worldX =
                origin.x +
                this.chunkSize / 2 +
                localX;

            const worldZ =
                origin.z +
                this.chunkSize / 2 +
                localZ;

            const height =
                this.getHeight(
                    worldX,
                    worldZ
                );

            position.setY(
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

        // --------------------------------------------------------
        // Vertex colors
        // --------------------------------------------------------

        geometry.setAttribute(

            "color",

            new THREE.Float32BufferAttribute(
                colors,
                3
            )

        );

        // --------------------------------------------------------
        // Normals
        // --------------------------------------------------------

        geometry.computeVertexNormals();

        // --------------------------------------------------------
        // Mesh
        // --------------------------------------------------------

        const mesh =
            new THREE.Mesh(
                geometry,
                this.material
            );

        mesh.name =
            "TerrainChunk_" +
            chunkX +
            "_" +
            chunkZ;

        mesh.position.set(
            0,
            0,
            0
        );

        mesh.receiveShadow = true;

        mesh.castShadow = false;

        mesh.frustumCulled = true;

        // --------------------------------------------------------
        // Chunk metadata
        // --------------------------------------------------------

        mesh.userData = {

            chunkX,

            chunkZ,

            key,

            originX:
                origin.x,

            originZ:
                origin.z

        };

        this.root.add(
            mesh
        );

        this.loadedChunks.set(
            key,
            mesh
        );

        this.chunkMeshes.set(
            key,
            mesh
        );

        this.chunks.set(
            key,
            {

                x: chunkX,

                z: chunkZ,

                mesh,

                loaded: true

            }
        );

        return mesh;
    }


    // ============================================================
    // UNLOAD CHUNK
    // ============================================================

    unloadChunk(
        chunkX,
        chunkZ
    ) {

        const key =
            this.getChunkKey(
                chunkX,
                chunkZ
            );

        const mesh =
            this.loadedChunks.get(
                key
            );

        if (!mesh) {

            return;
        }

        this.root.remove(
            mesh
        );

        if (
            mesh.geometry
        ) {

            mesh.geometry.dispose();
        }

        this.loadedChunks.delete(
            key
        );

        this.chunkMeshes.delete(
            key
        );

        const chunk =
            this.chunks.get(
                key
            );

        if (chunk) {

            chunk.loaded = false;
        }
    }


    // ============================================================
    // REQUIRED CHUNKS
    // ============================================================

    getRequiredChunks(
        playerX,
        playerZ
    ) {

        const center =
            this.worldToChunk(
                playerX,
                playerZ
            );

        const required = [];

        for (
            let dz =
                -this.renderRadius;

            dz <=
                this.renderRadius;

            dz++
        ) {

            for (
                let dx =
                    -this.renderRadius;

                dx <=
                    this.renderRadius;

                dx++
            ) {

                const chunkX =
                    center.x + dx;

                const chunkZ =
                    center.z + dz;

                const world =
                    this.chunkToWorld(
                        chunkX,
                        chunkZ
                    );

                if (
                    world.x +
                        this.chunkSize <
                        -this.worldHalfSize ||

                    world.x >
                        this.worldHalfSize ||

                    world.z +
                        this.chunkSize <
                        -this.worldHalfSize ||

                    world.z >
                        this.worldHalfSize
                ) {

                    continue;
                }

                required.push({

                    x: chunkX,

                    z: chunkZ,

                    distance:
                        Math.sqrt(
                            dx * dx +
                            dz * dz
                        )

                });
            }
        }

        required.sort(
            (a, b) =>
                a.distance -
                b.distance
        );

        return required;
    }


    // ============================================================
    // STREAMING UPDATE
    // ============================================================

    update(
        playerX,
        playerZ
    ) {

        if (!this.enabled) {

            return;
        }

        if (
            !Number.isFinite(
                playerX
            )
        ) {

            playerX = 0;
        }

        if (
            !Number.isFinite(
                playerZ
            )
        ) {

            playerZ = 0;
        }

        playerX =
            this.clamp(
                playerX,
                -this.worldHalfSize,
                this.worldHalfSize
            );

        playerZ =
            this.clamp(
                playerZ,
                -this.worldHalfSize,
                this.worldHalfSize
            );

        const center =
            this.worldToChunk(
                playerX,
                playerZ
            );

        const chunkChanged =

            center.x !==
                this.currentChunkX ||

            center.z !==
                this.currentChunkZ;

        if (
            !chunkChanged &&
            this.initialized
        ) {

            return;
        }

        this.currentChunkX =
            center.x;

        this.currentChunkZ =
            center.z;

        this.lastPlayerX =
            playerX;

        this.lastPlayerZ =
            playerZ;

        // --------------------------------------------------------
        // Load required chunks
        // --------------------------------------------------------

        const required =
            this.getRequiredChunks(
                playerX,
                playerZ
            );

        for (
            const chunk
            of required
        ) {

            const key =
                this.getChunkKey(
                    chunk.x,
                    chunk.z
                );

            if (
                !this.loadedChunks.has(
                    key
                )
            ) {

                this.createChunk(
                    chunk.x,
                    chunk.z
                );
            }
        }

        // --------------------------------------------------------
        // Unload far chunks
        // --------------------------------------------------------

        const unloadList = [];

        for (
            const [
                key,
                mesh
            ]
            of this.loadedChunks
        ) {

            const data =
                mesh.userData;

            const dx =
                Math.abs(
                    data.chunkX -
                    center.x
                );

            const dz =
                Math.abs(
                    data.chunkZ -
                    center.z
                );

            if (
                dx >
                    this.unloadRadius ||
                dz >
                    this.unloadRadius
            ) {

                unloadList.push(
                    data
                );
            }
        }

        for (
            const data
            of unloadList
        ) {

            this.unloadChunk(
                data.chunkX,
                data.chunkZ
            );
        }

        this.enforceChunkLimit();

        this.initialized = true;

        console.log(
            "World Chunk:",
            center.x,
            center.z,
            "| Loaded:",
            this.loadedChunks.size
        );
    }


    // ============================================================
    // CHUNK LIMIT
    // ============================================================

    enforceChunkLimit() {

        if (
            this.loadedChunks.size <=
            this.maxLoadedChunks
        ) {

            return;
        }

        const centerX =
            this.currentChunkX;

        const centerZ =
            this.currentChunkZ;

        const chunks = [];

        for (
            const [
                key,
                mesh
            ]
            of this.loadedChunks
        ) {

            const data =
                mesh.userData;

            const dx =
                data.chunkX -
                centerX;

            const dz =
                data.chunkZ -
                centerZ;

            chunks.push({

                key,

                distance:
                    Math.sqrt(
                        dx * dx +
                        dz * dz
                    )

            });
        }

        chunks.sort(
            (a, b) =>
                b.distance -
                a.distance
        );

        while (
            this.loadedChunks.size >
            this.maxLoadedChunks &&
            chunks.length
        ) {

            const farthest =
                chunks.shift();

            const mesh =
                this.loadedChunks.get(
                    farthest.key
                );

            if (!mesh) {

                continue;
            }

            const data =
                mesh.userData;

            this.unloadChunk(
                data.chunkX,
                data.chunkZ
            );
        }
    }


    // ============================================================
    // CHUNK INFORMATION
    // ============================================================

    getChunk(
        chunkX,
        chunkZ
    ) {

        return this.chunks.get(
            this.getChunkKey(
                chunkX,
                chunkZ
            )
        );
    }


    // ============================================================
    // WORLD POSITION INFORMATION
    // ============================================================

    getWorldPosition(
        x,
        z
    ) {

        const chunk =
            this.worldToChunk(
                x,
                z
            );

        return {

            x,

            z,

            chunkX:
                chunk.x,

            chunkZ:
                chunk.z,

            chunkKey:
                this.getChunkKey(
                    chunk.x,
                    chunk.z
                ),

            height:
                this.getHeight(
                    x,
                    z
                ),

            biome:
                this.getBiome(
                    x,
                    z
                )

        };
    }


    // ============================================================
    // PLAYER CHUNK
    // ============================================================

    getPlayerChunk() {

        if (
            this.currentChunkX === null
        ) {

            return null;
        }

        return {

            x:
                this.currentChunkX,

            z:
                this.currentChunkZ,

            key:
                this.getChunkKey(
                    this.currentChunkX,
                    this.currentChunkZ
                )

        };
    }


    // ============================================================
    // WORLD STATS
    // ============================================================

    getTerrainInfo(
        x = 0,
        z = 0
    ) {

        return {

            worldSize:
                this.worldSize,

            worldHalfSize:
                this.worldHalfSize,

            chunkSize:
                this.chunkSize,

            loadedChunks:
                this.loadedChunks.size,

            maxLoadedChunks:
                this.maxLoadedChunks,

            playerChunk:
                this.getPlayerChunk(),

            height:
                this.getHeight(
                    x,
                    z
                ),

            slope:
                this.getSlopeDegrees(
                    x,
                    z
                ),

            biome:
                this.getBiome(
                    x,
                    z
                )

        };
    }


    // ============================================================
    // ENABLE
    // ============================================================

    enable() {

        this.enabled = true;
    }


    // ============================================================
    // DISABLE
    // ============================================================

    disable() {

        this.enabled = false;
    }


    // ============================================================
    // CLEAR CHUNKS
    // ============================================================

    clear() {

        const chunks = [];

        for (
            const mesh
            of this.loadedChunks.values()
        ) {

            chunks.push(
                mesh.userData
            );
        }

        for (
            const data
            of chunks
        ) {

            this.unloadChunk(
                data.chunkX,
                data.chunkZ
            );
        }

        this.chunks.clear();

        this.loadedChunks.clear();

        this.chunkMeshes.clear();

        this.currentChunkX = null;

        this.currentChunkZ = null;

        this.initialized = false;
    }


    // ============================================================
    // DISPOSE
    // ============================================================

    dispose() {

        this.clear();

        if (
            this.material
        ) {

            this.material.dispose();
        }

        if (
            this.oceanMaterial
        ) {

            this.oceanMaterial.dispose();
        }

        if (
            this.root &&
            this.scene
        ) {

            this.scene.remove(
                this.root
            );
        }

        this.scene = null;

        this.root = null;

        this.chunks.clear();

        this.loadedChunks.clear();

        this.chunkMeshes.clear();

        console.log(
            "WILD ISLES Terrain disposed"
        );
    }
}


// ============================================================
// END OF TERRAIN.JS
// ============================================================
