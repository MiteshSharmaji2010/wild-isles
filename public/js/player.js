import * as THREE from "three";

export class Player {
    constructor(scene, terrain, camera) {
        this.scene = scene;
        this.terrain = terrain;
        this.camera = camera;

        // Player Parameters
        this.walkSpeed = 6.0;
        this.runSpeed = 11.0;
        this.jumpForce = 10.0;
        this.gravity = 25.0;

        this.health = 100;
        this.stamina = 100;
        this.maxStamina = 100;

        this.isGrounded = false;
        this.isRunning = false;
        this.isCrouching = false;
        this.isSwimming = false;

        this.velocity = new THREE.Vector3();
        this.targetRotation = Math.PI;
        this.currentRotation = Math.PI;

        this.keys = {};
        this.cameraRotation = Math.PI;
        this.cameraDistance = 9.0;
        this.cameraHeight = 4.0;
        this.animationTime = 0;

        // Player Group
        this.object = new THREE.Group();
        this.object.name = "KIAN_PLAYER";

        this.createPlayerModel();
        this.scene.add(this.object);

        this.setupKeyboard();
        this.spawnPlayer();
    }

    createPlayerModel() {
        this.bodyGroup = new THREE.Group();

        const skinMat = new THREE.MeshStandardMaterial({ color: 0xc58d6d, roughness: 0.8 });
        const shirtMat = new THREE.MeshStandardMaterial({ color: 0x28343d, roughness: 0.8 });
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x171b20, roughness: 0.9 });
        const bootMat = new THREE.MeshStandardMaterial({ color: 0x090b0d, roughness: 0.9 });

        // Torso
        this.body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.3, 0.55), shirtMat);
        this.body.position.y = 1.8;
        this.body.castShadow = true;
        this.bodyGroup.add(this.body);

        // Head
        this.head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), skinMat);
        this.head.position.y = 2.8;
        this.head.castShadow = true;
        this.bodyGroup.add(this.head);

        // Limb Pivot Helper
        const createPivot = (geo, mat, pos, offset) => {
            const pivot = new THREE.Group();
            pivot.position.copy(pos);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(offset);
            mesh.castShadow = true;
            pivot.add(mesh);
            this.bodyGroup.add(pivot);
            return pivot;
        };

        const armGeo = new THREE.BoxGeometry(0.3, 1.1, 0.3);
        const legGeo = new THREE.BoxGeometry(0.36, 1.1, 0.38);

        this.leftArmPivot = createPivot(armGeo, shirtMat, new THREE.Vector3(-0.65, 2.4, 0), new THREE.Vector3(0, -0.5, 0));
        this.rightArmPivot = createPivot(armGeo, shirtMat, new THREE.Vector3(0.65, 2.4, 0), new THREE.Vector3(0, -0.5, 0));
        this.leftLegPivot = createPivot(legGeo, pantsMat, new THREE.Vector3(-0.25, 1.2, 0), new THREE.Vector3(0, -0.5, 0));
        this.rightLegPivot = createPivot(legGeo, pantsMat, new THREE.Vector3(0.25, 1.2, 0), new THREE.Vector3(0, -0.5, 0));

        this.object.add(this.bodyGroup);
    }

    setupKeyboard() {
        window.addEventListener("keydown", (e) => {
            this.keys[e.code] = true;
            if (e.code === "Space") this.jump();
            if (e.code === "ControlLeft") this.isCrouching = true;
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
            if (e.code === "ControlLeft") this.isCrouching = false;
        });
    }

    spawnPlayer() {
        const spawn = this.terrain ? this.terrain.findSafePosition(0, 0) : { x: 0, y: 10, z: 0 };
        this.object.position.set(spawn.x, spawn.y + 2, spawn.z);
        this.velocity.set(0, 0, 0);
    }

    jump() {
        if (this.isGrounded && !this.isSwimming && this.stamina >= 10) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            this.stamina -= 10;
        }
    }

    update(deltaTime) {
        deltaTime = Math.min(deltaTime, 0.05);

        // Movement Input
        let inputX = 0, inputZ = 0;
        if (this.keys["KeyW"] || this.keys["ArrowUp"]) inputZ -= 1;
        if (this.keys["KeyS"] || this.keys["ArrowDown"]) inputZ += 1;
        if (this.keys["KeyA"] || this.keys["ArrowLeft"]) inputX -= 1;
        if (this.keys["KeyD"] || this.keys["ArrowRight"]) inputX += 1;

        const isMoving = inputX !== 0 || inputZ !== 0;

        // Stamina Logic
        const wantsRun = this.keys["ShiftLeft"] || this.keys["ShiftRight"];
        if (wantsRun && isMoving && this.stamina > 1) {
            this.isRunning = true;
            this.stamina = Math.max(0, this.stamina - 20 * deltaTime);
        } else {
            this.isRunning = false;
            this.stamina = Math.min(this.maxStamina, this.stamina + 15 * deltaTime);
        }

        // Speed calculation
        let speed = this.isRunning ? this.runSpeed : this.walkSpeed;
        if (this.isCrouching) speed *= 0.5;

        // Move execution
        if (isMoving) {
            const moveVec = new THREE.Vector3(inputX, 0, inputZ).normalize();
            this.object.position.x += moveVec.x * speed * deltaTime;
            this.object.position.z += moveVec.z * speed * deltaTime;

            this.targetRotation = Math.atan2(moveVec.x, moveVec.z);
        }

        // Smooth Rotation
        let diff = this.targetRotation - this.currentRotation;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.currentRotation += diff * 10 * deltaTime;
        this.object.rotation.y = this.currentRotation;

        // Terrain & Gravity Check
        const groundY = this.terrain ? this.terrain.getGroundHeight(this.object.position.x, this.object.position.z) : 0;
        const waterY = this.terrain ? this.terrain.waterLevel : 1.2;

        if (groundY < waterY && this.object.position.y <= waterY + 0.1) {
            this.isSwimming = true;
            this.isGrounded = false;
            this.velocity.y = 0;
            this.object.position.y = THREE.MathUtils.lerp(this.object.position.y, waterY - 0.2, 5 * deltaTime);
        } else {
            this.isSwimming = false;
            this.velocity.y -= this.gravity * deltaTime;
            this.object.position.y += this.velocity.y * deltaTime;

            if (this.object.position.y <= groundY) {
                this.object.position.y = groundY;
                this.velocity.y = 0;
                this.isGrounded = true;
            }
        }

        // Procedural Limb Animation
        this.animationTime += deltaTime * (this.isRunning ? 12 : 7);
        if (isMoving && !this.isSwimming) {
            const swing = Math.sin(this.animationTime) * 0.6;
            this.leftArmPivot.rotation.x = -swing;
            this.rightArmPivot.rotation.x = swing;
            this.leftLegPivot.rotation.x = swing;
            this.rightLegPivot.rotation.x = -swing;
        } else {
            this.leftArmPivot.rotation.x = 0;
            this.rightArmPivot.rotation.x = 0;
            this.leftLegPivot.rotation.x = 0;
            this.rightLegPivot.rotation.x = 0;
        }

        // Camera Follow
        this.updateThirdPersonCamera(deltaTime);

        // Update UI
        this.updateUI();
    }

    updateThirdPersonCamera(deltaTime) {
        if (!this.camera) return;
        const targetPos = this.object.position.clone().add(new THREE.Vector3(0, this.cameraHeight, 0));
        const offset = new THREE.Vector3(0, 0, this.cameraDistance);

        const desiredCamPos = targetPos.clone().add(offset);
        this.camera.position.lerp(desiredCamPos, 8 * deltaTime);
        this.camera.lookAt(targetPos);
    }

    updateUI() {
        const healthBar = document.getElementById("health-bar");
        const staminaBar = document.getElementById("stamina-bar");

        if (healthBar) healthBar.style.width = `${this.health}%`;
        if (staminaBar) staminaBar.style.width = `${(this.stamina / this.maxStamina) * 100}%`;
    }
}
