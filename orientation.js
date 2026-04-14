import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let earthMesh, moonOrbitGroup, moonMesh, sunOrbitGroup, sunMesh;

const moonDOM_Orb = document.getElementById('t-moon-orb');
const sunDOM_Orb = document.getElementById('t-sun-orb');

let lastMoonOrb = "";
let lastSunOrb = "";

const container = document.getElementById('three-container');

function init() {
    if (!container) {
        console.error("ThreeJS container not found.");
        return;
    }
    
    // 1. SCENE SETUP
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 2000);
    // Camera is pulled further back since the Sun is now orbiting the Earth at a large radius
    camera.position.set(0, 150, 400);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
    renderer.setClearColor(0x000000, 0); // Transparent to show CSS background
    // Enable realistic shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 50;
    controls.maxDistance = 800;

    // 2. LIGHTING
    // Elevated ambient light ensures the dark side of the planets isn't completely pitch black
    const ambientLight = new THREE.AmbientLight(0x222222); 
    scene.add(ambientLight);

    // 3. TEXTURES
    const tl = new THREE.TextureLoader();

    // Using high resolution 8K equirectangular textures
    const earthTex = tl.load('assets/8k_earth_real.jpg');
    const moonTex = tl.load('assets/8k_moon.png');
    const sunTex = tl.load('assets/8k_sun.png');

    // 4. MESHES & HIERARCHY
    
    // --> EARTH (AT SCENE ORIGIN)
    // Using MeshBasicMaterial so it ignores lighting and is always 100% brightly styled
    const earthGeom = new THREE.SphereGeometry(15, 64, 64);
    const earthMat = new THREE.MeshBasicMaterial({ 
        map: earthTex,
        color: 0xffffff 
    });
    earthMesh = new THREE.Mesh(earthGeom, earthMat);
    earthMesh.receiveShadow = true;
    earthMesh.castShadow = true;
    
    // Apply realistic 23.5° axial tilt
    earthMesh.rotation.z = 23.5 * (Math.PI / 180);
    scene.add(earthMesh);

    // --> MOON ORBIT
    moonOrbitGroup = new THREE.Group();
    // Moon orbit is tilted ~5.1° relative to Earth's equator
    moonOrbitGroup.rotation.x = 5.14 * (Math.PI / 180); 
    scene.add(moonOrbitGroup);

    // MOON MESH
    const moonDist = 45;
    const moonGeom = new THREE.SphereGeometry(4, 32, 32);
    // MeshBasicMaterial ensures it is always visible without light dependency
    const moonMat = new THREE.MeshBasicMaterial({ 
        map: moonTex, 
        color: 0xffffff
    });
    moonMesh = new THREE.Mesh(moonGeom, moonMat);
    moonMesh.position.set(moonDist, 0, 0);
    moonMesh.castShadow = true;
    moonMesh.receiveShadow = true;
    moonOrbitGroup.add(moonMesh);

    // MOON ORBIT RING (Visual Guide)
    const moonRingGeom = new THREE.RingGeometry(moonDist - 0.2, moonDist + 0.2, 64);
    const moonRingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const moonRing = new THREE.Mesh(moonRingGeom, moonRingMat);
    moonRing.rotation.x = Math.PI / 2;
    moonOrbitGroup.add(moonRing);

    // --> SUN ORBIT
    sunOrbitGroup = new THREE.Group();
    scene.add(sunOrbitGroup);

    // SUN MESH
    const sunDist = 200;
    const sunGeom = new THREE.SphereGeometry(25, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ 
        map: sunTex,
        color: 0xffffee // Bright core combined with the texture 
    });
    sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunMesh.position.set(sunDist, 0, 0);
    sunOrbitGroup.add(sunMesh);

    // SUN LIGHT (Radiates outward from Sun towards Earth/Moon)
    const pointLight = new THREE.PointLight(0xffeedd, 5, 2000);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 2048;
    pointLight.shadow.mapSize.height = 2048;
    pointLight.shadow.bias = -0.0005; // Prevent shadow acne
    sunMesh.add(pointLight);

    // SUN GLOW OUTER SHELL
    const sunGlowGeom = new THREE.SphereGeometry(28, 32, 32);
    const sunGlowMat = new THREE.MeshBasicMaterial({ 
        color: 0xffaa00, 
        transparent: true, 
        opacity: 0.15, 
        blending: THREE.AdditiveBlending 
    });
    const sunGlow = new THREE.Mesh(sunGlowGeom, sunGlowMat);
    sunMesh.add(sunGlow);

    // SUN ORBIT RING
    const sunRingGeom = new THREE.RingGeometry(sunDist - 0.5, sunDist + 0.5, 128);
    const sunRingMat = new THREE.MeshBasicMaterial({ color: 0xffad33, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const sunRing = new THREE.Mesh(sunRingGeom, sunRingMat);
    sunRing.rotation.x = Math.PI / 2;
    scene.add(sunRing);

    // 5.5 ZERO-DEGREE REFERENCE LINE & ARCS
    const refLineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(240, 0, 0)
    ]);
    const refLineMat = new THREE.LineDashedMaterial({ 
        color: 0xff8f00, transparent: true, opacity: 0.6, dashSize: 4, gapSize: 2 
    });
    const refLine = new THREE.Line(refLineGeom, refLineMat);
    refLine.computeLineDistances();
    scene.add(refLine);

    // ZERO-DEGREE LABEL
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffad33';
    ctx.shadowColor = '#ffad33'; ctx.shadowBlur = 12;
    ctx.fillText('0°', 64, 32);
    const labelTex = new THREE.CanvasTexture(canvas);
    const labelSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex, transparent: true }));
    labelSprite.position.set(255, 0, 0); 
    labelSprite.scale.set(25, 12.5, 1);
    scene.add(labelSprite);

    // ARC VISUALIZATIONS (Exported to global scope to be updated in animate loop)
    window.moonArcGeom = new THREE.BufferGeometry();
    const moonArcLine = new THREE.Line(window.moonArcGeom, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
    moonArcLine.rotation.x = 5.14 * (Math.PI / 180); // Perfectly match moon orbital inclination
    scene.add(moonArcLine);

    window.sunArcGeom = new THREE.BufferGeometry();
    const sunArcLine = new THREE.Line(window.sunArcGeom, new THREE.LineBasicMaterial({ color: 0xffad33, transparent: true, opacity: 0.5 }));
    scene.add(sunArcLine);

    // 6. STARFIELD BACKGROUND (SPACE)
    const starsGeom = new THREE.BufferGeometry();
    const starsCount = 2500;
    const posArray = new Float32Array(starsCount * 3);
    for(let i = 0; i < starsCount; i++) {
        // Generate random spherical coordinates for an enveloping star pattern
        const r = 800 + Math.random() * 700; // Place them far away outside orbits
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        posArray[i*3] = r * Math.sin(phi) * Math.cos(theta);     // x
        posArray[i*3+1] = r * Math.sin(phi) * Math.sin(theta);   // y
        posArray[i*3+2] = r * Math.cos(phi);                     // z
    }
    starsGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMat = new THREE.PointsMaterial({
        size: 2.0,
        color: 0xffffee,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    const starMesh = new THREE.Points(starsGeom, starsMat);
    scene.add(starMesh);

    // Handle Resize
    window.addEventListener('resize', onWindowResize, false);
    
    // Start Animation Loop
    animate();
}

function onWindowResize() {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function normalizeAngle(degrees) {
    let d = degrees % 360;
    if (d < 0) d += 360;
    return d;
}

// Helper to render dynamic measurement arcs from 0°
function updateMeasurementArc(geometry, radius, endAngleDeg) {
    if (!geometry) return;
    const points = [];
    const rad = endAngleDeg * (Math.PI / 180);
    const segments = Math.max(16, Math.floor(endAngleDeg / 3) + 1); 
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * rad;
        // Angles move counter-clockwise from the +X axis around the Y axis
        points.push(new THREE.Vector3(radius * Math.cos(theta), 0, -radius * Math.sin(theta)));
    }
    geometry.setFromPoints(points);
}

// 5. ANIMATION & CALCULATION LOOP
function animate() {
    requestAnimationFrame(animate);

    const now = Date.now();
    const msInDay = 86400000;
    const msInYear = msInDay * 365.25;
    const msInMoonOrbit = msInDay * 27.32;

    // Time progress (0 to 1) for components
    const dayProgress = (now % msInDay) / msInDay;
    const yearProgress = (now % msInYear) / msInYear;
    const moonOrbitProgress = (now % msInMoonOrbit) / msInMoonOrbit;

    // Exact rotation degrees mapping
    const earthRotationDeg = dayProgress * 360;
    // Apparent Geocentric Sun Orbit = corresponding to Earth's progression 
    const sunApparentOrbitDeg = normalizeAngle((yearProgress * 360) + 180);
    const moonOrbitDeg = moonOrbitProgress * 360;

    // Track globally for Panchang Modal
    window.currentThetaMoon = moonOrbitDeg;
    window.currentThetaSun = sunApparentOrbitDeg;

    // Update dynamic tracking arcs
    updateMeasurementArc(window.moonArcGeom, 45, moonOrbitDeg);
    updateMeasurementArc(window.sunArcGeom, 200, sunApparentOrbitDeg);

    // Apply exact math to 3D scene 
    if (earthMesh) {
        // earthMesh.rotation.y = earthRotationDeg * (Math.PI / 180); // Axial rotation halted per request
    }
    
    if (sunOrbitGroup) {
        sunOrbitGroup.rotation.y = sunApparentOrbitDeg * (Math.PI / 180);
    }

    if (moonOrbitGroup) {
        moonOrbitGroup.rotation.y = moonOrbitDeg * (Math.PI / 180);
    }
    
    // Optional: visually rotate celestial bodies on their own axis for dynamic effect
    // if (sunMesh) sunMesh.rotation.y += 0.002; // Axial rotation halted per request
    // if (moonMesh) moonMesh.rotation.y += 0.005; // Axial rotation halted per request

    controls.update();
    renderer.render(scene, camera);

    // Telemetry UI Updates
    const newMoonStr = moonOrbitDeg.toFixed(2) + '°';
    const newSunStr = sunApparentOrbitDeg.toFixed(2) + '°';

    if (moonDOM_Orb && lastMoonOrb !== newMoonStr) {
        moonDOM_Orb.textContent = newMoonStr;
        lastMoonOrb = newMoonStr;
    }
    if (sunDOM_Orb && lastSunOrb !== newSunStr) {
        sunDOM_Orb.textContent = newSunStr;
        lastSunOrb = newSunStr;
    }
}

// Ensure the container has dimensions correctly mapped from CSS before Init.
setTimeout(() => {
    init();
    setupPanchangModal();
}, 200);

// ==========================================
// PANCHANG CALCULATION ENGINE & MODAL
// ==========================================
function setupPanchangModal() {
    const calcBtn = document.getElementById('calc-panchang-btn');
    const modal = document.getElementById('panchang-modal');
    const closeBtn = document.getElementById('close-modal');
    
    if (!calcBtn || !modal || !closeBtn) return;

    calcBtn.addEventListener('click', () => {
        modal.classList.add('active');
        
        // Retrieve live 3D planetary mathematical geometries
        let tMoon = window.currentThetaMoon || 0;
        let tSun = window.currentThetaSun || 0;

        // 1. Tithi (12° each, 30 max)
        let tDiff = (tMoon - tSun) % 360;
        if (tDiff < 0) tDiff += 360;
        let tithi = Math.floor(tDiff / 12) + 1;

        // 2. Nakshatra (~13.33° each, 27 max)
        let nObj = tMoon % 360;
        if (nObj < 0) nObj += 360;
        let nakshatra = Math.floor(nObj / (360/27)) + 1;

        // 3. Karana (6° each, 60 max)
        let karana = Math.floor(tDiff / 6) + 1;

        // 4. Yoga (Sum logic, ~13.33° each, 27 max)
        let ySum = (tMoon + tSun) % 360;
        if (ySum < 0) ySum += 360;
        let yoga = Math.floor(ySum / (360/27)) + 1;

        // Animate numbers smoothly
        animatePanchangNumber('res-tithi', tithi);
        animatePanchangNumber('res-nakshatra', nakshatra);
        animatePanchangNumber('res-karana', karana);
        animatePanchangNumber('res-yoga', yoga);
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
}

function animatePanchangNumber(id, finalValue) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    let steps = 20; 
    let inc = finalValue / steps;
    el.textContent = "0";
    
    let timer = setInterval(() => {
        current += inc;
        if (current >= finalValue) {
            current = finalValue;
            clearInterval(timer);
        }
        el.textContent = Math.floor(current);
    }, 20);
}
