import * as THREE from "three";

export class WorldTerrain {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.water = null;
        this.environmentGroup = new THREE.Group();
        this.scene.add(this.environmentGroup);

        this.initLighting();
        this.createTerrain();
        this.createWater();
        this.spawnEnvironment();
    }

    initLighting() {
        // Ambient Light for fill
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);

        // Sunlight
        this.sunlight = new THREE.DirectionalLight(0xfffaed, 1.2);
        this.sunlight.position.set(100, 150, 50);
        this.sunlight.castShadow = true;

        // Shadow Map Config
        this.sunlight.shadow.mapSize.width = 2048;
        this.sunlight.shadow.mapSize.height = 2048;
        this.sunlight.shadow.camera.near = 0.5;
        this.sunlight.shadow.camera.far = 500;
        const d = 100;
        this.sunlight.shadow.camera.left = -d;
        this.sunlight.shadow.camera.right = d;
        this.sunlight.shadow.camera.top = d;
        this.sunlight.shadow.camera.bottom = -d;

        this.scene.add(this.sunlight);
    }

    // Mathematical Height Map (Perlin-like Hills)
    getHeightAt(x, z) {
        const scale1 = 0.015;
        const scale2 = 0.05;
        const h1 = Math.sin(x * scale1) * Math.cos(z * scale1) * 12;
        const h2 = Math.sin(x * scale2 + 1.5) * Math.cos(z * scale2 + 1.5) * 4;
        return h1 + h2;
    }

    createTerrain() {
        const size = 300;
        const segments = 120;
        const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
        geometry.rotateX(-Math.PI / 2);

        const posAttr = geometry.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const z = posAttr.getZ(i);
            const y = this.getHeightAt(x, z);
            posAttr.setY(i, y);
        }

        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: 0x4d7c0f,
            roughness: 0.8,
            metalness: 0.1,
            flatShading: true
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
    }

    createWater() {
        const waterGeo = new THREE.PlaneGeometry(500, 500);
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            transparent: true,
            opacity: 0.75,
            roughness: 0.1,
            metalness: 0.8
        });

        this.water = new THREE.Mesh(waterGeo, waterMat);
        this.water.rotation.x = -Math.PI / 2;
        this.water.position.y = -1; // Sea level height
        this.scene.add(this.water);
    }

    // Procedural Tree Generator
    createTree() {
        const tree = new THREE.Group();

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 4, 6);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 2;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        tree.add(trunk);

        // Leaves (Conical Layers)
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6, flatShading: true });
        
        const layers = [
            { radius: 2.2, height: 3, y: 3.5 },
            { radius: 1.7, height: 2.5, y: 5.0 },
            { radius: 1.1, height: 2, y: 6.2 }
        ];

        layers.forEach(layer => {
            const coneGeo = new THREE.ConeGeometry(layer.radius, layer.height, 6);
            const cone = new THREE.Mesh(coneGeo, leafMat);
            cone.position.y = layer.y;
            cone.castShadow = true;
            cone.receiveShadow = true;
            tree.add(cone);
        });

        return tree;
    }

    // Procedural Rock Generator
    createRock() {
        const size = 0.8 + Math.random() * 0.8;
        const rockGeo = new THREE.DodecahedronGeometry(size, 1);
        
        // Slightly deform vertices for organic look
        const posAttr = rockGeo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            posAttr.setX(i, posAttr.getX(i) + (Math.random() - 0.5) * 0.2);
            posAttr.setY(i, posAttr.getY(i) + (Math.random() - 0.5) * 0.2);
            posAttr.setZ(i, posAttr.getZ(i) + (Math.random() - 0.5) * 0.2);
        }
        rockGeo.computeVertexNormals();

        const rockMat = new THREE.MeshStandardMaterial({
            color: 0x64748b,
            roughness: 0.9,
            metalness: 0.2,
            flatShading: true
        });

        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.castShadow = true;
        rock.receiveShadow = true;
        return rock;
    }

    // Scatter Trees and Rocks across dry terrain
    spawnEnvironment() {
        const totalTrees = 80;
        const totalRocks = 50;

        // Spawn Trees
        for (let i = 0; i < totalTrees; i++) {
            const x = (Math.random() - 0.5) * 240;
            const z = (Math.random() - 0.5) * 240;
            const y = this.getHeightAt(x, z);

            // Spawn only above water level (Dry Land) & not too close to spawn center (0,0)
            if (y > 0.5 && (Math.abs(x) > 6 || Math.abs(z) > 6)) {
                const tree = this.createTree();
                tree.position.set(x, y, z);

                // Random variations
                const scale = 0.8 + Math.random() * 0.5;
                tree.scale.set(scale, scale, scale);
                tree.rotation.y = Math.random() * Math.PI * 2;

                this.environmentGroup.add(tree);
            }
        }

        // Spawn Rocks
        for (let i = 0; i < totalRocks; i++) {
            const x = (Math.random() - 0.5) * 250;
            const z = (Math.random() - 0.5) * 250;
            const y = this.getHeightAt(x, z);

            if (y > -0.2 && (Math.abs(x) > 5 || Math.abs(z) > 5)) {
                const rock = this.createRock();
                rock.position.set(x, y + 0.2, z);

                rock.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );

                this.environmentGroup.add(rock);
            }
        }
    }

    update(playerX, playerZ) {
        // Keeps directional sunlight focused around player position for crisp shadow optimization
        if (this.sunlight) {
            this.sunlight.position.x = playerX + 80;
            this.sunlight.position.z = playerZ + 40;
            this.sunlight.target.position.set(playerX, 0, playerZ);
            this.sunlight.target.updateMatrixWorld();
        }
    }
}
