// ============================================================
// WILD ISLES
// PLAYER SYSTEM
// KIAN - HUGE WORLD MOVEMENT
// Version 1.0
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class Player {

    constructor(scene, terrain) {

        this.scene = scene;
        this.terrain = terrain;

        // ====================================================
        // PLAYER IDENTITY
        // ====================================================

        this.name = "KIAN";

        // ====================================================
        // PLAYER PHYSICS
        // ====================================================

        this.height = 3.1;
        this.radius = 0.65;

        this.walkSpeed = 4.8;
        this.runSpeed = 8.0;

        this.jumpForce = 9.0;
        this.gravity = 25.0;

        this.maxSlope = 38;

        // ====================================================
        // HUGE WORLD
        // ====================================================

        this.worldLimit =
            terrain &&
            Number.isFinite(terrain.worldHalfSize)
                ? terrain.worldHalfSize - 5
                : 8180;

        // ====================================================
        // PLAYER STATE
        // ====================================================

        this.health = 100;
        this.maxHealth = 100;

        this.stamina = 100;
        this.maxStamina = 100;

        this.isRunning = false;
        this.isCrouching = false;
        this.isGrounded = false;
        this.isJumping = false;

        this.velocity =
            new THREE.Vector3(
                0,
                0,
                0
            );

        // ====================================================
        // INPUT
        // ====================================================

        this.keys = {};

        this.cameraRotation = Math.PI;

        // ====================================================
        // MOVEMENT SETTINGS
        // ====================================================

        this.staminaDrain = 18;

        this.staminaRecovery = 14;

        this.crouchSpeedMultiplier = 0.48;

        this.airControl = 0.65;

        // ====================================================
        // ANIMATION
        // ====================================================

        this.animationTime = 0;

        this.currentAnimation = "idle";

        // ====================================================
        // PLAYER OBJECT
        // ====================================================

        this.object =
            new THREE.Group();

        this.object.name =
            "KIAN_PLAYER";

        this.createPlayerModel();

        this.scene.add(
            this.object
        );

        // ====================================================
        // KEYBOARD
        // ====================================================

        this.setupKeyboard();

        // ====================================================
        // SPAWN
        // ====================================================

        this.spawnPlayer();

        console.log(
            "KIAN Player v1.0 HUGE WORLD READY"
        );
    }

    // ========================================================
    // CREATE PLAYER MODEL
    // ========================================================

    createPlayerModel() {

        this.bodyGroup =
            new THREE.Group();

        this.bodyGroup.name =
            "KIAN_BODY";

        // ----------------------------------------------------
        // MATERIALS
        // ----------------------------------------------------

        const skinMaterial =
            new THREE.MeshStandardMaterial({

                color: 0xc58d6d,

                roughness: 0.82,

                metalness: 0.02

            });

        const shirtMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x28343d,

                roughness: 0.85,

                metalness: 0.05

            });

        const pantsMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x171b20,

                roughness: 0.9,

                metalness: 0.02

            });

        const bootMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x090b0d,

                roughness: 0.9,

                metalness: 0.08

            });

        const gearMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x38454b,

                roughness: 0.75,

                metalness: 0.18

            });

        // ----------------------------------------------------
        // BODY
        // ----------------------------------------------------

        const bodyGeometry =
            new THREE.BoxGeometry(
                1.05,
                1.35,
                0.58
            );

        this.body =
            new THREE.Mesh(
                bodyGeometry,
                shirtMaterial
            );

        this.body.position.y =
            1.85;

        this.body.castShadow = true;

        this.body.receiveShadow = true;

        this.bodyGroup.add(
            this.body
        );

        // ----------------------------------------------------
        // HEAD
        // ----------------------------------------------------

        const headGeometry =
            new THREE.SphereGeometry(
                0.43,
                20,
                16
            );

        this.head =
            new THREE.Mesh(
                headGeometry,
                skinMaterial
            );

        this.head.position.y =
            2.85;

        this.head.castShadow = true;

        this.bodyGroup.add(
            this.head
        );

        // ----------------------------------------------------
        // HAIR
        // ----------------------------------------------------

        const hairGeometry =
            new THREE.SphereGeometry(
                0.45,
                18,
                12,
                0,
                Math.PI * 2,
                0,
                Math.PI * 0.48
            );

        const hairMaterial =
            new THREE.MeshStandardMaterial({

                color: 0x151313,

                roughness: 0.9

            });

        this.hair =
            new THREE.Mesh(
                hairGeometry,
                hairMaterial
            );

        this.hair.position.y =
            3.02;

        this.hair.scale.set(
            1,
            0.8,
            1
        );

        this.hair.castShadow = true;

        this.bodyGroup.add(
            this.hair
        );

        // ----------------------------------------------------
        // LEFT ARM
        // ----------------------------------------------------

        const armGeometry =
            new THREE.BoxGeometry(
                0.32,
                1.15,
                0.34
            );

        this.leftArm =
            new THREE.Mesh(
                armGeometry,
                shirtMaterial
            );

        this.leftArm.position.set(
            -0.68,
            1.9,
            0
        );

        this.leftArm.rotation.z =
            -0.08;

        this.leftArm.castShadow = true;

        this.bodyGroup.add(
            this.leftArm
        );

        // ----------------------------------------------------
        // RIGHT ARM
        // ----------------------------------------------------

        this.rightArm =
            new THREE.Mesh(
                armGeometry,
                shirtMaterial
            );

        this.rightArm.position.set(
            0.68,
            1.9,
            0
        );

        this.rightArm.rotation.z =
            0.08;

        this.rightArm.castShadow = true;

        this.bodyGroup.add(
            this.rightArm
        );

        // ----------------------------------------------------
        // LEFT LEG
        // ----------------------------------------------------

        const legGeometry =
            new THREE.BoxGeometry(
                0.38,
                1.15,
                0.42
            );

        this.leftLeg =
            new THREE.Mesh(
                legGeometry,
                pantsMaterial
            );

        this.leftLeg.position.set(
            -0.25,
            0.65,
            0
        );

        this.leftLeg.castShadow = true;

        this.bodyGroup.add(
            this.leftLeg
        );

        // ----------------------------------------------------
        // RIGHT LEG
        // ----------------------------------------------------

        this.rightLeg =
            new THREE.Mesh(
                legGeometry,
                pantsMaterial
            );

        this.rightLeg.position.set(
            0.25,
            0.65,
            0
        );

        this.rightLeg.castShadow = true;

        this.bodyGroup.add(
            this.rightLeg
        );

        // ----------------------------------------------------
        // LEFT BOOT
        // ----------------------------------------------------

        const bootGeometry =
            new THREE.BoxGeometry(
                0.44,
                0.25,
                0.62
            );

        this.leftBoot =
            new THREE.Mesh(
                bootGeometry,
                bootMaterial
            );

        this.leftBoot.position.set(
            -0.25,
            0.08,
            -0.08
        );

        this.leftBoot.castShadow = true;

        this.bodyGroup.add(
            this.leftBoot
        );

        // ----------------------------------------------------
        // RIGHT BOOT
        // ----------------------------------------------------

        this.rightBoot =
            new THREE.Mesh(
                bootGeometry,
                bootMaterial
            );

        this.rightBoot.position.set(
            0.25,
            0.08,
            -0.08
        );

        this.rightBoot.castShadow = true;

        this.bodyGroup.add(
            this.rightBoot
        );

        // ----------------------------------------------------
        // BACKPACK
        // ----------------------------------------------------

        const backpackGeometry =
            new THREE.BoxGeometry(
                0.72,
                0.9,
                0.25
            );

        this.backpack =
            new THREE.Mesh(
                backpackGeometry,
                gearMaterial
            );

        this.backpack.position.set(
            0,
            1.95,
            0.39
        );

        this.backpack.castShadow = true;

        this.bodyGroup.add(
            this.backpack
        );

        // ----------------------------------------------------
        // CHEST STRAP
        // ----------------------------------------------------

        const strapGeometry =
            new THREE.BoxGeometry(
                0.12,
                1.2,
                0.08
            );

        const strap =
            new THREE.Mesh(
                strapGeometry,
                gearMaterial
            );

        strap.position.set(
            0.32,
            1.95,
            -0.31
        );

        strap.rotation.z =
            -0.12;

        this.bodyGroup.add(
            strap
        );

        // ----------------------------------------------------
        // FLASHLIGHT
        // ----------------------------------------------------

        const flashlightGeometry =
            new THREE.CylinderGeometry(
                0.07,
                0.09,
                0.38,
                10
            );

        this.flashlight =
            new THREE.Mesh(
                flashlightGeometry,
                gearMaterial
            );

        this.flashlight.rotation.z =
            Math.PI / 2;

        this.flashlight.position.set(
            0.73,
            1.62,
            -0.08
        );

        this.bodyGroup.add(
            this.flashlight
        );

        // ----------------------------------------------------
        // BODY SCALE
        // ----------------------------------------------------

        this.bodyGroup.scale.set(
            1.25,
            1.25,
            1.25
        );

        this.object.add(
            this.bodyGroup
        );

    }

    // ========================================================
    // KEYBOARD
    // ========================================================

    setupKeyboard() {

        window.addEventListener(
            "keydown",
            (event) => {

                this.keys[event.code] = true;

                // Prevent page scrolling
                if (
                    event.code === "Space" ||
                    event.code === "ArrowUp" ||
                    event.code === "ArrowDown" ||
                    event.code === "ArrowLeft" ||
                    event.code === "ArrowRight"
                ) {

                    event.preventDefault();

                }

                if (
                    event.code === "Space"
                ) {

                    this.jump();

                }

                if (
                    event.code === "ControlLeft" ||
                    event.code === "ControlRight"
                ) {

                    this.isCrouching =
                        true;

                }

            }
        );

        window.addEventListener(
            "keyup",
            (event) => {

                this.keys[event.code] =
                    false;

                if (
                    event.code === "ControlLeft" ||
                    event.code === "ControlRight"
                ) {

                    this.isCrouching =
                        false;

                }

            }
        );

        window.addEventListener(
            "blur",
            () => {

                this.keys = {};

                this.isRunning = false;

            }
        );

    }

    // ========================================================
    // CAMERA ROTATION
    // ========================================================

    setCameraRotation(
        rotation
    ) {

        if (
            !Number.isFinite(rotation)
        ) {

            return;

        }

        this.cameraRotation =
            rotation;

    }

    // ========================================================
    // SPAWN PLAYER
    // ========================================================

    spawnPlayer() {

        let spawn;

        if (
            this.terrain &&
            typeof this.terrain.findSafePosition ===
                "function"
        ) {

            spawn =
                this.terrain.findSafePosition(
                    0,
                    0,
                    150
                );

        } else {

            spawn = {

                x: 0,

                y: 5,

                z: 0

            };

        }

        this.object.position.set(
            spawn.x,
            spawn.y,
            spawn.z
        );

        this.velocity.set(
            0,
            0,
            0
        );

        this.isGrounded =
            true;

        this.isJumping =
            false;

        console.log(
            "KIAN SPAWN:",
            this.object.position
        );

    }

    // ========================================================
    // GROUND HEIGHT
    // ========================================================

    getGroundHeight(
        x,
        z
    ) {

        if (
            !this.terrain
        ) {

            return 0;

        }

        if (
            typeof this.terrain.getGroundHeight ===
            "function"
        ) {

            return this.terrain.getGroundHeight(
                x,
                z
            );

        }

        if (
            typeof this.terrain.getHeight ===
            "function"
        ) {

            return this.terrain.getHeight(
                x,
                z
            );

        }

        return 0;

    }

    // ========================================================
    // SAFE POSITION CHECK
    // ========================================================

    isSafePosition(
        x,
        z
    ) {

        if (
            !this.terrain
        ) {

            return true;

        }

        if (
            typeof this.terrain.isInsideWorld ===
            "function"
        ) {

            if (
                !this.terrain.isInsideWorld(
                    x,
                    z
                )
            ) {

                return false;

            }

        } else {

            if (
                Math.abs(x) >
                this.worldLimit ||
                Math.abs(z) >
                this.worldLimit
            ) {

                return false;

            }

        }

        const ground =
            this.getGroundHeight(
                x,
                z
            );

        // Water protection
        if (
            ground <=
            (
                Number.isFinite(
                    this.terrain.waterLevel
                )
                    ? this.terrain.waterLevel + 0.35
                    : 2.15
            )
        ) {

            return false;

        }

        // Slope protection
        if (
            typeof this.terrain.getSlopeDegrees ===
            "function"
        ) {

            const slope =
                this.terrain.getSlopeDegrees(
                    x,
                    z
                );

            if (
                slope >
                this.maxSlope
            ) {

                return false;

            }

        }

        return true;

    }

    // ========================================================
    // MOVEMENT
    // ========================================================

    tryMove(
        deltaX,
        deltaZ
    ) {

        const currentX =
            this.object.position.x;

        const currentZ =
            this.object.position.z;

        const targetX =
            currentX +
            deltaX;

        const targetZ =
            currentZ +
            deltaZ;

        // ----------------------------------------------------
        // HUGE WORLD BOUNDARY
        // ----------------------------------------------------

        if (
            this.terrain &&
            typeof this.terrain.isInsideWorld ===
            "function"
        ) {

            if (
                !this.terrain.isInsideWorld(
                    targetX,
                    targetZ
                )
            ) {

                return false;

            }

        } else {

            if (
                Math.abs(targetX) >
                this.worldLimit ||
                Math.abs(targetZ) >
                this.worldLimit
            ) {

                return false;

            }

        }

        // ----------------------------------------------------
        // FULL MOVEMENT
        // ----------------------------------------------------

        if (
            this.isSafePosition(
                targetX,
                targetZ
            )
        ) {

            this.object.position.x =
                targetX;

            this.object.position.z =
                targetZ;

            return true;

        }

        // ----------------------------------------------------
        // X SLIDE
        // ----------------------------------------------------

        if (
            this.isSafePosition(
                targetX,
                currentZ
            )
        ) {

            this.object.position.x =
                targetX;

            return true;

        }

        // ----------------------------------------------------
        // Z SLIDE
        // ----------------------------------------------------

        if (
            this.isSafePosition(
                currentX,
                targetZ
            )
        ) {

            this.object.position.z =
                targetZ;

            return true;

        }

        return false;

    }

    // ========================================================
    // JUMP
    // ========================================================

    jump() {

        if (
            !this.isGrounded
        ) {

            return false;

        }

        if (
            this.stamina < 8
        ) {

            return false;

        }

        this.velocity.y =
            this.jumpForce;

        this.isGrounded =
            false;

        this.isJumping =
            true;

        this.stamina =
            Math.max(
                0,
                this.stamina - 8
            );

        return true;

    }

    // ========================================================
    // CROUCH
    // ========================================================

    updateCrouch() {

        const crouchPressed =
            this.keys["ControlLeft"] ||
            this.keys["ControlRight"];

        this.isCrouching =
            !!crouchPressed;

        const targetScaleY =
            this.isCrouching
                ? 0.78
                : 1;

        this.bodyGroup.scale.y +=
            (
                targetScaleY -
                this.bodyGroup.scale.y
            ) *
            0.18;

    }

    // ========================================================
    // RUNNING
    // ========================================================

    updateRunning(
        deltaTime
    ) {

        const wantsRun =
            this.keys["ShiftLeft"] ||
            this.keys["ShiftRight"];

        const moving =
            this.isMoving();

        if (
            wantsRun &&
            moving &&
            !this.isCrouching &&
            this.stamina > 1
        ) {

            this.isRunning =
                true;

            this.stamina -=
                this.staminaDrain *
                deltaTime;

        } else {

            this.isRunning =
                false;

            if (
                !moving ||
                !wantsRun
            ) {

                this.stamina +=
                    this.staminaRecovery *
                    deltaTime;

            }

        }

        this.stamina =
            THREE.MathUtils.clamp(
                this.stamina,
                0,
                this.maxStamina
            );

    }

    // ========================================================
    // MOVEMENT INPUT
    // ========================================================

    getMovementInput() {

        let inputX = 0;

        let inputZ = 0;

        // ----------------------------------------------------
        // KEEP EXISTING CONTROLS
        // ----------------------------------------------------

        if (
            this.keys["KeyW"] ||
            this.keys["ArrowUp"]
        ) {

            inputZ -= 1;

        }

        if (
            this.keys["KeyS"] ||
            this.keys["ArrowDown"]
        ) {

            inputZ += 1;

        }

        if (
            this.keys["KeyA"] ||
            this.keys["ArrowLeft"]
        ) {

            inputX -= 1;

        }

        if (
            this.keys["KeyD"] ||
            this.keys["ArrowRight"]
        ) {

            inputX += 1;

        }

        const length =
            Math.hypot(
                inputX,
                inputZ
            );

        if (
            length > 0
        ) {

            inputX /=
                length;

            inputZ /=
                length;

        }

        return {

            x: inputX,

            z: inputZ,

            moving:
                length > 0

        };

    }

    // ========================================================
    // CAMERA RELATIVE MOVEMENT
    // ========================================================

    getWorldMovement(
        inputX,
        inputZ
    ) {

        const sin =
            Math.sin(
                this.cameraRotation
            );

        const cos =
            Math.cos(
                this.cameraRotation
            );

        const worldX =
            inputX * cos -
            inputZ * sin;

        const worldZ =
            inputX * sin +
            inputZ * cos;

        return {

            x: worldX,

            z: worldZ

        };

    }

    // ========================================================
    // IS MOVING
    // ========================================================

    isMoving() {

        return (
            this.keys["KeyW"] ||
            this.keys["KeyS"] ||
            this.keys["KeyA"] ||
            this.keys["KeyD"] ||
            this.keys["ArrowUp"] ||
            this.keys["ArrowDown"] ||
            this.keys["ArrowLeft"] ||
            this.keys["ArrowRight"]
        );

    }

    // ========================================================
    // MAIN UPDATE
    // ========================================================

    update(
        deltaTime,
        cameraYaw = this.cameraRotation
    ) {

        if (
            !Number.isFinite(deltaTime)
        ) {

            deltaTime = 0.016;

        }

        deltaTime =
            Math.min(
                deltaTime,
                0.05
            );

        if (
            Number.isFinite(
                cameraYaw
            )
        ) {

            this.cameraRotation =
                cameraYaw;

        }

        // ----------------------------------------------------
        // INPUT
        // ----------------------------------------------------

        const input =
            this.getMovementInput();

        this.updateRunning(
            deltaTime
        );

        this.updateCrouch();

        // ----------------------------------------------------
        // SPEED
        // ----------------------------------------------------

        let speed =
            this.isRunning
                ? this.runSpeed
                : this.walkSpeed;

        if (
            this.isCrouching
        ) {

            speed *=
                this.crouchSpeedMultiplier;

        }

        // ----------------------------------------------------
        // MOVEMENT
        // ----------------------------------------------------

        if (
            input.moving
        ) {

            const movement =
                this.getWorldMovement(
                    input.x,
                    input.z
                );

            let control =
                this.isGrounded
                    ? 1
                    : this.airControl;

            const moveX =
                movement.x *
                speed *
                control *
                deltaTime;

            const moveZ =
                movement.z *
                speed *
                control *
                deltaTime;

            this.tryMove(
                moveX,
                moveZ
            );

        }

        // ----------------------------------------------------
        // GRAVITY
        // ----------------------------------------------------

        this.velocity.y -=
            this.gravity *
            deltaTime;

        const currentX =
            this.object.position.x;

        const currentZ =
            this.object.position.z;

        let groundY =
            this.getGroundHeight(
                currentX,
                currentZ
            );

        // Player feet position
        const targetY =
            groundY;

        const nextY =
            this.object.position.y +
            this.velocity.y *
            deltaTime;

        // ----------------------------------------------------
        // GROUND COLLISION
        // ----------------------------------------------------

        if (
            nextY <= targetY
        ) {

            this.object.position.y =
                targetY;

            this.velocity.y =
                0;

            this.isGrounded =
                true;

            this.isJumping =
                false;

        } else {

            this.object.position.y =
                nextY;

            this.isGrounded =
                false;

        }

        // ----------------------------------------------------
        // FALL PROTECTION
        // ----------------------------------------------------

        if (
            this.object.position.y <
            -40
        ) {

            const safe =
                this.terrain &&
                typeof this.terrain.findSafePosition ===
                "function"
                    ? this.terrain.findSafePosition(
                        currentX,
                        currentZ,
                        100
                    )
                    : {
                        x: 0,
                        y: 5,
                        z: 0
                    };

            this.object.position.set(
                safe.x,
                safe.y,
                safe.z
            );

            this.velocity.set(
                0,
                0,
                0
            );

            this.isGrounded =
                true;

        }

        // ----------------------------------------------------
        // ANIMATION
        // ----------------------------------------------------

        this.updateAnimation(
            deltaTime,
            input.moving
        );

        // ----------------------------------------------------
        // CHUNK STREAMING
        // ----------------------------------------------------

        if (
            this.terrain &&
            typeof this.terrain.update ===
            "function"
        ) {

            this.terrain.update(
                this.object.position.x,
                this.object.position.z
            );

        }

    }

    // ========================================================
    // ANIMATION
    // ========================================================

    updateAnimation(
        deltaTime,
        moving
    ) {

        this.animationTime +=
            deltaTime;

        if (
            !moving
        ) {

            this.currentAnimation =
                "idle";

            const idle =
                Math.sin(
                    this.animationTime *
                    2
                ) *
                0.018;

            this.bodyGroup.position.y =
                idle;

            this.leftArm.rotation.x *=
                0.88;

            this.rightArm.rotation.x *=
                0.88;

            this.leftLeg.rotation.x *=
                0.88;

            this.rightLeg.rotation.x *=
                0.88;

            return;

        }

        if (
            this.isRunning
        ) {

            this.currentAnimation =
                "run";

        } else {

            this.currentAnimation =
                "walk";

        }

        const animationSpeed =
            this.isRunning
                ? 11
                : 7;

        const swing =
            Math.sin(
                this.animationTime *
                animationSpeed
            );

        const armAmount =
            this.isRunning
                ? 0.75
                : 0.45;

        const legAmount =
            this.isRunning
                ? 0.85
                : 0.55;

        this.leftArm.rotation.x =
            swing *
            armAmount;

        this.rightArm.rotation.x =
            -swing *
            armAmount;

        this.leftLeg.rotation.x =
            -swing *
            legAmount;

        this.rightLeg.rotation.x =
            swing *
            legAmount;

        this.bodyGroup.position.y =
            Math.abs(
                swing
            ) *
            (
                this.isRunning
                    ? 0.045
                    : 0.025
            );

    }

    // ========================================================
    // TELEPORT
    // ========================================================

    teleport(
        x,
        y,
        z
    ) {

        if (
            !Number.isFinite(x) ||
            !Number.isFinite(y) ||
            !Number.isFinite(z)
        ) {

            return false;

        }

        if (
            this.terrain &&
            typeof this.terrain.isInsideWorld ===
            "function"
        ) {

            if (
                !this.terrain.isInsideWorld(
                    x,
                    z
                )
            ) {

                return false;

            }

        }

        this.object.position.set(
            x,
            y,
            z
        );

        this.velocity.set(
            0,
            0,
            0
        );

        this.isGrounded =
            false;

        this.isJumping =
            false;

        return true;

    }

    // ========================================================
    // POSITION
    // ========================================================

    getPosition() {

        return {

            x:
                this.object.position.x,

            y:
                this.object.position.y,

            z:
                this.object.position.z

        };

    }

    // ========================================================
    // OBJECT
    // ========================================================

    getObject() {

        return this.object;

    }

    // ========================================================
    // DEBUG
    // ========================================================

    getDebugInfo() {

        const position =
            this.getPosition();

        let slope = 0;

        let ground = 0;

        if (
            this.terrain
        ) {

            ground =
                this.getGroundHeight(
                    position.x,
                    position.z
                );

            if (
                typeof this.terrain.getSlopeDegrees ===
                "function"
            ) {

                slope =
                    this.terrain.getSlopeDegrees(
                        position.x,
                        position.z
                    );

            }

        }

        return {

            name:
                this.name,

            x:
                position.x.toFixed(2),

            y:
                position.y.toFixed(2),

            z:
                position.z.toFixed(2),

            ground:
                ground.toFixed(2),

            slope:
                slope.toFixed(1),

            grounded:
                this.isGrounded,

            jumping:
                this.isJumping,

            running:
                this.isRunning,

            crouching:
                this.isCrouching,

            stamina:
                Math.round(
                    this.stamina
                ),

            animation:
                this.currentAnimation

        };

    }

    // ========================================================
    // DISPOSE
    // ========================================================

    dispose() {

        window.removeEventListener(
            "keydown",
            this.handleKeyDown
        );

        window.removeEventListener(
            "keyup",
            this.handleKeyUp
        );

        if (
            this.scene &&
            this.object
        ) {

            this.scene.remove(
                this.object
            );

        }

        this.scene = null;

        this.terrain = null;

        this.object = null;

        this.bodyGroup = null;

        this.velocity = null;

    }

}

// ============================================================
// END OF KIAN PLAYER SYSTEM
// ============================================================
