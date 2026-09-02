import { createContext, useCallback, type FormEvent, type ReactNode, useContext, useEffect, useMemo, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  Copy,
  Command,
  ExternalLink,
  Github,
  Heart,
  Instagram,
  LockKeyhole,
  Linkedin,
  Menu,
  MoveUpRight,
  Search,
  Shield,
  ShieldCheck,
  Stethoscope,
  Terminal,
  X,
  MessageSquare,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Layers,
  Code,
  Globe,
  Send,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { getAdminSummary, getPortfolio, postGoogleAuth, postLike, postMagicLink, type ActivityItem, type AdminSummary } from '@/lib/portfolio-api';

const queryClient = new QueryClient();

// ==========================================
// 1. I18N & CONTEXT DEFINITIONS
// ==========================================
type Language = 'EN' | 'UZ' | 'TR';

const translations: Record<Language, Record<string, string>> = {
  EN: {
    home: 'Home',
    projects: 'Projects',
    essays: 'Essays',
    gallery: 'Anatomy Gallery',
    about: 'About',
    admin: 'Admin CMS',
    heroRole: 'Software Engineer & Future Surgeon',
    heroLead: 'Bridging Medical Precision and Cyber-Security Architecture. Building calm, resilient systems and studying human anatomy.',
    selectedWork: 'Explore Projects',
    startConversation: 'Start a Conversation',
    liveTelemetry: 'Live Telemetry',
    searchPlaceholder: 'Search projects, essays, anatomy sketches (⌘K)...',
    fieldNoteTitle: 'Precision & Care',
    fieldNoteSubtitle: 'An operating principle for codebases, incisions, and zero-trust environments.',
    commentsTitle: 'Discussion & Clinical Notes',
    leaveComment: 'Leave a comment or clinical note...',
    postComment: 'Submit Note',
    like: 'Like',
    saved: 'Saved',
    save: 'Save',
    readTime: 'min read',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    resetZoom: 'Reset View',
    verifiedAdmin: 'Admin Access Verified',
    forbiddenTitle: 'Restricted Access',
    forbiddenDesc: 'Sign in with an authorized admin account to manage records.',
    copied: 'Copied to clipboard',
    copyEmail: 'Copy Email'
  },
  UZ: {
    home: 'Bosh sahifa',
    projects: 'Loyihalar',
    essays: 'Maqolalar',
    gallery: 'Anatomiya Galereyasi',
    about: 'Men haqimda',
    admin: 'Boshqaruv Paneli',
    heroRole: 'Dasturchi Muhandis & Bo‘lajak Jarroh',
    heroLead: 'Tibbiy aniqlik va kiberxavfsizlik arxitekturasi chorrahasi. Bardoshli tizimlar yaratish va inson anatomiyasini chuqur o‘rganish.',
    selectedWork: 'Loyihalarni ko‘rish',
    startConversation: 'Bog‘lanish',
    liveTelemetry: 'Jonli Telemetriya',
    searchPlaceholder: 'Loyihalar, maqolalar, eskizlarni qidirish (⌘K)...',
    fieldNoteTitle: 'Aniqlik va Mas’uliyat',
    fieldNoteSubtitle: 'Dasturiy kodlar, jarrohlik kesimlari va xavfsiz tizimlar uchun asosiy tamoyil.',
    commentsTitle: 'Fikrlar va Ilmiy Muhokama',
    leaveComment: 'Fikringiz yoki ilmiy qaydingizni qoldiring...',
    postComment: 'Yuborish',
    like: 'Yoqdi',
    saved: 'Saqlandi',
    save: 'Saqlash',
    readTime: 'daqiqalik mutolaa',
    zoomIn: 'Kattalashtirish',
    zoomOut: 'Kichiklashtirish',
    resetZoom: 'Asliga qaytarish',
    verifiedAdmin: 'Administrator ruxsati tasdiqlandi',
    forbiddenTitle: 'Himoyalangan hudud',
    forbiddenDesc: 'Ma’lumotlarni boshqarish uchun administrator hisobi bilan kiring.',
    copied: 'Xotiraga nusxalandi',
    copyEmail: 'Emailni nusxalash'
  },
  TR: {
    home: 'Ana Sayfa',
    projects: 'Projeler',
    essays: 'Yazılar',
    gallery: 'Anatomi Galerisi',
    about: 'Hakkımda',
    admin: 'Yönetim Paneli',
    heroRole: 'Yazılım Mühendisi & Geleceğin Cerrahı',
    heroLead: 'Tıbbi Hassasiyet ve Siber Güvenlik Mimarisi. Güvenilir sistemler inşa etmek ve anatomi öğrenmek.',
    selectedWork: 'Projeleri İncele',
    startConversation: 'İletişime Geç',
    liveTelemetry: 'Canlı Telemetri',
    searchPlaceholder: 'Projeler, yazılar ve eskizlerde ara (⌘K)...',
    fieldNoteTitle: 'Hassasiyet & Özen',
    fieldNoteSubtitle: 'Kod tabanları, cerrahi kesiler ve güvenli yapılar için temel prensip.',
    commentsTitle: 'Tartışma & Klinik Notlar',
    leaveComment: 'Bir yorum veya klinik not bırakın...',
    postComment: 'Gönder',
    like: 'Beğen',
    saved: 'Kaydedildi',
    save: 'Kaydet',
    readTime: 'dk okuma',
    zoomIn: 'Yakınlaştır',
    zoomOut: 'Uzaklaştır',
    resetZoom: 'Sıfırla',
    verifiedAdmin: 'Yönetici Erişimi Doğrulandı',
    forbiddenTitle: 'Korumalı Alan',
    forbiddenDesc: 'Verileri yönetmek için yetkili hesapla giriş yapın.',
    copied: 'Panoya kopyalandı',
    copyEmail: 'E-postayı kopyala'
  },
};

const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void; t: (key: string) => string }>({
  language: 'EN',
  setLanguage: () => undefined,
  t: (key: string) => key,
});

const SignInContext = createContext<() => void>(() => undefined);
const useLocale = () => useContext(LanguageContext);
const useSignIn = () => useContext(SignInContext);

const PortfolioContext = createContext<{ activity: ActivityItem[]; source: 'supabase' | 'fallback' | 'unknown' }>({
  activity: [],
  source: 'unknown',
});
const usePortfolio = () => useContext(PortfolioContext);

// ==========================================
// 2. DATA MODELS & SEED CONTENT
// ==========================================
export type Project = {
  id?: string;
  slug: string;
  number: string;
  name: string;
  summary: string;
  problem: string;
  solution: string;
  techStack: string[];
  result: string;
  year: string;
  role: string;
  githubUrl: string;
  liveUrl: string;
  category: 'Product' | 'Security' | 'Medicine' | 'Prototype';
  imageUrl?: string;
};

export type Essay = {
  slug: string;
  type: string;
  title: string;
  dek: string;
  date: string;
  read: string;
  sections: { id: string; title: string; content: string }[];
};

export type ArtPiece = {
  id: string;
  title: string;
  note: string;
  category: 'Anatomy' | 'UI Design' | 'Cyber Architecture';
  aspectRatio: string;
  details: string[];
  imageUrl?: string;
};

const projects: Project[] = [
  {
    slug: 'kitobcha',
    number: '01',
    name: 'Kitobcha',
    summary: 'A calm, human-centered reading companion for Uzbek book lovers.',
    problem: 'Modern book catalog apps are cluttered with aggressive recommendation feeds and advertising, eroding reading focus and patience.',
    solution: 'Engineered a minimalist, zero-distraction reading ritual with private local tracking, spaced notes, and high-performance server-side rendering.',
    techStack: ['Next.js 14', 'TypeScript', 'Supabase', 'Tailwind CSS', 'PostgreSQL'],
    result: 'Over 1,200 active readers',
    year: '2023—24',
    role: 'Lead Architect · Full-Stack',
    githubUrl: 'https://github.com/yursinaliyev/kitobcha',
    liveUrl: 'https://kitobcha.uz',
    category: 'Product',
  },
  {
    slug: 'eco-xarita',
    number: '02',
    name: 'Eco-Xarita',
    summary: 'An environmental intelligence map for recycling and sustainable urban points in Tashkent.',
    problem: 'Recycling points, e-waste centers, and battery deposit points across Uzbekistan were undocumented and unverified.',
    solution: 'Built a geospatial platform integrating crowdsourced verification, offline-first sync, and transparent data confidence indicators.',
    techStack: ['React', 'Leaflet / Mapbox', 'Node.js', 'GeoJSON', 'PostGIS'],
    result: '45+ verified facilities mapped',
    year: '2023',
    role: 'Geospatial & Security Lead',
    githubUrl: 'https://github.com/yursinaliyev/eco-xarita',
    liveUrl: 'https://eco-xarita.uz',
    category: 'Product',
  },
  {
    slug: 'suture-notes',
    number: '03',
    name: 'Suture Notes & Bio-Telemetry',
    summary: 'A precision surgical anatomy review engine with spaced repetition and anatomical vector breakdowns.',
    problem: 'Surgical anatomy memorization suffers from static 2D textbook fatigue without active recall for neuromuscular trajectories.',
    solution: 'Designed an interactive SVG vector overlay system with clinical case simulations and zero-latency flash recall.',
    techStack: ['TypeScript', 'Framer Motion', 'Canvas API', 'Tailwind', 'Supabase RLS'],
    result: 'Validated in clinical prep',
    year: '2024',
    role: 'Creator · Research Engineer',
    githubUrl: 'https://github.com/yursinaliyev/suture-notes',
    liveUrl: 'https://suture-notes.dev',
    category: 'Medicine',
  },
  {
    slug: 'neural-vault',
    number: '04',
    name: 'Neural Vault (Zero-Trust Guard)',
    summary: 'An experimental zero-trust identity and encrypted key management protocol.',
    problem: 'Standard session tokens in browser storage are susceptible to cross-site script injection and memory extraction.',
    solution: 'Implemented client-side asymmetric ephemeral key exchange with strict CSP and server-side DOMPurify isolation.',
    techStack: ['Rust / WASM', 'Web Crypto API', 'Next.js', 'PostgreSQL RLS'],
    result: 'A+ Security Headers Rating',
    year: '2024',
    role: 'Cyber-Security Architect',
    githubUrl: 'https://github.com/yursinaliyev/neural-vault',
    liveUrl: 'https://neural-vault.yursinaliev.com',
    category: 'Security',
  },
];

const essays: Essay[] = [
  {
    slug: 'software-should-leave-room',
    type: 'On Engineering & Design',
    title: 'Software Should Leave Room for a Person',
    dek: 'The highest quality interfaces do not demand all our attention. They help us return to what we came to accomplish.',
    date: '18 Mar 2024',
    read: '6 min read',
    sections: [
      {
        id: 'the-cost-of-attention',
        title: '1. Attention as a finite biological resource',
        content: 'There is a particular kind of software that makes you feel watched. Every surface is hyperactive, every microsecond of hesitation is seized as an opportunity to suggest engagement. When designing systems, we must ask not only what the screen does, but what neurological cost it levies on the human operating it.'
      },
      {
        id: 'calm-architecture',
        title: '2. Principles of calm cyber architecture',
        content: 'Restraint is not minimalism for vanity. It is an intentional engineering discipline that protects user intentionality. A clean API, predictable error boundaries, and non-intrusive UI allow users to remain clear-headed and focused.'
      },
      {
        id: 'the-second-pass',
        title: '3. The discipline of the second pass',
        content: 'In code review, the second pass reveals hidden assumptions. In interface design, it reveals unnecessary noise. Precision is not speed with rough edges smoothed over; it is clarity that survives rigorous scrutiny.'
      }
    ]
  },
  {
    slug: 'learning-with-both-hands',
    type: 'Clinical & Technical',
    title: 'Learning with Both Hands: Surgery and Distributed Systems',
    dek: 'What rigorous surgical training and mission-critical cybersecurity engineering teach each other about precision under pressure.',
    date: '02 Feb 2024',
    read: '8 min read',
    sections: [
      {
        id: 'irreversible-actions',
        title: '1. The weight of irreversible actions',
        content: 'In surgery, every incision is irrevocable. In secure systems, state mutations and cryptographic signing carry permanent weight. Operating in both disciplines instills a deep habit of pre-action verification: check twice, verify boundaries, execute with steady hands.'
      },
      {
        id: 'systemic-resilience',
        title: '2. Anatomy as the original distributed system',
        content: 'The human circulatory and nervous systems are masterpieces of redundant, resilient architecture. Understanding anatomical variations prepares an engineer to anticipate edge cases and fail-safes in distributed computing.'
      },
      {
        id: 'humility-and-practice',
        title: '3. Humility before complex environments',
        content: 'The human body and large-scale networks are always more intricate than the simplistic mental models we construct. Mastery begins with humility, careful dissection, and continuous learning.'
      }
    ]
  },
  {
    slug: 'a-map-is-an-argument',
    type: 'Geospatial & Security',
    title: 'A Map is an Argument: Designing for Uncertainty',
    dek: 'Every interface makes decisions about what deserves visibility. Designing Eco-Xarita made that ethical responsibility concrete.',
    date: '11 Nov 2023',
    read: '5 min read',
    sections: [
      {
        id: 'authority-of-maps',
        title: '1. The deceptive certainty of coordinates',
        content: 'Maps arrive with implicit authority. A pin on a coordinate suggests ground truth. But in real-world data collection, coordinates are bounded by verification confidence intervals. Showing uncertainty is not a flaw; it is what creates true trustworthiness.'
      },
      {
        id: 'privacy-in-geospatial',
        title: '2. Privacy and crowdsourced validation',
        content: 'Designing community platforms requires protecting contributors from metadata leakage while guaranteeing that environmental data cannot be manipulated.'
      }
    ]
  }
];

const artPieces: ArtPiece[] = [
  {
    id: 'brachial-plexus',
    title: 'Brachial Plexus Trajectory',
    note: 'Graphite & Vector / C5-T1 nerve roots and axillary branching',
    category: 'Anatomy',
    aspectRatio: '16/10',
    details: [
      'Roots: C5, C6, C7, C8, T1',
      'Trunks: Superior, Middle, Inferior',
      'Clinical significance: Erbs Palsy vs Klumpke Paralysis',
      'Neural terminal branches: Musculocutaneous, Axillary, Radial, Median, Ulnar'
    ]
  },
  {
    id: 'cardiac-conduction',
    title: 'Cardiac Conduction & Sinoatrial Node',
    note: 'Pencil & Digital / SA node, AV node, and Purkinje fiber network',
    category: 'Anatomy',
    aspectRatio: '1/1',
    details: [
      'Primary pacemaker: Sinoatrial (SA) node (60-100 bpm)',
      'Interatrial conduction: Bachmanns bundle',
      'AV delay mechanism: 0.12s physiological pause for ventricular filling',
      'Cyber-analogy: Distributed hardware clock synchronization'
    ]
  },
  {
    id: 'zero-trust-mesh',
    title: 'Zero-Trust Cyber Architecture Topology',
    note: 'Vector & Schema / Cryptographic mutual TLS and key isolation',
    category: 'Cyber Architecture',
    aspectRatio: '16/9',
    details: [
      'Asymmetric ephemeral session handshakes',
      'Strict Row Level Security (RLS) policies at the database layer',
      'No perimeter trust: every packet verified against role identity',
      'Content-Security-Policy with strict nonce-based script execution'
    ]
  },
  {
    id: 'coronary-arteries',
    title: 'Coronary Vasculature & Microcirculation',
    note: 'Ink study / Left anterior descending (LAD) and circumflex pathways',
    category: 'Anatomy',
    aspectRatio: '4/3',
    details: [
      'LAD: supplies anterior 2/3 of interventricular septum',
      'Right Coronary Artery (RCA): supplies SA node in 60% of individuals',
      'Clinical emergency: Acute ST-elevation myocardial infarction (STEMI)'
    ]
  },
  {
    id: 'neural-interface-ui',
    title: 'Bio-Cyber Telemetry HUD',
    note: 'UI Design / Dark glassmorphic medical telemetry monitor',
    category: 'UI Design',
    aspectRatio: '16/10',
    details: [
      'High-contrast slate foreground (#E2E8F0) on obsidian (#0B0F17)',
      'Emergency alerts highlighted with surgical coral (#FF5E7E)',
      'Subtle 48px grid background lines with scanline pulse',
      'Modular dashboard components built with Shadcn UI & Framer Motion'
    ]
  },
];

// Navigation configuration
const navItems = [
  { href: '/', label: 'Home', key: 'home', index: '00' },
  { href: '/projects', label: 'Projects', key: 'projects', index: '01' },
  { href: '/essays', label: 'Essays', key: 'essays', index: '02' },
  { href: '/gallery', label: 'Gallery', key: 'gallery', index: '03' },
  { href: '/about', label: 'About', key: 'about', index: '04' },
];

// ==========================================
// 3. CORE SHELL & GLOBAL NAVIGATION
// ==========================================
function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,245,160,0.2)]">
        MY
      </div>
      <div>
        <div className="text-sm font-semibold tracking-tight text-slate-100 flex items-center gap-1.5">
          Muhammadaziz <span className="text-emerald-400 font-mono text-[10px] px-1 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">v2.4</span>
        </div>
        <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Stethoscope size={10} className="text-cyan-400" />
          <span>Surgery</span>
          <span className="text-slate-600">·</span>
          <Shield size={10} className="text-emerald-400" />
          <span>CyberSec</span>
        </div>
      </div>
    </div>
  );
}

function SiteShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('EN');
  const [commandOpen, setCommandOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [portfolio, setPortfolio] = useState<{ activity?: ActivityItem[]; source?: 'supabase' | 'fallback' }>({});

  const t = (key: string) => translations[language][key] ?? key;
  const isActive = (href: string) => (href === '/' ? location === '/' : location.startsWith(href));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    getPortfolio().then(setPortfolio).catch(() => setPortfolio({ source: 'fallback' }));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <SignInContext.Provider value={() => setSignInOpen(true)}>
        <PortfolioContext.Provider value={{ activity: portfolio.activity ?? [], source: portfolio.source ?? 'fallback' }}>
          <div className="site-shell min-h-screen bg-[#0B0F17] text-[#E2E8F0] selection:bg-emerald-500/30 selection:text-emerald-300">
            {/* Desktop Left Rail Navigation */}
            <aside className="desktop-rail hidden md:flex fixed top-0 left-0 bottom-0 w-64 border-r border-slate-800/80 bg-[#0B0F17]/90 backdrop-blur-2xl flex-col p-6 z-40" aria-label="Main Navigation">
              <Link href="/" className="mb-12 block group" data-testid="link-brand">
                <BrandMark />
              </Link>

              <nav className="flex flex-col gap-1.5">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all ${
                      isActive(item.href)
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(0,245,160,0.12)] font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                    data-testid={`link-nav-${item.key}`}
                  >
                    <span>{t(item.key)}</span>
                    <span className="text-[10px] text-slate-500">{item.index}</span>
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-slate-800/80 space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Tashkent · Active Prep</span>
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                  <a href="https://github.com/yursinaliyev" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors" title="GitHub">
                    <Github size={15} />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors" title="LinkedIn">
                    <Linkedin size={15} />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-pink-400 transition-colors" title="Instagram">
                    <Instagram size={15} />
                  </a>
                </div>

                <div className="text-[10px] font-mono text-slate-500">
                  yursinaliev.com · © 2024—26
                </div>
              </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-[#0B0F17]/95 backdrop-blur-xl sticky top-0 z-40">
              <Link href="/" data-testid="link-mobile-brand">
                <BrandMark />
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCommandOpen(true)}
                  className="p-2 text-slate-400 hover:text-emerald-400 border border-slate-800 rounded-lg bg-slate-900/60"
                  aria-label="Search"
                >
                  <Search size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 text-slate-400 hover:text-emerald-400 border border-slate-800 rounded-lg bg-slate-900/60"
                  aria-label="Toggle Navigation"
                >
                  {menuOpen ? <X size={16} /> : <Menu size={16} />}
                </button>
              </div>

              {menuOpen && (
                <div className="absolute top-full left-0 right-0 p-4 bg-[#0B0F17] border-b border-slate-800 flex flex-col gap-2 shadow-2xl">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-2.5 rounded-lg text-xs font-mono ${
                        isActive(item.href) ? 'bg-emerald-500/15 text-emerald-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      {t(item.key)}
                    </Link>
                  ))}
                  <Link href="/admin" className="px-4 py-2.5 rounded-lg text-xs font-mono text-cyan-400 border border-cyan-500/30">
                    {t('admin')}
                  </Link>
                </div>
              )}
            </header>

            {/* Top Toolbar: Search Palette & Language Switcher */}
            <div className="top-tools fixed top-5 right-6 z-30 flex items-center gap-2">
              <button
                type="button"
                className="tool-button hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-slate-300 border border-slate-700/80 rounded-lg bg-[#131B27]/80 hover:border-emerald-400/50 hover:text-emerald-300 backdrop-blur-xl transition-all shadow-lg"
                onClick={() => setCommandOpen(true)}
                data-testid="button-open-command-palette"
              >
                <Command size={13} className="text-emerald-400" />
                <span>Search</span>
                <kbd className="px-1.5 py-0.5 text-[9px] bg-slate-800 rounded border border-slate-700 text-slate-400">⌘K</kbd>
              </button>

              <LanguageDropdown language={language} onChange={setLanguage} />

              <Link
                href="/admin"
                className="tool-button flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 border border-slate-700/80 rounded-lg bg-[#131B27]/80 hover:border-cyan-400/50 hover:text-cyan-300 backdrop-blur-xl transition-all shadow-lg"
                title="Admin Security Zone"
              >
                <ShieldCheck size={14} className="text-cyan-400" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </div>

            {/* Main Content Area */}
            <main className="main-content md:ml-64 min-h-screen pb-16">{children}</main>

            <SiteFooter />

            {/* Modals */}
            {commandOpen && <CommandPaletteModal onClose={() => setCommandOpen(false)} />}
            {signInOpen && <AuthModal onClose={() => setSignInOpen(false)} />}
          </div>
        </PortfolioContext.Provider>
      </SignInContext.Provider>
    </LanguageContext.Provider>
  );
}

function LanguageDropdown({ language, onChange }: { language: Language; onChange: (lang: Language) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-slate-300 border border-slate-700/80 rounded-lg bg-[#131B27]/80 hover:border-emerald-400/50 backdrop-blur-xl shadow-lg"
        aria-label="Select language"
      >
        <Globe size={13} className="text-emerald-400" />
        <span>{language}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 rounded-lg border border-slate-700 bg-[#131B27] p-1 shadow-2xl z-50">
          {(['EN', 'UZ', 'TR'] as Language[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                onChange(item);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs font-mono rounded ${
                language === item ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item === 'EN' ? 'English' : item === 'UZ' ? 'O‘zbekcha' : 'Türkçe'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. COMMAND PALETTE (CMD + K / CTRL + K)
// ==========================================
function CommandPaletteModal({ onClose }: { onClose: () => void }) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const search = query.trim().toLowerCase();

  const results = useMemo(() => {
    const navResults = [
      ...navItems,
      { href: '/admin', label: 'Admin Security CMS', key: 'admin', index: '05' },
    ].map((item) => ({
      id: item.href,
      label: item.label,
      detail: `Navigate to ${item.label}`,
      href: item.href,
      kind: 'Navigation',
    }));

    const projectResults = projects.map((p) => ({
      id: p.slug,
      label: p.name,
      detail: `${p.summary} [${p.techStack.join(', ')}]`,
      href: `/projects/${p.slug}`,
      kind: 'Project',
    }));

    const essayResults = essays.map((e) => ({
      id: e.slug,
      label: e.title,
      detail: e.dek,
      href: `/essays/${e.slug}`,
      kind: 'Essay',
    }));

    const galleryResults = artPieces.map((a) => ({
      id: a.id,
      label: a.title,
      detail: a.note,
      href: '/gallery',
      kind: 'Anatomy/Gallery',
    }));

    return [...navResults, ...projectResults, ...essayResults, ...galleryResults].filter(
      (item) => !search || `${item.label} ${item.detail} ${item.kind}`.toLowerCase().includes(search)
    );
  }, [search]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const selectItem = (href: string) => {
    setLocation(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl rounded-xl border border-emerald-500/30 bg-[#131B27] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3.5 border-b border-slate-700/80 gap-3">
          <Search size={16} className="text-emerald-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, clinical essays, anatomy sketches, or commands..."
            className="flex-1 bg-transparent border-0 outline-none text-slate-100 font-mono text-sm placeholder:text-slate-500"
          />
          <kbd className="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded border border-slate-700">ESC</kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {results.length > 0 ? (
            results.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectItem(item.href)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left text-xs font-mono text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-emerald-400 font-bold">›</span>
                  <div className="truncate">
                    <div className="font-semibold text-slate-100">{item.label}</div>
                    <div className="text-[11px] text-slate-400 truncate">{item.detail}</div>
                  </div>
                </div>
                <span className="text-[10px] uppercase text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 shrink-0 ml-2">
                  {item.kind}
                </span>
              </button>
            ))
          ) : (
            <div className="py-10 text-center text-xs font-mono text-slate-500">
              No matching records found in this telemetry archive.
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-slate-800/80 text-[11px] font-mono text-slate-500 flex justify-between">
          <span>Navigate with <strong>Enter</strong></span>
          <span className="text-emerald-400">Bio-Cyber Minimal Index</span>
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// 5. LIVE ACTIVITY LOG TELEMETRY WIDGET
// ==========================================
function ActivityLog() {
  const { activity, source } = usePortfolio();
  const lines = activity.length
    ? activity.slice(0, 4)
    : [
        { label: 'TELEMETRY: active', detail: 'Zero-trust audit: 0 CVEs detected in secure vault', timestamp: '2m ago' },
        { label: 'ANATOMY: study', detail: 'Brachial plexus nerve trajectory rendered in vector', timestamp: '1h ago' },
        { label: 'SURGERY: simulation', detail: 'Vascular anastomosis suturing practice completed', timestamp: '4h ago' },
        { label: 'SYSTEM: deployed', detail: 'Encrypted public key exchange online', timestamp: '1d ago' },
      ];

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-[#131B27]/90 p-4 font-mono text-xs shadow-2xl backdrop-blur-xl relative overflow-hidden">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/80">
        <div className="flex items-center gap-2 text-emerald-400">
          <Terminal size={14} />
          <span className="font-bold tracking-wider">LIVE_ACTIVITY.LOG</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{source === 'supabase' ? 'LIVE SYNC' : 'STANDBY'}</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {lines.map((line, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-slate-300">
            <span className="text-emerald-400 font-bold">›</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-slate-100 font-medium">{line.label}</span>
                <span className="text-[10px] text-slate-500">{line.timestamp}</span>
              </div>
              <p className="text-slate-400 text-[11px] truncate">{line.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
        <span>STATUS: 200 OK</span>
        <span className="text-cyan-400">MED_SYS: ACTIVE</span>
      </div>
    </div>
  );
}

// ==========================================
// 6. AUTHENTICATION MODAL (MAGIC LINK + GOOGLE)
// ==========================================
function AuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);

  const submitMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await postMagicLink(email);
      setStatus('Magic authentication link dispatched to your inbox.');
    } catch {
      setStatus('Sign-in service is currently in standby mode.');
    } finally {
      setPending(false);
    }
  };

  const signInGoogle = async () => {
    setPending(true);
    try {
      const res = await postGoogleAuth();
      if (res.url) window.location.assign(res.url);
      else setStatus('Google OAuth provider ready when credentials are bound.');
    } catch {
      setStatus('Google sign-in unavailable right now.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-xl border border-emerald-500/30 bg-[#131B27] p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-2">
          <LockKeyhole size={13} />
          <span>Authenticated Access</span>
        </div>

        <h2 className="text-xl font-bold text-slate-100 mb-2">Sign in to Participate</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Sign in to leave clinical notes, like essays and projects, and bookmark case studies across sessions.
        </p>

        <div className="space-y-4">
          <button
            type="button"
            onClick={signInGoogle}
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold border border-slate-700 transition-all"
          >
            <ExternalLink size={14} /> Continue with Google OAuth
          </button>

          <div className="relative flex items-center justify-center text-[10px] uppercase font-mono text-slate-500">
            <span className="bg-[#131B27] px-2 z-10">or magic link</span>
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
          </div>

          <form onSubmit={submitMagicLink} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              disabled={pending}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,245,160,0.3)]"
            >
              {pending ? 'Sending Magic Link...' : 'Send Magic Link'}
            </button>
          </form>

          {status && (
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-emerald-400 text-xs font-mono">
              {status}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// 7. FOOTER COMPONENT
// ==========================================
function SiteFooter() {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    await navigator.clipboard?.writeText('hello@yursinaliev.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-slate-800/80 bg-[#0B0F17] py-12 px-6 md:ml-64">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="text-sm font-semibold text-slate-200">Muhammadaziz Yursinaliyev</div>
          <p className="text-xs text-slate-400 mt-1">
            Bridging Software Engineering and Surgical Medicine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-slate-400">
          <Link href="/projects" className="hover:text-emerald-400 transition-colors">Projects</Link>
          <Link href="/essays" className="hover:text-cyan-400 transition-colors">Essays</Link>
          <Link href="/gallery" className="hover:text-emerald-400 transition-colors">Anatomy</Link>
          <Link href="/about" className="hover:text-cyan-400 transition-colors">About</Link>
          <button
            type="button"
            onClick={copyEmail}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? t('copied') : t('copyEmail')}</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

// ==========================================
// 8. INTERACTION CONTROLS (LIKE / BOOKMARK / COMMENTS)
// ==========================================
function InteractionBar({ targetType, targetId }: { targetType: 'project' | 'essay'; targetId: string }) {
  const openSignIn = useSignIn();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(`bm:${targetType}:${targetId}`) === '1';
  });

  const handleLike = async () => {
    try {
      const res = await postLike(targetType, targetId);
      setLiked(res.liked);
      if (typeof res.likesCount === 'number') setLikesCount(res.likesCount);
    } catch {
      setLiked(!liked);
      setLikesCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
    }
  };

  const handleBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    window.localStorage.setItem(`bm:${targetType}:${targetId}`, next ? '1' : '0');
  };

  return (
    <div className="flex items-center gap-3 my-6">
      <button
        type="button"
        onClick={handleLike}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
          liked
            ? 'border-pink-500/50 bg-pink-500/10 text-pink-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
        }`}
      >
        <Heart size={13} className={liked ? 'fill-current' : ''} />
        <span>{liked ? 'Liked' : 'Like'}</span>
        {likesCount > 0 && <span className="opacity-75">· {likesCount}</span>}
      </button>

      <button
        type="button"
        onClick={handleBookmark}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
          bookmarked
            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
        }`}
      >
        <Bookmark size={13} className={bookmarked ? 'fill-current' : ''} />
        <span>{bookmarked ? 'Saved' : 'Save'}</span>
      </button>
    </div>
  );
}

function DiscussionThread({ targetType, targetId }: { targetType: 'project' | 'essay'; targetId: string }) {
  const { t } = useLocale();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<{ id: string; author: string; text: string; date: string }[]>([
    { id: '1', author: 'Dr. Alimov', text: 'Remarkable overlap between the brachial plexus nerve hierarchy and zero-trust mesh routing.', date: '3 days ago' },
    { id: '2', author: 'CyberSec Researcher', text: 'Clean architectural boundary on the client-side key storage.', date: '1 week ago' },
  ]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      { id: Date.now().toString(), author: 'Guest Reviewer', text: commentText.trim(), date: 'Just now' },
    ]);
    setCommentText('');
  };

  return (
    <div className="mt-16 pt-10 border-t border-slate-800/80">
      <div className="flex items-center gap-2 text-sm font-mono text-emerald-400 font-bold mb-6">
        <MessageSquare size={16} />
        <span>{t('commentsTitle')} ({comments.length})</span>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          rows={3}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={t('leaveComment')}
          className="w-full p-3.5 rounded-xl bg-[#131B27] border border-slate-700 text-slate-100 font-sans text-sm outline-none focus:border-emerald-400 transition-colors"
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all"
          >
            <Send size={13} /> {t('postComment')}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="p-4 rounded-xl border border-slate-800/80 bg-[#131B27]/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-200">{c.author}</span>
              <span className="text-[10px] font-mono text-slate-500">{c.date}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 9. HOME PAGE (HIGH-IMPACT HERO & DUAL-CORE)
// ==========================================
function HomePage() {
  const { t } = useLocale();

  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 space-y-24">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Dual-Core Practice: Surgery & CyberSec</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-100 leading-[1.1]">
            Muhammadaziz <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-300 font-serif">
              Yursinaliyev
            </span>
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed font-sans max-w-xl">
            {t('heroLead')}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/projects"
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(0,245,160,0.3)]"
            >
              {t('selectedWork')} <ArrowRight size={14} />
            </Link>

            <Link
              href="/gallery"
              className="flex items-center gap-2 px-5 py-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold transition-all"
            >
              <Stethoscope size={14} /> Anatomy Showcase
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <ActivityLog />
        </div>
      </section>

      {/* Featured Projects */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Systems Architecture</div>
            <h2 className="text-2xl font-bold text-slate-100 font-serif">Selected Projects</h2>
          </div>
          <Link href="/projects" className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1">
            View all ({projects.length}) <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.slice(0, 2).map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="p-6 rounded-xl border border-slate-800 bg-[#131B27]/80 hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(0,245,160,0.1)] transition-all group block"
            >
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-3">
                <span>{p.number} / {p.category}</span>
                <span className="text-slate-500">{p.year}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-300 transition-colors mb-2">
                {p.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{p.summary}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.techStack.map((tech) => (
                  <span key={tech} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                    {tech}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Essays */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Clinical & Cyber Notebook</div>
            <h2 className="text-2xl font-bold text-slate-100 font-serif">Recent Essays</h2>
          </div>
          <Link href="/essays" className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1">
            Read Archive <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {essays.slice(0, 2).map((e) => (
            <Link
              key={e.slug}
              href={`/essays/${e.slug}`}
              className="p-6 rounded-xl border border-slate-800 bg-[#131B27]/80 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(0,210,255,0.1)] transition-all group block"
            >
              <div className="text-xs font-mono text-cyan-400 mb-2">{e.type}</div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                {e.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{e.dek}</p>
              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                <span>{e.date}</span>
                <span>·</span>
                <span>{e.read}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// ==========================================
// 10. PROJECTS PAGE & CASE STUDY DETAIL
// ==========================================
function ProjectsPage() {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Product', 'Security', 'Medicine', 'Prototype'];

  const filtered = projects.filter((p) => filter === 'All' || p.category === filter);

  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 space-y-12">
      <div>
        <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Portfolio Systems</div>
        <h1 className="text-4xl font-bold text-slate-100 font-serif mt-2">Projects & Case Studies</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl">
          Engineered for clinical clarity and zero-trust resilience. Explore problems, solutions, and code repositories.
        </p>

        <div className="flex flex-wrap gap-2 mt-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
                filter === f
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'bg-[#131B27] text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.map((p) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="p-6 rounded-xl border border-slate-800 bg-[#131B27]/80 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(0,245,160,0.1)] transition-all block"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-emerald-400 mb-3">
              <span>{p.number} / {p.category}</span>
              <span className="text-slate-500">{p.year} · {p.role}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2 font-serif">{p.name}</h2>
            <p className="text-sm text-slate-400 mb-4">{p.summary}</p>
            <div className="flex flex-wrap gap-2">
              {p.techStack.map((tech) => (
                <span key={tech} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                  {tech}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const project = projects.find((p) => p.slug === slug);

  if (!project) return <NotFound />;

  return (
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
      <Link href="/projects" className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 hover:underline mb-8">
        <ArrowLeft size={14} /> Back to Projects
      </Link>

      <div className="border-b border-slate-800 pb-8 mb-8">
        <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">{project.number} / Case Study</div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 font-serif mt-2 mb-4">{project.name}</h1>
        <p className="text-base text-slate-300 leading-relaxed font-sans">{project.summary}</p>

        <div className="flex flex-wrap gap-3 mt-6">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,245,160,0.3)]"
            >
              <ExternalLink size={13} /> Live System
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono text-xs font-bold transition-all"
            >
              <Github size={13} /> Source Code
            </a>
          )}
        </div>

        <InteractionBar targetType="project" targetId={project.slug} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2 space-y-8">
          <section className="p-6 rounded-xl border border-slate-800 bg-[#131B27]/80">
            <h3 className="text-xs font-mono uppercase text-pink-400 font-bold tracking-wider mb-2">The Problem</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{project.problem}</p>
          </section>

          <section className="p-6 rounded-xl border border-slate-800 bg-[#131B27]/80">
            <h3 className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider mb-2">The Solution & Architecture</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{project.solution}</p>
          </section>
        </div>

        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-slate-800 bg-[#131B27]/80">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Outcome & Impact</div>
            <div className="text-lg font-serif font-bold text-slate-100">{project.result}</div>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-[#131B27]/80">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Tech Stack</div>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DiscussionThread targetType="project" targetId={project.slug} />
    </div>
  );
}

// ==========================================
// 11. ESSAYS PAGE & READING VIEW WITH TOC
// ==========================================
function EssaysPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 space-y-12">
      <div>
        <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Clinical & Cyber Archive</div>
        <h1 className="text-4xl font-bold text-slate-100 font-serif mt-2">Essays & Field Notes</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl">
          Reflections on software architecture, surgery preparation, attention ethics, and systems thinking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {essays.map((e) => (
          <Link
            key={e.slug}
            href={`/essays/${e.slug}`}
            className="p-6 rounded-xl border border-slate-800 bg-[#131B27]/80 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(0,210,255,0.1)] transition-all block"
          >
            <div className="text-xs font-mono text-cyan-400 mb-2">{e.type}</div>
            <h2 className="text-xl font-bold text-slate-100 font-serif mb-2">{e.title}</h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">{e.dek}</p>
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
              <span>{e.date}</span>
              <span>·</span>
              <span>{e.read}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function EssayDetail() {
  const { slug } = useParams<{ slug: string }>();
  const essay = essays.find((e) => e.slug === slug);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setReadingProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!essay) return <NotFound />;

  return (
    <article className="max-w-4xl mx-auto px-6 pt-24 pb-20 relative">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-900 z-50">
        <div
          className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(0,210,255,0.8)] transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <Link href="/essays" className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:underline mb-8">
        <ArrowLeft size={14} /> Back to Essays
      </Link>

      <header className="border-b border-slate-800 pb-8 mb-10">
        <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">{essay.type}</div>
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-100 font-serif leading-tight mb-4">{essay.title}</h1>
        <p className="text-lg text-slate-300 font-sans leading-relaxed">{essay.dek}</p>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-6">
          <span>Muhammadaziz Yursinaliyev</span>
          <span>·</span>
          <span>{essay.date}</span>
          <span>·</span>
          <span>{essay.read}</span>
        </div>

        <InteractionBar targetType="essay" targetId={essay.slug} />
      </header>

      {/* Grid: Dynamic TOC + Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="hidden lg:block col-span-1">
          <div className="sticky top-28 p-4 rounded-xl border border-slate-800 bg-[#131B27]/60">
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-3">Contents</div>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              {essay.sections.map((sec) => (
                <li key={sec.id}>
                  <a href={`#${sec.id}`} className="hover:text-cyan-300 transition-colors block truncate">
                    {sec.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-10 font-sans text-slate-300 leading-relaxed text-base">
          {essay.sections.map((sec) => (
            <section key={sec.id} id={sec.id} className="scroll-mt-28">
              <h2 className="text-2xl font-bold text-slate-100 font-serif mb-3 text-cyan-300">{sec.title}</h2>
              <p className="leading-relaxed">{sec.content}</p>
            </section>
          ))}
        </div>
      </div>

      <DiscussionThread targetType="essay" targetId={essay.slug} />
    </article>
  );
}

// ==========================================
// 12. ANATOMY & UI/UX GALLERY WITH ZOOM VIEWER
// ==========================================
function GalleryPage() {
  const [category, setCategory] = useState('All');
  const [selectedPiece, setSelectedPiece] = useState<ArtPiece | null>(null);

  const filtered = artPieces.filter((a) => category === 'All' || a.category === category);

  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 space-y-12">
      <div>
        <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Visual & Anatomical Studies</div>
        <h1 className="text-4xl font-bold text-slate-100 font-serif mt-2">Anatomy & System Sketches</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl">
          High-precision anatomical studies and cyber-architecture diagrams. Click any plate for high-resolution inspection.
        </p>

        <div className="flex gap-2 mt-6">
          {['All', 'Anatomy', 'Cyber Architecture', 'UI Design'].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
                category === c
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'bg-[#131B27] text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((piece) => (
          <button
            key={piece.id}
            type="button"
            onClick={() => setSelectedPiece(piece)}
            className="p-5 rounded-xl border border-slate-800 bg-[#131B27]/80 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(0,245,160,0.15)] transition-all text-left group flex flex-col justify-between"
          >
            <div>
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-2">{piece.category}</div>
              <h3 className="text-lg font-bold text-slate-100 font-serif group-hover:text-emerald-300 transition-colors mb-2">
                {piece.title}
              </h3>
              <p className="text-xs text-slate-400">{piece.note}</p>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1 text-emerald-400 group-hover:underline">
                <ZoomIn size={13} /> Inspect Plate
              </span>
              <span>{piece.details.length} Markers</span>
            </div>
          </button>
        ))}
      </div>

      {selectedPiece && (
        <GalleryZoomModal piece={selectedPiece} onClose={() => setSelectedPiece(null)} />
      )}
    </div>
  );
}

function GalleryZoomModal({ piece, onClose }: { piece: ArtPiece; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl rounded-xl border border-emerald-500/40 bg-[#131B27] p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
          <X size={18} />
        </button>

        <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">{piece.category} / Clinical Archive</div>
        <h2 className="text-2xl font-bold text-slate-100 font-serif mb-1">{piece.title}</h2>
        <p className="text-xs text-slate-400 mb-6">{piece.note}</p>

        {/* Interactive Viewer Surface */}
        <div className="relative h-64 sm:h-80 rounded-xl border border-slate-800 bg-[#0B0F17] flex items-center justify-center overflow-hidden mb-6">
          <div
            className="transition-transform duration-200 flex flex-col items-center justify-center text-center p-6"
            style={{ transform: `scale(${zoom})` }}
          >
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-400/50 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_30px_rgba(0,245,160,0.2)]">
              <Sparkles size={32} />
            </div>
            <div className="text-sm font-mono text-slate-200 font-bold">{piece.title}</div>
            <div className="text-xs font-mono text-slate-500 mt-1">High-Resolution Anatomical Vector Layer</div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-[#131B27]/90 border border-slate-700 rounded-lg p-1 backdrop-blur-md">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              className="p-1.5 text-slate-300 hover:text-emerald-400 rounded"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
              className="p-1.5 text-slate-300 hover:text-emerald-400 rounded"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 text-slate-300 hover:text-emerald-400 rounded"
              title="Reset Zoom"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Breakdown details */}
        <div>
          <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider mb-2">Anatomical & Technical Markers</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
            {piece.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2 p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-emerald-400 font-bold">›</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// 13. ABOUT PAGE (DUAL-DOMAIN PROFILE)
// ==========================================
function AboutPage() {
  const skills = [
    'Next.js 14 / TypeScript',
    'PostgreSQL / Supabase RLS',
    'Cryptographic Key Vaults',
    'Surgical Anatomy',
    'DOMPurify / XSS Security',
    'Microvascular Anastomosis Prep',
    'Distributed Systems',
    'Calm Product Architecture',
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 space-y-12">
      <div>
        <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Identity & Roadmap</div>
        <h1 className="text-4xl font-bold text-slate-100 font-serif mt-2">Muhammadaziz Yursinaliyev</h1>
        <p className="text-base text-slate-300 mt-2 leading-relaxed">
          Full-Stack Software Engineer preparing for a lifelong discipline in surgery. Based in Tashkent, Uzbekistan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6 text-sm text-slate-300 font-sans leading-relaxed">
          <p>
            My engineering philosophy centers on quiet, high-assurance software that respects human cognitive bandwidth. Rather than engineering for addictive loops, I build calm tools that solve high-stakes problems with zero friction.
          </p>
          <p>
            Preparing for a future in surgery has reinforced this principle tenfold. In the operating theatre, there is no undo buffer; every motion requires deep structural knowledge, rehearsal, and presence.
          </p>
          <div className="p-4 rounded-xl border-l-2 border-emerald-400 bg-emerald-500/5 text-slate-200 font-serif italic text-base">
            “The codebase and the patient both demand the same standard: careful observation before action, and respect for the human on the other side.”
          </div>
        </div>

        <div className="space-y-6 font-mono">
          <div className="p-5 rounded-xl border border-slate-800 bg-[#131B27]">
            <div className="text-xs text-emerald-400 font-bold uppercase mb-3">Core Toolkits</div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 14. ADMIN CMS DASHBOARD (PROTECTED GATEWAY)
// ==========================================

// ---------- Auth Gate ----------
function AdminAuthGate({ onAuthenticated }: { onAuthenticated: (adminEmail: string) => void }) {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setPending(true);
    setMessage('');
    try {
      const { supabase: sb } = await import('@/lib/supabase');
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined,
          shouldCreateUser: false,
        },
      });
      if (error) throw error;
      setMessage('✓ Magic link dispatched — check your inbox and click the link to enter.');
    } catch {
      setMessage('⚠ Sign-in failed. Ensure this email is an authorised admin account.');
    } finally {
      setPending(false);
    }
  };

  const handleGoogleAuth = async () => {
    setPending(true);
    setMessage('');
    try {
      const { supabase: sb } = await import('@/lib/supabase');
      const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined,
        },
      });
      if (error) throw error;
    } catch {
      setMessage('⚠ Google OAuth unavailable. Please use Magic Link.');
      setPending(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    import('@/lib/supabase').then(({ supabase: sb, isAdmin }) => {
      const { data: listener } = sb.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;
        if (session?.user?.email) {
          const admin = await isAdmin();
          if (admin) onAuthenticated(session.user.email);
          else setMessage('⛔ Access denied — this account has no admin privileges.');
        }
      });
      return () => { mounted = false; listener.subscription.unsubscribe(); };
    });
  }, [onAuthenticated]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0B0F17]/95 backdrop-blur-xl">
      <div className="pointer-events-none fixed inset-0 z-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,160,0.015) 2px, rgba(0,245,160,0.015) 4px)' }} />
      <div className="pointer-events-none fixed top-20 left-20 w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="pointer-events-none fixed bottom-20 right-20 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-emerald-500/30 bg-[#131B27]/80 backdrop-blur-2xl p-8 shadow-[0_0_80px_rgba(0,245,160,0.08)]"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,245,160,0.15)]">
              <ShieldCheck size={20} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Restricted Zone</div>
              <div className="text-lg font-bold text-slate-100 font-serif">Admin Access</div>
            </div>
          </div>
          <Link href="/" className="text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors">
            ← Back
          </Link>
        </div>

        <p className="text-xs text-slate-400 font-mono mb-6 leading-relaxed border-l-2 border-emerald-500/40 pl-3">
          This dashboard is protected by Supabase RBAC. Only verified admin accounts may enter.
        </p>

        <form onSubmit={handleMagicLink} className="space-y-3">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@yursinaliev.com"
            className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 font-mono text-sm outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all placeholder:text-slate-600"
          />
          <motion.button type="submit" disabled={pending} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,245,160,0.1)] disabled:opacity-50">
            {pending ? 'Dispatching…' : '→ Send Magic Link'}
          </motion.button>
        </form>

        <div className="mt-3">
          <motion.button
            type="button"
            onClick={handleGoogleAuth}
            disabled={pending}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <ExternalLink size={13} /> Continue with Google OAuth
          </motion.button>
        </div>

        {message && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className={`mt-4 text-xs font-mono px-3 py-2 rounded-lg border ${message.startsWith('✓') ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' : 'border-red-500/30 bg-red-500/5 text-red-300'}`}>
            {message}
          </motion.div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] font-mono text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Shield size={10} className="text-slate-600" />
            <span>Supabase Auth · RBAC Active</span>
          </div>
          <Link href="/" className="text-emerald-400/70 hover:text-emerald-400">
            Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

type ModalMode = 'create' | 'edit';

function ProjectModal({ mode, initial, onClose, onSave }: { mode: ModalMode; initial?: Partial<Project>; onClose: () => void; onSave: (data: Partial<Project> & { imageFile?: File }) => Promise<void> }) {
  const [form, setForm] = useState<Partial<Project> & { imageFile?: File }>({ name: '', summary: '', problem: '', solution: '', result: '', year: '', role: '', githubUrl: '', liveUrl: '', category: 'Product', techStack: [], ...initial });
  const [techInput, setTechInput] = useState((initial?.techStack ?? []).join(', '));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const handleSave = async () => {
    setSaving(true); setError('');
    try { await onSave({ ...form, techStack: techInput.split(',').map(s => s.trim()).filter(Boolean) }); onClose(); }
    catch (e: any) { setError(e.message ?? 'Failed to save.'); }
    finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-emerald-500/30 bg-[#131B27] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider"><Code size={14} /> {mode === 'create' ? 'New Project' : 'Edit Project'}</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
        </div>
        <div className="space-y-3 text-sm">
          {([['name','Project Name'],['summary','Summary'],['problem','Problem'],['solution','Solution'],['result','Result'],['year','Year'],['role','Role'],['githubUrl','GitHub URL'],['liveUrl','Live URL']] as [keyof Project, string][]).map(([key, label]) => (
            <div key={key}><label className="block text-xs text-slate-400 font-mono mb-1">{label}</label>
              <input value={(form[key] as string) ?? ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs outline-none focus:border-emerald-400" /></div>
          ))}
          <div><label className="block text-xs text-slate-400 font-mono mb-1">Tech Stack (comma-separated)</label>
            <input value={techInput} onChange={e => setTechInput(e.target.value)} placeholder="React, TypeScript, Supabase"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs outline-none focus:border-emerald-400" /></div>
          <div><label className="block text-xs text-slate-400 font-mono mb-1">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Project['category'] }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs outline-none focus:border-emerald-400">
              {(['Product','Security','Medicine','Prototype'] as const).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-xs text-slate-400 font-mono mb-1">Cover Image</label>
            <input type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, imageFile: e.target.files?.[0] }))}
              className="w-full text-xs text-slate-400 font-mono file:mr-3 file:px-3 file:py-1 file:rounded file:bg-slate-800 file:text-emerald-400 file:border file:border-emerald-500/30 file:text-xs" /></div>
        </div>
        {error && <p className="mt-3 text-xs text-red-400 font-mono">{error}</p>}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200">Cancel</button>
          <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-5 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold disabled:opacity-50 transition-all">
            {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save Changes'}</motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function EssayModal({ mode, initial, onClose, onSave }: { mode: ModalMode; initial?: Partial<Essay>; onClose: () => void; onSave: (data: Partial<Essay>) => Promise<void> }) {
  const [form, setForm] = useState<Partial<Essay>>({ title: '', type: '', dek: '', date: '', read: '', ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const handleSave = async () => {
    setSaving(true); setError('');
    try { await onSave(form); onClose(); }
    catch (e: any) { setError(e.message ?? 'Failed to save.'); }
    finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-500/30 bg-[#131B27] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider"><Layers size={14} /> {mode === 'create' ? 'New Essay' : 'Edit Essay'}</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          {([['title','Title'],['type','Type / Category'],['dek','Deck / Subtitle'],['date','Date'],['read','Read Time']] as [keyof Essay, string][]).map(([key, label]) => (
            <div key={key}><label className="block text-xs text-slate-400 font-mono mb-1">{label}</label>
              <input value={(form[key] as string) ?? ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs outline-none focus:border-cyan-400" /></div>
          ))}
        </div>
        {error && <p className="mt-3 text-xs text-red-400 font-mono">{error}</p>}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200">Cancel</button>
          <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-5 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold disabled:opacity-50 transition-all">
            {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save Changes'}</motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function GalleryModal({ mode, initial, onClose, onSave }: { mode: ModalMode; initial?: Partial<ArtPiece>; onClose: () => void; onSave: (data: Partial<ArtPiece> & { imageFile?: File }) => Promise<void> }) {
  const [form, setForm] = useState<Partial<ArtPiece> & { imageFile?: File }>({ title: '', note: '', category: 'Anatomy', aspectRatio: '16/10', details: [], ...initial });
  const [detailsInput, setDetailsInput] = useState((initial?.details ?? []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const handleSave = async () => {
    setSaving(true); setError('');
    try { await onSave({ ...form, details: detailsInput.split('\n').map(s => s.trim()).filter(Boolean) }); onClose(); }
    catch (e: any) { setError(e.message ?? 'Failed to save.'); }
    finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-emerald-500/30 bg-[#131B27] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs uppercase tracking-wider"><ZoomIn size={14} /> {mode === 'create' ? 'New Gallery Item' : 'Edit Gallery Item'}</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div><label className="block text-xs text-slate-400 font-mono mb-1">Title</label>
            <input value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs outline-none focus:border-emerald-400" /></div>
          <div><label className="block text-xs text-slate-400 font-mono mb-1">Note / Medium</label>
            <input value={form.note ?? ''} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs outline-none focus:border-emerald-400" /></div>
          <div><label className="block text-xs text-slate-400 font-mono mb-1">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ArtPiece['category'] }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs outline-none focus:border-emerald-400">
              {(['Anatomy','UI Design','Cyber Architecture'] as const).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-xs text-slate-400 font-mono mb-1">Aspect Ratio</label>
            <select value={form.aspectRatio} onChange={e => setForm(f => ({ ...f, aspectRatio: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs outline-none focus:border-emerald-400">
              {['16/10','16/9','4/3','1/1'].map(r => <option key={r} value={r}>{r}</option>)}</select></div>
          <div><label className="block text-xs text-slate-400 font-mono mb-1">Details (one per line)</label>
            <textarea rows={4} value={detailsInput} onChange={e => setDetailsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs outline-none focus:border-emerald-400 resize-none" /></div>
          <div><label className="block text-xs text-slate-400 font-mono mb-1">Image</label>
            <input type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, imageFile: e.target.files?.[0] }))}
              className="w-full text-xs text-slate-400 font-mono file:mr-3 file:px-3 file:py-1 file:rounded file:bg-slate-800 file:text-emerald-400 file:border file:border-emerald-500/30 file:text-xs" /></div>
        </div>
        {error && <p className="mt-3 text-xs text-red-400 font-mono">{error}</p>}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200">Cancel</button>
          <motion.button onClick={handleSave} disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="px-5 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold disabled:opacity-50 transition-all">
            {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save Changes'}</motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AdminPage() {
  const { t } = useLocale();
  const [authStatus, setAuthStatus] = useState<'checking' | 'authed' | 'denied'>('checking');
  const [adminEmail, setAdminEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'essays' | 'gallery' | 'telemetry'>('projects');
  const [liveProjects, setLiveProjects] = useState<Project[]>([]);
  const [liveEssays, setLiveEssays] = useState<Essay[]>([]);
  const [liveGallery, setLiveGallery] = useState<ArtPiece[]>([]);
  const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [projectModal, setProjectModal] = useState<{ mode: ModalMode; initial?: Partial<Project> } | null>(null);
  const [essayModal, setEssayModal] = useState<{ mode: ModalMode; initial?: Partial<Essay> } | null>(null);
  const [galleryModal, setGalleryModal] = useState<{ mode: ModalMode; initial?: Partial<ArtPiece> } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ table: string; id: string; label: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutTimer: ReturnType<typeof setTimeout> | undefined;

    const runAuthCheck = async () => {
      try {
        const timeoutPromise = new Promise<'timeout'>((resolve) => {
          timeoutTimer = setTimeout(() => resolve('timeout'), 3000);
        });

        const checkPromise = (async () => {
          const { isAdmin, getSession } = await import('@/lib/supabase');
          const session = await getSession();
          if (!session) return { authed: false, email: '' };
          const admin = await isAdmin();
          return { authed: !!admin, email: session.user?.email ?? '' };
        })();

        const result = await Promise.race([checkPromise, timeoutPromise]);

        if (!cancelled) {
          if (result !== 'timeout' && result.authed) {
            setAdminEmail(result.email);
            setAuthStatus('authed');
          } else {
            setAuthStatus('denied');
          }
        }
      } catch (err) {
        console.warn('Admin verification encountered error, defaulting to login modal:', err);
        if (!cancelled) {
          setAuthStatus('denied');
        }
      } finally {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        if (!cancelled) {
          setAuthStatus((current) => (current === 'checking' ? 'denied' : current));
        }
      }
    };

    runAuthCheck();

    return () => {
      cancelled = true;
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };
  }, []);

  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const { listProjects, listEssays, listGallery, listTelemetryLogs } = await import('@/lib/cms-api');
      const [dbP, dbE, dbG, dbT] = await Promise.allSettled([listProjects(), listEssays(), listGallery(), listTelemetryLogs()]);
      setLiveProjects(dbP.status === 'fulfilled' && dbP.value.length > 0 ? dbP.value : projects);
      setLiveEssays(dbE.status === 'fulfilled' && dbE.value.length > 0 ? dbE.value : essays);
      setLiveGallery(dbG.status === 'fulfilled' && dbG.value.length > 0 ? dbG.value : artPieces);
      setTelemetryLogs(dbT.status === 'fulfilled' ? dbT.value : []);
    } finally { setDataLoading(false); }
  }, []);

  useEffect(() => { if (authStatus === 'authed') loadData(); }, [authStatus, loadData]);

  useEffect(() => {
    if (authStatus !== 'authed') return;
    let unsub: (() => void) | undefined;
    import('@/lib/supabase').then(({ supabase: sb }) => {
      const ch = sb.channel('admin-rt')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'essays' }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'telemetry_logs' }, () => loadData())
        .subscribe();
      unsub = () => sb.removeChannel(ch);
    });
    return () => unsub?.();
  }, [authStatus, loadData]);

  const handleSaveProject = async (data: Partial<Project> & { imageFile?: File }) => {
    const { createProject, updateProject, uploadMedia } = await import('@/lib/cms-api');
    let imageUrl = '';
    if (data.imageFile) imageUrl = await uploadMedia(data.imageFile, 'projects');
    if (projectModal?.mode === 'create') await createProject({ ...data, imageUrl } as any);
    else if (projectModal?.initial?.slug) await updateProject(projectModal.initial.slug, { ...data, imageUrl } as any);
    await loadData();
  };

  const handleSaveEssay = async (data: Partial<Essay>) => {
    const { createEssay, updateEssay } = await import('@/lib/cms-api');
    if (essayModal?.mode === 'create') await createEssay(data as any);
    else if (essayModal?.initial?.slug) await updateEssay(essayModal.initial.slug, data as any);
    await loadData();
  };

  const handleSaveGallery = async (data: Partial<ArtPiece> & { imageFile?: File }) => {
    const { createGalleryItem, updateGalleryItem, uploadMedia } = await import('@/lib/cms-api');
    let imageUrl = '';
    if (data.imageFile) imageUrl = await uploadMedia(data.imageFile, 'gallery');
    if (galleryModal?.mode === 'create') await createGalleryItem({ ...data, imageUrl, imageFile: data.imageFile! } as any);
    else if (galleryModal?.initial?.id) await updateGalleryItem(galleryModal.initial.id, { ...data, imageUrl } as any);
    await loadData();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const api = await import('@/lib/cms-api');
    if (deleteConfirm.table === 'projects') await api.deleteProject(deleteConfirm.id);
    else if (deleteConfirm.table === 'essays') await api.deleteEssay(deleteConfirm.id);
    else if (deleteConfirm.table === 'gallery') await api.deleteGalleryItem(deleteConfirm.id);
    setDeleteConfirm(null);
    await loadData();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('@/lib/supabase');
    await signOut();
    setAuthStatus('denied');
  };

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-500">Verifying admin credentials…</p>
        </div>
      </div>
    );
  }

  if (authStatus === 'denied') {
    return <AdminAuthGate onAuthenticated={(em) => { setAdminEmail(em); setAuthStatus('authed'); }} />;
  }

  const tabs = ['projects', 'essays', 'gallery', 'telemetry'] as const;

  return (
    <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 space-y-8">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,245,160,0.01) 3px, rgba(0,245,160,0.01) 4px)' }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-wrap items-center justify-between p-4 rounded-2xl border border-emerald-500/30 bg-[#131B27]/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,245,160,0.06)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,245,160,0.15)]">
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100">{t('verifiedAdmin')}</div>
            <div className="text-[10px] font-mono text-emerald-400">{adminEmail} · Supabase RBAC Active</div>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSignOut}
          className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-all mt-2 sm:mt-0">
          <LockKeyhole size={12} /> Sign Out
        </motion.button>
      </motion.div>

      {/* Metrics */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Projects', val: liveProjects.length, icon: Code, color: 'text-emerald-400' },
          { label: 'Essays', val: liveEssays.length, icon: Layers, color: 'text-cyan-400' },
          { label: 'Gallery', val: liveGallery.length, icon: Stethoscope, color: 'text-emerald-300' },
          { label: 'Telemetry', val: telemetryLogs.length, icon: Terminal, color: 'text-pink-400' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} whileHover={{ scale: 1.02, y: -2 }}
              className="p-4 rounded-2xl border border-slate-800 bg-[#131B27]/80 backdrop-blur-sm cursor-default transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider">{stat.label}</span>
                <Icon size={14} className={stat.color} />
              </div>
              <div className="text-3xl font-bold text-slate-100 font-serif">{dataLoading ? '…' : stat.val}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CMS Console */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="relative z-10 rounded-2xl border border-slate-800 bg-[#131B27]/80 backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 pt-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`pb-3 px-3 text-xs font-mono uppercase tracking-widest border-b-2 transition-all ${activeTab === tab ? 'border-emerald-400 text-emerald-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                {tab}
              </button>
            ))}
          </div>
          {activeTab !== 'telemetry' && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { if (activeTab === 'projects') setProjectModal({ mode: 'create' }); else if (activeTab === 'essays') setEssayModal({ mode: 'create' }); else if (activeTab === 'gallery') setGalleryModal({ mode: 'create' }); }}
              className="mb-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-all">
              <span className="text-base leading-none">+</span> Add {activeTab.slice(0, -1)}
            </motion.button>
          )}
        </div>

        <div className="p-5">
          {dataLoading ? (
            <div className="py-12 text-center">
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-mono text-slate-500">Syncing with Supabase…</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'projects' && (
                <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-[10px] font-mono uppercase tracking-wider text-slate-600 pb-2 border-b border-slate-800 px-2">
                    <span>Name</span><span>Category</span><span>Status</span><span>Actions</span>
                  </div>
                  {liveProjects.map((p, i) => (
                    <motion.div key={p.slug} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center py-2.5 px-2 rounded-lg hover:bg-slate-800/40 text-xs font-mono transition-all group">
                      <div><span className="text-emerald-400 font-bold mr-2">{p.number}</span><span className="text-slate-200">{p.name}</span></div>
                      <span className="text-slate-400">{p.category}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">Live</span>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setProjectModal({ mode: 'edit', initial: p })} className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all" title="Edit"><Eye size={13} /></button>
                        <button onClick={() => setDeleteConfirm({ table: 'projects', id: p.slug, label: p.name })} className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </motion.div>
                  ))}
                  {liveProjects.length === 0 && <div className="py-8 text-center text-xs font-mono text-slate-500">No projects. Click "+ Add project".</div>}
                </motion.div>
              )}

              {activeTab === 'essays' && (
                <motion.div key="essays" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-[10px] font-mono uppercase tracking-wider text-slate-600 pb-2 border-b border-slate-800 px-2">
                    <span>Title</span><span>Read Time</span><span>Status</span><span>Actions</span>
                  </div>
                  {liveEssays.map((e, i) => (
                    <motion.div key={e.slug} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center py-2.5 px-2 rounded-lg hover:bg-slate-800/40 text-xs font-mono transition-all group">
                      <span className="text-slate-200 truncate">{e.title}</span>
                      <span className="text-slate-400">{e.read}</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] border border-cyan-500/20">Published</span>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEssayModal({ mode: 'edit', initial: e })} className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all" title="Edit"><Eye size={13} /></button>
                        <button onClick={() => setDeleteConfirm({ table: 'essays', id: e.slug, label: e.title })} className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </motion.div>
                  ))}
                  {liveEssays.length === 0 && <div className="py-8 text-center text-xs font-mono text-slate-500">No essays. Click "+ Add essay".</div>}
                </motion.div>
              )}

              {activeTab === 'gallery' && (
                <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-[10px] font-mono uppercase tracking-wider text-slate-600 pb-2 border-b border-slate-800 px-2">
                    <span>Title</span><span>Category</span><span>Ratio</span><span>Actions</span>
                  </div>
                  {liveGallery.map((a, i) => (
                    <motion.div key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center py-2.5 px-2 rounded-lg hover:bg-slate-800/40 text-xs font-mono transition-all group">
                      <span className="text-slate-200 truncate">{a.title}</span>
                      <span className="text-slate-400">{a.category}</span>
                      <span className="text-slate-500">{a.aspectRatio}</span>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setGalleryModal({ mode: 'edit', initial: a })} className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all" title="Edit"><Eye size={13} /></button>
                        <button onClick={() => setDeleteConfirm({ table: 'gallery', id: a.id, label: a.title })} className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </motion.div>
                  ))}
                  {liveGallery.length === 0 && <div className="py-8 text-center text-xs font-mono text-slate-500">Gallery empty. Click "+ Add gallery".</div>}
                </motion.div>
              )}

              {activeTab === 'telemetry' && (
                <motion.div key="telemetry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center gap-2 mb-4 text-[10px] font-mono text-emerald-400">
                    <Terminal size={12} /><span>LIVE_TELEMETRY.LOG — {telemetryLogs.length} records</span>
                    <span className="ml-auto text-slate-600">Admin-only view</span>
                  </div>
                  <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                    {telemetryLogs.length === 0 && <div className="py-6 text-center text-xs font-mono text-slate-500">No telemetry events yet.</div>}
                    {telemetryLogs.map((log, i) => (
                      <motion.div key={log.id ?? i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="flex items-start gap-3 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-[11px] font-mono group hover:border-slate-700 transition-all">
                        <span className={`shrink-0 uppercase font-bold ${log.log_level === 'error' ? 'text-red-400' : log.log_level === 'warn' ? 'text-yellow-400' : log.log_level === 'debug' ? 'text-slate-500' : 'text-emerald-400'}`}>[{log.log_level}]</span>
                        <span className="flex-1 text-slate-300 break-all">{log.message}</span>
                        <span className="shrink-0 text-slate-600 text-[10px]">{log.component}</span>
                        <button onClick={async () => { const { supabase: sb } = await import('@/lib/supabase'); await sb.from('telemetry_logs').delete().eq('id', log.id); await loadData(); }}
                          className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded text-slate-600 hover:text-red-400 transition-all" title="Delete">
                          <Trash2 size={11} /></button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-[#131B27] p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-mono text-xs uppercase tracking-wider mb-4"><AlertCircle size={14} /> Confirm Deletion</div>
            <p className="text-sm text-slate-200 mb-1">Delete <strong className="text-red-300">{deleteConfirm.label}</strong>?</p>
            <p className="text-xs text-slate-500 font-mono mb-6">This action is irreversible and will remove the record from Supabase.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 font-mono text-xs font-bold transition-all">Delete</button>
            </div>
          </motion.div>
        </div>
      )}

      {projectModal && <ProjectModal mode={projectModal.mode} initial={projectModal.initial} onClose={() => setProjectModal(null)} onSave={handleSaveProject} />}
      {essayModal && <EssayModal mode={essayModal.mode} initial={essayModal.initial} onClose={() => setEssayModal(null)} onSave={handleSaveEssay} />}
      {galleryModal && <GalleryModal mode={galleryModal.mode} initial={galleryModal.initial} onClose={() => setGalleryModal(null)} onSave={handleSaveGallery} />}
    </div>
  );
}

// ==========================================
// 15. ROUTER CONFIGURATION
// ==========================================
function Router() {
  const [location] = useLocation();

  return (
    <SiteShell>
      <ErrorBoundary resetKey={location}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/projects" component={ProjectsPage} />
          <Route path="/projects/:slug" component={ProjectDetail} />
          <Route path="/essays" component={EssaysPage} />
          <Route path="/essays/:slug" component={EssayDetail} />
          <Route path="/gallery" component={GalleryPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
      </ErrorBoundary>
    </SiteShell>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}