// ============================================================
// WILD ISLES
// VEYRA WORLD
// MAIN GAME ENGINE v1.1
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { VeyraTerrain } from "./terrain.js";
import { VeyraWater } from "./water.js";
import { VeyraEnvironment } from "./environment.js";
import { Player } from "./player.js";
import { SurvivalSystem } from "./survival.js";
import { DayNightSystem } from "./daynight.js";

// ============================================================
// GAME
// ============================================================

class WildIslesGame {

    constructor() {

        // --------------------------------------------------------
        // CORE
        // --------------------------------------------------------

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.terrain = null;
        this.water = null;
        this.environment = null;
        this.player = null;

        this.survival = null;
        this.dayNight = null;

        // --------------------------------------------------------
        // CLOCK
        // --------------------------------------------------------

        this.clock = new THREE.Clock();

        this.elapsedTime = 0;
        this.deltaTime = 0;

        // --------------------------------------------------------
        // WORLD
        // --------------------------------------------------------

        this.worldSize = 16384;
        this.chunkSize = 256;

        this.currentChunkX = null;
        this.currentChunkZ = null;

        this.lastChunkX = null;
        this.lastChunkZ = null;

        this.streamingTimer = 0;

        // --------------------------------------------------------
        // GAME STATE
        // --------------------------------------------------------

        this.started = false;
        this.initialized = false;
        this.paused = false;
        this.loading = true;
        this.fatalError = false;

        // --------------------------------------------------------
        // CAMERA
        // --------------------------------------------------------

        this.cameraDistance = 8;
        this.cameraHeight = 4.5;

        this.cameraYaw = 0;
        this.cameraPitch = -0.18;

        this.cameraMinDistance = 3;
        this.cameraMaxDistance = 14;

        this.cameraTarget = new THREE.Vector3();

        // --------------------------------------------------------
        // MOUSE
        // --------------------------------------------------------

        this.mouseSensitivity = 0.0025;

        this.mouseDown = false;

        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.pointerLocked = false;

        // --------------------------------------------------------
        // MOBILE
        // --------------------------------------------------------

        this.mobile = false;

        this.joystickActive = false;

        this.joystickStartX = 0;
        this.joystickStartY = 0;

        this.joystickX = 0;
        this.joystickY = 0;

        this.mobileRunning = false;

        // --------------------------------------------------------
        // INPUT
        // --------------------------------------------------------

        this.keys = {};

        // --------------------------------------------------------
        // UI
        // --------------------------------------------------------

        this.gameContainer = null;
        this.loadingScreen = null;
        this.loadingProgress = null;
        this.loadingText = null;

        this.gameUI = null;

        this.healthFill = null;
        this.staminaFill = null;

        this.worldTime = null;
        this.worldLocation = null;

        this.hungerValue = null;
        this.thirstValue = null;
        this.temperatureValue = null;

        this.interactionMessage = null;

        this.debugInfo = null;

        // --------------------------------------------------------
        // MOBILE UI
        // --------------------------------------------------------

        this.mobileUI = null;
        this.mobileJoystick = null;
        this.joystickKnob = null;
        this.mobileRun = null;
        this.mobileJump = null;
        this.mobileAction = null;

        // --------------------------------------------------------
        // TEMP
        // --------------------------------------------------------

        this.tempVector = new THREE.Vector3();

        this.tempVector2 = new THREE.Vector3();

        // --------------------------------------------------------
        // BOUND FUNCTIONS
        // --------------------------------------------------------

        this.animate = this.animate.bind(this);

        // --------------------------------------------------------
        // START
        // --------------------------------------------------------

        this.init();
    }

    // ============================================================
    // INIT
    // ============================================================

    async init() {

        try {

            this.setLoading(5, "INITIALIZING VEYRA WORLD");

            this.detectDevice();

            this.cacheDOM();

            this.setLoading(10, "CREATING WORLD");

            this.createScene();

            this.setLoading(18, "CREATING CAMERA");

            this.createCamera();

            this.setLoading(26, "CREATING RENDERER");

            this.createRenderer();

            this.setLoading(34, "CREATING LIGHTING");

            this.createLights();

            this.setLoading(42, "GENERATING TERRAIN");

            this.createTerrain();

            this.setLoading(52, "CREATING WATER");

            this.createWater();

            this.setLoading(62, "LOADING ENVIRONMENT");

            this.createEnvironment();

            this.setLoading(70, "SPAWNING KIAN");

            this.createPlayer();

            this.setLoading(78, "INITIALIZING SURVIVAL");

            this.createSurvival();

            this.setLoading(85, "STARTING DAY/NIGHT");

            this.createDayNight();

            this.setLoading(91, "SETTING CONTROLS");

            this.setupControls();

            this.setupMobileControls();

            this.setupResize();

            this.setupUI();

            this.setLoading(97, "STARTING GAME");

            this.initialized = true;

            this.startGame();

        } catch (error) {

            console.error("WILD ISLES INITIALIZATION ERROR:", error);

            this.showFatalError(error);

        }
    }

    // ============================================================
    // DEVICE
    // ============================================================

    detectDevice() {

        const touch =
            "ontouchstart" in window ||
            navigator.maxTouchPoints > 0;

        const smallScreen =
            window.innerWidth <= 900;

        this.mobile = touch || smallScreen;

        console.log(
            "Device:",
            this.mobile ? "MOBILE/TABLET" : "DESKTOP"
        );
    }

    // ============================================================
    // DOM
    // ============================================================

    cacheDOM() {

        this.gameContainer =
            document.getElementById("game-container");

        this.loadingScreen =
            document.getElementById("loading-screen");

        this.loadingProgress =
            document.getElementById("loading-progress");

        this.loadingText =
            document.getElementById("loading-text");

        this.gameUI =
            document.getElementById("game-ui");

        this.healthFill =
            document.getElementById("health-fill");

        this.staminaFill =
            document.getElementById("stamina-fill");

        this.worldTime =
            document.getElementById("world-time");

        this.worldLocation =
            document.getElementById("world-location");

        this.hungerValue =
            document.getElementById("hunger-value");

        this.thirstValue =
            document.getElementById("thirst-value");

        this.temperatureValue =
            document.getElementById("temperature-value");

        this.interactionMessage =
            document.getElementById("interaction-message");

        this.debugInfo =
            document.getElementById("debug-info");

        this.mobileUI =
            document.getElementById("mobile-ui");

        this.mobileJoystick =
            document.getElementById("mobile-joystick");

        this.joystickKnob =
            document.getElementById("joystick-knob");

        this.mobileRun =
            document.getElementById("mobile-run");

        this.mobileJump =
            document.getElementById("mobile-jump");

        this.mobileAction =
            document.getElementById("mobile-action");

        if (!this.gameContainer) {
            throw new Error(
                "game-container not found"
            );
        }
    }

    // ============================================================
    // SCENE
    // ============================================================

    createScene() {

        this.scene = new THREE.Scene();

        this.scene.background =
            new THREE.Color(0x8eb5c0);

        this.scene.fog =
            new THREE.Fog(
                0x8eb5c0,
                180,
                this.mobile ? 700 : 1100
            );

        console.log("Scene READY");
    }

    // ============================================================
    // CAMERA
    // ============================================================

    createCamera() {

        const aspect =
            window.innerWidth /
            Math.max(1, window.innerHeight);

        this.camera =
            new THREE.PerspectiveCamera(
                65,
                aspect,
                0.1,
                5000
            );

        this.camera.position.set(
            0,
            5,
            10
        );

        this.cameraTarget.set(
            0,
            2,
            0
        );

        console.log("Camera READY");
    }

    // ============================================================
    // RENDERER
    // ============================================================

    createRenderer() {

        this.renderer =
            new THREE.WebGLRenderer({
                antialias: !this.mobile,
                powerPreference: "high-performance",
                alpha: false
            });

        const pixelRatio =
            Math.min(
                window.devicePixelRatio || 1,
                this.mobile ? 1.5 : 2
            );

        this.renderer.setPixelRatio(
            pixelRatio
        );

        this.renderer.setSize(
            window.innerWidth,
            window.innerHeight,
            false
        );

        this.renderer.shadowMap.enabled =
            !this.mobile;

        if (this.renderer.shadowMap.enabled) {

            this.renderer.shadowMap.type =
                THREE.PCFSoftShadowMap;
        }

        this.renderer.outputColorSpace =
            THREE.SRGBColorSpace;

        this.renderer.toneMapping =
            THREE.ACESFilmicToneMapping;

        this.renderer.toneMappingExposure =
            1.0;

        this.renderer.domElement.id =
            "wild-isles-canvas";

        this.gameContainer.appendChild(
            this.renderer.domElement
        );

        console.log("Renderer READY");
    }

    // ============================================================
    // LIGHTS
    // ============================================================

    createLights() {

        const ambient =
            new THREE.AmbientLight(
                0xffffff,
                this.mobile ? 0.75 : 0.55
            );

        this.scene.add(ambient);

        const hemisphere =
            new THREE.HemisphereLight(
                0x9fd6ff,
                0x3a3326,
                this.mobile ? 0.65 : 0.5
            );

        this.scene.add(hemisphere);

        const sun =
            new THREE.DirectionalLight(
                0xffffff,
                1.4
            );

        sun.position.set(
            180,
            300,
            120
        );

        sun.castShadow =
            !this.mobile;

        if (sun.castShadow) {

            sun.shadow.mapSize.width = 1024;
            sun.shadow.mapSize.height = 1024;

            sun.shadow.camera.near = 1;
            sun.shadow.camera.far = 700;

            sun.shadow.camera.left = -250;
            sun.shadow.camera.right = 250;
            sun.shadow.camera.top = 250;
            sun.shadow.camera.bottom = -250;
        }

        this.scene.add(sun);

        console.log("Lighting READY");
    }

    // ============================================================
    // TERRAIN
    // ============================================================

    createTerrain() {

        this.terrain =
            new VeyraTerrain(
                this.scene
            );

        if (
            this.terrain &&
            typeof this.terrain.enable === "function"
        ) {

            this.terrain.enable();
        }

        console.log(
            "Veyra Terrain READY"
        );
    }

    // ============================================================
    // WATER
    // ============================================================

    createWater() {

        this.water =
            new VeyraWater(
                this.scene,
                this.terrain
            );

        console.log(
            "Veyra Water READY"
        );
    }

    // ============================================================
    // ENVIRONMENT
    // ============================================================

    createEnvironment() {

        this.environment =
            new VeyraEnvironment(
                this.scene,
                this.terrain
            );

        console.log(
            "Veyra Environment READY"
        );
    }

    // ============================================================
    // PLAYER
    // ============================================================

    createPlayer() {

        this.player =
            new Player(
                this.scene,
                this.terrain
            );

        if (
            this.player &&
            typeof this.player.setCameraRotation === "function"
        ) {

            this.player.setCameraRotation(
                this.cameraYaw
            );
        }

        console.log(
            "Kian Player READY"
        );
    }

    // ============================================================
    // SURVIVAL
    // ============================================================

    createSurvival() {

        this.survival =
            new SurvivalSystem(
                this.player,
                this.terrain
            );

        console.log(
            "Survival System READY"
        );
    }

    // ============================================================
    // DAY NIGHT
    // ============================================================

    createDayNight() {

        this.dayNight =
            new DayNightSystem(
                this.scene
            );

        console.log(
            "Day/Night System READY"
        );
    }

    // ============================================================
    // CONTROLS
    // ============================================================

    setupControls() {

        window.addEventListener(
            "keydown",
            (event) => {

                this.keys[event.code] = true;

                if (
                    [
                        "Space",
                        "ArrowUp",
                        "ArrowDown",
                        "ArrowLeft",
                        "ArrowRight"
                    ].includes(event.code)
                ) {

                    event.preventDefault();
                }

                if (event.code === "Escape") {

                    this.paused =
                        !this.paused;
                }
            }
        );

        window.addEventListener(
            "keyup",
            (event) => {

                this.keys[event.code] = false;
            }
        );

        const canvas =
            this.renderer
                ? this.renderer.domElement
                : null;

        if (!canvas) return;

        canvas.addEventListener(
            "mousedown",
            (event) => {

                this.mouseDown = true;

                this.lastMouseX =
                    event.clientX;

                this.lastMouseY =
                    event.clientY;
            }
        );

        window.addEventListener(
            "mouseup",
            () => {

                this.mouseDown = false;
            }
        );

        window.addEventListener(
            "mousemove",
            (event) => {

                if (!this.mouseDown) return;

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

                this.rotateCamera(
                    dx,
                    dy
                );
            }
        );

        canvas.addEventListener(
            "wheel",
            (event) => {

                event.preventDefault();

                this.cameraDistance +=
                    event.deltaY * 0.01;

                this.cameraDistance =
                    THREE.MathUtils.clamp(
                        this.cameraDistance,
                        this.cameraMinDistance,
                        this.cameraMaxDistance
                    );
            },
            {
                passive: false
            }
        );

        canvas.addEventListener(
            "contextmenu",
            (event) => {

                event.preventDefault();
            }
        );

        // --------------------------------------------------------
        // POINTER LOCK
        // --------------------------------------------------------

        canvas.addEventListener(
            "dblclick",
            () => {

                if (
                    document.pointerLockElement !==
                    canvas
                ) {

                    try {
                        canvas.requestPointerLock();
                    } catch (error) {
                        console.warn(
                            "Pointer lock unavailable"
                        );
                    }

                } else {

                    document.exitPointerLock();
                }
            }
        );

        document.addEventListener(
            "pointerlockchange",
            () => {

                this.pointerLocked =
                    document.pointerLockElement ===
                    canvas;
            }
        );

        document.addEventListener(
            "mousemove",
            (event) => {

                if (!this.pointerLocked)
                    return;

                this.rotateCamera(
                    event.movementX,
                    event.movementY
                );
            }
        );

        console.log(
            "Desktop Controls READY"
        );
    }

    // ============================================================
    // CAMERA ROTATION
    // ============================================================

    rotateCamera(
        deltaX,
        deltaY
    ) {

        this.cameraYaw -=
            deltaX *
            this.mouseSensitivity;

        this.cameraPitch -=
            deltaY *
            this.mouseSensitivity;

        this.cameraPitch =
            THREE.MathUtils.clamp(
                this.cameraPitch,
                -1.15,
                0.75
            );

        if (
            this.player &&
            typeof this.player.setCameraRotation === "function"
        ) {

            this.player.setCameraRotation(
                this.cameraYaw
            );
        }
    }

    // ============================================================
    // MOBILE CONTROLS
    // ============================================================

    setupMobileControls() {

        if (!this.mobile) {

            if (this.mobileUI) {

                this.mobileUI.classList.add(
                    "hidden"
                );
            }

            return;
        }

        if (this.mobileUI) {

            this.mobileUI.classList.remove(
                "hidden"
            );
        }

        if (!this.mobileJoystick)
            return;

        const startJoystick =
            (event) => {

                event.preventDefault();

                const touch =
                    event.touches
                        ? event.touches[0]
                        : event;

                const rect =
                    this.mobileJoystick
                        .getBoundingClientRect();

                this.joystickStartX =
                    rect.left +
                    rect.width / 2;

                this.joystickStartY =
                    rect.top +
                    rect.height / 2;

                this.joystickActive =
                    true;

                this.updateJoystick(
                    touch.clientX,
                    touch.clientY
                );
            };

        const moveJoystick =
            (event) => {

                if (!this.joystickActive)
                    return;

                event.preventDefault();

                const touch =
                    event.touches
                        ? event.touches[0]
                        : event;

                this.updateJoystick(
                    touch.clientX,
                    touch.clientY
                );
            };

        const endJoystick =
            (event) => {

                if (!this.joystickActive)
                    return;

                event.preventDefault();

                this.joystickActive =
                    false;

                this.joystickX = 0;
                this.joystickY = 0;

                if (this.joystickKnob) {

                    this.joystickKnob.style.transform =
                        "translate(-50%, -50%)";
                }
            };

        this.mobileJoystick.addEventListener(
            "touchstart",
            startJoystick,
            {
                passive: false
            }
        );

        this.mobileJoystick.addEventListener(
            "touchmove",
            moveJoystick,
            {
                passive: false
            }
        );

        this.mobileJoystick.addEventListener(
            "touchend",
            endJoystick,
            {
                passive: false
            }
        );

        this.mobileJoystick.addEventListener(
            "touchcancel",
            endJoystick,
            {
                passive: false
            }
        );

        // --------------------------------------------------------
        // RUN
        // --------------------------------------------------------

        if (this.mobileRun) {

            const runStart =
                (event) => {

                    event.preventDefault();

                    this.mobileRunning =
                        true;
                };

            const runEnd =
                (event) => {

                    event.preventDefault();

                    this.mobileRunning =
                        false;
                };

            this.mobileRun.addEventListener(
                "touchstart",
                runStart,
                {
                    passive: false
                }
            );

            this.mobileRun.addEventListener(
                "touchend",
                runEnd,
                {
                    passive: false
                }
            );

            this.mobileRun.addEventListener(
                "touchcancel",
                runEnd,
                {
                    passive: false
                }
            );
        }

        // --------------------------------------------------------
        // JUMP
        // --------------------------------------------------------

        if (this.mobileJump) {

            this.mobileJump.addEventListener(
                "touchstart",
                (event) => {

                    event.preventDefault();

                    if (
                        this.player &&
                        typeof this.player.jump === "function"
                    ) {

                        this.player.jump();
                    }
                },
                {
                    passive: false
                }
            );
        }

        // --------------------------------------------------------
        // ACTION
        // --------------------------------------------------------

        if (this.mobileAction) {

            this.mobileAction.addEventListener(
                "touchstart",
                (event) => {

                    event.preventDefault();

                    this.showInteraction(
                        "ACTION"
                    );
                },
                {
                    passive: false
                }
            );
        }

        console.log(
            "Mobile Controls READY"
        );
    }

    // ============================================================
    // JOYSTICK
    // ============================================================

    updateJoystick(
        clientX,
        clientY
    ) {

        const rect =
            this.mobileJoystick
                .getBoundingClientRect();

        const centerX =
            rect.left +
            rect.width / 2;

        const centerY =
            rect.top +
            rect.height / 2;

        let dx =
            clientX -
            centerX;

        let dy =
            clientY -
            centerY;

        const maxDistance =
            rect.width * 0.32;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (distance > maxDistance) {

            const factor =
                maxDistance /
                distance;

            dx *= factor;
            dy *= factor;
        }

        this.joystickX =
            dx / maxDistance;

        this.joystickY =
            dy / maxDistance;

        if (this.joystickKnob) {

            this.joystickKnob.style.transform =
                `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        }
    }

    // ============================================================
    // RESIZE
    // ============================================================

    setupResize() {

        window.addEventListener(
            "resize",
            () => {

                if (!this.camera ||
                    !this.renderer)
                    return;

                this.camera.aspect =
                    window.innerWidth /
                    Math.max(
                        1,
                        window.innerHeight
                    );

                this.camera.updateProjectionMatrix();

                this.renderer.setSize(
                    window.innerWidth,
                    window.innerHeight,
                    false
                );
            }
        );
    }

    // ============================================================
    // UI
    // ============================================================

    setupUI() {

        if (this.gameUI) {

            this.gameUI.classList.remove(
                "hidden"
            );
        }

        this.updatePlayerUI();

        this.updateWorldUI();

        this.updateDebugUI();

        console.log(
            "Game UI READY"
        );
    }

    // ============================================================
    // LOADING
    // ============================================================

    setLoading(
        progress,
        message
    ) {

        const value =
            THREE.MathUtils.clamp(
                Number(progress) || 0,
                0,
                100
            );

        if (this.loadingProgress) {

            this.loadingProgress.style.width =
                `${value}%`;
        }

        if (this.loadingText) {

            this.loadingText.textContent =
                message || "LOADING";
        }

        const status =
            document.querySelector(
                ".loading-status"
            );

        if (status) {

            status.textContent =
                message || "LOADING";
        }

        const percent =
            document.querySelector(
                ".loading-line"
            );

        if (percent) {

            percent.textContent =
                `${Math.round(value)}%`;
        }
    }

    // ============================================================
    // START GAME
    // ============================================================

    startGame() {

        if (!this.initialized) {

            console.warn(
                "Game not initialized"
            );

            return;
        }

        this.started = true;

        this.loading = false;

        this.setLoading(
            100,
            "VEYRA WORLD READY"
        );

        setTimeout(
            () => {

                if (this.loadingScreen) {

                    this.loadingScreen.style.opacity =
                        "0";

                    this.loadingScreen.style.pointerEvents =
                        "none";

                    setTimeout(
                        () => {

                            if (this.loadingScreen) {

                                this.loadingScreen.style.display =
                                    "none";
                            }

                        },
                        500
                    );
                }

            },
            300
        );

        this.clock.start();

        requestAnimationFrame(
            this.animate
        );

        console.log(
            "================================"
        );

        console.log(
            "WILD ISLES STARTED"
        );

        console.log(
            "VEYRA WORLD ONLINE"
        );

        console.log(
            "================================"
        );
    }

    // ============================================================
    // GAME LOOP
    // ============================================================

    animate() {

        requestAnimationFrame(
            this.animate
        );

        if (!this.started)
            return;

        if (this.fatalError)
            return;

        this.deltaTime =
            this.clock.getDelta();

        this.deltaTime =
            Math.min(
                this.deltaTime,
                0.1
            );

        this.elapsedTime +=
            this.deltaTime;

        if (this.paused) {

            this.render();

            return;
        }

        try {

            this.update(
                this.deltaTime,
                this.elapsedTime
            );

            this.render();

        } catch (error) {

            console.error(
                "GAME LOOP ERROR:",
                error
            );

            this.fatalError = true;

            this.showFatalError(
                error
            );
        }
    }

    // ============================================================
    // UPDATE
    // ============================================================

    update(
        deltaTime,
        elapsedTime
    ) {

        this.updatePlayer(
            deltaTime
        );

        this.updateTerrainStreaming();

        this.updateWorldSystems(
            deltaTime,
            elapsedTime
        );

        this.updateCamera();

        this.updateWorldTime();

        this.updatePlayerUI();

        this.updateWorldUI();

        this.updateDebugUI();
    }

    // ============================================================
    // PLAYER UPDATE
    // ============================================================

    updatePlayer(deltaTime) {

        if (!this.player)
            return;

        // --------------------------------------------------------
        // MOBILE INPUT
        // --------------------------------------------------------

        if (this.mobile) {

            const threshold =
                0.12;

            if (
                Math.abs(this.joystickX) >
                    threshold ||
                Math.abs(this.joystickY) >
                    threshold
            ) {

                if (!this.player.keys) {

                    this.player.keys = {};
                }

                // Forward/back
                if (
                    this.joystickY <
                    -threshold
                ) {

                    this.player.keys.KeyW =
                        true;

                    this.player.keys.KeyS =
                        false;

                } else if (
                    this.joystickY >
                    threshold
                ) {

                    this.player.keys.KeyS =
                        true;

                    this.player.keys.KeyW =
                        false;

                } else {

                    this.player.keys.KeyW =
                        false;

                    this.player.keys.KeyS =
                        false;
                }

                // Left/right
                if (
                    this.joystickX <
                    -threshold
                ) {

                    this.player.keys.KeyA =
                        true;

                    this.player.keys.KeyD =
                        false;

                } else if (
                    this.joystickX >
                    threshold
                ) {

                    this.player.keys.KeyD =
                        true;

                    this.player.keys.KeyA =
                        false;

                } else {

                    this.player.keys.KeyA =
                        false;

                    this.player.keys.KeyD =
                        false;
                }

                if (
                    this.mobileRunning
                ) {

                    this.player.keys.ShiftLeft =
                        true;

                } else {

                    this.player.keys.ShiftLeft =
                        false;
                }

            } else {

                if (this.player.keys) {

                    this.player.keys.KeyW =
                        false;

                    this.player.keys.KeyS =
                        false;

                    this.player.keys.KeyA =
                        false;

                    this.player.keys.KeyD =
                        false;

                    this.player.keys.ShiftLeft =
                        false;
                }
            }
        }

        // --------------------------------------------------------
        // PLAYER SYSTEM
        // --------------------------------------------------------

        if (
            typeof this.player.update ===
            "function"
        ) {

            this.player.update(
                deltaTime
            );
        }
    }

    // ============================================================
    // TERRAIN STREAMING
    // ============================================================

    updateTerrainStreaming() {

        if (!this.terrain ||
            !this.player)
            return;

        const position =
            this.player.getPosition();

        if (!position)
            return;

        // Terrain's own streaming system
        if (
            typeof this.terrain.update ===
            "function"
        ) {

            this.terrain.update(
                position.x,
                position.z
            );
        }

        const chunkX =
            Math.floor(
                position.x /
                this.chunkSize
            );

        const chunkZ =
            Math.floor(
                position.z /
                this.chunkSize
            );

        this.currentChunkX =
            chunkX;

        this.currentChunkZ =
            chunkZ;

        if (
            chunkX !== this.lastChunkX ||
            chunkZ !== this.lastChunkZ
        ) {

            this.lastChunkX =
                chunkX;

            this.lastChunkZ =
                chunkZ;

            this.onChunkChanged(
                chunkX,
                chunkZ
            );
        }
    }

    // ============================================================
    // CHUNK CHANGE
    // ============================================================

    onChunkChanged(
        chunkX,
        chunkZ
    ) {

        console.log(
            `WORLD CHUNK: ${chunkX}, ${chunkZ}`
        );

        // Environment streaming hook
        if (
            this.environment &&
            typeof this.environment.update ===
            "function"
        ) {

            this.environment.update(
                this.deltaTime
            );
        }
    }

    // ============================================================
    // WORLD SYSTEMS
    // ============================================================

    updateWorldSystems(
        deltaTime,
        elapsedTime
    ) {

        // --------------------------------------------------------
        // WATER
        // --------------------------------------------------------

        if (
            this.water &&
            typeof this.water.update ===
            "function"
        ) {

            this.water.update(
                deltaTime,
                elapsedTime
            );
        }

        // --------------------------------------------------------
        // ENVIRONMENT
        // --------------------------------------------------------

        if (
            this.environment &&
            typeof this.environment.update ===
            "function"
        ) {

            this.environment.update(
                deltaTime,
                elapsedTime
            );
        }

        // --------------------------------------------------------
        // SURVIVAL
        // --------------------------------------------------------

        if (
            this.survival &&
            typeof this.survival.update ===
            "function"
        ) {

            this.survival.update(
                deltaTime,
                elapsedTime
            );
        }

        // --------------------------------------------------------
        // DAY NIGHT
        // --------------------------------------------------------

        if (
            this.dayNight &&
            typeof this.dayNight.update ===
            "function"
        ) {

            this.dayNight.update(
                deltaTime
            );
        }
    }

    // ============================================================
    // CAMERA
    // ============================================================

    updateCamera() {

        if (!this.camera ||
            !this.player)
            return;

        const playerObject =
            typeof this.player.getObject ===
            "function"
                ? this.player.getObject()
                : null;

        if (!playerObject)
            return;

        const playerPosition =
            this.player.getPosition();

        if (!playerPosition)
            return;

        this.cameraTarget.set(
            playerPosition.x,
            playerPosition.y + 1.7,
            playerPosition.z
        );

        const horizontal =
            Math.cos(
                this.cameraPitch
            ) *
            this.cameraDistance;

        const vertical =
            Math.sin(
                this.cameraPitch
            ) *
            this.cameraDistance;

        const offsetX =
            Math.sin(
                this.cameraYaw
            ) *
            horizontal;

        const offsetZ =
            Math.cos(
                this.cameraYaw
            ) *
            horizontal;

        const desiredPosition =
            this.tempVector.set(
                this.cameraTarget.x +
                    offsetX,

                this.cameraTarget.y -
                    vertical +
                    this.cameraHeight *
                    0.15,

                this.cameraTarget.z +
                    offsetZ
            );

        const smoothing =
            1 -
            Math.pow(
                0.001,
                this.deltaTime
            );

        this.camera.position.lerp(
            desiredPosition,
            smoothing
        );

        this.camera.lookAt(
            this.cameraTarget
        );
    }

    // ============================================================
    // WORLD TIME
    // ============================================================

    updateWorldTime() {

        if (!this.dayNight)
            return;

        if (!this.worldTime)
            return;

        if (
            typeof this.dayNight.getFormattedTime ===
            "function"
        ) {

            this.worldTime.textContent =
                this.dayNight.getFormattedTime();

            return;
        }

        if (
            typeof this.dayNight.getTime ===
            "function"
        ) {

            const time =
                this.dayNight.getTime();

            if (time) {

                this.worldTime.textContent =
                    String(time);
            }
        }
    }

    // ============================================================
    // WORLD UI
    // ============================================================

    updateWorldUI() {

        if (this.worldLocation) {

            let locationText =
                "VEYRA ISLAND";

            if (
                this.terrain &&
                this.player
            ) {

                const position =
                    this.player.getPosition();

                if (
                    position &&
                    typeof this.terrain.getBiome ===
                    "function"
                ) {

                    const biome =
                        this.terrain.getBiome(
                            position.x,
                            position.z
                        );

                    if (biome) {

                        locationText =
                            this.formatBiome(
                                biome
                            );
                    }
                }
            }

            this.worldLocation.textContent =
                locationText.toUpperCase();
        }
    }

    // ============================================================
    // BIOME FORMAT
    // ============================================================

    formatBiome(
        biome
    ) {

        const names = {

            ocean:
                "OPEN OCEAN",

            coast:
                "COASTAL REGION",

            forest:
                "GREENFALL FOREST",

            grassland:
                "VEYRA GRASSLAND",

            highland:
                "NORTHERN HIGHLANDS",

            mountain:
                "MOUNTAIN RANGE",

            snow:
                "FROST PEAK",

            desert:
                "ASHEN DESERT"
        };

        return (
            names[biome] ||
            "VEYRA ISLAND"
        );
    }

    // ============================================================
    // PLAYER UI
    // ============================================================

    updatePlayerUI() {

        if (!this.player)
            return;

        const status =
            this.survival &&
            typeof this.survival.getStatus ===
            "function"
                ? this.survival.getStatus()
                : null;

        // --------------------------------------------------------
        // HEALTH
        // --------------------------------------------------------

        let health =
            status
                ? status.health
                : this.player.health;

        const maxHealth =
            status
                ? 100
                : (
                    this.player.maxHealth ||
                    100
                );

        health =
            Number.isFinite(
                Number(health)
            )
                ? Number(health)
                : 100;

        const healthPercent =
            THREE.MathUtils.clamp(
                health /
                    Math.max(
                        1,
                        maxHealth
                    ) *
                    100,
                0,
                100
            );

        if (this.healthFill) {

            this.healthFill.style.width =
                `${healthPercent}%`;
        }

        // --------------------------------------------------------
        // STAMINA
        // --------------------------------------------------------

        let stamina =
            status
                ? status.stamina
                : this.player.stamina;

        stamina =
            Number.isFinite(
                Number(stamina)
            )
                ? Number(stamina)
                : 100;

        const maxStamina =
            this.player.maxStamina ||
            100;

        const staminaPercent =
            THREE.MathUtils.clamp(
                stamina /
                    Math.max(
                        1,
                        maxStamina
                    ) *
                    100,
                0,
                100
            );

        if (this.staminaFill) {

            this.staminaFill.style.width =
                `${staminaPercent}%`;
        }

        // --------------------------------------------------------
        // HUNGER
        // --------------------------------------------------------

        if (
            this.hungerValue &&
            status
        ) {

            this.hungerValue.textContent =
                `${Math.round(
                    status.hunger
                )}%`;
        }

        // --------------------------------------------------------
        // THIRST
        // --------------------------------------------------------

        if (
            this.thirstValue &&
            status
        ) {

            this.thirstValue.textContent =
                `${Math.round(
                    status.thirst
                )}%`;
        }

        // --------------------------------------------------------
        // TEMPERATURE
        // --------------------------------------------------------

        if (
            this.temperatureValue &&
            status
        ) {

            this.temperatureValue.textContent =
                `${Math.round(
                    status.temperature
                )}%`;
        }
    }

    // ============================================================
    // DEBUG
    // ============================================================

    updateDebugUI() {

        if (!this.debugInfo)
            return;

        if (!this.player) {

            this.debugInfo.textContent =
                "WILD ISLES";

            return;
        }

        const position =
            this.player.getPosition();

        if (!position)
            return;

        const fps =
            this.deltaTime > 0
                ? Math.round(
                    1 /
                    this.deltaTime
                )
                : 60;

        const chunkX =
            Math.floor(
                position.x /
                this.chunkSize
            );

        const chunkZ =
            Math.floor(
                position.z /
                this.chunkSize
            );

        let terrainText = "";

        if (
            this.terrain &&
            typeof this.terrain.getTerrainInfo ===
            "function"
        ) {

            try {

                const info =
                    this.terrain.getTerrainInfo(
                        position.x,
                        position.z
                    );

                if (info) {

                    terrainText =
                        `\nBIOME: ${
                            info.biome ||
                            "UNKNOWN"
                        }`;
                }

            } catch (error) {

                // Debug information should
                // never stop the game.
            }
        }

        this.debugInfo.textContent =
            `FPS: ${fps}` +
            `\nPOS: ${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)}` +
            `\nCHUNK: ${chunkX}, ${chunkZ}` +
            terrainText;
    }

    // ============================================================
    // INTERACTION
    // ============================================================

    showInteraction(
        message,
        duration = 1800
    ) {

        if (!this.interactionMessage)
            return;

        this.interactionMessage.textContent =
            message;

        this.interactionMessage.classList.add(
            "show"
        );

        clearTimeout(
            this.interactionTimer
        );

        this.interactionTimer =
            setTimeout(
                () => {

                    if (
                        this.interactionMessage
                    ) {

                        this.interactionMessage.classList.remove(
                            "show"
                        );
                    }

                },
                duration
            );
    }

    // ============================================================
    // RENDER
    // ============================================================

    render() {

        if (!this.renderer ||
            !this.scene ||
            !this.camera)
            return;

        this.renderer.render(
            this.scene,
            this.camera
        );
    }

    // ============================================================
    // PAUSE
    // ============================================================

    pause() {

        this.paused = true;
    }

    // ============================================================
    // RESUME
    // ============================================================

    resume() {

        this.paused = false;

        this.clock.start();
    }

    // ============================================================
    // TELEPORT
    // ============================================================

    teleport(
        x,
        z
    ) {

        if (!this.player)
            return false;

        if (
            typeof this.player.teleport !==
            "function"
        ) {

            return false;
        }

        let y = 5;

        if (
            this.terrain &&
            typeof this.terrain.getSafeGroundHeight ===
            "function"
        ) {

            y =
                this.terrain.getSafeGroundHeight(
                    x,
                    z
                );
        }

        this.player.teleport(
            x,
            y,
            z
        );

        return true;
    }

    // ============================================================
    // GET GAME STATE
    // ============================================================

    getGameState() {

        const position =
            this.player
                ? this.player.getPosition()
                : null;

        return {

            started:
                this.started,

            paused:
                this.paused,

            elapsedTime:
                this.elapsedTime,

            player:
                position
                    ? {
                        x: position.x,
                        y: position.y,
                        z: position.z
                    }
                    : null,

            chunk:
                this.currentChunkX !== null
                    ? {
                        x:
                            this.currentChunkX,
                        z:
                            this.currentChunkZ
                    }
                    : null,

            survival:
                this.survival &&
                typeof this.survival.getStatus ===
                "function"
                    ? this.survival.getStatus()
                    : null
        };
    }

    // ============================================================
    // FATAL ERROR
    // ============================================================

    showFatalError(
        error
    ) {

        this.fatalError = true;

        console.error(
            "WILD ISLES FATAL ERROR:",
            error
        );

        const message =
            error &&
            error.message
                ? error.message
                : String(error);

        if (this.loadingScreen) {

            this.loadingScreen.style.display =
                "flex";

            this.loadingScreen.style.opacity =
                "1";
        }

        const title =
            document.querySelector(
                ".loading-title"
            );

        const subtitle =
            document.querySelector(
                ".loading-subtitle"
            );

        const status =
            document.querySelector(
                ".loading-status"
            );

        if (title) {

            title.textContent =
                "WILD ISLES ERROR";
        }

        if (subtitle) {

            subtitle.textContent =
                "VEYRA WORLD FAILED TO START";
        }

        if (status) {

            status.textContent =
                message;
        }

        if (this.loadingProgress) {

            this.loadingProgress.style.width =
                "100%";
        }
    }

    // ============================================================
    // DISPOSE
    // ============================================================

    dispose() {

        this.started = false;

        this.paused = true;

        // --------------------------------------------------------
        // PLAYER
        // --------------------------------------------------------

        if (
            this.player &&
            typeof this.player.dispose ===
            "function"
        ) {

            this.player.dispose();
        }

        // --------------------------------------------------------
        // SURVIVAL
        // --------------------------------------------------------

        if (
            this.survival &&
            typeof this.survival.dispose ===
            "function"
        ) {

            this.survival.dispose();
        }

        // --------------------------------------------------------
        // DAY NIGHT
        // --------------------------------------------------------

        if (
            this.dayNight &&
            typeof this.dayNight.dispose ===
            "function"
        ) {

            this.dayNight.dispose();
        }

        // --------------------------------------------------------
        // ENVIRONMENT
        // --------------------------------------------------------

        if (
            this.environment &&
            typeof this.environment.dispose ===
            "function"
        ) {

            this.environment.dispose();
        }

        // --------------------------------------------------------
        // WATER
        // --------------------------------------------------------

        if (
            this.water &&
            typeof this.water.dispose ===
            "function"
        ) {

            this.water.dispose();
        }

        // --------------------------------------------------------
        // TERRAIN
        // --------------------------------------------------------

        if (
            this.terrain &&
            typeof this.terrain.dispose ===
            "function"
        ) {

            this.terrain.dispose();
        }

        // --------------------------------------------------------
        // RENDERER
        // --------------------------------------------------------

        if (this.renderer) {

            this.renderer.dispose();

            if (
                this.renderer.domElement &&
                this.renderer.domElement.parentNode
            ) {

                this.renderer.domElement.parentNode.removeChild(
                    this.renderer.domElement
                );
            }
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.terrain = null;
        this.water = null;
        this.environment = null;
        this.player = null;
        this.survival = null;
        this.dayNight = null;

        console.log(
            "WILD ISLES DISPOSED"
        );
    }
}

// ============================================================
// CREATE GAME
// ============================================================

let wildIslesGame = null;

try {

    wildIslesGame =
        new WildIslesGame();

    window.WildIsles =
        wildIslesGame;

} catch (error) {

    console.error(
        "WILD ISLES BOOT ERROR:",
        error
    );

    const loadingScreen =
        document.getElementById(
            "loading-screen"
        );

    if (loadingScreen) {

        loadingScreen.style.display =
            "flex";

        loadingScreen.style.opacity =
            "1";
    }

    const status =
        document.querySelector(
            ".loading-status"
        );

    if (status) {

        status.textContent =
            error.message ||
            "GAME FAILED TO START";
    }
}

// ============================================================
// GLOBAL ERROR HANDLING
// ============================================================

window.addEventListener(
    "error",
    (event) => {

        console.error(
            "WILD ISLES ERROR:",
            event.error ||
            event.message
        );
    }
);

window.addEventListener(
    "unhandledrejection",
    (event) => {

        console.error(
            "WILD ISLES PROMISE ERROR:",
            event.reason
        );
    }
);

// ============================================================
// PAGE VISIBILITY
// ============================================================

document.addEventListener(
    "visibilitychange",
    () => {

        if (!wildIslesGame)
            return;

        if (document.hidden) {

            wildIslesGame.pause();

        } else {

            wildIslesGame.resume();
        }
    }
);

// ============================================================
// PREVENT MOBILE PAGE SCROLL
// ============================================================

document.addEventListener(
    "touchmove",
    (event) => {

        if (
            event.target.closest(
                "#mobile-ui"
            )
        ) {

            event.preventDefault();
        }

    },
    {
        passive: false
    }
);

// ============================================================
// EXPORT
// ============================================================

export {
    WildIslesGame
};
