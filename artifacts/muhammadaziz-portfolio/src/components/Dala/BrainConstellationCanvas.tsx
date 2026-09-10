import { useRef, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

interface PyramidFace {
  p0: { x: number; y: number; z: number };
  p1: { x: number; y: number; z: number };
  p2: { x: number; y: number; z: number };
  normZ: number;
  shade: number;
}

interface Particle3D {
  // Base 3D coordinate in neural local space
  baseX: number;
  baseY: number;
  baseZ: number;
  // Current dynamic 3D coordinate (with organic breathing + ripple offsets)
  x: number;
  y: number;
  z: number;
  // Projected screen coordinates
  projX: number;
  projY: number;
  projScale: number;
  rotatedZ: number;
  // Visual attributes
  size: number;
  colorBase: string;
  colorHighlight: string;
  // Local 3D rotation angles & velocities
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  // Pulse & illumination
  pulsePhase: number;
  pulseSpeed: number;
  baseOpacity: number;
  currentOpacity: number;
  excitation: number; // 0 to 1, boosts glow on click / proximity
  // Individual organic drift
  driftPhase: number;
  driftSpeed: number;
  driftAmp: number;
  // Pre-calculated pyramid geometry cache
  faces: PyramidFace[];
}

interface SynapticPulse {
  sourceIdx: number;
  targetIdx: number;
  progress: number; // 0 to 1
  speed: number;
  color: string;
}

interface SynapticConnection {
  i: number;
  j: number;
  dist: number;
}

interface ThoughtRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
  color: string;
}

interface Stardust3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  opacity: number;
  opacitySpeed: number;
  opacityDir: number;
}

// ============================================================================
// DALA COLOR PALETTES
// ============================================================================
const PALETTE = [
  { base: '#8052ff', highlight: '#bca5ff' }, // Electric Iris
  { base: '#8052ff', highlight: '#9f7dff' }, // Electric Iris deep
  { base: '#ffb829', highlight: '#ffe28a' }, // Saffron Spark
  { base: '#15846e', highlight: '#34d399' }, // Deep Verdant
  { base: '#d946ef', highlight: '#f0abfc' }, // Orchid Magenta
  { base: '#0ea5e9', highlight: '#7dd3fc' }, // Sky Iris
  { base: '#ffffff', highlight: '#ffffff' }, // Pure Star Spark
];

// Light vector for 3D faceted shading (normalized from upper-left-front)
const LIGHT_DIR = { x: 0.408, y: -0.707, z: 0.577 };

// Check if (x, y, z) is inside an anatomically accurate volumetric brain
function isInsideBrain3D(x: number, y: number, z: number): boolean {
  const nx = x;
  const ny = y;
  const nz = z;

  // Central longitudinal fissure (gap between left and right hemispheres)
  if (Math.abs(nx) < 0.055 && ny < 0.38 && nz > -0.55) {
    return false;
  }

  // Left & right hemisphere centers
  const hemiX = nx > 0 ? nx - 0.28 : nx + 0.28;

  // Cerebral hemisphere ellipsoid
  const cortex =
    (hemiX * hemiX) / (0.44 * 0.44) +
    ((ny + 0.08) * (ny + 0.08)) / (0.58 * 0.58) +
    (nz * nz) / (0.78 * 0.78);

  // Frontal lobe expansion
  const frontalFactor = nz > 0.1 ? 1.0 - (nz - 0.1) * 0.15 : 1.0;

  if (cortex * frontalFactor <= 1.0) {
    // Cortical surface gyri & sulci perturbations
    const gyri =
      Math.sin(nx * 14) * Math.cos(ny * 12) * Math.sin(nz * 13) * 0.07;
    return cortex + gyri <= 1.0;
  }

  // Cerebellum (lower back portion)
  const cerebX = nx > 0 ? nx - 0.22 : nx + 0.22;
  const cerebY = ny - 0.46;
  const cerebZ = nz + 0.40;
  const cerebellum =
    (cerebX * cerebX) / (0.30 * 0.30) +
    (cerebY * cerebY) / (0.24 * 0.24) +
    (cerebZ * cerebZ) / (0.30 * 0.30);

  if (cerebellum <= 1.0) {
    return true;
  }

  // Brainstem (slender descending column)
  if (ny > 0.38 && ny < 0.90 && Math.abs(nx) < 0.13 && Math.abs(nz + 0.1) < 0.15) {
    return true;
  }

  return false;
}

// Generate volumetric 3D faceted particles
function generateBrainParticles(count: number, scale: number): Particle3D[] {
  const particles: Particle3D[] = [];
  let attempts = 0;

  while (particles.length < count && attempts < count * 35) {
    attempts++;

    const nx = (Math.random() - 0.5) * 1.8;
    const ny = (Math.random() - 0.5) * 1.6;
    const nz = (Math.random() - 0.5) * 1.8;

    if (!isInsideBrain3D(nx, ny, nz)) continue;

    // Density modulation: crisp surface with porous core
    const distCenter = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (distCenter < 0.22 && Math.random() > 0.35) continue;

    const bx = nx * scale;
    const by = ny * scale;
    const bz = nz * scale;
    const colorPair = PALETTE[Math.floor(Math.random() * PALETTE.length)];

    particles.push({
      baseX: bx,
      baseY: by,
      baseZ: bz,
      x: bx,
      y: by,
      z: bz,
      projX: 0,
      projY: 0,
      projScale: 1,
      rotatedZ: 0,
      size: 2.4 + Math.random() * 4.5,
      colorBase: colorPair.base,
      colorHighlight: colorPair.highlight,
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotZ: Math.random() * Math.PI * 2,
      vRotX: (Math.random() - 0.5) * 0.03,
      vRotY: (Math.random() - 0.5) * 0.03,
      vRotZ: (Math.random() - 0.5) * 0.02,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.015 + Math.random() * 0.03,
      baseOpacity: 0.4 + Math.random() * 0.55,
      currentOpacity: 0.6,
      excitation: 0,
      driftPhase: Math.random() * Math.PI * 2,
      driftSpeed: 0.003 + Math.random() * 0.005,
      driftAmp: 3 + Math.random() * 6,
      faces: [],
    });
  }

  return particles;
}

// Build synaptic network links between close 3D nodes
function buildSynapticConnections(particles: Particle3D[], maxDist: number): SynapticConnection[] {
  const connections: SynapticConnection[] = [];
  const limit = Math.min(particles.length, 350);

  for (let i = 0; i < limit; i++) {
    let neighbors = 0;
    for (let j = i + 1; j < limit; j++) {
      if (neighbors >= 3) break;
      const dx = particles[i].baseX - particles[j].baseX;
      const dy = particles[i].baseY - particles[j].baseY;
      const dz = particles[i].baseZ - particles[j].baseZ;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < maxDist) {
        connections.push({ i, j, dist });
        neighbors++;
      }
    }
  }

  return connections;
}

// Generate floating celestial stardust
function generateStardust(count: number, width: number, height: number): Stardust3D[] {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * width * 2,
    y: (Math.random() - 0.5) * height * 2,
    z: (Math.random() - 0.5) * 1400,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -0.2 - Math.random() * 0.35, // Ethereal cosmic ascent
    vz: (Math.random() - 0.5) * 0.3,
    size: 1.0 + Math.random() * 2.8,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)].base,
    opacity: 0.12 + Math.random() * 0.4,
    opacitySpeed: 0.005 + Math.random() * 0.01,
    opacityDir: Math.random() > 0.5 ? 1 : -1,
  }));
}

// Render a single 3D Faceted Micro-Pyramid (Tetrahedron) with dynamic specular lighting
function renderFacetedPyramid(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotX: number,
  rotY: number,
  rotZ: number,
  colorBase: string,
  colorHighlight: string,
  opacity: number,
  excitation: number
) {
  // Tetrahedron local canonical vertices
  const h = size * 1.1;
  const r = size * 0.85;

  const v0 = { x: 0, y: -h * 0.65, z: 0 }; // Apex
  const v1 = { x: -r * 0.866, y: h * 0.35, z: -r * 0.5 };
  const v2 = { x: r * 0.866, y: h * 0.35, z: -r * 0.5 };
  const v3 = { x: 0, y: h * 0.35, z: r };

  const verts = [v0, v1, v2, v3];

  // Rotate local vertices by particle's tumble angles
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

  const tVerts = verts.map((v) => {
    // Rot Y
    const x1 = v.x * cosY + v.z * sinY;
    const z1 = -v.x * sinY + v.z * cosY;
    const y1 = v.y;
    // Rot X
    const y2 = y1 * cosX - z1 * sinX;
    const z2 = y1 * sinX + z1 * cosX;
    const x2 = x1;
    // Rot Z
    const x3 = x2 * cosZ - y2 * sinZ;
    const y3 = x2 * sinZ + y2 * cosZ;
    const z3 = z2;

    return { x: cx + x3, y: cy + y3, z: z3 };
  });

  // Faces: [Apex, V1, V2], [Apex, V2, V3], [Apex, V3, V1]
  const faces = [
    [tVerts[0], tVerts[1], tVerts[2]],
    [tVerts[0], tVerts[2], tVerts[3]],
    [tVerts[0], tVerts[3], tVerts[1]],
  ];

  ctx.save();

  // Boost opacity with excitation
  const effectiveOpacity = Math.min(1.0, opacity + excitation * 0.4);

  for (let f = 0; f < faces.length; f++) {
    const [p0, p1, p2] = faces[f];

    // Compute face normal via cross product in screen space
    const ax = p1.x - p0.x, ay = p1.y - p0.y;
    const bx = p2.x - p0.x, by = p2.y - p0.y;
    const crossZ = ax * by - ay * bx;

    // Back-face culling
    if (crossZ > 0) continue;

    // Specular shading factor
    const shade = Math.min(1.0, Math.max(0.35, 0.45 + (f === 0 ? 0.4 : f === 1 ? 0.2 : 0.0)));

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.closePath();

    // Facet fill
    ctx.globalAlpha = effectiveOpacity * shade;
    ctx.fillStyle = shade > 0.65 ? colorHighlight : colorBase;
    ctx.fill();

    // Crisp facet edge outline
    ctx.globalAlpha = effectiveOpacity * 0.9;
    ctx.strokeStyle = colorHighlight;
    ctx.lineWidth = 0.85;
    ctx.stroke();
  }

  // If excited, draw glowing core spark
  if (excitation > 0.3) {
    ctx.globalAlpha = excitation * 0.6;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BrainConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle3D[]>([]);
  const connectionsRef = useRef<SynapticConnection[]>([]);
  const pulsesRef = useRef<SynapticPulse[]>([]);
  const ripplesRef = useRef<ThoughtRipple[]>([]);
  const stardustRef = useRef<Stardust3D[]>([]);

  // Smooth interpolated interaction states
  const mouseRef = useRef({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    screenX: -9999,
    screenY: -9999,
    isDown: false,
    dragStartX: 0,
    dragStartY: 0,
    orbitDeltaX: 0,
    orbitDeltaY: 0,
  });

  const scrollRef = useRef({
    currentY: 0,
    targetY: 0,
  });

  const rotRef = useRef({
    rotX: 0.15,
    rotY: -0.25,
    rotZ: 0,
    targetRotX: 0.15,
    targetRotY: -0.25,
  });

  const rafRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    const isDesktop = rect.width >= 1024;
    const brainScale = Math.min(rect.width, rect.height) * (isDesktop ? 0.40 : 0.35);
    const particleCount = rect.width < 768 ? 1200 : rect.width < 1280 ? 2000 : 2800;
    const stardustCount = rect.width < 768 ? 90 : 180;

    const particles = generateBrainParticles(particleCount, brainScale);
    particlesRef.current = particles;
    connectionsRef.current = buildSynapticConnections(particles, brainScale * 0.26);
    stardustRef.current = generateStardust(stardustCount, rect.width, rect.height);

    // Initialize pool of firing synaptic pulses
    pulsesRef.current = Array.from({ length: 35 }, () => {
      const conn = connectionsRef.current[Math.floor(Math.random() * connectionsRef.current.length)];
      return {
        sourceIdx: conn ? conn.i : 0,
        targetIdx: conn ? conn.j : 1,
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.015,
        color: Math.random() > 0.4 ? '#8052ff' : '#ffb829',
      };
    });
  }, []);

  useEffect(() => {
    init();

    const handleResize = () => {
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      mouseRef.current.screenX = e.clientX;
      mouseRef.current.screenY = e.clientY;
      mouseRef.current.targetX = (e.clientX / w - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / h - 0.5) * 2;

      // If mouse dragging, add manual orbital rotation
      if (mouseRef.current.isDown) {
        const dx = e.clientX - mouseRef.current.dragStartX;
        const dy = e.clientY - mouseRef.current.dragStartY;
        mouseRef.current.orbitDeltaX += dx * 0.004;
        mouseRef.current.orbitDeltaY += dy * 0.004;
        mouseRef.current.dragStartX = e.clientX;
        mouseRef.current.dragStartY = e.clientY;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.isDown = true;
      mouseRef.current.dragStartX = e.clientX;
      mouseRef.current.dragStartY = e.clientY;

      // Spawn an expanding synaptic shockwave on click
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: 280,
        strength: 1.0,
        color: Math.random() > 0.5 ? '#ffb829' : '#8052ff',
      });
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      mouseRef.current.screenX = -9999;
      mouseRef.current.screenY = -9999;
      mouseRef.current.isDown = false;
    };

    const handleScroll = () => {
      scrollRef.current.targetY = window.scrollY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    scrollRef.current.targetY = window.scrollY;
    scrollRef.current.currentY = window.scrollY;

    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);
      timeRef.current += 1;
      const t = timeRef.current;

      // 1. INTERACTION INTERPOLATION
      const m = mouseRef.current;
      m.currentX += (m.targetX - m.currentX) * 0.05;
      m.currentY += (m.targetY - m.currentY) * 0.05;

      const s = scrollRef.current;
      s.currentY += (s.targetY - s.currentY) * 0.065;
      const maxScroll = Math.max(document.body.scrollHeight - h, 1);
      const scrollProgress = Math.min(Math.max(s.currentY / maxScroll, 0), 1);

      // 2. CHOREOGRAPHED 3D CAMERA ORBIT ALONG SECTIONS
      const isDesktop = w >= 1024;
      const heroCenterX = isDesktop ? w * 0.70 : w * 0.5;
      const heroCenterY = isDesktop ? h * 0.48 : h * 0.38;

      // Cinematic multi-section camera trajectory
      const scrollDriftX = Math.sin(scrollProgress * Math.PI * 2.4) * (isDesktop ? w * 0.18 : w * 0.09);
      const scrollDriftY = Math.cos(scrollProgress * Math.PI * 1.8) * (h * 0.12) + Math.sin(t * 0.003) * 10;

      const centerX = heroCenterX - (scrollProgress > 0 ? scrollProgress * (isDesktop ? w * 0.20 : 0) : 0) + scrollDriftX;
      const centerY = heroCenterY + scrollDriftY;

      // Rotations: continuous auto-spin + section progression + mouse tilt + drag orbit
      const rot = rotRef.current;
      const autoSpinY = t * 0.003;
      const autoSpinX = Math.sin(t * 0.002) * 0.14;

      const scrollRotY = scrollProgress * Math.PI * 3.8;
      const scrollRotX = Math.sin(scrollProgress * Math.PI * 2) * 0.55;
      const scrollRotZ = Math.cos(scrollProgress * Math.PI) * 0.25;

      const mouseTiltY = m.currentX * 0.55 + m.orbitDeltaX;
      const mouseTiltX = -m.currentY * 0.42 + m.orbitDeltaY;

      rot.targetRotY = autoSpinY + scrollRotY + mouseTiltY;
      rot.targetRotX = autoSpinX + scrollRotX + mouseTiltX;

      rot.rotY += (rot.targetRotY - rot.rotY) * 0.09;
      rot.rotX += (rot.targetRotX - rot.rotX) * 0.09;
      rot.rotZ = scrollRotZ;

      const cosY = Math.cos(rot.rotY), sinY = Math.sin(rot.rotY);
      const cosX = Math.cos(rot.rotX), sinX = Math.sin(rot.rotX);
      const cosZ = Math.cos(rot.rotZ), sinZ = Math.sin(rot.rotZ);

      const cameraZ = 750;

      // 3. UPDATE THOUGHT RIPPLES
      const ripples = ripplesRef.current;
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        rip.radius += 9.5;
        rip.strength *= 0.94;

        if (rip.strength < 0.02 || rip.radius > rip.maxRadius) {
          ripples.splice(r, 1);
        } else {
          // Draw subtle luminous shockwave ring
          ctx.save();
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
          ctx.globalAlpha = rip.strength * 0.25;
          ctx.strokeStyle = rip.color;
          ctx.lineWidth = 2.0;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 4. PROJECT & TRANSFORM PARTICLES
      const particles = particlesRef.current;
      const mouseScreenX = m.screenX;
      const mouseScreenY = m.screenY;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Organic biological breathing pulsation
        const breathing = Math.sin(t * 0.015 + p.driftPhase) * 0.035;
        const currentScale = 1 + breathing;

        const driftX = Math.sin(t * p.driftSpeed + p.driftPhase) * p.driftAmp;
        const driftY = Math.cos(t * p.driftSpeed + p.driftPhase) * p.driftAmp * 0.8;
        const driftZ = Math.sin(t * p.driftSpeed * 0.8 + p.driftPhase) * p.driftAmp;

        p.x = p.baseX * currentScale + driftX;
        p.y = p.baseY * currentScale + driftY;
        p.z = p.baseZ * currentScale + driftZ;

        // 3D Matrix Rotation
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y1 = p.y;

        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;
        const x2 = x1;

        const x3 = x2 * cosZ - y2 * sinZ;
        const y3 = x2 * sinZ + y2 * cosZ;
        const z3 = z2;

        p.rotatedZ = z3;

        // Perspective Projection
        const perspective = cameraZ / (cameraZ + z3);
        p.projScale = perspective;
        p.projX = centerX + x3 * perspective;
        p.projY = centerY + y3 * perspective;

        // Local 3D pyramid tumble
        p.rotX += p.vRotX;
        p.rotY += p.vRotY;
        p.rotZ += p.vRotZ;

        // Check proximity to expanding shockwaves
        for (let r = 0; r < ripples.length; r++) {
          const rip = ripples[r];
          const distToRip = Math.sqrt((p.projX - rip.x) ** 2 + (p.projY - rip.y) ** 2);
          if (Math.abs(distToRip - rip.radius) < 35) {
            p.excitation = Math.min(1.0, p.excitation + rip.strength * 0.8);
          }
        }

        // Mouse proximity excitation
        const distToCursor = Math.sqrt((p.projX - mouseScreenX) ** 2 + (p.projY - mouseScreenY) ** 2);
        if (distToCursor < 120) {
          p.excitation = Math.min(1.0, p.excitation + (1 - distToCursor / 120) * 0.15);
        }

        // Decay excitation
        p.excitation *= 0.95;

        // Depth-based opacity with breathing
        p.pulsePhase += p.pulseSpeed;
        const pulse = (Math.sin(p.pulsePhase) + 1) * 0.5;
        const depthAlpha = Math.max(0.15, Math.min(1.0, (z3 + 340) / 680));
        p.currentOpacity = p.baseOpacity * (0.65 + pulse * 0.35) * depthAlpha;
      }

      // Sort particles by rotatedZ for painter's algorithm depth precision
      particles.sort((a, b) => a.rotatedZ - b.rotatedZ);

      // 5. DRAW SYNAPTIC CONNECTIONS & FIRING ACTION POTENTIALS
      ctx.save();
      const connections = connectionsRef.current;
      const connLimit = Math.min(connections.length, 300);

      for (let c = 0; c < connLimit; c++) {
        const conn = connections[c];
        const p1 = particles[conn.i];
        const p2 = particles[conn.j];

        if (!p1 || !p2) continue;
        if (p1.projScale < 0.75 && p2.projScale < 0.75) continue;

        const dx = p1.projX - p2.projX;
        const dy = p1.projY - p2.projY;
        const dist2D = Math.sqrt(dx * dx + dy * dy);

        if (dist2D < 42) {
          const depthAlpha = (p1.currentOpacity + p2.currentOpacity) * 0.5;
          const excitationBonus = (p1.excitation + p2.excitation) * 0.5;
          const filamentAlpha = (1 - dist2D / 42) * (0.08 + excitationBonus * 0.25) * depthAlpha;

          ctx.globalAlpha = filamentAlpha;
          ctx.strokeStyle = excitationBonus > 0.4 ? '#ffb829' : '#8052ff';
          ctx.lineWidth = 0.6 * p1.projScale;
          ctx.beginPath();
          ctx.moveTo(p1.projX, p1.projY);
          ctx.lineTo(p2.projX, p2.projY);
          ctx.stroke();
        }
      }

      // Update & render traveling synaptic pulses
      const pulses = pulsesRef.current;
      for (let pu = 0; pu < pulses.length; pu++) {
        const pulse = pulses[pu];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1.0) {
          // Re-pick next random connection
          const conn = connections[Math.floor(Math.random() * connections.length)];
          if (conn) {
            pulse.sourceIdx = conn.i;
            pulse.targetIdx = conn.j;
            pulse.progress = 0;
            pulse.color = Math.random() > 0.35 ? '#8052ff' : '#ffb829';
          }
          continue;
        }

        const pSource = particles[pulse.sourceIdx];
        const pTarget = particles[pulse.targetIdx];
        if (!pSource || !pTarget) continue;

        const pulseX = pSource.projX + (pTarget.projX - pSource.projX) * pulse.progress;
        const pulseY = pSource.projY + (pTarget.projY - pSource.projY) * pulse.progress;
        const pulseScale = pSource.projScale + (pTarget.projScale - pSource.projScale) * pulse.progress;

        ctx.globalAlpha = 0.85 * pulseScale;
        ctx.fillStyle = pulse.color;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 1.6 * pulseScale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 6. DRAW 3D FACETED PYRAMIDS
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const currentSize = Math.max(1.4, p.size * p.projScale);

        renderFacetedPyramid(
          ctx,
          p.projX,
          p.projY,
          currentSize,
          p.rotX,
          p.rotY,
          p.rotZ,
          p.colorBase,
          p.colorHighlight,
          p.currentOpacity,
          p.excitation
        );
      }

      // 7. DRAW 3D CELESTIAL STARDUST
      const dust = stardustRef.current;
      for (let i = 0; i < dust.length; i++) {
        const d = dust[i];

        d.x += d.vx;
        d.y += d.vy - scrollProgress * 0.6; // Stardust ascends with scroll
        d.z += d.vz;

        const boundX = w * 0.95;
        const boundY = h * 0.95;
        if (d.x < -boundX) d.x = boundX;
        if (d.x > boundX) d.x = -boundX;
        if (d.y < -boundY) d.y = boundY;
        if (d.y > boundY) d.y = -boundY;
        if (d.z < -700) d.z = 700;
        if (d.z > 700) d.z = -700;

        d.opacity += d.opacityDir * d.opacitySpeed;
        if (d.opacity > 0.6) d.opacityDir = -1;
        if (d.opacity < 0.08) d.opacityDir = 1;

        const dScale = cameraZ / (cameraZ + d.z);
        const screenX = w * 0.5 + d.x * dScale;
        const screenY = h * 0.5 + d.y * dScale;

        if (screenX >= 0 && screenX <= w && screenY >= 0 && screenY <= h) {
          ctx.save();
          ctx.globalAlpha = d.opacity * Math.min(dScale, 1.25);
          ctx.fillStyle = d.color;
          ctx.beginPath();
          ctx.arc(screenX, screenY, Math.max(0.8, d.size * dScale), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full absolute inset-0 pointer-events-none select-none"
      style={{ background: 'transparent' }}
      aria-hidden="true"
    />
  );
}
