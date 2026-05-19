(() => {
  const canvas = document.getElementById('bb-3d-canvas');
  if (!canvas || !window.THREE) return;

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scene setup
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });

  // Clamp DPR for performance on mobile
  const getDpr = () => {
    const dpr = window.devicePixelRatio || 1;
    return Math.min(2, prefersReduced ? 1 : dpr);
  };

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.1, 4);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambient);

  const dir = new THREE.DirectionalLight(0xff7b00, 0.9);
  dir.position.set(2.2, 2.6, 3.5);
  scene.add(dir);

  const accentBlue = new THREE.Color('#7b2cff');
  const baseOrange = new THREE.Color('#ff7b00');

  // Create a colorful blob made of particles (responsive + performant)
  const COUNT = prefersReduced ? 520 : 1100;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);

  const tmp = new THREE.Vector3();

  for (let i = 0; i < COUNT; i++) {
    // Distribute points inside a warped sphere
    const u = Math.random();
    const v = Math.random();

    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);

    const r = 1.2 * Math.pow(Math.random(), 0.45);

    tmp.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );

    // Warp for "liquid" look
    const t = i / COUNT;
    const warp = 0.25 * Math.sin(t * 9 + tmp.y * 4) + 0.18 * Math.cos(tmp.x * 3 - tmp.z * 2);
    tmp.multiplyScalar(1 + warp);

    positions[i * 3 + 0] = tmp.x;
    positions[i * 3 + 1] = tmp.y;
    positions[i * 3 + 2] = tmp.z;

    // Color blending
    const mix = 0.25 + 0.75 * Math.abs(tmp.y) / 1.5;
    const c = baseOrange.clone().lerp(accentBlue, mix);

    colors[i * 3 + 0] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: prefersReduced ? 0.035 : 0.028,
    sizeAttenuation: true,
    transparent: true,
    opacity: prefersReduced ? 0.75 : 0.92,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Subtle "glow" sphere
  const glowGeo = new THREE.SphereGeometry(1.2, 48, 48);
  const glowMat = new THREE.MeshBasicMaterial({
    color: baseOrange,
    transparent: true,
    opacity: prefersReduced ? 0.08 : 0.12,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.scale.set(1.02, 1.02, 1.02);
  scene.add(glow);

  // Interaction state
  const heroVisual = canvas.closest('.hero-visual') || canvas.parentElement;
  const state = {
    pointerX: 0,
    pointerY: 0,
    targetRotX: 0,
    targetRotY: 0,
    rotX: 0,
    rotY: 0,
  };

  function setTargetFromNormalized(nx, ny) {
    // nx,ny in [-1,1]
    state.targetRotY = nx * 0.55;
    state.targetRotX = ny * 0.35;
  }

  function onPointerMove(clientX, clientY) {
    if (!heroVisual) return;
    const r = heroVisual.getBoundingClientRect();
    const x = (clientX - r.left) / r.width; // 0..1
    const y = (clientY - r.top) / r.height; // 0..1
    const nx = (x - 0.5) * 2; // -1..1
    const ny = (y - 0.5) * 2; // -1..1
    state.pointerX = nx;
    state.pointerY = ny;
    setTargetFromNormalized(nx, ny);
  }

  if (!prefersReduced) {
    // Mouse / pointer
    window.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerType === 'mouse' || e.pointerType === 'pen') onPointerMove(e.clientX, e.clientY);
      },
      { passive: true }
    );

    // Touch drag
    let isDown = false;
    heroVisual?.addEventListener('pointerdown', (e) => {
      isDown = true;
      try {
        heroVisual.setPointerCapture(e.pointerId);
      } catch {}
      onPointerMove(e.clientX, e.clientY);
    });

    heroVisual?.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      onPointerMove(e.clientX, e.clientY);
    });

    heroVisual?.addEventListener('pointerup', () => {
      isDown = false;
    });

    heroVisual?.addEventListener('pointercancel', () => {
      isDown = false;
    });

    // Device orientation fallback (mobile): use if available
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (ev) => {
        if (typeof ev.gamma !== 'number' || typeof ev.beta !== 'number') return;
        // gamma [-90..90] (left/right), beta [-180..180] (front/back)
        const nx = THREE.MathUtils.clamp(ev.gamma / 45, -1, 1);
        const ny = THREE.MathUtils.clamp(ev.beta / 45, -1, 1);
        setTargetFromNormalized(nx, ny);
      });
    }
  }

  // Resize
  function resize() {
    const rect = heroVisual?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const dpr = getDpr();
    renderer.setPixelRatio(dpr);

    const w = Math.max(320, rect.width);
    const h = Math.max(320, rect.height);

    // Keep canvas responsive to element size
    const width = Math.floor(w);
    const height = Math.floor(h);

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const ro = new ResizeObserver(() => resize());
  ro.observe(heroVisual || canvas);
  resize();

  // Animation loop
  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // Idle animation
    const time = now * 0.001;

    if (!prefersReduced) {
      // Smooth follow
      state.rotX += (state.targetRotX - state.rotX) * (1 - Math.pow(0.001, dt));
      state.rotY += (state.targetRotY - state.rotY) * (1 - Math.pow(0.001, dt));

      points.rotation.x = state.rotX + Math.sin(time * 0.7) * 0.08;
      points.rotation.y = state.rotY + Math.cos(time * 0.6) * 0.12;

      glow.rotation.y = points.rotation.y * 0.6;

      // Subtle pulse
      points.material.size = 0.025 + 0.006 * (0.5 + 0.5 * Math.sin(time * 1.1));
    } else {
      // Reduced motion: very light movement
      points.rotation.y = Math.sin(time * 0.2) * 0.12;
      points.rotation.x = Math.cos(time * 0.15) * 0.06;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };

  // Start
  requestAnimationFrame(tick);

  // Accessibility / cleanup on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // quick settle; no heavy logic
      state.targetRotX = 0;
      state.targetRotY = 0;
    }
  });
})();

