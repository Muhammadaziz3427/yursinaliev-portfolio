import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Heart, Zap, Cpu } from 'lucide-react';

// ==========================================
// 1. MAXIMALIST HERO BACKGROUND WITH PARTICLES & SHAPES
// ==========================================
export function MaximalistHeroBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dynamic Cursor Light Spot */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] transition-transform duration-300 ease-out opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(30,255,160,0.2) 0%, rgba(0,240,255,0.15) 50%, transparent 70%)',
          transform: `translate(${mousePos.x - 300}px, ${mousePos.y - 300}px)`,
        }}
      />

      {/* Floating Glowing Neon Shapes */}
      <motion.div
        animate={{
          y: [-20, 20, -20],
          rotate: [0, 180, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-16 right-[15%] w-64 h-64 rounded-full border border-emerald-500/20 bg-emerald-500/5 blur-[1px] shadow-[0_0_50px_rgba(30,255,160,0.1)]"
      />

      <motion.div
        animate={{
          y: [20, -20, 20],
          rotate: [360, 180, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-24 left-[10%] w-80 h-80 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 blur-[1px] shadow-[0_0_60px_rgba(0,240,255,0.1)]"
      />

      <motion.div
        animate={{
          x: [-30, 30, -30],
          rotate: [0, -360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 right-[5%] w-48 h-48 rounded-full border border-purple-500/20 bg-purple-500/5 shadow-[0_0_40px_rgba(168,85,247,0.1)]"
      />

      {/* Subtle Grid Lattice */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1EFFA0 1px, transparent 1px),
            linear-gradient(to bottom, #1EFFA0 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}

// ==========================================
// 2. LIVE ECG & BIO-CYBER TELEMETRY WAVEFORM
// ==========================================
export function LiveECGTelemetry() {
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseKey((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative p-5 rounded-2xl border border-emerald-500/30 bg-[#0E1522]/90 backdrop-blur-2xl shadow-[0_0_30px_rgba(30,255,160,0.12)] font-mono overflow-hidden">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <Activity size={15} className="animate-pulse text-emerald-400" />
          <span className="tracking-wider">SURGICAL BIO-TELEMETRY</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] text-emerald-300 font-bold">72 BPM · NORMAL SINUS</span>
        </div>
      </div>

      {/* Animated ECG Waveform */}
      <div className="py-4 relative h-16 flex items-center justify-center overflow-hidden">
        <svg
          key={pulseKey}
          viewBox="0 0 500 60"
          className="w-full h-full text-emerald-400 stroke-current fill-none stroke-[2.5]"
          style={{
            filter: 'drop-shadow(0 0 8px #1EFFA0)',
          }}
        >
          <motion.path
            d="M 0 30 L 70 30 L 80 15 L 90 45 L 100 30 L 140 30 L 150 5 L 160 55 L 170 20 L 180 35 L 190 30 L 260 30 L 270 15 L 280 45 L 290 30 L 330 30 L 340 5 L 350 55 L 360 20 L 370 35 L 380 30 L 500 30"
            initial={{ pathLength: 0, opacity: 0.2 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: 'linear' }}
          />
        </svg>
      </div>

      {/* Micro Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-[10px]">
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="text-slate-500">Zero-Trust Vault</div>
          <div className="text-emerald-300 font-bold mt-0.5">ACTIVE (HKDF)</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="text-slate-500">Vascular Flow</div>
          <div className="text-cyan-300 font-bold mt-0.5">OPTIMAL</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="text-slate-500">Surgical Latency</div>
          <div className="text-amber-300 font-bold mt-0.5">&lt; 12ms</div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. PARALLAX 3D CARD CONTAINER
// ==========================================
export function MaximalistCard3D({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      className={`relative group rounded-2xl overflow-hidden ${className}`}
    >
      {/* Glare Sheen Reflection */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.12) 0%, transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}
