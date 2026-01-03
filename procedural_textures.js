import * as THREE from 'three';

export function generateSkinTextures() {
    const size = 1024;
    
    function createCanvas() {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        return c;
    }

    // 1. Base Melanin/Capillary Layer (Albedo)
    const canvasAlbedo = createCanvas();
    const ctxAlbedo = canvasAlbedo.getContext('2d');
    
    // Fill with skin tone
    ctxAlbedo.fillStyle = '#e0c0a0'; 
    ctxAlbedo.fillRect(0, 0, size, size);

    // Add noise for capillaries/imperfections
    for(let i=0; i<50000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 2;
        ctxAlbedo.fillStyle = Math.random() > 0.5 ? 'rgba(255, 100, 100, 0.05)' : 'rgba(100, 80, 60, 0.05)';
        ctxAlbedo.beginPath();
        ctxAlbedo.arc(x, y, r, 0, Math.PI*2);
        ctxAlbedo.fill();
    }

    const albedoTexture = new THREE.CanvasTexture(canvasAlbedo);
    albedoTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. Normal Map (Micro-pores)
    const canvasNormal = createCanvas();
    const ctxNormal = canvasNormal.getContext('2d');

    ctxNormal.fillStyle = '#8080ff'; // Flat normal color
    ctxNormal.fillRect(0, 0, size, size);
    
    // Draw "pores"
    for(let i=0; i<200000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 1.5;
        ctxNormal.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
        ctxNormal.beginPath();
        ctxNormal.arc(x, y, r, 0, Math.PI*2);
        ctxNormal.fill();
    }

    const normalTexture = new THREE.CanvasTexture(canvasNormal); 
    
    // 3. Roughness Map
    const canvasRough = createCanvas();
    const ctxRough = canvasRough.getContext('2d');

    ctxRough.fillStyle = '#666'; // Base roughness
    ctxRough.fillRect(0,0,size,size);
    // Oily zones
    for(let i=0; i<200; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const rad = Math.random() * 50;
        const grd = ctxRough.createRadialGradient(x,y,0, x,y,rad);
        grd.addColorStop(0, 'rgba(255,255,255,0.2)'); // Shinier
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctxRough.fillStyle = grd;
        ctxRough.beginPath(); ctxRough.arc(x,y,rad,0,Math.PI*2); ctxRough.fill();
    }
    const roughnessTexture = new THREE.CanvasTexture(canvasRough);

    return { albedo: albedoTexture, normal: normalTexture, roughness: roughnessTexture };
}