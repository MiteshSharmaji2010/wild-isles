// ============================================================
// WILD ISLES
// VEYRA ISLAND
// public/js/world.js
//
// HUGE OPEN WORLD SYSTEM v1.0
//
// Chunk based world
// Large world coordinates
// Chunk loading
// Chunk unloading
// Player based streaming
// World position conversion
// Distance management
// Mobile performance support
// Future biome streaming support
// ============================================================

export class VeyraWorld {

    constructor(scene, terrain, environment) {

        this.scene = scene;

        this.terrain = terrain;

        this.environment = environment;

        // ====================================================
        // WORLD SETTINGS
        // ====================================================

        this.chunkSize = 256;

        /*
         * This is the logical world size.
         *
         * It is intentionally much larger than the
         * current 900x900 prototype terrain.
         *
         * Later this can be expanded without changing
         * the chunk system.
         */

        this.worldSize = 16384;

        this.worldHalfSize =
            this.worldSize / 2;

        // ====================================================
        // CHUNK SETTINGS
        // ====================================================

        this.loadRadius = 2;

        this.unloadRadius = 3;

        this.maxLoadedChunks = 25;

        // ====================================================
        // PERFORMANCE
        // ====================================================

        this.mobileMode =
            window.innerWidth <= 900 ||
            "ontouchstart" in window;

        if (this.mobileMode) {

            this.loadRadius = 1;

            this.unloadRadius = 2;

            this.maxLoadedChunks = 9;
        }

        // ====================================================
        // CHUNK STORAGE
        // ====================================================

        this.chunks =
            new Map();

        this.loadedChunks =
            new Map();

        // ====================================================
        // PLAYER
        // ====================================================

        this.player = null;

        this.lastPlayerChunkX =
            null;

        this.lastPlayerChunkZ =
            null;

        // ====================================================
        // UPDATE TIMER
        // ====================================================

        this.updateTimer = 0;

        this.updateInterval =
            this.mobileMode
                ? 0.5
                : 0.25;

        // ====================================================
        // WORLD STATE
        // ====================================================

        this.enabled = true;

        this.initialized = false;

        this.loading = false;

        this.pendingLoads = [];

        // ====================================================
        // STATISTICS
        // ====================================================

        this.stats = {

            loadedChunks: 0,

            totalChunksCreated: 0,

            totalChunksRemoved: 0,

            playerChunkX: 0,

            playerChunkZ: 0

        };

        console.log(
            "Veyra World System v1.0 READY"
        );
    }


    // ========================================================
    // SET PLAYER
    // ========================================================

    setPlayer(player) {

        this.player =
            player;

        if (
            player &&
            typeof player.getPosition ===
            "function"
        ) {

            const position =
                player.getPosition();

            const chunk =
                this.worldToChunk(
                    position.x,
                    position.z
                );

            this.lastPlayerChunkX =
                chunk.x;

            this.lastPlayerChunkZ =
                chunk.z;

            this.stats.playerChunkX =
                chunk.x;

            this.stats.playerChunkZ =
                chunk.z;
        }
    }


    // ========================================================
    // INITIALIZE
    // ========================================================

    initialize() {

        if (
            this.initialized
        ) {

            return;
        }

        this.initialized =
            true;

        if (
            this.player
        ) {

            this.updateStreaming(
                true
            );
        }

        console.log(
            "Huge world streaming initialized."
        );
    }


    // ========================================================
    // WORLD -> CHUNK
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


    // ========================================================
    // CHUNK -> WORLD
    // ========================================================

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


    // ========================================================
    // CHUNK KEY
    // ========================================================

    getChunkKey(
        chunkX,
        chunkZ
    ) {

        return (
            `${chunkX}:${chunkZ}`
        );
    }


    // ========================================================
    // CHECK WORLD BOUNDS
    // ========================================================

    isInsideWorld(
        x,
        z
    ) {

        return (
            x >= -this.worldHalfSize &&
            x <= this.worldHalfSize &&
            z >= -this.worldHalfSize &&
            z <= this.worldHalfSize
        );
    }


    // ========================================================
    // GET CHUNK
    // ========================================================

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


    // ========================================================
    // CREATE CHUNK DATA
    // ========================================================

    createChunkData(
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

        const world =
            this.chunkToWorld(
                chunkX,
                chunkZ
            );

        const chunk = {

            key,

            x: chunkX,

            z: chunkZ,

            worldX: world.x,

            worldZ: world.z,

            loaded: false,

            active: false,

            group: null,

            createdAt:
                performance.now(),

            lastUsed:
                performance.now()
        };

        this.chunks.set(
            key,
            chunk
        );

        this.stats.totalChunksCreated++;

        return chunk;
    }


    // ========================================================
    // LOAD CHUNK
    // ========================================================

    loadChunk(
        chunkX,
        chunkZ
    ) {

        const key =
            this.getChunkKey(
                chunkX,
                chunkZ
            );

        let chunk =
            this.chunks.get(
                key
            );

        if (
            !chunk
        ) {

            chunk =
                this.createChunkData(
                    chunkX,
                    chunkZ
                );
        }

        if (
            chunk.loaded
        ) {

            chunk.lastUsed =
                performance.now();

            return chunk;
        }

        // ====================================================
        // CHUNK GROUP
        // ====================================================

        /*
         * The group is intentionally lightweight.
         *
         * Actual terrain/environment generation will be moved
         * into chunk generation in the next world-terrain step.
         */

        const group =
            new THREEFallbackGroup();

        group.name =
            `WorldChunk_${chunkX}_${chunkZ}`;

        group.position.set(
            chunk.worldX,
            0,
            chunk.worldZ
        );

        this.scene.add(
            group
        );

        chunk.group =
            group;

        chunk.loaded =
            true;

        chunk.active =
            true;

        chunk.lastUsed =
            performance.now();

        this.loadedChunks.set(
            key,
            chunk
        );

        this.stats.loadedChunks =
            this.loadedChunks.size;

        return chunk;
    }


    // ========================================================
    // UNLOAD CHUNK
    // ========================================================

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

        if (
            !chunk ||
            !chunk.loaded
        ) {

            return;
        }

        // ====================================================
        // REMOVE GROUP
        // ====================================================

        if (
            chunk.group
        ) {

            if (
                chunk.group.parent
            ) {

                chunk.group.parent.remove(
                    chunk.group
                );
            }

            this.disposeObject(
                chunk.group
            );

            chunk.group =
                null;
        }

        chunk.loaded =
            false;

        chunk.active =
            false;

        this.loadedChunks.delete(
            key
        );

        this.stats.loadedChunks =
            this.loadedChunks.size;

        this.stats.totalChunksRemoved++;
    }


    // ========================================================
    // OBJECT DISPOSAL
    // ========================================================

    disposeObject(
        object
    ) {

        if (
            !object
        ) {

            return;
        }

        if (
            typeof object.traverse ===
            "function"
        ) {

            object.traverse(
                child => {

                    if (
                        child.geometry &&
                        typeof child.geometry.dispose ===
                        "function"
                    ) {

                        child.geometry.dispose();
                    }

                    if (
                        child.material
                    ) {

                        const materials =
                            Array.isArray(
                                child.material
                            )
                                ? child.material
                                : [
                                    child.material
                                ];

                        for (
                            const material
                            of materials
                        ) {

                            if (
                                material &&
                                typeof material.dispose ===
                                "function"
                            ) {

                                material.dispose();
                            }
                        }
                    }
                }
            );
        }
    }


    // ========================================================
    // GET REQUIRED CHUNKS
    // ========================================================

    getRequiredChunks(
        centerX,
        centerZ
    ) {

        const result = [];

        for (
            let dz =
                -this.loadRadius;

            dz <=
            this.loadRadius;

            dz++
        ) {

            for (
                let dx =
                    -this.loadRadius;

                dx <=
                this.loadRadius;

                dx++
            ) {

                const distance =
                    Math.max(
                        Math.abs(dx),
                        Math.abs(dz)
                    );

                if (
                    distance >
                    this.loadRadius
                ) {

                    continue;
                }

                result.push({

                    x:
                        centerX +
                        dx,

                    z:
                        centerZ +
                        dz,

                    distance
                });
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
    // STREAM WORLD
    // ========================================================

    updateStreaming(
        force = false
    ) {

        if (
            !this.enabled ||
            !this.player
        ) {

            return;
        }

        const position =
            this.player.getPosition();

        if (
            !position
        ) {

            return;
        }

        const currentChunk =
            this.worldToChunk(
                position.x,
                position.z
            );

        this.stats.playerChunkX =
            currentChunk.x;

        this.stats.playerChunkZ =
            currentChunk.z;

        const chunkChanged =
            currentChunk.x !==
            this.lastPlayerChunkX ||

            currentChunk.z !==
            this.lastPlayerChunkZ;

        if (
            !force &&
            !chunkChanged
        ) {

            return;
        }

        this.lastPlayerChunkX =
            currentChunk.x;

        this.lastPlayerChunkZ =
            currentChunk.z;

        // ====================================================
        // LOAD NEARBY
        // ====================================================

        const required =
            this.getRequiredChunks(
                currentChunk.x,
                currentChunk.z
            );

        for (
            const requiredChunk
            of required
        ) {

            if (
                this.loadedChunks.size >=
                this.maxLoadedChunks
            ) {

                break;
            }

            const key =
                this.getChunkKey(
                    requiredChunk.x,
                    requiredChunk.z
                );

            if (
                this.loadedChunks.has(
                    key
                )
            ) {

                const loaded =
                    this.loadedChunks.get(
                        key
                    );

                loaded.active =
                    true;

                loaded.lastUsed =
                    performance.now();

                continue;
            }

            this.loadChunk(
                requiredChunk.x,
                requiredChunk.z
            );
        }

        // ====================================================
        // UNLOAD DISTANT
        // ====================================================

        const unloadList = [];

        for (
            const [
                key,
                chunk
            ]
            of this.loadedChunks
        ) {

            const dx =
                Math.abs(
                    chunk.x -
                    currentChunk.x
                );

            const dz =
                Math.abs(
                    chunk.z -
                    currentChunk.z
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

                unloadList.push(
                    chunk
                );
            }
        }

        for (
            const chunk
            of unloadList
        ) {

            this.unloadChunk(
                chunk.x,
                chunk.z
            );
        }

        this.enforceChunkLimit();
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
            (a, b) =>
                a.lastUsed -
                b.lastUsed
        );

        while (
            this.loadedChunks.size >
            this.maxLoadedChunks
        ) {

            const chunk =
                chunks.shift();

            if (
                !chunk
            ) {

                break;
            }

            this.unloadChunk(
                chunk.x,
                chunk.z
            );
        }
    }


    // ========================================================
    // UPDATE
    // ========================================================

    update(
        deltaTime
    ) {

        if (
            !Number.isFinite(
                deltaTime
            )
        ) {

            deltaTime =
                0.016;
        }

        if (
            !this.enabled
        ) {

            return;
        }

        this.updateTimer +=
            deltaTime;

        if (
            this.updateTimer <
            this.updateInterval
        ) {

            return;
        }

        this.updateTimer =
            0;

        this.updateStreaming(
            false
        );
    }


    // ========================================================
    // WORLD POSITION
    // ========================================================

    getWorldPosition(
        chunkX,
        chunkZ,
        localX = 0,
        localZ = 0
    ) {

        const origin =
            this.chunkToWorld(
                chunkX,
                chunkZ
            );

        return {

            x:
                origin.x +
                localX,

            z:
                origin.z +
                localZ
        };
    }


    // ========================================================
    // GET CURRENT CHUNK
    // ========================================================

    getPlayerChunk() {

        if (
            !this.player
        ) {

            return {

                x: 0,

                z: 0
            };
        }

        const position =
            this.player.getPosition();

        return this.worldToChunk(
            position.x,
            position.z
        );
    }


    // ========================================================
    // GET STATS
    // ========================================================

    getStats() {

        return {

            loadedChunks:
                this.loadedChunks.size,

            totalChunksCreated:
                this.stats.totalChunksCreated,

            totalChunksRemoved:
                this.stats.totalChunksRemoved,

            playerChunkX:
                this.stats.playerChunkX,

            playerChunkZ:
                this.stats.playerChunkZ,

            chunkSize:
                this.chunkSize,

            worldSize:
                this.worldSize,

            worldHalfSize:
                this.worldHalfSize,

            loadRadius:
                this.loadRadius,

            unloadRadius:
                this.unloadRadius,

            mobileMode:
                this.mobileMode
        };
    }


    // ========================================================
    // ENABLE
    // ========================================================

    enable() {

        this.enabled =
            true;

        this.updateStreaming(
            true
        );
    }


    // ========================================================
    // DISABLE
    // ========================================================

    disable() {

        this.enabled =
            false;
    }


    // ========================================================
    // CLEAR WORLD
    // ========================================================

    clear() {

        const chunks =
            Array.from(
                this.loadedChunks.values()
            );

        for (
            const chunk
            of chunks
        ) {

            this.unloadChunk(
                chunk.x,
                chunk.z
            );
        }

        this.chunks.clear();

        this.loadedChunks.clear();

        this.stats.loadedChunks =
            0;
    }


    // ========================================================
    // DISPOSE
    // ========================================================

    dispose() {

        this.clear();

        this.player =
            null;

        this.terrain =
            null;

        this.environment =
            null;

        this.scene =
            null;

        this.initialized =
            false;

        console.log(
            "Veyra World System disposed."
        );
    }
}


// ============================================================
// LIGHTWEIGHT GROUP FALLBACK
//
// This avoids importing THREE.js again just for Group.
// The main world terrain system will replace these groups
// with real Three.js chunk containers.
// ============================================================

class THREEFallbackGroup {

    constructor() {

        this.name =
            "WorldChunk";

        this.position = {

            x: 0,

            y: 0,

            z: 0,

            set:
                (x, y, z) => {

                    this.position.x =
                        x;

                    this.position.y =
                        y;

                    this.position.z =
                        z;
                }
        };

        this.children = [];

        this.parent = null;
    }


    add(
        object
    ) {

        if (
            !object
        ) {

            return;
        }

        this.children.push(
            object
        );

        object.parent =
            this;
    }


    remove(
        object
    ) {

        const index =
            this.children.indexOf(
                object
            );

        if (
            index !== -1
        ) {

            this.children.splice(
                index,
                1
            );
        }

        if (
            object
        ) {

            object.parent =
                null;
        }
    }


    traverse(
        callback
    ) {

        callback(
            this
        );

        for (
            const child
            of this.children
        ) {

            if (
                child &&
                typeof child.traverse ===
                "function"
            ) {

                child.traverse(
                    callback
                );

            } else if (
                child
            ) {

                callback(
                    child
                );
            }
        }
    }
}
