// ============================================================
// WILD ISLES
// THIRD-PERSON CAMERA SYSTEM
// Smooth Orbit, Spring Follow, Collision & Sensitivity Control
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class ThirdPersonCamera {

    constructor(camera, target) {

        this.camera = camera;
        this.target = target; // Reference to Player object

        // ====================================================
        // CAMERA CONFIGURATION
        // ====================================================

        this.distance = 7.5;
        this.minDistance = 2.0;
        this.maxDistance = 18.0;

        this.heightOffset = 2.2;

        this.pitch = 0.15; // Vertical Angle
        this.yaw = Math.PI; // Horizontal Angle

        this.minPitch = -Math.PI / 4; // -45 deg
        this.maxPitch = Math.PI / 2.8; // ~65 deg

        this.sensitivityX = 0.0025;
        this.sensitivityY = 0.0025;

        this.smoothness = 0.12;

        // Dynamic Position Vectors
        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();

        // Lock & Controls
        this.isPointerLocked = false;

        this.setupControls();

    }

    // ========================================================
    // INPUT & POINTER LOCK
    // ========================================================

    setupControls() {

        // Canvas Click -> Lock Pointer
        window.addEventListener("click", () => {

            if (!this.isPointerLocked) {

                document.body.requestPointerLock();

            }

        });

        document.addEventListener("pointerlockchange", () => {

            this.isPointerLocked = (document.pointerLockElement === document.body);

        });

        // Mouse Look
        window.addEventListener("mousemove", (event) => {

            if (!this.isPointerLocked) return;

            this.yaw -= event.movementX * this.sensitivityX;
            this.pitch -= event.movementY * this.sensitivityY;

            // Clamp pitch to avoid camera flipping over
            this.pitch = THREE.MathUtils.clamp(
                this.pitch,
                this.minPitch,
                this.maxPitch
            );

            // Pass camera rotation to player for directional movement
            if (this.target && typeof this.target.setCameraRotation === "function") {

                this.target.setCameraRotation(this.yaw);

            }

        });

        // Mouse Wheel Zoom
        window.addEventListener("wheel", (event) => {

            this.distance += event.deltaY * 0.005;

            this.distance = THREE.MathUtils.clamp(
                this.distance,
                this.minDistance,
                this.maxDistance
            );

        });

    }

    // ========================================================
    // CALCULATE CAMERA TARGET POSITION
    // ========================================================

    calculateIdealOffset() {

        const targetPos = this.target.object.position;

        // Spherical offset based on pitch and yaw
        const offsetX = this.distance * Math.sin(this.yaw) * Math.cos(this.pitch);
        const offsetY = this.distance * Math.sin(this.pitch);
        const offsetZ = this.distance * Math.cos(this.yaw) * Math.cos(this.pitch);

        const idealPosition = new THREE.Vector3(
            targetPos.x + offsetX,
            targetPos.y + this.heightOffset + offsetY,
            targetPos.z + offsetZ
        );

        return idealPosition;

    }

    calculateIdealLookAt() {

        const targetPos = this.target.object.position;

        return new THREE.Vector3(
            targetPos.x,
            targetPos.y + this.heightOffset,
            targetPos.z
        );

    }

    // ========================================================
    // TERRAIN / OBSTACLE COLLISION CHECK
    // ========================================================

    handleCollision(idealPos, lookAtPos) {

        if (!this.target.terrain) return idealPos;

        // Check ground height under camera to avoid clipping inside terrain
        const groundY = this.target.getGroundHeight(idealPos.x, idealPos.z);

        if (idealPos.y < groundY + 0.5) {

            idealPos.y = groundY + 0.5;

        }

        return idealPos;

    }

    // ========================================================
    // MAIN UPDATE LOOP
    // ========================================================

    update(deltaTime) {

        if (!this.target || !this.target.object) return;

        let idealPosition = this.calculateIdealOffset();
        const idealLookAt = this.calculateIdealLookAt();

        // Handle ground collision protection
        idealPosition = this.handleCollision(idealPosition, idealLookAt);

        // Smooth Lerp transitions
        const lerpFactor = 1.0 - Math.pow(this.smoothness, deltaTime * 60);

        this.currentPosition.lerp(idealPosition, lerpFactor);
        this.currentLookAt.lerp(idealLookAt, lerpFactor);

        // Apply to ThreeJS Camera
        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);

    }

}
