// ============================================================
// WILD ISLES
// VEYRA ISLAND
// WATER SYSTEM v0.8
//
// Ocean
// Waves
// Shoreline
// Water Level
// Reflection Support
// Animated Surface
// Performance Optimized
// ============================================================

import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ============================================================
// WATER CLASS
// ============================================================

export class VeyraWater {

    constructor(scene) {

        this.scene = scene;

        // =====================================================
        // SETTINGS
        // =====================================================

        this.waterLevel = 1.8;

        this.size = 1000;

        this.segments = 120;

        this.time = 0;

        this.waveHeight = 0.12;

        this.waveSpeed = 0.35;

        // =====================================================
        // OBJECTS
        // =====================================================

        this.waterMesh = null;

        this.shoreMesh = null;

        this.waterGeometry = null;

        this.originalPositions = null;

        // =====================================================
        // CREATE
        // =====================================================

        this.createWater();

        this.createShoreline();

        console.log(
            "Veyra Water v0.8 READY"
        );
    }


    // ========================================================
    // CREATE WATER
    // ========================================================

    createWater() {

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
        // MATERIAL
        // ====================================================

        const material =
            new THREE.MeshStandardMaterial({

                color:
                    0x245f68,

                roughness:
                    0.15,

                metalness:
                    0.05,

                transparent:
                    true,

                opacity:
                    0.82,

                side:
                    THREE.DoubleSide
            });


        // ====================================================
        // MESH
        // ====================================================

        const mesh =
            new THREE.Mesh(
                geometry,
                material
            );

        mesh.position.y =
            this.waterLevel;

        mesh.receiveShadow =
            true;

        mesh.castShadow =
            false;


        // ====================================================
        // SCENE
        // ====================================================

        this.scene.add(
            mesh
        );


        // ====================================================
        // STORE
        // ====================================================

        this.waterMesh =
            mesh;

        this.waterGeometry =
            geometry;

        this.originalPositions =
            geometry.attributes
                .position
                .array
                .slice();
    }


    // ========================================================
    // CREATE SHORELINE
    // ========================================================

    createShoreline() {

        const geometry =
            new THREE.RingGeometry(
                390,
                465,
                160
            );

        geometry.rotateX(
            -Math.PI / 2
        );


        // ====================================================
        // SHORE MATERIAL
        // ====================================================

        const material =
            new THREE.MeshStandardMaterial({

                color:
                    0xc8b889,

                roughness:
                    1.0,

                metalness:
                    0,

                transparent:
                    true,

                opacity:
                    0.65,

                side:
                    THREE.DoubleSide
            });


        // ====================================================
        // SHORE MESH
        // ====================================================

        const mesh =
            new THREE.Mesh(
                geometry,
                material
            );

        mesh.position.y =
            this.waterLevel - 0.03;

        mesh.receiveShadow =
            true;

        mesh.castShadow =
            false;


        // ====================================================
        // SCENE
        // ====================================================

        this.scene.add(
            mesh
        );

        this.shoreMesh =
            mesh;
    }


    // ========================================================
    // UPDATE WATER
    // ========================================================

    update(
        deltaTime,
        elapsedTime
    ) {

        if (
            !this.waterMesh ||
            !this.waterGeometry ||
            !this.originalPositions
        ) {

            return;
        }

        // ====================================================
        // DELTA SAFETY
        // ====================================================

        if (
            !Number.isFinite(
                deltaTime
            )
        ) {

            deltaTime =
                0.016;
        }

        deltaTime =
            Math.min(
                Math.max(
                    deltaTime,
                    0
                ),
                0.05
            );


        // ====================================================
        // TIME
        // ====================================================

        this.time +=
            deltaTime;


        // ====================================================
        // POSITION
        // ====================================================

        const position =
            this.waterGeometry
                .attributes
                .position;

        const original =
            this.originalPositions;


        // ====================================================
        // WAVES
        // ====================================================

        for (
            let i = 0;
            i < position.count;
            i++
        ) {

            const index =
                i * 3;

            const x =
                original[index];

            const z =
                original[index + 2];


            // ------------------------------------------------
            // PRIMARY WAVE
            // ------------------------------------------------

            const wave1 =
                Math.sin(
                    x * 0.035 +
                    this.time *
                    this.waveSpeed
                ) *
                this.waveHeight;


            // ------------------------------------------------
            // SECONDARY WAVE
            // ------------------------------------------------

            const wave2 =
                Math.cos(
                    z * 0.045 +
                    this.time *
                    this.waveSpeed *
                    0.8
                ) *
                this.waveHeight *
                0.65;


            // ------------------------------------------------
            // LONG WAVE
            // ------------------------------------------------

            const wave3 =
                Math.sin(
                    (
                        x +
                        z
                    ) *
                    0.018 +
                    this.time *
                    0.25
                ) *
                0.06;


            // ------------------------------------------------
            // FINAL WAVE
            // ------------------------------------------------

            const finalWave =
                wave1 +
                wave2 +
                wave3;

            position.setY(
                i,
                finalWave
            );
        }


        // ====================================================
        // UPDATE GPU
        // ====================================================

        position.needsUpdate =
            true;


        // ====================================================
        // NORMALS
        // ====================================================

        this.waterGeometry
            .computeVertexNormals();


        // ====================================================
        // WATER OPACITY
        // ====================================================

        if (
            this.waterMesh.material
        ) {

            this.waterMesh.material.opacity =
                0.78 +
                Math.sin(
                    this.time *
                    0.5
                ) *
                0.025;
        }
    }


    // ========================================================
    // GET WATER LEVEL
    // ========================================================

    getWaterLevel() {

        return this.waterLevel;
    }


    // ========================================================
    // WATER CHECK
    // ========================================================

    isWater(
        x,
        z
    ) {

        const distance =
            Math.sqrt(
                x * x +
                z * z
            );

        return (
            distance >
            410
        );
    }


    // ========================================================
    // CHECK POSITION
    // ========================================================

    isUnderwater(
        x,
        y,
        z
    ) {

        if (
            !Number.isFinite(y)
        ) {

            return false;
        }

        return (
            y <
            this.waterLevel
        );
    }


    // ========================================================
    // WATER HEIGHT
    // ========================================================

    getHeight(
        x,
        z
    ) {

        const wave1 =
            Math.sin(
                x * 0.035 +
                this.time *
                this.waveSpeed
            ) *
            this.waveHeight;

        const wave2 =
            Math.cos(
                z * 0.045 +
                this.time *
                this.waveSpeed *
                0.8
            ) *
            this.waveHeight *
            0.65;

        const wave3 =
            Math.sin(
                (
                    x +
                    z
                ) *
                0.018 +
                this.time *
                0.25
            ) *
            0.06;

        return (
            this.waterLevel +
            wave1 +
            wave2 +
            wave3
        );
    }


    // ========================================================
    // SHORE CHECK
    // ========================================================

    isNearShore(
        x,
        z,
        distance = 25
    ) {

        const radialDistance =
            Math.sqrt(
                x * x +
                z * z
            );

        return (
            Math.abs(
                radialDistance -
                410
            ) <=
            distance
        );
    }


    // ========================================================
    // DISPOSE
    // ========================================================

    dispose() {

        // ====================================================
        // WATER
        // ====================================================

        if (
            this.waterMesh
        ) {

            this.scene.remove(
                this.waterMesh
            );

            if (
                this.waterMesh.geometry
            ) {

                this.waterMesh
                    .geometry
                    .dispose();
            }

            if (
                this.waterMesh.material
            ) {

                this.waterMesh
                    .material
                    .dispose();
            }

            this.waterMesh =
                null;
        }


        // ====================================================
        // SHORE
        // ====================================================

        if (
            this.shoreMesh
        ) {

            this.scene.remove(
                this.shoreMesh
            );

            if (
                this.shoreMesh.geometry
            ) {

                this.shoreMesh
                    .geometry
                    .dispose();
            }

            if (
                this.shoreMesh.material
            ) {

                this.shoreMesh
                    .material
                    .dispose();
            }

            this.shoreMesh =
                null;
        }


        // ====================================================
        // REFERENCES
        // ====================================================

        this.waterGeometry =
            null;

        this.originalPositions =
            null;

        console.log(
            "Veyra Water disposed"
        );
    }
}
