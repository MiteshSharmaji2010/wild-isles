// ============================================================
// WILD ISLES
// VEYRA ISLAND
// PLAYER SYSTEM v0.1
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class Player {

    constructor(scene, terrain) {

        this.scene = scene;
        this.terrain = terrain;

        // ----------------------------------------------------
        // PLAYER SETTINGS
        // ----------------------------------------------------

        this.height = 1.8;
        this.radius = 0.45;

        this.walkSpeed = 5;
        this.runSpeed = 9;

        this.jumpForce = 8;
        this.gravity = 22;

        this.velocityY = 0;

        this.isGrounded = false;
        this.isRunning = false;

        // ----------------------------------------------------
        // MOVEMENT
        // ----------------------------------------------------

        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            run: false
        };

        // ----------------------------------------------------
        // PLAYER OBJECT
        // ----------------------------------------------------

        this.object = new THREE.Group();

        this.createBody();

        this.scene.add(this.object);

        // Starting position
        this.object.position.set(0, 20, 0);

        // ----------------------------------------------------
        // INPUT
        // ----------------------------------------------------

        this.setupKeyboard();

        console.log("Kian Player System: READY");
    }

    // ========================================================
    // CREATE PLAYER
    // ========================================================

    createBody() {

        // Body material
        const bodyMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x3d4650,
                roughness: 0.8,
                metalness: 0.05
            });

        // Head material
        const headMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xb88762,
                roughness: 0.9
            });

        // ----------------------------------------------------
        // BODY
        // ----------------------------------------------------

        const bodyGeometry =
            new THREE.CapsuleGeometry(
                0.42,
                0.9,
                6,
                10
            );

        const body =
            new THREE.Mesh(
                bodyGeometry,
                bodyMaterial
            );

        body.position.y = 1.05;

        body.castShadow = true;
        body.receiveShadow = true;

        this.object.add(body);

        // ----------------------------------------------------
        // HEAD
        // ----------------------------------------------------

        const headGeometry =
            new THREE.SphereGeometry(
                0.32,
                12,
                10
            );

        const head =
            new THREE.Mesh(
                headGeometry,
                headMaterial
            );

        head.position.y = 1.85;

        head.castShadow = true;
        head.receiveShadow = true;

        this.object.add(head);

        // ----------------------------------------------------
        // SHOULDERS
        // ----------------------------------------------------

        const shoulderGeometry =
            new THREE.BoxGeometry(
                1.05,
                0.22,
                0.38
            );

        const shoulders =
            new THREE.Mesh(
                shoulderGeometry,
                bodyMaterial
            );

        shoulders.position.y = 1.42;

        shoulders.castShadow = true;

        this.object.add(shoulders);

        // ----------------------------------------------------
        // NAME
        // ----------------------------------------------------

        this.object.name = "Kian";
    }

    // ========================================================
    // KEYBOARD
    // ========================================================

    setupKeyboard() {

        window.addEventListener(
            "keydown",
            (event) => {

                switch (event.code) {

                    case "KeyW":
                    case "ArrowUp":
                        this.keys.forward = true;
                        break;

                    case "KeyS":
                    case "ArrowDown":
                        this.keys.backward = true;
                        break;

                    case "KeyA":
                    case "ArrowLeft":
                        this.keys.left = true;
                        break;

                    case "KeyD":
                    case "ArrowRight":
                        this.keys.right = true;
                        break;

                    case "ShiftLeft":
                    case "ShiftRight":
                        this.keys.run = true;
                        break;

                    case "Space":
                        this.jump();
                        break;
                }
            }
        );

        window.addEventListener(
            "keyup",
            (event) => {

                switch (event.code) {

                    case "KeyW":
                    case "ArrowUp":
                        this.keys.forward = false;
                        break;

                    case "KeyS":
                    case "ArrowDown":
                        this.keys.backward = false;
                        break;

                    case "KeyA":
                    case "ArrowLeft":
                        this.keys.left = false;
                        break;

                    case "KeyD":
                    case "ArrowRight":
                        this.keys.right = false;
                        break;

                    case "ShiftLeft":
                    case "ShiftRight":
                        this.keys.run = false;
                        break;
                }
            }
        );
    }

    // ========================================================
    // JUMP
    // ========================================================

    jump() {

        if (!this.isGrounded) {
            return;
        }

        this.velocityY = this.jumpForce;
        this.isGrounded = false;
    }

    // ========================================================
    // UPDATE
    // ========================================================

    update(delta) {

        if (!delta || delta <= 0) {
            return;
        }

        // ----------------------------------------------------
        // MOVEMENT DIRECTION
        // ----------------------------------------------------

        let moveX = 0;
        let moveZ = 0;

        if (this.keys.forward) {
            moveZ -= 1;
        }

        if (this.keys.backward) {
            moveZ += 1;
        }

        if (this.keys.left) {
            moveX -= 1;
        }

        if (this.keys.right) {
            moveX += 1;
        }

        // ----------------------------------------------------
        // NORMALIZE
        // ----------------------------------------------------

        const length =
            Math.sqrt(
                moveX * moveX +
                moveZ * moveZ
            );

        if (length > 0) {

            moveX /= length;
            moveZ /= length;
        }

        // ----------------------------------------------------
        // SPEED
        // ----------------------------------------------------

        this.isRunning =
            this.keys.run &&
            length > 0;

        const speed =
            this.isRunning
                ? this.runSpeed
                : this.walkSpeed;

        // ----------------------------------------------------
        // MOVE
        // ----------------------------------------------------

        this.object.position.x +=
            moveX * speed * delta;

        this.object.position.z +=
            moveZ * speed * delta;

        // ----------------------------------------------------
        // PLAYER ROTATION
        // ----------------------------------------------------

        if (length > 0) {

            const targetRotation =
                Math.atan2(
                    moveX,
                    moveZ
                );

            this.object.rotation.y =
                THREE.MathUtils.lerp(
                    this.object.rotation.y,
                    targetRotation,
                    Math.min(
                        1,
                        delta * 10
                    )
                );
        }

        // ----------------------------------------------------
        // GRAVITY
        // ----------------------------------------------------

        this.velocityY -=
            this.gravity * delta;

        this.object.position.y +=
            this.velocityY * delta;

        // ----------------------------------------------------
        // TERRAIN COLLISION
        // ----------------------------------------------------

        const terrainHeight =
            this.terrain.getHeight(
                this.object.position.x,
                this.object.position.z
            );

        const groundY =
            terrainHeight;

        if (
            this.object.position.y <=
            groundY
        ) {

            this.object.position.y =
                groundY;

            this.velocityY = 0;

            this.isGrounded = true;

        } else {

            this.isGrounded = false;
        }

        // ----------------------------------------------------
        // ISLAND BOUNDARY
        // ----------------------------------------------------

        const maxDistance = 420;

        const distance =
            Math.sqrt(
                this.object.position.x *
                this.object.position.x +

                this.object.position.z *
                this.object.position.z
            );

        if (distance > maxDistance) {

            const factor =
                maxDistance / distance;

            this.object.position.x *= factor;
            this.object.position.z *= factor;
        }
    }

    // ========================================================
    // GET POSITION
    // ========================================================

    getPosition() {

        return this.object.position;
    }

    // ========================================================
    // GET OBJECT
    // ========================================================

    getObject() {

        return this.object;
    }
}
