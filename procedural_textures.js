import * as THREE from 'three';

export function generateSkinTextures() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 1. Base Melanin/Capillary Layer (Albedo)
    // Fill with skin tone
    ctx.fillStyle = '#e0c0a0'; 
    ctx.fillRect(0, 0, size, size);

    // Add noise for capillaries/imperfections
    for(let i=0; i<50000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 2;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 100, 100, 0.05)' : 'rgba(100, 80, 60, 0.05)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI*2);
        ctx.fill();
    }

    const albedoTexture = new THREE.CanvasTexture(canvas);
    albedoTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. Normal/Roughness Map (Micro-pores)
    // We clear and draw noise
    ctx.fillStyle = '#8080ff'; // Flat normal color
    ctx.fillRect(0, 0, size, size);
    
    // Draw "pores"
    for(let i=0; i<200000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 1.5;
        // Pores are indentations, so we tweak the normal color
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI*2);
        ctx.fill();
    }

    const normalTexture = new THREE.CanvasTexture(canvas); // Simplified usage, ideally needs proper normal map generation logic
    
    // Roughness
    ctx.fillStyle = '#666'; // Base roughness
    ctx.fillRect(0,0,size,size);
    // Oily zones
    for(let i=0; i<200; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const rad = Math.random() * 50;
        const grd = ctx.createRadialGradient(x,y,0, x,y,rad);
        grd.addColorStop(0, 'rgba(255,255,255,0.2)'); // Shinier
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(x,y,rad,0,Math.PI*2); ctx.fill();
    }
    const roughnessTexture = new THREE.CanvasTexture(canvas);

    return { albedo: albedoTexture, normal: normalTexture, roughness: roughnessTexture };
}