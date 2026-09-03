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
  AlertCircle,
  BookOpen,
  Compass,
  Gamepad2,
  Lightbulb,
  Settings,
  Plus,
  Edit3,
  Star,
  MapPin,
  Calendar,
  Activity,
  RefreshCw
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import BooksPage from '@/pages/books';
import TravelPage from '@/pages/travel';
import GamesPage from '@/pages/games';
import SecurityPage from '@/pages/security';
import MedicalPage from '@/pages/medical';
import TipsPage from '@/pages/tips';
import {
  type SiteConfig,
  type Essay,
  type Book,
  type Travel,
  type Game,
  type SecurityNote,
  type MedicalLearning,
  type Project,
  type QuickTip,
  type ArtPiece,
  getSiteConfig,
  updateSiteConfig,
  listEssays,
  createEssay,
  updateEssay,
  deleteEssay,
  listBooks,
  createBook,
  updateBook,
  deleteBook,
  listTravels,
  createTravel,
  updateTravel,
  deleteTravel,
  listGames,
  createGame,
  updateGame,
  deleteGame,
  listSecurityNotes,
  createSecurityNote,
  updateSecurityNote,
  deleteSecurityNote,
  listMedicalLearning,
  createMedicalLearning,
  updateMedicalLearning,
  deleteMedicalLearning,
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  listQuickTips,
  createQuickTip,
  updateQuickTip,
  deleteQuickTip,
  listGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  listTelemetryLogs,
  uploadMedia
} from '@/lib/cms-api';

const queryClient = new QueryClient();

// Re-export types for backward compatibility
export type { SiteConfig, Essay, Book, Travel, Game, SecurityNote, MedicalLearning, Project, QuickTip, ArtPiece };

// ==========================================
// 1. I18N & CONTEXT DEFINITIONS
// ==========================================
type Language = 'EN' | 'UZ' | 'TR';

const translations: Record<Language, Record<string, string>> = {
  EN: {
    home: 'Home',
    projects: 'Projects',
    essays: 'Essays',
    books: 'Bookshelf',
    travel: 'Travel',
    games: 'Games & Hobbies',
    security: 'Security Lab',
    medical: 'Medical Learning',
    tips: 'Quick Tips',
    gallery: 'Anatomy Gallery',
    about: 'About',
    admin: 'Admin CMS',
    heroRole: 'Software Engineer & Future Surgeon',
    heroLead: 'Bridging Medical Precision and Cyber-Security Architecture. Building calm, resilient systems and studying human anatomy.',
    selectedWork: 'Explore Projects',
    startConversation: 'Start a Conversation',
    liveTelemetry: 'Live Telemetry',
    searchPlaceholder: 'Search across 10 dynamic modules (⌘K)...',
    verifiedAdmin: 'Admin Access Verified',
    copied: 'Copied to clipboard',
    copyEmail: 'Copy Email'
  },
  UZ: {
    home: 'Bosh sahifa',
    projects: 'Loyihalar',
    essays: 'Maqolalar',
    books: 'Kutubxona',
    travel: 'Sayohatlar',
    games: 'O‘yinlar & Qiziqishlar',
    security: 'Kiberxavfsizlik',
    medical: 'Tibbiyot & Anatomiya',
    tips: 'Qisqa Tavsiyalar',
    gallery: 'Galereya',
    about: 'Men haqimda',
    admin: 'Boshqaruv Paneli',
    heroRole: 'Dasturchi Muhandis & Bo‘lajak Jarroh',
    heroLead: 'Tibbiy aniqlik va kiberxavfsizlik arxitekturasi chorrahasi. Bardoshli tizimlar yaratish va inson anatomiyasini chuqur o‘rganish.',
    selectedWork: 'Loyihalarni ko‘rish',
    startConversation: 'Bog‘lanish',
    liveTelemetry: 'Jonli Telemetriya',
    searchPlaceholder: 'Barcha 10 ta bo‘limdan qidirish (⌘K)...',
    verifiedAdmin: 'Administrator ruxsati tasdiqlandi',
    copied: 'Xotiraga nusxalandi',
    copyEmail: 'Emailni nusxalash'
  },
  TR: {
    home: 'Ana Sayfa',
    projects: 'Projeler',
    essays: 'Yazılar',
    books: 'Kitaplık',
    travel: 'Seyahat',
    games: 'Oyunlar & Hobiler',
    security: 'Güvenlik Labı',
    medical: 'Tıbbi Notlar',
    tips: 'Hızlı İpuçları',
    gallery: 'Anatomi Galerisi',
    about: 'Hakkımda',
    admin: 'Yönetim Paneli',
    heroRole: 'Yazılım Mühendisi & Geleceğin Cerrahı',
    heroLead: 'Tıbbi Hassasiyet ve Siber Güvenlik Mimarisi. Güvenilir sistemler inşa etmek ve anatomi öğrenmek.',
    selectedWork: 'Projeleri İncele',
    startConversation: 'İletişime Geç',
    liveTelemetry: 'Canlı Telemetri',
    searchPlaceholder: 'Tüm modüllerde ara (⌘K)...',
    verifiedAdmin: 'Yönetici Erişimi Doğrulandı',
    copied: 'Panoya kopyalandı',
    copyEmail: 'E-postayı kopyala'
  },
};

const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void; t: (key: string) => string }>({
  language: 'EN',
  setLanguage: () => undefined,
  t: (key: string) => key,
});

const useLocale = () => useContext(LanguageContext);

// ==========================================
// 2. SEED CONTENT FALLBACKS
// ==========================================
export const defaultSiteConfig: SiteConfig = {
  name: 'Muhammadaziz Yursinaliyev',
  title: 'Software Engineer & Future Surgeon',
  headline: 'Bridging Medical Precision and Cyber-Security Architecture.',
  bio: 'Passionate technologist dedicated to biomedical innovation, high-assurance zero-trust security engineering, and surgical science. Based in Tashkent, Uzbekistan.',
  status_text: 'Tashkent · Dual-Core Practice Active',
  email: 'yursinaliyevm@gmail.com',
  github_url: 'https://github.com/Muhammadaziz3427',
  linkedin_url: 'https://linkedin.com',
  twitter_url: 'https://twitter.com',
  theme: 'dark'
};

const fallbackProjects: Project[] = [
  {
    slug: 'kitobcha',
    number: '01',
    name: 'Kitobcha',
    summary: 'A calm, human-centered reading companion for Uzbek book lovers.',
    description: 'Engineered a minimalist, zero-distraction reading ritual with private local tracking and high-performance server-side rendering.',
    problem: 'Modern book catalog apps are cluttered with aggressive recommendation feeds and advertising.',
    solution: 'Designed an elegant, distraction-free reading tracker with offline-first caching.',
    techStack: ['Next.js 14', 'TypeScript', 'Supabase', 'Tailwind CSS', 'PostgreSQL'],
    result: 'Over 1,200 active readers',
    year: '2023—24',
    role: 'Lead Architect · Full-Stack',
    githubUrl: 'https://github.com/Muhammadaziz3427/kitobcha',
    liveUrl: 'https://kitobcha.uz',
    category: 'Product',
    featured: true,
  },
  {
    slug: 'eco-xarita',
    number: '02',
    name: 'Eco-Xarita',
    summary: 'An environmental intelligence map for recycling and sustainable urban points in Tashkent.',
    description: 'Geospatial platform integrating crowdsourced verification, offline-first sync, and transparent data confidence indicators.',
    problem: 'Recycling points and battery deposit centers were undocumented across Uzbekistan.',
    solution: 'Built a geospatial platform integrating crowdsourced verification and offline sync.',
    techStack: ['React', 'Leaflet / Mapbox', 'Node.js', 'GeoJSON', 'PostGIS'],
    result: '45+ verified facilities mapped',
    year: '2023',
    role: 'Geospatial & Security Lead',
    githubUrl: 'https://github.com/Muhammadaziz3427/eco-xarita',
    liveUrl: 'https://eco-xarita.uz',
    category: 'Product',
    featured: true,
  },
  {
    slug: 'suture-notes',
    number: '03',
    name: 'Suture Notes & Bio-Telemetry',
    summary: 'A precision surgical anatomy review engine with spaced repetition and anatomical vector breakdowns.',
    description: 'Interactive SVG vector overlay system with clinical case simulations and zero-latency flash recall.',
    problem: 'Surgical anatomy memorization suffers from static 2D textbook fatigue without active recall.',
    solution: 'Interactive SVG vector overlay system with clinical case simulations.',
    techStack: ['TypeScript', 'Framer Motion', 'Canvas API', 'Tailwind', 'Supabase RLS'],
    result: 'Validated in clinical prep',
    year: '2024',
    role: 'Creator · Research Engineer',
    githubUrl: 'https://github.com/Muhammadaziz3427/suture-notes',
    liveUrl: 'https://suture-notes.dev',
    category: 'Medicine',
    featured: true,
  },
  {
    slug: 'neural-vault',
    number: '04',
    name: 'Neural Vault (Zero-Trust Guard)',
    summary: 'An experimental zero-trust identity and encrypted key management protocol.',
    description: 'Client-side asymmetric ephemeral key exchange with strict CSP and server-side DOMPurify isolation.',
    problem: 'Standard session tokens in browser storage are susceptible to cross-site script injection.',
    solution: 'Implemented client-side asymmetric ephemeral key exchange with strict CSP.',
    techStack: ['Rust / WASM', 'Web Crypto API', 'Next.js', 'PostgreSQL RLS'],
    result: 'A+ Security Headers Rating',
    year: '2024',
    role: 'Cyber-Security Architect',
    githubUrl: 'https://github.com/Muhammadaziz3427/neural-vault',
    liveUrl: 'https://neural-vault.yursinaliev.com',
    category: 'Security',
    featured: true,
  }
];

const fallbackEssays: Essay[] = [
  {
    slug: 'software-should-leave-room',
    type: 'On Engineering & Design',
    category: 'Tech',
    title: 'Software Should Leave Room for a Person',
    dek: 'The highest quality interfaces do not demand all our attention. They help us return to what we came to accomplish.',
    date: '18 Mar 2024',
    read: '6 min read',
    content_markdown: 'There is a particular kind of software that makes you feel watched. Every surface is hyperactive, every microsecond of hesitation is seized as an opportunity to suggest engagement. When designing systems, we must ask not only what the screen does, but what neurological cost it levies on the human operating it.\n\nRestraint is not minimalism for vanity. It is an intentional engineering discipline that protects user intentionality. A clean API, predictable error boundaries, and non-intrusive UI allow users to remain clear-headed and focused.\n\nIn code review, the second pass reveals hidden assumptions. In interface design, it reveals unnecessary noise. Precision is not speed with rough edges smoothed over; it is clarity that survives rigorous scrutiny.',
  },
  {
    slug: 'learning-with-both-hands',
    type: 'Clinical & Technical',
    category: 'Medicine',
    title: 'Learning with Both Hands: Surgery and Distributed Systems',
    dek: 'What rigorous surgical training and mission-critical cybersecurity engineering teach each other about precision under pressure.',
    date: '02 Feb 2024',
    read: '8 min read',
    content_markdown: 'In surgery, every incision is irrevocable. In secure systems, state mutations and cryptographic signing carry permanent weight. Operating in both disciplines instills a deep habit of pre-action verification: check twice, verify boundaries, execute with steady hands.\n\nThe human body and large-scale networks are always more intricate than the simplistic mental models we construct. Mastery begins with humility, careful dissection, and continuous learning.',
  }
];

const fallbackGallery: ArtPiece[] = [
  {
    id: 'brachial-plexus',
    title: 'Brachial Plexus Trajectory',
    note: 'Graphite & Vector / C5-T1 nerve roots and axillary branching',
    category: 'Anatomy',
    aspectRatio: '16/10',
    details: [
      'Roots: C5, C6, C7, C8, T1',
      'Trunks: Superior, Middle, Inferior',
      'Clinical significance: Erbs Palsy vs Klumpke Paralysis'
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
      'AV delay mechanism: 0.12s physiological pause for ventricular filling'
    ]
  }
];

// Navigation configuration
const navItems = [
  { href: '/', label: 'Home', key: 'home', icon: Globe },
  { href: '/projects', label: 'Projects', key: 'projects', icon: Code },
  { href: '/essays', label: 'Essays', key: 'essays', icon: Layers },
  { href: '/books', label: 'Bookshelf', key: 'books', icon: BookOpen },
  { href: '/travel', label: 'Travel', key: 'travel', icon: Compass },
  { href: '/games', label: 'Games', key: 'games', icon: Gamepad2 },
  { href: '/security', label: 'Security', key: 'security', icon: Shield },
  { href: '/medical', label: 'Medical', key: 'medical', icon: Stethoscope },
  { href: '/tips', label: 'Quick Tips', key: 'tips', icon: Lightbulb },
  { href: '/gallery', label: 'Gallery', key: 'gallery', icon: Eye },
  { href: '/about', label: 'About', key: 'about', icon: Sparkles },
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
          Muhammadaziz <span className="text-emerald-400 font-mono text-[10px] px-1 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">v3.0</span>
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

  const t = (key: string) => translations[language][key] ?? key;
  const isActive = (href: string) => (href === '/' ? location === '/' : location.startsWith(href));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setMenuOpen(false);
  }, [location]);

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
      <div className="site-shell min-h-screen bg-[#0B0F17] text-[#E2E8F0] selection:bg-emerald-500/30 selection:text-emerald-300">
        {/* Desktop Left Rail Navigation */}
        <aside className="desktop-rail hidden md:flex fixed top-0 left-0 bottom-0 w-64 border-r border-slate-800/80 bg-[#0B0F17]/90 backdrop-blur-2xl flex-col p-6 z-40 overflow-y-auto" aria-label="Main Navigation">
          <Link href="/" className="mb-8 block group">
            <BrandMark />
          </Link>

          <nav className="flex flex-col gap-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                    isActive(item.href)
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(0,245,160,0.12)] font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={13} className={isActive(item.href) ? 'text-emerald-400' : 'text-slate-500'} />
                    <span>{t(item.key)}</span>
                  </span>
                  <span className="text-[10px] text-slate-600">0{idx}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Tashkent · Dual-Core Practice</span>
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              <a href="https://github.com/Muhammadaziz3427" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors" title="GitHub">
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
              yursinaliev.uz · © 2024—26
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-[#0B0F17]/95 backdrop-blur-xl sticky top-0 z-40">
          <Link href="/">
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
            <div className="absolute top-full left-0 right-0 p-4 bg-[#0B0F17] border-b border-slate-800 flex flex-col gap-1.5 shadow-2xl max-h-[80vh] overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-mono ${
                      isActive(item.href) ? 'bg-emerald-500/15 text-emerald-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <Icon size={14} className="text-emerald-400" />
                    <span>{t(item.key)}</span>
                  </Link>
                );
              })}
              <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-mono text-cyan-400 border border-cyan-500/30 mt-2">
                <ShieldCheck size={14} />
                <span>{t('admin')}</span>
              </Link>
            </div>
          )}
        </header>

        {/* Top Toolbar */}
        <div className="top-tools fixed top-5 right-6 z-30 flex items-center gap-2">
          <button
            type="button"
            className="tool-button hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-slate-300 border border-slate-700/80 rounded-lg bg-[#131B27]/80 hover:border-emerald-400/50 hover:text-emerald-300 backdrop-blur-xl transition-all shadow-lg"
            onClick={() => setCommandOpen(true)}
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
        <div className="md:pl-64">
          <main>{children}</main>
        </div>

        {commandOpen && <CommandPaletteModal onClose={() => setCommandOpen(false)} />}
      </div>
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
        className="px-2.5 py-1.5 text-xs font-mono text-slate-300 border border-slate-700/80 rounded-lg bg-[#131B27]/80 hover:border-emerald-400/50 hover:text-emerald-300 backdrop-blur-xl transition-all flex items-center gap-1 shadow-lg"
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
      { href: '/admin', label: 'Admin Security CMS', key: 'admin', icon: ShieldCheck },
    ].map((item) => ({
      id: item.href,
      label: item.label,
      detail: `Navigate to ${item.label}`,
      href: item.href,
      kind: 'Navigation',
    }));

    const projectResults = fallbackProjects.map((p) => ({
      id: p.slug,
      label: p.name,
      detail: `${p.summary} [${p.techStack?.join(', ')}]`,
      href: `/projects/${p.slug}`,
      kind: 'Project',
    }));

    const essayResults = fallbackEssays.map((e) => ({
      id: e.slug,
      label: e.title,
      detail: e.dek || '',
      href: `/essays/${e.slug}`,
      kind: 'Essay',
    }));

    return [...navResults, ...projectResults, ...essayResults].filter(
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
            placeholder="Search all 10 modules: Projects, Essays, Books, Travel, Security, Medical..."
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
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {item.kind}
                </span>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              No matching records found across modules.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// 5. ACTIVITY LOG HUD
// ==========================================
function ActivityLog() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    listTelemetryLogs().then((res) => {
      if (res && res.length > 0) {
        setLogs(res.slice(0, 5));
      } else {
        setLogs([
          { message: 'Zero-Trust Authentication active (Supabase RLS)', timestamp: 'Just now' },
          { message: 'Dual-Domain Telemetry HUD initialized', timestamp: '2h ago' },
          { message: 'Cardiovascular electrophysiology module loaded', timestamp: '1d ago' },
        ]);
      }
    });
  }, []);

  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-[#131B27]/80 backdrop-blur-xl font-mono space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
        <span className="flex items-center gap-2 text-emerald-400 font-bold">
          <Terminal size={14} /> LIVE SYSTEM TELEMETRY
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-pulse">
          ONLINE
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        {logs.map((log, i) => (
          <div key={i} className="flex items-start gap-2.5 text-slate-300">
            <span className="text-emerald-400 font-bold mt-0.5">›</span>
            <div className="flex-1 leading-snug">
              <div>{log.message}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Active'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 6. HOME PAGE (DYNAMIC 10-MODULE DASHBOARD)
// ==========================================
function HomePage() {
  const { t } = useLocale();
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [stats, setStats] = useState({
    projects: 4,
    essays: 2,
    books: 4,
    travels: 2,
    games: 3,
    security: 3,
    medical: 3,
    tips: 5,
    gallery: 5
  });
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>(fallbackProjects);
  const [latestEssays, setLatestEssays] = useState<Essay[]>(fallbackEssays);

  useEffect(() => {
    getSiteConfig().then((cfg) => {
      if (cfg) setConfig(cfg);
    });

    Promise.allSettled([
      listProjects(),
      listEssays(),
      listBooks(),
      listTravels(),
      listGames(),
      listSecurityNotes(),
      listMedicalLearning(),
      listQuickTips(),
      listGallery()
    ]).then(([p, e, b, tr, g, s, m, tp, gal]) => {
      setStats({
        projects: p.status === 'fulfilled' && p.value.length > 0 ? p.value.length : 4,
        essays: e.status === 'fulfilled' && e.value.length > 0 ? e.value.length : 2,
        books: b.status === 'fulfilled' && b.value.length > 0 ? b.value.length : 4,
        travels: tr.status === 'fulfilled' && tr.value.length > 0 ? tr.value.length : 2,
        games: g.status === 'fulfilled' && g.value.length > 0 ? g.value.length : 3,
        security: s.status === 'fulfilled' && s.value.length > 0 ? s.value.length : 3,
        medical: m.status === 'fulfilled' && m.value.length > 0 ? m.value.length : 3,
        tips: tp.status === 'fulfilled' && tp.value.length > 0 ? tp.value.length : 5,
        gallery: gal.status === 'fulfilled' && gal.value.length > 0 ? gal.value.length : 5,
      });

      if (p.status === 'fulfilled' && p.value.length > 0) setFeaturedProjects(p.value.slice(0, 2));
      if (e.status === 'fulfilled' && e.value.length > 0) setLatestEssays(e.value.slice(0, 2));
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 space-y-24">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{config.status_text || 'Dual-Core Practice: Surgery & CyberSec'}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-100 leading-[1.1]">
            {config.name.split(' ')[0]} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-300 font-serif">
              {config.name.split(' ').slice(1).join(' ') || 'Yursinaliyev'}
            </span>
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed font-sans max-w-xl">
            {config.headline || t('heroLead')}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/projects"
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(0,245,160,0.3)]"
            >
              {t('selectedWork')} <ArrowRight size={14} />
            </Link>

            <Link
              href="/medical"
              className="flex items-center gap-2 px-5 py-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold transition-all"
            >
              <Stethoscope size={14} /> Medical Learning
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <ActivityLog />
        </div>
      </section>

      {/* Dynamic Aggregated Quick Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Projects', count: stats.projects, href: '/projects', icon: Code, color: 'text-emerald-400' },
          { label: 'Essays', count: stats.essays, href: '/essays', icon: Layers, color: 'text-cyan-400' },
          { label: 'Books Read', count: stats.books, href: '/books', icon: BookOpen, color: 'text-amber-400' },
          { label: 'Travels', count: stats.travels, href: '/travel', icon: Compass, color: 'text-teal-400' },
          { label: 'Security Notes', count: stats.security, href: '/security', icon: Shield, color: 'text-pink-400' },
          { label: 'Medical Topics', count: stats.medical, href: '/medical', icon: Stethoscope, color: 'text-blue-400' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="p-4 rounded-xl border border-slate-800 bg-[#131B27]/80 hover:border-emerald-500/40 transition-all group block"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold font-mono text-slate-100">{item.count}</span>
                <Icon size={16} className={item.color} />
              </div>
              <div className="text-xs font-mono text-slate-400 group-hover:text-emerald-300 transition-colors">
                {item.label} →
              </div>
            </Link>
          );
        })}
      </section>

      {/* 10 Sections Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Explore Blueprint</div>
            <h2 className="text-2xl font-bold text-slate-100 font-serif">All 10 Dynamic Modules</h2>
          </div>
          <span className="text-xs font-mono text-slate-500">100% Admin Powered</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            { title: 'Projects', desc: 'Code & Architecture', href: '/projects', icon: Code },
            { title: 'Essays', desc: 'Clinical & Tech notes', href: '/essays', icon: Layers },
            { title: 'Bookshelf', desc: 'Reviews & models', href: '/books', icon: BookOpen },
            { title: 'Travel', desc: 'Expeditions log', href: '/travel', icon: Compass },
            { title: 'Games', desc: 'Strategy & hobbies', href: '/games', icon: Gamepad2 },
            { title: 'Security', desc: 'Zero-trust lab', href: '/security', icon: Shield },
            { title: 'Medical', desc: 'Anatomy & surgery', href: '/medical', icon: Stethoscope },
            { title: 'Quick Tips', desc: 'Micro-insights', href: '/tips', icon: Lightbulb },
            { title: 'Gallery', desc: 'Anatomy plates', href: '/gallery', icon: Eye },
            { title: 'About', desc: 'Dual-domain bio', href: '/about', icon: Sparkles },
          ].map((sec) => {
            const Icon = sec.icon;
            return (
              <Link
                key={sec.title}
                href={sec.href}
                className="p-4 rounded-xl border border-slate-800 bg-[#131B27]/60 hover:border-emerald-500/40 hover:bg-[#131B27] transition-all group block"
              >
                <Icon size={18} className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  {sec.title}
                </h3>
                <p className="text-[11px] font-mono text-slate-500">{sec.desc}</p>
              </Link>
            );
          })}
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
            View all ({stats.projects}) <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredProjects.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="p-6 rounded-xl border border-slate-800 bg-[#131B27]/80 hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(0,245,160,0.1)] transition-all group block"
            >
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-3">
                <span>{p.number || '01'} / {p.category}</span>
                <span className="text-slate-500">{p.year}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-300 transition-colors mb-2">
                {p.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{p.summary}</p>
              <div className="flex flex-wrap gap-1.5">
                {(p.techStack || p.tech_stack || []).map((tech) => (
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
          {latestEssays.map((e) => (
            <Link
              key={e.slug}
              href={`/essays/${e.slug}`}
              className="p-6 rounded-xl border border-slate-800 bg-[#131B27]/80 hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(0,210,255,0.1)] transition-all group block"
            >
              <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-3">
                <span>{e.type || e.category}</span>
                <span className="text-slate-500">{e.read || '5 min read'}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                {e.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{e.dek}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// ==========================================
// 7. PROJECTS PAGE & DETAIL
// ==========================================
function ProjectsPage() {
  const [projectsList, setProjectsList] = useState<Project[]>(fallbackProjects);
  const [category, setCategory] = useState<string>('All');

  useEffect(() => {
    listProjects().then((data) => {
      if (data.length > 0) setProjectsList(data);
    });
  }, []);

  const categories = ['All', 'Product', 'Security', 'Medicine', 'Prototype'];
  const filtered = projectsList.filter((p) => (category === 'All' ? true : p.category === category));

  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 space-y-12">
      <div className="space-y-4">
        <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Engineering Portfolio</div>
        <h1 className="text-4xl font-bold text-slate-100 font-serif">Selected Projects</h1>
        <p className="text-sm text-slate-400 font-mono max-w-xl">
          High-performance distributed systems, zero-trust cryptographic vaults, and medical vector models.
        </p>

        <div className="flex flex-wrap gap-2 pt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                category === cat
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((p) => (
          <Link
            key={p.slug}
            href={`/projects/${p.slug}`}
            className="p-6 rounded-xl border border-slate-800 bg-[#131B27]/80 hover:border-emerald-500/40 transition-all group block space-y-4"
          >
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
              <span>{p.number || '01'} / {p.category}</span>
              <span className="text-slate-500">{p.year}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
              {p.name}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">{p.summary}</p>
            <div className="flex flex-wrap gap-1.5">
              {(p.techStack || p.tech_stack || []).map((t) => (
                <span key={t} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                  {t}
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
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    listProjects().then((list) => {
      const p = list.find((item) => item.slug === slug) || fallbackProjects.find((item) => item.slug === slug);
      setProject(p || null);
    });
  }, [slug]);

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-16 font-mono text-xs text-slate-500">
        Locating project record...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-24 pb-16 space-y-8">
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-emerald-400">
        <ArrowLeft size={13} /> Back to Projects
      </Link>

      <div className="space-y-4 border-b border-slate-800 pb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <span>{project.number}</span>
          <span>·</span>
          <span>{project.category}</span>
          <span>·</span>
          <span className="text-slate-500">{project.year}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-100 font-serif">{project.name}</h1>
        <p className="text-base text-slate-300 leading-relaxed font-sans">{project.summary}</p>

        <div className="flex flex-wrap gap-4 pt-4">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold hover:bg-emerald-500/30">
              <ExternalLink size={13} /> Live Deployment
            </a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono hover:text-slate-100">
              <Github size={13} /> Source Repository
            </a>
          )}
        </div>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
        {project.problem && (
          <div className="space-y-2">
            <h2 className="text-xs font-mono text-red-400 uppercase tracking-wider">The Problem Constraint</h2>
            <p>{project.problem}</p>
          </div>
        )}
        {project.solution && (
          <div className="space-y-2">
            <h2 className="text-xs font-mono text-emerald-400 uppercase tracking-wider">The Architectural Solution</h2>
            <p>{project.solution}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 8. ESSAYS PAGE & DETAIL
// ==========================================
function EssaysPage() {
  const [essaysList, setEssaysList] = useState<Essay[]>(fallbackEssays);

  useEffect(() => {
    listEssays().then((data) => {
      if (data.length > 0) setEssaysList(data);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 space-y-12">
      <div className="space-y-4">
        <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Clinical & Technical Archives</div>
        <h1 className="text-4xl font-bold text-slate-100 font-serif">Essays & Field Notes</h1>
        <p className="text-sm text-slate-400 font-mono max-w-xl">
          Reflections on software architecture, surgery, attention as a finite biological resource, and systems theory.
        </p>
      </div>

      <div className="space-y-6">
        {essaysList.map((e) => (
          <Link
            key={e.slug}
            href={`/essays/${e.slug}`}
            className="p-6 rounded-xl border border-slate-800 bg-[#131B27]/80 hover:border-cyan-500/40 transition-all group block space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
              <span>{e.type || e.category}</span>
              <span className="text-slate-500">{e.date || 'Recent'} · {e.read || '5 min read'}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 group-hover:text-cyan-300 transition-colors font-serif">
              {e.title}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">{e.dek}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function EssayDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [essay, setEssay] = useState<Essay | null>(null);

  useEffect(() => {
    listEssays().then((list) => {
      const found = list.find((item) => item.slug === slug) || fallbackEssays.find((item) => item.slug === slug);
      setEssay(found || null);
    });
  }, [slug]);

  if (!essay) {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-16 font-mono text-xs text-slate-500">
        Loading essay transcript...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-24 pb-16 space-y-8">
      <Link href="/essays" className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan-400">
        <ArrowLeft size={13} /> Back to Essays
      </Link>

      <div className="space-y-3 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>{essay.type || essay.category}</span>
          <span>·</span>
          <span className="text-slate-500">{essay.date} · {essay.read}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-100 font-serif">{essay.title}</h1>
        <p className="text-base text-slate-300 leading-relaxed font-sans">{essay.dek}</p>
      </div>

      <div className="space-y-6 text-base text-slate-200 leading-relaxed font-sans whitespace-pre-line">
        {essay.content_markdown || essay.content || (essay.sections?.map(s => `## ${s.title}\n${s.content}`).join('\n\n'))}
      </div>
    </div>
  );
}

// ==========================================
// 9. GALLERY PAGE
// ==========================================
function GalleryPage() {
  const [galleryList, setGalleryList] = useState<ArtPiece[]>(fallbackGallery);
  const [selectedPiece, setSelectedPiece] = useState<ArtPiece | null>(null);

  useEffect(() => {
    listGallery().then((data) => {
      if (data.length > 0) setGalleryList(data);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 space-y-12">
      <div className="space-y-4">
        <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Visual Studies</div>
        <h1 className="text-4xl font-bold text-slate-100 font-serif">Anatomy & Telemetry Gallery</h1>
        <p className="text-sm text-slate-400 font-mono max-w-xl">
          Detailed anatomical dissections, neuro-vascular studies, and dark-mode cyber architecture plates.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {galleryList.map((piece) => (
          <motion.div
            key={piece.id || piece.title}
            whileHover={{ y: -3 }}
            onClick={() => setSelectedPiece(piece)}
            className="p-6 rounded-2xl border border-slate-800 bg-[#131B27]/80 hover:border-emerald-500/40 transition-all cursor-pointer group space-y-4"
          >
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px]">
                {piece.category}
              </span>
              <span className="text-slate-500">{piece.aspectRatio || piece.aspect_ratio || '16/10'}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-300 transition-colors font-serif">
              {piece.title}
            </h3>
            <p className="text-xs text-slate-400">{piece.note || piece.description}</p>
            {piece.details && piece.details.length > 0 && (
              <ul className="space-y-1 text-[11px] font-mono text-slate-400 border-t border-slate-800/60 pt-3">
                {piece.details.slice(0, 3).map((d, idx) => (
                  <li key={idx}>› {d}</li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>

      {selectedPiece && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setSelectedPiece(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-emerald-500/30 bg-[#131B27] p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 uppercase">{selectedPiece.category}</span>
              <button onClick={() => setSelectedPiece(null)} className="text-slate-400 hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 font-serif">{selectedPiece.title}</h2>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">{selectedPiece.note || selectedPiece.description}</p>
            {selectedPiece.details && (
              <ul className="space-y-2 text-xs font-mono text-slate-300 pt-2 border-t border-slate-800">
                {selectedPiece.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400">›</span> {d}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 10. ABOUT PAGE
// ==========================================
function AboutPage() {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);

  useEffect(() => {
    getSiteConfig().then((cfg) => {
      if (cfg) setConfig(cfg);
    });
  }, []);

  const skills = [
    'Next.js 14 / TypeScript',
    'PostgreSQL / Supabase RLS',
    'Cryptographic Key Derivation (HKDF)',
    'Surgical Anatomy Dissection',
    'Zero-Trust Architecture',
    'Microvascular Anastomosis Prep',
    'Distributed Systems',
    'Calm Product Engineering',
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 space-y-12">
      <div>
        <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Identity & Roadmap</div>
        <h1 className="text-4xl font-bold text-slate-100 font-serif mt-2">{config.name}</h1>
        <p className="text-base text-slate-300 mt-2 leading-relaxed">
          {config.title} · {config.status_text}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6 text-sm text-slate-300 font-sans leading-relaxed">
          <p>{config.bio}</p>
          <p>
            My engineering philosophy centers on quiet, high-assurance software that respects human cognitive bandwidth. Rather than engineering for addictive loops, I build calm tools that solve high-stakes problems with zero friction.
          </p>
          <div className="p-4 rounded-xl border-l-2 border-emerald-400 bg-emerald-500/5 text-slate-200 font-serif italic text-base">
            “The codebase and the patient both demand the same standard: careful observation before action, and respect for the human on the other side.”
          </div>
        </div>

        <div className="space-y-6 font-mono">
          <div className="p-5 rounded-xl border border-slate-800 bg-[#131B27]">
            <div className="text-xs text-emerald-400 font-bold uppercase mb-3">Core Disciplines</div>
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
// 11. ADMIN CMS (10-MODULE CONSOLE & MODALS)
// ==========================================
type ModalMode = 'create' | 'edit';

function AdminAuthGate({ onAuthenticated }: { onAuthenticated: (adminEmail: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setPending(true);
    setErrorMessage('');
    try {
      const { supabase: sb, isAdmin } = await import('@/lib/supabase');
      const { data, error } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('invalid login credentials') || msg.includes('invalid') || msg.includes('user not found')) {
          setErrorMessage('Invalid email or password.');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (!data.user) {
        setErrorMessage('Authentication failed. No user found.');
        return;
      }

      const userEmail = (data.user.email || email).trim().toLowerCase();
      const admin = await isAdmin(userEmail);
      if (admin) {
        onAuthenticated(userEmail);
      } else {
        await sb.auth.signOut();
        setErrorMessage('Access denied: Not an admin account.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error. Please try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0B0F17]/95 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-emerald-500/30 bg-[#131B27]/90 backdrop-blur-2xl p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,245,160,0.15)]">
              <ShieldCheck size={20} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Restricted Zone</div>
              <div className="text-lg font-bold text-slate-100 font-serif">Admin Login</div>
            </div>
          </div>
          <Link href="/" className="text-xs font-mono text-slate-500 hover:text-slate-300">
            ← Back
          </Link>
        </div>

        <p className="text-xs text-slate-400 font-mono mb-6 leading-relaxed border-l-2 border-emerald-500/40 pl-3">
          Enter admin credentials to manage all 10 dynamic modules in real-time.
        </p>

        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yursinaliyevm@gmail.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs outline-none focus:border-emerald-400"
            />
          </div>

          <motion.button
            type="submit"
            disabled={pending}
            className="w-full py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold uppercase tracking-widest transition-all mt-2"
          >
            {pending ? 'Authenticating…' : '→ Enter Admin Console'}
          </motion.button>
        </form>

        {errorMessage && (
          <div className="mt-4 text-xs font-mono px-3 py-2.5 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 flex items-center gap-2">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ---------------- Admin Page Component ----------------
function AdminPage() {
  const { t } = useLocale();
  const [authStatus, setAuthStatus] = useState<'checking' | 'authed' | 'denied'>('checking');
  const [adminEmail, setAdminEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings' | 'essays' | 'books' | 'travels' | 'games' | 'security' | 'medical' | 'projects' | 'tips' | 'gallery'>('dashboard');

  // Live state for all 10 modules
  const [liveConfig, setLiveConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [liveProjects, setLiveProjects] = useState<Project[]>([]);
  const [liveEssays, setLiveEssays] = useState<Essay[]>([]);
  const [liveBooks, setLiveBooks] = useState<Book[]>([]);
  const [liveTravels, setLiveTravels] = useState<Travel[]>([]);
  const [liveGames, setLiveGames] = useState<Game[]>([]);
  const [liveSecurity, setLiveSecurity] = useState<SecurityNote[]>([]);
  const [liveMedical, setLiveMedical] = useState<MedicalLearning[]>([]);
  const [liveTips, setLiveTips] = useState<QuickTip[]>([]);
  const [liveGallery, setLiveGallery] = useState<ArtPiece[]>([]);
  const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);

  // Modals state
  const [configSaving, setConfigSaving] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);
  const [projectModal, setProjectModal] = useState<{ mode: ModalMode; initial?: Partial<Project> } | null>(null);
  const [essayModal, setEssayModal] = useState<{ mode: ModalMode; initial?: Partial<Essay> } | null>(null);
  const [bookModal, setBookModal] = useState<{ mode: ModalMode; initial?: Partial<Book> } | null>(null);
  const [travelModal, setTravelModal] = useState<{ mode: ModalMode; initial?: Partial<Travel> } | null>(null);
  const [gameModal, setGameModal] = useState<{ mode: ModalMode; initial?: Partial<Game> } | null>(null);
  const [securityModal, setSecurityModal] = useState<{ mode: ModalMode; initial?: Partial<SecurityNote> } | null>(null);
  const [medicalModal, setMedicalModal] = useState<{ mode: ModalMode; initial?: Partial<MedicalLearning> } | null>(null);
  const [tipModal, setTipModal] = useState<{ mode: ModalMode; initial?: Partial<QuickTip> } | null>(null);
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
          const userEmail = (session.user?.email || '').trim().toLowerCase();
          const admin = await isAdmin(userEmail);
          return { authed: !!admin, email: userEmail };
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
      } catch {
        if (!cancelled) setAuthStatus('denied');
      } finally {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        if (!cancelled) setAuthStatus((prev) => (prev === 'checking' ? 'denied' : prev));
      }
    };

    runAuthCheck();
    return () => {
      cancelled = true;
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };
  }, []);

  const loadData = useCallback(async () => {
    const api = await import('@/lib/cms-api');
    const [cfg, p, e, b, tr, g, s, m, tp, gal, tLog] = await Promise.allSettled([
      api.getSiteConfig(),
      api.listProjects(),
      api.listEssays(),
      api.listBooks(),
      api.listTravels(),
      api.listGames(),
      api.listSecurityNotes(),
      api.listMedicalLearning(),
      api.listQuickTips(),
      api.listGallery(),
      api.listTelemetryLogs(),
    ]);

    if (cfg.status === 'fulfilled' && cfg.value) setLiveConfig(cfg.value);
    if (p.status === 'fulfilled') setLiveProjects(p.value.length > 0 ? p.value : fallbackProjects);
    if (e.status === 'fulfilled') setLiveEssays(e.value.length > 0 ? e.value : fallbackEssays);
    if (b.status === 'fulfilled') setLiveBooks(b.value);
    if (tr.status === 'fulfilled') setLiveTravels(tr.value);
    if (g.status === 'fulfilled') setLiveGames(g.value);
    if (s.status === 'fulfilled') setLiveSecurity(s.value);
    if (m.status === 'fulfilled') setLiveMedical(m.value);
    if (tp.status === 'fulfilled') setLiveTips(tp.value);
    if (gal.status === 'fulfilled') setLiveGallery(gal.value.length > 0 ? gal.value : fallbackGallery);
    if (tLog.status === 'fulfilled') setTelemetryLogs(tLog.value);
  }, []);

  useEffect(() => {
    if (authStatus === 'authed') loadData();
  }, [authStatus, loadData]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const api = await import('@/lib/cms-api');
    const { table, id } = deleteConfirm;
    if (table === 'projects') await api.deleteProject(id);
    else if (table === 'essays') await api.deleteEssay(id);
    else if (table === 'books') await api.deleteBook(id);
    else if (table === 'travels') await api.deleteTravel(id);
    else if (table === 'games') await api.deleteGame(id);
    else if (table === 'security_notes') await api.deleteSecurityNote(id);
    else if (table === 'medical_learning') await api.deleteMedicalLearning(id);
    else if (table === 'quick_tips') await api.deleteQuickTip(id);
    else if (table === 'gallery') await api.deleteGalleryItem(id);

    setDeleteConfirm(null);
    await loadData();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('@/lib/supabase');
    await signOut();
    setAuthStatus('denied');
  };

  const handleSaveConfig = async (e: FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    setConfigSuccess(false);
    try {
      await updateSiteConfig(liveConfig);
      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 3000);
    } finally {
      setConfigSaving(false);
    }
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

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'essays', label: 'Essays', icon: Layers },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'travels', label: 'Travels', icon: Compass },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'medical', label: 'Medical', icon: Stethoscope },
    { id: 'tips', label: 'Quick Tips', icon: Lightbulb },
    { id: 'gallery', label: 'Gallery', icon: Eye },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 space-y-8 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between p-4 rounded-2xl border border-emerald-500/30 bg-[#131B27]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100">{t('verifiedAdmin')}</div>
            <div className="text-[10px] text-emerald-400">{adminEmail} · 10-Module CMS Console</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg"
          >
            <RefreshCw size={12} /> Sync
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/40 px-3 py-1.5 rounded-lg"
          >
            <LockKeyhole size={12} /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-3">
        {adminTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all border ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold shadow-[0_0_15px_rgba(0,245,160,0.15)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { label: 'Projects', count: liveProjects.length, tab: 'projects', icon: Code },
              { label: 'Essays', count: liveEssays.length, tab: 'essays', icon: Layers },
              { label: 'Books', count: liveBooks.length, tab: 'books', icon: BookOpen },
              { label: 'Travels', count: liveTravels.length, tab: 'travels', icon: Compass },
              { label: 'Games', count: liveGames.length, tab: 'games', icon: Gamepad2 },
              { label: 'Security Notes', count: liveSecurity.length, tab: 'security', icon: Shield },
              { label: 'Medical Topics', count: liveMedical.length, tab: 'medical', icon: Stethoscope },
              { label: 'Quick Tips', count: liveTips.length, tab: 'tips', icon: Lightbulb },
              { label: 'Gallery Plates', count: liveGallery.length, tab: 'gallery', icon: Eye },
              { label: 'Telemetry Logs', count: telemetryLogs.length, tab: 'dashboard', icon: Activity },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  onClick={() => setActiveTab(stat.tab as any)}
                  className="p-4 rounded-xl border border-slate-800 bg-[#131B27]/80 hover:border-emerald-500/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs">{stat.label}</span>
                    <Icon size={14} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-100">{stat.count}</div>
                </div>
              );
            })}
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-[#131B27]/60 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-400" /> Quick Architecture Status
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              All 10 modules are actively connected to Supabase Database & Storage with Row-Level Security. Select any tab above to Create, Read, Update, or Delete live content in real-time.
            </p>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveConfig} className="p-6 rounded-2xl border border-slate-800 bg-[#131B27] space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-100">Global Site Settings</h2>
            <button
              type="submit"
              disabled={configSaving}
              className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition-all"
            >
              {configSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

          {configSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              ✓ Site settings updated successfully!
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Full Name</label>
              <input
                value={liveConfig.name}
                onChange={(e) => setLiveConfig({ ...liveConfig, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Title / Headline</label>
              <input
                value={liveConfig.title}
                onChange={(e) => setLiveConfig({ ...liveConfig, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 mb-1">Hero Lead / Subheading</label>
              <input
                value={liveConfig.headline}
                onChange={(e) => setLiveConfig({ ...liveConfig, headline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 mb-1">Full Biography</label>
              <textarea
                rows={4}
                value={liveConfig.bio}
                onChange={(e) => setLiveConfig({ ...liveConfig, bio: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Status Badge Text</label>
              <input
                value={liveConfig.status_text || ''}
                onChange={(e) => setLiveConfig({ ...liveConfig, status_text: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Contact Email</label>
              <input
                value={liveConfig.email || ''}
                onChange={(e) => setLiveConfig({ ...liveConfig, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </form>
      )}

      {/* Projects Management Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Projects ({liveProjects.length})</h2>
            <button
              onClick={() => {
                const name = prompt('Project Name:');
                if (!name) return;
                const summary = prompt('Summary:') || '';
                createProject({ name, summary, category: 'Product', techStack: ['React', 'TypeScript'] }).then(loadData);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold"
            >
              <Plus size={13} /> Add Project
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveProjects.map((p) => (
              <div key={p.slug} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-100">{p.name}</div>
                  <div className="text-slate-400 text-[11px]">{p.category} · {p.year}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newName = prompt('Update Name:', p.name);
                      if (newName) updateProject(p.id || p.slug, { name: newName }).then(loadData);
                    }}
                    className="p-1.5 text-slate-400 hover:text-emerald-300"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ table: 'projects', id: p.id || p.slug, label: p.name })}
                    className="p-1.5 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Essays Management Tab */}
      {activeTab === 'essays' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Essays ({liveEssays.length})</h2>
            <button
              onClick={() => {
                const title = prompt('Essay Title:');
                if (!title) return;
                const dek = prompt('Excerpt / Subtitle:') || '';
                createEssay({ title, dek, category: 'Tech', read: '5 min read' }).then(loadData);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold"
            >
              <Plus size={13} /> Add Essay
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveEssays.map((e) => (
              <div key={e.slug} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-100">{e.title}</div>
                  <div className="text-slate-400 text-[11px]">{e.category || e.type} · {e.read}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newTitle = prompt('Update Essay Title:', e.title);
                      if (newTitle) updateEssay(e.id || e.slug, { title: newTitle }).then(loadData);
                    }}
                    className="p-1.5 text-slate-400 hover:text-cyan-300"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ table: 'essays', id: e.id || e.slug, label: e.title })}
                    className="p-1.5 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Books Management Tab */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Books ({liveBooks.length})</h2>
            <button
              onClick={() => {
                const title = prompt('Book Title:');
                if (!title) return;
                const author = prompt('Author:') || 'Unknown';
                createBook({ title, author, category: 'Tech', status: 'Completed', rating: 5 }).then(loadData);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold"
            >
              <Plus size={13} /> Add Book
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveBooks.map((b) => (
              <div key={b.id || b.title} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-100">{b.title}</div>
                  <div className="text-slate-400 text-[11px]">by {b.author} · {b.status} · {b.rating}★</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!b.id) return;
                      const newTitle = prompt('Update Title:', b.title);
                      if (newTitle) updateBook(b.id, { title: newTitle }).then(loadData);
                    }}
                    className="p-1.5 text-slate-400 hover:text-amber-300"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => b.id && setDeleteConfirm({ table: 'books', id: b.id, label: b.title })}
                    className="p-1.5 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Travels Tab */}
      {activeTab === 'travels' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Travels ({liveTravels.length})</h2>
            <button
              onClick={() => {
                const trip_title = prompt('Trip Title:');
                if (!trip_title) return;
                const location = prompt('Location (City, Country):') || '';
                createTravel({ trip_title, location }).then(loadData);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold"
            >
              <Plus size={13} /> Add Trip
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveTravels.map((tr) => (
              <div key={tr.id || tr.trip_title} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-100">{tr.trip_title}</div>
                  <div className="text-slate-400 text-[11px]">{tr.location}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => tr.id && setDeleteConfirm({ table: 'travels', id: tr.id, label: tr.trip_title })}
                    className="p-1.5 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Games Tab */}
      {activeTab === 'games' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Games & Hobbies ({liveGames.length})</h2>
            <button
              onClick={() => {
                const name = prompt('Game / Hobby Name:');
                if (!name) return;
                createGame({ name, type: 'Video Game', rating: 5 }).then(loadData);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold"
            >
              <Plus size={13} /> Add Game
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveGames.map((g) => (
              <div key={g.id || g.name} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-100">{g.name}</div>
                  <div className="text-slate-400 text-[11px]">{g.type} · {g.rating}★</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => g.id && setDeleteConfirm({ table: 'games', id: g.id, label: g.name })}
                    className="p-1.5 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Notes Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Security Notes ({liveSecurity.length})</h2>
            <button
              onClick={() => {
                const title = prompt('Security Note Title:');
                if (!title) return;
                const content = prompt('Content:') || '';
                createSecurityNote({ title, category: 'Concept', difficulty: 'Intermediate', content }).then(loadData);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold"
            >
              <Plus size={13} /> Add Note
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveSecurity.map((s) => (
              <div key={s.id || s.title} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-100">{s.title}</div>
                  <div className="text-slate-400 text-[11px]">{s.category} · {s.difficulty}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => s.id && setDeleteConfirm({ table: 'security_notes', id: s.id, label: s.title })}
                    className="p-1.5 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Learning Tab */}
      {activeTab === 'medical' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Medical Learning ({liveMedical.length})</h2>
            <button
              onClick={() => {
                const topic = prompt('Anatomy Topic:');
                if (!topic) return;
                createMedicalLearning({ topic, system: 'Cardiovascular', status: 'Learning' }).then(loadData);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold"
            >
              <Plus size={13} /> Add Topic
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveMedical.map((m) => (
              <div key={m.id || m.topic} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-100">{m.topic}</div>
                  <div className="text-slate-400 text-[11px]">{m.system} · {m.status}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => m.id && setDeleteConfirm({ table: 'medical_learning', id: m.id, label: m.topic })}
                    className="p-1.5 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tips Tab */}
      {activeTab === 'tips' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Quick Tips ({liveTips.length})</h2>
            <button
              onClick={() => {
                const insight = prompt('Quick Tip / Insight:');
                if (!insight) return;
                createQuickTip({ insight, category: 'Tech' }).then(loadData);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold"
            >
              <Plus size={13} /> Add Tip
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveTips.map((tip) => (
              <div key={tip.id || tip.insight} className="p-4 flex items-center justify-between text-xs">
                <div className="max-w-xl">
                  <div className="font-bold text-slate-100 line-clamp-1">"{tip.insight}"</div>
                  <div className="text-slate-400 text-[11px]">{tip.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => tip.id && setDeleteConfirm({ table: 'quick_tips', id: tip.id, label: tip.insight })}
                    className="p-1.5 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Gallery Plates ({liveGallery.length})</h2>
            <button
              onClick={() => {
                const title = prompt('Gallery Plate Title:');
                if (!title) return;
                createGalleryItem({ title, category: 'Anatomy', image_url: '' }).then(loadData);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold"
            >
              <Plus size={13} /> Add Plate
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveGallery.map((gal) => (
              <div key={gal.id || gal.title} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-100">{gal.title}</div>
                  <div className="text-slate-400 text-[11px]">{gal.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => gal.id && setDeleteConfirm({ table: 'gallery', id: gal.id, label: gal.title })}
                    className="p-1.5 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-[#131B27] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase">
              <AlertCircle size={14} /> Confirm Record Deletion
            </div>
            <p className="text-xs text-slate-200">
              Delete <strong className="text-red-300">{deleteConfirm.label}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 12. ROUTER & ROOT APP
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
          <Route path="/books" component={BooksPage} />
          <Route path="/travel" component={TravelPage} />
          <Route path="/games" component={GamesPage} />
          <Route path="/security" component={SecurityPage} />
          <Route path="/medical" component={MedicalPage} />
          <Route path="/tips" component={TipsPage} />
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