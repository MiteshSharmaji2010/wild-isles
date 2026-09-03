import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { VeyraTerrain } from "./terrain.js";
import { VeyraWater } from "./water.js";

// ============================================================
// WILD ISLES
// VEYRA ISLAND
// WORLD FOUNDATION
// ============================================================

// ------------------------------------------------------------
// DOM ELEMENTS
// ------------------------------------------------------------

const container =
    document.getElementById("game-container");

const loadingScreen =
    document.getElementById("loading-screen");

const loadingProgress =
    document.getElementById("loading-progress");

const loadingText =
    document.getElementById("loading-text");

// ------------------------------------------------------------
// SAFETY CHECK
// ------------------------------------------------------------

if (!container) {

    throw new Error(
        "Game container #game-container not found."
    );
}

// ------------------------------------------------------------
// SCENE
// ------------------------------------------------------------

const scene =
    new THREE.Scene();

const skyColor =
    new THREE.Color(0x87a7b5);

scene.background =
    skyColor;

scene.fog =
    new THREE.FogExp2(
        skyColor,
        0.0018
    );

// ------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------

const camera =
    new THREE.PerspectiveCamera(
        65,
        window.innerWidth /
        window.innerHeight,
        0.1,
        5000
    );

camera.position.set(
    0,
    120,
    260
);

camera.lookAt(
    0,
    30,
    0
);

// ------------------------------------------------------------
// RENDERER
// ------------------------------------------------------------

const renderer =
    new THREE.WebGLRenderer({

        antialias: true,

        powerPreference:
            "high-performance"
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio || 1,
        1.5
    )
);

renderer.shadowMap.enabled =
    true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure =
    1.0;

container.appendChild(
    renderer.domElement
);

// ------------------------------------------------------------
// HEMISPHERE LIGHT
// ------------------------------------------------------------

const hemisphereLight =
    new THREE.HemisphereLight(
        0xddeeff,
        0x34452f,
        1.5
    );

scene.add(
    hemisphereLight
);

// ------------------------------------------------------------
// SUN
// ------------------------------------------------------------

const sun =
    new THREE.DirectionalLight(
        0xffffff,
        2.5
    );

sun.position.set(
    300,
    500,
    200
);

sun.castShadow =
    true;

// ------------------------------------------------------------
// SUN SHADOW
// ------------------------------------------------------------

sun.shadow.mapSize.width =
    2048;

sun.shadow.mapSize.height =
    2048;

sun.shadow.camera.left =
    -500;

sun.shadow.camera.right =
    500;

sun.shadow.camera.top =
    500;

sun.shadow.camera.bottom =
    -500;

sun.shadow.camera.near =
    1;

sun.shadow.camera.far =
    1500;

scene.add(
    sun
);

// ============================================================
// TERRAIN
// ============================================================

let terrain = null;

try {

    terrain =
        new VeyraTerrain(
            scene
        );

    console.log(
        "Veyra Island terrain created successfully."
    );

} catch (error) {

    console.error(
        "Terrain creation failed:",
        error
    );
}

// ============================================================
// WATER
// ============================================================

let water = null;

try {

    water =
        new VeyraWater(
            scene
        );

    console.log(
        "Veyra Island water created successfully."
    );

} catch (error) {

    console.error(
        "Water creation failed:",
        error
    );
}

// ------------------------------------------------------------
// LOADING SYSTEM
// ------------------------------------------------------------

function setLoading(
    progress,
    message
) {

    if (loadingProgress) {

        loadingProgress.style.width =
            `${progress}%`;
    }

    if (loadingText) {

        loadingText.textContent =
            message;
    }
}

// ------------------------------------------------------------
// LOADING SEQUENCE
// ------------------------------------------------------------

setLoading(
    5,
    "Starting WILD ISLES..."
);

setTimeout(() => {

    setLoading(
        20,
        "Initializing graphics..."
    );

}, 200);

setTimeout(() => {

    setLoading(
        40,
        "Preparing Veyra Island..."
    );

}, 400);

setTimeout(() => {

    setLoading(
        60,
        "Generating terrain..."
    );

}, 650);

setTimeout(() => {

    setLoading(
        75,
        "Generating coastline..."
    );

}, 850);

setTimeout(() => {

    setLoading(
        90,
        "Preparing ocean..."
    );

}, 1050);

setTimeout(() => {

    setLoading(
        100,
        "Veyra Island ready."
    );

}, 1300);

setTimeout(() => {

    if (loadingScreen) {

        loadingScreen.classList.add(
            "hidden"
        );
    }

}, 1700);

// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        const width =
            window.innerWidth;

        const height =
            window.innerHeight;

        camera.aspect =
            width / height;

        camera.updateProjectionMatrix();

        renderer.setSize(
            width,
            height
        );

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                1.5
            )
        );
    }
);

// ============================================================
// CLOCK
// ============================================================

const clock =
    new THREE.Clock();

// ============================================================
// WORLD UPDATE
// ============================================================

function updateWorld(
    delta,
    elapsedTime
) {

    if (water) {

        water.update(
            delta,
            elapsedTime
        );
    }

    // Future systems:
    //
    // weather.update(delta);
    // dayNight.update(delta);
    // wildlife.update(delta);
    // environment.update(delta);
    // infrastructure.update(delta);
}

// ============================================================
// MAIN GAME LOOP
// ============================================================

function animate() {

    requestAnimationFrame(
        animate
    );

    const delta =
        clock.getDelta();

    const elapsedTime =
        clock.elapsedTime;

    updateWorld(
        delta,
        elapsedTime
    );

    renderer.render(
        scene,
        camera
    );
}

// ============================================================
// START
// ============================================================

animate();

// ============================================================
// DEBUG
// ============================================================

console.log(
    "======================================"
);

console.log(
    "          WILD ISLES"
);

console.log(
    "          VEYRA ISLAND"
);

console.log(
    "       WORLD FOUNDATION v0.2"
);

console.log(
    "======================================"
);

console.log(
    "Three.js Engine: READY"
);

console.log(
    "Renderer: READY"
);

console.log(
    "Lighting: READY"
);

console.log(
    "Terrain: " +
    (terrain ? "READY" : "FAILED")
);

console.log(
    "Water: " +
    (water ? "READY" : "FAILED")
);

console.log(
    "======================================"
);
