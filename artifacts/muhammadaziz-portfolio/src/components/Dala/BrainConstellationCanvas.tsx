import { useRef, useEffect, useCallback } from 'react';

interface Particle3D {
  // Base 3D coordinates in brain local space
  baseX: number;
  baseY: number;
  baseZ: number;
  // Current dynamic 3D coordinates
  x: number;
  y: number;
  z: number;
  // Transformed & projected coordinates
  projX: number;
  projY: number;
  projScale: number;
  rotatedZ: number;
  // Visual attributes
  size: number;
  color: string;
  triangleRot: number;
  triangleRotSpeed: number;
  pulsePhase: number;
  pulseSpeed: number;
  baseOpacity: number;
  currentOpacity: number;
  // Individual particle drift
  driftPhaseX: number;
  driftPhaseY: number;
  driftPhaseZ: number;
  driftSpeed: number;
  driftAmp: number;
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

const PALETTE = [
  '#8052ff', '#8052ff', '#8052ff', '#8052ff', // Electric Iris (predominant)
  '#ffb829', '#ffb829',                        // Saffron Spark
  '#15846e',                                    // Deep Verdant
  '#d946ef',                                    // Orchid Magenta
  '#38bdf8',                                    // Electric Sky Blue
  '#ffffff',                                    // White sparks
];

// Check if (x, y, z) is inside an anatomically accurate 3D volumetric brain
function isInsideBrain3D(x: number, y: number, z: number): boolean {
  // Normalize coordinates (-1 to 1 range approx)
  const nx = x;
  const ny = y;
  const nz = z;

  // Central longitudinal fissure (gap between left and right hemispheres)
  if (Math.abs(nx) < 0.05 && ny < 0.35 && nz > -0.5) {
    return false;
  }

  // Left & right hemisphere centers
  const hemiX = nx > 0 ? nx - 0.28 : nx + 0.28;

  // Main cerebral hemisphere ellipsoid
  // x: width (~0.65 each hemisphere), y: height (~0.75), z: depth (~1.0)
  const cortex =
    (hemiX * hemiX) / (0.42 * 0.42) +
    ((ny + 0.08) * (ny + 0.08)) / (0.55 * 0.55) +
    (nz * nz) / (0.75 * 0.75);

  // Frontal lobe expansion (slightly larger at front)
  const frontalFactor = nz > 0.1 ? 1.0 - (nz - 0.1) * 0.15 : 1.0;

  if (cortex * frontalFactor <= 1.0) {
    // Add cortical surface gyri/sulci perturbations
    const gyri =
      Math.sin(nx * 12) * Math.cos(ny * 10) * Math.sin(nz * 11) * 0.06;
    return cortex + gyri <= 1.0;
  }

  // Cerebellum (lower back portion)
  const cerebX = nx > 0 ? nx - 0.22 : nx + 0.22;
  const cerebY = ny - 0.45;
  const cerebZ = nz + 0.38;
  const cerebellum =
    (cerebX * cerebX) / (0.28 * 0.28) +
    (cerebY * cerebY) / (0.22 * 0.22) +
    (cerebZ * cerebZ) / (0.28 * 0.28);

  if (cerebellum <= 1.0) {
    return true;
  }

  // Brainstem (slender stalk protruding downwards)
  if (ny > 0.35 && ny < 0.85 && Math.abs(nx) < 0.12 && Math.abs(nz + 0.1) < 0.14) {
    return true;
  }

  return false;
}

function generateBrainParticles3D(count: number, scale: number): Particle3D[] {
  const particles: Particle3D[] = [];
  let attempts = 0;

  while (particles.length < count && attempts < count * 35) {
    attempts++;

    // Random point in normalized bounding cube [-1, 1]
    const nx = (Math.random() - 0.5) * 1.8;
    const ny = (Math.random() - 0.5) * 1.6;
    const nz = (Math.random() - 0.5) * 1.8;

    if (!isInsideBrain3D(nx, ny, nz)) continue;

    // Prefer surface distribution slightly for clean silhouette definition
    const distCenter = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (distCenter < 0.25 && Math.random() > 0.4) continue;

    const bx = nx * scale;
    const by = ny * scale;
    const bz = nz * scale;

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
      size: 2.2 + Math.random() * 4.2,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      triangleRot: Math.random() * Math.PI * 2,
      triangleRotSpeed: (Math.random() - 0.5) * 0.03,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.015 + Math.random() * 0.03,
      baseOpacity: 0.35 + Math.random() * 0.55,
      currentOpacity: 0.5,
      driftPhaseX: Math.random() * Math.PI * 2,
      driftPhaseY: Math.random() * Math.PI * 2,
      driftPhaseZ: Math.random() * Math.PI * 2,
      driftSpeed: 0.003 + Math.random() * 0.005,
      driftAmp: 4 + Math.random() * 8,
    });
  }

  return particles;
}

function generateStardust(count: number, width: number, height: number): Stardust3D[] {
  return Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * width * 1.8,
    y: (Math.random() - 0.5) * height * 1.8,
    z: (Math.random() - 0.5) * 1200,
    vx: (Math.random() - 0.5) * 0.25,
    vy: -0.15 - Math.random() * 0.3, // Gentle upward cosmic float
    vz: (Math.random() - 0.5) * 0.3,
    size: 1.0 + Math.random() * 2.6,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    opacity: 0.1 + Math.random() * 0.4,
    opacitySpeed: 0.004 + Math.random() * 0.008,
    opacityDir: Math.random() > 0.5 ? 1 : -1,
  }));
}

// Draw a single 3D-projected chromatic triangle glyph
function renderTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string,
  opacity: number,
  lineWidth: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  // Equilateral triangle
  const h = size * 0.866;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.67);
  ctx.lineTo(-size * 0.5, h * 0.33);
  ctx.lineTo(size * 0.5, h * 0.33);
  ctx.closePath();
  ctx.stroke();

  // Highlight inner vertex for spark particles
  if (size > 3.5 && opacity > 0.6) {
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity * 0.35;
    ctx.fill();
  }

  ctx.restore();
}

export function BrainConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle3D[]>([]);
  const stardustRef = useRef<Stardust3D[]>([]);

  // Smooth interpolated motion states
  const mouseRef = useRef({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    active: false,
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

    // Dynamic brain scale tailored to viewport
    const brainScale = Math.min(rect.width, rect.height) * (rect.width >= 1024 ? 0.38 : 0.34);
    const particleCount = rect.width < 768 ? 1100 : rect.width < 1280 ? 1800 : 2500;
    const stardustCount = rect.width < 768 ? 80 : 160;

    particlesRef.current = generateBrainParticles3D(particleCount, brainScale);
    stardustRef.current = generateStardust(stardustCount, rect.width, rect.height);
  }, []);

  useEffect(() => {
    init();

    const handleResize = () => {
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      mouseRef.current.targetX = (e.clientX / w - 0.5) * 2; // -1 to 1
      mouseRef.current.targetY = (e.clientY / h - 0.5) * 2; // -1 to 1
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      mouseRef.current.active = false;
    };

    const handleScroll = () => {
      scrollRef.current.targetY = window.scrollY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial scroll setup
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

      // Smooth mouse interpolation (spring lerp)
      const m = mouseRef.current;
      m.currentX += (m.targetX - m.currentX) * 0.04;
      m.currentY += (m.targetY - m.currentY) * 0.04;

      // Smooth scroll interpolation
      const s = scrollRef.current;
      s.currentY += (s.targetY - s.currentY) * 0.06;
      const maxScroll = Math.max(document.body.scrollHeight - h, 1);
      const scrollProgress = Math.min(Math.max(s.currentY / maxScroll, 0), 1);

      // Dynamic 3D Camera Center Point
      // On desktop: Hero state positions the brain on the right column (~70% width)
      // As user scrolls, it glides across the page with organic orbital sway
      const isDesktop = w >= 1024;
      const heroCenterX = isDesktop ? w * 0.71 : w * 0.5;
      const heroCenterY = isDesktop ? h * 0.48 : h * 0.38;

      // Drift path as user scrolls down the site
      const scrollDriftX = Math.sin(scrollProgress * Math.PI * 2.2) * (isDesktop ? w * 0.16 : w * 0.08);
      const scrollDriftY = Math.cos(scrollProgress * Math.PI * 1.5) * (h * 0.1) + Math.sin(t * 0.003) * 12;

      const centerX = heroCenterX - (scrollProgress > 0 ? scrollProgress * (isDesktop ? w * 0.18 : 0) : 0) + scrollDriftX;
      const centerY = heroCenterY + scrollDriftY;

      // Dynamic 3D Rotations (Continuous spin + mouse parallax + scroll pitch/yaw)
      const rot = rotRef.current;
      const autoSpinY = t * 0.0025; // Gentle majestic idle revolution
      const autoSpinX = Math.sin(t * 0.0018) * 0.12;

      const scrollRotY = scrollProgress * Math.PI * 3.5; // Rotates 3D as user scrolls through site
      const scrollRotX = Math.sin(scrollProgress * Math.PI * 2) * 0.45;
      const scrollRotZ = Math.cos(scrollProgress * Math.PI) * 0.2;

      const mouseTiltY = m.currentX * 0.45;
      const mouseTiltX = -m.currentY * 0.35;

      rot.targetRotY = autoSpinY + scrollRotY + mouseTiltY;
      rot.targetRotX = autoSpinX + scrollRotX + mouseTiltX;

      rot.rotY += (rot.targetRotY - rot.rotY) * 0.08;
      rot.rotX += (rot.targetRotX - rot.rotX) * 0.08;
      rot.rotZ = scrollRotZ;

      const cosY = Math.cos(rot.rotY);
      const sinY = Math.sin(rot.rotY);
      const cosX = Math.cos(rot.rotX);
      const sinX = Math.sin(rot.rotX);
      const cosZ = Math.cos(rot.rotZ);
      const sinZ = Math.sin(rot.rotZ);

      // Camera focal length for realistic perspective
      const cameraZ = 750;

      // 1. UPDATE & PROJECT PARTICLES
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Individual organic drift within the constellation
        const driftX = Math.sin(t * p.driftSpeed + p.driftPhaseX) * p.driftAmp;
        const driftY = Math.cos(t * p.driftSpeed + p.driftPhaseY) * p.driftAmp * 0.8;
        const driftZ = Math.sin(t * p.driftSpeed + p.driftPhaseZ) * p.driftAmp;

        p.x = p.baseX + driftX;
        p.y = p.baseY + driftY;
        p.z = p.baseZ + driftZ;

        // 3D Matrix Rotation (Y axis -> X axis -> Z axis)
        // 1. Rotate Y
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y1 = p.y;

        // 2. Rotate X
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;
        const x2 = x1;

        // 3. Rotate Z
        const x3 = x2 * cosZ - y2 * sinZ;
        const y3 = x2 * sinZ + y2 * cosZ;
        const z3 = z2;

        p.rotatedZ = z3;

        // Perspective projection calculation
        const perspective = cameraZ / (cameraZ + z3);
        p.projScale = perspective;
        p.projX = centerX + x3 * perspective;
        p.projY = centerY + y3 * perspective;

        // Triangle glyph rotation
        p.triangleRot += p.triangleRotSpeed;

        // Breathing opacity
        p.pulsePhase += p.pulseSpeed;
        const pulse = (Math.sin(p.pulsePhase) + 1) * 0.5; // 0 to 1
        const depthAlpha = Math.max(0.12, Math.min(1.0, (z3 + 300) / 600));
        p.currentOpacity = p.baseOpacity * (0.6 + pulse * 0.4) * depthAlpha;
      }

      // Sort particles by rotatedZ (back-to-front painter's algorithm)
      particles.sort((a, b) => a.rotatedZ - b.rotatedZ);

      // 2. DRAW SPARSE SYNAPTIC FILAMENTS (Connect close particles)
      ctx.save();
      const sampleLimit = Math.min(particles.length, 240);
      for (let i = 0; i < sampleLimit; i++) {
        const p1 = particles[i];
        if (p1.projScale < 0.8) continue; // Only connect particles in mid/foreground

        for (let j = i + 1; j < Math.min(i + 8, sampleLimit); j++) {
          const p2 = particles[j];
          const dx = p1.projX - p2.projX;
          const dy = p1.projY - p2.projY;
          const dist2D = Math.sqrt(dx * dx + dy * dy);

          if (dist2D < 38) {
            const filamentAlpha = (1 - dist2D / 38) * 0.09 * p1.projScale;
            ctx.globalAlpha = filamentAlpha;
            ctx.strokeStyle = '#8052ff';
            ctx.lineWidth = 0.5 * p1.projScale;
            ctx.beginPath();
            ctx.moveTo(p1.projX, p1.projY);
            ctx.lineTo(p2.projX, p2.projY);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // 3. DRAW PARTICLES
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const currentSize = Math.max(1.2, p.size * p.projScale);
        const lineWidth = Math.max(0.6, 1.1 * p.projScale);

        renderTriangle(
          ctx,
          p.projX,
          p.projY,
          currentSize,
          p.triangleRot,
          p.color,
          p.currentOpacity,
          lineWidth
        );
      }

      // 4. DRAW 3D AMBIENT STARDUST & DRIFTING EMBERS
      const dust = stardustRef.current;
      for (let i = 0; i < dust.length; i++) {
        const d = dust[i];

        // Motion
        d.x += d.vx;
        d.y += d.vy - scrollProgress * 0.5; // Stardust flows upward as user scrolls down
        d.z += d.vz;

        // Wrap boundaries in 3D
        const boundX = w * 0.9;
        const boundY = h * 0.9;
        if (d.x < -boundX) d.x = boundX;
        if (d.x > boundX) d.x = -boundX;
        if (d.y < -boundY) d.y = boundY;
        if (d.y > boundY) d.y = -boundY;
        if (d.z < -600) d.z = 600;
        if (d.z > 600) d.z = -600;

        // Opacity pulsing
        d.opacity += d.opacityDir * d.opacitySpeed;
        if (d.opacity > 0.55) d.opacityDir = -1;
        if (d.opacity < 0.08) d.opacityDir = 1;

        // Project stardust
        const dScale = cameraZ / (cameraZ + d.z);
        const screenX = w * 0.5 + d.x * dScale;
        const screenY = h * 0.5 + d.y * dScale;

        if (screenX >= 0 && screenX <= w && screenY >= 0 && screenY <= h) {
          ctx.save();
          ctx.globalAlpha = d.opacity * Math.min(dScale, 1.2);
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
