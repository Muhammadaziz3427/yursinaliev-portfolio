import { createContext, useCallback, type FormEvent, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
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
  Twitter,
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
  RefreshCw,
  Quote,
  FileText,
  Briefcase,
  GraduationCap,
  Download,
  Share2,
  Zap
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
  ProjectModal,
  EssayModal,
  BookModal,
  SecurityNoteModal,
  QuickTipModal,
  SiteConfigModal
} from '@/components/Admin/AdminModals';
import {
  TravelModal,
  GameModal,
  MedicalLearningModal,
  GalleryModal
} from '@/components/Admin/AdminModalsPart2';
import { BrainConstellationCanvas } from '@/components/Dala/BrainConstellationCanvas';
import { DalaNavbar } from '@/components/Dala/DalaNavbar';
import { DalaFooter } from '@/components/Dala/DalaFooter';
import {
  type SiteConfig,
  type TimelineMilestone,
  type CustomSocialLink,
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

// Re-export types
export type { SiteConfig, TimelineMilestone, CustomSocialLink, Essay, Book, Travel, Game, SecurityNote, MedicalLearning, Project, QuickTip, ArtPiece };

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
    copyEmail: 'Copy Email',
    downloadResume: 'Download Resume / CV',
    availableBadge: 'Available for Collaborations'
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
    copyEmail: 'Emailni nusxalash',
    downloadResume: 'Rezyume / CV yuklab olish',
    availableBadge: 'Hamkorlik uchun ochiq'
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
    copyEmail: 'E-postayı kopyala',
    downloadResume: 'Özgeçmiş / CV İndir',
    availableBadge: 'İşbirliklerine Açık'
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
  quote: 'The codebase and the patient both demand the same standard: careful observation before action, and respect for the human on the other side.',
  status_text: 'Tashkent · Dual-Core Practice Active',
  available_for_work: true,
  email: 'yursinaliyevm@gmail.com',
  github_url: 'https://github.com/Muhammadaziz3427',
  linkedin_url: 'https://linkedin.com',
  twitter_url: 'https://twitter.com',
  telegram_url: 'https://t.me/yursinaliev',
  skills: [
    'Next.js 14 / React',
    'TypeScript',
    'PostgreSQL / Supabase RLS',
    'Zero-Trust Architecture',
    'Web Crypto & HKDF',
    'Surgical Anatomy Dissection',
    'Microvascular Prep',
    'Distributed Systems',
    'Calm Product Engineering',
  ],
  timeline: [
    {
      year: '2024—Present',
      title: 'Clinical & Biomedical Science',
      organization: 'Tashkent Medical Academy',
      description: 'Studying clinical medicine, cardiovascular physiology, and surgical anatomy with focus on precision procedures.'
    },
    {
      year: '2023—2024',
      title: 'Lead Software Architect',
      organization: 'Kitobcha & Systems',
      description: 'Engineered offline-first reading rituals, zero-trust token vaults, and high-performance React architectures.'
    },
    {
      year: '2022—2023',
      title: 'Cybersecurity & Full-Stack Engineer',
      organization: 'Independent Labs',
      description: 'Researched cryptographic key derivation, defensive zero-trust architectures, and spatial map engines.'
    }
  ],
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
function BrandMark({ config }: { config: SiteConfig }) {
  const initials = config.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'MY';

  return (
    <div className="flex items-center gap-3">
      {config.profile_image_url ? (
        <img
          src={config.profile_image_url}
          alt={config.name}
          className="w-8 h-8 rounded-lg object-cover border border-emerald-400/40 shadow-[0_0_15px_rgba(0,245,160,0.2)]"
        />
      ) : (
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,245,160,0.2)]">
          {initials}
        </div>
      )}
      <div>
        <div className="text-sm font-semibold tracking-tight text-slate-100 flex items-center gap-1.5">
          {config.name.split(' ')[0] || 'Muhammadaziz'}{' '}
          <span className="text-emerald-400 font-mono text-[10px] px-1 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">v3.2</span>
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
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(defaultSiteConfig);

  const t = (key: string) => translations[language][key] ?? key;
  const isActive = (href: string) => (href === '/' ? location === '/' : location.startsWith(href));

  useEffect(() => {
    getSiteConfig().then((cfg) => {
      if (cfg) setSiteConfig({ ...defaultSiteConfig, ...cfg });
    });
  }, []);

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

  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className="site-shell min-h-screen bg-black text-white selection:bg-[#8052ff]/30 selection:text-white relative overflow-x-hidden">
        {/* Dala Brain Constellation fixed background */}
        <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
          <BrainConstellationCanvas />
        </div>

        {/* Subtle Ambient Velvet Light Follower */}
        <div
          className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
          style={{
            background: `radial-gradient(650px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(128, 82, 255, 0.04), transparent 75%)`,
          }}
          aria-hidden="true"
        />

        {/* Dala Transparent Navbar */}
        <DalaNavbar
          language={language}
          onLanguageChange={setLanguage}
          t={t}
        />

        {/* Main Content Area */}
        <div className="relative z-10 flex flex-col min-h-screen pt-[72px]">
          <main className="flex-1">{children}</main>
          <DalaFooter siteConfig={siteConfig} />
        </div>

        {/* Command Palette (Ctrl+K) */}
        <AnimatePresence>
          {commandOpen && <CommandPaletteModal onClose={() => setCommandOpen(false)} />}
        </AnimatePresence>
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
      if (cfg) setConfig({ ...defaultSiteConfig, ...cfg });
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
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 sm:px-10">

        {/* ═══════════════════════════════════════════════════
            HERO — Dala Two-Column Asymmetric
        ═══════════════════════════════════════════════════ */}
        <section className="min-h-[85vh] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center py-16 lg:py-0">
          {/* Left: Typography */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {/* Saffron Spark label */}
            <div className="font-caption-amber flex items-center gap-3">
              <span>{config.status_text || 'Surgery × CyberSec'}</span>
              {config.available_for_work && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8052ff]/10 border border-[#8052ff]/30 text-[#8052ff] text-[11px] font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8052ff] animate-pulse" />
                  {t('availableBadge')}
                </span>
              )}
            </div>

            {/* Display Headline — 78-113px with Dala sculptural staggered reveal */}
            <motion.h1
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15, delayChildren: 0.1 }
                }
              }}
              className="font-display text-display-dala text-white"
            >
              <motion.span
                variants={{
                  hidden: { opacity: 0, y: 40, rotate: 1.5 },
                  visible: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } }
                }}
                className="block"
              >
                {config.name?.split(' ')[0] || 'Muhammadaziz'}
              </motion.span>
              <motion.span
                variants={{
                  hidden: { opacity: 0, y: 40, rotate: -1.5 },
                  visible: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } }
                }}
                className="block text-[#9a9a9a]"
              >
                {config.name?.split(' ').slice(1).join(' ') || 'Yursinaliyev'}
              </motion.span>
            </motion.h1>

            {/* Ultra-light body copy */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="font-body-ultralight text-[#bdbdbd] max-w-md"
            >
              {config.headline || t('heroLead')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center gap-5 pt-2"
            >
              <Link href="/projects" className="btn-electric-iris group">
                <span>{t('selectedWork')}</span>
                <ArrowDownRight size={16} className="group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              </Link>

              {config.resume_url && (
                <a
                  href={config.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="link-ghost flex items-center gap-2 py-3 group hover:text-white"
                >
                  <Download size={15} className="group-hover:-translate-y-0.5 transition-transform" />
                  <span>{t('downloadResume')}</span>
                </a>
              )}
            </motion.div>
          </motion.div>

          {/* Right: Hero Stage for the 3D Constellation background */}
          <div className="hidden lg:block relative h-[500px] pointer-events-none" aria-hidden="true" />
        </section>

        {/* ═══════════════════════════════════════════════════
            SKILLS — Floating on Void
        ═══════════════════════════════════════════════════ */}
        {config.skills && config.skills.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="py-20 space-y-6"
          >
            <h3 className="font-caption-amber text-xs">Core Expertise</h3>
            <div className="flex flex-wrap gap-3">
              {config.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.06] text-sm font-light text-[#bdbdbd] hover:text-white hover:border-[#8052ff]/50 hover:bg-[#8052ff]/10 transition-all duration-300 cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* ═══════════════════════════════════════════════════
            PHILOSOPHY QUOTE — Dala Void Style
        ═══════════════════════════════════════════════════ */}
        {config.quote && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="py-24 max-w-3xl"
          >
            <div className="space-y-6">
              <div className="w-12 h-[2px] bg-[#8052ff]" />
              <p className="text-heading-md-dala font-display text-white leading-snug">
                "{config.quote}"
              </p>
              <p className="font-caption-amber text-xs">— {config.name}</p>
            </div>
          </motion.section>
        )}

        {/* ═══════════════════════════════════════════════════
            STAT COUNTERS — Floating on Void
        ═══════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8"
        >
          {[
            { label: 'Projects', count: stats.projects, href: '/projects', icon: Code },
            { label: 'Essays', count: stats.essays, href: '/essays', icon: Layers },
            { label: 'Books', count: stats.books, href: '/books', icon: BookOpen },
            { label: 'Travels', count: stats.travels, href: '/travel', icon: Compass },
            { label: 'Security', count: stats.security, href: '/security', icon: Shield },
            { label: 'Medical', count: stats.medical, href: '/medical', icon: Stethoscope },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={item.href}
                  className="block group space-y-3"
                >
                  <div className="w-8 h-[1px] bg-[#8052ff]/50 group-hover:bg-[#8052ff] group-hover:w-14 transition-all duration-500" />
                  <div className="text-heading-sm-dala font-display text-white group-hover:text-[#8052ff] transition-colors duration-300">
                    {item.count}
                  </div>
                  <div className="flex items-center gap-2 text-[#9a9a9a] group-hover:text-white text-xs font-light uppercase tracking-wider transition-colors">
                    <Icon size={13} className="text-[#8052ff]" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.section>

        {/* ═══════════════════════════════════════════════════
            10 MODULES — Dala Grid (No Cards, Void-Floating)
        ═══════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-20 space-y-10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-caption-amber text-xs mb-2">All Modules</h3>
              <h2 className="text-heading-md-dala font-display text-white">Explore Everything</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {[
              { title: 'Projects', desc: 'Code & Architecture', href: '/projects', icon: Code, badge: `${stats.projects}` },
              { title: 'Essays', desc: 'Clinical & Tech notes', href: '/essays', icon: Layers, badge: `${stats.essays}` },
              { title: 'Bookshelf', desc: 'Reviews & models', href: '/books', icon: BookOpen, badge: `${stats.books}` },
              { title: 'Travel', desc: 'Expeditions', href: '/travel', icon: Compass, badge: `${stats.travels}` },
              { title: 'Games', desc: 'Strategy & hobbies', href: '/games', icon: Gamepad2, badge: `${stats.games}` },
              { title: 'Security', desc: 'Zero-trust notes', href: '/security', icon: Shield, badge: `${stats.security}` },
              { title: 'Medical', desc: 'Anatomy & surgery', href: '/medical', icon: Stethoscope, badge: `${stats.medical}` },
              { title: 'Quick Tips', desc: 'Micro-insights', href: '/tips', icon: Lightbulb, badge: `${stats.tips}` },
              { title: 'Gallery', desc: 'Visual collection', href: '/gallery', icon: Eye, badge: `${stats.gallery}` },
              { title: 'About', desc: 'Full story', href: '/about', icon: Sparkles, badge: '→' },
            ].map((sec, i) => {
              const Icon = sec.icon;
              return (
                <motion.div
                  key={sec.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={sec.href}
                    className="block group p-4 -m-4 rounded-2xl border-t border-white/[0.05] hover:border-[#8052ff]/60 hover:bg-white/[0.02] transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Icon size={18} className="text-[#9a9a9a] group-hover:text-[#8052ff] group-hover:scale-110 transition-all duration-300" />
                      <span className="text-[11px] text-[#9a9a9a]/60 group-hover:text-[#ffb829] font-light transition-colors">{sec.badge}</span>
                    </div>
                    <h3 className="text-sm font-medium text-white group-hover:text-[#8052ff] group-hover:translate-x-0.5 transition-all duration-300 mb-1">
                      {sec.title}
                    </h3>
                    <p className="text-[12px] font-light text-[#9a9a9a]">{sec.desc}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════
            FEATURED PROJECTS — Dala Void Style
        ═══════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-20 space-y-10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-caption-amber text-xs mb-2">Selected Work</h3>
              <h2 className="text-heading-md-dala font-display text-white">Projects</h2>
            </div>
            <Link href="/projects" className="link-saffron flex items-center gap-1 group">
              <span>View all ({stats.projects})</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {featuredProjects.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/projects/${p.slug}`}
                  className="block group space-y-4"
                >
                  <div className="flex items-center justify-between text-xs font-light">
                    <span className="text-[#ffb829] uppercase tracking-wider">{p.number || '01'} / {p.category}</span>
                    <span className="text-[#9a9a9a]">{p.year}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-heading-xs-dala font-display text-white group-hover:text-[#8052ff] group-hover:translate-x-1 transition-all duration-300">
                      {p.name}
                    </h3>
                    <ArrowUpRight size={18} className="text-[#8052ff] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0" />
                  </div>
                  <p className="text-sm font-light text-[#bdbdbd] leading-relaxed line-clamp-3">
                    {p.summary}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(p.techStack || p.tech_stack || []).map((tech) => (
                      <span key={tech} className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] font-light text-[#9a9a9a] group-hover:border-white/[0.12] transition-colors">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="w-full h-[1px] bg-white/[0.04] group-hover:bg-gradient-to-r group-hover:from-[#8052ff]/60 group-hover:via-[#ffb829]/40 group-hover:to-transparent transition-all duration-700 mt-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════
            LATEST ESSAYS — Dala Void Style
        ═══════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="py-20 space-y-10 pb-32"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-caption-amber text-xs mb-2">Reflections</h3>
              <h2 className="text-heading-md-dala font-display text-white">Recent Essays</h2>
            </div>
            <Link href="/essays" className="link-saffron flex items-center gap-1 group">
              <span>Read Archive</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {latestEssays.map((e, i) => (
              <motion.div
                key={e.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/essays/${e.slug}`}
                  className="block group space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-light">
                    <span className="text-[#ffb829] uppercase tracking-wider">{e.type || e.category}</span>
                    <span className="text-[#9a9a9a]">{e.read || '5 min read'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-heading-xs-dala font-display text-white group-hover:text-[#8052ff] group-hover:translate-x-1 transition-all duration-300">
                      {e.title}
                    </h3>
                    <ArrowUpRight size={18} className="text-[#8052ff] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0" />
                  </div>
                  <p className="text-sm font-light text-[#bdbdbd] leading-relaxed line-clamp-3">
                    {e.dek}
                  </p>
                  <div className="w-full h-[1px] bg-white/[0.04] group-hover:bg-gradient-to-r group-hover:from-[#8052ff]/60 group-hover:via-[#ffb829]/40 group-hover:to-transparent transition-all duration-700 mt-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

// ==========================================
// 7. PROJECTS PAGE & DETAIL
// ==========================================
function ProjectsPage() {
  const [projectsList, setProjectsList] = useState<Project[]>(fallbackProjects);
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    listProjects().then((data) => {
      if (data.length > 0) setProjectsList(data);
    });
  }, []);

  const categories = ['All', 'Product', 'Security', 'Medicine', 'Prototype'];
  const filtered = projectsList.filter((p) => {
    const matchCat = category === 'All' ? true : p.category === category;
    const matchSearch = !search || `${p.name} ${p.summary} ${p.techStack?.join(' ')}`.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 space-y-12">
      <div className="space-y-4">
        <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Engineering Portfolio</div>
        <h1 className="text-4xl font-bold text-slate-100 font-serif">Selected Projects</h1>
        <p className="text-sm text-slate-400 font-mono max-w-xl">
          High-performance distributed systems, zero-trust cryptographic vaults, and medical vector models.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div className="flex flex-wrap gap-2">
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

          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500/50"
            />
          </div>
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
// 10. ABOUT PAGE (100% DYNAMIC)
// ==========================================
function AboutPage() {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);

  useEffect(() => {
    getSiteConfig().then((cfg) => {
      if (cfg) setConfig({ ...defaultSiteConfig, ...cfg });
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 space-y-16">
      <div className="flex flex-col sm:flex-row items-start gap-6 border-b border-slate-800 pb-8">
        {config.profile_image_url && (
          <img
            src={config.profile_image_url}
            alt={config.name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-400/40 shadow-xl"
          />
        )}
        <div className="space-y-2 flex-1">
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Identity & Dual-Domain Practice</div>
          <h1 className="text-4xl font-bold text-slate-100 font-serif">{config.name}</h1>
          <p className="text-base text-slate-300 leading-relaxed font-sans">
            {config.title} · {config.status_text}
          </p>

          {config.resume_url && (
            <div className="pt-2">
              <a
                href={config.resume_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold hover:bg-emerald-500/30 transition-all"
              >
                <Download size={13} /> Download Official Resume / CV
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6 text-sm text-slate-300 font-sans leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Biography & Manifesto</h2>
            <p>{config.bio}</p>
          </div>

          {config.quote && (
            <div className="p-5 rounded-2xl border-l-4 border-emerald-400 bg-emerald-500/5 text-slate-200 font-serif italic text-base">
              “{config.quote}”
            </div>
          )}

          {/* Timeline / Milestones */}
          {config.timeline && config.timeline.length > 0 && (
            <div className="space-y-4 pt-4">
              <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Briefcase size={14} /> Experience & Milestones
              </h2>
              <div className="space-y-3 font-mono">
                {config.timeline.map((m, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-800 bg-[#131B27]/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-100">{m.title}</span>
                      <span className="text-emerald-400 text-[11px]">{m.year}</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">{m.organization}</div>
                    <div className="text-slate-400 text-xs font-sans mt-2">{m.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 font-mono">
          {config.skills && config.skills.length > 0 && (
            <div className="p-5 rounded-xl border border-slate-800 bg-[#131B27]">
              <div className="text-xs text-emerald-400 font-bold uppercase mb-3">Skills Matrix</div>
              <div className="flex flex-wrap gap-1.5">
                {config.skills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-5 rounded-xl border border-slate-800 bg-[#131B27] space-y-3 text-xs">
            <div className="text-xs text-cyan-400 font-bold uppercase">Direct Contact</div>
            <div className="text-slate-300">{config.email}</div>
            <div className="text-slate-500 text-[11px]">Tashkent, Uzbekistan (UTC+5)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 11. ADMIN CMS (10-MODULE CONSOLE)
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
  const [tabSearch, setTabSearch] = useState('');

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
  const [configModalOpen, setConfigModalOpen] = useState(false);
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

    if (cfg.status === 'fulfilled' && cfg.value) setLiveConfig({ ...defaultSiteConfig, ...cfg.value });
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
    { id: 'settings', label: 'Global Settings', icon: Settings },
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
              onClick={() => { setActiveTab(tab.id); setTabSearch(''); }}
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
              <Sparkles size={14} className="text-emerald-400" /> Dynamic Portfolio Engine v3.2
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              All 10 modules are actively connected to Supabase Database & Storage with Row-Level Security. You can edit site identity, upload resumes/diagrams, manage skills, and publish clinical/cyber reflections in real time.
            </p>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-[#131B27] space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Global Site Settings & Identity</h2>
              <p className="text-xs text-slate-400">Edit your name, bio, philosophy quote, skills, timeline, and resume link.</p>
            </div>
            <button
              onClick={() => setConfigModalOpen(true)}
              className="px-5 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-2"
            >
              <Edit3 size={13} /> Open Advanced Config Editor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            <div className="space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-emerald-400 font-bold uppercase">Identity Preview</div>
              <div><strong>Name:</strong> {liveConfig.name}</div>
              <div><strong>Title:</strong> {liveConfig.title}</div>
              <div><strong>Headline:</strong> {liveConfig.headline}</div>
              <div><strong>Status:</strong> {liveConfig.status_text}</div>
              <div><strong>Email:</strong> {liveConfig.email}</div>
              <div><strong>Available for Work:</strong> {liveConfig.available_for_work ? '✓ Yes' : '✗ No'}</div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-cyan-400 font-bold uppercase">Skills & Milestones</div>
              <div>
                <strong>Skills Count:</strong> {liveConfig.skills?.length || 0}
                <div className="text-slate-400 text-[11px] truncate mt-1">
                  {liveConfig.skills?.join(', ')}
                </div>
              </div>
              <div className="pt-2">
                <strong>Timeline Milestones:</strong> {liveConfig.timeline?.length || 0} items
              </div>
              <div className="pt-2">
                <strong>Resume URL:</strong> {liveConfig.resume_url ? <a href={liveConfig.resume_url} target="_blank" rel="noreferrer" className="text-emerald-400 underline">View PDF</a> : 'Not uploaded'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Management Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-100">Projects ({liveProjects.length})</h2>
            <div className="flex items-center gap-2">
              <input
                value={tabSearch}
                onChange={(e) => setTabSearch(e.target.value)}
                placeholder="Filter projects..."
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
              />
              <button
                onClick={() => setProjectModal({ mode: 'create' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold"
              >
                <Plus size={13} /> Add Project
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveProjects
              .filter((p) => !tabSearch || `${p.name} ${p.summary} ${p.category}`.toLowerCase().includes(tabSearch.toLowerCase()))
              .map((p) => (
                <div key={p.slug} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-100">{p.name}</div>
                    <div className="text-slate-400 text-[11px]">{p.category} · {p.year}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setProjectModal({ mode: 'edit', initial: p })}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-100">Essays ({liveEssays.length})</h2>
            <div className="flex items-center gap-2">
              <input
                value={tabSearch}
                onChange={(e) => setTabSearch(e.target.value)}
                placeholder="Filter essays..."
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
              />
              <button
                onClick={() => setEssayModal({ mode: 'create' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold"
              >
                <Plus size={13} /> Add Essay
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveEssays
              .filter((e) => !tabSearch || `${e.title} ${e.dek} ${e.category}`.toLowerCase().includes(tabSearch.toLowerCase()))
              .map((e) => (
                <div key={e.slug} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-100">{e.title}</div>
                    <div className="text-slate-400 text-[11px]">{e.category || e.type} · {e.read}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEssayModal({ mode: 'edit', initial: e })}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-100">Books ({liveBooks.length})</h2>
            <div className="flex items-center gap-2">
              <input
                value={tabSearch}
                onChange={(e) => setTabSearch(e.target.value)}
                placeholder="Filter books..."
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
              />
              <button
                onClick={() => setBookModal({ mode: 'create' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold"
              >
                <Plus size={13} /> Add Book
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveBooks
              .filter((b) => !tabSearch || `${b.title} ${b.author}`.toLowerCase().includes(tabSearch.toLowerCase()))
              .map((b) => (
                <div key={b.id || b.title} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-100">{b.title}</div>
                    <div className="text-slate-400 text-[11px]">by {b.author} · {b.status} · {b.rating}★</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBookModal({ mode: 'edit', initial: b })}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-100">Travels ({liveTravels.length})</h2>
            <div className="flex items-center gap-2">
              <input
                value={tabSearch}
                onChange={(e) => setTabSearch(e.target.value)}
                placeholder="Filter trips..."
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
              />
              <button
                onClick={() => setTravelModal({ mode: 'create' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold"
              >
                <Plus size={13} /> Add Trip
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveTravels
              .filter((tr) => !tabSearch || `${tr.trip_title} ${tr.location}`.toLowerCase().includes(tabSearch.toLowerCase()))
              .map((tr) => (
                <div key={tr.id || tr.trip_title} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-100">{tr.trip_title}</div>
                    <div className="text-slate-400 text-[11px]">{tr.location}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTravelModal({ mode: 'edit', initial: tr })}
                      className="p-1.5 text-slate-400 hover:text-teal-300"
                    >
                      <Edit3 size={14} />
                    </button>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-100">Games & Hobbies ({liveGames.length})</h2>
            <div className="flex items-center gap-2">
              <input
                value={tabSearch}
                onChange={(e) => setTabSearch(e.target.value)}
                placeholder="Filter games..."
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
              />
              <button
                onClick={() => setGameModal({ mode: 'create' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold"
              >
                <Plus size={13} /> Add Game
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveGames
              .filter((g) => !tabSearch || `${g.name} ${g.type}`.toLowerCase().includes(tabSearch.toLowerCase()))
              .map((g) => (
                <div key={g.id || g.name} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-100">{g.name}</div>
                    <div className="text-slate-400 text-[11px]">{g.type} · {g.rating}★</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGameModal({ mode: 'edit', initial: g })}
                      className="p-1.5 text-slate-400 hover:text-pink-300"
                    >
                      <Edit3 size={14} />
                    </button>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-100">Security Notes ({liveSecurity.length})</h2>
            <div className="flex items-center gap-2">
              <input
                value={tabSearch}
                onChange={(e) => setTabSearch(e.target.value)}
                placeholder="Filter notes..."
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
              />
              <button
                onClick={() => setSecurityModal({ mode: 'create' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold"
              >
                <Plus size={13} /> Add Note
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveSecurity
              .filter((s) => !tabSearch || `${s.title} ${s.category} ${s.difficulty}`.toLowerCase().includes(tabSearch.toLowerCase()))
              .map((s) => (
                <div key={s.id || s.title} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-100">{s.title}</div>
                    <div className="text-slate-400 text-[11px]">{s.category} · {s.difficulty}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSecurityModal({ mode: 'edit', initial: s })}
                      className="p-1.5 text-slate-400 hover:text-emerald-300"
                    >
                      <Edit3 size={14} />
                    </button>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-100">Medical Learning ({liveMedical.length})</h2>
            <div className="flex items-center gap-2">
              <input
                value={tabSearch}
                onChange={(e) => setTabSearch(e.target.value)}
                placeholder="Filter topics..."
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
              />
              <button
                onClick={() => setMedicalModal({ mode: 'create' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold"
              >
                <Plus size={13} /> Add Topic
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveMedical
              .filter((m) => !tabSearch || `${m.topic} ${m.system}`.toLowerCase().includes(tabSearch.toLowerCase()))
              .map((m) => (
                <div key={m.id || m.topic} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-100">{m.topic}</div>
                    <div className="text-slate-400 text-[11px]">{m.system} · {m.status}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMedicalModal({ mode: 'edit', initial: m })}
                      className="p-1.5 text-slate-400 hover:text-blue-300"
                    >
                      <Edit3 size={14} />
                    </button>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-100">Quick Tips ({liveTips.length})</h2>
            <div className="flex items-center gap-2">
              <input
                value={tabSearch}
                onChange={(e) => setTabSearch(e.target.value)}
                placeholder="Filter tips..."
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
              />
              <button
                onClick={() => setTipModal({ mode: 'create' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold"
              >
                <Plus size={13} /> Add Tip
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveTips
              .filter((tip) => !tabSearch || `${tip.insight} ${tip.category}`.toLowerCase().includes(tabSearch.toLowerCase()))
              .map((tip) => (
                <div key={tip.id || tip.insight} className="p-4 flex items-center justify-between text-xs">
                  <div className="max-w-xl">
                    <div className="font-bold text-slate-100 line-clamp-1">"{tip.insight}"</div>
                    <div className="text-slate-400 text-[11px]">{tip.category}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTipModal({ mode: 'edit', initial: tip })}
                      className="p-1.5 text-slate-400 hover:text-amber-300"
                    >
                      <Edit3 size={14} />
                    </button>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-100">Gallery Plates ({liveGallery.length})</h2>
            <div className="flex items-center gap-2">
              <input
                value={tabSearch}
                onChange={(e) => setTabSearch(e.target.value)}
                placeholder="Filter plates..."
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
              />
              <button
                onClick={() => setGalleryModal({ mode: 'create' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold"
              >
                <Plus size={13} /> Add Plate
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131B27] divide-y divide-slate-800">
            {liveGallery
              .filter((gal) => !tabSearch || `${gal.title} ${gal.category}`.toLowerCase().includes(tabSearch.toLowerCase()))
              .map((gal) => (
                <div key={gal.id || gal.title} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-100">{gal.title}</div>
                    <div className="text-slate-400 text-[11px]">{gal.category}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGalleryModal({ mode: 'edit', initial: gal })}
                      className="p-1.5 text-slate-400 hover:text-emerald-300"
                    >
                      <Edit3 size={14} />
                    </button>
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

      {/* Dynamic Interactive Modals */}
      {configModalOpen && (
        <SiteConfigModal
          initial={liveConfig}
          onClose={() => setConfigModalOpen(false)}
          onSave={async (data) => {
            const updated = await updateSiteConfig(data);
            setLiveConfig(updated);
            await loadData();
          }}
        />
      )}

      {projectModal && (
        <ProjectModal
          mode={projectModal.mode}
          initial={projectModal.initial}
          onClose={() => setProjectModal(null)}
          onSave={async (data) => {
            if (projectModal.mode === 'create') await createProject(data as any);
            else if (projectModal.initial?.id || projectModal.initial?.slug) {
              await updateProject(projectModal.initial.id || projectModal.initial.slug!, data);
            }
            await loadData();
          }}
        />
      )}

      {essayModal && (
        <EssayModal
          mode={essayModal.mode}
          initial={essayModal.initial}
          onClose={() => setEssayModal(null)}
          onSave={async (data) => {
            if (essayModal.mode === 'create') await createEssay(data as any);
            else if (essayModal.initial?.id || essayModal.initial?.slug) {
              await updateEssay(essayModal.initial.id || essayModal.initial.slug!, data);
            }
            await loadData();
          }}
        />
      )}

      {bookModal && (
        <BookModal
          mode={bookModal.mode}
          initial={bookModal.initial}
          onClose={() => setBookModal(null)}
          onSave={async (data) => {
            if (bookModal.mode === 'create') await createBook(data as any);
            else if (bookModal.initial?.id) await updateBook(bookModal.initial.id, data);
            await loadData();
          }}
        />
      )}

      {travelModal && (
        <TravelModal
          mode={travelModal.mode}
          initial={travelModal.initial}
          onClose={() => setTravelModal(null)}
          onSave={async (data) => {
            if (travelModal.mode === 'create') await createTravel(data as any);
            else if (travelModal.initial?.id) await updateTravel(travelModal.initial.id, data);
            await loadData();
          }}
        />
      )}

      {gameModal && (
        <GameModal
          mode={gameModal.mode}
          initial={gameModal.initial}
          onClose={() => setGameModal(null)}
          onSave={async (data) => {
            if (gameModal.mode === 'create') await createGame(data as any);
            else if (gameModal.initial?.id) await updateGame(gameModal.initial.id, data);
            await loadData();
          }}
        />
      )}

      {securityModal && (
        <SecurityNoteModal
          mode={securityModal.mode}
          initial={securityModal.initial}
          onClose={() => setSecurityModal(null)}
          onSave={async (data) => {
            if (securityModal.mode === 'create') await createSecurityNote(data as any);
            else if (securityModal.initial?.id) await updateSecurityNote(securityModal.initial.id, data);
            await loadData();
          }}
        />
      )}

      {medicalModal && (
        <MedicalLearningModal
          mode={medicalModal.mode}
          initial={medicalModal.initial}
          onClose={() => setMedicalModal(null)}
          onSave={async (data) => {
            if (medicalModal.mode === 'create') await createMedicalLearning(data as any);
            else if (medicalModal.initial?.id) await updateMedicalLearning(medicalModal.initial.id, data);
            await loadData();
          }}
        />
      )}

      {tipModal && (
        <QuickTipModal
          mode={tipModal.mode}
          initial={tipModal.initial}
          onClose={() => setTipModal(null)}
          onSave={async (data) => {
            if (tipModal.mode === 'create') await createQuickTip(data as any);
            else if (tipModal.initial?.id) await updateQuickTip(tipModal.initial.id, data);
            await loadData();
          }}
        />
      )}

      {galleryModal && (
        <GalleryModal
          mode={galleryModal.mode}
          initial={galleryModal.initial}
          onClose={() => setGalleryModal(null)}
          onSave={async (data) => {
            if (galleryModal.mode === 'create') await createGalleryItem(data as any);
            else if (galleryModal.initial?.id) await updateGalleryItem(galleryModal.initial.id, data);
            await loadData();
          }}
        />
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