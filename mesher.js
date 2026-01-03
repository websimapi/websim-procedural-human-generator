import * as THREE from 'three';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';

// A Marching Cubes implementation utilizing Three.js addons for topology
export class Mesher {
    constructor(anatomy, bounds, resolution) {
        this.anatomy = anatomy;
        this.bounds = bounds; // { min: vec3, max: vec3 }
        this.resolution = resolution;
    }

    // Generating the geometry
    generate(onProgress) {
        const res = this.resolution;
        
        // Initialize Three.js Marching Cubes
        // Resolution is the number of cells along one axis
        // We must provide a material to avoid internal crashes in some versions of MarchingCubes
        const mc = new MarchingCubes(res, new THREE.MeshBasicMaterial({ visible: false }), false, false);
        mc.isolation = 0.0; // Surface at value 0

        const field = mc.field;
        const total = res * res * res;
        
        // Populate the field with SDF values
        // We invert the SDF because MC expects positive values "inside" the volume
        // and we are setting the threshold (isolation) to 0.
        // Actually, MC convention: value > isolation = inside.
        // SDF: d < 0 = inside.
        // So we store -d. (-(-1) = 1 > 0).
        
        const lerp = (a, b, t) => a + (b - a) * t;

        for (let k = 0; k < res; k++) { // z
            const z = lerp(this.bounds.min.z, this.bounds.max.z, k / (res-1));
            for (let j = 0; j < res; j++) { // y
                const y = lerp(this.bounds.min.y, this.bounds.max.y, j / (res-1));
                for (let i = 0; i < res; i++) { // x
                    const x = lerp(this.bounds.min.x, this.bounds.max.x, i / (res-1));
                    
                    const d = this.anatomy.evaluate(new THREE.Vector3(x, y, z));
                    
                    // MC Indexing: x + y*res + z*res*res
                    const index = i + j * res + k * res * res;
                    field[index] = -d;
                }
            }
            // Report progress occasionally
            if (k % 5 === 0 && onProgress) onProgress(k / res);
        }

        // Generate geometry (triangulation)
        try {
            mc.update();
        } catch (e) {
            console.warn("MarchingCubes update failed (likely resolution/material issue), skipping frame", e);
            return new THREE.BufferGeometry();
        }
        
        // The generated geometry is in a local normalized space [-1, 1].
        // We need to transform it to world space.
        const geometry = mc.geometry.clone();
        
        const size = new THREE.Vector3().subVectors(this.bounds.max, this.bounds.min);
        const center = new THREE.Vector3().addVectors(this.bounds.min, this.bounds.max).multiplyScalar(0.5);
        
        // Scale and Translate
        // Three.js MC creates a box from -1 to 1.
        geometry.scale(size.x / 2, size.y / 2, size.z / 2);
        geometry.translate(center.x, center.y, center.z);
        
        // Post-process: High quality normals from SDF gradient
        const posAttr = geometry.attributes.position;
        const normAttr = geometry.attributes.normal;
        const p = new THREE.Vector3();
        const n = new THREE.Vector3();
        
        for(let i=0; i<posAttr.count; i++) {
            p.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
            
            // Calculate Gradient
            const e = 0.05;
            const d = this.anatomy.evaluate(p);
            const dx = this.anatomy.evaluate(new THREE.Vector3(p.x + e, p.y, p.z)) - d;
            const dy = this.anatomy.evaluate(new THREE.Vector3(p.x, p.y + e, p.z)) - d;
            const dz = this.anatomy.evaluate(new THREE.Vector3(p.x, p.y, p.z + e)) - d;
            
            n.set(dx, dy, dz).normalize();
            normAttr.setXYZ(i, n.x, n.y, n.z);
        }

        // Post-process: Cylindrical UV Mapping
        if(!geometry.attributes.uv) {
             geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(posAttr.count * 2), 2));
        }
        const uvAttr = geometry.attributes.uv;
        for(let i=0; i<posAttr.count; i++) {
            p.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
            
            // Cylindrical projection
            const theta = Math.atan2(p.x, p.z); // -PI to PI
            const u = (theta + Math.PI) / (2 * Math.PI);
            const v = (p.y - this.bounds.min.y) / size.y;
            
            uvAttr.setXY(i, u, v);
        }

        return geometry;
    }
}