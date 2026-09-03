import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const container = document.getElementById("game-container");
const loadingScreen = document.getElementById("loading-screen");
const loadingProgress = document.getElementById("loading-progress");
const loadingText = document.getElementById("loading-text");

// ------------------------------------------------------------
// THREE.JS SCENE
// ------------------------------------------------------------

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87a7b5);

scene.fog = new THREE.FogExp2(
    0x87a7b5,
    0.0025
);

// ------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
);

camera.position.set(0, 35, 80);
camera.lookAt(0, 0, 0);

// ------------------------------------------------------------
// RENDERER
// ------------------------------------------------------------

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

// ------------------------------------------------------------
// LIGHTING
// ------------------------------------------------------------

const ambientLight = new THREE.HemisphereLight(
    0xddeeff,
    0x34452f,
    1.5
);

scene.add(ambientLight);

const sun = new THREE.DirectionalLight(
    0xffffff,
    2.5
);

sun.position.set(
    300,
    500,
    200
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -500;
sun.shadow.camera.right = 500;
sun.shadow.camera.top = 500;
sun.shadow.camera.bottom = -500;

scene.add(sun);

// ------------------------------------------------------------
// TEMPORARY WORLD MARKER
// ------------------------------------------------------------

const groundGeometry = new THREE.PlaneGeometry(
    1000,
    1000
);

const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x526b43,
    roughness: 1,
    metalness: 0
});

const ground = new THREE.Mesh(
    groundGeometry,
    groundMaterial
);

ground.rotation.x = -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);

// ------------------------------------------------------------
// LOADING
// ------------------------------------------------------------

function setLoading(progress, text) {

    loadingProgress.style.width = `${progress}%`;
    loadingText.textContent = text;
}

setLoading(20, "Initializing renderer...");

setTimeout(() => {

    setLoading(50, "Creating Veyra Island...");

}, 300);

setTimeout(() => {

    setLoading(80, "Preparing environment...");

}, 600);

setTimeout(() => {

    setLoading(100, "World ready.");

}, 900);

setTimeout(() => {

    loadingScreen.classList.add("hidden");

}, 1300);

// ------------------------------------------------------------
// RESIZE
// ------------------------------------------------------------

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );
});

// ------------------------------------------------------------
// GAME LOOP
// ------------------------------------------------------------

const clock = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Future:
    // player.update(delta);
    // world.update(delta);
    // weather.update(delta);

    renderer.render(
        scene,
        camera
    );
}

animate();

console.log("WILD ISLES engine initialized.");
console.log("Veyra Island world foundation loaded.");
