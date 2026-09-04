import React, { useState, useRef, type MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { soundFX } from './SoundFX';

interface MaximalistCard3DProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'emerald' | 'cyan' | 'purple' | 'gold' | 'rose';
  onClick?: () => void;
}

export function MaximalistCard3D({
  children,
  className = '',
  glowColor = 'emerald',
  onClick,
}: MaximalistCard3DProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const glowStyles = {
    emerald: {
      border: 'hover:border-emerald-400/60',
      shadow: 'hover:shadow-[0_0_35px_rgba(30,255,160,0.22)]',
      glare: 'rgba(30, 255, 160, 0.15)',
      hud: 'border-emerald-400/70',
    },
    cyan: {
      border: 'hover:border-cyan-400/60',
      shadow: 'hover:shadow-[0_0_35px_rgba(0,240,255,0.22)]',
      glare: 'rgba(0, 240, 255, 0.15)',
      hud: 'border-cyan-400/70',
    },
    purple: {
      border: 'hover:border-purple-400/60',
      shadow: 'hover:shadow-[0_0_35px_rgba(124,58,237,0.25)]',
      glare: 'rgba(124, 58, 237, 0.18)',
      hud: 'border-purple-400/70',
    },
    gold: {
      border: 'hover:border-amber-400/60',
      shadow: 'hover:shadow-[0_0_35px_rgba(255,215,0,0.22)]',
      glare: 'rgba(255, 215, 0, 0.15)',
      hud: 'border-amber-400/70',
    },
    rose: {
      border: 'hover:border-rose-400/60',
      shadow: 'hover:shadow-[0_0_35px_rgba(244,63,94,0.22)]',
      glare: 'rgba(244, 63, 94, 0.15)',
      hud: 'border-rose-400/70',
    },
  }[glowColor];

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -10;
    const rY = ((x - centerX) / centerX) * 10;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    soundFX.playHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const handleClick = () => {
    soundFX.playClick();
    if (onClick) onClick();
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      animate={{
        rotateX,
        rotateY,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={`relative rounded-2xl bg-[#0c101d]/85 backdrop-blur-xl border border-white/10 transition-colors duration-300 ${glowStyles.border} ${glowStyles.shadow} overflow-hidden ${className}`}
    >
      {/* Dynamic Cursor-Tracking Glare/Sheen */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 220px at ${glarePos.x}% ${glarePos.y}%, ${glowStyles.glare}, transparent 80%)`,
          }}
        />
      )}

      {/* Cyber Corner HUD markers */}
      <div className={`absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l ${glowStyles.hud} opacity-40 group-hover:opacity-100 transition-opacity`} />
      <div className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r ${glowStyles.hud} opacity-40 group-hover:opacity-100 transition-opacity`} />
      <div className={`absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l ${glowStyles.hud} opacity-40 group-hover:opacity-100 transition-opacity`} />
      <div className={`absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r ${glowStyles.hud} opacity-40 group-hover:opacity-100 transition-opacity`} />

      {/* Card Content with 3D Pop */}
      <div style={{ transform: 'translateZ(20px)' }} className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
