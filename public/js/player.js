// ============================================================
// WILD ISLES
// VEYRA ISLAND
// PLAYER SYSTEM v0.4
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class Player {

    constructor(
        scene,
        terrain,
        cameraSystem
    ) {

        this.scene = scene;
        this.terrain = terrain;
        this.cameraSystem = cameraSystem;

        // ----------------------------------------------------
        // MOVEMENT
        // ----------------------------------------------------

        this.walkSpeed = 4.8;
        this.runSpeed = 8.5;

        this.jumpForce = 8.2;
        this.gravity = 23;

        this.velocityY = 0;

        this.isGrounded = false;
        this.isRunning = false;

        // Maximum walkable slope
        this.maxSlope =
            THREE.MathUtils.degToRad(48);

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

        this.object =
            new THREE.Group();

        this.object.name =
            "Kian";

        this.createBody();

        this.scene.add(
            this.object
        );

        // ----------------------------------------------------
        // START POSITION
        // ----------------------------------------------------

        const startX = 0;
        const startZ = 0;

        const ground =
            this.terrain.getGroundHeight(
                startX,
                startZ
            );

        this.object.position.set(
            startX,
            ground + 0.08,
            startZ
        );

        this.setupKeyboard();

        console.log(
            "Kian v0.4 READY"
        );
    }

    // ========================================================
    // BODY
    // ========================================================

    createBody() {

        const clothes =
            new THREE.MeshStandardMaterial({
                color: 0x263039,
                roughness: 0.82
            });

        const shirt =
            new THREE.MeshStandardMaterial({
                color: 0x45545d,
                roughness: 0.9
            });

        const skin =
            new THREE.MeshStandardMaterial({
                color: 0xa96f4d,
                roughness: 0.92
            });

        const boots =
            new THREE.MeshStandardMaterial({
                color: 0x171a1c,
                roughness: 0.95
            });

        const hair =
            new THREE.MeshStandardMaterial({
                color: 0x171412,
                roughness: 1
            });

        // ----------------------------------------------------
        // LEGS
        // ----------------------------------------------------

        const legGeometry =
            new THREE.CapsuleGeometry(
                0.145,
                0.62,
                5,
                8
            );

        const leftLeg =
            new THREE.Mesh(
                legGeometry,
                clothes
            );

        leftLeg.position.set(
            -0.19,
            0.48,
            0
        );

        leftLeg.castShadow = true;

        this.object.add(
            leftLeg
        );

        const rightLeg =
            new THREE.Mesh(
                legGeometry,
                clothes
            );

        rightLeg.position.set(
            0.19,
            0.48,
            0
        );

        rightLeg.castShadow = true;

        this.object.add(
            rightLeg
        );

        // ----------------------------------------------------
        // BOOTS
        // ----------------------------------------------------

        const bootGeometry =
            new THREE.BoxGeometry(
                0.29,
                0.18,
                0.48
            );

        const leftBoot =
            new THREE.Mesh(
                bootGeometry,
                boots
            );

        leftBoot.position.set(
            -0.19,
            0.13,
            -0.07
        );

        leftBoot.castShadow = true;

        this.object.add(
            leftBoot
        );

        const rightBoot =
            new THREE.Mesh(
                bootGeometry,
                boots
            );

        rightBoot.position.set(
            0.19,
            0.13,
            -0.07
        );

        rightBoot.castShadow = true;

        this.object.add(
            rightBoot
        );

        // ----------------------------------------------------
        // TORSO
        // ----------------------------------------------------

        const torsoGeometry =
            new THREE.CapsuleGeometry(
                0.43,
                0.72,
                6,
                10
            );

        const torso =
            new THREE.Mesh(
                torsoGeometry,
                shirt
            );

        torso.position.y =
            1.17;

        torso.castShadow = true;
        torso.receiveShadow = true;

        this.object.add(
            torso
        );

        // ----------------------------------------------------
        // JACKET / VEST
        // ----------------------------------------------------

        const vestGeometry =
            new THREE.BoxGeometry(
                0.72,
                0.72,
                0.42
            );

        const vest =
            new THREE.Mesh(
                vestGeometry,
                clothes
            );

        vest.position.y =
            1.2;

        vest.castShadow = true;

        this.object.add(
            vest
        );

        // ----------------------------------------------------
        // HEAD
        // ----------------------------------------------------

        const headGeometry =
            new THREE.SphereGeometry(
                0.31,
                18,
                14
            );

        const head =
            new THREE.Mesh(
                headGeometry,
                skin
            );

        head.position.y =
            1.94;

        head.castShadow = true;

        this.object.add(
            head
        );

        // ----------------------------------------------------
        // HAIR
        // ----------------------------------------------------

        const hairGeometry =
            new THREE.SphereGeometry(
                0.325,
                16,
                10,
                0,
                Math.PI * 2,
                0,
                Math.PI * 0.48
            );

        const hairMesh =
            new THREE.Mesh(
                hairGeometry,
                hair
            );

        hairMesh.position.y =
            2.05;

        hairMesh.castShadow = true;

        this.object.add(
            hairMesh
        );

        // ----------------------------------------------------
        // ARMS
        // ----------------------------------------------------

        const armGeometry =
            new THREE.CapsuleGeometry(
                0.115,
                0.58,
                5,
                8
            );

        const leftArm =
            new THREE.Mesh(
                armGeometry,
                clothes
            );

        leftArm.position.set(
            -0.54,
            1.18,
            0
        );

        leftArm.rotation.z =
            -0.08;

        leftArm.castShadow = true;

        this.object.add(
            leftArm
        );

        const rightArm =
            new THREE.Mesh(
                armGeometry,
                clothes
            );

        rightArm.position.set(
            0.54,
            1.18,
            0
        );

        rightArm.rotation.z =
            0.08;

        rightArm.castShadow = true;

        this.object.add(
            rightArm
        );
    }

    // ========================================================
    // KEYBOARD
    // ========================================================

    setupKeyboard() {

        window.addEventListener(
            "keydown",
            event => {

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
            event => {

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
    // MOVEMENT
    // ========================================================

    update(delta) {

        if (
            !delta ||
            delta <= 0
        ) {
            return;
        }

        let inputX = 0;
        let inputZ = 0;

        if (this.keys.forward) {
            inputZ -= 1;
        }

        if (this.keys.backward) {
            inputZ += 1;
        }

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

            inputX /=
                inputLength;

            inputZ /=
                inputLength;
        }

        // ----------------------------------------------------
        // CAMERA RELATIVE
        // ----------------------------------------------------

        const yaw =
            this.cameraSystem
                ? this.cameraSystem.yaw
                : 0;

        const sin =
            Math.sin(yaw);

        const cos =
            Math.cos(yaw);

        const moveX =
            inputX * cos -
            inputZ * sin;

        const moveZ =
            inputX * sin +
            inputZ * cos;

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
        // TEST NEW POSITION
        // ----------------------------------------------------

        let nextX =
            this.object.position.x +
            moveX *
            speed *
            delta;

        let nextZ =
            this.object.position.z +
            moveZ *
            speed *
            delta;

        // ----------------------------------------------------
        // SLOPE COLLISION
        // ----------------------------------------------------

        const slope =
            this.terrain.getSlopeAngle(
                nextX,
                nextZ
            );

        if (
            slope <=
            this.maxSlope
        ) {

            this.object.position.x =
                nextX;

            this.object.position.z =
                nextZ;
        }

        // ----------------------------------------------------
        // PLAYER ROTATION
        // ----------------------------------------------------

        if (inputLength > 0) {

            const target =
                Math.atan2(
                    moveX,
                    moveZ
                );

            let difference =
                target -
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
            this.gravity *
            delta;

        this.object.position.y +=
            this.velocityY *
            delta;

        // ----------------------------------------------------
        // GROUND
        // ----------------------------------------------------

        const ground =
            this.terrain.getGroundHeight(
                this.object.position.x,
                this.object.position.z
            );

        const playerFootOffset =
            0.08;

        if (
            this.object.position.y <=
            ground +
            playerFootOffset
        ) {

            this.object.position.y =
                ground +
                playerFootOffset;

            this.velocityY = 0;

            this.isGrounded = true;

        } else {

            this.isGrounded = false;
        }

        // ----------------------------------------------------
        // ISLAND LIMIT
        // ----------------------------------------------------

        const maxDistance = 418;

        const distance =
            Math.sqrt(
                this.object.position.x *
                this.object.position.x +
                this.object.position.z *
                this.object.position.z
            );

        if (
            distance >
            maxDistance
        ) {

            const factor =
                maxDistance /
                distance;

            this.object.position.x *=
                factor;

            this.object.position.z *=
                factor;
        }
    }

    getPosition() {
        return this.object.position;
    }

    getObject() {
        return this.object;
    }
}
