// ============================================================
// WILD ISLES
// VEYRA ISLAND
// MAIN GAME
// STEP 6 - PLAYER
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { VeyraTerrain } from "./terrain.js";
import { VeyraWater } from "./water.js";
import { VeyraEnvironment } from "./environment.js";
import { Player } from "./player.js";

// ============================================================
// GAME VARIABLES
// ============================================================

const container =
    document.getElementById("game-container");

const loadingScreen =
    document.getElementById("loading-screen");

const loadingProgress =
    document.getElementById("loading-progress");

const loadingText =
    document.getElementById("loading-text");

// ============================================================
// LOADING
// ============================================================

function setLoading(progress, message) {

    if (loadingProgress) {
        loadingProgress.style.width =
            progress + "%";
    }

    if (loadingText) {
        loadingText.textContent =
            message;
    }
}

// ============================================================
// SCENE
// ============================================================

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x87a9b5);

scene.fog =
    new THREE.Fog(
        0x87a9b5,
        180,
        850
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
        2000
    );

camera.position.set(
    0,
    6,
    10
);

// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        1.5
    )
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

container.appendChild(renderer.domElement);

// ============================================================
// LIGHTING
// ============================================================

const hemisphereLight =
    new THREE.HemisphereLight(
        0xc8e5ff,
        0x40513a,
        1.8
    );

scene.add(hemisphereLight);

const sun =
    new THREE.DirectionalLight(
        0xfff2d0,
        2.2
    );

sun.position.set(
    -180,
    250,
    120
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -350;
sun.shadow.camera.right = 350;
sun.shadow.camera.top = 350;
sun.shadow.camera.bottom = -350;

sun.shadow.camera.near = 1;
sun.shadow.camera.far = 800;

scene.add(sun);

// ============================================================
// WORLD
// ============================================================

setLoading(
    20,
    "Creating Veyra Island..."
);

const terrain =
    new VeyraTerrain(scene);

setLoading(
    40,
    "Creating ocean..."
);

const water =
    new VeyraWater(scene);

setLoading(
    60,
    "Growing environment..."
);

const environment =
    new VeyraEnvironment(
        scene,
        terrain
    );

// ============================================================
// PLAYER
// ============================================================

setLoading(
    80,
    "Preparing Kian..."
);

const player =
    new Player(
        scene,
        terrain
    );

// ============================================================
// CAMERA SETTINGS
// ============================================================

const cameraOffset =
    new THREE.Vector3(
        0,
        5,
        9
    );

const cameraTarget =
    new THREE.Vector3();

function updateCamera(delta) {

    const playerPosition =
        player.getPosition();

    cameraTarget.set(
        playerPosition.x,
        playerPosition.y + 1.2,
        playerPosition.z
    );

    const desiredPosition =
        new THREE.Vector3(
            playerPosition.x +
            cameraOffset.x,

            playerPosition.y +
            cameraOffset.y,

            playerPosition.z +
            cameraOffset.z
        );

    camera.position.lerp(
        desiredPosition,
        Math.min(
            1,
            delta * 5
        )
    );

    camera.lookAt(
        cameraTarget
    );
}

// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
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
// GAME LOOP
// ============================================================

function animate() {

    requestAnimationFrame(
        animate
    );

    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );

    const elapsedTime =
        clock.elapsedTime;

    // Player
    player.update(delta);

    // Environment
    environment.update(
        delta,
        elapsedTime
    );

    // Water
    water.update(
        delta,
        elapsedTime
    );

    // Camera
    updateCamera(delta);

    // Render
    renderer.render(
        scene,
        camera
    );
}

// ============================================================
// START
// ============================================================

setLoading(
    100,
    "WILD ISLES READY"
);

setTimeout(
    () => {

        if (loadingScreen) {

            loadingScreen.classList.add(
                "hidden"
            );
        }

    },
    700
);

animate();

console.log(
    "WILD ISLES: GAME STARTED"
);
