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
            typeof this.terrain.getSlopeDegrees !== "function" &&
            typeof this.terrain.getSlopeAngleDegrees === "function"
        ) {

            this.terrain.getSlopeDegrees =
                (x, z) => {

                    return this.terrain.getSlopeAngleDegrees(
                        x,
                        z
                    );
                };
        }

        if (
            this.terrain &&
            typeof this.terrain.enable === "function"
        ) {

            this.terrain.enable();
        }

        if (
            this.terrain &&
            typeof this.terrain.update === "function"
        ) {

            this.terrain.update(
                0,
                0
            );
        }

        console.log(
            "Veyra Terrain READY"
        );

        console.log(
            "Terrain Slope API:",
            typeof this.terrain.getSlopeDegrees === "function"
                ? "READY"
                : "MISSING"
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

        console.log("WILD ISLES GAME ENGINE STARTED");
    }

    // ============================================================
    // MAIN GAME LOOP
    // ============================================================

    animate() {

        requestAnimationFrame(this.animate);

        if (this.paused || this.fatalError) return;

        this.deltaTime = Math.min(this.clock.getDelta(), 0.1);
        this.elapsedTime = this.clock.getElapsedTime();

        this.updateInput();
        this.updateGame(this.deltaTime, this.elapsedTime);
        this.updateCamera();
        this.render();
    }

    // ============================================================
    // INPUT UPDATE
    // ============================================================

    updateInput() {

        if (!this.player) return;

        let moveForward = 0;
        let moveSide = 0;
        let isRunning = false;

        if (this.keys["KeyW"] || this.keys["ArrowUp"]) moveForward += 1;
        if (this.keys["KeyS"] || this.keys["ArrowDown"]) moveForward -= 1;
        if (this.keys["KeyA"] || this.keys["ArrowLeft"]) moveSide -= 1;
        if (this.keys["KeyD"] || this.keys["ArrowRight"]) moveSide += 1;

        if (this.keys["ShiftLeft"] || this.keys["ShiftRight"]) {
            isRunning = true;
        }

        if (this.mobile && this.joystickActive) {
            moveForward = -this.joystickY;
            moveSide = this.joystickX;
            if (this.mobileRunning) isRunning = true;
        }

        if (typeof this.player.move === "function") {
            this.player.move(moveForward, moveSide, isRunning, this.deltaTime);
        }

        if (this.keys["Space"]) {
            if (typeof this.player.jump === "function") {
                this.player.jump();
            }
        }
    }

    // ============================================================
    // GAME ENGINE UPDATE
    // ============================================================

    updateGame(delta, elapsedTime) {

        if (this.player && typeof this.player.update === "function") {
            this.player.update(delta);
        }

        if (this.player && this.terrain) {
            const playerPos = typeof this.player.getPosition === "function" 
                ? this.player.getPosition() 
                : this.player.position;

            if (playerPos) {
                this.currentChunkX = Math.floor(playerPos.x / this.chunkSize);
                this.currentChunkZ = Math.floor(playerPos.z / this.chunkSize);

                if (this.currentChunkX !== this.lastChunkX || this.currentChunkZ !== this.lastChunkZ) {
                    if (typeof this.terrain.update === "function") {
                        this.terrain.update(playerPos.x, playerPos.z);
                    }
                    this.lastChunkX = this.currentChunkX;
                    this.lastChunkZ = this.currentChunkZ;
                }
            }
        }

        if (this.water && typeof this.water.update === "function") {
            this.water.update(elapsedTime, delta);
        }

        if (this.environment && typeof this.environment.update === "function") {
            const playerPos = this.player && typeof this.player.getPosition === "function" 
                ? this.player.getPosition() 
                : null;
            this.environment.update(delta, playerPos);
        }

        if (this.survival && typeof this.survival.update === "function") {
            this.survival.update(delta);
        }

        if (this.dayNight && typeof this.dayNight.update === "function") {
            this.dayNight.update(delta);
        }

        this.updatePlayerUI();
        this.updateWorldUI();
        this.updateDebugUI();
    }

    // ============================================================
    // CAMERA FOLLOW & ORBIT
    // ============================================================

    updateCamera() {

        if (!this.player || !this.camera) return;

        const playerPos = typeof this.player.getPosition === "function" 
            ? this.player.getPosition() 
            : this.player.position;

        if (!playerPos) return;

        this.cameraTarget.copy(playerPos).y += 1.6;

        const cx = this.cameraDistance * Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch);
        const cy = this.cameraDistance * Math.sin(-this.cameraPitch) + this.cameraHeight;
        const cz = this.cameraDistance * Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch);

        this.camera.position.set(
            this.cameraTarget.x + cx,
            this.cameraTarget.y + cy,
            this.cameraTarget.z + cz
        );

        if (this.terrain && typeof this.terrain.getHeight === "function") {
            const terrainHeight = this.terrain.getHeight(this.camera.position.x, this.camera.position.z);
            if (this.camera.position.y < terrainHeight + 0.5) {
                this.camera.position.y = terrainHeight + 0.5;
            }
        }

        this.camera.lookAt(this.cameraTarget);
    }

    // ============================================================
    // RENDER
    // ============================================================

    render() {

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    // ============================================================
    // UI UPDATES
    // ============================================================

    updatePlayerUI() {

        if (!this.survival && !this.player) return;

        if (this.healthFill) {
            const hp = this.survival && this.survival.health !== undefined ? this.survival.health : 100;
            this.healthFill.style.width = `${hp}%`;
        }

        if (this.staminaFill) {
            const stamina = this.player && this.player.stamina !== undefined ? this.player.stamina : 100;
            this.staminaFill.style.width = `${stamina}%`;
        }

        if (this.hungerValue && this.survival && this.survival.hunger !== undefined) {
            this.hungerValue.textContent = `${Math.round(this.survival.hunger)}%`;
        }

        if (this.thirstValue && this.survival && this.survival.thirst !== undefined) {
            this.thirstValue.textContent = `${Math.round(this.survival.thirst)}%`;
        }

        if (this.temperatureValue && this.survival && this.survival.temperature !== undefined) {
            this.temperatureValue.textContent = `${Math.round(this.survival.temperature)}°C`;
        }
    }

    updateWorldUI() {

        if (this.worldTime && this.dayNight && typeof this.dayNight.getFormattedTime === "function") {
            this.worldTime.textContent = this.dayNight.getFormattedTime();
        }

        if (this.worldLocation && this.player) {
            const pos = typeof this.player.getPosition === "function" 
                ? this.player.getPosition() 
                : this.player.position;
            if (pos) {
                this.worldLocation.textContent = `X: ${Math.round(pos.x)} | Z: ${Math.round(pos.z)}`;
            }
        }
    }

    updateDebugUI() {

        if (!this.debugInfo) return;

        const fps = Math.round(1 / Math.max(0.001, this.deltaTime));
        this.debugInfo.textContent = `FPS: ${fps} | Chunk: [${this.currentChunkX}, ${this.currentChunkZ}]`;
    }

    showInteraction(text) {

        if (!this.interactionMessage) return;

        this.interactionMessage.textContent = text;
        this.interactionMessage.classList.remove("hidden");

        clearTimeout(this._interactionTimeout);
        this._interactionTimeout = setTimeout(() => {
            this.interactionMessage.classList.add("hidden");
        }, 2000);
    }

    // ============================================================
    // ERROR HANDLING
    // ============================================================

    showFatalError(error) {

        this.fatalError = true;

        if (this.loadingText) {
            this.loadingText.textContent = "FATAL ERROR LOADING VEYRA WORLD";
            this.loadingText.style.color = "#ff4444";
        }

        console.error("Critical Engine Failure:", error);
    }
}

// ============================================================
// BOOTSTRAP
// ============================================================

window.addEventListener("DOMContentLoaded", () => {
    window.game = new WildIslesGame();
});   import { ThirdPersonCamera } from "./camera.js";

// Scene setup ke baad:
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
const player = new Player(scene, terrain);
const thirdPersonCamera = new ThirdPersonCamera(camera, player);

// Main Animation Loop:
function animate(time) {
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();
    
    player.update(deltaTime, thirdPersonCamera.yaw);
    thirdPersonCamera.update(deltaTime);
    
    renderer.render(scene, camera);
}
