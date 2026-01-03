import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { HumanAnatomy } from './human_anatomy.js';
import { Mesher } from './mesher.js';
import { generateSkinTextures } from './procedural_textures.js';

// Setup Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.FogExp2(0x050505, 0.02);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 12, 35);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 10, 0);
controls.enableDamping = true;

// Lighting (Studio Setup)
// Balanced for PBR skin with Environment Map
const ambientLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.2); // Lower ambient, let env map do work
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xfff0dd, 2.5);
// Moved light higher and more forward to ensure good frontal coverage
mainLight.position.set(5, 20, 20);
mainLight.castShadow = true;
mainLight.shadow.bias = -0.0001;
mainLight.shadow.normalBias = 0.02; 
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;

mainLight.shadow.camera.left = -15;
mainLight.shadow.camera.right = 15;
mainLight.shadow.camera.top = 15;
mainLight.shadow.camera.bottom = -30; // Extend down for feet
mainLight.shadow.camera.near = 0.5;
mainLight.shadow.camera.far = 80;
scene.add(mainLight);

const rimLight = new THREE.SpotLight(0xbadbff, 10.0);
rimLight.position.set(-10, 10, -10);
rimLight.lookAt(0, 5, 0);
rimLight.angle = Math.PI / 3;
rimLight.penumbra = 1.0;
scene.add(rimLight);

const backLight = new THREE.DirectionalLight(0xccccff, 1.0);
backLight.position.set(0, 5, -10);
scene.add(backLight);

// --- GENERATION PROCESS ---

const anatomy = new HumanAnatomy();

// Placeholder Material until generation
const skinMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, // White to respect texture colors
    metalness: 0.0,
    roughness: 0.5,
    ior: 1.4, 
    sheen: 0.3,
    sheenColor: 0xffddcc,
    sheenRoughness: 0.5,
    side: THREE.DoubleSide
});

// Create Geometry
// Bounds significantly expanded to prevent clipping of front/feet/back
// X: -8 to 8 (Width 16) captures arms comfortably
// Y: -3 to 22 (Height 25) captures feet bottom and head top with margin
// Z: -8 to 8 (Depth 16) captures full body depth, prevents nose/front clipping
const resolution = window.innerWidth < 600 ? 90 : 140; // Increased resolution to maintain density with larger bounds
const mesher = new Mesher(anatomy, {
    min: new THREE.Vector3(-8, -3, -8), 
    max: new THREE.Vector3(8, 22, 8)
}, resolution);

const uiStatus = document.getElementById('status-text');
const uiBar = document.getElementById('progress-bar');
const loadingDiv = document.getElementById('loading');

// Execute generation in a non-blocking way
async function generateBody() {
    uiStatus.innerText = "Synthesizing High-Res Skin Textures...";
    
    // Allow UI to update
    await new Promise(r => setTimeout(r, 50));

    // Generate Textures (Heavy Operation)
    const textures = generateSkinTextures();
    
    // Update Material
    skinMaterial.map = textures.albedo;
    skinMaterial.normalMap = textures.normal;
    skinMaterial.roughnessMap = textures.roughness;
    skinMaterial.normalScale.set(1.5, 1.5);
    skinMaterial.needsUpdate = true;

    uiStatus.innerText = "Calculating Volumetric Anatomy...";
    uiBar.style.width = '20%';
    
    await new Promise(r => setTimeout(r, 50));

    // Calculate Geometry
    setTimeout(() => {
        const start = performance.now();
        const geometry = mesher.generate((progress) => {
             // Sync callback
        });
        
        const end = performance.now();
        console.log(`Generation took ${end-start}ms`);
        
        uiBar.style.width = '100%';
        uiStatus.innerText = "Finalizing Surface...";

        const mesh = new THREE.Mesh(geometry, skinMaterial);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        
        // Add a simple ground plane
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 })
        );
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.6; // Lower floor to accommodate feet bottoms
        plane.receiveShadow = true;
        scene.add(plane);

        setTimeout(() => {
            loadingDiv.style.opacity = 0;
            setTimeout(() => loadingDiv.remove(), 500);
        }, 500);

    }, 100);
}

generateBody();

// Render Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});