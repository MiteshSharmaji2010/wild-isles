```javascript
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { VeyraTerrain } from "./terrain.js";
import { VeyraWater } from "./water.js";
import { VeyraEnvironment } from "./environment.js";

// ============================================================
// WILD ISLES
// VEYRA ISLAND
// WORLD FOUNDATION v0.3
// ============================================================

// ------------------------------------------------------------
// DOM
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
// SAFETY
// ------------------------------------------------------------

if (!container) {

    throw new Error(
        "Game container #game-container not found."
    );
}

// ============================================================
// SCENE
// ============================================================

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

// ============================================================
// CAMERA
// ============================================================

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

// ============================================================
// RENDERER
// ============================================================

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

// ============================================================
// LIGHTING
// ============================================================

// ------------------------------------------------------------
// HEMISPHERE
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
// SHADOW SETTINGS
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
        "Terrain: READY"
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
        "Water: READY"
    );

} catch (error) {

    console.error(
        "Water creation failed:",
        error
    );
}

// ============================================================
// ENVIRONMENT
// ============================================================

let environment = null;

if (terrain) {

    try {

        environment =
            new VeyraEnvironment(
                scene,
                terrain
            );

        console.log(
            "Environment: READY"
        );

    } catch (error) {

        console.error(
            "Environment creation failed:",
            error
        );
    }
}

// ============================================================
// LOADING SYSTEM
// ============================================================

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

// ============================================================
// LOADING SEQUENCE
// ============================================================

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
        35,
        "Preparing Veyra Island..."
    );

}, 400);

setTimeout(() => {

    setLoading(
        50,
        "Generating terrain..."
    );

}, 600);

setTimeout(() => {

    setLoading(
        65,
        "Creating coastline..."
    );

}, 800);

setTimeout(() => {

    setLoading(
        78,
        "Generating ocean..."
    );

}, 1000);

setTimeout(() => {

    setLoading(
        88,
        "Growing forest..."
    );

}, 1200);

setTimeout(() => {

    setLoading(
        96,
        "Placing rocks and grass..."
    );

}, 1400);

setTimeout(() => {

    setLoading(
        100,
        "Veyra Island ready."
    );

}, 1600);

setTimeout(() => {

    if (loadingScreen) {

        loadingScreen.classList.add(
            "hidden"
        );
    }

}, 2000);

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

    if (environment) {

        environment.update(
            delta,
            elapsedTime
        );
    }

    // Future systems:
    //
    // weather.update(delta);
    // dayNight.update(delta);
    // wildlife.update(delta);
    // infrastructure.update(delta);
    // worldEvents.update(delta);
}

// ============================================================
// GAME LOOP
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
    "       WORLD FOUNDATION v0.3"
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
    "Environment: " +
    (environment ? "READY" : "FAILED")
);

console.log(
    "======================================"
);
```
