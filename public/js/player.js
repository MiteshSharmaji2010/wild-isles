// ============================================================
// WILD ISLES
// VEYRA ISLAND
// PLAYER CONTROLLER v0.8
// Compatible with MAIN GAME ENGINE v0.6
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class Player {

    constructor(scene, terrain) {

        // =====================================================
        // REFERENCES
        // =====================================================

        this.scene = scene;
        this.terrain = terrain;

        // =====================================================
        // PLAYER SETTINGS
        // =====================================================

        this.height = 3.1;
        this.radius = 0.65;

        this.walkSpeed = 4.8;
        this.runSpeed = 8.0;

        this.jumpForce = 9.0;
        this.gravity = 25.0;

        this.maxSlope = 38;

        this.worldLimit = 410;

        // =====================================================
        // PLAYER STATS
        // =====================================================

        this.health = 100;
        this.stamina = 100;

        // =====================================================
        // PHYSICS
        // =====================================================

        this.velocity = new THREE.Vector3();

        this.position = new THREE.Vector3();

        this.isGrounded = false;
        this.isRunning = false;
        this.isCrouching = false;

        // =====================================================
        // CAMERA
        // =====================================================

        this.cameraRotation = Math.PI;

        // =====================================================
        // INPUT
        // =====================================================

        this.keys = {

            forward: false,
            backward: false,
            left: false,
            right: false,

            run: false,
            jump: false
        };

        // =====================================================
        // ANIMATION
        // =====================================================

        this.animTime = 0;

        // =====================================================
        // CREATE PLAYER
        // =====================================================

        this.object =
            this.createPlayer();

        this.scene.add(
            this.object
        );

        // =====================================================
        // INPUT
        // =====================================================

        this.setupKeyboard();

        // =====================================================
        // SPAWN
        // =====================================================

        this.spawnPlayer();

        console.log(
            "Kian Player v0.8 READY"
        );
    }

    // =========================================================
    // CREATE PLAYER MODEL
    // =========================================================

    createPlayer() {

        const player =
            new THREE.Group();

        player.name = "KIAN";

        // -----------------------------------------------------
        // MATERIALS
        // -----------------------------------------------------

        const skin =
            new THREE.MeshStandardMaterial({
                color: 0xc98b62,
                roughness: 0.82
            });

        const shirt =
            new THREE.MeshStandardMaterial({
                color: 0x26382f,
                roughness: 0.9
            });

        const pants =
            new THREE.MeshStandardMaterial({
                color: 0x20262b,
                roughness: 0.9
            });

        const boots =
            new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 0.95
            });

        const hair =
            new THREE.MeshStandardMaterial({
                color: 0x15110d,
                roughness: 0.9
            });

        const backpackMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x35483d,
                roughness: 0.9
            });

        // =====================================================
        // LEGS
        // =====================================================

        const legGeometry =
            new THREE.CapsuleGeometry(
                0.20,
                0.85,
                6,
                10
            );

        const leftLeg =
            new THREE.Mesh(
                legGeometry,
                pants
            );

        leftLeg.position.set(
            -0.23,
            0.75,
            0
        );

        leftLeg.castShadow = true;

        player.add(
            leftLeg
        );

        const rightLeg =
            new THREE.Mesh(
                legGeometry,
                pants
            );

        rightLeg.position.set(
            0.23,
            0.75,
            0
        );

        rightLeg.castShadow = true;

        player.add(
            rightLeg
        );

        this.leftLeg = leftLeg;
        this.rightLeg = rightLeg;

        // =====================================================
        // BOOTS
        // =====================================================

        const bootGeometry =
            new THREE.BoxGeometry(
                0.42,
                0.24,
                0.68
            );

        const leftBoot =
            new THREE.Mesh(
                bootGeometry,
                boots
            );

        leftBoot.position.set(
            -0.23,
            0.22,
            -0.08
        );

        leftBoot.castShadow = true;

        player.add(
            leftBoot
        );

        const rightBoot =
            new THREE.Mesh(
                bootGeometry,
                boots
            );

        rightBoot.position.set(
            0.23,
            0.22,
            -0.08
        );

        rightBoot.castShadow = true;

        player.add(
            rightBoot
        );

        // =====================================================
        // BODY
        // =====================================================

        const bodyGeometry =
            new THREE.CapsuleGeometry(
                0.50,
                0.90,
                8,
                14
            );

        const body =
            new THREE.Mesh(
                bodyGeometry,
                shirt
            );

        body.position.set(
            0,
            1.62,
            0
        );

        body.scale.set(
            1,
            1.05,
            0.75
        );

        body.castShadow = true;
        body.receiveShadow = true;

        player.add(
            body
        );

        this.body = body;

        // =====================================================
        // NECK
        // =====================================================

        const neckGeometry =
            new THREE.CylinderGeometry(
                0.18,
                0.20,
                0.22,
                10
            );

        const neck =
            new THREE.Mesh(
                neckGeometry,
                skin
            );

        neck.position.y =
            2.25;

        neck.castShadow = true;

        player.add(
            neck
        );

        // =====================================================
        // HEAD
        // =====================================================

        const headGeometry =
            new THREE.SphereGeometry(
                0.46,
                20,
                14
            );

        const head =
            new THREE.Mesh(
                headGeometry,
                skin
            );

        head.position.set(
            0,
            2.67,
            0
        );

        head.scale.set(
            0.98,
            1.05,
            0.95
        );

        head.castShadow = true;

        player.add(
            head
        );

        this.head = head;

        // =====================================================
        // HAIR
        // =====================================================

        const hairGeometry =
            new THREE.SphereGeometry(
                0.47,
                18,
                10,
                0,
                Math.PI * 2,
                0,
                Math.PI * 0.55
            );

        const hairMesh =
            new THREE.Mesh(
                hairGeometry,
                hair
            );

        hairMesh.position.set(
            0,
            2.82,
            -0.01
        );

        hairMesh.scale.set(
            1,
            0.75,
            1
        );

        hairMesh.castShadow = true;

        player.add(
            hairMesh
        );

        // =====================================================
        // ARMS
        // =====================================================

        const armGeometry =
            new THREE.CapsuleGeometry(
                0.17,
                0.72,
                6,
                10
            );

        const leftArm =
            new THREE.Mesh(
                armGeometry,
                shirt
            );

        leftArm.position.set(
            -0.57,
            1.65,
            0
        );

        leftArm.rotation.z =
            -0.10;

        leftArm.castShadow = true;

        player.add(
            leftArm
        );

        const rightArm =
            new THREE.Mesh(
                armGeometry,
                shirt
            );

        rightArm.position.set(
            0.57,
            1.65,
            0
        );

        rightArm.rotation.z =
            0.10;

        rightArm.castShadow = true;

        player.add(
            rightArm
        );

        this.leftArm = leftArm;
        this.rightArm = rightArm;

        // =====================================================
        // HANDS
        // =====================================================

        const handGeometry =
            new THREE.SphereGeometry(
                0.18,
                10,
                8
            );

        const leftHand =
            new THREE.Mesh(
                handGeometry,
                skin
            );

        leftHand.position.set(
            -0.60,
            1.20,
            0
        );

        leftHand.castShadow = true;

        player.add(
            leftHand
        );

        const rightHand =
            new THREE.Mesh(
                handGeometry,
                skin
            );

        rightHand.position.set(
            0.60,
            1.20,
            0
        );

        rightHand.castShadow = true;

        player.add(
            rightHand
        );

        // =====================================================
        // BACKPACK
        // =====================================================

        const backpackGeometry =
            new THREE.BoxGeometry(
                0.68,
                0.90,
                0.30
            );

        const backpack =
            new THREE.Mesh(
                backpackGeometry,
                backpackMaterial
            );

        backpack.position.set(
            0,
            1.70,
            0.43
        );

        backpack.castShadow = true;

        player.add(
            backpack
        );

        // =====================================================
        // SHADOW
        // =====================================================

        const shadowGeometry =
            new THREE.CircleGeometry(
                0.78,
                24
            );

        const shadowMaterial =
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.28,
                depthWrite: false
            });

        const shadow =
            new THREE.Mesh(
                shadowGeometry,
                shadowMaterial
            );

        shadow.rotation.x =
            -Math.PI / 2;

        shadow.position.y =
            0.03;

        player.add(
            shadow
        );

        this.shadow = shadow;

        // =====================================================
        // BIGGER PLAYER
        // =====================================================

        player.scale.set(
            1.25,
            1.25,
            1.25
        );

        return player;
    }

    // =========================================================
    // KEYBOARD INPUT
    // =========================================================

    setupKeyboard() {

        window.addEventListener(
            "keydown",
            (event) => {

                switch (event.code) {

                    case "KeyW":
                    case "ArrowUp":

                        this.keys.forward =
                            true;

                        event.preventDefault();

                        break;

                    case "KeyS":
                    case "ArrowDown":

                        this.keys.backward =
                            true;

                        event.preventDefault();

                        break;

                    case "KeyA":
                    case "ArrowLeft":

                        this.keys.left =
                            true;

                        event.preventDefault();

                        break;

                    case "KeyD":
                    case "ArrowRight":

                        this.keys.right =
                            true;

                        event.preventDefault();

                        break;

                    case "ShiftLeft":
                    case "ShiftRight":

                        this.keys.run =
                            true;

                        break;

                    case "Space":

                        if (!event.repeat) {

                            this.keys.jump =
                                true;
                        }

                        event.preventDefault();

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

                        this.keys.forward =
                            false;

                        break;

                    case "KeyS":
                    case "ArrowDown":

                        this.keys.backward =
                            false;

                        break;

                    case "KeyA":
                    case "ArrowLeft":

                        this.keys.left =
                            false;

                        break;

                    case "KeyD":
                    case "ArrowRight":

                        this.keys.right =
                            false;

                        break;

                    case "ShiftLeft":
                    case "ShiftRight":

                        this.keys.run =
                            false;

                        break;

                    case "Space":

                        this.keys.jump =
                            false;

                        break;
                }
            }
        );

        window.addEventListener(
            "blur",
            () => {

                this.keys.forward = false;
                this.keys.backward = false;
                this.keys.left = false;
                this.keys.right = false;
                this.keys.run = false;
                this.keys.jump = false;
            }
        );
    }

    // =========================================================
    // CAMERA ROTATION
    // =========================================================

    setCameraRotation(rotation) {

        this.cameraRotation =
            rotation;
    }

    // =========================================================
    // SPAWN
    // =========================================================

    spawnPlayer() {

        let x = 0;
        let z = 0;
        let y = 5;

        if (this.terrain) {

            const safe =
                this.terrain.findSafePosition(
                    0,
                    0,
                    150
                );

            if (safe) {

                x = safe.x;
                z = safe.z;
                y = safe.y;

            } else {

                y =
                    this.terrain.getGroundHeight(
                        0,
                        0
                    );
            }
        }

        this.position.set(
            x,
            y + 0.05,
            z
        );

        this.object.position.copy(
            this.position
        );

        this.isGrounded = true;

        console.log(
            "Kian spawn:",
            this.position
        );
    }

    // =========================================================
    // INPUT DIRECTION
    // =========================================================

    getInputDirection() {

        let x = 0;
        let z = 0;

        if (this.keys.left) {
            x -= 1;
        }

        if (this.keys.right) {
            x += 1;
        }

        if (this.keys.forward) {
            z -= 1;
        }

        if (this.keys.backward) {
            z += 1;
        }

        const direction =
            new THREE.Vector3(
                x,
                0,
                z
            );

        if (
            direction.lengthSq() > 0
        ) {

            direction.normalize();
        }

        return direction;
    }

    // =========================================================
    // SAFE POSITION
    // =========================================================

    isSafePosition(x, z) {

        if (!this.terrain) {
            return true;
        }

        if (
            !this.terrain.isInsideIsland(
                x,
                z
            )
        ) {

            return false;
        }

        const height =
            this.terrain.getGroundHeight(
                x,
                z
            );

        // Water protection
        if (height <= 1.8) {
            return false;
        }

        const slope =
            this.terrain.getSlopeDegrees(
                x,
                z
            );

        if (
            slope > this.maxSlope
        ) {

            return false;
        }

        return true;
    }

    // =========================================================
    // TERRAIN HEIGHT
    // =========================================================

    getGroundHeight(x, z) {

        if (!this.terrain) {
            return 0;
        }

        return this.terrain.getGroundHeight(
            x,
            z
        );
    }

    // =========================================================
    // MOVE
    // =========================================================

    tryMove(dx, dz) {

        const oldX =
            this.position.x;

        const oldZ =
            this.position.z;

        // -----------------------------------------------------
        // X
        // -----------------------------------------------------

        const nextX =
            THREE.MathUtils.clamp(
                oldX + dx,
                -this.worldLimit,
                this.worldLimit
            );

        if (
            this.isSafePosition(
                nextX,
                oldZ
            )
        ) {

            this.position.x =
                nextX;
        }

        // -----------------------------------------------------
        // Z
        // -----------------------------------------------------

        const nextZ =
            THREE.MathUtils.clamp(
                this.position.z + dz,
                -this.worldLimit,
                this.worldLimit
            );

        if (
            this.isSafePosition(
                this.position.x,
                nextZ
            )
        ) {

            this.position.z =
                nextZ;
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

        this.isGrounded =
            false;
    }

    // =========================================================
    // UPDATE
    // =========================================================

    update(deltaTime, cameraYaw) {

        if (
            !deltaTime ||
            deltaTime <= 0
        ) {

            return;
        }

        deltaTime =
            Math.min(
                deltaTime,
                0.05
            );

        if (
            typeof cameraYaw === "number"
        ) {

            this.cameraRotation =
                cameraYaw;
        }

        // =====================================================
        // INPUT
        // =====================================================

        const input =
            this.getInputDirection();

        const moving =
            input.lengthSq() > 0;

        // =====================================================
        // CAMERA RELATIVE DIRECTION
        // =====================================================

        const movement =
            new THREE.Vector3();

        if (moving) {

            movement.set(
                input.x,
                0,
                input.z
            );

            movement.applyAxisAngle(
                new THREE.Vector3(
                    0,
                    1,
                    0
                ),
                this.cameraRotation
            );

            movement.normalize();
        }

        // =====================================================
        // RUN
        // =====================================================

        this.isRunning =
            this.keys.run &&
            moving &&
            this.stamina > 0 &&
            !this.isCrouching;

        const speed =
            this.isRunning
                ? this.runSpeed
                : this.walkSpeed;

        // =====================================================
        // STAMINA
        // =====================================================

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

        // =====================================================
        // MOVEMENT
        // =====================================================

        if (moving) {

            const distance =
                speed * deltaTime;

            this.tryMove(
                movement.x * distance,
                movement.z * distance
            );

            // Face movement direction
            const targetRotation =
                Math.atan2(
                    movement.x,
                    movement.z
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
                    12 * deltaTime
                );
        }

        // =====================================================
        // JUMP
        // =====================================================

        if (this.keys.jump) {

            this.jump();

            this.keys.jump =
                false;
        }

        // =====================================================
        // GRAVITY
        // =====================================================

        if (!this.isGrounded) {

            this.velocity.y -=
                this.gravity *
                deltaTime;

            this.position.y +=
                this.velocity.y *
                deltaTime;

            const ground =
                this.getGroundHeight(
                    this.position.x,
                    this.position.z
                );

            if (
                this.position.y <=
                ground + 0.05
            ) {

                this.position.y =
                    ground + 0.05;

                this.velocity.y =
                    0;

                this.isGrounded =
                    true;
            }

        } else {

            const ground =
                this.getGroundHeight(
                    this.position.x,
                    this.position.z
                );

            this.position.y =
                ground + 0.05;
        }

        // =====================================================
        // UPDATE MODEL
        // =====================================================

        this.object.position.copy(
            this.position
        );

        // =====================================================
        // ANIMATION
        // =====================================================

        this.updateAnimation(
            deltaTime,
            moving
        );
    }

    // =========================================================
    // ANIMATION
    // =========================================================

    updateAnimation(
        deltaTime,
        moving
    ) {

        this.animTime +=
            deltaTime;

        if (
            !moving ||
            !this.isGrounded
        ) {

            this.leftLeg.rotation.x =
                THREE.MathUtils.lerp(
                    this.leftLeg.rotation.x,
                    0,
                    0.18
                );

            this.rightLeg.rotation.x =
                THREE.MathUtils.lerp(
                    this.rightLeg.rotation.x,
                    0,
                    0.18
                );

            this.leftArm.rotation.x =
                THREE.MathUtils.lerp(
                    this.leftArm.rotation.x,
                    0,
                    0.18
                );

            this.rightArm.rotation.x =
                THREE.MathUtils.lerp(
                    this.rightArm.rotation.x,
                    0,
                    0.18
                );

            return;
        }

        const speed =
            this.isRunning
                ? 11
                : 8;

        const swing =
            Math.sin(
                this.animTime * speed
            ) *
            (
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

        if (
            !this.isSafePosition(
                x,
                z
            )
        ) {

            return false;
        }

        const y =
            this.getGroundHeight(
                x,
                z
            );

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

        this.isGrounded =
            true;

        this.object.position.copy(
            this.position
        );

        return true;
    }

    // =========================================================
    // POSITION
    // =========================================================

    getPosition() {

        return this.position.clone();
    }

    // =========================================================
    // OBJECT
    // =========================================================

    getObject() {

        return this.object;
    }

    // =========================================================
    // DEBUG
    // =========================================================

    getDebugInfo() {

        let slope = 0;

        if (this.terrain) {

            slope =
                this.terrain.getSlopeDegrees(
                    this.position.x,
                    this.position.z
                );
        }

        return {

            x: this.position.x.toFixed(1),

            y: this.position.y.toFixed(1),

            z: this.position.z.toFixed(1),

            slope: slope.toFixed(1),

            health: Math.round(
                this.health
            ),

            stamina: Math.round(
                this.stamina
            ),

            grounded:
                this.isGrounded,

            running:
                this.isRunning
        };
    }

    // =========================================================
    // DISPOSE
    // =========================================================

    dispose() {

        if (
            this.object &&
            this.scene
        ) {

            this.scene.remove(
                this.object
            );
        }

        if (!this.object) {
            return;
        }

        this.object.traverse(
            (child) => {

                if (
                    child.geometry
                ) {

                    child.geometry.dispose();
                }

                if (
                    child.material
                ) {

                    if (
                        Array.isArray(
                            child.material
                        )
                    ) {

                        child.material.forEach(
                            material => {

                                material.dispose();
                            }
                        );

                    } else {

                        child.material.dispose();
                    }
                }
            }
        );
    }
}
