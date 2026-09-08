import * as THREE from "three";

export class WorldTerrain {
    constructor(scene) {
        this.scene = scene;
        this.worldHalfSize = 4096;
        this.waterLevel = 1.2;

        this.initEnvironment();
        this.createTerrain();
        this.createWater();
    }

    // Realistic Lighting, Skybox, aur Fog Setup
    initEnvironment() {
        // Sky Fog (Choo-Choo Charles / Palworld Realistic Look)
        this.scene.fog = new THREE.FogExp2(0xa0c4ff, 0.008);

        // Directional Light (Suraj Ki Roshni)
        this.sunLight = new THREE.DirectionalLight(0xfff5ea, 1.3);
        this.sunLight.position.set(100, 150, 50);
        this.sunLight.castShadow = true;

        // Shadow Quality Settings
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 500;

        const d = 100;
        this.sunLight.shadow.camera.left = -d;
        this.sunLight.shadow.camera.right = d;
        this.sunLight.shadow.camera.top = d;
        this.sunLight.shadow.camera.bottom = -d;

        this.scene.add(this.sunLight);

        // Soft Ambient Light (Shadows ko dark hone se bachane ke liye)
        const ambientLight = new THREE.AmbientLight(0xddeeff, 0.4);
        this.scene.add(ambientLight);
    }

    // Procedural Ground / Mesh Creation
    createTerrain() {
        const size = 1500;
        const segments = 128;
        const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
        geometry.rotateX(-Math.PI / 2);

        const pos = geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            const y = this.calculateHeight(x, z);
            pos.setY(i, y);
        }
        geometry.computeVertexNormals();

        // Realistic PBR Grass/Soil Material
        const material = new THREE.MeshStandardMaterial({
            color: 0x3b7a57,
            roughness: 0.85,
            metalness: 0.05,
            flatShading: false
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
    }

    // Realistic Water Body Plane
    createWater() {
        const waterGeo = new THREE.PlaneGeometry(1500, 1500);
        waterGeo.rotateX(-Math.PI / 2);

        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x006994,
            transparent: true,
            opacity: 0.75,
            roughness: 0.1,
            metalness: 0.1
        });

        this.water = new THREE.Mesh(waterGeo, waterMat);
        this.water.position.y = this.waterLevel;
        this.scene.add(this.water);
    }

    // Ground Height Physics Function
    calculateHeight(x, z) {
        return Math.sin(x * 0.01) * Math.cos(z * 0.01) * 8 + Math.sin(x * 0.05) * 2;
    }

    getGroundHeight(x, z) {
        return this.calculateHeight(x, z);
    }

    getSlopeDegrees(x, z) {
        const h1 = this.getGroundHeight(x, z);
        const h2 = this.getGroundHeight(x + 0.1, z);
        return Math.abs(h2 - h1) * 100;
    }

    findSafePosition(x, z) {
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
        if (this.water) {
            this.water.position.x = Math.floor(playerX / 50) * 50;
            this.water.position.z = Math.floor(playerZ / 50) * 50;
        }
    }
}
