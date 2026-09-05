import * as THREE from 'three';

// ============================================================================
// 1. WEB WORKER ENGINE (DETAILED PROCEDURAL GENERATION & EROSION)
// ============================================================================
const WorkerCode = `
self.onmessage = function(e) {
    const { 
        chunkX, 
        chunkZ, 
        chunkSize, 
        segments, 
        lod, 
        seed, 
        waterLevel, 
        maxHeight 
    } = e.data;
    
    // Pseudo-Random Number Generator based on Seed
    function pseudoRandom(x, z) {
        let n = Math.sin(x * 12.9898 + z * 78.233 + seed) * 43758.5453123;
        return n - Math.floor(n);
    }

    // 2D Value Noise Generator
    function valueNoise(x, z) {
        const floorX = Math.floor(x);
        const floorZ = Math.floor(z);
        const fracX = x - floorX;
        const fracZ = z - floorZ;
        
        // Smooth Hermite Interpolation Curve
        const u = fracX * fracX * (3 - 2 * fracX);
        const v = fracZ * fracZ * (3 - 2 * fracZ);

        const n00 = pseudoRandom(floorX, floorZ);
        const n10 = pseudoRandom(floorX + 1, floorZ);
        const n01 = pseudoRandom(floorX, floorZ + 1);
        const n11 = pseudoRandom(floorX + 1, floorZ + 1);

        const nx0 = n00 + (n10 - n00) * u;
        const nx1 = n01 + (n11 - n01) * u;
        
        return nx0 + (nx1 - nx0) * v;
    }

    // Fractal Brownian Motion (fBm) Multi-Octave Noise
    function fractalNoise(x, z, octaves, persistence, lacunarity) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        
        for (let i = 0; i < octaves; i++) {
            total += valueNoise(x * frequency, z * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }
        
        return total / maxValue;
    }

    // 3D Noise for Volumetric Cave Carving
    function caveNoise(x, y, z) {
        const n1 = fractalNoise(x * 0.02, z * 0.02, 2, 0.5, 2.0);
        const n2 = fractalNoise(y * 0.04, (x + z) * 0.02, 2, 0.5, 2.0);
        return n1 * n2;
    }

    // Particle-based Hydraulic Erosion Simulation
    function applyHydraulicErosion(heights, gridRes, iterations) {
        const inertia = 0.05;
        const gravity = 4.0;
        const capacityFactor = 4.0;
        const depositionRate = 0.3;
        const erosionRate = 0.3;
        const evaporationRate = 0.02;

        for (let iter = 0; iter < iterations; iter++) {
            let posX = Math.floor(pseudoRandom(iter, iter * 2) * (gridRes - 3)) + 1;
            let posZ = Math.floor(pseudoRandom(iter * 3, iter * 4) * (gridRes - 3)) + 1;
            
            let dirX = 0;
            let dirZ = 0;
            let speed = 1.0;
            let water = 1.0;
            let sediment = 0.0;

            for (let step = 0; step < 30; step++) {
                let nodeX = Math.floor(posX);
                let nodeZ = Math.floor(posZ);
                let idx = nodeZ * gridRes + nodeX;

                // Height gradients
                let hL = heights[nodeZ * gridRes + (nodeX - 1)];
                let hR = heights[nodeZ * gridRes + (nodeX + 1)];
                let hU = heights[(nodeZ - 1) * gridRes + nodeX];
                let hD = heights[(nodeZ + 1) * gridRes + nodeX];

                let gx = (hL - hR);
                let gz = (hU - hD);

                // Compute movement direction with momentum
                dirX = dirX * inertia - gx * (1.0 - inertia);
                dirZ = dirZ * inertia - gz * (1.0 - inertia);

                let len = Math.sqrt(dirX * dirX + dirZ * dirZ);
                if (len !== 0) {
                    dirX /= len;
                    dirZ /= len;
                } else {
                    break;
                }

                posX += dirX;
                posZ += dirZ;

                if (posX < 1 || posX >= gridRes - 2 || posZ < 1 || posZ >= gridRes - 2) {
                    break;
                }

                let newIdx = Math.floor(posZ) * gridRes + Math.floor(posX);
                let deltaH = heights[newIdx] - heights[idx];

                // Deposit or erode based on sediment capacity
                let maxSediment = Math.max(-deltaH * speed * water * capacityFactor, 0.01);

                if (sediment > maxSediment || deltaH > 0) {
                    let depositAmount = (deltaH > 0) ? Math.min(deltaH, sediment) : (sediment - maxSediment) * depositionRate;
                    sediment -= depositAmount;
                    heights[idx] += depositAmount;
                } else {
                    let erodeAmount = Math.min((maxSediment - sediment) * erosionRate, -deltaH);
                    sediment += erodeAmount;
                    heights[idx] -= erodeAmount;
                }

                speed = Math.sqrt(Math.max(0, speed * speed + deltaH * gravity));
                water *= (1.0 - evaporationRate);
            }
        }
    }

    // Resolution scaling per LOD level
    const currentSegments = Math.max(4, Math.floor(segments / Math.pow(2, lod)));
    const gridRes = currentSegments + 1;
    const vertCount = gridRes * gridRes;
    
    const positions = new Float32Array(vertCount * 3);
    const uvs = new Float32Array(vertCount * 2);
    const biomes = new Float32Array(vertCount * 3);
    const heights2D = new Float32Array(vertCount);

    const step = chunkSize / currentSegments;
    const originX = chunkX * chunkSize;
    const originZ = chunkZ * chunkSize;

    let ptr = 0;
    let uvPtr = 0;
    let hIdx = 0;

    // Build base heightmap grid
    for (let z = 0; z <= currentSegments; z++) {
        for (let x = 0; x <= currentSegments; x++) {
            const worldX = originX + (x * step);
            const worldZ = originZ + (z * step);

            // Layered noise generation
            let baseElev = fractalNoise(worldX * 0.002, worldZ * 0.002, 5, 0.5, 2.0) * maxHeight;
            let mtnMask = Math.pow(fractalNoise(worldX * 0.0008, worldZ * 0.0008, 3, 0.5, 2.0), 2.5);
            let totalElev = baseElev + (mtnMask * maxHeight * 1.5);

            // Environmental Biome Factors
            let moisture = fractalNoise(worldX * 0.001 + 500, worldZ * 0.001 + 500, 3, 0.5, 2.0);
            let temperature = 1.0 - (totalElev / (maxHeight * 2.5)) + (fractalNoise(worldX * 0.001, worldZ * 0.001, 2, 0.5, 2.0) - 0.5) * 0.3;

            // Apply 3D Cave Carving
            let cMask = caveNoise(worldX, totalElev, worldZ);
            if (cMask > 0.6 && totalElev > waterLevel + 5.0) {
                totalElev -= (cMask - 0.6) * 40.0;
            }

            positions[ptr] = x * step - chunkSize / 2;
            positions[ptr + 1] = totalElev;
            positions[ptr + 2] = z * step - chunkSize / 2;

            heights2D[hIdx++] = totalElev;

            uvs[uvPtr] = x / currentSegments;
            uvs[uvPtr + 1] = z / currentSegments;

            biomes[ptr] = moisture;
            biomes[ptr + 1] = temperature;
            biomes[ptr + 2] = mtnMask;

            ptr += 3;
            uvPtr += 2;
        }
    }

    // High detail LOD gets full erosion processing
    if (lod === 0) {
        applyHydraulicErosion(heights2D, gridRes, 1500);
        let hPtr = 0;
        for (let i = 0; i < heights2D.length; i++) {
            positions[hPtr + 1] = heights2D[i];
            hPtr += 3;
        }
    }

    // Build Triangle Index Buffer
    const indices = [];
    for (let z = 0; z < currentSegments; z++) {
        for (let x = 0; x < currentSegments; x++) {
            const a = z * gridRes + x;
            const b = a + 1;
            const c = (z + 1) * gridRes + x;
            const d = c + 1;

            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }

    const indexArray = new Uint32Array(indices);

    // Send zero-copy Transferable ArrayBuffers back to main thread
    self.postMessage({
        chunkX,
        chunkZ,
        lod,
        positions: positions.buffer,
        uvs: uvs.buffer,
        biomes: biomes.buffer,
        indices: indexArray.buffer,
        heights2D: heights2D.buffer,
        gridRes
    }, [
        positions.buffer, 
        uvs.buffer, 
        biomes.buffer, 
        indexArray.buffer, 
        heights2D.buffer
    ]);
};
`;

const workerBlob = new Blob([WorkerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(workerBlob);

// ============================================================================
// 2. GLSL TRIPLANAR SHADER & TEXTURE SPLATTING
// ============================================================================
function createTriplanarTerrainMaterial(textures) {
    return new THREE.ShaderMaterial({
        uniforms: {
            uGrassTex: { value: textures.grass },
            uRockTex: { value: textures.rock },
            uSnowTex: { value: textures.snow },
            uSandTex: { value: textures.sand },
            uTextureScale: { value: 0.05 },
            uWaterLevel: { value: -2.0 }
        },
        vertexShader: `
            attribute vec3 biomeData;
            
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec3 vBiome;

            void main() {
                vBiome = biomeData;
                vNormal = normalize(normalMatrix * normal);
                
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                
                gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D uGrassTex;
            uniform sampler2D uRockTex;
            uniform sampler2D uSnowTex;
            uniform sampler2D uSandTex;
            
            uniform float uTextureScale;
            uniform float uWaterLevel;

            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            varying vec3 vBiome;

            // Project textures across X, Y, and Z axes without UV stretching
            vec4 getTriplanarBlend(sampler2D tex, vec3 worldPos, vec3 normal) {
                vec3 blendWeights = abs(normal);
                blendWeights = max(blendWeights - 0.2, 0.0);
                blendWeights /= (blendWeights.x + blendWeights.y + blendWeights.z);

                vec4 coordX = texture2D(tex, worldPos.yz * uTextureScale);
                vec4 coordY = texture2D(tex, worldPos.xz * uTextureScale);
                vec4 coordZ = texture2D(tex, worldPos.xy * uTextureScale);

                return coordX * blendWeights.x + coordY * blendWeights.y + coordZ * blendWeights.z;
            }

            void main() {
                vec3 normal = normalize(vNormal);
                float height = vWorldPosition.y;
                float slope = 1.0 - normal.y; // Slope angle (0 = flat, 1 = steep)

                // Fetch triplanar samples
                vec4 grassCol = getTriplanarBlend(uGrassTex, vWorldPosition, normal);
                vec4 rockCol  = getTriplanarBlend(uRockTex, vWorldPosition, normal);
                vec4 snowCol  = getTriplanarBlend(uSnowTex, vWorldPosition, normal);
                vec4 sandCol  = getTriplanarBlend(uSandTex, vWorldPosition, normal);

                vec4 finalColor = grassCol;

                // Height & Shoreline Blending
                if (height < uWaterLevel + 2.0) {
                    finalColor = mix(sandCol, grassCol, smoothstep(uWaterLevel, uWaterLevel + 2.0, height));
                } else {
                    // Temperature / Altitude dependent biomes
                    if (vBiome.y < 0.25 || height > 45.0) {
                        finalColor = mix(rockCol, snowCol, smoothstep(45.0, 55.0, height));
                    } else if (vBiome.x < 0.3) {
                        finalColor = sandCol;
                    }
                }

                // Apply cliff rock blend on steep slopes
                finalColor = mix(finalColor, rockCol, smoothstep(0.25, 0.7, slope));

                // Directional Lighting calculation
                vec3 lightDir = normalize(vec3(0.6, 1.0, 0.4));
                float lightIntensity = max(dot(normal, lightDir), 0.2);
                
                gl_FragColor = vec4(finalColor.rgb * lightIntensity, 1.0);
            }
        `,
        wireframe: false
    });
}

// ============================================================================
// 3. INSTANCED VEGETATION & PROPS SPAWNER
// ============================================================================
class FoliageManager {
    constructor(scene) {
        this.scene = scene;
        this.instancedMeshes = new Map();
        this.initFoliagePrototypes();
    }

    initFoliagePrototypes() {
        // Pine Tree Prototype
        const treeGeo = new THREE.ConeGeometry(2, 8, 5);
        treeGeo.translate(0, 4, 0);
        const treeMat = new THREE.MeshLambertMaterial({ color: 0x1b4d2e });
        const treeMesh = new THREE.InstancedMesh(treeGeo, treeMat, 50000);
        treeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        treeMesh.count = 0;
        treeMesh.castShadow = true;

        // Rock Prototype
        const rockGeo = new THREE.DodecahedronGeometry(1.5, 1);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 });
        const rockMesh = new THREE.InstancedMesh(rockGeo, rockMat, 50000);
        rockMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        rockMesh.count = 0;

        this.instancedMeshes.set('tree', { mesh: treeMesh, count: 0 });
        this.instancedMeshes.set('rock', { mesh: rockMesh, count: 0 });

        this.scene.add(treeMesh);
        this.scene.add(rockMesh);
    }

    spawnChunkFoliage(chunkKey, heights2D, gridRes, chunkSize, originX, originZ) {
        const dummy = new THREE.Object3D();
        const treeData = this.instancedMeshes.get('tree');
        const rockData = this.instancedMeshes.get('rock');

        const step = chunkSize / (gridRes - 1);
        const halfChunk = chunkSize / 2;

        for (let z = 2; z < gridRes - 2; z += 3) {
            for (let x = 2; x < gridRes - 2; x += 3) {
                const idx = z * gridRes + x;
                const h = heights2D[idx];

                if (h > 3.0 && h < 35.0) {
                    const worldX = originX + (x * step) - halfChunk;
                    const worldZ = originZ + (z * step) - halfChunk;

                    // Pseudo-Random Spawning Determinism
                    const rnd = Math.sin(worldX * 12.989 + worldZ * 78.233) * 43758.545;
                    const val = rnd - Math.floor(rnd);

                    if (val > 0.85 && treeData.count < 50000) {
                        dummy.position.set(worldX, h, worldZ);
                        const scale = 0.8 + val * 0.5;
                        dummy.scale.set(scale, scale, scale);
                        dummy.rotation.y = val * Math.PI * 2;
                        dummy.updateMatrix();

                        treeData.mesh.setMatrixAt(treeData.count++, dummy.matrix);
                    } else if (val < 0.05 && rockData.count < 50000) {
                        dummy.position.set(worldX, h, worldZ);
                        dummy.scale.setScalar(0.5 + val * 2.0);
                        dummy.rotation.set(val, val * 2, 0);
                        dummy.updateMatrix();

                        rockData.mesh.setMatrixAt(rockData.count++, dummy.matrix);
                    }
                }
            }
        }

        treeData.mesh.instanceMatrix.needsUpdate = true;
        rockData.mesh.instanceMatrix.needsUpdate = true;
    }

    clear() {
        this.instancedMeshes.forEach(item => {
            item.count = 0;
            item.mesh.count = 0;
            item.mesh.instanceMatrix.needsUpdate = true;
        });
    }
}

// ============================================================================
// 4. CANNON-ES PHYSICS COLLIDER INTEGRATION
// ============================================================================
class PhysicsManager {
    constructor(world) {
        this.world = world;
        this.activeBodies = new Map();
    }

    createHeightfieldCollider(chunkKey, heights2D, gridRes, chunkSize, originX, originZ) {
        if (!this.world || typeof CANNON === 'undefined') return;

        const matrix = [];
        for (let x = 0; x < gridRes; x++) {
            const row = [];
            for (let z = 0; z < gridRes; z++) {
                row.push(heights2D[z * gridRes + x]);
            }
            matrix.push(row);
        }

        const hfShape = new CANNON.Heightfield(matrix, {
            elementSize: chunkSize / (gridRes - 1)
        });

        const body = new CANNON.Body({ mass: 0 });
        body.addShape(hfShape);
        body.position.set(originX - chunkSize / 2, 0, originZ + chunkSize / 2);
        body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

        this.world.addBody(body);
        this.activeBodies.set(chunkKey, body);
    }

    removeCollider(chunkKey) {
        if (!this.world || !this.activeBodies.has(chunkKey)) return;
        this.world.removeBody(this.activeBodies.get(chunkKey));
        this.activeBodies.delete(chunkKey);
    }
}

// ============================================================================
// 5. CORE TERRAIN SYSTEM CONTROLLER
// ============================================================================
export class TerrainSystem {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.physicsWorld = options.physicsWorld || null;

        // Grid & Render Configuration
        this.chunkSize = options.chunkSize || 128;
        this.chunkSegments = options.chunkSegments || 64;
        this.renderRadius = options.renderRadius || 4;
        this.seed = options.seed || 42;
        this.maxHeight = options.maxHeight || 80;
        this.waterLevel = options.waterLevel || -2;

        // Background Web Worker Instance
        this.worker = new Worker(workerUrl);
        this.worker.onmessage = this.handleWorkerResponse.bind(this);

        // Active State Maps
        this.chunks = new Map();
        this.pendingWorkerTasks = new Set();
        this.root = new THREE.Group();
        this.root.name = "Terrain_Engine_Root";
        this.scene.add(this.root);

        // Subsystems Initialization
        this.foliage = new FoliageManager(this.scene);
        this.physics = new PhysicsManager(this.physicsWorld);

        // Texture Loading Placeholders
        const createDummyTex = (color) => {
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 128, 128);
            return new THREE.CanvasTexture(canvas);
        };

        const textures = {
            grass: options.grassTex || createDummyTex('#2e7d32'),
            rock: options.rockTex || createDummyTex('#616161'),
            snow: options.snowTex || createDummyTex('#eceff1'),
            sand: options.sandTex || createDummyTex('#fbc02d')
        };

        this.material = createTriplanarTerrainMaterial(textures);
        this.material.uniforms.uWaterLevel.value = this.waterLevel;

        this.createOcean();
    }

    getChunkKey(x, z, lod) {
        return `${x},${z}_LOD${lod}`;
    }

    calculateLOD(dx, dz) {
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist <= 1.5) return 0;
        if (dist <= 3.0) return 1;
        return 2;
    }

    update(playerPos) {
        const centerChunkX = Math.floor((playerPos.x + this.chunkSize / 2) / this.chunkSize);
        const centerChunkZ = Math.floor((playerPos.z + this.chunkSize / 2) / this.chunkSize);

        const activeKeys = new Set();

        for (let x = -this.renderRadius; x <= this.renderRadius; x++) {
            for (let z = -this.renderRadius; z <= this.renderRadius; z++) {
                const cX = centerChunkX + x;
                const cZ = centerChunkZ + z;
                
                const lod = this.calculateLOD(x, z);
                const key = this.getChunkKey(cX, cZ, lod);
                activeKeys.add(key);

                if (!this.chunks.has(key) && !this.pendingWorkerTasks.has(key)) {
                    this.requestChunkBuild(cX, cZ, lod);
                }
            }
        }

        // Unload far away chunks
        for (const [key, data] of this.chunks.entries()) {
            if (!activeKeys.has(key)) {
                this.unloadChunk(key);
            }
        }

        if (this.ocean) {
            this.ocean.position.x = centerChunkX * this.chunkSize;
            this.ocean.position.z = centerChunkZ * this.chunkSize;
        }
    }

    requestChunkBuild(chunkX, chunkZ, lod) {
        const key = this.getChunkKey(chunkX, chunkZ, lod);
        this.pendingWorkerTasks.add(key);

        this.worker.postMessage({
            chunkX,
            chunkZ,
            chunkSize: this.chunkSize,
            segments: this.chunkSegments,
            lod,
            seed: this.seed,
            waterLevel: this.waterLevel,
            maxHeight: this.maxHeight
        });
    }

    handleWorkerResponse(e) {
        const { 
            chunkX, 
            chunkZ, 
            lod, 
            positions, 
            uvs, 
            biomes, 
            indices, 
            heights2D, 
            gridRes 
        } = e.data;
        
        const key = this.getChunkKey(chunkX, chunkZ, lod);
        this.pendingWorkerTasks.delete(key);

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
        geometry.setAttribute('biomeData', new THREE.BufferAttribute(new Float32Array(biomes), 3));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
        geometry.computeVertexNormals();

        const mesh = new THREE.Mesh(geometry, this.material);
        const originX = chunkX * this.chunkSize;
        const originZ = chunkZ * this.chunkSize;

        mesh.position.set(originX, 0, originZ);
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        this.root.add(mesh);

        const h2DArray = new Float32Array(heights2D);

        // Populate physics and vegetation only on closest high-LOD chunks
        if (lod === 0) {
            this.foliage.spawnChunkFoliage(key, h2DArray, gridRes, this.chunkSize, originX, originZ);
            this.physics.createHeightfieldCollider(key, h2DArray, gridRes, this.chunkSize, originX, originZ);
        }

        this.chunks.set(key, { mesh, geometry, chunkX, chunkZ });
    }

    unloadChunk(key) {
        const chunk = this.chunks.get(key);
        if (!chunk) return;

        this.root.remove(chunk.mesh);
        chunk.geometry.dispose();
        this.physics.removeCollider(key);

        this.chunks.delete(key);
    }

    createOcean() {
        const size = this.chunkSize * (this.renderRadius * 2 + 2);
        const geo = new THREE.PlaneGeometry(size, size);
        geo.rotateX(-Math.PI / 2);

        const mat = new THREE.MeshStandardMaterial({
            color: 0x006699,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.65
        });

        this.ocean = new THREE.Mesh(geo, mat);
        this.ocean.position.y = this.waterLevel;
        this.root.add(this.ocean);
    }

    dispose() {
        this.worker.terminate();
        this.foliage.clear();

        for (const key of this.chunks.keys()) {
            this.unloadChunk(key);
        }

        this.material.dispose();
        this.scene.remove(this.root);
    }
}
