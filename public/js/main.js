// ============================================================
// WILD ISLES
// VEYRA ISLAND
// MAIN GAME
// STEP 7 - CAMERA + PLAYER
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

import { VeyraTerrain } from "./terrain.js";
import { VeyraWater } from "./water.js";
import { VeyraEnvironment } from "./environment.js";
import { Player } from "./player.js";

// ============================================================
// DOM
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
    new THREE.Color(
        0x87a9b5
    );

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
        powerPreference:
            "high-performance"
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
// LIGHTING
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

sun.shadow.mapSize.width =
    2048;

sun.shadow.mapSize.height =
    2048;

sun.shadow.camera.left =
    -350;

sun.shadow.camera.right =
    350;

sun.shadow.camera.top =
    350;

sun.shadow.camera.bottom =
    -350;

sun.shadow.camera.near =
    1;

sun.shadow.camera.far =
    800;

scene.add(
    sun
);

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
// CAMERA SYSTEM
// ============================================================

const cameraSystem = {

    yaw: Math.PI,

    pitch: 0.28,

    distance: 8,

    height: 3.8
};

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
        terrain,
        cameraSystem
    );

// ============================================================
// MOUSE CAMERA
// ============================================================

let mouseDown = false;

let lastMouseX = 0;
let lastMouseY = 0;

const mouseSensitivity =
    0.006;

renderer.domElement.addEventListener(
    "mousedown",
    (event) => {

        mouseDown = true;

        lastMouseX =
            event.clientX;

        lastMouseY =
            event.clientY;

        renderer.domElement.requestPointerLock?.();
    }
);

window.addEventListener(
    "mouseup",
    () => {

        mouseDown = false;

        if (
            document.pointerLockElement ===
            renderer.domElement
        ) {

            document.exitPointerLock?.();
        }
    }
);

window.addEventListener(
    "mousemove",
    (event) => {

        if (!mouseDown) {
            return;
        }

        let deltaX;
        let deltaY;

        if (
            document.pointerLockElement ===
            renderer.domElement
        ) {

            deltaX =
                event.movementX || 0;

            deltaY =
                event.movementY || 0;

        } else {

            deltaX =
                event.clientX -
                lastMouseX;

            deltaY =
                event.clientY -
                lastMouseY;

            lastMouseX =
                event.clientX;

            lastMouseY =
                event.clientY;
        }

        cameraSystem.yaw -=
            deltaX *
            mouseSensitivity;

        cameraSystem.pitch -=
            deltaY *
            mouseSensitivity;

        cameraSystem.pitch =
            THREE.MathUtils.clamp(
                cameraSystem.pitch,
                -0.15,
                1.15
            );
    }
);

// ============================================================
// RIGHT CLICK
// ============================================================

renderer.domElement.addEventListener(
    "contextmenu",
    (event) => {
        event.preventDefault();
    }
);

// ============================================================
// CAMERA
// ============================================================

const desiredCameraPosition =
    new THREE.Vector3();

const cameraTarget =
    new THREE.Vector3();

function updateCamera(delta) {

    const playerPosition =
        player.getPosition();

    const horizontalDistance =
        Math.cos(
            cameraSystem.pitch
        ) *
        cameraSystem.distance;

    const verticalDistance =
        Math.sin(
            cameraSystem.pitch
        ) *
        cameraSystem.distance;

    const offsetX =
        Math.sin(
            cameraSystem.yaw
        ) *
        horizontalDistance;

    const offsetZ =
        Math.cos(
            cameraSystem.yaw
        ) *
        horizontalDistance;

    desiredCameraPosition.set(
        playerPosition.x +
            offsetX,

        playerPosition.y +
            cameraSystem.height +
            verticalDistance,

        playerPosition.z +
            offsetZ
    );

    camera.position.lerp(
        desiredCameraPosition,
        Math.min(
            1,
            delta * 8
        )
    );

    cameraTarget.set(
        playerPosition.x,
        playerPosition.y + 1.2,
        playerPosition.z
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

    player.update(
        delta
    );

    environment.update(
        delta,
        elapsedTime
    );

    water.update(
        delta,
        elapsedTime
    );

    updateCamera(
        delta
    );

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
    "WILD ISLES: STEP 7 READY"
);
