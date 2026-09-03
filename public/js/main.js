// ============================================================
// WILD ISLES
// VEYRA ISLAND
// MAIN GAME ENGINE v0.7
//
// Scene
// Camera
// Renderer
// Lighting
// Terrain
// Water
// Environment
// Player
// HUD
// Loading
// Mouse Camera
// Keyboard
// Mobile
// Responsive
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { VeyraTerrain }
    from "./terrain.js";

import { VeyraWater }
    from "./water.js";

import { VeyraEnvironment }
    from "./environment.js";

import { Player }
    from "./player.js";


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

        // =====================================================
        // CLOCK
        // =====================================================

        this.clock = new THREE.Clock();

        this.elapsedTime = 0;

        // =====================================================
        // CAMERA
        // =====================================================

        this.cameraYaw = Math.PI;

        this.cameraPitch = 0.28;

        this.cameraDistance = 7.2;

        this.cameraHeight = 2.9;

        this.cameraSensitivity = 0.003;

        this.cameraTarget =
            new THREE.Vector3();

        this.cameraPosition =
            new THREE.Vector3();

        // =====================================================
        // CAMERA SMOOTHING
        // =====================================================

        this.cameraInitialized = false;

        // =====================================================
        // MOUSE
        // =====================================================

        this.mouseDown = false;

        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // =====================================================
        // WORLD
        // =====================================================

        this.day = 1;

        this.worldTime = 8.0;

        this.dayLength = 600;

        // =====================================================
        // GAME STATE
        // =====================================================

        this.started = false;

        this.paused = false;

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
                "Creating Veyra Island..."
            );

            this.createScene();

            this.setLoading(
                15,
                "Building atmosphere..."
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
                "Generating terrain..."
            );

            this.createTerrain();

            this.setLoading(
                50,
                "Creating water..."
            );

            this.createWater();

            this.setLoading(
                65,
                "Growing vegetation..."
            );

            this.createEnvironment();

            this.setLoading(
                80,
                "Creating Kian..."
            );

            this.createPlayer();

            this.setLoading(
                90,
                "Connecting controls..."
            );

            this.setupControls();

            this.setupResize();

            this.setupUI();

            this.setLoading(
                100,
                "Veyra Island ready."
            );

            await this.wait(450);

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

        this.scene.environment = null;

        console.log(
            "Scene created"
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
                1600
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
            "Camera created"
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
                1.5
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

        container.innerHTML = "";

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

        this.sun.castShadow = true;

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

        console.log(
            "Terrain connected"
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

        // IMPORTANT:
        // Player v0.8 expects:
        // new Player(scene, terrain)

        this.player =
            new Player(
                this.scene,
                this.terrain
            );

        this.player.setCameraRotation(
            this.cameraYaw
        );

        console.log(
            "Player connected"
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

                this.mouseDown = true;

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

                this.mouseDown = false;
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

                    this.player.keys.run =
                        true;
                };

            const stopRun =
                (event) => {

                    event.preventDefault();

                    this.player.keys.run =
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

                    this.player.keys.jump =
                        true;
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

                this.renderer.setPixelRatio(
                    Math.min(
                        window.devicePixelRatio || 1,
                        1.5
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

    updateCamera(deltaTime) {

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


        // ====================================================
        // CAMERA SMOOTHING
        //
        // IMPORTANT:
        // deltaTime is passed from animate().
        // clock.getDelta() is NOT called here.
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

            this.cameraInitialized = true;

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

    updateWorldTime(deltaTime) {

        this.worldTime +=
            deltaTime *
            (24 / this.dayLength);

        if (
            this.worldTime >= 24
        ) {

            this.worldTime -= 24;

            this.day++;
        }

        this.updateSun();

        this.updateWorldUI();
    }


    // ========================================================
    // SUN
    // ========================================================

    updateSun() {

        if (
            !this.sun
        ) {

            return;
        }

        const normalized =
            this.worldTime / 24;

        const angle =
            normalized *
            Math.PI *
            2;

        const sunX =
            Math.cos(angle) *
            300;

        const sunY =
            Math.sin(angle) *
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
                Math.sin(angle),
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

        const worldTime =
            document.getElementById(
                "world-time"
            );

        const location =
            document.getElementById(
                "world-location"
            );

        if (
            worldTime
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

            worldTime.textContent =
                `DAY ${this.day} • ${formattedHour}:${formattedMinute}`;
        }

        if (
            location
        ) {

            location.textContent =
                "VEYRA ISLAND";
        }

        this.updatePlayerUI();
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
        // SURVIVAL
        // ====================================================

        if (
            hunger
        ) {

            hunger.textContent =
                "100";
        }

        if (
            thirst
        ) {

            thirst.textContent =
                "100";
        }

        if (
            temperature
        ) {

            temperature.textContent =
                "20°C";
        }


        // ====================================================
        // DEBUG
        // ====================================================

        const debug =
            document.getElementById(
                "debug-info"
            );

        if (
            debug &&
            this.player.getDebugInfo
        ) {

            const info =
                this.player.getDebugInfo();

            debug.textContent =
                `X ${info.x} | Y ${info.y} | Z ${info.z} | Slope ${info.slope}°`;
        }
    }


    // ========================================================
    // INTERACTION
    // ========================================================

    showInteraction(
        message
    ) {

        const element =
            document.getElementById(
                "interaction-message"
            );

        if (
            !element
        ) {

            return;
        }

        element.textContent =
            message;

        element.classList.add(
            "show"
        );

        clearTimeout(
            this.interactionTimeout
        );

        this.interactionTimeout =
            setTimeout(
                () => {

                    element.classList.remove(
                        "show"
                    );

                },
                2200
            );
    }


    // ========================================================
    // LOADING
    // ========================================================

    setLoading(
        progress,
        text
    ) {

        if (
            this.loadingProgress
        ) {

            this.loadingProgress.style.width =
                `${progress}%`;
        }

        if (
            this.loadingText
        ) {

            this.loadingText.textContent =
                text;
        }
    }


    // ========================================================
    // START GAME
    // ========================================================

    startGame() {

        this.started = true;

        if (
            this.loadingScreen
        ) {

            this.loadingScreen.style.opacity =
                "0";

            setTimeout(
                () => {

                    if (
                        this.loadingScreen
                    ) {

                        this.loadingScreen.style.display =
                            "none";
                    }

                },
                500
            );
        }

        if (
            this.gameUI
        ) {

            this.gameUI.classList.remove(
                "hidden"
            );
        }

        this.updateWorldTime(0);

        this.animate();

        console.log(
            "WILD ISLES STARTED"
        );
    }


    // ========================================================
    // ANIMATION LOOP
    // ========================================================

    animate() {

        requestAnimationFrame(
            () => this.animate()
        );

        if (
            !this.started
        ) {

            return;
        }

        // ====================================================
        // GET DELTA ONLY ONCE
        // ====================================================

        const deltaTime =
            Math.min(
                this.clock.getDelta(),
                0.05
            );

        this.elapsedTime +=
            deltaTime;


        // ====================================================
        // PLAYER
        // ====================================================

        if (
            this.player
        ) {

            this.player.update(
                deltaTime,
                this.cameraYaw
            );
        }


        // ====================================================
        // CAMERA
        // ====================================================

        this.updateCamera(
            deltaTime
        );


        // ====================================================
        // WORLD
        // ====================================================

        this.updateWorldTime(
            deltaTime
        );


        // ====================================================
        // ENVIRONMENT
        // ====================================================

        if (
            this.environment &&
            typeof this.environment.update ===
            "function"
        ) {

            this.environment.update(
                deltaTime,
                this.elapsedTime
            );
        }


        // ====================================================
        // WATER
        // ====================================================

        if (
            this.water &&
            typeof this.water.update ===
            "function"
        ) {

            this.water.update(
                deltaTime,
                this.elapsedTime
            );
        }


        // ====================================================
        // RENDER
        // ====================================================

        this.renderer.render(
            this.scene,
            this.camera
        );
    }


    // ========================================================
    // WAIT
    // ========================================================

    wait(
        milliseconds
    ) {

        return new Promise(
            (resolve) => {

                setTimeout(
                    resolve,
                    milliseconds
                );
            }
        );
    }


    // ========================================================
    // FATAL ERROR
    // ========================================================

    showFatalError(
        error
    ) {

        console.error(
            error
        );

        if (
            this.loadingScreen
        ) {

            this.loadingScreen.style.display =
                "flex";

            this.loadingScreen.style.opacity =
                "1";
        }

        if (
            this.loadingText
        ) {

            this.loadingText.innerHTML =
                "WORLD FAILED TO LOAD.<br><br>" +
                "Open browser console (F12) " +
                "for the error.";
        }

        if (
            this.loadingProgress
        ) {

            this.loadingProgress.style.width =
                "100%";
        }
    }
}


// ============================================================
// START GAME
// ============================================================

window.addEventListener(
    "DOMContentLoaded",
    () => {

        window.wildIsles =
            new WildIslesGame();

    }
);
