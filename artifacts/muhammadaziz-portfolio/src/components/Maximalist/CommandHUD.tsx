import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Command,
  Home,
  Stethoscope,
  Shield,
  Gamepad2,
  FolderGit2,
  BookOpen,
  MapPin,
  Bookmark,
  Lightbulb,
  User,
  Mail,
  Lock,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
} from 'lucide-react';
import { soundFX } from './SoundFX';

interface CommandHUDProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandHUD({ isOpen, onClose }: CommandHUDProps) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(soundFX.isEnabled());

  const navigationItems = [
    { name: 'Command Center (Home)', path: '/', icon: Home, category: 'Core', color: 'text-emerald-400' },
    { name: 'Medical & Clinical AI Systems', path: '/medical', icon: Stethoscope, category: 'Biomedical', color: 'text-cyan-400' },
    { name: 'Cybersecurity & Offensive Labs', path: '/security', icon: Shield, category: 'Security', color: 'text-purple-400' },
    { name: 'Terminal Games & Simulators', path: '/games', icon: Gamepad2, category: 'Interactive', color: 'text-amber-400' },
    { name: 'Engineering Projects Deck', path: '/projects', icon: FolderGit2, category: 'Engineering', color: 'text-blue-400' },
    { name: 'Research Essays & Insights', path: '/essays', icon: BookOpen, category: 'Essays', color: 'text-rose-400' },
    { name: 'Expedition & Travel Radar', path: '/travel', icon: MapPin, category: 'Expeditions', color: 'text-emerald-300' },
    { name: 'Curated Library of Books', path: '/books', icon: Bookmark, category: 'Library', color: 'text-amber-300' },
    { name: 'Developer Cheat Sheets & Tips', path: '/tips', icon: Lightbulb, category: 'Snippets', color: 'text-yellow-400' },
    { name: 'About & Career Odyssey', path: '/about', icon: User, category: 'Biography', color: 'text-indigo-400' },
    { name: 'Encrypted Contact Terminal', path: '/contact', icon: Mail, category: 'Communication', color: 'text-teal-400' },
    { name: 'Supabase Admin CMS Portal', path: '/admin', icon: Lock, category: 'Admin', color: 'text-red-400' },
  ];

  const filteredItems = navigationItems.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.path.toLowerCase().includes(query.toLowerCase())
  );

  const handleNavigate = (path: string) => {
    soundFX.playClick();
    setLocation(path);
    onClose();
  };

  const handleSoundToggle = () => {
    const active = soundFX.toggleSound();
    setSoundEnabled(active);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          soundFX.playHover();
          // parent opens
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-[#090d18] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden z-10"
          >
            {/* Top Search Field */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
              <Search className="w-5 h-5 text-cyan-400 mr-3 animate-pulse" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search modules, medical records, security labs, projects..."
                className="w-full bg-transparent text-white placeholder-gray-500 font-space text-sm focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions Row */}
            <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5 text-xs font-mono text-gray-400">
              <span className="flex items-center gap-2">
                <Command className="w-3.5 h-3.5 text-cyan-400" />
                <span>QUICK TELEPORTATION HUD</span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSoundToggle}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                >
                  {soundEnabled ? <Volume2 className="w-3 h-3 text-cyan-400" /> : <VolumeX className="w-3 h-3" />}
                  <span>{soundEnabled ? 'SOUND FX: ON' : 'SOUND FX: OFF'}</span>
                </button>
                <span>ESC to close</span>
              </div>
            </div>

            {/* Results List */}
            <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 divide-y divide-white/[0.02]">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-gray-500 font-mono text-sm">
                  No matching modules found for "{query}".
                </div>
              ) : (
                filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      onMouseEnter={() => soundFX.playHover()}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-cyan-950/40 hover:to-purple-950/40 border border-transparent hover:border-cyan-500/30 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10 group-hover:border-cyan-400/50 transition-colors">
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-200 group-hover:text-white flex items-center gap-2">
                            {item.name}
                          </div>
                          <div className="text-[11px] font-mono text-gray-500">
                            {item.category} • <span className="text-cyan-400/70">{item.path}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Status Bar */}
            <div className="px-4 py-2.5 bg-black/60 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-500">
              <span>Muhammadaziz Yursinaliev • Quantum CMS</span>
              <span className="text-emerald-400">⚡ 10 Dynamic Modules Loaded</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
