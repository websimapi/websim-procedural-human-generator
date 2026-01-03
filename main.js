import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 10, 0);
controls.enableDamping = true;

// Lighting (Studio Setup)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffeebb, 2.0);
mainLight.position.set(10, 20, 15);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
scene.add(mainLight);

const rimLight = new THREE.SpotLight(0x4455ff, 5.0);
rimLight.position.set(-10, 15, -10);
rimLight.lookAt(0, 10, 0);
scene.add(rimLight);

const fillLight = new THREE.PointLight(0xffaa88, 0.5);
fillLight.position.set(0, 5, 10);
scene.add(fillLight);

// --- GENERATION PROCESS ---

const anatomy = new HumanAnatomy();
const textures = generateSkinTextures();

// Create Material (PBR Skin)
const skinMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xe0c0a0,
    map: textures.albedo,
    normalMap: textures.normal,
    roughnessMap: textures.roughness,
    roughness: 0.6,
    metalness: 0.0,
    ior: 1.4, // Skin Index of Refraction
    sheen: 0.4,
    sheenColor: 0xffcccc,
    transmission: 0.1, // Fake SSS thickness
    thickness: 2.0,
    side: THREE.DoubleSide
});

// Create Geometry
const resolution = window.innerWidth < 600 ? 50 : 100; // Lower resolution on mobile
const mesher = new Mesher(anatomy, {
    min: new THREE.Vector3(-10, 0, -10),
    max: new THREE.Vector3(10, 22, 10)
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