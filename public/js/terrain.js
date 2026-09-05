// ============================================================
// WILD ISLES
// VEYRA WORLD
// public/js/terrain.js
//
// REALISTIC HUGE WORLD TERRAIN SYSTEM v2.0
//
// Features:
// - 16km x 16km playable world
// - Chunk streaming
// - Procedural terrain
// - Forest / Grassland / Desert / Mountain / Snow / Coast
// - Procedural ground texture
// - Terrain vertex color variation
// - Smooth player grounding
// - Safe spawn position
// - Slope detection
// - Mobile optimization
// - Desktop optimization
//
// Three.js r180
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ============================================================
// CLASS
// ============================================================

export class VeyraTerrain {

    constructor(scene) {

        this.scene = scene;

        // ====================================================
        // WORLD CONFIGURATION
        // ====================================================

        this.worldSize = 16384;
        this.worldHalfSize = this.worldSize / 2;

        this.chunkSize = 256;

        // 32 gives good performance.
        // Later we can introduce LOD for 48/64 segments.
        this.chunkSegments = 32;

        this.renderRadius =
            window.innerWidth <= 900 ? 1 : 2;

        this.unloadRadius =
            window.innerWidth <= 900 ? 2 : 3;

        this.maxLoadedChunks =
            window.innerWidth <= 900 ? 9 : 25;

        // ====================================================
        // TERRAIN LEVELS
        // ====================================================

        this.waterLevel = 1.8;
        this.beachLevel = 5.5;

        this.maxTerrainHeight = 260;

        this.maxWalkableSlope = 38;

        // ====================================================
        // CHUNK STORAGE
        // ====================================================

        this.chunks = new Map();
        this.loadedChunks = new Set();
        this.chunkMeshes = new Map();

        // ====================================================
        // STREAMING STATE
        // ====================================================

        this.currentChunkX = null;
        this.currentChunkZ = null;

        this.lastPlayerX = Infinity;
        this.lastPlayerZ = Infinity;

        this.streamingEnabled = true;
        this.initialized = false;

        // ====================================================
        // ROOT
        // ====================================================

        this.root = new THREE.Group();
        this.root.name = "VeyraWorldTerrain";

        this.scene.add(this.root);

        // ====================================================
        // MATERIALS
        // ====================================================

        this.groundTexture = this.createGroundTexture();

        this.groundMaterial =
            new THREE.MeshStandardMaterial({

                map: this.groundTexture,

                roughness: 0.96,

                metalness: 0.0,

                vertexColors: true,

                side: THREE.FrontSide
            });


        // ====================================================
        // BEACH MATERIAL
        // ====================================================

        this.beachTexture = this.createBeachTexture();

        this.beachMaterial =
            new THREE.MeshStandardMaterial({

                map: this.beachTexture,

                roughness: 1.0,

                metalness: 0.0,

                vertexColors: true
            });


        // ====================================================
        // WATER MATERIAL
        // ====================================================

        this.oceanMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x234f58,

                roughness: 0.18,

                metalness: 0.04,

                transparent: true,

                opacity: 0.84,

                side: THREE.DoubleSide
            });


        // ====================================================
        // CREATE WORLD
        // ====================================================

        this.createWorldOcean();

        console.log(
            "%cVeyra Terrain v2.0 READY",
            "color:#7fd8ff;font-weight:bold"
        );

        console.log(
            "World Size:",
            this.worldSize,
            "x",
            this.worldSize
        );

    }


    // ============================================================
    // PROCEDURAL GROUND TEXTURE
    // ============================================================

    createGroundTexture() {

        const size = 512;

        const canvas =
            document.createElement("canvas");

        canvas.width = size;
        canvas.height = size;

        const ctx =
            canvas.getContext("2d");

        const image =
            ctx.createImageData(size, size);

        for (let y = 0; y < size; y++) {

            for (let x = 0; x < size; x++) {

                const index =
                    (y * size + x) * 4;

                const wave1 =
                    Math.sin(x * 0.055);

                const wave2 =
                    Math.sin(y * 0.047);

                const wave3 =
                    Math.sin(
                        (x + y) * 0.025
                    );

                const random =
                    Math.random() * 16;

                let value =
                    92 +
                    wave1 * 8 +
                    wave2 * 7 +
                    wave3 * 6 +
                    random;

                value =
                    THREE.MathUtils.clamp(
                        value,
                        50,
                        145
                    );

                image.data[index] =
                    value * 0.73;

                image.data[index + 1] =
                    value * 0.88;

                image.data[index + 2] =
                    value * 0.61;

                image.data[index + 3] =
                    255;
            }
        }

        ctx.putImageData(
            image,
            0,
            0
        );

        // Small natural variation
        ctx.globalAlpha = 0.12;

        for (let i = 0; i < 3500; i++) {

            const x =
                Math.random() * size;

            const y =
                Math.random() * size;

            const radius =
                Math.random() * 2.4 + 0.3;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                Math.random() > 0.5
                    ? "#263a20"
                    : "#b1a675";

            ctx.fill();
        }

        ctx.globalAlpha = 1;

        const texture =
            new THREE.CanvasTexture(canvas);

        texture.wrapS =
            THREE.RepeatWrapping;

        texture.wrapT =
            THREE.RepeatWrapping;

        texture.repeat.set(18, 18);

        texture.anisotropy =
            Math.min(
                8,
                this.rendererAnisotropy()
            );

        texture.colorSpace =
            THREE.SRGBColorSpace;

        texture.needsUpdate = true;

        return texture;
    }


    // ============================================================
    // BEACH TEXTURE
    // ============================================================

    createBeachTexture() {

        const size = 256;

        const canvas =
            document.createElement("canvas");

        canvas.width = size;
        canvas.height = size;

        const ctx =
            canvas.getContext("2d");

        const image =
            ctx.createImageData(size, size);

        for (let y = 0; y < size; y++) {

            for (let x = 0; x < size; x++) {

                const index =
                    (y * size + x) * 4;

                const n =
                    Math.random() * 20;

                image.data[index] =
                    155 + n;

                image.data[index + 1] =
                    139 + n;

                image.data[index + 2] =
                    91 + n;

                image.data[index + 3] =
                    255;
            }
        }

        ctx.putImageData(
            image,
            0,
            0
        );

        const texture =
            new THREE.CanvasTexture(canvas);

        texture.wrapS =
            THREE.RepeatWrapping;

        texture.wrapT =
            THREE.RepeatWrapping;

        texture.repeat.set(12, 12);

        texture.colorSpace =
            THREE.SRGBColorSpace;

        return texture;
    }


    // ============================================================
    // ANISOTROPY
    // ============================================================

    rendererAnisotropy() {

        return 4;
    }


    // ============================================================
    // DETERMINISTIC HASH
    // ============================================================

    hash2D(x, z) {

        let h =
            x * 374761393 +
            z * 668265263;

        h =
            (h ^ (h >> 13)) * 1274126177;

        h =
            h ^ (h >> 16);

        return (
            (h >>> 0) /
            4294967295
        );
    }


    // ============================================================
    // SMOOTH INTERPOLATION
    // ============================================================

    smoothStep(t) {

        return (
            t * t *
            (3 - 2 * t)
        );
    }


    // ============================================================
    // VALUE NOISE
    // ============================================================

    valueNoise(x, z, scale = 1) {

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

        const tx =
            this.smoothStep(
                x - x0
            );

        const tz =
            this.smoothStep(
                z - z0
            );

        const a =
            this.hash2D(
                x0,
                z0
            );

        const b =
            this.hash2D(
                x1,
                z0
            );

        const c =
            this.hash2D(
                x0,
                z1
            );

        const d =
            this.hash2D(
                x1,
                z1
            );

        const ab =
            THREE.MathUtils.lerp(
                a,
                b,
                tx
            );

        const cd =
            THREE.MathUtils.lerp(
                c,
                d,
                tx
            );

        return THREE.MathUtils.lerp(
            ab,
            cd,
            tz
        );
    }


    // ============================================================
    // FRACTAL NOISE
    // ============================================================

    fractalNoise(x, z) {

        let value = 0;

        let amplitude = 1;

        let totalAmplitude = 0;

        let frequency = 1;

        const octaves = 5;

        for (
            let i = 0;
            i < octaves;
            i++
        ) {

            value +=
                this.valueNoise(
                    x * frequency,
                    z * frequency,
                    90 / frequency
                ) * amplitude;

            totalAmplitude +=
                amplitude;

            amplitude *= 0.5;

            frequency *= 2;
        }

        return (
            value /
            totalAmplitude
        );
    }


    // ============================================================
    // RIDGED NOISE
    // ============================================================

    ridgedNoise(x, z) {

        const n =
            this.fractalNoise(
                x,
                z
            );

        return (
            1 -
            Math.abs(
                n * 2 - 1
            )
        );
    }


    // ============================================================
    // LAND MASK
    // ============================================================

    getLandMask(x, z) {

        const nx =
            x /
            this.worldHalfSize;

        const nz =
            z /
            this.worldHalfSize;

        const distance =
            Math.sqrt(
                nx * nx +
                nz * nz
            );

        // Main island
        let main =
            1 -
            Math.pow(
                Math.min(
                    distance,
                    1.15
                ),
                2.15
            );

        main =
            THREE.MathUtils.clamp(
                main,
                0,
                1
            );


        // Natural coastline
        const coastNoise =
            this.fractalNoise(
                x * 0.28,
                z * 0.28
            );

        main +=
            (coastNoise - 0.5) *
            0.22;


        // West extension
        const westX =
            x + 2800;

        const westZ =
            z - 800;

        const westDist =
            Math.sqrt(
                westX * westX +
                westZ * westZ
            ) / 2300;

        let west =
            1 -
            westDist;

        west =
            THREE.MathUtils.clamp(
                west,
                0,
                1
            );


        // East extension
        const eastX =
            x - 3100;

        const eastZ =
            z + 1000;

        const eastDist =
            Math.sqrt(
                eastX * eastX +
                eastZ * eastZ
            ) / 2100;

        let east =
            1 -
            eastDist;

        east =
            THREE.MathUtils.clamp(
                east,
                0,
                1
            );


        // Northern extension
        const northX =
            x + 500;

        const northZ =
            z - 3900;

        const northDist =
            Math.sqrt(
                northX * northX +
                northZ * northZ
            ) / 2100;

        let north =
            1 -
            northDist;

        north =
            THREE.MathUtils.clamp(
                north,
                0,
                1
            );


        const result =
            Math.max(
                main,
                west * 0.82,
                east * 0.78,
                north * 0.82
            );

        return THREE.MathUtils.clamp(
            result,
            0,
            1
        );
    }


    // ============================================================
    // DESERT MASK
    // ============================================================

    getDesertMask(x, z) {

        const centerX =
            3200;

        const centerZ =
            2700;

        const dx =
            x - centerX;

        const dz =
            z - centerZ;

        const distance =
            Math.sqrt(
                dx * dx +
                dz * dz
            );

        let mask =
            1 -
            distance / 2600;

        mask =
            THREE.MathUtils.clamp(
                mask,
                0,
                1
            );

        return (
            mask *
            this.getLandMask(
                x,
                z
            )
        );
    }


    // ============================================================
    // MOUNTAIN MASK
    // ============================================================

    getMountainMask(x, z) {

        const central =
            Math.exp(
                -(
                    x * x +
                    (z + 1200) *
                    (z + 1200)
                ) /
                (2 * 2500 * 2500)
            );

        const north =
            Math.exp(
                -(
                    (x - 400) *
                    (x - 400) +
                    (z + 3900) *
                    (z + 3900)
                ) /
                (2 * 1700 * 1700)
            );

        const ridge =
            this.ridgedNoise(
                x * 0.75,
                z * 0.75
            );

        return THREE.MathUtils.clamp(
            Math.max(
                central,
                north
            ) *
            (0.55 + ridge * 0.7),
            0,
            1
        );
    }


    // ============================================================
    // HEIGHT
    // ============================================================

    getHeight(x, z) {

        const land =
            this.getLandMask(
                x,
                z
            );

        if (land < 0.02) {

            return this.waterLevel - 2;
        }


        // --------------------------------------------------------
        // LARGE TERRAIN
        // --------------------------------------------------------

        const large =
            this.fractalNoise(
                x * 0.45,
                z * 0.45
            );


        // --------------------------------------------------------
        // MEDIUM TERRAIN
        // --------------------------------------------------------

        const medium =
            this.fractalNoise(
                x * 1.8,
                z * 1.8
            );


        // --------------------------------------------------------
        // DETAIL
        // --------------------------------------------------------

        const detail =
            this.fractalNoise(
                x * 5,
                z * 5
            );


        // --------------------------------------------------------
        // MOUNTAINS
        // --------------------------------------------------------

        const mountainMask =
            this.getMountainMask(
                x,
                z
            );

        const ridge =
            this.ridgedNoise(
                x * 0.8,
                z * 0.8
            );

        const mountainHeight =
            mountainMask *
            (
                50 +
                ridge * 150
            );


        // --------------------------------------------------------
        // HILLS
        // --------------------------------------------------------

        let height =
            large * 30 +
            medium * 13 +
            detail * 3;


        height +=
            mountainHeight;


        // --------------------------------------------------------
        // DESERT
        // --------------------------------------------------------

        const desert =
            this.getDesertMask(
                x,
                z
            );

        height +=
            desert *
            (
                medium * 18
            );


        // --------------------------------------------------------
        // COAST
        // --------------------------------------------------------

        const coast =
            THREE.MathUtils.smoothstep(
                land,
                0.05,
                0.42
            );

        height *=
            0.35 +
            coast * 0.65;


        // --------------------------------------------------------
        // BEACH
        // --------------------------------------------------------

        if (land < 0.48) {

            const beachBlend =
                THREE.MathUtils.smoothstep(
                    land,
                    0.02,
                    0.48
                );

            height =
                THREE.MathUtils.lerp(
                    this.waterLevel - 0.5,
                    height,
                    beachBlend
                );
        }


        // --------------------------------------------------------
        // DEEP WATER
        // --------------------------------------------------------

        if (land < 0.12) {

            const depth =
                (0.12 - land) *
                20;

            height =
                this.waterLevel -
                depth;
        }


        // --------------------------------------------------------
        // SPAWN AREA FLATTEN
        // --------------------------------------------------------

        const spawnDistance =
            Math.sqrt(
                x * x +
                z * z
            );

        if (
            spawnDistance <
            180
        ) {

            const blend =
                THREE.MathUtils.smoothstep(
                    spawnDistance,
                    80,
                    180
                );

            const flatNoise =
                this.fractalNoise(
                    x * 0.5,
                    z * 0.5
                );

            const spawnHeight =
                10 +
                flatNoise * 2;

            height =
                THREE.MathUtils.lerp(
                    spawnHeight,
                    height,
                    blend
                );
        }


        // --------------------------------------------------------
        // CLAMP
        // --------------------------------------------------------

        height =
            THREE.MathUtils.clamp(
                height,
                this.waterLevel - 25,
                this.maxTerrainHeight
            );


        return height;
    }


    // ============================================================
    // GROUND HEIGHT
    // ============================================================

    getGroundHeight(x, z) {

        return this.getHeight(
            x,
            z
        );
    }


    // ============================================================
    // TERRAIN NORMAL
    // ============================================================

    getNormal(x, z) {

        const delta = 2.0;

        const hL =
            this.getHeight(
                x - delta,
                z
            );

        const hR =
            this.getHeight(
                x + delta,
                z
            );

        const hD =
            this.getHeight(
                x,
                z - delta
            );

        const hU =
            this.getHeight(
                x,
                z + delta
            );

        const normal =
            new THREE.Vector3(
                hL - hR,
                delta * 2,
                hD - hU
            );

        normal.normalize();

        return normal;
    }


    // ============================================================
    // SLOPE
    // ============================================================

    getSlopeAngle(x, z) {

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


    getSlopeAngleDegrees(x, z) {

        return THREE.MathUtils.radToDeg(
            this.getSlopeAngle(
                x,
                z
            )
        );
    }


    // ============================================================
    // ISLAND CHECK
    // ============================================================

    isInsideIsland(x, z) {

        return (
            this.getLandMask(
                x,
                z
            ) > 0.25
        );
    }


    // ============================================================
    // WALKABLE
    // ============================================================

    isWalkable(x, z) {

        if (
            !this.isInsideIsland(
                x,
                z
            )
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
            this.waterLevel + 0.25
        ) {

            return false;
        }

        const slope =
            this.getSlopeAngleDegrees(
                x,
                z
            );

        return (
            slope <=
            this.maxWalkableSlope
        );
    }


    // ============================================================
    // SAFE GROUND
    // ============================================================

    getSafeGroundHeight(
        x,
        z
    ) {

        const searchRadius = 20;

        const step = 5;

        for (
            let dz = -searchRadius;
            dz <= searchRadius;
            dz += step
        ) {

            for (
                let dx = -searchRadius;
                dx <= searchRadius;
                dx += step
            ) {

                const px =
                    x + dx;

                const pz =
                    z + dz;

                if (
                    this.isWalkable(
                        px,
                        pz
                    )
                ) {

                    return this.getHeight(
                        px,
                        pz
                    );
                }
            }
        }

        return this.getHeight(
            x,
            z
        );
    }


    // ============================================================
    // FIND SAFE POSITION
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
                    ),

                z: centerZ
            };
        }


        // Deterministic/random search
        for (
            let i = 0;
            i < 250;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;

            const distance =
                Math.random() *
                searchRadius;

            const x =
                centerX +
                Math.cos(angle) *
                distance;

            const z =
                centerZ +
                Math.sin(angle) *
                distance;

            if (
                this.isWalkable(
                    x,
                    z
                )
            ) {

                return {

                    x,

                    y:
                        this.getHeight(
                            x,
                            z
                        ),

                    z
                };
            }
        }


        // Guaranteed fallback
        const fallbackX =
            centerX;

        const fallbackZ =
            centerZ;

        return {

            x: fallbackX,

            y:
                this.getSafeGroundHeight(
                    fallbackX,
                    fallbackZ
                ),

            z: fallbackZ
        };
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

        const desert =
            this.getDesertMask(
                x,
                z
            );

        const mountain =
            this.getMountainMask(
                x,
                z
            );


        if (
            height <=
            this.waterLevel
        ) {

            return "ocean";
        }


        if (
            height <=
            this.beachLevel
        ) {

            return "coast";
        }


        if (
            mountain > 0.72 &&
            height > 165
        ) {

            return "snow";
        }


        if (
            mountain > 0.45
        ) {

            return "mountain";
        }


        if (
            desert > 0.52
        ) {

            return "desert";
        }


        if (
            height > 100
        ) {

            return "highland";
        }


        const forestNoise =
            this.fractalNoise(
                x * 0.7,
                z * 0.7
            );

        if (
            forestNoise > 0.51
        ) {

            return "forest";
        }


        return "grassland";
    }


    // ============================================================
    // VERTEX COLOR
    // ============================================================

    getVertexColor(
        x,
        z,
        height
    ) {

        const biome =
            this.getBiome(
                x,
                z
            );

        const color =
            new THREE.Color();


        // --------------------------------------------------------
        // OCEAN
        // --------------------------------------------------------

        if (
            biome === "ocean"
        ) {

            color.setRGB(
                0.08,
                0.22,
                0.25
            );

            return color;
        }


        // --------------------------------------------------------
        // COAST
        // --------------------------------------------------------

        if (
            biome === "coast"
        ) {

            const variation =
                this.valueNoise(
                    x,
                    z,
                    18
                );

            color.setRGB(
                0.62 +
                    variation * 0.08,

                0.57 +
                    variation * 0.07,

                0.39 +
                    variation * 0.05
            );

            return color;
        }


        // --------------------------------------------------------
        // DESERT
        // --------------------------------------------------------

        if (
            biome === "desert"
        ) {

            const variation =
                this.valueNoise(
                    x,
                    z,
                    30
                );

            color.setRGB(
                0.67 +
                    variation * 0.12,

                0.53 +
                    variation * 0.10,

                0.32 +
                    variation * 0.07
            );

            return color;
        }


        // --------------------------------------------------------
        // SNOW
        // --------------------------------------------------------

        if (
            biome === "snow"
        ) {

            const variation =
                this.valueNoise(
                    x,
                    z,
                    25
                );

            color.setRGB(
                0.74 +
                    variation * 0.08,

                0.79 +
                    variation * 0.08,

                0.81 +
                    variation * 0.09
            );

            return color;
        }


        // --------------------------------------------------------
        // MOUNTAIN
        // --------------------------------------------------------

        if (
            biome === "mountain"
        ) {

            const variation =
                this.valueNoise(
                    x,
                    z,
                    28
                );

            color.setRGB(
                0.30 +
                    variation * 0.12,

                0.32 +
                    variation * 0.10,

                0.28 +
                    variation * 0.08
            );

            return color;
        }


        // --------------------------------------------------------
        // HIGHLAND
        // --------------------------------------------------------

        if (
            biome === "highland"
        ) {

            const variation =
                this.valueNoise(
                    x,
                    z,
                    35
                );

            color.setRGB(
                0.32 +
                    variation * 0.10,

                0.42 +
                    variation * 0.11,

                0.26 +
                    variation * 0.07
            );

            return color;
        }


        // --------------------------------------------------------
        // FOREST
        // --------------------------------------------------------

        if (
            biome === "forest"
        ) {

            const variation =
                this.valueNoise(
                    x,
                    z,
                    25
                );

            color.setRGB(
                0.20 +
                    variation * 0.08,

                0.34 +
                    variation * 0.13,

                0.16 +
                    variation * 0.07
            );

            return color;
        }


        // --------------------------------------------------------
        // GRASSLAND
        // --------------------------------------------------------

        const variation =
            this.valueNoise(
                x,
                z,
                30
            );

        color.setRGB(
            0.28 +
                variation * 0.10,

            0.45 +
                variation * 0.13,

            0.20 +
                variation * 0.08
        );

        return color;
    }


    // ============================================================
    // CHUNK COORDINATES
    // ============================================================

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


    // ============================================================
    // CREATE WORLD OCEAN
    // ============================================================

    createWorldOcean() {

        // Ocean is intentionally larger than
        // the currently loaded terrain chunks.

        const oceanSize =
            this.worldSize *
            1.35;

        const geometry =
            new THREE.PlaneGeometry(
                oceanSize,
                oceanSize,
                1,
                1
            );

        geometry.rotateX(
            -Math.PI / 2
        );

        const material =
            new THREE.MeshStandardMaterial({

                color: 0x173e48,

                roughness: 0.2,

                metalness: 0.05,

                transparent: true,

                opacity: 0.88,

                side: THREE.DoubleSide
            });

        this.ocean =
            new THREE.Mesh(
                geometry,
                material
            );

        this.ocean.name =
            "VeyraWorldOcean";

        this.ocean.position.y =
            this.waterLevel;

        this.ocean.receiveShadow =
            true;

        this.ocean.castShadow =
            false;

        this.root.add(
            this.ocean
        );
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
            this.chunks.has(key)
        ) {

            return this.chunks.get(
                key
            );
        }


        const origin =
            this.chunkToWorld(
                chunkX,
                chunkZ
            );


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


        const positions =
            geometry.attributes.position;

        const colors =
            new Float32Array(
                positions.count * 3
            );


        // --------------------------------------------------------
        // HEIGHT + COLOR
        // --------------------------------------------------------

        for (
            let i = 0;
            i < positions.count;
            i++
        ) {

            const localX =
                positions.getX(i);

            const localZ =
                positions.getZ(i);

            const worldX =
                origin.x +
                localX +
                this.chunkSize / 2;

            const worldZ =
                origin.z +
                localZ +
                this.chunkSize / 2;

            const height =
                this.getHeight(
                    worldX,
                    worldZ
                );


            positions.setY(
                i,
                height
            );


            const color =
                this.getVertexColor(
                    worldX,
                    worldZ,
                    height
                );


            colors[i * 3] =
                color.r;

            colors[i * 3 + 1] =
                color.g;

            colors[i * 3 + 2] =
                color.b;
        }


        geometry.setAttribute(
            "color",
            new THREE.BufferAttribute(
                colors,
                3
            )
        );


        geometry.computeVertexNormals();


        const mesh =
            new THREE.Mesh(
                geometry,
                this.groundMaterial
            );


        mesh.name =
            `TerrainChunk_${chunkX}_${chunkZ}`;


        mesh.position.set(
            0,
            0,
            0
        );


        mesh.receiveShadow =
            true;

        mesh.castShadow =
            false;


        this.root.add(
            mesh
        );


        const data = {

            key,

            x: chunkX,

            z: chunkZ,

            mesh,

            geometry,

            lastUsed:
                performance.now()
        };


        this.chunks.set(
            key,
            data
        );

        this.loadedChunks.add(
            key
        );

        this.chunkMeshes.set(
            key,
            mesh
        );


        return data;
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

        const chunk =
            this.chunks.get(
                key
            );


        if (!chunk) {

            return;
        }


        if (
            chunk.mesh
        ) {

            this.root.remove(
                chunk.mesh
            );
        }


        if (
            chunk.geometry
        ) {

            chunk.geometry.dispose();
        }


        this.chunks.delete(
            key
        );

        this.loadedChunks.delete(
            key
        );

        this.chunkMeshes.delete(
            key
        );
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

                const cx =
                    center.x + dx;

                const cz =
                    center.z + dz;


                const distance =
                    Math.max(
                        Math.abs(dx),
                        Math.abs(dz)
                    );


                if (
                    distance <=
                    this.renderRadius
                ) {

                    required.push({
                        x: cx,
                        z: cz,
                        distance
                    });
                }
            }
        }


        // Nearest chunks first
        required.sort(
            (a, b) =>
                a.distance -
                b.distance
        );


        return required;
    }


    // ============================================================
    // UPDATE STREAMING
    // ============================================================

    update(
        playerX,
        playerZ
    ) {

        if (
            !this.streamingEnabled
        ) {

            return;
        }


        if (
            !Number.isFinite(
                playerX
            ) ||
            !Number.isFinite(
                playerZ
            )
        ) {

            return;
        }


        const current =
            this.worldToChunk(
                playerX,
                playerZ
            );


        const chunkChanged =
            current.x !==
                this.currentChunkX ||
            current.z !==
                this.currentChunkZ;


        if (
            !chunkChanged &&
            Math.abs(
                playerX -
                this.lastPlayerX
            ) < 24 &&
            Math.abs(
                playerZ -
                this.lastPlayerZ
            ) < 24
        ) {

            return;
        }


        this.currentChunkX =
            current.x;

        this.currentChunkZ =
            current.z;

        this.lastPlayerX =
            playerX;

        this.lastPlayerZ =
            playerZ;


        const required =
            this.getRequiredChunks(
                playerX,
                playerZ
            );


        // --------------------------------------------------------
        // LOAD
        // --------------------------------------------------------

        for (
            const item of required
        ) {

            const key =
                this.getChunkKey(
                    item.x,
                    item.z
                );

            if (
                !this.chunks.has(
                    key
                )
            ) {

                this.createChunk(
                    item.x,
                    item.z
                );
            }


            const chunk =
                this.chunks.get(
                    key
                );

            if (chunk) {

                chunk.lastUsed =
                    performance.now();
            }
        }


        // --------------------------------------------------------
        // UNLOAD DISTANT
        // --------------------------------------------------------

        const keys =
            Array.from(
                this.chunks.keys()
            );


        for (
            const key of keys
        ) {

            const chunk =
                this.chunks.get(
                    key
                );

            if (!chunk) {

                continue;
            }


            const dx =
                Math.abs(
                    chunk.x -
                    current.x
                );

            const dz =
                Math.abs(
                    chunk.z -
                    current.z
                );


            const distance =
                Math.max(
                    dx,
                    dz
                );


            if (
                distance >
                this.unloadRadius
            ) {

                this.unloadChunk(
                    chunk.x,
                    chunk.z
                );
            }
        }


        this.enforceChunkLimit();
    }


    // ============================================================
    // CHUNK LIMIT
    // ============================================================

    enforceChunkLimit() {

        if (
            this.chunks.size <=
            this.maxLoadedChunks
        ) {

            return;
        }


        const currentX =
            this.currentChunkX;

        const currentZ =
            this.currentChunkZ;


        const chunks =
            Array.from(
                this.chunks.values()
            );


        chunks.sort(
            (a, b) => {

                const da =
                    Math.max(
                        Math.abs(
                            a.x -
                            currentX
                        ),
                        Math.abs(
                            a.z -
                            currentZ
                        )
                    );

                const db =
                    Math.max(
                        Math.abs(
                            b.x -
                            currentX
                        ),
                        Math.abs(
                            b.z -
                            currentZ
                        )
                    );

                return db - da;
            }
        );


        while (
            this.chunks.size >
            this.maxLoadedChunks &&
            chunks.length > 0
        ) {

            const chunk =
                chunks.shift();

            if (!chunk) {

                break;
            }


            if (
                chunk.x ===
                    currentX &&
                chunk.z ===
                    currentZ
            ) {

                continue;
            }


            this.unloadChunk(
                chunk.x,
                chunk.z
            );
        }
    }


    // ============================================================
    // GET CHUNK
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
    // GET WORLD POSITION
    // ============================================================

    getWorldPosition(
        chunkX,
        chunkZ
    ) {

        return this.chunkToWorld(
            chunkX,
            chunkZ
        );
    }


    // ============================================================
    // PLAYER CHUNK
    // ============================================================

    getPlayerChunk(
        x,
        z
    ) {

        return this.worldToChunk(
            x,
            z
        );
    }


    // ============================================================
    // TERRAIN INFORMATION
    // ============================================================

    getTerrainInfo(
        x,
        z
    ) {

        const height =
            this.getHeight(
                x,
                z
            );

        const biome =
            this.getBiome(
                x,
                z
            );

        const slope =
            this.getSlopeAngleDegrees(
                x,
                z
            );

        return {

            x,

            z,

            height,

            y: height,

            biome,

            slope,

            walkable:
                this.isWalkable(
                    x,
                    z
                ),

            underwater:
                height <=
                this.waterLevel,

            waterLevel:
                this.waterLevel
        };
    }


    // ============================================================
    // ENABLE
    // ============================================================

    enable() {

        this.streamingEnabled =
            true;
    }


    // ============================================================
    // DISABLE
    // ============================================================

    disable() {

        this.streamingEnabled =
            false;
    }


    // ============================================================
    // CLEAR
    // ============================================================

    clear() {

        const keys =
            Array.from(
                this.chunks.keys()
            );


        for (
            const key of keys
        ) {

            const chunk =
                this.chunks.get(
                    key
                );

            if (!chunk) {

                continue;
            }


            this.unloadChunk(
                chunk.x,
                chunk.z
            );
        }
    }


    // ============================================================
    // STATS
    // ============================================================

    getStats() {

        return {

            worldSize:
                this.worldSize,

            chunkSize:
                this.chunkSize,

            loadedChunks:
                this.chunks.size,

            maxLoadedChunks:
                this.maxLoadedChunks,

            currentChunkX:
                this.currentChunkX,

            currentChunkZ:
                this.currentChunkZ,

            renderRadius:
                this.renderRadius,

            unloadRadius:
                this.unloadRadius
        };
    }


    // ============================================================
    // DISPOSE
    // ============================================================

    dispose() {

        this.clear();


        if (
            this.groundMaterial
        ) {

            this.groundMaterial.dispose();
        }


        if (
            this.groundTexture
        ) {

            this.groundTexture.dispose();
        }


        if (
            this.beachMaterial
        ) {

            this.beachMaterial.dispose();
        }


        if (
            this.beachTexture
        ) {

            this.beachTexture.dispose();
        }


        if (
            this.ocean
        ) {

            if (
                this.ocean.geometry
            ) {

                this.ocean.geometry.dispose();
            }

            if (
                this.ocean.material
            ) {

                this.ocean.material.dispose();
            }

            this.root.remove(
                this.ocean
            );
        }


        if (
            this.root &&
            this.scene
        ) {

            this.scene.remove(
                this.root
            );
        }


        this.chunks.clear();

        this.loadedChunks.clear();

        this.chunkMeshes.clear();

        console.log(
            "Veyra Terrain disposed"
        );
    }
}


// ============================================================
// GLOBAL DEBUG ACCESS
// ============================================================

if (
    typeof window !== "undefined"
) {

    window.VeyraTerrain =
        VeyraTerrain;
}
