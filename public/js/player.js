// ============================================================
// WILD ISLES
// VEYRA ISLAND
// PLAYER SYSTEM v0.6
//
// KIAN
// Movement
// Mountain Collision
// Slope Collision
// Gravity
// Jump
// Sprint
// Island Boundary
// ============================================================

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class Player {

    constructor(scene, terrain) {

        this.scene = scene;
        this.terrain = terrain;

        // ====================================================
        // PLAYER OBJECT
        // ====================================================

        this.object = new THREE.Group();
        this.object.name = "Kian";

        this.scene.add(this.object);

        // ====================================================
        // PLAYER SETTINGS
        // ====================================================

        this.height = 1.8;
        this.radius = 0.65;

        this.walkSpeed = 4.2;
        this.runSpeed = 7.0;

        this.jumpForce = 8.5;
        this.gravity = 24;

        this.verticalVelocity = 0;

        this.onGround = false;

        this.crouching = false;
        this.running = false;

        // Maximum climbable slope
        this.maxSlopeDegrees = 38;

        this.maxSlope =
            THREE.MathUtils.degToRad(
                this.maxSlopeDegrees
            );

        // ====================================================
        // COLLISION SETTINGS
        // ====================================================

        this.collisionRadius = 0.72;

        this.collisionSamples = 12;

        this.collisionDistance = 0.9;

        this.maxStepHeight = 0.65;

        this.maxDropHeight = 3.0;

        // ====================================================
        // ISLAND BOUNDARY
        // ====================================================

        this.worldLimit = 420;

        // ====================================================
        // MOVEMENT INPUT
        // ====================================================

        this.keys = {

            forward: false,
            backward: false,
            left: false,
            right: false,
            run: false,
            jump: false
        };

        // ====================================================
        // MOVEMENT VECTOR
        // ====================================================

        this.velocity =
            new THREE.Vector3();

        this.moveDirection =
            new THREE.Vector3();

        this.forward =
            new THREE.Vector3();

        this.right =
            new THREE.Vector3();

        // ====================================================
        // TEMP VECTORS
        // ====================================================

        this.testPosition =
            new THREE.Vector3();

        this.safePosition =
            new THREE.Vector3();

        // ====================================================
        // CREATE PLAYER
        // ====================================================

        this.createModel();

        // ====================================================
        // START POSITION
        // ====================================================

        this.spawn();

        // ====================================================
        // KEYBOARD
        // ====================================================

        this.setupKeyboard();

        console.log(
            "Kian Player v0.6 READY"
        );
    }

    // ========================================================
    // CREATE PLAYER MODEL
    // ========================================================

    createModel() {

        // ----------------------------------------------------
        // MATERIALS
        // ----------------------------------------------------

        const bodyMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x26332c,
                roughness: 0.82,
                metalness: 0.05
            });

        const shirtMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x3d5548,
                roughness: 0.88
            });

        const skinMaterial =
            new THREE.MeshStandardMaterial({
                color: 0xc78f68,
                roughness: 0.82
            });

        const darkMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x151b18,
                roughness: 0.92
            });

        // ----------------------------------------------------
        // BODY
        // ----------------------------------------------------

        const body =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    0.34,
                    0.82,
                    6,
                    12
                ),
                shirtMaterial
            );

        body.position.y = 0.92;

        body.castShadow = true;

        this.object.add(body);

        // ----------------------------------------------------
        // HEAD
        // ----------------------------------------------------

        const head =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.27,
                    12,
                    10
                ),
                skinMaterial
            );

        head.position.y = 1.62;

        head.castShadow = true;

        this.object.add(head);

        // ----------------------------------------------------
        // HAIR
        // ----------------------------------------------------

        const hair =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.285,
                    12,
                    8,
                    0,
                    Math.PI * 2,
                    0,
                    Math.PI * 0.52
                ),
                darkMaterial
            );

        hair.position.y = 1.70;

        hair.castShadow = true;

        this.object.add(hair);

        // ----------------------------------------------------
        // BACKPACK
        // ----------------------------------------------------

        const backpack =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.48,
                    0.60,
                    0.20
                ),
                bodyMaterial
            );

        backpack.position.set(
            0,
            1.02,
            0.31
        );

        backpack.castShadow = true;

        this.object.add(
            backpack
        );

        // ----------------------------------------------------
        // LEFT ARM
        // ----------------------------------------------------

        const leftArm =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    0.105,
                    0.48,
                    5,
                    8
                ),
                shirtMaterial
            );

        leftArm.position.set(
            -0.43,
            0.98,
            0
        );

        leftArm.rotation.z =
            -0.08;

        leftArm.castShadow = true;

        this.object.add(
            leftArm
        );

        // ----------------------------------------------------
        // RIGHT ARM
        // ----------------------------------------------------

        const rightArm =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    0.105,
                    0.48,
                    5,
                    8
                ),
                shirtMaterial
            );

        rightArm.position.set(
            0.43,
            0.98,
            0
        );

        rightArm.rotation.z =
            0.08;

        rightArm.castShadow = true;

        this.object.add(
            rightArm
        );

        // ----------------------------------------------------
        // LEGS
        // ----------------------------------------------------

        const leftLeg =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    0.13,
                    0.62,
                    5,
                    8
                ),
                darkMaterial
            );

        leftLeg.position.set(
            -0.18,
            0.42,
            0
        );

        leftLeg.castShadow = true;

        this.object.add(
            leftLeg
        );

        const rightLeg =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    0.13,
                    0.62,
                    5,
                    8
                ),
                darkMaterial
            );

        rightLeg.position.set(
            0.18,
            0.42,
            0
        );

        rightLeg.castShadow = true;

        this.object.add(
            rightLeg
        );

        // ----------------------------------------------------
        // PLAYER SHADOW
        // ----------------------------------------------------

        this.shadow =
            new THREE.Mesh(
                new THREE.CircleGeometry(
                    0.55,
                    16
                ),
                new THREE.MeshBasicMaterial({
                    color: 0x000000,
                    transparent: true,
                    opacity: 0.22,
                    depthWrite: false
                })
            );

        this.shadow.rotation.x =
            -Math.PI / 2;

        this.shadow.position.y =
            0.025;

        this.shadow.scale.set(
            1,
            0.65,
            1
        );

        this.object.add(
            this.shadow
        );
    }

    // ========================================================
    // SPAWN
    // ========================================================

    spawn() {

        const spawnX = 0;
        const spawnZ = 80;

        const ground =
            this.terrain.getGroundHeight(
                spawnX,
                spawnZ
            );

        this.object.position.set(
            spawnX,
            ground,
            spawnZ
        );

        this.verticalVelocity = 0;

        this.onGround = true;
    }

    // ========================================================
    // KEYBOARD INPUT
    // ========================================================

    setupKeyboard() {

        window.addEventListener(
            "keydown",
            (event) => {

                switch (
                    event.code
                ) {

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

                        if (!event.repeat) {
                            this.keys.jump = true;
                        }

                        break;
                }
            }
        );

        window.addEventListener(
            "keyup",
            (event) => {

                switch (
                    event.code
                ) {

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
            }
        );
    }

    // ========================================================
    // GET MOVEMENT INPUT
    // ========================================================

    getMovementInput() {

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

        this.moveDirection.set(
            x,
            0,
            z
        );

        if (
            this.moveDirection.lengthSq() > 1
        ) {

            this.moveDirection.normalize();
        }

        return this.moveDirection;
    }

    // ========================================================
    // SET CAMERA ROTATION
    // ========================================================

    setCameraRotation(yaw) {

        this.cameraYaw = yaw;
    }

    // ========================================================
    // CALCULATE CAMERA RELATIVE MOVEMENT
    // ========================================================

    getCameraRelativeMovement() {

        const input =
            this.getMovementInput();

        if (
            input.lengthSq() === 0
        ) {

            return new THREE.Vector3();
        }

        const yaw =
            this.cameraYaw || 0;

        this.forward.set(
            -Math.sin(yaw),
            0,
            -Math.cos(yaw)
        );

        this.right.set(
            Math.cos(yaw),
            0,
            -Math.sin(yaw)
        );

        const direction =
            new THREE.Vector3();

        direction.addScaledVector(
            this.forward,
            -input.z
        );

        direction.addScaledVector(
            this.right,
            input.x
        );

        if (
            direction.lengthSq() > 1
        ) {

            direction.normalize();
        }

        return direction;
    }

    // ========================================================
    // CHECK SLOPE
    // ========================================================

    isSlopeWalkable(x, z) {

        const slope =
            this.terrain.getSlopeAngle(
                x,
                z
            );

        return slope <=
            this.maxSlope;
    }

    // ========================================================
    // CHECK POSITION
    // ========================================================

    isSafePosition(x, z) {

        // ----------------------------------------------------
        // ISLAND BOUNDARY
        // ----------------------------------------------------

        const distance =
            Math.sqrt(
                x * x +
                z * z
            );

        if (
            distance >
            this.worldLimit
        ) {

            return false;
        }

        // ----------------------------------------------------
        // CENTER
        // ----------------------------------------------------

        if (
            !this.isSlopeWalkable(
                x,
                z
            )
        ) {

            return false;
        }

        // ----------------------------------------------------
        // MULTI-POINT COLLISION
        // ----------------------------------------------------

        for (
            let i = 0;
            i < this.collisionSamples;
            i++
        ) {

            const angle =
                (i /
                    this.collisionSamples) *
                Math.PI *
                2;

            const sampleRadius =
                this.collisionRadius;

            const sampleX =
                x +
                Math.cos(angle) *
                sampleRadius;

            const sampleZ =
                z +
                Math.sin(angle) *
                sampleRadius;

            if (
                !this.isSlopeWalkable(
                    sampleX,
                    sampleZ
                )
            ) {

                return false;
            }

            // ------------------------------------------------
            // HEIGHT DIFFERENCE CHECK
            // ------------------------------------------------

            const centerHeight =
                this.terrain.getGroundHeight(
                    x,
                    z
                );

            const sampleHeight =
                this.terrain.getGroundHeight(
                    sampleX,
                    sampleZ
                );

            const heightDifference =
                Math.abs(
                    sampleHeight -
                    centerHeight
                );

            if (
                heightDifference >
                this.maxStepHeight
            ) {

                return false;
            }
        }

        return true;
    }

    // ========================================================
    // FIND SAFE MOVEMENT
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
        // X-ONLY
        // ----------------------------------------------------

        if (
            Math.abs(deltaX) > 0 &&
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
        // Z-ONLY
        // ----------------------------------------------------

        if (
            Math.abs(deltaZ) > 0 &&
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
    // APPLY GRAVITY
    // ========================================================

    updateVertical(
        deltaTime
    ) {

        const x =
            this.object.position.x;

        const z =
            this.object.position.z;

        const ground =
            this.terrain.getGroundHeight(
                x,
                z
            );

        // ----------------------------------------------------
        // JUMP
        // ----------------------------------------------------

        if (
            this.keys.jump &&
            this.onGround
        ) {

            this.verticalVelocity =
                this.jumpForce;

            this.onGround = false;

            this.keys.jump = false;
        }

        // ----------------------------------------------------
        // GRAVITY
        // ----------------------------------------------------

        if (!this.onGround) {

            this.verticalVelocity -=
                this.gravity *
                deltaTime;

            this.object.position.y +=
                this.verticalVelocity *
                deltaTime;

            // ------------------------------------------------
            // LAND
            // ------------------------------------------------

            if (
                this.object.position.y <=
                ground
            ) {

                this.object.position.y =
                    ground;

                this.verticalVelocity = 0;

                this.onGround = true;
            }
        }
        else {

            // Keep player attached to terrain
            this.object.position.y =
                ground;
        }
    }

    // ========================================================
    // ROTATE PLAYER
    // ========================================================

    rotateTowardsMovement(
        direction,
        deltaTime
    ) {

        if (
            direction.lengthSq() === 0
        ) {

            return;
        }

        const targetRotation =
            Math.atan2(
                direction.x,
                direction.z
            );

        let difference =
            targetRotation -
            this.object.rotation.y;

        difference =
            Math.atan2(
                Math.sin(difference),
                Math.cos(difference)
            );

        const rotationSpeed = 10;

        this.object.rotation.y +=
            difference *
            Math.min(
                1,
                rotationSpeed *
                deltaTime
            );
    }

    // ========================================================
    // UPDATE MOVEMENT
    // ========================================================

    update(
        deltaTime,
        cameraYaw = 0
    ) {

        if (
            !Number.isFinite(
                deltaTime
            )
        ) {

            return;
        }

        deltaTime =
            Math.min(
                deltaTime,
                0.05
            );

        this.cameraYaw =
            cameraYaw;

        const direction =
            this.getCameraRelativeMovement();

        // ----------------------------------------------------
        // SPEED
        // ----------------------------------------------------

        let speed =
            this.walkSpeed;

        if (
            this.keys.run &&
            direction.lengthSq() > 0
        ) {

            speed =
                this.runSpeed;

            this.running = true;
        }
        else {

            this.running = false;
        }

        // ----------------------------------------------------
        // MOVEMENT
        // ----------------------------------------------------

        if (
            direction.lengthSq() > 0
        ) {

            const movementDistance =
                speed *
                deltaTime;

            const deltaX =
                direction.x *
                movementDistance;

            const deltaZ =
                direction.z *
                movementDistance;

            this.tryMove(
                deltaX,
                deltaZ
            );

            this.rotateTowardsMovement(
                direction,
                deltaTime
            );
        }

        // ----------------------------------------------------
        // VERTICAL MOVEMENT
        // ----------------------------------------------------

        this.updateVertical(
            deltaTime
        );

        // ----------------------------------------------------
        // ANIMATION PLACEHOLDER
        // ----------------------------------------------------

        this.updateSimpleAnimation(
            deltaTime,
            direction
        );
    }

    // ========================================================
    // SIMPLE PROCEDURAL ANIMATION
    // ========================================================

    updateSimpleAnimation(
        deltaTime,
        direction
    ) {

        const moving =
            direction.lengthSq() > 0;

        const time =
            performance.now() *
            0.01;

        const amount =
            this.running
                ? 0.035
                : 0.02;

        if (moving) {

            const bob =
                Math.sin(
                    time * 1.8
                ) *
                amount;

            this.object.position.y +=
                bob;
        }
    }

    // ========================================================
    // TELEPORT TO SAFE POSITION
    // ========================================================

    teleport(
        x,
        z
    ) {

        const safe =
            this.terrain.findSafePosition(
                x,
                z,
                4,
                24
            );

        if (!safe) {

            console.warn(
                "No safe player position found."
            );

            return false;
        }

        this.object.position.set(
            safe.x,
            safe.y,
            safe.z
        );

        this.verticalVelocity = 0;

        this.onGround = true;

        return true;
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

    // ========================================================
    // DEBUG INFO
    // ========================================================

    getDebugInfo() {

        const x =
            this.object.position.x;

        const y =
            this.object.position.y;

        const z =
            this.object.position.z;

        return {

            x:
                Number(
                    x.toFixed(2)
                ),

            y:
                Number(
                    y.toFixed(2)
                ),

            z:
                Number(
                    z.toFixed(2)
                ),

            slope:
                Number(
                    this.terrain
                        .getSlopeDegrees(
                            x,
                            z
                        )
                        .toFixed(1)
                ),

            running:
                this.running,

            grounded:
                this.onGround
        };
    }

    // ========================================================
    // DISPOSE
    // ========================================================

    dispose() {

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

                    }
                    else {

                        child.material.dispose();
                    }
                }
            }
        );
    }
}
