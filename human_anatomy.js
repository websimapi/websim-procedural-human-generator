import { SDF } from './sdf_math.js';
import * as THREE from 'three';

// Anthropometric Data Class
export class HumanAnatomy {
    constructor() {
        // Standard human proportions
        this.scale = 1.0;
        
        // Joint positions
        // Refined for accurate, realistic proportions (not superhero)
        // 1 unit = approx 10cm. Height ~17.5 units = 175cm.
        this.skeleton = {
            head: new THREE.Vector3(0, 17.5, 0.2),
            neck: new THREE.Vector3(0, 15.5, 0.1),
            
            // Shoulders much narrower (Biacromial width ~4.0 units)
            shoulderL: new THREE.Vector3(2.0, 14.5, -0.2), 
            shoulderR: new THREE.Vector3(-2.0, 14.5, -0.2),
            
            elbowL: new THREE.Vector3(2.6, 10.8, 0.2),
            elbowR: new THREE.Vector3(-2.6, 10.8, 0.2),
            
            wristL: new THREE.Vector3(3.0, 7.0, 0.4),
            wristR: new THREE.Vector3(-3.0, 7.0, 0.4),
            
            chest: new THREE.Vector3(0, 13.5, 0.3),
            spineMid: new THREE.Vector3(0, 10.5, -0.3),
            pelvis: new THREE.Vector3(0, 9.0, 0),
            
            // Hips narrower
            hipL: new THREE.Vector3(1.1, 9.0, 0),
            hipR: new THREE.Vector3(-1.1, 9.0, 0),
            kneeL: new THREE.Vector3(1.4, 5.0, 0.4),
            kneeR: new THREE.Vector3(-1.4, 5.0, 0.4),
            ankleL: new THREE.Vector3(1.6, 1.0, 0),
            ankleR: new THREE.Vector3(-1.6, 1.0, 0),
            
            // Feet
            footL: new THREE.Vector3(1.8, 0, 1.2),
            footR: new THREE.Vector3(-1.8, 0, 1.2),
        };

        this.muscles = [
            // --- Core / Torso ---
            // Slimmer torso (refined width for better proportions)
            { type: 'box', pos: new THREE.Vector3(0, 12, -0.1), size: new THREE.Vector3(1.1, 3.5, 0.8), r: 0.6, smooth: 1.5 }, 
            { type: 'capsule', a: 'neck', b: 'spineMid', r: 1.0, smooth: 1.0 }, // Spine
            { type: 'capsule', a: 'shoulderL', b: 'shoulderR', r: 0.6, smooth: 1.0 }, // Clavicle
            
            // Neck Details
            { type: 'capsule', a: new THREE.Vector3(0.6, 16.5, 0.5), b: new THREE.Vector3(0.3, 15.2, 0.6), r: 0.3, smooth: 0.4 }, 
            { type: 'capsule', a: new THREE.Vector3(-0.6, 16.5, 0.5), b: new THREE.Vector3(-0.3, 15.2, 0.6), r: 0.3, smooth: 0.4 },

            // Traps (Smaller)
            { type: 'capsule', a: new THREE.Vector3(0.8, 15.5, -0.3), b: 'shoulderL', r: 0.7, smooth: 0.8 }, 
            { type: 'capsule', a: new THREE.Vector3(-0.8, 15.5, -0.3), b: 'shoulderR', r: 0.7, smooth: 0.8 }, 

            // Pecs (Smaller, realistic)
            { type: 'box', pos: new THREE.Vector3(1.0, 13.5, 1.2), size: new THREE.Vector3(0.9, 0.9, 0.2), r: 0.6, smooth: 0.8 },
            { type: 'box', pos: new THREE.Vector3(-1.0, 13.5, 1.2), size: new THREE.Vector3(0.9, 0.9, 0.2), r: 0.6, smooth: 0.8 },

            // Lats (Toned down)
            { type: 'capsule', a: new THREE.Vector3(1.8, 13.0, -0.6), b: new THREE.Vector3(1.2, 10.0, -0.6), r: 0.7, smooth: 1.0 },
            { type: 'capsule', a: new THREE.Vector3(-1.8, 13.0, -0.6), b: new THREE.Vector3(-1.2, 10.0, -0.6), r: 0.7, smooth: 1.0 },

            // Abs
            { type: 'capsule', a: new THREE.Vector3(0, 12.5, 1.2), b: new THREE.Vector3(0, 10.5, 1.2), r: 0.9, smooth: 0.5 }, 
            { type: 'capsule', a: new THREE.Vector3(0, 10.5, 1.1), b: new THREE.Vector3(0, 8.5, 1.0), r: 0.9, smooth: 0.5 },

            // Glutes (Proportioned)
            { type: 'sphere', pos: new THREE.Vector3(1.1, 9.0, -0.8), r: 1.4, smooth: 1.0 },
            { type: 'sphere', pos: new THREE.Vector3(-1.1, 9.0, -0.8), r: 1.4, smooth: 1.0 },

            // --- Head ---
            { type: 'sphere', pos: 'head', r: 1.9, smooth: 0.2 }, // Cranium
            { type: 'box', pos: new THREE.Vector3(0, 16.2, 0.6), size: new THREE.Vector3(1.0, 1.0, 0.9), r: 0.5, smooth: 0.5 }, // Face

            // --- Arms (Left) ---
            { type: 'capsule', a: 'shoulderL', b: new THREE.Vector3(2.4, 13.0, -0.2), r: 0.9, smooth: 0.7 }, // Deltoid
            { type: 'capsule', a: 'shoulderL', b: 'elbowL', r: 0.65, smooth: 0.6 }, // Bicep/Tricep
            { type: 'capsule', a: 'elbowL', b: 'wristL', r: 0.5, smooth: 0.5 }, // Forearm

            // Hand (Left)
            // Palm centered near wrist
            { type: 'box', pos: new THREE.Vector3(3.1, 6.2, 0.5), size: new THREE.Vector3(0.4, 0.5, 0.15), r: 0.25, smooth: 0.3 },
            // Fingers (Thickened for voxel capture)
            { type: 'capsule', a: new THREE.Vector3(2.9, 6.4, 0.7), b: new THREE.Vector3(3.0, 5.9, 0.9), r: 0.22, smooth: 0.15 }, // Thumb
            { type: 'capsule', a: new THREE.Vector3(2.9, 5.6, 0.6), b: new THREE.Vector3(2.9, 4.8, 0.65), r: 0.20, smooth: 0.1 }, // Index
            { type: 'capsule', a: new THREE.Vector3(3.1, 5.6, 0.5), b: new THREE.Vector3(3.15, 4.7, 0.5), r: 0.21, smooth: 0.1 }, // Middle
            { type: 'capsule', a: new THREE.Vector3(3.3, 5.6, 0.4), b: new THREE.Vector3(3.4, 4.8, 0.35), r: 0.20, smooth: 0.1 }, // Ring
            { type: 'capsule', a: new THREE.Vector3(3.5, 5.7, 0.3), b: new THREE.Vector3(3.6, 5.0, 0.2), r: 0.19, smooth: 0.1 }, // Pinky

            // --- Arms (Right) ---
            { type: 'capsule', a: 'shoulderR', b: new THREE.Vector3(-2.4, 13.0, -0.2), r: 0.9, smooth: 0.7 },
            { type: 'capsule', a: 'shoulderR', b: 'elbowR', r: 0.65, smooth: 0.6 },
            { type: 'capsule', a: 'elbowR', b: 'wristR', r: 0.5, smooth: 0.5 },

            // Hand (Right)
            { type: 'box', pos: new THREE.Vector3(-3.1, 6.2, 0.5), size: new THREE.Vector3(0.4, 0.5, 0.15), r: 0.25, smooth: 0.3 },
            { type: 'capsule', a: new THREE.Vector3(-2.9, 6.4, 0.7), b: new THREE.Vector3(-3.0, 5.9, 0.9), r: 0.22, smooth: 0.15 }, // Thumb
            { type: 'capsule', a: new THREE.Vector3(-2.9, 5.6, 0.6), b: new THREE.Vector3(-2.9, 4.8, 0.65), r: 0.20, smooth: 0.1 }, // Index
            { type: 'capsule', a: new THREE.Vector3(-3.1, 5.6, 0.5), b: new THREE.Vector3(-3.15, 4.7, 0.5), r: 0.21, smooth: 0.1 }, // Middle
            { type: 'capsule', a: new THREE.Vector3(-3.3, 5.6, 0.4), b: new THREE.Vector3(-3.4, 4.8, 0.35), r: 0.20, smooth: 0.1 }, // Ring
            { type: 'capsule', a: new THREE.Vector3(-3.5, 5.7, 0.3), b: new THREE.Vector3(-3.6, 5.0, 0.2), r: 0.19, smooth: 0.1 }, // Pinky

            // --- Legs (Left) ---
            { type: 'capsule', a: 'hipL', b: 'kneeL', r: 1.0, smooth: 0.8 }, // Quads (Slimmer)
            { type: 'capsule', a: new THREE.Vector3(1.1, 8.5, 0.1), b: new THREE.Vector3(1.2, 6.0, 0.2), r: 0.8, smooth: 0.7 }, // Adductor
            { type: 'capsule', a: 'kneeL', b: 'ankleL', r: 0.7, smooth: 0.6 }, // Calf
            
            // Foot Left
            { type: 'box', pos: new THREE.Vector3(1.6, 0.4, 0.3), size: new THREE.Vector3(0.4, 0.35, 0.7), r: 0.2, smooth: 0.4 }, // Heel/Mid
            { type: 'box', pos: new THREE.Vector3(1.7, 0.3, 1.4), size: new THREE.Vector3(0.45, 0.2, 0.4), r: 0.2, smooth: 0.3 }, // Toes

             // --- Legs (Right) ---
            { type: 'capsule', a: 'hipR', b: 'kneeR', r: 1.0, smooth: 0.8 },
            { type: 'capsule', a: new THREE.Vector3(-1.1, 8.5, 0.1), b: new THREE.Vector3(-1.2, 6.0, 0.2), r: 0.8, smooth: 0.7 },
            { type: 'capsule', a: 'kneeR', b: 'ankleR', r: 0.7, smooth: 0.6 },
            
            // Foot Right
            { type: 'box', pos: new THREE.Vector3(-1.6, 0.4, 0.3), size: new THREE.Vector3(0.4, 0.35, 0.7), r: 0.2, smooth: 0.4 },
            { type: 'box', pos: new THREE.Vector3(-1.7, 0.3, 1.4), size: new THREE.Vector3(0.45, 0.2, 0.4), r: 0.2, smooth: 0.3 },
        ];
    }

    // Pre-calculate muscle vectors to avoid lookups in the hot loop
    prepare() {
        const getVec = (keyOrVec) => {
            if (typeof keyOrVec === 'string') return this.skeleton[keyOrVec];
            return keyOrVec;
        };

        this.cachedMuscles = this.muscles.map(m => {
            const cm = { ...m }; // shallow copy
            if (m.type === 'capsule') {
                cm._a = getVec(m.a);
                cm._b = getVec(m.b);
            } else if (m.type === 'sphere' || m.type === 'box') {
                cm._pos = getVec(m.pos);
            }
            return cm;
        });
    }

    // The Master Evaluation Function
    // Returns the signed distance to the human body surface at point P
    evaluate(p) {
        let d = 100.0; // Initial large distance
        
        // Lazy init
        if(!this.cachedMuscles) this.prepare();

        // Iterate through all muscle primitives
        for (let m of this.cachedMuscles) {
            let dist = 100.0;
            if (m.type === 'capsule') {
                dist = SDF.sdCapsule(p, m._a, m._b, m.r);
            } else if (m.type === 'sphere') {
                // Manually subtract to avoid Vector3 allocation
                const dx = p.x - m._pos.x;
                const dy = p.y - m._pos.y;
                const dz = p.z - m._pos.z;
                dist = SDF.length(dx, dy, dz) - m.r;
            } else if (m.type === 'box') {
                const dx = p.x - m._pos.x;
                const dy = p.y - m._pos.y;
                const dz = p.z - m._pos.z;
                dist = SDF.sdRoundBox({x:dx, y:dy, z:dz}, m.size, m.r);
            }

            // Blend gently into the existing shape
            d = SDF.smin(d, dist, m.smooth);
        }

        // Add detailed nose/chin features via small primitives
        // Nose
        const headPos = this.skeleton.head;
        const nosePos = new THREE.Vector3(headPos.x, headPos.y - 0.5, headPos.z + 2.0);
        const noseDist = SDF.sdCapsule(p, nosePos, new THREE.Vector3(nosePos.x, nosePos.y - 0.6, nosePos.z+0.2), 0.3);
        d = SDF.smin(d, noseDist, 0.3);

        return d;
    }
}