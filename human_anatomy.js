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

        // Muscle Definitions
        // Defined by attachment points (often relative to bones) and thickness
        this.muscles = [
            // --- Torso ---
            { type: 'box', pos: new THREE.Vector3(0, 12, 0), size: new THREE.Vector3(2.5, 3.5, 1.2), r: 0.8, smooth: 1.5 }, // Torso Core
            { type: 'capsule', a: 'neck', b: 'spineMid', r: 1.8, smooth: 1.0 }, // Spine column
            { type: 'capsule', a: 'shoulderL', b: 'shoulderR', r: 1.0, smooth: 1.2 }, // Clavicle Area
            { type: 'capsule', a: new THREE.Vector3(2.0, 15.0, -0.5), b: 'shoulderL', r: 0.9, smooth: 0.5 }, // Traps L
            { type: 'capsule', a: new THREE.Vector3(-2.0, 15.0, -0.5), b: 'shoulderR', r: 0.9, smooth: 0.5 }, // Traps R
            { type: 'box', pos: new THREE.Vector3(2.2, 13.5, 1.8), size: new THREE.Vector3(1.8, 1.5, 0.4), r: 0.6, smooth: 0.8 }, // Pecs L
            { type: 'box', pos: new THREE.Vector3(-2.2, 13.5, 1.8), size: new THREE.Vector3(1.8, 1.5, 0.4), r: 0.6, smooth: 0.8 }, // Pecs R
            { type: 'capsule', a: new THREE.Vector3(0, 12, 1.5), b: new THREE.Vector3(0, 9.5, 1.5), r: 1.3, smooth: 0.4 }, // Abs
            { type: 'sphere', pos: new THREE.Vector3(2.5, 9.0, -1.2), r: 2.1, smooth: 1.0 }, // Glutes L
            { type: 'sphere', pos: new THREE.Vector3(-2.5, 9.0, -1.2), r: 2.1, smooth: 1.0 }, // Glutes R

            // --- Head ---
            { type: 'sphere', pos: 'head', r: 2.2, smooth: 0.2 }, // Cranium
            { type: 'box', pos: new THREE.Vector3(0, 16.2, 0.8), size: new THREE.Vector3(1.2, 1.0, 1.0), r: 0.5, smooth: 0.5 }, // Face Structure

            // --- Arms (Left) ---
            { type: 'capsule', a: 'shoulderL', b: 'elbowL', r: 0.85, smooth: 0.6 }, // Bicep/Tricep
            { type: 'capsule', a: 'elbowL', b: 'wristL', r: 0.65, smooth: 0.5 }, // Forearm
            { type: 'capsule', a: 'wristL', b: 'handL', r: 0.5, smooth: 0.4 }, // Hand Palm

            // --- Arms (Right) ---
            { type: 'capsule', a: 'shoulderR', b: 'elbowR', r: 0.85, smooth: 0.6 },
            { type: 'capsule', a: 'elbowR', b: 'wristR', r: 0.65, smooth: 0.5 },
            { type: 'capsule', a: 'wristR', b: 'handR', r: 0.5, smooth: 0.4 },

            // --- Legs (Left) ---
            { type: 'capsule', a: 'hipL', b: 'kneeL', r: 1.4, smooth: 0.8 }, // Thigh (Quad/Hamstring)
            { type: 'capsule', a: 'kneeL', b: 'ankleL', r: 0.9, smooth: 0.6 }, // Calf
            { type: 'capsule', a: 'ankleL', b: 'footL', r: 0.6, smooth: 0.4 }, // Foot

             // --- Legs (Right) ---
            { type: 'capsule', a: 'hipR', b: 'kneeR', r: 1.4, smooth: 0.8 },
            { type: 'capsule', a: 'kneeR', b: 'ankleR', r: 0.9, smooth: 0.6 },
            { type: 'capsule', a: 'ankleR', b: 'footR', r: 0.6, smooth: 0.4 },
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