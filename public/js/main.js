// ============================================================
// WILD ISLES
// VEYRA ISLAND
// MAIN GAME
// STEP 7 - THIRD PERSON CAMERA
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { VeyraTerrain } from "./terrain.js";
import { VeyraWater } from "./water.js";
import { VeyraEnvironment } from "./environment.js";
import { Player } from "./player.js";

// ============================================================
// DOM
// ============================================================

const container = document.getElementById("game-container");
const loadingScreen = document.getElementById("loading-screen");
const loadingProgress = document.getElementById("loading-progress");
const loadingText = document.getElementById("loading-text");

// ============================================================
// LOADING
// ============================================================

function setLoading(progress, message) {

    if (loadingProgress) {
        loadingProgress.style.width = progress + "%";
    }

    if (loadingText) {
        loadingText.textContent = message;
    }
}

// ============================================================
// SCENE
// ============================================================

const scene = new THREE.Scene();

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

container.appendChild(
    renderer.domElement
);

// ============================================================
// LIGHT
// ============================================================

const hemisphereLight =
    new THREE.HemisphereLight(
        0xc8e5ff,
        0x40513a,
        1.8
    );

scene.add(
    hemisphereLight
);

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
// TERRAIN
// ============================================================

setLoading(
    20,
    "Creating Veyra Island..."
);

const terrain =
    new VeyraTerrain(
        scene
    );

// ============================================================
// WATER
// ============================================================

setLoading(
    40,
    "Creating ocean..."
);

const water =
    new VeyraWater(
        scene
    );

// ============================================================
// ENVIRONMENT
// ============================================================

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
// CAMERA CONTROL
// ============================================================

let cameraYaw = 0;
let cameraPitch = 0.28;

const cameraDistance = 8;
const cameraHeight = 3.8;

let mouseDown = false;

let lastMouseX = 0;
let lastMouseY = 0;

const mouseSensitivity = 0.006;

// ============================================================
// MOUSE CONTROL
// ============================================================

renderer.domElement.addEventListener(
    "mousedown",
    (event) => {

        mouseDown = true;

        lastMouseX =
            event.clientX;

        lastMouseY =
            event.clientY;
    }
);

window.addEventListener(
    "mouseup",
    () => {

        mouseDown = false;
    }
);

window.addEventListener(
    "mousemove",
    (event) => {

        if (!mouseDown) {
            return;
        }

        const deltaX =
            event.clientX -
            lastMouseX;

        const deltaY =
            event.clientY -
            lastMouseY;

        lastMouseX =
            event.clientX;

        lastMouseY =
            event.clientY;

        cameraYaw -=
            deltaX *
            mouseSensitivity;

        cameraPitch -=
            deltaY *
            mouseSensitivity;

        cameraPitch =
            THREE.MathUtils.clamp(
                cameraPitch,
                -0.15,
                1.15
            );
    }
);

// ============================================================
// RIGHT CLICK DISABLE
// ============================================================

renderer.domElement.addEventListener(
    "contextmenu",
    (event) => {

        event.preventDefault();
    }
);

// ============================================================
// CAMERA UPDATE
// ============================================================

const cameraPosition =
    new THREE.Vector3();

const cameraTarget =
    new THREE.Vector3();

function updateCamera(delta) {

    const playerPosition =
        player.getPosition();

    // Camera direction
    const horizontalDistance =
        Math.cos(cameraPitch) *
        cameraDistance;

    const verticalDistance =
        Math.sin(cameraPitch) *
        cameraDistance;

    const offsetX =
        Math.sin(cameraYaw) *
        horizontalDistance;

    const offsetZ =
        Math.cos(cameraYaw) *
        horizontalDistance;

    // Desired camera position
    cameraPosition.set(
        playerPosition.x +
            offsetX,

        playerPosition.y +
            cameraHeight +
            verticalDistance,

        playerPosition.z +
            offsetZ
    );

    // Smooth camera
    camera.position.lerp(
        cameraPosition,
        Math.min(
            1,
            delta * 8
        )
    );

    // Look at player
    cameraTarget.set(
        playerPosition.x,
        playerPosition.y + 1.25,
        playerPosition.z
    );

    camera.lookAt(
        cameraTarget
    );
}

// ============================================================
// CAMERA START POSITION
// ============================================================

cameraYaw =
    Math.PI;

cameraPitch =
    0.25;

camera.position.set(
    0,
    6,
    10
);

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
    player.update(
        delta
    );

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
    updateCamera(
        delta
    );

    // Render
    renderer.render(
        scene,
        camera
    );
}

// ============================================================
// START GAME
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
    "WILD ISLES: STEP 7 READY"
);
