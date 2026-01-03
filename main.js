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
mainLight.position.set(5, 10, 7);
mainLight.castShadow = true;
mainLight.shadow.bias = -0.0001;
mainLight.shadow.normalBias = 0.02; // Helps with shadow acne on curved organic surfaces
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
// Fix: Expand shadow camera frustum to prevent body parts being cut off
mainLight.shadow.camera.left = -15;
mainLight.shadow.camera.right = 15;
mainLight.shadow.camera.top = 20;
mainLight.shadow.camera.bottom = -5;
mainLight.shadow.camera.near = 0.5;
mainLight.shadow.camera.far = 50;
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
const textures = generateSkinTextures();

// Create Material (PBR Skin)
const skinMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xe0c0a0,
    map: textures.albedo,
    normalMap: textures.normal,
    roughnessMap: textures.roughness,
    roughness: 0.45,
    metalness: 0.0,
    ior: 1.4, // Skin Index of Refraction
    sheen: 0.4,
    sheenColor: 0xffcccc,
    transmission: 0.1, // Fake SSS thickness
    thickness: 2.0,
    side: THREE.DoubleSide
});

// Create Geometry
const resolution = window.innerWidth < 600 ? 60 : 80; // MC Resolution (Cubed!)
const mesher = new Mesher(anatomy, {
    min: new THREE.Vector3(-12, -3, -12),
    max: new THREE.Vector3(12, 24, 12)
}, resolution);

const uiStatus = document.getElementById('status-text');
const uiBar = document.getElementById('progress-bar');
const loadingDiv = document.getElementById('loading');

// Execute generation in a non-blocking way
async function generateBody() {
    uiStatus.innerText = "Calculating Volumetric Anatomy...";
    
    // We modify Mesher to be async or chunked for the UI update
    // For this demo, we run it and wait (JS single thread limit)
    // Ideally, this goes in a WebWorker.
    
    // Using a setTimeout to allow UI to render first frame
    setTimeout(() => {
        const start = performance.now();
        const geometry = mesher.generate((progress) => {
            // This callback is synchronous in current implementation
            // so it won't actually update DOM during loop unless we yielded.
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