import { SDF } from './sdf_math.js';
import * as THREE from 'three';

// Anthropometric Data Class
export class HumanAnatomy {
    constructor() {
        // Standard human proportions
        this.scale = 1.0;
        
        // Joint positions
        // Refined for better stance and proportions
        this.skeleton = {
            head: new THREE.Vector3(0, 17.5, 0.2),
            neck: new THREE.Vector3(0, 15.0, 0),
            
            shoulderL: new THREE.Vector3(4.2, 14.5, -0.5),
            shoulderR: new THREE.Vector3(-4.2, 14.5, -0.5),
            elbowL: new THREE.Vector3(6.8, 10.5, 0.2),
            elbowR: new THREE.Vector3(-6.8, 10.5, 0.2),
            wristL: new THREE.Vector3(7.8, 6.5, 0),
            wristR: new THREE.Vector3(-7.8, 6.5, 0),
            
            chest: new THREE.Vector3(0, 13, 0.5),
            spineMid: new THREE.Vector3(0, 10, -0.5),
            pelvis: new THREE.Vector3(0, 9.0, 0),
            
            // Hips slightly closer for more natural stance
            hipL: new THREE.Vector3(2.2, 9.0, 0),
            hipR: new THREE.Vector3(-2.2, 9.0, 0),
            kneeL: new THREE.Vector3(2.3, 5.0, 0.8),
            kneeR: new THREE.Vector3(-2.3, 5.0, 0.8),
            ankleL: new THREE.Vector3(2.5, 1.0, 0),
            ankleR: new THREE.Vector3(-2.5, 1.0, 0),
            
            // Feet planting
            footL: new THREE.Vector3(2.8, 0, 1.8),
            footR: new THREE.Vector3(-2.8, 0, 1.8),
        };

        this.muscles = [
            // --- Core / Torso ---
            { type: 'box', pos: new THREE.Vector3(0, 12, -0.2), size: new THREE.Vector3(2.4, 3.5, 1.1), r: 0.9, smooth: 1.5 }, // Torso Core
            { type: 'capsule', a: 'neck', b: 'spineMid', r: 1.8, smooth: 1.0 }, // Spine column
            { type: 'capsule', a: 'shoulderL', b: 'shoulderR', r: 0.8, smooth: 1.2 }, // Clavicle Area
            
            // Neck Details (Sternocleidomastoid)
            { type: 'capsule', a: new THREE.Vector3(1.2, 16.5, 0.5), b: new THREE.Vector3(0.5, 15.0, 1.0), r: 0.3, smooth: 0.4 }, 
            { type: 'capsule', a: new THREE.Vector3(-1.2, 16.5, 0.5), b: new THREE.Vector3(-0.5, 15.0, 1.0), r: 0.3, smooth: 0.4 },

            // Traps
            { type: 'capsule', a: new THREE.Vector3(1.5, 15.5, -0.5), b: 'shoulderL', r: 1.0, smooth: 0.8 }, 
            { type: 'capsule', a: new THREE.Vector3(-1.5, 15.5, -0.5), b: 'shoulderR', r: 1.0, smooth: 0.8 }, 

            // Pecs (Refined) - Angled slightly for mass
            { type: 'box', pos: new THREE.Vector3(2.1, 13.5, 1.4), size: new THREE.Vector3(1.6, 1.1, 0.3), r: 1.1, smooth: 0.8 },
            { type: 'box', pos: new THREE.Vector3(-2.1, 13.5, 1.4), size: new THREE.Vector3(1.6, 1.1, 0.3), r: 1.1, smooth: 0.8 },

            // Lats (Wings)
            { type: 'capsule', a: new THREE.Vector3(3.5, 13.0, -0.8), b: new THREE.Vector3(2.0, 10.0, -0.8), r: 1.2, smooth: 1.0 },
            { type: 'capsule', a: new THREE.Vector3(-3.5, 13.0, -0.8), b: new THREE.Vector3(-2.0, 10.0, -0.8), r: 1.2, smooth: 1.0 },

            // Abs (Rectus Abdominis) - Upper and Lower
            { type: 'capsule', a: new THREE.Vector3(0, 12.5, 1.6), b: new THREE.Vector3(0, 10.5, 1.6), r: 1.1, smooth: 0.4 }, 
            { type: 'capsule', a: new THREE.Vector3(0, 10.5, 1.5), b: new THREE.Vector3(0, 8.5, 1.4), r: 1.1, smooth: 0.4 },

            // Glutes
            { type: 'sphere', pos: new THREE.Vector3(2.2, 9.0, -1.2), r: 2.3, smooth: 1.0 },
            { type: 'sphere', pos: new THREE.Vector3(-2.2, 9.0, -1.2), r: 2.3, smooth: 1.0 },

            // --- Head ---
            { type: 'sphere', pos: 'head', r: 2.2, smooth: 0.2 }, // Cranium
            { type: 'box', pos: new THREE.Vector3(0, 16.2, 0.8), size: new THREE.Vector3(1.2, 1.1, 1.0), r: 0.6, smooth: 0.5 }, // Face Structure

            // --- Arms (Left) ---
            { type: 'capsule', a: 'shoulderL', b: new THREE.Vector3(4.5, 13.0, -0.5), r: 1.3, smooth: 0.7 }, // Deltoid
            { type: 'capsule', a: 'shoulderL', b: 'elbowL', r: 0.9, smooth: 0.6 }, // Bicep/Tricep
            { type: 'capsule', a: 'elbowL', b: 'wristL', r: 0.7, smooth: 0.5 }, // Forearm

            // Hand (Left) - Detailed
            { type: 'box', pos: new THREE.Vector3(7.9, 5.5, 0), size: new THREE.Vector3(0.5, 0.7, 0.2), r: 0.35, smooth: 0.3 }, // Palm
            // Fingers (Thumb, Index, Middle, Ring, Pinky) - Thicked slightly for voxel safety
            { type: 'capsule', a: new THREE.Vector3(7.7, 5.6, 0.3), b: new THREE.Vector3(7.9, 5.0, 0.5), r: 0.22, smooth: 0.15 }, // Thumb
            { type: 'capsule', a: new THREE.Vector3(7.8, 4.8, 0.2), b: new THREE.Vector3(7.9, 3.8, 0.25), r: 0.20, smooth: 0.1 }, // Index
            { type: 'capsule', a: new THREE.Vector3(8.0, 4.8, 0.05), b: new THREE.Vector3(8.2, 3.7, 0.05), r: 0.21, smooth: 0.1 }, // Middle
            { type: 'capsule', a: new THREE.Vector3(8.2, 4.8, -0.1), b: new THREE.Vector3(8.5, 3.8, -0.15), r: 0.20, smooth: 0.1 }, // Ring
            { type: 'capsule', a: new THREE.Vector3(8.4, 4.9, -0.25), b: new THREE.Vector3(8.7, 4.1, -0.3), r: 0.19, smooth: 0.1 }, // Pinky

            // --- Arms (Right) ---
            { type: 'capsule', a: 'shoulderR', b: new THREE.Vector3(-4.5, 13.0, -0.5), r: 1.3, smooth: 0.7 }, // Deltoid
            { type: 'capsule', a: 'shoulderR', b: 'elbowR', r: 0.9, smooth: 0.6 },
            { type: 'capsule', a: 'elbowR', b: 'wristR', r: 0.7, smooth: 0.5 },

             // Hand (Right) - Detailed
            { type: 'box', pos: new THREE.Vector3(-7.9, 5.5, 0), size: new THREE.Vector3(0.5, 0.7, 0.2), r: 0.35, smooth: 0.3 }, // Palm
            { type: 'capsule', a: new THREE.Vector3(-7.7, 5.6, 0.3), b: new THREE.Vector3(-7.9, 5.0, 0.5), r: 0.22, smooth: 0.15 }, // Thumb
            { type: 'capsule', a: new THREE.Vector3(-7.8, 4.8, 0.2), b: new THREE.Vector3(-7.9, 3.8, 0.25), r: 0.20, smooth: 0.1 }, // Index
            { type: 'capsule', a: new THREE.Vector3(-8.0, 4.8, 0.05), b: new THREE.Vector3(-8.2, 3.7, 0.05), r: 0.21, smooth: 0.1 }, // Middle
            { type: 'capsule', a: new THREE.Vector3(-8.2, 4.8, -0.1), b: new THREE.Vector3(-8.5, 3.8, -0.15), r: 0.20, smooth: 0.1 }, // Ring
            { type: 'capsule', a: new THREE.Vector3(-8.4, 4.9, -0.25), b: new THREE.Vector3(-8.7, 4.1, -0.3), r: 0.19, smooth: 0.1 }, // Pinky


            // --- Legs (Left) ---
            { type: 'capsule', a: 'hipL', b: 'kneeL', r: 1.4, smooth: 0.8 }, // Quads
            // Adductor (Inner Thigh) - Fills the gap
            { type: 'capsule', a: new THREE.Vector3(2.2, 8.5, 0.2), b: new THREE.Vector3(2.3, 6.0, 0.5), r: 1.1, smooth: 0.7 },
            
            { type: 'capsule', a: 'kneeL', b: 'ankleL', r: 0.9, smooth: 0.6 }, // Calf
            
            // Foot Left
            { type: 'box', pos: new THREE.Vector3(2.6, 0.4, 0.5), size: new THREE.Vector3(0.55, 0.4, 0.9), r: 0.2, smooth: 0.4 }, // Heel/Mid
            { type: 'box', pos: new THREE.Vector3(2.7, 0.3, 1.8), size: new THREE.Vector3(0.6, 0.25, 0.5), r: 0.25, smooth: 0.3 }, // Toes

             // --- Legs (Right) ---
            { type: 'capsule', a: 'hipR', b: 'kneeR', r: 1.4, smooth: 0.8 },
            { type: 'capsule', a: new THREE.Vector3(-2.2, 8.5, 0.2), b: new THREE.Vector3(-2.3, 6.0, 0.5), r: 1.1, smooth: 0.7 }, // Adductor
            
            { type: 'capsule', a: 'kneeR', b: 'ankleR', r: 0.9, smooth: 0.6 },
            
            // Foot Right
            { type: 'box', pos: new THREE.Vector3(-2.6, 0.4, 0.5), size: new THREE.Vector3(0.55, 0.4, 0.9), r: 0.2, smooth: 0.4 },
            { type: 'box', pos: new THREE.Vector3(-2.7, 0.3, 1.8), size: new THREE.Vector3(0.6, 0.25, 0.5), r: 0.25, smooth: 0.3 },
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