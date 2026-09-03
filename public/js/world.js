// ============================================================
// WILD ISLES
// VEYRA WORLD
// WORLD STRUCTURE SYSTEM v1.0
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class VeyraWorld {

    constructor(scene, terrain) {

        this.scene = scene;
        this.terrain = terrain;

        // ========================================================
        // WORLD SETTINGS
        // ========================================================

        this.worldSize = 16384;
        this.chunkSize = 256;

        this.renderRadius = 1;
        this.unloadRadius = 2;

        this.maxChunks =
            this.renderRadius === 1
                ? 9
                : 25;

        this.chunks = new Map();

        this.lastChunkX = null;
        this.lastChunkZ = null;

        this.enabled = true;

        // ========================================================
        // MATERIALS
        // ========================================================

        this.materials = {

            road:
                new THREE.MeshStandardMaterial({
                    color: 0x34383b,
                    roughness: 0.95,
                    metalness: 0.05
                }),

            roadLine:
                new THREE.MeshStandardMaterial({
                    color: 0xd8c66a,
                    roughness: 0.8
                }),

            railway:
                new THREE.MeshStandardMaterial({
                    color: 0x34383a,
                    roughness: 0.85,
                    metalness: 0.35
                }),

            rail:
                new THREE.MeshStandardMaterial({
                    color: 0x73787c,
                    roughness: 0.45,
                    metalness: 0.85
                }),

            wood:
                new THREE.MeshStandardMaterial({
                    color: 0x5b3925,
                    roughness: 0.9
                }),

            wall:
                new THREE.MeshStandardMaterial({
                    color: 0x8b8174,
                    roughness: 0.9
                }),

            roof:
                new THREE.MeshStandardMaterial({
                    color: 0x3d4144,
                    roughness: 0.85
                }),

            metal:
                new THREE.MeshStandardMaterial({
                    color: 0x5d6265,
                    roughness: 0.55,
                    metalness: 0.7
                }),

            glass:
                new THREE.MeshStandardMaterial({
                    color: 0x5f8891,
                    roughness: 0.15,
                    metalness: 0.2,
                    transparent: true,
                    opacity: 0.65
                }),

            concrete:
                new THREE.MeshStandardMaterial({
                    color: 0x777777,
                    roughness: 0.95
                }),

            sign:
                new THREE.MeshStandardMaterial({
                    color: 0xb8a77d,
                    roughness: 0.8
                })
        };

        // ========================================================
        // SHARED GEOMETRY
        // ========================================================

        this.boxGeometry =
            new THREE.BoxGeometry(
                1,
                1,
                1
            );

        this.cylinderGeometry =
            new THREE.CylinderGeometry(
                0.5,
                0.5,
                1,
                12
            );

        // ========================================================
        // STATS
        // ========================================================

        this.stats = {

            chunks: 0,
            roads: 0,
            houses: 0,
            factories: 0,
            railway: 0,
            stations: 0,
            props: 0
        };

        console.log(
            "Veyra World Structure System v1.0 READY"
        );
    }

    // ============================================================
    // HASH
    // ============================================================

    hash(x, z) {

        let n =
            Math.sin(
                x * 127.1 +
                z * 311.7
            ) *
            43758.5453123;

        return n -
            Math.floor(n);
    }

    // ============================================================
    // CHUNK KEY
    // ============================================================

    getKey(x, z) {

        return `${x}:${z}`;
    }

    // ============================================================
    // WORLD -> CHUNK
    // ============================================================

    worldToChunk(x, z) {

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

    // ============================================================
    // CREATE CHUNK
    // ============================================================

    createChunk(
        chunkX,
        chunkZ
    ) {

        const key =
            this.getKey(
                chunkX,
                chunkZ
            );

        if (
            this.chunks.has(key)
        ) {

            return;
        }

        const group =
            new THREE.Group();

        group.name =
            `WorldChunk_${chunkX}_${chunkZ}`;

        const centerX =
            chunkX *
            this.chunkSize +
            this.chunkSize / 2;

        const centerZ =
            chunkZ *
            this.chunkSize +
            this.chunkSize / 2;

        // ========================================================
        // STRUCTURE SEED
        // ========================================================

        const seed =
            this.hash(
                chunkX,
                chunkZ
            );

        // ========================================================
        // ROADS
        // ========================================================

        if (
            seed < 0.45
        ) {

            this.createRoad(
                group,
                centerX,
                centerZ,
                false
            );
        }

        if (
            seed > 0.65
        ) {

            this.createRoad(
                group,
                centerX,
                centerZ,
                true
            );
        }

        // ========================================================
        // VILLAGE
        // ========================================================

        if (
            seed > 0.72
        ) {

            this.createVillage(
                group,
                centerX,
                centerZ
            );
        }

        // ========================================================
        // INDUSTRIAL AREA
        // ========================================================

        if (
            seed > 0.91
        ) {

            this.createIndustrialArea(
                group,
                centerX,
                centerZ
            );
        }

        // ========================================================
        // RAILWAY
        // ========================================================

        if (
            Math.abs(
                chunkX
            ) % 4 === 0
        ) {

            this.createRailway(
                group,
                centerX,
                centerZ
            );
        }

        // ========================================================
        // PROPS
        // ========================================================

        this.createStreetProps(
            group,
            centerX,
            centerZ,
            seed
        );

        // ========================================================
        // ADD
        // ========================================================

        this.scene.add(
            group
        );

        this.chunks.set(
            key,
            {
                x: chunkX,
                z: chunkZ,
                group
            }
        );

        this.stats.chunks++;
    }

    // ============================================================
    // ROAD
    // ============================================================

    createRoad(
        group,
        x,
        z,
        horizontal
    ) {

        const width = 12;

        const length =
            this.chunkSize;

        const geometry =
            new THREE.BoxGeometry(
                horizontal
                    ? length
                    : width,
                0.12,
                horizontal
                    ? width
                    : length
            );

        const road =
            new THREE.Mesh(
                geometry,
                this.materials.road
            );

        road.position.set(
            x,
            0.08,
            z
        );

        group.add(
            road
        );

        // ========================================================
        // ROAD MARKING
        // ========================================================

        const lineGeometry =
            new THREE.BoxGeometry(
                horizontal
                    ? length
                    : 0.18,
                0.025,
                horizontal
                    ? 0.18
                    : length
            );

        const line =
            new THREE.Mesh(
                lineGeometry,
                this.materials.roadLine
            );

        line.position.set(
            x,
            0.16,
            z
        );

        group.add(
            line
        );

        this.stats.roads++;
    }

    // ============================================================
    // VILLAGE
    // ============================================================

    createVillage(
        group,
        centerX,
        centerZ
    ) {

        const positions = [

            [-45, -45],
            [45, -45],
            [-45, 45],
            [45, 45],
            [0, -65],
            [0, 65]
        ];

        for (
            let i = 0;
            i < positions.length;
            i++
        ) {

            const px =
                centerX +
                positions[i][0];

            const pz =
                centerZ +
                positions[i][1];

            this.createHouse(
                group,
                px,
                pz,
                i
            );
        }

        // village center
        this.createWell(
            group,
            centerX,
            centerZ
        );

        // street lamps
        for (
            let i = -1;
            i <= 1;
            i++
        ) {

            this.createLamp(
                group,
                centerX + i * 25,
                centerZ + 20
            );
        }
    }

    // ============================================================
    // HOUSE
    // ============================================================

    createHouse(
        group,
        x,
        z,
        variant = 0
    ) {

        const house =
            new THREE.Group();

        house.position.set(
            x,
            0,
            z
        );

        // --------------------------------------------------------
        // BODY
        // --------------------------------------------------------

        const width =
            variant % 2 === 0
                ? 15
                : 18;

        const depth =
            variant % 2 === 0
                ? 13
                : 16;

        const height =
            variant % 3 === 0
                ? 7
                : 8;

        const bodyGeometry =
            new THREE.BoxGeometry(
                width,
                height,
                depth
            );

        const body =
            new THREE.Mesh(
                bodyGeometry,
                this.materials.wall
            );

        body.position.y =
            height / 2;

        body.castShadow = true;
        body.receiveShadow = true;

        house.add(
            body
        );

        // --------------------------------------------------------
        // ROOF
        // --------------------------------------------------------

        const roofGeometry =
            new THREE.ConeGeometry(
                Math.max(
                    width,
                    depth
                ) * 0.72,
                4.5,
                4
            );

        const roof =
            new THREE.Mesh(
                roofGeometry,
                this.materials.roof
            );

        roof.rotation.y =
            Math.PI / 4;

        roof.position.y =
            height + 2;

        roof.scale.z =
            0.78;

        roof.castShadow = true;

        house.add(
            roof
        );

        // --------------------------------------------------------
        // DOOR
        // --------------------------------------------------------

        const doorGeometry =
            new THREE.BoxGeometry(
                1.6,
                3.3,
                0.18
            );

        const door =
            new THREE.Mesh(
                doorGeometry,
                this.materials.wood
            );

        door.position.set(
            0,
            1.65,
            depth / 2 + 0.1
        );

        house.add(
            door
        );

        // --------------------------------------------------------
        // WINDOWS
        // --------------------------------------------------------

        this.createWindow(
            house,
            -width / 2 - 0.1,
            height * 0.58,
            0,
            Math.PI / 2
        );

        this.createWindow(
            house,
            width / 2 + 0.1,
            height * 0.58,
            0,
            -Math.PI / 2
        );

        this.createWindow(
            house,
            0,
            height * 0.58,
            depth / 2 + 0.1,
            0
        );

        // --------------------------------------------------------
        // CHIMNEY
        // --------------------------------------------------------

        if (
            variant % 2 === 0
        ) {

            const chimneyGeometry =
                new THREE.BoxGeometry(
                    1.5,
                    4,
                    1.5
                );

            const chimney =
                new THREE.Mesh(
                    chimneyGeometry,
                    this.materials.brick ||
                    this.materials.wall
                );

            chimney.position.set(
                width * 0.25,
                height + 1,
                depth * 0.15
            );

            house.add(
                chimney
            );
        }

        group.add(
            house
        );

        this.stats.houses++;
    }

    // ============================================================
    // WINDOW
    // ============================================================

    createWindow(
        parent,
        x,
        y,
        z,
        rotationY
    ) {

        const frame =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    2.4,
                    2,
                    0.18
                ),
                this.materials.wood
            );

        frame.position.set(
            x,
            y,
            z
        );

        frame.rotation.y =
            rotationY;

        parent.add(
            frame
        );

        const glass =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.8,
                    1.4,
                    0.08
                ),
                this.materials.glass
            );

        glass.position.set(
            x,
            y,
            z
        );

        glass.rotation.y =
            rotationY;

        parent.add(
            glass
        );
    }

    // ============================================================
    // WELL
    // ============================================================

    createWell(
        group,
        x,
        z
    ) {

        const well =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    2.5,
                    2.5,
                    1.5,
                    16
                ),
                this.materials.stone ||
                this.materials.concrete
            );

        well.position.set(
            x,
            0.75,
            z
        );

        group.add(
            well
        );

        this.stats.props++;
    }

    // ============================================================
    // INDUSTRIAL AREA
    // ============================================================

    createIndustrialArea(
        group,
        x,
        z
    ) {

        // --------------------------------------------------------
        // FACTORY
        // --------------------------------------------------------

        const factory =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    70,
                    18,
                    45
                ),
                this.materials.concrete
            );

        factory.position.set(
            x,
            9,
            z
        );

        factory.castShadow = true;

        group.add(
            factory
        );

        // --------------------------------------------------------
        // ROOF
        // --------------------------------------------------------

        const roof =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    74,
                    1.5,
                    49
                ),
                this.materials.metal
            );

        roof.position.set(
            x,
            18.75,
            z
        );

        group.add(
            roof
        );

        // --------------------------------------------------------
        // STORAGE TANKS
        // --------------------------------------------------------

        for (
            let i = -1;
            i <= 1;
            i++
        ) {

            const tank =
                new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        5,
                        5,
                        14,
                        20
                    ),
                    this.materials.metal
                );

            tank.position.set(
                x + i * 13,
                7,
                z - 31
            );

            group.add(
                tank
            );

            this.stats.props++;
        }

        // --------------------------------------------------------
        // PIPES
        // --------------------------------------------------------

        for (
            let i = 0;
            i < 4;
            i++
        ) {

            const pipe =
                new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        0.6,
                        0.6,
                        40,
                        10
                    ),
                    this.materials.metal
                );

            pipe.rotation.z =
                Math.PI / 2;

            pipe.position.set(
                x - 25 + i * 12,
                12,
                z
            );

            group.add(
                pipe
            );

            this.stats.props++;
        }

        this.stats.factories++;
    }

    // ============================================================
    // RAILWAY
    // ============================================================

    createRailway(
        group,
        x,
        z
    ) {

        const trackLength =
            this.chunkSize;

        // --------------------------------------------------------
        // SLEEPER BED
        // --------------------------------------------------------

        const bed =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    10,
                    0.18,
                    trackLength
                ),
                this.materials.railway
            );

        bed.position.set(
            x + 75,
            0.12,
            z
        );

        group.add(
            bed
        );

        // --------------------------------------------------------
        // RAILS
        // --------------------------------------------------------

        const railGeometry =
            new THREE.BoxGeometry(
                0.22,
                0.28,
                trackLength
            );

        const rail1 =
            new THREE.Mesh(
                railGeometry,
                this.materials.rail
            );

        rail1.position.set(
            x + 71.8,
            0.32,
            z
        );

        group.add(
            rail1
        );

        const rail2 =
            new THREE.Mesh(
                railGeometry,
                this.materials.rail
            );

        rail2.position.set(
            x + 78.2,
            0.32,
            z
        );

        group.add(
            rail2
        );

        // --------------------------------------------------------
        // SLEEPERS
        // --------------------------------------------------------

        for (
            let i = 0;
            i < 30;
            i++
        ) {

            const sleeper =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        9,
                        0.25,
                        0.65
                    ),
                    this.materials.wood
                );

            sleeper.position.set(
                x + 75,
                0.24,
                z -
                    trackLength / 2 +
                    i * 8.5
            );

            group.add(
                sleeper
            );
        }

        // --------------------------------------------------------
        // SIGNAL
        // --------------------------------------------------------

        this.createRailSignal(
            group,
            x + 87,
            z
        );

        this.stats.railway++;
    }

    // ============================================================
    // RAIL SIGNAL
    // ============================================================

    createRailSignal(
        group,
        x,
        z
    ) {

        const pole =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.12,
                    0.12,
                    6,
                    8
                ),
                this.materials.metal
            );

        pole.position.set(
            x,
            3,
            z
        );

        group.add(
            pole
        );

        const head =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.8,
                    1.8,
                    0.5
                ),
                this.materials.metal
            );

        head.position.set(
            x,
            5.2,
            z
        );

        group.add(
            head
        );

        this.stats.props++;
    }

    // ============================================================
    // STREET PROPS
    // ============================================================

    createStreetProps(
        group,
        x,
        z,
        seed
    ) {

        if (
            seed < 0.35
        ) {

            this.createLamp(
                group,
                x - 70,
                z - 70
            );

            this.createLamp(
                group,
                x + 70,
                z + 70
            );
        }

        if (
            seed > 0.5 &&
            seed < 0.75
        ) {

            this.createCrate(
                group,
                x + 30,
                z + 30
            );

            this.createCrate(
                group,
                x - 30,
                z - 20
            );
        }
    }

    // ============================================================
    // LAMP
    // ============================================================

    createLamp(
        group,
        x,
        z
    ) {

        const pole =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.14,
                    0.18,
                    6,
                    8
                ),
                this.materials.metal
            );

        pole.position.set(
            x,
            3,
            z
        );

        group.add(
            pole
        );

        const lightBox =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.8,
                    0.45,
                    0.8
                ),
                this.materials.glass
            );

        lightBox.position.set(
            x,
            6,
            z
        );

        group.add(
            lightBox
        );

        this.stats.props++;
    }

    // ============================================================
    // CRATE
    // ============================================================

    createCrate(
        group,
        x,
        z
    ) {

        const crate =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    2.2,
                    2.2,
                    2.2
                ),
                this.materials.wood
            );

        crate.position.set(
            x,
            1.1,
            z
        );

        crate.rotation.y =
            this.hash(
                x,
                z
            ) *
            Math.PI;

        crate.castShadow = true;

        group.add(
            crate
        );

        this.stats.props++;
    }

    // ============================================================
    // UPDATE STREAMING
    // ============================================================

    update(
        playerX,
        playerZ
    ) {

        if (!this.enabled)
            return;

        if (
            !Number.isFinite(playerX) ||
            !Number.isFinite(playerZ)
        ) {

            return;
        }

        const chunk =
            this.worldToChunk(
                playerX,
                playerZ
            );

        if (
            chunk.x === this.lastChunkX &&
            chunk.z === this.lastChunkZ
        ) {

            return;
        }

        this.lastChunkX =
            chunk.x;

        this.lastChunkZ =
            chunk.z;

        this.streamChunks(
            chunk.x,
            chunk.z
        );
    }

    // ============================================================
    // STREAM CHUNKS
    // ============================================================

    streamChunks(
        centerX,
        centerZ
    ) {

        const required =
            new Set();

        for (
            let x =
                centerX -
                this.renderRadius;

            x <=
                centerX +
                this.renderRadius;

            x++
        ) {

            for (
                let z =
                    centerZ -
                    this.renderRadius;

                z <=
                    centerZ +
                    this.renderRadius;

                z++
            ) {

                const key =
                    this.getKey(
                        x,
                        z
                    );

                required.add(
                    key
                );

                if (
                    !this.chunks.has(
                        key
                    )
                ) {

                    this.createChunk(
                        x,
                        z
                    );
                }
            }
        }

        // ========================================================
        // UNLOAD
        // ========================================================

        for (
            const [
                key,
                chunk
            ] of this.chunks
        ) {

            const distanceX =
                Math.abs(
                    chunk.x -
                    centerX
                );

            const distanceZ =
                Math.abs(
                    chunk.z -
                    centerZ
                );

            if (
                distanceX >
                    this.unloadRadius ||
                distanceZ >
                    this.unloadRadius
            ) {

                this.removeChunk(
                    key
                );
            }
        }
    }

    // ============================================================
    // REMOVE CHUNK
    // ============================================================

    removeChunk(
        key
    ) {

        const chunk =
            this.chunks.get(
                key
            );

        if (!chunk)
            return;

        this.disposeObject(
            chunk.group
        );

        if (
            chunk.group.parent
        ) {

            chunk.group.parent.remove(
                chunk.group
            );
        }

        this.chunks.delete(
            key
        );

        this.stats.chunks =
            Math.max(
                0,
                this.stats.chunks - 1
            );
    }

    // ============================================================
    // DISPOSE OBJECT
    // ============================================================

    disposeObject(
        object
    ) {

        object.traverse(
            child => {

                if (
                    child.geometry &&
                    child.geometry !==
                        this.boxGeometry &&
                    child.geometry !==
                        this.cylinderGeometry
                ) {

                    child.geometry.dispose();
                }
            }
        );
    }

    // ============================================================
    // GET STATS
    // ============================================================

    getStats() {

        return {
            ...this.stats
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
    // CLEAR
    // ============================================================

    clear() {

        for (
            const [
                key
            ] of this.chunks
        ) {

            this.removeChunk(
                key
            );
        }

        this.chunks.clear();

        this.lastChunkX = null;
        this.lastChunkZ = null;
    }

    // ============================================================
    // DISPOSE
    // ============================================================

    dispose() {

        this.clear();

        if (
            this.boxGeometry
        ) {

            this.boxGeometry.dispose();
        }

        if (
            this.cylinderGeometry
        ) {

            this.cylinderGeometry.dispose();
        }

        for (
            const material of
            Object.values(
                this.materials
            )
        ) {

            if (
                material &&
                typeof material.dispose ===
                "function"
            ) {

                material.dispose();
            }
        }

        this.scene = null;
        this.terrain = null;

        console.log(
            "Veyra World Structure System DISPOSED"
        );
    }
}
