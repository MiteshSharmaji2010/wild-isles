// ============================================================
// WILD ISLES
// PLAYER SYSTEM
// KIAN - HUGE WORLD MOVEMENT & REALISTIC PHYSICS
// Version 2.2 (Complete 1800+ Lines System - Part 1)
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js";

export class Player {

    constructor(scene, terrain, camera = null, soundEngine = null, particleSystem = null) {

        this.scene = scene;
        this.terrain = terrain;
        this.camera = camera;
        this.soundEngine = soundEngine;
        this.particleSystem = particleSystem;

        // ====================================================
        // PLAYER IDENTITY & STATE
        // ====================================================

        this.name = "KIAN";

        this.height = 3.1;
        this.radius = 0.65;

        this.walkSpeed = 4.8;
        this.runSpeed = 8.0;
        this.swimSpeed = 3.2;

        this.jumpForce = 9.0;
        this.gravity = 25.0;
        this.maxSlope = 38;

        this.health = 100;
        this.maxHealth = 100;

        this.stamina = 100;
        this.maxStamina = 100;

        this.isRunning = false;
        this.isCrouching = false;
        this.isGrounded = false;
        this.isJumping = false;
        this.isSwimming = false;

        this.velocity = new THREE.Vector3(0, 0, 0);

        // Smooth rotation & lean tracking
        this.targetRotation = Math.PI;
        this.currentRotation = Math.PI;

        // ====================================================
        // WORLD LIMITS
        // ====================================================

        this.worldLimit =
            terrain && Number.isFinite(terrain.worldHalfSize)
                ? terrain.worldHalfSize - 5
                : 8180;

        // ====================================================
        // INPUT & CAMERA SETTINGS
        // ====================================================

        this.keys = {};
        this.cameraRotation = Math.PI;
        this.cameraDistance = 8.0;
        this.cameraHeight = 3.5;

        // ====================================================
        // MOVEMENT SETTINGS
        // ====================================================

        this.staminaDrain = 18;
        this.staminaRecovery = 14;
        this.crouchSpeedMultiplier = 0.48;
        this.airControl = 0.65;

        // ====================================================
        // ANIMATION & FOOTSTEPS
        // ====================================================

        this.animationTime = 0;
        this.footstepTimer = 0;
        this.footstepInterval = 0.35; // Seconds between footsteps
        this.currentAnimation = "idle";

        this.mixer = null;
        this.actions = {};

        // Audio Context Fallback
        this.audioCtx = null;

        // ====================================================
        // PLAYER OBJECT
        // ====================================================

        this.object = new THREE.Group();
        this.object.name = "KIAN_PLAYER";

        this.createPlayerModel();
        this.scene.add(this.object);

        // Setup Controls & Initial Spawn
        this.setupKeyboard();
        this.spawnPlayer();

        console.log("KIAN Player v2.2 REALISTIC HUGE WORLD READY - PART 1 LOADED");
    }

    // ========================================================
    // CREATE PLAYER MODEL (PROCEDURAL + PIVOTS)
    // ========================================================

    createPlayerModel() {
        this.bodyGroup = new THREE.Group();
        this.bodyGroup.name = "KIAN_BODY";

        // Materials
        const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xc58d6d, roughness: 0.82, metalness: 0.02 });
        const shirtMaterial = new THREE.MeshStandardMaterial({ color: 0x28343d, roughness: 0.85, metalness: 0.05 });
        const pantsMaterial = new THREE.MeshStandardMaterial({ color: 0x171b20, roughness: 0.9, metalness: 0.02 });
        const bootMaterial = new THREE.MeshStandardMaterial({ color: 0x090b0d, roughness: 0.9, metalness: 0.08 });
        const gearMaterial = new THREE.MeshStandardMaterial({ color: 0x38454b, roughness: 0.75, metalness: 0.18 });

        // Torso
        const bodyGeometry = new THREE.BoxGeometry(1.05, 1.35, 0.58);
        this.body = new THREE.Mesh(bodyGeometry, shirtMaterial);
        this.body.position.y = 1.85;
        this.body.castShadow = true;
        this.body.receiveShadow = true;
        this.bodyGroup.add(this.body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.43, 20, 16);
        this.head = new THREE.Mesh(headGeometry, skinMaterial);
        this.head.position.y = 2.85;
        this.head.castShadow = true;
        this.bodyGroup.add(this.head);

        // Hair
        const hairGeometry = new THREE.SphereGeometry(0.45, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.48);
        const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x151313, roughness: 0.9 });
        this.hair = new THREE.Mesh(hairGeometry, hairMaterial);
        this.hair.position.y = 3.02;
        this.hair.scale.set(1, 0.8, 1);
        this.hair.castShadow = true;
        this.bodyGroup.add(this.hair);

        // Helper for Pivoted Limbs
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

        // Arms
        const armGeometry = new THREE.BoxGeometry(0.32, 1.15, 0.34);
        const lArm = createPivotLimb(armGeometry, shirtMaterial, new THREE.Vector3(-0.68, 2.45, 0), new THREE.Vector3(0, -0.55, 0));
        this.leftArmPivot = lArm.pivot;
        this.leftArmPivot.rotation.z = -0.08;

        const rArm = createPivotLimb(armGeometry, shirtMaterial, new THREE.Vector3(0.68, 2.45, 0), new THREE.Vector3(0, -0.55, 0));
        this.rightArmPivot = rArm.pivot;
        this.rightArmPivot.rotation.z = 0.08;

        // Legs & Boots
        const legGeometry = new THREE.BoxGeometry(0.38, 1.15, 0.42);
        const bootGeometry = new THREE.BoxGeometry(0.44, 0.25, 0.62);

        const lLeg = createPivotLimb(legGeometry, pantsMaterial, new THREE.Vector3(-0.25, 1.2, 0), new THREE.Vector3(0, -0.55, 0));
        this.leftLegPivot = lLeg.pivot;
        this.leftBoot = new THREE.Mesh(bootGeometry, bootMaterial);
        this.leftBoot.position.set(0, -1.12, -0.08);
        this.leftBoot.castShadow = true;
        this.leftLegPivot.add(this.leftBoot);

        const rLeg = createPivotLimb(legGeometry, pantsMaterial, new THREE.Vector3(0.25, 1.2, 0), new THREE.Vector3(0, -0.55, 0));
        this.rightLegPivot = rLeg.pivot;
        this.rightBoot = new THREE.Mesh(bootGeometry, bootMaterial);
        this.rightBoot.position.set(0, -1.12, -0.08);
        this.rightBoot.castShadow = true;
        this.rightLegPivot.add(this.rightBoot);

        // Backpack & Accessories
        const backpackGeometry = new THREE.BoxGeometry(0.72, 0.9, 0.25);
        this.backpack = new THREE.Mesh(backpackGeometry, gearMaterial);
        this.backpack.position.set(0, 1.95, 0.39);
        this.backpack.castShadow = true;
        this.bodyGroup.add(this.backpack);

        this.bodyGroup.scale.set(1.25, 1.25, 1.25);
        this.object.add(this.bodyGroup);
    }

    // ========================================================
    // INPUT HANDLING
    // ========================================================

    setupKeyboard() {
        window.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;
            if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
                e.preventDefault();
            }
            if (e.code === "Space") this.jump();
            if (e.code === "ControlLeft" || e.code === "ControlRight") this.isCrouching = true;
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
            if (e.code === "ControlLeft" || e.code === "ControlRight") this.isCrouching = false;
        });

        window.addEventListener("blur", () => {
            this.keys = {};
            this.isRunning = false;
        });
    }

    // ========================================================
    // MOVEMENT & PHYSICS
    // ========================================================

    spawnPlayer() {
        let spawn = (this.terrain && typeof this.terrain.findSafePosition === "function")
            ? this.terrain.findSafePosition(0, 0, 150)
            : { x: 0, y: 5, z: 0 };

        this.object.position.set(spawn.x, spawn.y, spawn.z);
        this.velocity.set(0, 0, 0);
        this.isGrounded = true;
        this.isJumping = false;
    }

    getGroundHeight(x, z) {
        if (!this.terrain) return 0;
        if (typeof this.terrain.getGroundHeight === "function") return this.terrain.getGroundHeight(x, z);
        if (typeof this.terrain.getHeight === "function") return this.terrain.getHeight(x, z);
        return 0;
    }

    isSafePosition(x, z) {
        if (!this.terrain) return true;
        if (typeof this.terrain.isInsideWorld === "function" && !this.terrain.isInsideWorld(x, z)) return false;
        if (Math.abs(x) > this.worldLimit || Math.abs(z) > this.worldLimit) return false;

        const slope = (typeof this.terrain.getSlopeDegrees === "function") ? this.terrain.getSlopeDegrees(x, z) : 0;
        return slope <= this.maxSlope;
    }

    tryMove(deltaX, deltaZ) {
        const targetX = this.object.position.x + deltaX;
        const targetZ = this.object.position.z + deltaZ;

        let moved = false;

        if (this.isSafePosition(targetX, targetZ)) {
            this.object.position.x = targetX;
            this.object.position.z = targetZ;
            moved = true;
        } else if (this.isSafePosition(targetX, this.object.position.z)) {
            this.object.position.x = targetX;
            moved = true;
        } else if (this.isSafePosition(this.object.position.x, targetZ)) {
            this.object.position.z = targetZ;
            moved = true;
        }
        return moved;
    }

    jump() {
        if (!this.isGrounded || this.stamina < 8 || this.isSwimming) return false;
        this.velocity.y = this.jumpForce;
        this.isGrounded = false;
        this.isJumping = true;
        this.stamina = Math.max(0, this.stamina - 8);
        return true;
    }

    getMovementInput() {
        let inputX = 0, inputZ = 0;
        if (this.keys["KeyW"] || this.keys["ArrowUp"]) inputZ -= 1;
        if (this.keys["KeyS"] || this.keys["ArrowDown"]) inputZ += 1;
        if (this.keys["KeyA"] || this.keys["ArrowLeft"]) inputX -= 1;
        if (this.keys["KeyD"] || this.keys["ArrowRight"]) inputX += 1;

        const length = Math.hypot(inputX, inputZ);
        if (length > 0) {
            inputX /= length;
            inputZ /= length;
        }
        return { x: inputX, z: inputZ, moving: length > 0 };
    }// ========================================================
    // MAIN UPDATE LOOP & STATE MANAGEMENT
    // ========================================================

    update(deltaTime = 0.016, cameraYaw = this.cameraRotation) {
        deltaTime = Math.min(deltaTime, 0.05);
        this.cameraRotation = Number.isFinite(cameraYaw) ? cameraYaw : this.cameraRotation;

        const input = this.getMovementInput();

        // Stamina & Running logic
        const wantsRun = this.keys["ShiftLeft"] || this.keys["ShiftRight"];
        if (wantsRun && input.moving && !this.isCrouching && this.stamina > 1) {
            this.isRunning = true;
            this.stamina -= this.staminaDrain * deltaTime;
        } else {
            this.isRunning = false;
            if (!input.moving || !wantsRun) this.stamina += this.staminaRecovery * deltaTime;
        }
        this.stamina = THREE.MathUtils.clamp(this.stamina, 0, this.maxStamina);

        // Crouch scaling
        const targetScaleY = this.isCrouching ? 0.78 : 1;
        this.bodyGroup.scale.y += (targetScaleY - this.bodyGroup.scale.y) * 0.18;

        // Speed calculation
        let speed = this.isRunning ? this.runSpeed : this.walkSpeed;
        if (this.isCrouching) speed *= this.crouchSpeedMultiplier;

        // Movement Execution
        if (input.moving) {
            const sin = Math.sin(this.cameraRotation);
            const cos = Math.cos(this.cameraRotation);
            const worldX = input.x * cos - input.z * sin;
            const worldZ = input.x * sin + input.z * cos;

            const control = this.isGrounded ? 1 : this.airControl;
            this.tryMove(worldX * speed * control * deltaTime, worldZ * speed * control * deltaTime);

            this.targetRotation = Math.atan2(worldX, worldZ);

            // Footstep audio trigger timer
            if (this.isGrounded) {
                this.footstepTimer += deltaTime;
                const interval = this.isRunning ? this.footstepInterval * 0.65 : this.footstepInterval;
                if (this.footstepTimer >= interval) {
                    this.playFootstepSound();
                    this.footstepTimer = 0;
                }
            }
        } else {
            this.footstepTimer = 0;
        }

        // Smooth Character Turning & Leaning
        let diff = this.targetRotation - this.currentRotation;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.currentRotation += diff * 10 * deltaTime;
        this.object.rotation.y = this.currentRotation;

        this.bodyGroup.rotation.z = THREE.MathUtils.lerp(this.bodyGroup.rotation.z, -diff * 0.18, 8 * deltaTime);
        this.bodyGroup.rotation.x = THREE.MathUtils.lerp(this.bodyGroup.rotation.x, input.moving ? 0.09 : 0, 8 * deltaTime);

        // Ground, Water & Gravity Check
        const groundY = this.getGroundHeight(this.object.position.x, this.object.position.z);
        const waterLevel = (this.terrain && Number.isFinite(this.terrain.waterLevel)) ? this.terrain.waterLevel : 0;

        // Water Detection (Swimming Mechanics)
        if (groundY < waterLevel && this.object.position.y <= waterLevel + 0.2) {
            this.isSwimming = true;
            this.velocity.y = Math.sin(this.animationTime * 3) * 0.2; // Float effect
            this.object.position.y = THREE.MathUtils.lerp(this.object.position.y, waterLevel - 0.2, 5 * deltaTime);
            this.isGrounded = false;
            
            if (this.particleSystem && typeof this.particleSystem.spawnWaterRipples === "function" && input.moving) {
                this.particleSystem.spawnWaterRipples(this.object.position);
            }
        } else {
            this.isSwimming = false;
            this.velocity.y -= this.gravity * deltaTime;
            const nextY = this.object.position.y + this.velocity.y * deltaTime;

            if (nextY <= groundY) {
                this.object.position.y = groundY;
                this.velocity.y = 0;
                this.isGrounded = true;
                this.isJumping = false;
            } else {
                this.object.position.y = nextY;
                this.isGrounded = false;
            }
        }

        // Procedural Limb Animation
        this.updateProceduralAnimation(deltaTime, input.moving);

        // Update Camera Position
        this.updateThirdPersonCamera(deltaTime);

        // Chunk Streaming Trigger
        if (this.terrain && typeof this.terrain.update === "function") {
            this.terrain.update(this.object.position.x, this.object.position.z);
        }
    }// ========================================================
    // PROCEDURAL ANIMATION & ADVANCED LIMB KINEMATICS
    // ========================================================

    updateProceduralAnimation(deltaTime, moving) {
        this.animationTime += deltaTime * (this.isRunning ? 12 : 7);

        if (moving && this.isGrounded) {
            const swing = Math.sin(this.animationTime) * 0.65;
            if (this.leftArmPivot) this.leftArmPivot.rotation.x = -swing;
            if (this.rightArmPivot) this.rightArmPivot.rotation.x = swing;
            if (this.leftLegPivot) this.leftLegPivot.rotation.x = swing;
            if (this.rightLegPivot) this.rightLegPivot.rotation.x = -swing;
        } else if (this.isSwimming) {
            const swimSwing = Math.sin(this.animationTime * 0.8) * 0.85;
            if (this.leftArmPivot) this.leftArmPivot.rotation.x = -swimSwing;
            if (this.rightArmPivot) this.rightArmPivot.rotation.x = swimSwing;
            if (this.leftLegPivot) this.leftLegPivot.rotation.x = swimSwing * 0.5;
            if (this.rightLegPivot) this.rightLegPivot.rotation.x = -swimSwing * 0.5;
        } else {
            // Idle state & smooth limb dampening
            const idle = Math.sin(this.animationTime * 0.2) * 0.018;
            if (this.bodyGroup) this.bodyGroup.position.y = idle;
            if (this.leftArmPivot) this.leftArmPivot.rotation.x = THREE.MathUtils.lerp(this.leftArmPivot.rotation.x, 0, 10 * deltaTime);
            if (this.rightArmPivot) this.rightArmPivot.rotation.x = THREE.MathUtils.lerp(this.rightArmPivot.rotation.x, 0, 10 * deltaTime);
            if (this.leftLegPivot) this.leftLegPivot.rotation.x = THREE.MathUtils.lerp(this.leftLegPivot.rotation.x, 0, 10 * deltaTime);
            if (this.rightLegPivot) this.rightLegPivot.rotation.x = THREE.MathUtils.lerp(this.rightLegPivot.rotation.x, 0, 10 * deltaTime);
        }
    }

    // ========================================================
    // AUDIO ENGINE & FOOTSTEP SYNTHESIS
    // ========================================================

    playFootstepSound() {
        if (this.soundEngine && typeof this.soundEngine.playFootstep === "function") {
            this.soundEngine.playFootstep(this.object.position);
            return;
        }

        // Procedural WebAudio Synthesis
        try {
            if (!this.audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) this.audioCtx = new AudioContext();
            }
            if (this.audioCtx && this.audioCtx.state === "running") {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(120, this.audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.start();
                osc.stop(this.audioCtx.currentTime + 0.08);
            }
        } catch (e) {
            // Mute fallback
        }

        // Trigger Dust Particles on Footstep
        if (this.particleSystem && typeof this.particleSystem.spawnDust === "function") {
            this.particleSystem.spawnDust(this.object.position);
        }
    }

    // ========================================================
    // THIRD PERSON CAMERA FOLLOW SYSTEM
    // ========================================================

    updateThirdPersonCamera(deltaTime) {
        if (!this.camera) return;

        const targetPos = this.object.position.clone().add(new THREE.Vector3(0, this.cameraHeight, 0));
        const offset = new THREE.Vector3(
            Math.sin(this.cameraRotation) * this.cameraDistance,
            0,
            Math.cos(this.cameraRotation) * this.cameraDistance
        );

        const desiredCameraPos = targetPos.clone().add(offset);
        this.camera.position.lerp(desiredCameraPos, 10 * deltaTime);
        this.camera.lookAt(targetPos);
    }
}// ========================================================
    // PROCEDURAL ANIMATION & ADVANCED LIMB KINEMATICS
    // ========================================================

    updateProceduralAnimation(deltaTime, moving) {
        this.animationTime += deltaTime * (this.isRunning ? 12 : 7);

        if (moving && this.isGrounded) {
            const swing = Math.sin(this.animationTime) * 0.65;
            if (this.leftArmPivot) this.leftArmPivot.rotation.x = -swing;
            if (this.rightArmPivot) this.rightArmPivot.rotation.x = swing;
            if (this.leftLegPivot) this.leftLegPivot.rotation.x = swing;
            if (this.rightLegPivot) this.rightLegPivot.rotation.x = -swing;
        } else if (this.isSwimming) {
            const swimSwing = Math.sin(this.animationTime * 0.8) * 0.85;
            if (this.leftArmPivot) this.leftArmPivot.rotation.x = -swimSwing;
            if (this.rightArmPivot) this.rightArmPivot.rotation.x = swimSwing;
            if (this.leftLegPivot) this.leftLegPivot.rotation.x = swimSwing * 0.5;
            if (this.rightLegPivot) this.rightLegPivot.rotation.x = -swimSwing * 0.5;
        } else {
            // Idle state & smooth limb dampening
            const idle = Math.sin(this.animationTime * 0.2) * 0.018;
            if (this.bodyGroup) this.bodyGroup.position.y = idle;
            if (this.leftArmPivot) this.leftArmPivot.rotation.x = THREE.MathUtils.lerp(this.leftArmPivot.rotation.x, 0, 10 * deltaTime);
            if (this.rightArmPivot) this.rightArmPivot.rotation.x = THREE.MathUtils.lerp(this.rightArmPivot.rotation.x, 0, 10 * deltaTime);
            if (this.leftLegPivot) this.leftLegPivot.rotation.x = THREE.MathUtils.lerp(this.leftLegPivot.rotation.x, 0, 10 * deltaTime);
            if (this.rightLegPivot) this.rightLegPivot.rotation.x = THREE.MathUtils.lerp(this.rightLegPivot.rotation.x, 0, 10 * deltaTime);
        }
    }

    // ========================================================
    // AUDIO ENGINE & FOOTSTEP SYNTHESIS
    // ========================================================

    playFootstepSound() {
        if (this.soundEngine && typeof this.soundEngine.playFootstep === "function") {
            this.soundEngine.playFootstep(this.object.position);
            return;
        }

        // Procedural WebAudio Synthesis
        try {
            if (!this.audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) this.audioCtx = new AudioContext();
            }
            if (this.audioCtx && this.audioCtx.state === "running") {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(120, this.audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.start();
                osc.stop(this.audioCtx.currentTime + 0.08);
            }
        } catch (e) {
            // Mute fallback
        }

        // Trigger Dust Particles on Footstep
        if (this.particleSystem && typeof this.particleSystem.spawnDust === "function") {
            this.particleSystem.spawnDust(this.object.position);
        }
    }

    // ========================================================
    // THIRD PERSON CAMERA FOLLOW SYSTEM
    // ========================================================

    updateThirdPersonCamera(deltaTime) {
        if (!this.camera) return;

        const targetPos = this.object.position.clone().add(new THREE.Vector3(0, this.cameraHeight, 0));
        const offset = new THREE.Vector3(
            Math.sin(this.cameraRotation) * this.cameraDistance,
            0,
            Math.cos(this.cameraRotation) * this.cameraDistance
        );

        const desiredCameraPos = targetPos.clone().add(offset);
        this.camera.position.lerp(desiredCameraPos, 10 * deltaTime);
        this.camera.lookAt(targetPos);
    }
}v// ============================================================
// WILD ISLES GAME ENGINE & WORLD SYSTEMS
// WORLD TERRAIN, PROCEDURAL FOLIAGE & ATMOSPHERE
// ============================================================

export class WorldTerrain {
    constructor(scene) {
        this.scene = scene;
        this.worldHalfSize = 8192;
        this.waterLevel = 1.2;

        const geometry = new THREE.PlaneGeometry(2000, 2000, 128, 128);
        geometry.rotateX(-Math.PI / 2);

        const pos = geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            const y = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 8 + Math.sin(x * 0.05) * 2;
            pos.setY(i, y);
        }
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: 0x3b7a57,
            roughness: 0.9,
            metalness: 0.1
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);

        // Water Plane
        const waterGeo = new THREE.PlaneGeometry(2000, 2000);
        waterGeo.rotateX(-Math.PI / 2);
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x006994,
            transparent: true,
            opacity: 0.7,
            roughness: 0.1
        });
        this.water = new THREE.Mesh(waterGeo, waterMat);
        this.water.position.y = this.waterLevel;
        this.scene.add(this.water);
    }

    getGroundHeight(x, z) {
        return Math.sin(x * 0.01) * Math.cos(z * 0.01) * 8 + Math.sin(x * 0.05) * 2;
    }

    getSlopeDegrees(x, z) {
        const h1 = this.getGroundHeight(x, z);
        const h2 = this.getGroundHeight(x + 0.1, z);
        return Math.abs(h2 - h1) * 100;
    }

    findSafePosition(x, z, radius) {
        return { x: x, y: this.getGroundHeight(x, z) + 3, z: z };
    }

    isInsideWorld(x, z) {
        return Math.abs(x) < this.worldHalfSize && Math.abs(z) < this.worldHalfSize;
    }

    update(playerX, playerZ) {
        if (this.mesh) {
            this.mesh.position.x = Math.floor(playerX / 50) * 50;
            this.mesh.position.z = Math.floor(playerZ / 50) * 50;
        }
    }
}

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
    }

    spawnDust(pos) {
        // Dust particle visual effect
    }

    spawnWaterRipples(pos) {
        // Water splash visual effect
    }

    update(deltaTime) {}
}

export class SoundEngine {
    playFootstep(pos) {}
}
