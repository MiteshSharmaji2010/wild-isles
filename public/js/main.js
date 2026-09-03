// ============================================================
// WILD ISLES
// VEYRA WORLD
// MAIN GAME ENGINE v1.0
//
// Scene
// Camera
// Renderer
// Lighting
// Huge World
// Chunk Streaming
// Terrain
// Water
// Environment
// Player
// Survival
// Day / Night
// HUD
// Loading
// Mouse Camera
// Keyboard
// Mobile
// Responsive
// ============================================================

import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { VeyraTerrain }
    from "./terrain.js";

import { VeyraWater }
    from "./water.js";

import { VeyraEnvironment }
    from "./environment.js";

import { Player }
    from "./player.js";

import { SurvivalSystem }
    from "./survival.js";

import { DayNightSystem }
    from "./daynight.js";


// ============================================================
// GAME CLASS
// ============================================================

class WildIslesGame {

    constructor() {

        // =====================================================
        // CORE
        // =====================================================

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.terrain = null;
        this.water = null;
        this.environment = null;
        this.player = null;
        this.survival = null;
        this.dayNight = null;

        // =====================================================
        // CLOCK
        // =====================================================

        this.clock =
            new THREE.Clock();

        this.elapsedTime = 0;

        // =====================================================
        // CAMERA
        // =====================================================

        this.cameraYaw =
            Math.PI;

        this.cameraPitch =
            0.28;

        this.cameraDistance =
            7.2;

        this.cameraHeight =
            2.9;

        this.cameraSensitivity =
            0.003;

        this.cameraTarget =
            new THREE.Vector3();

        this.cameraPosition =
            new THREE.Vector3();

        this.cameraInitialized =
            false;

        // =====================================================
        // MOUSE
        // =====================================================

        this.mouseDown =
            false;

        this.lastMouseX =
            0;

        this.lastMouseY =
            0;

        // =====================================================
        // WORLD
        // =====================================================

        this.day =
            1;

        this.worldTime =
            8.0;

        this.dayLength =
            600;

        // =====================================================
        // HUGE WORLD
        // =====================================================

        this.worldSize =
            16384;

        this.worldHalfSize =
            this.worldSize / 2;

        this.chunkSize =
            256;

        this.currentChunkX =
            null;

        this.currentChunkZ =
            null;

        this.chunkUpdateTimer =
            0;

        this.chunkUpdateInterval =
            0.15;

        // =====================================================
        // GAME STATE
        // =====================================================

        this.started =
            false;

        this.paused =
            false;

        this.mobileMode =
            window.innerWidth <= 900 ||
            "ontouchstart" in window;

        // =====================================================
        // DOM
        // =====================================================

        this.loadingScreen =
            document.getElementById(
                "loading-screen"
            );

        this.loadingProgress =
            document.getElementById(
                "loading-progress"
            );

        this.loadingText =
            document.getElementById(
                "loading-text"
            );

        this.gameUI =
            document.getElementById(
                "game-ui"
            );

        this.mobileUI =
            document.getElementById(
                "mobile-ui"
            );

        // =====================================================
        // START
        // =====================================================

        this.init();
    }


    // ========================================================
    // INITIALIZE
    // ========================================================

    async init() {

        try {

            this.setLoading(
                5,
                "Creating Veyra World..."
            );

            this.createScene();


            this.setLoading(
                15,
                "Preparing huge world camera..."
            );

            this.createCamera();


            this.setLoading(
                25,
                "Preparing lighting..."
            );

            this.createRenderer();

            this.createLights();


            this.setLoading(
                35,
                "Generating world terrain..."
            );

            this.createTerrain();


            this.setLoading(
                50,
                "Loading nearby world chunks..."
            );

            this.createWater();


            this.setLoading(
                62,
                "Growing Veyra vegetation..."
            );

            this.createEnvironment();


            this.setLoading(
                74,
                "Creating Kian..."
            );

            this.createPlayer();


            // =================================================
            // INITIAL TERRAIN STREAM
            // =================================================

            this.updateTerrainStreaming(
                true
            );


            this.setLoading(
                82,
                "Preparing survival system..."
            );

            this.createSurvival();


            this.setLoading(
                88,
                "Creating day and night..."
            );

            this.createDayNight();


            this.setLoading(
                94,
                "Connecting controls..."
            );

            this.setupControls();

            this.setupResize();

            this.setupUI();


            this.setLoading(
                100,
                "WILD ISLES WORLD READY."
            );


            await this.wait(
                450
            );


            this.startGame();

        }
        catch (error) {

            console.error(
                "WILD ISLES initialization error:",
                error
            );

            this.showFatalError(
                error
            );
        }
    }


    // ========================================================
    // SCENE
    // ========================================================

    createScene() {

        this.scene =
            new THREE.Scene();

        this.scene.background =
            new THREE.Color(
                0x9db8c2
            );

        this.scene.fog =
            new THREE.FogExp2(
                0x9db8c2,
                0.0017
            );

        this.scene.environment =
            null;

        console.log(
            "Huge world scene created"
        );
    }


    // ========================================================
    // CAMERA
    // ========================================================

    createCamera() {

        this.camera =
            new THREE.PerspectiveCamera(

                65,

                window.innerWidth /
                window.innerHeight,

                0.1,

                2200
            );

        this.camera.position.set(
            0,
            5,
            10
        );

        this.camera.lookAt(
            0,
            2,
            0
        );

        console.log(
            "Huge world camera created"
        );
    }


    // ========================================================
    // RENDERER
    // ========================================================

    createRenderer() {

        this.renderer =
            new THREE.WebGLRenderer({

                antialias: true,

                powerPreference:
                    "high-performance"
            });

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        this.renderer.setPixelRatio(

            Math.min(

                window.devicePixelRatio || 1,

                this.mobileMode
                    ? 1.25
                    : 1.5
            )
        );

        this.renderer.outputColorSpace =
            THREE.SRGBColorSpace;

        this.renderer.toneMapping =
            THREE.ACESFilmicToneMapping;

        this.renderer.toneMappingExposure =
            1.0;

        this.renderer.shadowMap.enabled =
            true;

        this.renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        const container =
            document.getElementById(
                "game-container"
            );

        if (!container) {

            throw new Error(
                "game-container not found."
            );
        }

        container.innerHTML =
            "";

        container.appendChild(
            this.renderer.domElement
        );

        console.log(
            "Renderer created"
        );
    }


    // ========================================================
    // LIGHTING
    // ========================================================

    createLights() {

        const hemisphere =
            new THREE.HemisphereLight(

                0xbdd2dc,

                0x3b4938,

                1.8
            );

        hemisphere.position.set(
            0,
            250,
            0
        );

        this.scene.add(
            hemisphere
        );

        this.hemisphereLight =
            hemisphere;


        // ====================================================
        // SUN
        // ====================================================

        this.sun =
            new THREE.DirectionalLight(

                0xfff1d0,

                3.0
            );

        this.sun.position.set(
            -180,
            260,
            120
        );

        this.sun.castShadow =
            true;

        this.sun.shadow.mapSize.width =
            2048;

        this.sun.shadow.mapSize.height =
            2048;

        this.sun.shadow.camera.near =
            10;

        this.sun.shadow.camera.far =
            700;

        this.sun.shadow.camera.left =
            -350;

        this.sun.shadow.camera.right =
            350;

        this.sun.shadow.camera.top =
            350;

        this.sun.shadow.camera.bottom =
            -350;

        this.sun.shadow.bias =
            -0.0002;

        this.scene.add(
            this.sun
        );


        // ====================================================
        // SOFT FILL
        // ====================================================

        const fill =
            new THREE.DirectionalLight(

                0x9bb7c8,

                0.65
            );

        fill.position.set(
            180,
            120,
            -180
        );

        this.scene.add(
            fill
        );

        this.fillLight =
            fill;

        console.log(
            "Lighting created"
        );
    }


    // ========================================================
    // TERRAIN
    // ========================================================

    createTerrain() {

        this.terrain =
            new VeyraTerrain(
                this.scene
            );

        // Make main game values follow terrain.
        if (
            Number.isFinite(
                this.terrain.worldSize
            )
        ) {

            this.worldSize =
                this.terrain.worldSize;

            this.worldHalfSize =
                this.terrain.worldHalfSize;
        }

        if (
            Number.isFinite(
                this.terrain.chunkSize
            )
        ) {

            this.chunkSize =
                this.terrain.chunkSize;
        }

        console.log(
            "Huge terrain connected:",
            this.worldSize,
            "x",
            this.worldSize
        );
    }


    // ========================================================
    // WATER
    // ========================================================

    createWater() {

        this.water =
            new VeyraWater(
                this.scene
            );

        console.log(
            "Water connected"
        );
    }


    // ========================================================
    // ENVIRONMENT
    // ========================================================

    createEnvironment() {

        this.environment =
            new VeyraEnvironment(

                this.scene,

                this.terrain
            );

        console.log(
            "Environment connected"
        );
    }


    // ========================================================
    // PLAYER
    // ========================================================

    createPlayer() {

        this.player =
            new Player(

                this.scene,

                this.terrain
            );

        this.player.setCameraRotation(
            this.cameraYaw
        );

        console.log(
            "Kian connected"
        );
    }


    // ========================================================
    // TERRAIN CHUNK STREAMING
    // ========================================================

    updateTerrainStreaming(
        force = false
    ) {

        if (
            !this.player ||
            !this.terrain
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

        if (
            typeof this.terrain.update !==
            "function"
        ) {

            return;
        }

        const chunkSize =
            Number.isFinite(
                this.terrain.chunkSize
            )
                ? this.terrain.chunkSize
                : this.chunkSize;

        const chunkX =
            Math.floor(
                position.x /
                chunkSize
            );

        const chunkZ =
            Math.floor(
                position.z /
                chunkSize
            );

        const changed =
            chunkX !==
                this.currentChunkX ||
            chunkZ !==
                this.currentChunkZ;

        if (
            !force &&
            !changed
        ) {

            return;
        }

        this.currentChunkX =
            chunkX;

        this.currentChunkZ =
            chunkZ;

        this.terrain.update(
            position.x,
            position.z
        );

        console.log(
            `World Chunk: ${chunkX}, ${chunkZ}`
        );
    }


    // ========================================================
    // SURVIVAL
    // ========================================================

    createSurvival() {

        if (
            !this.player ||
            !this.terrain
        ) {

            throw new Error(
                "Player or terrain missing for Survival System."
            );
        }

        this.survival =
            new SurvivalSystem(

                this.player,

                this.terrain
            );

        console.log(
            "Survival connected"
        );
    }


    // ========================================================
    // DAY / NIGHT
    // ========================================================

    createDayNight() {

        if (!this.scene) {

            throw new Error(
                "Scene missing for Day/Night System."
            );
        }

        this.dayNight =
            new DayNightSystem(
                this.scene
            );

        console.log(
            "Day/Night connected"
        );
    }


    // ========================================================
    // CONTROLS
    // ========================================================

    setupControls() {

        // ====================================================
        // MOUSE DOWN
        // ====================================================

        window.addEventListener(
            "mousedown",
            (event) => {

                if (
                    event.button !== 0 &&
                    event.button !== 2
                ) {

                    return;
                }

                this.mouseDown =
                    true;

                this.lastMouseX =
                    event.clientX;

                this.lastMouseY =
                    event.clientY;
            }
        );


        // ====================================================
        // MOUSE UP
        // ====================================================

        window.addEventListener(
            "mouseup",
            () => {

                this.mouseDown =
                    false;
            }
        );


        // ====================================================
        // MOUSE MOVE
        // ====================================================

        window.addEventListener(
            "mousemove",
            (event) => {

                if (
                    !this.mouseDown
                ) {

                    return;
                }

                const dx =
                    event.clientX -
                    this.lastMouseX;

                const dy =
                    event.clientY -
                    this.lastMouseY;

                this.lastMouseX =
                    event.clientX;

                this.lastMouseY =
                    event.clientY;

                this.cameraYaw -=
                    dx *
                    this.cameraSensitivity;

                this.cameraPitch -=
                    dy *
                    this.cameraSensitivity;

                this.cameraPitch =
                    THREE.MathUtils.clamp(

                        this.cameraPitch,

                        -0.15,

                        0.95
                    );

                if (
                    this.player
                ) {

                    this.player.setCameraRotation(
                        this.cameraYaw
                    );
                }
            }
        );


        // ====================================================
        // CONTEXT MENU
        // ====================================================

        window.addEventListener(
            "contextmenu",
            (event) => {

                event.preventDefault();
            }
        );


        // ====================================================
        // MOBILE
        // ====================================================

        this.setupMobileControls();
    }


    // ========================================================
    // MOBILE CONTROLS
    // ========================================================

    setupMobileControls() {

        if (
            !this.mobileMode
        ) {

            return;
        }

        if (
            this.mobileUI
        ) {

            this.mobileUI.classList.remove(
                "hidden"
            );
        }


        // ====================================================
        // RUN
        // ====================================================

        const runButton =
            document.getElementById(
                "mobile-run"
            );

        if (
            runButton &&
            this.player
        ) {

            const startRun =
                (event) => {

                    event.preventDefault();

                    this.player.keys[
                        "ShiftLeft"
                    ] =
                        true;
                };

            const stopRun =
                (event) => {

                    event.preventDefault();

                    this.player.keys[
                        "ShiftLeft"
                    ] =
                        false;
                };

            runButton.addEventListener(
                "touchstart",
                startRun,
                {
                    passive: false
                }
            );

            runButton.addEventListener(
                "touchend",
                stopRun,
                {
                    passive: false
                }
            );

            runButton.addEventListener(
                "touchcancel",
                stopRun,
                {
                    passive: false
                }
            );
        }


        // ====================================================
        // JUMP
        // ====================================================

        const jumpButton =
            document.getElementById(
                "mobile-jump"
            );

        if (
            jumpButton &&
            this.player
        ) {

            jumpButton.addEventListener(

                "touchstart",

                (event) => {

                    event.preventDefault();

                    this.player.jump();
                },

                {
                    passive: false
                }
            );
        }


        // ====================================================
        // ACTION
        // ====================================================

        const actionButton =
            document.getElementById(
                "mobile-action"
            );

        if (
            actionButton
        ) {

            actionButton.addEventListener(

                "touchstart",

                (event) => {

                    event.preventDefault();

                    this.showInteraction(
                        "NO INTERACTION NEARBY"
                    );
                },

                {
                    passive: false
                }
            );
        }
    }


    // ========================================================
    // RESIZE
    // ========================================================

    setupResize() {

        window.addEventListener(
            "resize",
            () => {

                if (
                    !this.camera ||
                    !this.renderer
                ) {

                    return;
                }

                this.camera.aspect =
                    window.innerWidth /
                    window.innerHeight;

                this.camera.updateProjectionMatrix();

                this.renderer.setSize(
                    window.innerWidth,
                    window.innerHeight
                );

                this.mobileMode =
                    window.innerWidth <= 900 ||
                    "ontouchstart" in window;

                this.renderer.setPixelRatio(

                    Math.min(

                        window.devicePixelRatio || 1,

                        this.mobileMode
                            ? 1.25
                            : 1.5
                    )
                );
            }
        );
    }


    // ========================================================
    // UI
    // ========================================================

    setupUI() {

        if (
            this.gameUI
        ) {

            this.gameUI.classList.remove(
                "hidden"
            );
        }

        this.updatePlayerUI();

        this.updateWorldUI();
    }


    // ========================================================
    // CAMERA FOLLOW
    // ========================================================

    updateCamera(
        deltaTime
    ) {

        if (
            !this.player ||
            !this.camera
        ) {

            return;
        }

        const playerPosition =
            this.player.getPosition();


        // ====================================================
        // CAMERA TARGET
        // ====================================================

        this.cameraTarget.set(

            playerPosition.x,

            playerPosition.y +
            this.cameraHeight,

            playerPosition.z
        );


        // ====================================================
        // CAMERA DISTANCE
        // ====================================================

        const horizontalDistance =
            Math.cos(
                this.cameraPitch
            ) *
            this.cameraDistance;

        const verticalDistance =
            Math.sin(
                this.cameraPitch
            ) *
            this.cameraDistance;


        // ====================================================
        // CAMERA POSITION
        // ====================================================

        this.cameraPosition.set(

            playerPosition.x -

            Math.sin(
                this.cameraYaw
            ) *
            horizontalDistance,

            playerPosition.y +
            this.cameraHeight +
            verticalDistance,

            playerPosition.z -

            Math.cos(
                this.cameraYaw
            ) *
            horizontalDistance
        );


        // ====================================================
        // TERRAIN CAMERA COLLISION
        // ====================================================

        if (
            this.terrain
        ) {

            const cameraGround =
                this.terrain.getGroundHeight(

                    this.cameraPosition.x,

                    this.cameraPosition.z
                );

            if (
                Number.isFinite(
                    cameraGround
                )
            ) {

                const minimumCameraHeight =
                    cameraGround + 1.4;

                if (
                    this.cameraPosition.y <
                    minimumCameraHeight
                ) {

                    this.cameraPosition.y =
                        minimumCameraHeight;
                }
            }
        }


        // ====================================================
        // CAMERA SMOOTHING
        // ====================================================

        const smoothing =
            1 -
            Math.pow(
                0.001,
                deltaTime * 8
            );

        if (
            !this.cameraInitialized
        ) {

            this.camera.position.copy(
                this.cameraPosition
            );

            this.cameraInitialized =
                true;

        } else {

            this.camera.position.lerp(

                this.cameraPosition,

                THREE.MathUtils.clamp(
                    smoothing,
                    0,
                    1
                )
            );
        }


        // ====================================================
        // LOOK AT
        // ====================================================

        this.camera.lookAt(
            this.cameraTarget
        );
    }


    // ========================================================
    // WORLD TIME
    // ========================================================

    updateWorldTime(
        deltaTime
    ) {

        if (
            this.dayNight
        ) {

            this.day =
                this.dayNight.day ||
                this.day;

            this.worldTime =
                this.dayNight.timeOfDay ??
                this.worldTime;

            this.updateWorldUI();

            return;
        }


        // ====================================================
        // FALLBACK
        // ====================================================

        this.worldTime +=

            deltaTime *
            (
                24 /
                this.dayLength
            );

        if (
            this.worldTime >= 24
        ) {

            this.worldTime -=
                24;

            this.day++;
        }

        this.updateSun();

        this.updateWorldUI();
    }


    // ========================================================
    // OLD SUN FALLBACK
    // ========================================================

    updateSun() {

        if (
            !this.sun
        ) {

            return;
        }

        const normalized =
            this.worldTime /
            24;

        const angle =
            normalized *
            Math.PI *
            2;

        const sunX =
            Math.cos(
                angle
            ) *
            300;

        const sunY =
            Math.sin(
                angle
            ) *
            300;

        const sunZ =
            100;

        this.sun.position.set(

            sunX,

            Math.max(
                25,
                sunY
            ),

            sunZ
        );

        const daylight =
            THREE.MathUtils.clamp(

                Math.sin(
                    angle
                ),

                0.05,

                1
            );

        this.sun.intensity =
            0.7 +
            daylight * 2.4;
    }


    // ========================================================
    // WORLD UI
    // ========================================================

    updateWorldUI() {

        const worldTimeElement =
            document.getElementById(
                "world-time"
            );

        const location =
            document.getElementById(
                "world-location"
            );

        if (
            this.dayNight
        ) {

            const formattedTime =
                this.dayNight.getFormattedTime();

            if (
                worldTimeElement
            ) {

                worldTimeElement.textContent =
                    `DAY ${this.day} • ${formattedTime}`;
            }

        } else if (
            worldTimeElement
        ) {

            const hour =
                Math.floor(
                    this.worldTime
                );

            const minute =
                Math.floor(
                    (
                        this.worldTime -
                        hour
                    ) * 60
                );

            const formattedHour =
                String(
                    hour
                ).padStart(
                    2,
                    "0"
                );

            const formattedMinute =
                String(
                    minute
                ).padStart(
                    2,
                    "0"
                );

            worldTimeElement.textContent =
                `DAY ${this.day} • ${formattedHour}:${formattedMinute}`;
        }

        if (
            location
        ) {

            location.textContent =
                "VEYRA WORLD";
        }
    }


    // ========================================================
    // PLAYER UI
    // ========================================================

    updatePlayerUI() {

        if (
            !this.player
        ) {

            return;
        }

        const health =
            document.getElementById(
                "health-fill"
            );

        const stamina =
            document.getElementById(
                "stamina-fill"
            );

        const hunger =
            document.getElementById(
                "hunger-value"
            );

        const thirst =
            document.getElementById(
                "thirst-value"
            );

        const temperature =
            document.getElementById(
                "temperature-value"
            );


        // ====================================================
        // HEALTH
        // ====================================================

        if (
            health
        ) {

            const healthPercent =
                THREE.MathUtils.clamp(

                    this.player.health,

                    0,

                    100
                );

            health.style.width =
                `${healthPercent}%`;
        }


        // ====================================================
        // STAMINA
        // ====================================================

        if (
            stamina
        ) {

            const staminaPercent =
                THREE.MathUtils.clamp(

                    this.player.stamina,

                    0,

                    100
                );

            stamina.style.width =
                `${staminaPercent}%`;
        }


        // ====================================================
        // SURVIVAL VALUES
        // ====================================================

        if (
            this.s
