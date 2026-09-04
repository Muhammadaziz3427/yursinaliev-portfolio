import { Link } from 'wouter';
import {
  Github,
  Linkedin,
  Instagram,
  Send,
  Mail,
  ShieldCheck,
  Terminal,
  Activity,
  Heart,
  ArrowUpRight,
} from 'lucide-react';
import { soundFX } from './SoundFX';

interface MaximalistFooterProps {
  siteConfig?: {
    github?: string;
    linkedin?: string;
    instagram?: string;
    telegram?: string;
    email?: string;
    name?: string;
    title?: string;
  };
}

export function MaximalistFooter({ siteConfig }: MaximalistFooterProps) {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'GitHub', href: siteConfig?.github || 'https://github.com/Muhammadaziz3427', icon: Github, color: 'hover:text-cyan-400' },
    { name: 'Telegram', href: siteConfig?.telegram || 'https://t.me/yursinaliev', icon: Send, color: 'hover:text-blue-400' },
    { name: 'LinkedIn', href: siteConfig?.linkedin || 'https://linkedin.com/in/muhammadaziz-yursinaliev', icon: Linkedin, color: 'hover:text-purple-400' },
    { name: 'Instagram', href: siteConfig?.instagram || 'https://instagram.com/yursinaliev', icon: Instagram, color: 'hover:text-rose-400' },
    { name: 'Email', href: `mailto:${siteConfig?.email || 'yursinaliev@gmail.com'}`, icon: Mail, color: 'hover:text-emerald-400' },
  ];

  const exploreLinks = [
    { name: 'Medical AI Systems', href: '/medical' },
    { name: 'Cybersecurity Red Team', href: '/security' },
    { name: 'Engineering Projects', href: '/projects' },
    { name: 'Research Essays', href: '/essays' },
    { name: 'Terminal Labs & Games', href: '/games' },
    { name: 'Curated Library', href: '/books' },
    { name: 'Expeditions & Travel', href: '/travel' },
    { name: 'Developer Cheat Sheets', href: '/tips' },
    { name: 'Career Odyssey & About', href: '/about' },
    { name: 'Encrypted Contact', href: '/contact' },
  ];

  return (
    <footer className="relative z-20 mt-20 border-t border-white/10 bg-[#060913] text-gray-400 font-space overflow-hidden">
      {/* Background Neon Grid Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 p-[1.5px] shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                <div className="w-full h-full bg-[#080c18] rounded-[10px] flex items-center justify-center font-bebas text-base text-cyan-300">
                  MY
                </div>
              </div>
              <span className="font-bebas text-2xl tracking-wider text-white">
                {siteConfig?.name || 'MUHAMMADAZIZ YURSINALIEV'}
              </span>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">
              Software Engineer & Biomedical Innovation Pioneer. Building high-resilience systems at the nexus of artificial intelligence, clinical informatics, and cybersecurity.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-xs text-emerald-400">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>SYSTEM STATE: OPTIMAL • 99.9% UPTIME</span>
            </div>
          </div>

          {/* Col 2: 10-Module Navigation Grid */}
          <div className="space-y-3">
            <h4 className="font-bebas text-lg tracking-wider text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              DYNAMIC MODULES
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              {exploreLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => soundFX.playClick()}
                    onMouseEnter={() => soundFX.playHover()}
                    className="hover:text-cyan-300 transition-colors flex items-center gap-1 group"
                  >
                    <span className="text-cyan-500/60 group-hover:text-cyan-400">›</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Security & Encryption Telemetry */}
          <div className="space-y-3">
            <h4 className="font-bebas text-lg tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              SYSTEM VERIFICATION
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex justify-between text-gray-300">
                  <span>ENCRYPTION:</span>
                  <span className="text-cyan-400">AES-256-GCM</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>CMS BACKEND:</span>
                  <span className="text-emerald-400">SUPABASE POSTGRES</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>RUNTIME:</span>
                  <span className="text-purple-400">REACT 19 + VITE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Social & Direct Dispatch */}
          <div className="space-y-3">
            <h4 className="font-bebas text-lg tracking-wider text-white">
              DIRECT TRANSMISSION
            </h4>
            <p className="text-xs text-gray-400">
              Open for high-impact engineering collaborations, biomedical consulting, and cutting-edge research ventures.
            </p>

            <div className="flex items-center gap-2 pt-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    onMouseEnter={() => soundFX.playHover()}
                    onClick={() => soundFX.playClick()}
                    className={`p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-gray-300 ${social.color} hover:bg-white/[0.08] hover:border-white/20 transition-all shadow-sm`}
                    title={social.name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-gray-500 gap-4">
          <div>
            © {currentYear} {siteConfig?.name || 'Muhammadaziz Yursinaliev'}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              WARP ENGINE V5.0
            </span>
            <Link
              href="/admin"
              onClick={() => soundFX.playClick()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              CMS Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
