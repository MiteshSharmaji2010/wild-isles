// ============================================================
// WILD ISLES
// VEYRA ISLAND
// PLAYER SYSTEM v0.2
// CAMERA-RELATIVE MOVEMENT
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class Player {

    constructor(scene, terrain, cameraSystem = null) {

        this.scene = scene;
        this.terrain = terrain;
        this.cameraSystem = cameraSystem;

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
        // INPUT
        // ----------------------------------------------------

        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            run: false
        };

        // ----------------------------------------------------
        // PLAYER
        // ----------------------------------------------------

        this.object = new THREE.Group();
        this.object.name = "Kian";

        this.createBody();

        this.scene.add(this.object);

        // Start above terrain
        const startHeight =
            this.terrain.getHeight(0, 0);

        this.object.position.set(
            0,
            startHeight + 0.05,
            0
        );

        this.setupKeyboard();

        console.log(
            "Kian Player System: READY"
        );
    }

    // ========================================================
    // PLAYER BODY
    // ========================================================

    createBody() {

        const bodyMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x303840,
                roughness: 0.82,
                metalness: 0.02
            });

        const skinMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xb77b58,
                roughness: 0.9,
                metalness: 0
            });

        const darkMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x171b1f,
                roughness: 0.95
            });

        // ----------------------------------------------------
        // TORSO
        // ----------------------------------------------------

        const torsoGeometry =
            new THREE.CapsuleGeometry(
                0.43,
                0.82,
                6,
                10
            );

        const torso =
            new THREE.Mesh(
                torsoGeometry,
                bodyMaterial
            );

        torso.position.y = 1.08;

        torso.castShadow = true;
        torso.receiveShadow = true;

        this.object.add(torso);

        // ----------------------------------------------------
        // HEAD
        // ----------------------------------------------------

        const headGeometry =
            new THREE.SphereGeometry(
                0.31,
                16,
                12
            );

        const head =
            new THREE.Mesh(
                headGeometry,
                skinMaterial
            );

        head.position.y = 1.88;

        head.castShadow = true;
        head.receiveShadow = true;

        this.object.add(head);

        // ----------------------------------------------------
        // HAIR
        // ----------------------------------------------------

        const hairGeometry =
            new THREE.SphereGeometry(
                0.325,
                12,
                8,
                0,
                Math.PI * 2,
                0,
                Math.PI * 0.52
            );

        const hair =
            new THREE.Mesh(
                hairGeometry,
                darkMaterial
            );

        hair.position.y = 2.01;

        hair.castShadow = true;

        this.object.add(hair);

        // ----------------------------------------------------
        // LEFT ARM
        // ----------------------------------------------------

        const armGeometry =
            new THREE.CapsuleGeometry(
                0.12,
                0.55,
                5,
                8
            );

        const leftArm =
            new THREE.Mesh(
                armGeometry,
                bodyMaterial
            );

        leftArm.position.set(
            -0.56,
            1.18,
            0
        );

        leftArm.rotation.z =
            -0.08;

        leftArm.castShadow = true;

        this.object.add(leftArm);

        // ----------------------------------------------------
        // RIGHT ARM
        // ----------------------------------------------------

        const rightArm =
            new THREE.Mesh(
                armGeometry,
                bodyMaterial
            );

        rightArm.position.set(
            0.56,
            1.18,
            0
        );

        rightArm.rotation.z =
            0.08;

        rightArm.castShadow = true;

        this.object.add(rightArm);

        // ----------------------------------------------------
        // LEGS
        // ----------------------------------------------------

        const legGeometry =
            new THREE.CapsuleGeometry(
                0.15,
                0.68,
                5,
                8
            );

        const leftLeg =
            new THREE.Mesh(
                legGeometry,
                darkMaterial
            );

        leftLeg.position.set(
            -0.21,
            0.42,
            0
        );

        leftLeg.castShadow = true;

        this.object.add(leftLeg);

        const rightLeg =
            new THREE.Mesh(
                legGeometry,
                darkMaterial
            );

        rightLeg.position.set(
            0.21,
            0.42,
            0
        );

        rightLeg.castShadow = true;

        this.object.add(rightLeg);
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
                        this.keys.forward = true;
                        break;

                    case "KeyS":
                        this.keys.backward = true;
                        break;

                    case "KeyA":
                        this.keys.left = true;
                        break;

                    case "KeyD":
                        this.keys.right = true;
                        break;

                    case "ShiftLeft":
                    case "ShiftRight":
                        this.keys.run = true;
                        break;

                    case "Space":
                        if (!event.repeat) {
                            this.jump();
                        }
                        break;
                }
            }
        );

        window.addEventListener(
            "keyup",
            (event) => {

                switch (event.code) {

                    case "KeyW":
                        this.keys.forward = false;
                        break;

                    case "KeyS":
                        this.keys.backward = false;
                        break;

                    case "KeyA":
                        this.keys.left = false;
                        break;

                    case "KeyD":
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

        this.velocityY =
            this.jumpForce;

        this.isGrounded = false;
    }

    // ========================================================
    // UPDATE
    // ========================================================

    update(delta) {

        if (!delta || delta <= 0) {
            return;
        }

        let inputX = 0;
        let inputZ = 0;

        // W/S
        if (this.keys.forward) {
            inputZ -= 1;
        }

        if (this.keys.backward) {
            inputZ += 1;
        }

        // A/D
        if (this.keys.left) {
            inputX -= 1;
        }

        if (this.keys.right) {
            inputX += 1;
        }

        const inputLength =
            Math.sqrt(
                inputX * inputX +
                inputZ * inputZ
            );

        if (inputLength > 0) {

            inputX /= inputLength;
            inputZ /= inputLength;
        }

        // ----------------------------------------------------
        // CAMERA-RELATIVE MOVEMENT
        // ----------------------------------------------------

        let moveX = inputX;
        let moveZ = inputZ;

        const cameraYaw =
            this.cameraSystem
                ? this.cameraSystem.yaw
                : 0;

        const sinYaw =
            Math.sin(cameraYaw);

        const cosYaw =
            Math.cos(cameraYaw);

        const rotatedX =
            moveX * cosYaw -
            moveZ * sinYaw;

        const rotatedZ =
            moveX * sinYaw +
            moveZ * cosYaw;

        moveX = rotatedX;
        moveZ = rotatedZ;

        // ----------------------------------------------------
        // SPEED
        // ----------------------------------------------------

        this.isRunning =
            this.keys.run &&
            inputLength > 0;

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
        // TURN PLAYER TOWARD MOVEMENT
        // ----------------------------------------------------

        if (inputLength > 0) {

            const targetRotation =
                Math.atan2(
                    moveX,
                    moveZ
                );

            let difference =
                targetRotation -
                this.object.rotation.y;

            difference =
                Math.atan2(
                    Math.sin(difference),
                    Math.cos(difference)
                );

            this.object.rotation.y +=
                difference *
                Math.min(
                    1,
                    delta * 10
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
        // TERRAIN
        // ----------------------------------------------------

        const terrainHeight =
            this.terrain.getHeight(
                this.object.position.x,
                this.object.position.z
            );

        if (
            this.object.position.y <=
            terrainHeight
        ) {

            this.object.position.y =
                terrainHeight;

            this.velocityY = 0;

            this.isGrounded = true;

        } else {

            this.isGrounded = false;
        }

        // ----------------------------------------------------
        // ISLAND LIMIT
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
                maxDistance /
                distance;

            this.object.position.x *=
                factor;

            this.object.position.z *=
                factor;
        }
    }

    // ========================================================
    // POSITION
    // ========================================================

    getPosition() {
        return this.object.position;
    }

    // ========================================================
    // OBJECT
    // ========================================================

    getObject() {
        return this.object;
    }
}
