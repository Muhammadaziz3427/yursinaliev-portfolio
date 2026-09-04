import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Menu,
  X,
  Command,
  Volume2,
  VolumeX,
  Lock,
  Stethoscope,
  Shield,
  FolderGit2,
  BookOpen,
  Gamepad2,
  Sparkles,
} from 'lucide-react';
import { soundFX } from './SoundFX';

interface MaximalistNavbarProps {
  onOpenCommandHUD: () => void;
}

export function MaximalistNavbar({ onOpenCommandHUD }: MaximalistNavbarProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(soundFX.isEnabled());

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Medical AI', path: '/medical', icon: Stethoscope, badge: 'Bio-Tech' },
    { name: 'Security', path: '/security', icon: Shield, badge: 'RedTeam' },
    { name: 'Projects', path: '/projects', icon: FolderGit2 },
    { name: 'Essays', path: '/essays', icon: BookOpen },
    { name: 'Games/Labs', path: '/games', icon: Gamepad2 },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const toggleSound = () => {
    const next = soundFX.toggleSound();
    setSoundActive(next);
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 pt-3 pb-1">
      <nav 
        aria-label="Maximalist Navigation"
        className="max-w-7xl mx-auto rounded-2xl bg-[#090d19]/80 border border-white/10 backdrop-blur-xl px-4 py-2.5 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-between transition-all duration-300 hover:border-cyan-500/30"
      >
        {/* Left: Brand Identity with Neon Pill */}
        <Link 
          href="/"
          onClick={() => soundFX.playClick()}
          onMouseEnter={() => soundFX.playHover()}
          className="flex items-center gap-3 group"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-emerald-400 p-[1.5px] shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#080c18] rounded-[10px] flex items-center justify-center font-bebas text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
              MY
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-bebas text-xl tracking-wider text-white group-hover:text-cyan-300 transition-colors">
              MUHAMMADAZIZ
            </span>
            <span className="font-mono text-[9px] tracking-widest text-gray-400 -mt-1 group-hover:text-emerald-400 transition-colors uppercase">
              BIO-TECH • CYBERSECURITY
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => soundFX.playClick()}
                onMouseEnter={() => soundFX.playHover()}
                className={`relative px-3 py-1.5 rounded-xl font-space text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : 'text-gray-300 hover:text-white hover:bg-white/[0.05] border border-transparent'
                }`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />}
                <span>{link.name}</span>
                {link.badge && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/10 text-emerald-400 border border-emerald-500/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions (Command HUD, Sound Toggle, Admin Portal) */}
        <div className="flex items-center gap-2">
          {/* Command HUD Search Trigger */}
          <button
            onClick={() => {
              soundFX.playClick();
              onOpenCommandHUD();
            }}
            onMouseEnter={() => soundFX.playHover()}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-gray-300 hover:border-cyan-400/40 hover:text-cyan-300 transition-all shadow-sm"
          >
            <Command className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">COMMAND HUD</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-gray-400 font-mono">⌘K</kbd>
          </button>

          {/* Sound Synthesizer Toggle */}
          <button
            onClick={toggleSound}
            onMouseEnter={() => soundFX.playHover()}
            className={`p-2 rounded-xl border transition-all ${
              soundActive
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.08]'
            }`}
            title={soundActive ? 'Mute Web Audio' : 'Enable Web Audio FX'}
          >
            {soundActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Admin CMS Shortcut */}
          <Link
            href="/admin"
            onClick={() => soundFX.playClick()}
            onMouseEnter={() => soundFX.playHover()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/40 text-xs font-mono font-bold text-emerald-300 hover:shadow-[0_0_20px_rgba(30,255,160,0.35)] transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CMS</span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => {
              soundFX.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 rounded-2xl bg-[#090d19]/95 border border-white/10 backdrop-blur-2xl space-y-2 shadow-2xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => {
                soundFX.playClick();
                setMobileMenuOpen(false);
              }}
              className={`block px-3 py-2 rounded-xl text-sm font-space font-medium ${
                location === link.path
                  ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-400/40'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenCommandHUD();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-mono text-cyan-400"
            >
              <Command className="w-4 h-4" /> Open Command HUD
            </button>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-mono text-emerald-400 flex items-center gap-1"
            >
              <Lock className="w-3.5 h-3.5" /> Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
