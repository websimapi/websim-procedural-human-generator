import { SDF } from './sdf_math.js';
import * as THREE from 'three';

// Anthropometric Data Class
export class HumanAnatomy {
    constructor() {
        // Standard human proportions (based on 8-head height)
        this.scale = 1.0;
        this.height = 180 * this.scale; // cm (conceptual)
        
        // Joint positions (Simplified hierarchy for SDF evaluation)
        // Coordinates: X (Left/Right), Y (Up/Down), Z (Front/Back)
        this.skeleton = {
            head: new THREE.Vector3(0, 17.5, 0),
            neck: new THREE.Vector3(0, 15.0, 0),
            shoulderL: new THREE.Vector3(4.0, 14.5, -0.5),
            shoulderR: new THREE.Vector3(-4.0, 14.5, -0.5),
            elbowL: new THREE.Vector3(6.5, 10.5, 0.5),
            elbowR: new THREE.Vector3(-6.5, 10.5, 0.5),
            wristL: new THREE.Vector3(7.5, 6.5, 0),
            wristR: new THREE.Vector3(-7.5, 6.5, 0),
            handL: new THREE.Vector3(8.0, 4.5, 0),
            handR: new THREE.Vector3(-8.0, 4.5, 0),
            
            chest: new THREE.Vector3(0, 13, 0.5),
            spineMid: new THREE.Vector3(0, 10, -0.5),
            pelvis: new THREE.Vector3(0, 9.0, 0),
            hipL: new THREE.Vector3(2.5, 9.0, 0),
            hipR: new THREE.Vector3(-2.5, 9.0, 0),
            kneeL: new THREE.Vector3(2.5, 5.0, 1.0),
            kneeR: new THREE.Vector3(-2.5, 5.0, 1.0),
            ankleL: new THREE.Vector3(2.5, 1.0, 0),
            ankleR: new THREE.Vector3(-2.5, 1.0, 0),
            footL: new THREE.Vector3(2.8, 0, 1.5),
            footR: new THREE.Vector3(-2.8, 0, 1.5),
        };

        // Muscle Definitions - Refined for Realistic Anatomy
        // Using a combination of Capsules (limbs), RoundBoxes (core volumes), and Spheres (joints/bulges)
        this.muscles = [
            // --- Core / Torso ---
            // Ribcage (Wider at top, creates the V-taper)
            { type: 'box', pos: new THREE.Vector3(0, 13.5, 0), size: new THREE.Vector3(3.4, 2.8, 1.6), r: 0.8, smooth: 1.2 },
            // Abdominal Wall (Connection between Ribs and Pelvis)
            { type: 'capsule', a: new THREE.Vector3(0, 12.0, 0.8), b: new THREE.Vector3(0, 9.5, 0.5), r: 2.2, smooth: 1.0 },
            // Pelvis (Wider base)
            { type: 'box', pos: new THREE.Vector3(0, 9.0, 0), size: new THREE.Vector3(3.4, 1.8, 1.6), r: 0.8, smooth: 1.2 },
            
            // --- Upper Body Musculature ---
            // Trapezius (Neck to Shoulder slope)
            { type: 'capsule', a: new THREE.Vector3(0, 15.2, -0.5), b: new THREE.Vector3(3.0, 14.8, -0.8), r: 1.2, smooth: 0.8 },
            { type: 'capsule', a: new THREE.Vector3(0, 15.2, -0.5), b: new THREE.Vector3(-3.0, 14.8, -0.8), r: 1.2, smooth: 0.8 },
            
            // Latissimus Dorsi (Back width)
            { type: 'capsule', a: new THREE.Vector3(0, 11.5, -0.8), b: new THREE.Vector3(3.2, 13.5, -1.0), r: 1.6, smooth: 1.2 },
            { type: 'capsule', a: new THREE.Vector3(0, 11.5, -0.8), b: new THREE.Vector3(-3.2, 13.5, -1.0), r: 1.6, smooth: 1.2 },

            // Pectorals (Chest) - Flattened and angled
            { type: 'box', pos: new THREE.Vector3(2.0, 13.8, 1.5), size: new THREE.Vector3(1.5, 1.2, 0.3), r: 0.7, smooth: 0.8 },
            { type: 'box', pos: new THREE.Vector3(-2.0, 13.8, 1.5), size: new THREE.Vector3(1.5, 1.2, 0.3), r: 0.7, smooth: 0.8 },

            // Gluteus Maximus (Buttocks)
            { type: 'sphere', pos: new THREE.Vector3(2.2, 9.0, -1.5), r: 2.4, smooth: 1.0 },
            { type: 'sphere', pos: new THREE.Vector3(-2.2, 9.0, -1.5), r: 2.4, smooth: 1.0 },

            // --- Arms ---
            // Deltoids (Shoulder Cap)
            { type: 'sphere', pos: 'shoulderL', r: 1.8, smooth: 0.7 },
            { type: 'sphere', pos: 'shoulderR', r: 1.8, smooth: 0.7 },

            // Upper Arm (Bicep/Tricep volume)
            { type: 'capsule', a: new THREE.Vector3(4.2, 14.0, 0), b: 'elbowL', r: 1.2, smooth: 0.6 },
            { type: 'capsule', a: new THREE.Vector3(-4.2, 14.0, 0), b: 'elbowR', r: 1.2, smooth: 0.6 },
            
            // Forearm (Tapered feel via thinner capsule)
            { type: 'capsule', a: 'elbowL', b: 'wristL', r: 0.95, smooth: 0.5 },
            { type: 'capsule', a: 'elbowR', b: 'wristR', r: 0.95, smooth: 0.5 },
            
            // Hands (Simple volume)
            { type: 'box', pos: 'handL', size: new THREE.Vector3(0.6, 1.1, 0.3), r: 0.4, smooth: 0.4 },
            { type: 'box', pos: 'handR', size: new THREE.Vector3(0.6, 1.1, 0.3), r: 0.4, smooth: 0.4 },

            // --- Legs ---
            // Thighs (Quadriceps/Hamstrings) - Thicker
            { type: 'capsule', a: 'hipL', b: 'kneeL', r: 1.9, smooth: 0.9 }, 
            { type: 'capsule', a: 'hipR', b: 'kneeR', r: 1.9, smooth: 0.9 },
            
            // Knees (Patella definition)
            { type: 'sphere', pos: 'kneeL', r: 1.1, smooth: 0.4 },
            { type: 'sphere', pos: 'kneeR', r: 1.1, smooth: 0.4 },

            // Calves (Gastrocnemius bulge)
            { type: 'capsule', a: 'kneeL', b: 'ankleL', r: 1.1, smooth: 0.6 }, // Bone/lower leg
            { type: 'sphere', pos: new THREE.Vector3(2.5, 4.0, 0.5), r: 1.4, smooth: 0.8 }, // Muscle Belly L
            { type: 'capsule', a: 'kneeR', b: 'ankleR', r: 1.1, smooth: 0.6 },
            { type: 'sphere', pos: new THREE.Vector3(-2.5, 4.0, 0.5), r: 1.4, smooth: 0.8 }, // Muscle Belly R

            // Feet (Flattened bottom)
            { type: 'box', pos: new THREE.Vector3(2.8, 0.4, 0.8), size: new THREE.Vector3(1.2, 0.6, 2.4), r: 0.3, smooth: 0.4 },
            { type: 'box', pos: new THREE.Vector3(-2.8, 0.4, 0.8), size: new THREE.Vector3(1.2, 0.6, 2.4), r: 0.3, smooth: 0.4 },

            // --- Head & Neck ---
            { type: 'capsule', a: new THREE.Vector3(0, 15.0, 0), b: new THREE.Vector3(0, 16.5, 0), r: 1.4, smooth: 0.6 }, // Neck
            { type: 'sphere', pos: new THREE.Vector3(0, 17.5, 0.2), r: 2.3, smooth: 0.3 }, // Cranium
            { type: 'box', pos: new THREE.Vector3(0, 16.5, 1.2), size: new THREE.Vector3(1.3, 1.2, 0.8), r: 0.6, smooth: 0.5 }, // Jaw/Face
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
        // Nose/Facial Features
        const headPos = this.skeleton.head;
        // Adjust nose position to protrude from the new head size
        const nosePos = new THREE.Vector3(headPos.x, headPos.y - 0.8, headPos.z + 2.5);
        const noseTip = new THREE.Vector3(nosePos.x, nosePos.y - 0.4, nosePos.z + 0.3);
        const noseDist = SDF.sdCapsule(p, nosePos, noseTip, 0.25);
        d = SDF.smin(d, noseDist, 0.2);

        return d;
    }
}