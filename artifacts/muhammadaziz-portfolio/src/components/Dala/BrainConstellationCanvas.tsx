import { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  driftPhase: number;
  driftSpeed: number;
  driftAmplitude: number;
  opacity: number;
  opacityTarget: number;
  opacitySpeed: number;
}

interface AmbientDot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  opacityDir: number;
}

const PALETTE = [
  '#8052ff', '#8052ff', '#8052ff',  // Electric Iris (dominant)
  '#ffb829', '#ffb829',              // Saffron Spark
  '#15846e',                          // Deep Verdant
  '#d946ef',                          // Magenta
  '#3b82f6',                          // Blue
  '#ffffff',                          // White spark
];

// Brain shape defined as a set of bezier-like anchor points
function isInsideBrainShape(x: number, y: number, cx: number, cy: number, scale: number): boolean {
  const dx = (x - cx) / scale;
  const dy = (y - cy) / scale;

  // Main brain oval
  const mainOval = (dx * dx) / (1.3 * 1.3) + ((dy + 0.05) * (dy + 0.05)) / (1.0 * 1.0);
  if (mainOval > 1) return false;

  // Central fissure (slight gap in the middle top)
  if (Math.abs(dx) < 0.04 && dy < -0.3) return false;

  // Brainstem at bottom
  if (dy > 0.7 && Math.abs(dx) < 0.15 + (dy - 0.7) * 0.3) return true;

  return mainOval <= 1;
}

function generateBrainParticles(
  width: number,
  height: number,
  count: number
): Particle[] {
  const particles: Particle[] = [];
  const cx = width * 0.5;
  const cy = height * 0.48;
  const scale = Math.min(width, height) * 0.35;

  let attempts = 0;
  while (particles.length < count && attempts < count * 20) {
    attempts++;
    const x = cx + (Math.random() - 0.5) * scale * 3;
    const y = cy + (Math.random() - 0.5) * scale * 2.5;

    if (!isInsideBrainShape(x, y, cx, cy, scale)) continue;

    // Density falloff from center
    const distFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / scale;
    if (Math.random() > 1 - distFromCenter * 0.4) continue;

    particles.push({
      x,
      y,
      baseX: x,
      baseY: y,
      size: 2 + Math.random() * 4,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      driftPhase: Math.random() * Math.PI * 2,
      driftSpeed: 0.002 + Math.random() * 0.004,
      driftAmplitude: 2 + Math.random() * 6,
      opacity: 0.3 + Math.random() * 0.7,
      opacityTarget: 0.3 + Math.random() * 0.7,
      opacitySpeed: 0.003 + Math.random() * 0.008,
    });
  }

  return particles;
}

function generateAmbientDots(width: number, height: number, count: number): AmbientDot[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: 1 + Math.random() * 2,
    color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    opacity: 0.1 + Math.random() * 0.3,
    opacityDir: Math.random() > 0.5 ? 1 : -1,
  }));
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  color: string,
  opacity: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const h = size * 0.866;
  ctx.moveTo(0, -h * 0.67);
  ctx.lineTo(-size * 0.5, h * 0.33);
  ctx.lineTo(size * 0.5, h * 0.33);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

export function BrainConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ambientRef = useRef<AmbientDot[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    const particleCount = Math.min(2000, Math.floor((rect.width * rect.height) / 350));
    const ambientCount = Math.min(80, Math.floor(particleCount * 0.06));

    particlesRef.current = generateBrainParticles(rect.width, rect.height, particleCount);
    ambientRef.current = generateAmbientDots(rect.width, rect.height, ambientCount);
  }, []);

  useEffect(() => {
    init();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      init();
    };

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);
      timeRef.current += 1;
      const t = timeRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Draw brain particles
      for (const p of particlesRef.current) {
        // Ambient drift
        const driftX = Math.sin(t * p.driftSpeed + p.driftPhase) * p.driftAmplitude;
        const driftY = Math.cos(t * p.driftSpeed * 0.7 + p.driftPhase) * p.driftAmplitude * 0.6;

        p.x = p.baseX + driftX;
        p.y = p.baseY + driftY;

        // Mouse attraction
        const distToMouse = Math.sqrt((p.x - mx) ** 2 + (p.y - my) ** 2);
        if (distToMouse < 150) {
          const force = (1 - distToMouse / 150) * 8;
          const angle = Math.atan2(my - p.y, mx - p.x);
          p.x += Math.cos(angle) * force;
          p.y += Math.sin(angle) * force;
        }

        // Rotation
        p.rotation += p.rotationSpeed;

        // Pulsing opacity
        if (Math.abs(p.opacity - p.opacityTarget) < 0.01) {
          p.opacityTarget = 0.2 + Math.random() * 0.8;
        }
        p.opacity += (p.opacityTarget - p.opacity) * p.opacitySpeed;

        drawTriangle(ctx, p.x, p.y, p.size, p.rotation, p.color, p.opacity);
      }

      // Draw ambient floating dots
      for (const dot of ambientRef.current) {
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Wrap around edges
        if (dot.x < -20) dot.x = w + 20;
        if (dot.x > w + 20) dot.x = -20;
        if (dot.y < -20) dot.y = h + 20;
        if (dot.y > h + 20) dot.y = -20;

        // Pulse opacity
        dot.opacity += dot.opacityDir * 0.003;
        if (dot.opacity > 0.5) dot.opacityDir = -1;
        if (dot.opacity < 0.05) dot.opacityDir = 1;

        ctx.save();
        ctx.globalAlpha = dot.opacity;
        ctx.fillStyle = dot.color;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw subtle connection lines between close particles (sparse)
      const connectionParticles = particlesRef.current.slice(0, 200);
      ctx.save();
      for (let i = 0; i < connectionParticles.length; i++) {
        for (let j = i + 1; j < connectionParticles.length; j++) {
          const a = connectionParticles[i];
          const b = connectionParticles[j];
          const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
          if (dist < 40) {
            ctx.globalAlpha = (1 - dist / 40) * 0.08;
            ctx.strokeStyle = '#8052ff';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full absolute inset-0"
      style={{ background: 'transparent' }}
      aria-hidden="true"
    />
  );
}
