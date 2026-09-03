// ============================================================
// WILD ISLES
// public/js/player.js
// KIAN PLAYER CONTROLLER v0.9
// ============================================================

import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


export class Player {

    constructor(scene, terrain) {

        this.scene = scene;
        this.terrain = terrain;

        // ====================================================
        // PLAYER SETTINGS
        // ====================================================

        this.height = 3.1;
        this.radius = 0.65;

        this.walkSpeed = 4.8;
        this.runSpeed = 8.0;

        this.jumpForce = 9.0;
        this.gravity = 25.0;

        this.maxSlope = 38;

        this.worldLimit = 410;

        // ====================================================
        // PLAYER STATS
        // ====================================================

        this.health = 100;
        this.maxHealth = 100;

        this.stamina = 100;
        this.maxStamina = 100;

        this.staminaDrain = 22;
        this.staminaRecovery = 16;

        // ====================================================
        // MOVEMENT
        // ====================================================

        this.velocity = new THREE.Vector3();

        this.moveDirection = new THREE.Vector3();

        this.cameraRotation = 0;

        this.isGrounded = false;
        this.isRunning = false;
        this.isCrouching = false;

        // ====================================================
        // INPUT
        // ====================================================

        this.keys = {};

        this.setupKeyboard();

        // ====================================================
        // PLAYER OBJECT
        // ====================================================

        this.object = new THREE.Group();

        this.object.name = "KIAN";

        this.createPlayerModel();

        this.scene.add(this.object);

        // ====================================================
        // SPAWN
        // ====================================================

        this.spawnPlayer();

        console.log("Kian Player v0.9 READY");
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
                    event.code === "Space" &&
                    !event.repeat
                ) {

                    this.jump();
                }

                if (
                    event.code === "ShiftLeft" ||
                    event.code === "ShiftRight"
                ) {

                    this.isRunning = true;
                }
            }
        );


        window.addEventListener(
            "keyup",
            (event) => {

                this.keys[event.code] = false;

                if (
                    event.code === "ShiftLeft" ||
                    event.code === "ShiftRight"
                ) {

                    this.isRunning = false;
                }
            }
        );
    }


    // ========================================================
    // PLAYER MODEL
    // ========================================================

    createPlayerModel() {

        const root = new THREE.Group();

        root.scale.set(
            1.25,
            1.25,
            1.25
        );


        // ====================================================
        // MATERIALS
        // ====================================================

        const skinMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xc58b68,
                roughness: 0.8
            });


        const hairMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x17120f,
                roughness: 0.9
            });


        const shirtMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x26352f,
                roughness: 0.85
            });


        const pantsMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x20252a,
                roughness: 0.9
            });


        const bootMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x161616,
                roughness: 0.95
            });


        const backpackMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x3c463d,
                roughness: 0.9
            });


        // ====================================================
        // HEAD
        // ====================================================

        const headGeometry =
            new THREE.SphereGeometry(
                0.38,
                16,
                12
            );

        const head =
            new THREE.Mesh(
                headGeometry,
                skinMaterial
            );

        head.position.y = 2.65;

        head.castShadow = true;

        root.add(head);


        // ====================================================
        // HAIR
        // ====================================================

        const hairGeometry =
            new THREE.SphereGeometry(
                0.40,
                16,
                8,
                0,
                Math.PI * 2,
                0,
                Math.PI * 0.48
            );

        const hair =
            new THREE.Mesh(
                hairGeometry,
                hairMaterial
            );

        hair.position.y = 2.80;

        hair.castShadow = true;

        root.add(hair);


        // ====================================================
        // BODY
        // ====================================================

        const bodyGeometry =
            new THREE.BoxGeometry(
                0.85,
                1.15,
                0.48
            );

        const body =
            new THREE.Mesh(
                bodyGeometry,
                shirtMaterial
            );

        body.position.y = 1.75;

        body.castShadow = true;

        root.add(body);


        // ====================================================
        // LEFT ARM
        // ====================================================

        const armGeometry =
            new THREE.BoxGeometry(
                0.25,
                0.95,
                0.25
            );


        const leftArm =
            new THREE.Mesh(
                armGeometry,
                shirtMaterial
            );

        leftArm.position.set(
            -0.58,
            1.78,
            0
        );

        leftArm.rotation.z = -0.08;

        leftArm.castShadow = true;

        root.add(leftArm);


        // ====================================================
        // RIGHT ARM
        // ====================================================

        const rightArm =
            new THREE.Mesh(
                armGeometry,
                shirtMaterial
            );

        rightArm.position.set(
            0.58,
            1.78,
            0
        );

        rightArm.rotation.z = 0.08;

        rightArm.castShadow = true;

        root.add(rightArm);


        // ====================================================
        // HANDS
        // ====================================================

        const handGeometry =
            new THREE.SphereGeometry(
                0.14,
                10,
                8
            );


        const leftHand =
            new THREE.Mesh(
                handGeometry,
                skinMaterial
            );

        leftHand.position.set(
            -0.62,
            1.25,
            0
        );

        leftHand.castShadow = true;

        root.add(leftHand);


        const rightHand =
            new THREE.Mesh(
                handGeometry,
                skinMaterial
            );

        rightHand.position.set(
            0.62,
            1.25,
            0
        );

        rightHand.castShadow = true;

        root.add(rightHand);


        // ====================================================
        // LEGS
        // ====================================================

        const legGeometry =
            new THREE.BoxGeometry(
                0.30,
                1.05,
                0.32
            );


        const leftLeg =
            new THREE.Mesh(
                legGeometry,
                pantsMaterial
            );

        leftLeg.position.set(
            -0.22,
            0.85,
            0
        );

        leftLeg.castShadow = true;

        root.add(leftLeg);


        const rightLeg =
            new THREE.Mesh(
                legGeometry,
                pantsMaterial
            );

        rightLeg.position.set(
            0.22,
            0.85,
            0
        );

        rightLeg.castShadow = true;

        root.add(rightLeg);


        // ====================================================
        // BOOTS
        // ====================================================

        const bootGeometry =
            new THREE.BoxGeometry(
                0.36,
                0.25,
                0.55
            );


        const leftBoot =
            new THREE.Mesh(
                bootGeometry,
                bootMaterial
            );

        leftBoot.position.set(
            -0.22,
            0.28,
            0.08
        );

        leftBoot.castShadow = true;

        root.add(leftBoot);


        const rightBoot =
            new THREE.Mesh(
                bootGeometry,
                bootMaterial
            );

        rightBoot.position.set(
            0.22,
            0.28,
            0.08
        );

        rightBoot.castShadow = true;

        root.add(rightBoot);


        // ====================================================
        // BACKPACK
        // ====================================================

        const backpackGeometry =
            new THREE.BoxGeometry(
                0.65,
                0.85,
                0.28
            );

        const backpack =
            new THREE.Mesh(
                backpackGeometry,
                backpackMaterial
            );

        backpack.position.set(
            0,
            1.75,
            -0.38
        );

        backpack.castShadow = true;

        root.add(backpack);


        // ====================================================
        // PLAYER SHADOW
        // ====================================================

        const shadowGeometry =
            new THREE.CircleGeometry(
                0.75,
                20
            );

        const shadowMaterial =
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.28,
                depthWrite: false
            });

        this.shadow =
            new THREE.Mesh(
                shadowGeometry,
                shadowMaterial
            );

        this.shadow.rotation.x =
            -Math.PI / 2;

        this.shadow.position.y =
            0.03;

        this.object.add(
            this.shadow
        );


        this.model = root;

        this.object.add(root);
    }


    // ========================================================
    // SPAWN
    // ========================================================

    spawnPlayer() {

        let spawn = null;

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
        }


        if (!spawn) {

            spawn = {
                x: 0,
                y: 10,
                z: 0
            };
        }


        this.object.position.set(
            spawn.x,
            spawn.y,
            spawn.z
        );


        const ground =
            this.getGroundHeight(
                spawn.x,
                spawn.z
            );


        if (Number.isFinite(ground)) {

            this.object.position.y =
                ground;
        }
    }


    // ========================================================
    // CAMERA ROTATION
    // ========================================================

    setCameraRotation(rotation) {

        this.cameraRotation =
            rotation || 0;
    }


    // ========================================================
    // GROUND HEIGHT
    // ========================================================

    getGroundHeight(x, z) {

        if (
            this.terrain &&
            typeof this.terrain.getGroundHeight ===
            "function"
        ) {

            const height =
                this.terrain.getGroundHeight(
                    x,
                    z
                );

            if (Number.isFinite(height)) {
                return height;
            }
        }

        return this.object.position.y;
    }


    // ========================================================
    // SAFE POSITION
    // ========================================================

    isSafePosition(x, z) {

        if (
            Math.abs(x) >
            this.worldLimit ||
            Math.abs(z) >
            this.worldLimit
        ) {

            return false;
        }


        const ground =
            this.getGroundHeight(
                x,
                z
            );


        if (!Number.isFinite(ground)) {
            return false;
        }


        // Water protection

        if (ground <= 1.8) {
            return false;
        }


        if (
            this.terrain &&
            typeof this.terrain.isWalkable ===
            "function"
        ) {

            if (
                !this.terrain.isWalkable(
                    x,
                    z
                )
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
        directionX,
        directionZ,
        distance
    ) {

        if (
            Math.abs(directionX) < 0.0001 &&
            Math.abs(directionZ) < 0.0001
        ) {

            return;
        }


        const length =
            Math.sqrt(
                directionX * directionX +
                directionZ * directionZ
            );


        directionX /= length;
        directionZ /= length;


        const nextX =
            this.object.position.x +
            directionX * distance;


        const nextZ =
            this.object.position.z +
            directionZ * distance;


        if (
            !this.isSafePosition(
                nextX,
                nextZ
            )
        ) {

            return;
        }


        const ground =
            this.getGroundHeight(
                nextX,
                nextZ
            );


        if (
            Number.isFinite(ground)
        ) {

            const currentGround =
                this.getGroundHeight(
                    this.object.position.x,
                    this.object.position.z
                );


            const heightDifference =
                ground - currentGround;


            // Prevent very steep sudden movement

            if (
                Math.abs(heightDifference) >
                1.5
            ) {

                return;
            }


            this.object.position.x =
                nextX;

            this.object.position.z =
                nextZ;


            if (this.isGrounded) {

                this.object.position.y =
                    ground;
            }
        }
    }


    // ========================================================
    // JUMP
    // ========================================================

    jump() {

        if (!this.isGrounded) {
            return;
        }


        if (this.stamina < 8) {
            return;
        }


        this.velocity.y =
            this.jumpForce;


        this.isGrounded =
            false;


        this.stamina -= 8;
    }


    // ========================================================
    // UPDATE
    // ========================================================

    update(
        deltaTime,
        cameraRotation = 0
    ) {

        if (!Number.isFinite(deltaTime)) {
            deltaTime = 0.016;
        }


        deltaTime =
            Math.min(
                deltaTime,
                0.05
            );


        this.cameraRotation =
            cameraRotation;


        // ====================================================
        // INPUT
        // ====================================================

        let inputX = 0;
        let inputZ = 0;


        // W = FORWARD

        if (
            this.keys["KeyW"] ||
            this.keys["ArrowUp"]
        ) {

            inputZ -= 1;
        }


        // S = BACKWARD

        if (
            this.keys["KeyS"] ||
            this.keys["ArrowDown"]
        ) {

            inputZ += 1;
        }


        // A = LEFT

        if (
            this.keys["KeyA"] ||
            this.keys["ArrowLeft"]
        ) {

            inputX -= 1;
        }


        // D = RIGHT

        if (
            this.keys["KeyD"] ||
            this.keys["ArrowRight"]
        ) {

            inputX += 1;
        }


        const inputLength =
            Math.sqrt(
                inputX * inputX +
                inputZ * inputZ
            );


        const moving =
            inputLength > 0;


        if (moving) {

            inputX /= inputLength;
            inputZ /= inputLength;
        }


        // ====================================================
        // RUN
        // ====================================================

        const wantsRun =
            (
                this.keys["ShiftLeft"] ||
                this.keys["ShiftRight"]
            ) &&
            moving &&
            this.stamina > 1 &&
            !this.isCrouching;


        this.isRunning =
            wantsRun;


        let speed =
            this.isRunning
                ? this.runSpeed
                : this.walkSpeed;


        if (this.isCrouching) {
            speed *= 0.5;
        }


        // ====================================================
        // CAMERA-RELATIVE MOVEMENT
        // ====================================================

        if (moving) {

            const sin =
                Math.sin(
                    this.cameraRotation
                );

            const cos =
                Math.cos(
                    this.cameraRotation
                );


            // Forward vector relative to camera

            const worldX =
                inputX * cos -
                inputZ * sin;


            const worldZ =
                inputX * sin +
                inputZ * cos;


            this.moveDirection.set(
                worldX,
                0,
                worldZ
            );


            this.tryMove(
                worldX,
                worldZ,
                speed * deltaTime
            );


            // Character faces movement direction

            const targetRotation =
                Math.atan2(
                    worldX,
                    worldZ
                );


            let rotationDifference =
                targetRotation -
                this.object.rotation.y;


            while (
                rotationDifference >
                Math.PI
            ) {

                rotationDifference -=
                    Math.PI * 2;
            }


            while (
                rotationDifference <
                -Math.PI
            ) {

                rotationDifference +=
                    Math.PI * 2;
            }


            this.object.rotation.y +=
                rotationDifference *
                Math.min(
                    1,
                    deltaTime * 10
                );
        }


        // ====================================================
        // STAMINA
        // ====================================================

        if (this.isRunning) {

            this.stamina -=
                this.staminaDrain *
                deltaTime;

        } else {

            this.stamina +=
                this.staminaRecovery *
                deltaTime;
        }


        this.stamina =
            THREE.MathUtils.clamp(
                this.stamina,
                0,
                this.maxStamina
            );


        // ====================================================
        // GRAVITY
        // ====================================================

        this.velocity.y -=
            this.gravity *
            deltaTime;


        this.object.position.y +=
            this.velocity.y *
            deltaTime;


        // ====================================================
        // GROUND COLLISION
        // ====================================================

        const ground =
            this.getGroundHeight(
                this.object.position.x,
                this.object.position.z
            );


        if (
            Number.isFinite(ground)
        ) {

            if (
                this.object.position.y <=
                ground
            ) {

                this.object.position.y =
                    ground;


                this.velocity.y = 0;

                this.isGrounded =
                    true;

            } else {

                this.isGrounded =
                    false;
            }
        }


        // ====================================================
        // WATER SAFETY
        // ====================================================

        if (
            this.object.position.y <
            1.85
        ) {

            const safe =
                this.terrain.findSafePosition(
                    this.object.position.x,
                    this.object.position.z,
                    80
                );


            if (safe) {

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
            }
        }


        // ====================================================
        // WORLD LIMIT
        // ====================================================

        this.object.position.x =
            THREE.MathUtils.clamp(
                this.object.position.x,
                -this.worldLimit,
                this.worldLimit
            );


        this.object.position.z =
            THREE.MathUtils.clamp(
                this.object.position.z,
                -this.worldLimit,
                this.worldLimit
            );


        this.updateAnimation(
            deltaTime,
            moving
        );
    }


    // ========================================================
    // SIMPLE CHARACTER ANIMATION
    // ========================================================

    updateAnimation(
        deltaTime,
        moving
    ) {

        if (!this.model) {
            return;
        }


        if (!moving) {

            this.model.position.y =
                0;

            return;
        }


        const speed =
            this.isRunning
                ? 10
                : 7;


        const time =
            performance.now() *
            0.001 *
            speed;


        const swing =
            Math.sin(time) *
            0.35;


        const children =
            this.model.children;


        // Approximate leg/arm animation

        if (children[6]) {
            children[6].rotation.x =
                swing;
        }

        if (children[7]) {
            children[7].rotation.x =
                -swing;
        }
    }


    // ========================================================
    // TELEPORT
    // ========================================================

    teleport(
        x,
        z
    ) {

        if (
            !this.isSafePosition(
                x,
                z
            )
        ) {

            return false;
        }


        const ground =
            this.getGroundHeight(
                x,
                z
            );


        this.object.position.set(
            x,
            ground,
            z
        );


        this.velocity.set(
            0,
            0,
            0
        );


        return true;
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


    // ========================================================
    // DEBUG
    // ========================================================

    getDebugInfo() {

        let slope = 0;

        if (
            this.terrain &&
            typeof this.terrain.getSlopeDegrees ===
            "function"
        ) {

            slope =
                this.terrain.getSlopeDegrees(
                    this.object.position.x,
                    this.object.position.z
                );
        }


        return {

            x:
                this.object.position.x.toFixed(1),

            y:
                this.object.position.y.toFixed(1),

            z:
                this.object.position.z.toFixed(1),

            slope:
                Number.isFinite(slope)
                    ? slope.toFixed(1)
                    : "0.0",

            health:
                Math.round(
                    this.health
                ),

            stamina:
                Math.round(
                    this.stamina
                ),

            grounded:
                this.isGrounded,

            running:
                this.isRunning
        };
    }


    // ========================================================
    // DISPOSE
    // ========================================================

    dispose() {

        if (!this.object) {
            return;
        }


        this.scene.remove(
            this.object
        );


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
                            material =>
                                material.dispose()
                        );

                    } else {

                        child.material.dispose();
                    }
                }
            }
        );


        this.object = null;
    }
}
