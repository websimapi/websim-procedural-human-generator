import * as THREE from 'three';

export function generateSkinTextures() {
    // High resolution for fine detail
    const size = 2048; 
    const width = size;
    const height = size;

    function createCanvas() {
        const c = document.createElement('canvas');
        c.width = width;
        c.height = height;
        return c;
    }

    // --- 1. Generate Height/Displacement Map (Source of Truth) ---
    // We use this to derive Normal and Roughness for consistency.
    // Lighter = Higher, Darker = Lower/Deeper (Pores)
    const cvsHeight = createCanvas();
    const ctxHeight = cvsHeight.getContext('2d');
    
    // Base Gray (Mid-point)
    ctxHeight.fillStyle = '#808080';
    ctxHeight.fillRect(0, 0, width, height);
    
    // Optimization: Use fillRect for tiny particles
    function addNoise(ctx, count, minSize, maxSize, alpha, colorVal) {
        // Batch same styles
        const val = Math.floor(colorVal); 
        ctx.fillStyle = `rgba(${val}, ${val}, ${val}, ${alpha})`;
        
        for (let i = 0; i < count; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const s = minSize + Math.random() * (maxSize - minSize);
            
            if (s <= 2.0) {
                ctx.fillRect(x, y, s, s);
            } else {
                ctx.beginPath();
                ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // A. General Skin Undulation (Low freq bumps)
    addNoise(ctxHeight, 200, 20, 150, 0.02, 255); 
    addNoise(ctxHeight, 200, 20, 150, 0.02, 0);   

    // B. Fine Skin Grain (High freq) - The "Cellular" look
    addNoise(ctxHeight, 100000, 1, 3, 0.04, 255);
    addNoise(ctxHeight, 100000, 1, 3, 0.04, 0);

    // C. Pores (Sharp depressions)
    addNoise(ctxHeight, 30000, 0.5, 2.0, 0.1, 0);
    
    // D. Micro-wrinkles (Scratchy noise)
    ctxHeight.strokeStyle = 'rgba(0,0,0,0.05)';
    ctxHeight.lineWidth = 1;
    ctxHeight.beginPath();
    for(let i=0; i<5000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const len = 5 + Math.random() * 20;
        const ang = Math.random() * Math.PI * 2;
        ctxHeight.moveTo(x, y);
        ctxHeight.lineTo(x + Math.cos(ang)*len, y + Math.sin(ang)*len);
    }
    ctxHeight.stroke();

    const imgDataHeight = ctxHeight.getImageData(0, 0, width, height);
    const dataHeight = imgDataHeight.data;

    // --- 2. Generate Normal Map from Height ---
    const cvsNormal = createCanvas();
    const ctxNormal = cvsNormal.getContext('2d');
    const imgDataNormal = ctxNormal.createImageData(width, height);
    const dataNormal = imgDataNormal.data;

    // Strength of normal map bumps
    const strength = 4.0; 

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Get neighbors (wrapping)
            const xL = (x - 1 + width) % width;
            const xR = (x + 1) % width;
            const yU = (y - 1 + height) % height;
            const yD = (y + 1) % height;

            // Height values (Red channel is sufficient as it's grayscale)
            // Indices: (y*w + x)*4
            const hL = dataHeight[(y * width + xL) * 4] / 255.0;
            const hR = dataHeight[(y * width + xR) * 4] / 255.0;
            const hU = dataHeight[(yU * width + x) * 4] / 255.0;
            const hD = dataHeight[(yD * width + x) * 4] / 255.0;

            // Calculate Slopes
            const dX = (hL - hR) * strength;
            const dY = (hU - hD) * strength;
            const dZ = 1.0 / strength; // Z component

            // Normalize vector
            const invLen = 1.0 / Math.sqrt(dX * dX + dY * dY + dZ * dZ);
            const nX = dX * invLen;
            const nY = dY * invLen;
            const nZ = dZ * invLen;

            // Map [-1, 1] to [0, 255]
            const idx = (y * width + x) * 4;
            dataNormal[idx]     = (nX * 0.5 + 0.5) * 255; // R
            dataNormal[idx + 1] = (nY * 0.5 + 0.5) * 255; // G
            dataNormal[idx + 2] = (nZ * 0.5 + 0.5) * 255; // B
            dataNormal[idx + 3] = 255;                    // A
        }
    }
    ctxNormal.putImageData(imgDataNormal, 0, 0);
    const normalTexture = new THREE.CanvasTexture(cvsNormal);
    // Important: Normal maps are non-color data
    normalTexture.colorSpace = THREE.NoColorSpace; 

    // --- 3. Generate Albedo (Color) ---
    const cvsAlbedo = createCanvas();
    const ctxAlbedo = cvsAlbedo.getContext('2d');
    
    // Base Melanin (Average Skin Tone)
    ctxAlbedo.fillStyle = '#e8cbb0'; 
    ctxAlbedo.fillRect(0, 0, width, height);

    // Subsurface Scattering Fake (Mottling)
    // Red (Blood)
    ctxAlbedo.globalCompositeOperation = 'overlay';
    for(let i=0; i<1000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = 20 + Math.random() * 100;
        ctxAlbedo.fillStyle = `rgba(220, 80, 80, ${0.03 + Math.random()*0.03})`;
        ctxAlbedo.beginPath(); ctxAlbedo.arc(x,y,r,0,Math.PI*2); ctxAlbedo.fill();
    }
    // Blue (Veins/Deep tissue)
    for(let i=0; i<600; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = 30 + Math.random() * 120;
        ctxAlbedo.fillStyle = `rgba(60, 80, 180, ${0.02 + Math.random()*0.02})`;
        ctxAlbedo.beginPath(); ctxAlbedo.arc(x,y,r,0,Math.PI*2); ctxAlbedo.fill();
    }
    
    // High Frequency Detail (Freckles/Pigment)
    ctxAlbedo.globalCompositeOperation = 'multiply';
    addNoise(ctxAlbedo, 40000, 1, 3, 0.08, 160); 

    // Bake AO from Height Map (Darken pores)
    const imgDataAlbedo = ctxAlbedo.getImageData(0, 0, width, height);
    const dataAlbedo = imgDataAlbedo.data;
    
    for(let i=0; i<dataAlbedo.length; i+=4) {
        const h = dataHeight[i]; // 0-255
        // If h is low (pit), darken slightly
        // Map 0..255 -> 0.85..1.0
        const factor = 0.85 + (h/255.0) * 0.15;
        
        dataAlbedo[i]   *= factor;
        dataAlbedo[i+1] *= factor;
        dataAlbedo[i+2] *= factor;
    }
    ctxAlbedo.putImageData(imgDataAlbedo, 0, 0);
    
    const albedoTexture = new THREE.CanvasTexture(cvsAlbedo);
    albedoTexture.colorSpace = THREE.SRGBColorSpace;

    // --- 4. Generate Roughness ---
    const cvsRough = createCanvas();
    const ctxRough = cvsRough.getContext('2d');
    
    // Base roughness
    ctxRough.fillStyle = '#707070'; 
    ctxRough.fillRect(0,0,width,height);
    
    const imgDataRough = ctxRough.getImageData(0,0,width,height);
    const dataRough = imgDataRough.data;
    
    for(let i=0; i<dataRough.length; i+=4) {
        const h = dataHeight[i];
        // Skin Micro-geometry:
        // Pits (Pores) = Rougher (Higher value)
        // Peaks = Shinier (Lower value)
        
        // Invert Height map influence
        // h=0 (pit) -> +0.15
        // h=255 (peak) -> -0.05
        const mod = (1.0 - (h/255.0)) * 0.2 - 0.05;
        
        let rVal = dataRough[i] / 255.0;
        rVal += mod;
        
        // Add some random noise variation for "dryness"
        rVal += (Math.random() - 0.5) * 0.05;
        
        rVal = Math.max(0.2, Math.min(0.9, rVal)); // Clamp
        
        const byteVal = Math.floor(rVal * 255);
        dataRough[i] = byteVal;
        dataRough[i+1] = byteVal;
        dataRough[i+2] = byteVal;
        dataRough[i+3] = 255;
    }
    ctxRough.putImageData(imgDataRough, 0, 0);
    const roughnessTexture = new THREE.CanvasTexture(cvsRough);

    return { albedo: albedoTexture, normal: normalTexture, roughness: roughnessTexture };
}