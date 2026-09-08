import * as THREE from "three";
import { WorldTerrain } from "./terrain.js";
import { Player } from "./player.js";

class Game {
    constructor() {
        this.canvas = document.getElementById("game-canvas");

        // 1. Scene Setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xa0c4ff);

        // 2. Camera Setup
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );

        // 3. Renderer Setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // 4. Time Tracking
        this.clock = new THREE.Clock();

        // 5. Initialize Game Systems
        this.init();

        // 6. Handle Window Resize
        window.addEventListener("resize", () => this.onWindowResize());
    }

    init() {
        // Build World Terrain & Lighting
        this.terrain = new WorldTerrain(this.scene);

        // Spawn Player Character
        this.player = new Player(this.scene, this.terrain, this.camera);

        // Start Game Loop
        this.animate();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();

        // Update Mechanics
        if (this.player) {
            this.player.update(deltaTime);
        }

        if (this.terrain && this.player) {
            this.terrain.update(this.player.object.position.x, this.player.object.position.z);
        }

        // Render Frame
        this.renderer.render(this.scene, this.camera);
    }
}

// Launch Game on Page Load
window.addEventListener("DOMContentLoaded", () => {
    new Game();
});
