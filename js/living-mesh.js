document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    // --- Configuration ---
    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

    const config = {
        particleCount: isMobile ? 300 : 800, // Reduced for mobile
        connectionDistance: isMobile ? 3.0 : 2.5, // Increased distance for fewer connections
        baseColor: 0x0099CC, // Brilliant Azure
        secondaryColor: 0x0077B6, // Azure Blue
        accentColor: 0x005599, // Royal Azure
        crystalColor: 0x0099CC, // Brilliant Azure
        particleSize: isMobile ? 0.12 : 0.08, // Larger particles on mobile
        bloomStrength: isMobile ? 0.8 : 1.5, // Reduced bloom on mobile
        rotationSpeed: 0.001
    };

    // --- Setup Three.js Scene ---
    const container = document.getElementById('canvas-container');
    if (!container) {
        console.error("Canvas container not found!");
        return;
    }
    console.log("Initializing Living Mesh...");

    const scene = new THREE.Scene();
    // scene.fog = new THREE.FogExp2(0x050a10, 0.02); // Match body bg

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 15;
    camera.position.y = 0; // Reset camera

    let renderer;
    try {
        // Try high-quality renderer first
        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: !isMobile, // Disable antialias on mobile
            powerPreference: isMobile ? "default" : "high-performance"
        });
    } catch (e) {
        console.warn("WebGL high-quality failed, trying low-quality...");
        try {
            // Fallback to basic renderer
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
        } catch (e2) {
            console.error("WebGL failed completely:", e2);
            container.innerHTML = '<div style="color: white; text-align: center; padding-top: 40%;">WebGL not supported</div>';
            return;
        }
    }

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for high DPI
    container.appendChild(renderer.domElement);

    // --- Group for all Mesh Elements ---
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(config.baseColor, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(config.accentColor, 2, 50);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // --- Particle Cloud System ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesPos = new Float32Array(config.particleCount * 3);
    const particlesVel = []; // Store velocities for organic movement

    // Initial random positions (Cloud state)
    for (let i = 0; i < config.particleCount; i++) {
        const x = (Math.random() - 0.5) * 25;
        const y = (Math.random() - 0.5) * 25;
        const z = (Math.random() - 0.5) * 15;

        particlesPos[i * 3] = x;
        particlesPos[i * 3 + 1] = y;
        particlesPos[i * 3 + 2] = z;

        particlesVel.push({
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
        });
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPos, 3));

    // --- Helper: Generate Soft Glow Texture ---
    function getParticleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');

        // Radial Gradient (White center -> Transparent edge)
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    const particlesMaterial = new THREE.PointsMaterial({
        color: config.baseColor,
        size: config.particleSize * 2.5, // Increase size for soft glow effect
        map: getParticleTexture(), // Apply custom texture
        transparent: true,
        opacity: 0.9,
        depthWrite: false, // Crucial for proper blending
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    meshGroup.add(particleSystem);

    // --- Lines (Connections) ---
    const lineMaterial = new THREE.LineBasicMaterial({
        color: config.secondaryColor,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
    });

    const linesGeometry = new THREE.BufferGeometry();
    const lineSystem = new THREE.LineSegments(linesGeometry, lineMaterial);
    meshGroup.add(lineSystem);

    // --- Crystalline Object (Final State) ---
    const crystalGeometry = new THREE.IcosahedronGeometry(4, 2); // More facets for "upscale" look
    const crystalMaterial = new THREE.MeshPhysicalMaterial({
        color: config.crystalColor,
        metalness: 0.6,
        roughness: 0.2,
        transmission: 0.6, // More glass-like
        thickness: 2.0, // Refraction volume
        ior: 1.5, // Index of refraction
        clearcoat: 1.0, // Polish layer
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0,
        wireframe: false
    });

    const crystalMesh = new THREE.Mesh(crystalGeometry, crystalMaterial);
    crystalMesh.visible = false;
    crystalMesh.scale.set(0.1, 0.1, 0.1); // Start small
    meshGroup.add(crystalMesh);

    // Wireframe overlay for crystal (Subtle tech detail)
    const crystalWireframeMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    const crystalWireframe = new THREE.Mesh(crystalGeometry, crystalWireframeMat);
    crystalMesh.add(crystalWireframe);


    // --- Animation State ---
    let scrollProgress = 0;

    // --- GSAP ScrollTrigger Integration ---
    gsap.registerPlugin(ScrollTrigger);

    // Create a timeline linked to scroll
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "body", // Scroll entire page
            start: "top top",
            end: "bottom bottom",
            scrub: 1 // Smooth scrubbing
        }
    });

    // Phase 1 -> 2: Coalesce to Sphere
    // We'll use a proxy object to tween values that we read in the animation loop
    const animState = {
        sphereFactor: 0, // 0 = cloud, 1 = sphere
        crystalOpacity: 0,
        crystalScale: 0, // New scale factor
        particleOpacity: 1,
        rotationSpeed: config.rotationSpeed
    };

    tl.to(animState, {
        sphereFactor: 1,
        duration: 5, // Relative duration
        ease: "power2.inOut"
    })
        .to(animState, {
            particleOpacity: 0.1, // Keep faint particles for "living" effect
            crystalOpacity: 1,
            crystalScale: 1, // Grow effect
            duration: 3,
            ease: "power2.inOut",
            onStart: () => { crystalMesh.visible = true; },
            onReverseComplete: () => { crystalMesh.visible = false; }
        }, "-=2"); // Overlap slightly


    // --- Mouse Interaction ---
    const mouse = new THREE.Vector2();
    const targetMouse = new THREE.Vector2();
    window.addEventListener('mousemove', (event) => {
        targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let frameCount = 0;

    function animate() {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();
        const delta = clock.getDelta(); // Use delta for smooth movement

        // Smooth mouse movement
        mouse.x += (targetMouse.x - mouse.x) * 0.05;
        mouse.y += (targetMouse.y - mouse.y) * 0.05;

        const positions = particleSystem.geometry.attributes.position.array;
        const linePositions = [];

        frameCount++;

        // Update Particles
        for (let i = 0; i < config.particleCount; i++) {
            const i3 = i * 3;

            // 1. Organic Cloud Movement (Base State)
            const vx = particlesVel[i].x;
            const vy = particlesVel[i].y;
            const vz = particlesVel[i].z;

            let x = positions[i3];
            let y = positions[i3 + 1];
            let z = positions[i3 + 2];

            // Apply velocity if in cloud state
            if (animState.sphereFactor < 0.9) {
                x += vx;
                y += vy;
                z += vz;

                // Mouse Repulsion (Subtle)
                const dx = x - (mouse.x * 10);
                const dy = y - (mouse.y * 10);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 4) {
                    const force = (4 - dist) * 0.02;
                    x += dx * force;
                    y += dy * force;
                }

                // Boundary check (bounce back)
                if (Math.abs(x) > 15) particlesVel[i].x *= -1;
                if (Math.abs(y) > 15) particlesVel[i].y *= -1;
                if (Math.abs(z) > 10) particlesVel[i].z *= -1;
            }

            // 2. Sphere Formation (Target State)
            // Calculate target position on a sphere surface
            const phi = Math.acos(-1 + (2 * i) / config.particleCount);
            const theta = Math.sqrt(config.particleCount * Math.PI) * phi;

            const r = 5; // Radius
            const tx = r * Math.cos(theta) * Math.sin(phi);
            const ty = r * Math.sin(theta) * Math.sin(phi);
            const tz = r * Math.cos(phi);

            // Lerp current position to target based on scroll
            const factor = animState.sphereFactor;

            // Apply Lerp
            positions[i3] = x + (tx - x) * factor * 0.1; // Soft ease
            positions[i3 + 1] = y + (ty - y) * factor * 0.1;
            positions[i3 + 2] = z + (tz - z) * factor * 0.1;

            // 3. Line Connections (Throttled for performance)
            // Only update lines every 2 frames to save CPU
            if (animState.particleOpacity > 0.05 && frameCount % 2 === 0) {
                for (let j = i + 1; j < Math.min(i + 12, config.particleCount); j++) {
                    const j3 = j * 3;
                    const dx = positions[i3] - positions[j3];
                    const dy = positions[i3 + 1] - positions[j3 + 1];
                    const dz = positions[i3 + 2] - positions[j3 + 2];

                    // Simple distance check (avoid sqrt if possible, but needed for threshold)
                    const distSq = dx * dx + dy * dy + dz * dz;

                    if (distSq < config.connectionDistance * config.connectionDistance) {
                        linePositions.push(
                            positions[i3], positions[i3 + 1], positions[i3 + 2],
                            positions[j3], positions[j3 + 1], positions[j3 + 2]
                        );
                    }
                }
            }
        }

        particleSystem.geometry.attributes.position.needsUpdate = true;

        // Update Lines (only if we calculated them)
        if (frameCount % 2 === 0 && linePositions.length > 0) {
            linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        }

        // Update Opacities & Scale
        particlesMaterial.opacity = animState.particleOpacity * 0.8;
        lineMaterial.opacity = animState.particleOpacity * 0.15;

        crystalMaterial.opacity = animState.crystalOpacity;
        crystalWireframeMat.opacity = animState.crystalOpacity * 0.2;

        // Apply Scale Animation
        const scale = 0.1 + (animState.crystalScale * 0.9); // 0.1 -> 1.0
        crystalMesh.scale.set(scale, scale, scale);

        // Global Rotation (Rotate the Group)
        const rotSpeed = config.rotationSpeed + (animState.sphereFactor * 0.002);
        meshGroup.rotation.y += rotSpeed;
        crystalMesh.rotation.x += rotSpeed * 0.5; // Keep local rotation for crystal

        renderer.render(scene, camera);
    }

    animate();

    // --- Resize Handler ---
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
});
