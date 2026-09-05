// ============================================================
// WILD ISLES
// PLAYER SYSTEM
// KIAN - HUGE WORLD MOVEMENT & REALISTIC PHYSICS
// Version 2.0 (Full Feature & Realistic Mechanics)
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

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

        // Smooth rotation & lean tracking
        this.targetRotation = Math.PI;
        this.currentRotation = Math.PI;

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
        // ANIMATION & MIXER
        // ====================================================

        this.animationTime = 0;

        this.currentAnimation = "idle";

        this.mixer = null;
        this.actions = {};

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
            "KIAN Player v2.0 REALISTIC HUGE WORLD READY"
        );
    }

    // ========================================================
    // CREATE PLAYER MODEL (REALISTIC PROCEDURAL + ACCESSORIES)
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
        // BODY / TORSO
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
        // HELPER METHOD FOR PIVOTED LIMBS (REALISTIC ROTATION)
        // ----------------------------------------------------
        const createPivotLimb = (geometry, material, pos, offset) => {
            const pivot = new THREE.Group();
            pivot.position.copy(pos);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(offset);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            pivot.add(mesh);
            this.bodyGroup.add(pivot);
            return { pivot, mesh };
        };

        // ----------------------------------------------------
        // ARMS (WITH SHOULDER PIVOTS)
        // ----------------------------------------------------

        const armGeometry =
            new THREE.BoxGeometry(
                0.32,
                1.15,
                0.34
            );

        const lArm = createPivotLimb(armGeometry, shirtMaterial, new THREE.Vector3(-0.68, 2.45, 0), new THREE.Vector3(0, -0.55, 0));
        this.leftArmPivot = lArm.pivot;
        this.leftArm = lArm.mesh;
        this.leftArmPivot.rotation.z = -0.08;

        const rArm = createPivotLimb(armGeometry, shirtMaterial, new THREE.Vector3(0.68, 2.45, 0), new THREE.Vector3(0, -0.55, 0));
        this.rightArmPivot = rArm.pivot;
        this.rightArm = rArm.mesh;
        this.rightArmPivot.rotation.z = 0.08;

        // ----------------------------------------------------
        // LEGS & BOOTS (WITH HIP PIVOTS)
        // ----------------------------------------------------

        const legGeometry =
            new THREE.BoxGeometry(
                0.38,
                1.15,
                0.42
            );

        const bootGeometry =
            new THREE.BoxGeometry(
                0.44,
                0.25,
                0.62
            );

        // Left Leg + Boot
        const lLeg = createPivotLimb(legGeometry, pantsMaterial, new THREE.Vector3(-0.25, 1.2, 0), new THREE.Vector3(0, -0.55, 0));
        this.leftLegPivot = lLeg.pivot;
        this.leftLeg = lLeg.mesh;

        this.leftBoot = new THREE.Mesh(bootGeometry, bootMaterial);
        this.leftBoot.position.set(0, -1.12, -0.08);
        this.leftBoot.castShadow = true;
        this.leftLegPivot.add(this.leftBoot);

        // Right Leg + Boot
        const rLeg = createPivotLimb(legGeometry, pantsMaterial, new THREE.Vector3(0.25, 1.2, 0), new THREE.Vector3(0, -0.55, 0));
        this.rightLegPivot = rLeg.pivot;
        this.rightLeg = rLeg.mesh;

        this.rightBoot = new THREE.Mesh(bootGeometry, bootMaterial);
        this.rightBoot.position.set(0, -1.12, -0.08);
        this.rightBoot.castShadow = true;
        this.rightLegPivot.add(this.rightBoot);

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
    // EXTERNAL GLTF MODEL LOADER (3D Realistic Models)
    // ========================================================

    loadCharacterModel(modelUrl) {
        const loader = new GLTFLoader();
        loader.load(modelUrl, (gltf) => {
            while (this.bodyGroup.children.length > 0) {
                this.bodyGroup.remove(this.bodyGroup.children[0]);
            }

            const model = gltf.scene;
            model.scale.set(1.25, 1.25, 1.25);
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            this.bodyGroup.add(model);

            if (gltf.animations && gltf.animations.length) {
                this.mixer = new THREE.AnimationMixer(model);
                gltf.animations.forEach((clip) => {
                    this.actions[clip.name.toLowerCase()] = this.mixer.clipAction(clip);
                });
            }
        });
    }

    // ========================================================
    // KEYBOARD
    // ========================================================

    setupKeyboard() {

        window.addEventListener(
            "keydown",
            (event) => {

                this.keys[event.code] = true;

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
        // MOVEMENT & REALISTIC ROTATION / LEANING
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

            // Realistic rotation target angle
            this.targetRotation = Math.atan2(movement.x, movement.z);

        }

        // Smooth Interpolation of Player Rotation Angle
        let diff = this.targetRotation - this.currentRotation;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        
        this.currentRotation += diff * 10 * deltaTime;
        this.object.rotation.y = this.currentRotation;

        // Realistic Body Leaning/Tilting while turning and moving
        const turnTilt = diff;
        this.bodyGroup.rotation.z = THREE.MathUtils.lerp(this.bodyGroup.rotation.z, -turnTilt * 0.18, 8 * deltaTime);
        this.bodyGroup.rotation.x = THREE.MathUtils.lerp(this.bodyGroup.rotation.x, input.moving ? 0.09 : 0, 8 * deltaTime);

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

        if (this.mixer) {
            this.mixer.update(deltaTime);
        } else {
            this.updateAnimation(
                deltaTime,
                input.moving
            );
        }

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

            if (this.leftArmPivot) this.leftArmPivot.rotation.x *= 0.88;
            if (this.rightArmPivot) this.rightArmPivot.rotation.x *= 0.88;
            if (this.leftLegPivot) this.leftLegPivot.rotation.x *= 0.88;
            if (this.rightLegPivot) this.rightLegPivot.rotation.x *= 0.88;

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

        if (this.leftArmPivot) this.leftArmPivot.rotation.x = swing * armAmount;
        if (this.rightArmPivot) this.rightArmPivot.rotation.x = -swing * armAmount;
        if (this.leftLegPivot) this.leftLegPivot.rotation.x = -swing * legAmount;
        if (this.rightLegPivot) this.rightLegPivot.rotation.x = swing * legAmount;

        // Step Bounce Effect
        this.bodyGroup.position.y = Math.abs(swing) * 0.05;

    }

}
