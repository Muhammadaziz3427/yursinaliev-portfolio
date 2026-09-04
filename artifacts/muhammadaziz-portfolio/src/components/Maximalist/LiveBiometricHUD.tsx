import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Shield, Cpu, Zap, Volume2, VolumeX } from 'lucide-react';
import { soundFX } from './SoundFX';

type TelemetryMode = 'zen' | 'normal' | 'overclock';

export function LiveBiometricHUD() {
  const [mode, setMode] = useState<TelemetryMode>('normal');
  const [bpm, setBpm] = useState(72);
  const [spo2, setSpo2] = useState(99.1);
  const [cognitiveLoad, setCognitiveLoad] = useState(64);
  const [soundActive, setSoundActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (mode === 'normal') {
        setBpm(Math.floor(70 + Math.random() * 6));
        setSpo2(Number((98.8 + Math.random() * 0.8).toFixed(1)));
        setCognitiveLoad(Math.floor(60 + Math.random() * 10));
      } else if (mode === 'overclock') {
        setBpm(Math.floor(135 + Math.random() * 15));
        setSpo2(Number((99.2 + Math.random() * 0.6).toFixed(1)));
        setCognitiveLoad(Math.floor(88 + Math.random() * 10));
      } else {
        // zen
        setBpm(Math.floor(52 + Math.random() * 4));
        setSpo2(Number((99.5 + Math.random() * 0.4).toFixed(1)));
        setCognitiveLoad(Math.floor(30 + Math.random() * 8));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [mode]);

  const handleModeChange = (newMode: TelemetryMode) => {
    setMode(newMode);
    soundFX.playClick();
  };

  const handleToggleSound = () => {
    const enabled = soundFX.toggleSound();
    setSoundActive(enabled);
  };

  // Pulse animation duration based on mode
  const pulseDuration = mode === 'overclock' ? 0.6 : mode === 'zen' ? 1.6 : 1.0;

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#0e1424]/90 to-[#070b14]/95 border border-cyan-500/30 p-5 shadow-[0_0_40px_rgba(0,240,255,0.12)] backdrop-blur-xl overflow-hidden group">
      {/* Corner HUD markers */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/80" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/80" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/80" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/80" />

      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-emerald-400 font-bold tracking-widest uppercase">
            LIVE BIO-SURGICAL TELEMETRY
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            onMouseEnter={() => soundFX.playHover()}
            className={`p-1.5 rounded-lg border transition-all ${
              soundActive
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
            title="Toggle Web Audio Synthesizer"
          >
            {soundActive ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          
          <span className="text-[10px] text-cyan-400/80 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
            REV-5.4
          </span>
        </div>
      </div>

      {/* Mode Selectors */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {(['zen', 'normal', 'overclock'] as TelemetryMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            onMouseEnter={() => soundFX.playHover()}
            className={`py-1 px-2 rounded-lg font-mono text-[11px] font-bold uppercase transition-all duration-300 ${
              mode === m
                ? m === 'overclock'
                  ? 'bg-rose-500/20 border border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : m === 'zen'
                  ? 'bg-purple-500/20 border border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(30,255,160,0.4)]'
                : 'bg-white/[0.03] border border-white/5 text-gray-400 hover:bg-white/[0.08] hover:text-gray-200'
            }`}
          >
            {m === 'zen' ? '🌿 ZEN' : m === 'normal' ? '⚡ NOMINAL' : '🔥 OVERCLOCK'}
          </button>
        ))}
      </div>

      {/* Main ECG Waveform Display */}
      <div className="relative h-24 w-full bg-black/60 rounded-xl border border-cyan-500/20 p-2 overflow-hidden mb-4">
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)`,
            backgroundSize: '16px 16px'
          }}
        />

        {/* Animated Scanline */}
        <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-scanline pointer-events-none" />

        {/* Dynamic ECG Line */}
        <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ecgGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.2" />
              <stop offset="50%" stopColor={mode === 'overclock' ? '#F43F5E' : mode === 'zen' ? '#A855F7' : '#1EFFA0'} stopOpacity="1" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background trail */}
          <path
            d="M 0 40 L 40 40 L 55 40 L 65 15 L 75 65 L 85 5 L 95 60 L 105 40 L 140 40 L 180 40 L 195 40 L 205 15 L 215 65 L 225 5 L 235 60 L 245 40 L 280 40 L 320 40 L 335 40 L 345 15 L 355 65 L 365 5 L 375 60 L 385 40 L 400 40"
            fill="none"
            stroke="url(#ecgGlow)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glowFilter)"
            className="animate-pulse"
            style={{ animationDuration: `${pulseDuration}s` }}
          />
        </svg>

        {/* Live Floating BPM overlay */}
        <div className="absolute top-2 right-3 flex items-center gap-1.5 bg-black/80 px-2.5 py-1 rounded-md border border-white/10 font-mono">
          <Heart className={`w-3.5 h-3.5 ${mode === 'overclock' ? 'text-rose-500 animate-ping' : 'text-emerald-400 animate-pulse'}`} />
          <span className="text-white font-bold text-sm tracking-tighter">{bpm}</span>
          <span className="text-[9px] text-gray-400">BPM</span>
        </div>
      </div>

      {/* 4 Multi-Vitals Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Vital 1: Pulse */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-2.5 text-center transition-transform hover:scale-105">
          <div className="flex items-center justify-center gap-1 text-emerald-400 text-[10px] font-mono mb-1">
            <Activity className="w-3 h-3" /> PULSE
          </div>
          <div className="text-lg font-bebas tracking-wide text-white">{bpm} <span className="text-[10px] font-mono text-gray-400">bpm</span></div>
          <div className="w-full bg-emerald-950/50 h-1.5 rounded-full overflow-hidden mt-1.5">
            <motion.div 
              className="bg-emerald-400 h-full rounded-full"
              animate={{ width: `${Math.min(100, (bpm / 160) * 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Vital 2: SpO2 */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-2.5 text-center transition-transform hover:scale-105">
          <div className="flex items-center justify-center gap-1 text-cyan-400 text-[10px] font-mono mb-1">
            <Zap className="w-3 h-3" /> SpO₂
          </div>
          <div className="text-lg font-bebas tracking-wide text-white">{spo2}%</div>
          <div className="w-full bg-cyan-950/50 h-1.5 rounded-full overflow-hidden mt-1.5">
            <motion.div 
              className="bg-cyan-400 h-full rounded-full"
              animate={{ width: `${spo2}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Vital 3: Cognitive Load */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-2.5 text-center transition-transform hover:scale-105">
          <div className="flex items-center justify-center gap-1 text-purple-400 text-[10px] font-mono mb-1">
            <Cpu className="w-3 h-3" /> COGNITIVE
          </div>
          <div className="text-lg font-bebas tracking-wide text-white">{cognitiveLoad}%</div>
          <div className="w-full bg-purple-950/50 h-1.5 rounded-full overflow-hidden mt-1.5">
            <motion.div 
              className="bg-purple-400 h-full rounded-full"
              animate={{ width: `${cognitiveLoad}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Vital 4: Shield / Security */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-2.5 text-center transition-transform hover:scale-105">
          <div className="flex items-center justify-center gap-1 text-amber-400 text-[10px] font-mono mb-1">
            <Shield className="w-3 h-3" /> DEFENSE
          </div>
          <div className="text-lg font-bebas tracking-wide text-white">99.9%</div>
          <div className="w-full bg-amber-950/50 h-1.5 rounded-full overflow-hidden mt-1.5">
            <motion.div 
              className="bg-amber-400 h-full rounded-full"
              animate={{ width: '99.9%' }}
            />
          </div>
        </div>
      </div>

      {/* Audio Reactive Spectrum Simulation Bar */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-400">
        <span className="flex items-center gap-1.5 text-cyan-400">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          NEURAL FREQ SPECTRUM
        </span>
        <div className="flex items-end gap-1 h-4">
          {[40, 75, 90, 50, 85, 60, 95, 30, 70, 100, 45, 80].map((h, i) => (
            <motion.div
              key={i}
              className="w-1 bg-gradient-to-t from-cyan-500 to-purple-400 rounded-t"
              animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.5}%`] }}
              transition={{
                duration: 0.6 + (i % 4) * 0.15,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
