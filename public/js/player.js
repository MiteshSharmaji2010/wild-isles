// ============================================================
// WILD ISLES
// public/js/player.js
// KIAN PLAYER CONTROLLER v0.7
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class Player {

    constructor(game) {

        this.game = game;

        // =====================================================
        // PLAYER SETTINGS
        // =====================================================

        this.height = 2.15;
        this.width = 0.85;

        this.walkSpeed = 4.8;
        this.runSpeed = 8.0;
        this.jumpForce = 9.0;
        this.gravity = 25.0;

        this.collisionRadius = 0.65;
        this.maxSlope = 38;

        this.worldLimit = 410;

        // =====================================================
        // PLAYER STATE
        // =====================================================

        this.position = new THREE.Vector3(0, 10, 0);
        this.velocity = new THREE.Vector3();

        this.health = 100;
        this.stamina = 100;

        this.isGrounded = false;
        this.isRunning = false;
        this.isCrouching = false;

        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            run: false,
            jump: false
        };

        // =====================================================
        // ROTATION
        // =====================================================

        this.targetRotation = 0;
        this.rotationSpeed = 12;

        // =====================================================
        // ANIMATION
        // =====================================================

        this.animTime = 0;
        this.baseY = 0;

        // =====================================================
        // CREATE PLAYER
        // =====================================================

        this.object = this.createPlayer();

        this.game.scene.add(this.object);

        // =====================================================
        // INPUT
        // =====================================================

        this.setupKeyboard();

        // =====================================================
        // SPAWN
        // =====================================================

        this.spawnPlayer();
    }

    // =========================================================
    // CREATE KIAN
    // =========================================================

    createPlayer() {

        const group = new THREE.Group();

        group.name = "KIAN";

        // -----------------------------------------------------
        // MATERIALS
        // -----------------------------------------------------

        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0xc98b62,
            roughness: 0.82,
            metalness: 0.02
        });

        const shirtMaterial = new THREE.MeshStandardMaterial({
            color: 0x26352e,
            roughness: 0.9,
            metalness: 0
        });

        const pantsMaterial = new THREE.MeshStandardMaterial({
            color: 0x20252a,
            roughness: 0.9,
            metalness: 0
        });

        const bootMaterial = new THREE.MeshStandardMaterial({
            color: 0x161616,
            roughness: 0.95,
            metalness: 0
        });

        const hairMaterial = new THREE.MeshStandardMaterial({
            color: 0x17120e,
            roughness: 0.85,
            metalness: 0
        });

        const backpackMaterial = new THREE.MeshStandardMaterial({
            color: 0x35453c,
            roughness: 0.9,
            metalness: 0
        });

        // -----------------------------------------------------
        // LEGS
        // -----------------------------------------------------

        const legGeometry = new THREE.CapsuleGeometry(
            0.19,
            0.75,
            6,
            10
        );

        const leftLeg = new THREE.Mesh(
            legGeometry,
            pantsMaterial
        );

        leftLeg.position.set(
            -0.22,
            0.72,
            0
        );

        leftLeg.castShadow = true;
        leftLeg.receiveShadow = true;

        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(
            legGeometry,
            pantsMaterial
        );

        rightLeg.position.set(
            0.22,
            0.72,
            0
        );

        rightLeg.castShadow = true;
        rightLeg.receiveShadow = true;

        group.add(rightLeg);

        this.leftLeg = leftLeg;
        this.rightLeg = rightLeg;

        // -----------------------------------------------------
        // BOOTS
        // -----------------------------------------------------

        const bootGeometry = new THREE.BoxGeometry(
            0.38,
            0.22,
            0.62
        );

        const leftBoot = new THREE.Mesh(
            bootGeometry,
            bootMaterial
        );

        leftBoot.position.set(
            -0.22,
            0.22,
            -0.10
        );

        leftBoot.castShadow = true;

        group.add(leftBoot);

        const rightBoot = new THREE.Mesh(
            bootGeometry,
            bootMaterial
        );

        rightBoot.position.set(
            0.22,
            0.22,
            -0.10
        );

        rightBoot.castShadow = true;

        group.add(rightBoot);

        this.leftBoot = leftBoot;
        this.rightBoot = rightBoot;

        // -----------------------------------------------------
        // TORSO
        // -----------------------------------------------------

        const torsoGeometry = new THREE.CapsuleGeometry(
            0.48,
            0.78,
            8,
            14
        );

        const torso = new THREE.Mesh(
            torsoGeometry,
            shirtMaterial
        );

        torso.position.set(
            0,
            1.55,
            0
        );

        torso.scale.set(
            1.0,
            1.05,
            0.72
        );

        torso.castShadow = true;
        torso.receiveShadow = true;

        group.add(torso);

        this.torso = torso;

        // -----------------------------------------------------
        // NECK
        // -----------------------------------------------------

        const neckGeometry = new THREE.CylinderGeometry(
            0.18,
            0.20,
            0.22,
            10
        );

        const neck = new THREE.Mesh(
            neckGeometry,
            skinMaterial
        );

        neck.position.y = 2.15;

        neck.castShadow = true;

        group.add(neck);

        // -----------------------------------------------------
        // HEAD
        // -----------------------------------------------------

        const headGeometry = new THREE.SphereGeometry(
            0.43,
            16,
            12
        );

        const head = new THREE.Mesh(
            headGeometry,
            skinMaterial
        );

        head.position.set(
            0,
            2.55,
            0
        );

        head.scale.set(
            0.95,
            1.05,
            0.92
        );

        head.castShadow = true;
        head.receiveShadow = true;

        group.add(head);

        this.head = head;

        // -----------------------------------------------------
        // HAIR
        // -----------------------------------------------------

        const hairGeometry = new THREE.SphereGeometry(
            0.44,
            16,
            10,
            0,
            Math.PI * 2,
            0,
            Math.PI * 0.55
        );

        const hair = new THREE.Mesh(
            hairGeometry,
            hairMaterial
        );

        hair.position.set(
            0,
            2.70,
            -0.01
        );

        hair.scale.set(
            1.0,
            0.72,
            1.0
        );

        hair.castShadow = true;

        group.add(hair);

        this.hair = hair;

        // -----------------------------------------------------
        // EARS
        // -----------------------------------------------------

        const earGeometry = new THREE.SphereGeometry(
            0.10,
            8,
            8
        );

        const leftEar = new THREE.Mesh(
            earGeometry,
            skinMaterial
        );

        leftEar.position.set(
            -0.40,
            2.55,
            0
        );

        group.add(leftEar);

        const rightEar = new THREE.Mesh(
            earGeometry,
            skinMaterial
        );

        rightEar.position.set(
            0.40,
            2.55,
            0
        );

        group.add(rightEar);

        // -----------------------------------------------------
        // ARMS
        // -----------------------------------------------------

        const armGeometry = new THREE.CapsuleGeometry(
            0.16,
            0.65,
            6,
            10
        );

        const leftArm = new THREE.Mesh(
            armGeometry,
            shirtMaterial
        );

        leftArm.position.set(
            -0.55,
            1.60,
            0
        );

        leftArm.rotation.z = -0.10;

        leftArm.castShadow = true;

        group.add(leftArm);

        const rightArm = new THREE.Mesh(
            armGeometry,
            shirtMaterial
        );

        rightArm.position.set(
            0.55,
            1.60,
            0
        );

        rightArm.rotation.z = 0.10;

        rightArm.castShadow = true;

        group.add(rightArm);

        this.leftArm = leftArm;
        this.rightArm = rightArm;

        // -----------------------------------------------------
        // HANDS
        // -----------------------------------------------------

        const handGeometry = new THREE.SphereGeometry(
            0.17,
            10,
            8
        );

        const leftHand = new THREE.Mesh(
            handGeometry,
            skinMaterial
        );

        leftHand.position.set(
            -0.58,
            1.18,
            0
        );

        leftHand.castShadow = true;

        group.add(leftHand);

        const rightHand = new THREE.Mesh(
            handGeometry,
            skinMaterial
        );

        rightHand.position.set(
            0.58,
            1.18,
            0
        );

        rightHand.castShadow = true;

        group.add(rightHand);

        // -----------------------------------------------------
        // BACKPACK
        // -----------------------------------------------------

        const backpackGeometry = new THREE.BoxGeometry(
            0.65,
            0.85,
            0.28
        );

        const backpack = new THREE.Mesh(
            backpackGeometry,
            backpackMaterial
        );

        backpack.position.set(
            0,
            1.65,
            0.40
        );

        backpack.castShadow = true;
        backpack.receiveShadow = true;

        group.add(backpack);

        this.backpack = backpack;

        // -----------------------------------------------------
        // PLAYER SHADOW
        // -----------------------------------------------------

        const shadowGeometry = new THREE.CircleGeometry(
            0.72,
            24
        );

        const shadowMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.28,
            depthWrite: false
        });

        const shadow = new THREE.Mesh(
            shadowGeometry,
            shadowMaterial
        );

        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.03;

        group.add(shadow);

        this.shadow = shadow;

        // -----------------------------------------------------
        // SCALE
        // -----------------------------------------------------

        // Kian is intentionally larger and easier to see.
        group.scale.set(
            1.18,
            1.18,
            1.18
        );

        return group;
    }

    // =========================================================
    // KEYBOARD
    // =========================================================

    setupKeyboard() {

        window.addEventListener("keydown", (event) => {

            switch (event.code) {

                case "KeyW":
                case "ArrowUp":
                    this.keys.forward = true;
                    event.preventDefault();
                    break;

                case "KeyS":
                case "ArrowDown":
                    this.keys.backward = true;
                    event.preventDefault();
                    break;

                case "KeyA":
                case "ArrowLeft":
                    this.keys.left = true;
                    event.preventDefault();
                    break;

                case "KeyD":
                case "ArrowRight":
                    this.keys.right = true;
                    event.preventDefault();
                    break;

                case "ShiftLeft":
                case "ShiftRight":
                    this.keys.run = true;
                    break;

                case "Space":

                    if (!event.repeat) {
                        this.keys.jump = true;
                    }

                    event.preventDefault();

                    break;
            }
        });

        window.addEventListener("keyup", (event) => {

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

                case "Space":
                    this.keys.jump = false;
                    break;
            }
        });

        window.addEventListener("blur", () => {

            Object.keys(this.keys).forEach(key => {
                this.keys[key] = false;
            });

        });
    }

    // =========================================================
    // SPAWN
    // =========================================================

    spawnPlayer() {

        let spawnX = 0;
        let spawnZ = 0;
        let spawnY = 4;

        if (this.game.terrain) {

            const safe = this.game.terrain.findSafePosition(
                0,
                0,
                150
            );

            if (safe) {

                spawnX = safe.x;
                spawnZ = safe.z;
                spawnY = safe.y + 0.05;

            } else {

                spawnY =
                    this.game.terrain.getGroundHeight(0, 0) +
                    0.05;
            }
        }

        this.position.set(
            spawnX,
            spawnY,
            spawnZ
        );

        this.object.position.copy(
            this.position
        );

        this.baseY = this.object.position.y;
    }

    // =========================================================
    // INPUT DIRECTION
    // =========================================================

    getInputDirection() {

        let x = 0;
        let z = 0;

        if (this.keys.left) x -= 1;
        if (this.keys.right) x += 1;

        if (this.keys.forward) z -= 1;
        if (this.keys.backward) z += 1;

        const direction = new THREE.Vector3(
            x,
            0,
            z
        );

        if (direction.lengthSq() > 0) {
            direction.normalize();
        }

        return direction;
    }

    // =========================================================
    // CHECK SAFE POSITION
    // =========================================================

    isSafePosition(x, z) {

        if (!this.game.terrain) {
            return true;
        }

        if (!this.game.terrain.isInsideIsland(x, z)) {
            return false;
        }

        const centerHeight =
            this.game.terrain.getGroundHeight(x, z);

        const slope =
            this.game.terrain.getSlopeDegrees(x, z);

        if (slope > this.maxSlope) {
            return false;
        }

        if (centerHeight <= 1.8) {
            return false;
        }

        return true;
    }

    // =========================================================
    // TERRAIN HEIGHT
    // =========================================================

    getGroundHeight(x, z) {

        if (!this.game.terrain) {
            return 0;
        }

        return this.game.terrain.getGroundHeight(
            x,
            z
        );
    }

    // =========================================================
    // MOVEMENT
    // =========================================================

    tryMove(dx, dz) {

        const currentX = this.position.x;
        const currentZ = this.position.z;

        // -----------------------------------------------------
        // X MOVEMENT
        // -----------------------------------------------------

        const newX = THREE.MathUtils.clamp(
            currentX + dx,
            -this.worldLimit,
            this.worldLimit
        );

        if (this.isSafePosition(
            newX,
            currentZ
        )) {

            this.position.x = newX;

        }

        // -----------------------------------------------------
        // Z MOVEMENT
        // -----------------------------------------------------

        const newZ = THREE.MathUtils.clamp(
            currentZ + dz,
            -this.worldLimit,
            this.worldLimit
        );

        if (this.isSafePosition(
            this.position.x,
            newZ
        )) {

            this.position.z = newZ;

        }

        // -----------------------------------------------------
        // UPDATE TERRAIN HEIGHT
        // -----------------------------------------------------

        const groundY = this.getGroundHeight(
            this.position.x,
            this.position.z
        );

        if (
            this.isGrounded &&
            this.velocity.y <= 0
        ) {

            this.position.y = groundY + 0.05;

        }
    }

    // =========================================================
    // JUMP
    // =========================================================

    jump() {

        if (!this.isGrounded) {
            return;
        }

        this.velocity.y =
            this.jumpForce;

        this.isGrounded = false;
    }

    // =========================================================
    // UPDATE
    // =========================================================

    update(deltaTime, cameraYaw = 0) {

        if (!deltaTime || deltaTime <= 0) {
            return;
        }

        deltaTime = Math.min(
            deltaTime,
            0.05
        );

        // -----------------------------------------------------
        // INPUT
        // -----------------------------------------------------

        const input =
            this.getInputDirection();

        const hasInput =
            input.lengthSq() > 0;

        // -----------------------------------------------------
        // CAMERA RELATIVE MOVEMENT
        // -----------------------------------------------------

        let moveDirection =
            new THREE.Vector3();

        if (hasInput) {

            moveDirection.set(
                input.x,
                0,
                input.z
            );

            moveDirection.applyAxisAngle(
                new THREE.Vector3(0, 1, 0),
                cameraYaw
            );

            moveDirection.normalize();
        }

        // -----------------------------------------------------
        // RUN
        // -----------------------------------------------------

        this.isRunning =
            this.keys.run &&
            hasInput &&
            this.stamina > 0 &&
            !this.isCrouching;

        const speed =
            this.isRunning
                ? this.runSpeed
                : this.walkSpeed;

        // -----------------------------------------------------
        // STAMINA
        // -----------------------------------------------------

        if (this.isRunning) {

            this.stamina -=
                22 * deltaTime;

        } else {

            this.stamina +=
                14 * deltaTime;
        }

        this.stamina =
            THREE.MathUtils.clamp(
                this.stamina,
                0,
                100
            );

        // -----------------------------------------------------
        // MOVE
        // -----------------------------------------------------

        if (hasInput) {

            const distance =
                speed * deltaTime;

            this.tryMove(
                moveDirection.x * distance,
                moveDirection.z * distance
            );

            // Face movement direction.
            this.targetRotation =
                Math.atan2(
                    moveDirection.x,
                    moveDirection.z
                );

            const rotationDifference =
                THREE.MathUtils.euclideanModulo(
                    this.targetRotation -
                    this.object.rotation.y +
                    Math.PI,
                    Math.PI * 2
                ) - Math.PI;

            this.object.rotation.y +=
                rotationDifference *
                Math.min(
                    1,
                    this.rotationSpeed *
                    deltaTime
                );
        }

        // -----------------------------------------------------
        // JUMP
        // -----------------------------------------------------

        if (this.keys.jump) {

            this.jump();

            this.keys.jump = false;
        }

        // -----------------------------------------------------
        // GRAVITY
        // -----------------------------------------------------

        if (!this.isGrounded) {

            this.velocity.y -=
                this.gravity *
                deltaTime;

            this.position.y +=
                this.velocity.y *
                deltaTime;

            const groundY =
                this.getGroundHeight(
                    this.position.x,
                    this.position.z
                );

            if (
                this.position.y <=
                groundY + 0.05
            ) {

                this.position.y =
                    groundY + 0.05;

                this.velocity.y = 0;

                this.isGrounded = true;
            }
        } else {

            const groundY =
                this.getGroundHeight(
                    this.position.x,
                    this.position.z
                );

            this.position.y =
                groundY + 0.05;
        }

        // -----------------------------------------------------
        // UPDATE OBJECT POSITION
        // -----------------------------------------------------

        this.object.position.copy(
            this.position
        );

        // -----------------------------------------------------
        // ANIMATION
        // -----------------------------------------------------

        this.updateAnimation(
            deltaTime,
            hasInput
        );
    }

    // =========================================================
    // PLAYER ANIMATION
    // =========================================================

    updateAnimation(deltaTime, moving) {

        this.animTime += deltaTime;

        // IMPORTANT:
        // Never accumulate Y movement.
        // Keep player position controlled by physics.

        if (!moving || !this.isGrounded) {

            this.leftLeg.rotation.x =
                THREE.MathUtils.lerp(
                    this.leftLeg.rotation.x,
                    0,
                    0.15
                );

            this.rightLeg.rotation.x =
                THREE.MathUtils.lerp(
                    this.rightLeg.rotation.x,
                    0,
                    0.15
                );

            this.leftArm.rotation.x =
                THREE.MathUtils.lerp(
                    this.leftArm.rotation.x,
                    0,
                    0.15
                );

            this.rightArm.rotation.x =
                THREE.MathUtils.lerp(
                    this.rightArm.rotation.x,
                    0,
                    0.15
                );

            return;
        }

        const animationSpeed =
            this.isRunning
                ? 11
                : 8;

        const swing =
            Math.sin(
                this.animTime *
                animationSpeed
            ) * (
                this.isRunning
                    ? 0.65
                    : 0.42
            );

        this.leftLeg.rotation.x =
            swing;

        this.rightLeg.rotation.x =
            -swing;

        this.leftArm.rotation.x =
            -swing * 0.75;

        this.rightArm.rotation.x =
            swing * 0.75;
    }

    // =========================================================
    // TELEPORT
    // =========================================================

    teleport(x, z) {

        if (!this.isSafePosition(x, z)) {
            return false;
        }

        const y =
            this.getGroundHeight(x, z);

        this.position.set(
            x,
            y + 0.05,
            z
        );

        this.velocity.set(
            0,
            0,
            0
        );

        this.object.position.copy(
            this.position
        );

        this.isGrounded = true;

        return true;
    }

    // =========================================================
    // GET POSITION
    // =========================================================

    getPosition() {

        return this.position.clone();
    }

    // =========================================================
    // GET OBJECT
    // =========================================================

    getObject() {

        return this.object;
    }

    // =========================================================
    // DEBUG INFO
    // =========================================================

    getDebugInfo() {

        return {
            x: this.position.x.toFixed(1),
            y: this.position.y.toFixed(1),
            z: this.position.z.toFixed(1),
            health: Math.round(this.health),
            stamina: Math.round(this.stamina),
            grounded: this.isGrounded,
            running: this.isRunning
        };
    }

    // =========================================================
    // DISPOSE
    // =========================================================

    dispose() {

        this.game.scene.remove(
            this.object
        );

        this.object.traverse(
            (child) => {

                if (child.geometry) {
                    child.geometry.dispose();
                }

                if (child.material) {

                    if (Array.isArray(child.material)) {

                        child.material.forEach(
                            material => material.dispose()
                        );

                    } else {

                        child.material.dispose();
                    }
                }
            }
        );
    }
}
