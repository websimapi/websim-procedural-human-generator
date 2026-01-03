// Mathematical primitives for Organic Modeling
// Using Signed Distance Fields (SDF)

export const SDF = {
    // Basic Vector Math helpers for SDF evaluation
    length: (x, y, z) => Math.sqrt(x*x + y*y + z*z),
    
    // Smooth Minimum (Polynomial) - Essential for muscle blending
    // k = blending factor (0.1 is sharp, 0.5 is very blobbly)
    smin: (a, b, k) => {
        const h = Math.max(k - Math.abs(a - b), 0.0) / k;
        return Math.min(a, b) - h * h * k * (1.0 / 4.0);
    },

    // Primitive: Sphere
    sdSphere: (p, r) => {
        return SDF.length(p.x, p.y, p.z) - r;
    },

    // Primitive: Capsule (The building block of muscles/limbs)
    // p: sampling point, a: start, b: end, r: radius
    sdCapsule: (p, a, b, r) => {
        const pax = p.x - a.x, pay = p.y - a.y, paz = p.z - a.z;
        const bax = b.x - a.x, bay = b.y - a.y, baz = b.z - a.z;
        
        const h = Math.max(0, Math.min(1, (pax*bax + pay*bay + paz*baz) / (bax*bax + bay*bay + baz*baz)));
        
        const dx = pax - bax * h;
        const dy = pay - bay * h;
        const dz = paz - baz * h;
        
        return SDF.length(dx, dy, dz) - r;
    },

    // Primitive: Round Box (For Torso/Pelvis core)
    sdRoundBox: (p, b, r) => {
        const qx = Math.abs(p.x) - b.x;
        const qy = Math.abs(p.y) - b.y;
        const qz = Math.abs(p.z) - b.z;
        
        const ox = Math.max(qx, 0);
        const oy = Math.max(qy, 0);
        const oz = Math.max(qz, 0);
        
        const ix = Math.min(Math.max(qx, qy, qz), 0);
        
        return SDF.length(ox, oy, oz) + ix - r;
    },

    // Primitive: Ellipsoid
    sdEllipsoid: (p, r) => {
        const k0 = SDF.length(p.x/r.x, p.y/r.y, p.z/r.z);
        const k1 = SDF.length(p.x/(r.x*r.x), p.y/(r.y*r.y), p.z/(r.z*r.z));
        return k0 * (k0 - 1.0) / k1;
    },

    // Modifier: Displacement (for details)
    displacement: (p, freq, amp) => {
        return Math.sin(freq * p.x) * Math.sin(freq * p.y) * Math.sin(freq * p.z) * amp;
    }
};