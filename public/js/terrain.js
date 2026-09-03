// ============================================================
// WILD ISLES
// VEYRA ISLAND
// TERRAIN SYSTEM v0.6
//
// Realistic procedural terrain
// Smooth mountains
// Hills / coast / beach
// Biome vertex colors
// Slope detection
// Walkability helpers
// Ground-height helpers
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class VeyraTerrain {

    constructor(scene) {

        this.scene = scene;

        // ----------------------------------------------------
        // TERRAIN SETTINGS
        // ----------------------------------------------------

        this.size = 900;
        this.halfSize = this.size / 2;

        this.segments = 220;

        this.islandRadius = 430;

        this.maxWalkableSlope =
            THREE.MathUtils.degToRad(38);

        this.waterLevel = 1.8;

        this.mesh = null;
        this.geometry = null;
        this.material = null;

        // Reusable vectors
        this.tempNormal = new THREE.Vector3();

        this.create();
    }

    // ========================================================
    // SMOOTH VALUE FUNCTIONS
    // ========================================================

    smoothstep(edge0, edge1, value) {

        let t =
            THREE.MathUtils.clamp(
                (value - edge0) /
                (edge1 - edge0),
                0,
                1
            );

        return t * t * (3 - 2 * t);
    }

    // ========================================================
    // DETERMINISTIC SMOOTH NOISE
    // ========================================================

    noise2D(x, z) {

        const value =
            Math.sin(
                x * 12.9898 +
                z * 78.233
            ) *
            43758.5453;

        return value -
            Math.floor(value);
    }

    smoothNoise(x, z, scale) {

        const sx = x / scale;
        const sz = z / scale;

        const x0 = Math.floor(sx);
        const z0 = Math.floor(sz);

        const fx = sx - x0;
        const fz = sz - z0;

        const u =
            this.smoothstep(
                0,
                1,
                fx
            );

        const v =
            this.smoothstep(
                0,
                1,
                fz
            );

        const n00 =
            this.noise2D(
                x0,
                z0
            );

        const n10 =
            this.noise2D(
                x0 + 1,
                z0
            );

        const n01 =
            this.noise2D(
                x0,
                z0 + 1
            );

        const n11 =
            this.noise2D(
                x0 + 1,
                z0 + 1
            );

        const nx0 =
            THREE.MathUtils.lerp(
                n00,
                n10,
                u
            );

        const nx1 =
            THREE.MathUtils.lerp(
                n01,
                n11,
                u
            );

        return THREE.MathUtils.lerp(
            nx0,
            nx1,
            v
        );
    }

    // ========================================================
    // FRACTAL TERRAIN NOISE
    // ========================================================

    getTerrainNoise(x, z) {

        let value = 0;

        value +=
            (this.smoothNoise(x, z, 180) - 0.5)
            * 30;

        value +=
            (this.smoothNoise(x + 300, z - 200, 90) - 0.5)
            * 14;

        value +=
            (this.smoothNoise(x - 150, z + 400, 42) - 0.5)
            * 5;

        value +=
            (this.smoothNoise(x + 800, z + 300, 20) - 0.5)
            * 1.5;

        return value;
    }

    // ========================================================
    // GET TERRAIN HEIGHT
    // ========================================================

    getHeight(x, z) {

        const distance =
            Math.sqrt(
                x * x +
                z * z
            );

        // ----------------------------------------------------
        // ISLAND MASK
        // ----------------------------------------------------

        const islandMask =
            this.smoothstep(
                this.islandRadius,
                300,
                distance
            );

        // ----------------------------------------------------
        // BASE LAND
        // ----------------------------------------------------

        let height = 8;

        height +=
            this.getTerrainNoise(
                x,
                z
            ) * islandMask;

        // ----------------------------------------------------
        // LARGE MOUNTAIN RANGE
        // ----------------------------------------------------

        const mountainDistance =
            Math.sqrt(
                Math.pow(x + 95, 2) +
                Math.pow(z + 55, 2)
            );

        const mountainMask =
            1 -
            this.smoothstep(
                90,
                250,
                mountainDistance
            );

        if (mountainMask > 0) {

            const mountainNoise =
                this.getTerrainNoise(
                    x * 0.72,
                    z * 0.72
                );

            const mountainHeight =
                92 +
                mountainNoise * 0.45;

            height +=
                mountainHeight *
                Math.pow(
                    mountainMask,
                    1.65
                );
        }

        // ----------------------------------------------------
        // SECONDARY HILLS
        // ----------------------------------------------------

        const hillDistance =
            Math.sqrt(
                Math.pow(x - 210, 2) +
                Math.pow(z + 135, 2)
            );

        const hillMask =
            1 -
            this.smoothstep(
                55,
                180,
                hillDistance
            );

        height +=
            34 *
            Math.pow(
                Math.max(0, hillMask),
                1.7
            );

        // ----------------------------------------------------
        // NORTHERN HILLS
        // ----------------------------------------------------

        const northDistance =
            Math.sqrt(
                Math.pow(x + 260, 2) +
                Math.pow(z - 190, 2)
            );

        const northMask =
            1 -
            this.smoothstep(
                50,
                155,
                northDistance
            );

        height +=
            25 *
            Math.pow(
                Math.max(0, northMask),
                1.8
            );

        // ----------------------------------------------------
        // CENTRAL VALLEY
        // ----------------------------------------------------

        const valleyDistance =
            Math.sqrt(
                Math.pow(x + 35, 2) +
                Math.pow(z - 80, 2)
            );

        const valleyMask =
            1 -
            this.smoothstep(
                35,
                115,
                valleyDistance
            );

        height -=
            10 *
            Math.pow(
                Math.max(0, valleyMask),
                2
            );

        // ----------------------------------------------------
        // COASTAL FALL-OFF
        // ----------------------------------------------------

        const coastStart = 295;
        const coastEnd = 430;

        if (distance > coastStart) {

            const coastFactor =
                this.smoothstep(
                    coastStart,
                    coastEnd,
                    distance
                );

            height =
                THREE.MathUtils.lerp(
                    height,
                    1.15,
                    coastFactor
                );
        }

        // ----------------------------------------------------
        // BEACH FLATTENING
        // ----------------------------------------------------

        if (distance > 340) {

            const beachFactor =
                this.smoothstep(
                    340,
                    415,
                    distance
                );

            height =
                THREE.MathUtils.lerp(
                    height,
                    1.25,
                    beachFactor
                );
        }

        // ----------------------------------------------------
        // ISLAND EDGE
        // ----------------------------------------------------

        if (distance > 415) {

            const edgeFactor =
                this.smoothstep(
                    415,
                    450,
                    distance
                );

            height =
                THREE.MathUtils.lerp(
                    height,
                    -4,
                    edgeFactor
                );
        }

        return height;
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

        const sample = 1.0;

        const left =
            this.getHeight(
                x - sample,
                z
            );

        const right =
            this.getHeight(
                x + sample,
                z
            );

        const back =
            this.getHeight(
                x,
                z - sample
            );

        const front =
            this.getHeight(
                x,
                z + sample
            );

        this.tempNormal.set(
            left - right,
            sample * 2,
            back - front
        );

        this.tempNormal.normalize();

        return this.tempNormal.clone();
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

        const up =
            new THREE.Vector3(
                0,
                1,
                0
            );

        const dot =
            THREE.MathUtils.clamp(
                normal.dot(up),
                -1,
                1
            );

        return Math.acos(dot);
    }

    // ========================================================
    // SLOPE IN DEGREES
    // ========================================================

    getSlopeDegrees(x, z) {

        return THREE.MathUtils.radToDeg(
            this.getSlopeAngle(
                x,
                z
            )
        );
    }

    // ========================================================
    // IS POSITION INSIDE ISLAND
    // ========================================================

    isInsideIsland(x, z) {

        const distance =
            Math.sqrt(
                x * x +
                z * z
            );

        return distance <
            this.islandRadius;
    }

    // ========================================================
    // IS GROUND WALKABLE
    // ========================================================

    isWalkable(x, z) {

        if (!this.isInsideIsland(x, z)) {
            return false;
        }

        const slope =
            this.getSlopeAngle(
                x,
                z
            );

        return slope <=
            this.maxWalkableSlope;
    }

    // ========================================================
    // SAFE GROUND HEIGHT
    // ========================================================

    getSafeGroundHeight(x, z) {

        if (!this.isWalkable(x, z)) {
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
        x,
        z,
        radius = 3,
        samples = 16
    ) {

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

        for (
            let i = 0;
            i < samples;
            i++
        ) {

            const angle =
                (i / samples) *
                Math.PI *
                2;

            const testX =
                x +
                Math.cos(angle) *
                radius;

            const testZ =
                z +
                Math.sin(angle) *
                radius;

            if (
                this.isWalkable(
                    testX,
                    testZ
                )
            ) {

                return {
                    x: testX,
                    y: this.getGroundHeight(
                        testX,
                        testZ
                    ),
                    z: testZ
                };
            }
        }

        return null;
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

        const slope =
            this.getSlopeDegrees(
                x,
                z
            );

        const distance =
            Math.sqrt(
                x * x +
                z * z
            );

        if (
            distance > 335 &&
            height < 5
        ) {

            return "beach";
        }

        if (height > 82) {
            return "mountain";
        }

        if (height > 48) {
            return "highland";
        }

        if (slope > 32) {
            return "rock";
        }

        if (height < 8) {
            return "grassland";
        }

        return "forest";
    }

    // ========================================================
    // TERRAIN VERTEX COLOR
    // ========================================================

    getVertexColor(x, z) {

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

        const distance =
            Math.sqrt(
                x * x +
                z * z
            );

        const color =
            new THREE.Color();

        // ----------------------------------------------------
        // BEACH
        // ----------------------------------------------------

        if (
            distance > 335 &&
            height < 6
        ) {

            color.setRGB(
                0.72,
                0.66,
                0.48
            );

            return color;
        }

        // ----------------------------------------------------
        // HIGH MOUNTAIN
        // ----------------------------------------------------

        if (height > 82) {

            color.setRGB(
                0.34,
                0.36,
                0.33
            );

            return color;
        }

        // ----------------------------------------------------
        // ROCKY SLOPE
        // ----------------------------------------------------

        if (slope > 30) {

            const rock =
                THREE.MathUtils.clamp(
                    slope / 55,
                    0,
                    1
                );

            color.setRGB(
                0.32 + rock * 0.10,
                0.35 + rock * 0.08,
                0.31 + rock * 0.06
            );

            return color;
        }

        // ----------------------------------------------------
        // GRASS
        // ----------------------------------------------------

        const variation =
            this.smoothNoise(
                x + 500,
                z - 200,
                28
            );

        color.setRGB(
            0.25 + variation * 0.08,
            0.40 + variation * 0.10,
            0.20 + variation * 0.06
        );

        return color;
    }

    // ========================================================
    // CREATE TERRAIN
    // ========================================================

    create() {

        this.geometry =
            new THREE.PlaneGeometry(
                this.size,
                this.size,
                this.segments,
                this.segments
            );

        const position =
            this.geometry.attributes.position;

        const colors = [];

        // ----------------------------------------------------
        // HEIGHT + COLORS
        // ----------------------------------------------------

        for (
            let i = 0;
            i < position.count;
            i++
        ) {

            const x =
                position.getX(i);

            const z =
                -position.getY(i);

            const height =
                this.getHeight(
                    x,
                    z
                );

            position.setZ(
                i,
                height
            );

            const vertexColor =
                this.getVertexColor(
                    x,
                    z
                );

            colors.push(
                vertexColor.r,
                vertexColor.g,
                vertexColor.b
            );
        }

        // ----------------------------------------------------
        // ROTATE PLANE TO X/Z
        // ----------------------------------------------------

        this.geometry.rotateX(
            -Math.PI / 2
        );

        // ----------------------------------------------------
        // NORMALS
        // ----------------------------------------------------

        this.geometry.computeVertexNormals();

        // ----------------------------------------------------
        // COLOR ATTRIBUTE
        // ----------------------------------------------------

        this.geometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(
                colors,
                3
            )
        );

        // ----------------------------------------------------
        // MATERIAL
        // ----------------------------------------------------

        this.material =
            new THREE.MeshStandardMaterial({

                vertexColors: true,

                roughness: 0.96,

                metalness: 0,

                flatShading: false
            });

        // ----------------------------------------------------
        // MESH
        // ----------------------------------------------------

        this.mesh =
            new THREE.Mesh(
                this.geometry,
                this.material
            );

        this.mesh.name =
            "VeyraIslandTerrain";

        this.mesh.receiveShadow = true;

        this.mesh.castShadow = false;

        this.scene.add(
            this.mesh
        );

        console.log(
            "Veyra Terrain v0.6 READY"
        );
    }

    // ========================================================
    // DEBUG INFORMATION
    // ========================================================

    getTerrainInfo(x, z) {

        return {

            x,

            z,

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
                ),

            walkable:
                this.isWalkable(
                    x,
                    z
                )
        };
    }

    // ========================================================
    // CLEANUP
    // ========================================================

    dispose() {

        if (this.mesh) {

            this.scene.remove(
                this.mesh
            );
        }

        if (this.geometry) {

            this.geometry.dispose();
        }

        if (this.material) {

            this.material.dispose();
        }

        this.mesh = null;

        this.geometry = null;

        this.material = null;
    }
}
