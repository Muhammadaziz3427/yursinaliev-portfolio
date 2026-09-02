import { createContext, type FormEvent, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
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
  ShieldCheck,
  Terminal,
  X,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { getAdminSummary, getPortfolio, postGoogleAuth, postLike, postMagicLink, type ActivityItem, type AdminSummary } from '@/lib/portfolio-api';

const queryClient = new QueryClient();

type Language = 'EN' | 'UZ' | 'TR';
const languageLabels: Record<Language, Record<string, string>> = {
  EN: {
    home: 'Home', projects: 'Projects', essays: 'Essays', gallery: 'Gallery', about: 'About',
    selectedWork: 'See selected work', conversation: 'Start a conversation', archive: 'View the archive',
  },
  UZ: {
    home: 'Bosh sahifa', projects: 'Loyihalar', essays: 'Maqolalar', gallery: 'Galereya', about: 'Men haqimda',
    selectedWork: 'Tanlangan ishlar', conversation: 'Suhbatni boshlash', archive: 'Arxivni ko‘rish',
  },
  TR: {
    home: 'Ana sayfa', projects: 'Projeler', essays: 'Yazılar', gallery: 'Galeri', about: 'Hakkımda',
    selectedWork: 'Seçili çalışmaları gör', conversation: 'Bir konuşma başlat', archive: 'Arşivi gör',
  },
};
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void }>({
  language: 'EN',
  setLanguage: () => undefined,
});
const SignInContext = createContext<() => void>(() => undefined);
const useLocale = () => useContext(LanguageContext);
const useSignIn = () => useContext(SignInContext);

type Project = {
  slug: string;
  number: string;
  name: string;
  summary: string;
  detail: string;
  tags: string[];
  result: string;
  year: string;
  role: string;
  accent: string;
};

type Essay = {
  slug: string;
  type: string;
  title: string;
  dek: string;
  date: string;
  read: string;
  body: ReactNode;
};

const projects: Project[] = [
  {
    slug: 'kitobcha',
    number: '01',
    name: 'Kitobcha',
    summary: 'A warmer way for Uzbek readers to find, save, and talk about their next book.',
    detail: 'Kitobcha began as a question about attention: can a reading tool feel less like a catalogue and more like a trusted recommendation from a friend? I built the first version around small rituals, clear language, and a catalogue that respects the reader’s pace.',
    tags: ['Product design', 'React', 'Node.js'],
    result: 'A calmer reading loop',
    year: '2023—24',
    role: 'Product · Engineering',
    accent: 'reading',
  },
  {
    slug: 'eco-xarita',
    number: '02',
    name: 'Eco-Xarita',
    summary: 'A community map helping people in Tashkent make more informed everyday climate choices.',
    detail: 'Eco-Xarita turns scattered environmental information into a useful local layer: repair spots, recycling points, refill stations, and small actions that add up. The project taught me to design for imperfect data without hiding the uncertainty.',
    tags: ['Mapping', 'Research', 'TypeScript'],
    result: '34 mapped locations',
    year: '2022—23',
    role: 'Research · Engineering',
    accent: 'map',
  },
  {
    slug: 'suture-notes',
    number: '03',
    name: 'Suture Notes',
    summary: 'A private study companion for turning surgical anatomy into repeatable, visual memory.',
    detail: 'Suture Notes is an early, deliberately small experiment: structured prompts, a spaced review queue, and room for imperfect sketches. It sits where my two interests overlap most honestly — useful software and the patience of learning anatomy.',
    tags: ['Prototype', 'Learning tools', 'UX writing'],
    result: 'Built for daily practice',
    year: '2024',
    role: 'Concept · Prototype',
    accent: 'clinical',
  },
];

const essays: Essay[] = [
  {
    slug: 'software-should-leave-room',
    type: 'On making',
    title: 'Software should leave room for a person',
    dek: 'The best interfaces do not demand all of our attention. They help us return to what we came to do.',
    date: '18 Mar 2024',
    read: '6 min read',
    body: (
      <>
        <p>There is a particular kind of software that makes you feel watched. Every surface is busy, every quiet moment is an opportunity to suggest something. The design is technically responsive, but it never lets you respond.</p>
        <p>I keep thinking about the opposite: tools with enough confidence to be quiet. A reading list that does not turn into a feed. A map that tells you when its data is incomplete. A study companion that remembers what you are learning without pretending to know how you feel.</p>
        <h2>Attention is part of the interface</h2>
        <p>When I design, I try to ask what the screen is asking from a person. Not just what it does, but what it costs. A dense table may be efficient for a specialist and exhausting for everyone else. A notification may be useful once and harmful when it becomes a rhythm.</p>
        <blockquote>Good software is not the loudest thing in the room. It is the thing that helps the room work.</blockquote>
        <p>This is why small details matter to me: the sentence beside an empty state, the pace of a transition, the decision to show an edge case instead of smoothing it away. They are not decoration. They are the relationship.</p>
        <h2>Make space, then make it useful</h2>
        <p>Restraint is not minimalism for its own sake. It is a way of protecting the user’s reason for arriving. The work is to remove enough noise that the important parts can become specific, human, and memorable.</p>
      </>
    ),
  },
  {
    slug: 'learning-with-both-hands',
    type: 'Field notes',
    title: 'Learning with both hands',
    dek: 'What software engineering and surgical training have started teaching each other.',
    date: '02 Feb 2024',
    read: '8 min read',
    body: (
      <>
        <p>I used to think my interests needed an explanation. Software was one direction; medicine, another. Over time, the distance has started to look more like a useful tension.</p>
        <p>Both disciplines reward careful observation. Both are built from systems that can fail in very ordinary ways. And both ask for a kind of humility: the environment is always more complex than the model in your head.</p>
        <h2>The value of a second pass</h2>
        <p>In code, a second pass might mean reading a function as if you did not write it. In anatomy, it might mean tracing a structure again from a different angle. The motion is similar. You slow down, notice a relationship, and revise the mental map.</p>
        <blockquote>Precision is not speed with the rough edges hidden. It is attention that survives the second pass.</blockquote>
        <p>This is also why I like making things public before they are finished. A sketch, a prototype, a short note — each one gives the next pass somewhere to begin.</p>
      </>
    ),
  },
  {
    slug: 'a-map-is-an-argument',
    type: 'On place',
    title: 'A map is an argument',
    dek: 'Every map decides what deserves to be visible. Designing Eco-Xarita made that responsibility concrete.',
    date: '11 Nov 2023',
    read: '5 min read',
    body: (
      <>
        <p>Maps often arrive with the authority of facts. A pin, a boundary, a route — each looks definitive. But a map is a set of choices before it is a set of coordinates.</p>
        <p>While working on Eco-Xarita, I learned that the most important design question was not how to place a location. It was how to communicate the confidence around it: is this place open today, who verified it, and what happens when nobody knows?</p>
        <h2>Useful uncertainty</h2>
        <p>Showing uncertainty can feel like a failure of polish. In practice it is often what makes a tool trustworthy. People can work with “last checked three weeks ago.” They cannot work with confidence that has no source.</p>
        <p>A good map does not only help us move through a place. It changes what we notice while we are there.</p>
      </>
    ),
  },
  {
    slug: 'the-quiet-discipline-of-noticing',
    type: 'Notebook',
    title: 'The quiet discipline of noticing',
    dek: 'A small case for keeping a notebook when everything is already searchable.',
    date: '28 Aug 2023',
    read: '4 min read',
    body: (
      <>
        <p>Search is good at returning what we ask for. A notebook is good at preserving what we did not know to ask.</p>
        <p>Mine is a mixture of interface fragments, anatomy diagrams, overheard phrases, and questions with no immediate use. That lack of sorting is part of the point. It gives observations a place to remain unfinished.</p>
        <h2>Memory needs a surface</h2>
        <p>Writing something down is a tiny act of respect for future attention. It says: this detail may matter later, even if I cannot yet explain why.</p>
      </>
    ),
  },
];

const navItems = [
  { href: '/', label: 'Home', index: '00' },
  { href: '/projects', label: 'Projects', index: '01' },
  { href: '/essays', label: 'Essays', index: '02' },
  { href: '/gallery', label: 'Gallery', index: '03' },
  { href: '/about', label: 'About', index: '04' },
];

function Mark() {
  return (
    <div>
      <div className="rail-mark">
        <span className="mark-block">MY</span>
        <span className="mark-name">Muhammadaziz</span>
      </div>
      <div className="mark-caption">software · medicine</div>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('EN');
  const [commandOpen, setCommandOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const labels = languageLabels[language];
  const isActive = (href: string) => href === '/' ? location === '/' : location.startsWith(href);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    setMenuOpen(false);
  }, [location]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <SignInContext.Provider value={() => setSignInOpen(true)}>
      <div className="site-shell">
      <aside className="desktop-rail" aria-label="Primary navigation">
        <Link href="/" className="rail-mark" data-testid="link-brand">
          <Mark />
        </Link>
        <nav className="rail-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`rail-link ${isActive(item.href) ? 'active' : ''}`} data-testid={`link-nav-${item.label.toLowerCase()}`}>
              <span>{labels[item.label.toLowerCase()] ?? item.label}</span><span className="rail-index">{item.index}</span>
            </Link>
          ))}
        </nav>
        <div className="rail-bottom">
          <div className="availability"><span className="availability-dot" /> Open to thoughtful work</div>
          <div className="rail-social">
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" data-testid="link-github"><Github size={15} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" data-testid="link-linkedin"><Linkedin size={15} /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" data-testid="link-instagram"><Instagram size={15} /></a>
          </div>
          <div className="rail-caption mark-caption">Tashkent, Uzbekistan<br />© 2024—25</div>
        </div>
      </aside>

      <header className="mobile-header">
        <Link href="/" className="rail-mark" data-testid="link-mobile-brand"><Mark /></Link>
        <button type="button" className="button-quiet" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation" data-testid="button-toggle-menu">
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
        {menuOpen && (
          <nav className="mobile-menu">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`mobile-nav-link ${isActive(item.href) ? 'active' : ''}`} data-testid={`link-mobile-nav-${item.label.toLowerCase()}`}>
                <span>{labels[item.label.toLowerCase()] ?? item.label}</span><span className="rail-index">{item.index}</span>
              </Link>
            ))}
          </nav>
        )}
      </header>

      <div className="top-tools">
        <button type="button" className="tool-button" onClick={() => setCommandOpen(true)} data-testid="button-open-command-palette"><Command size={14} /><span>Search</span><kbd>⌘K</kbd></button>
        <LanguageSwitcher language={language} onChange={setLanguage} />
        <button type="button" className="tool-button" onClick={() => setSignInOpen(true)} data-testid="button-open-sign-in"><LockKeyhole size={13} /><span>Sign in</span></button>
      </div>
      <main className="main-content">{children}</main>
      <SiteFooter />
      {commandOpen && <CommandPalette onClose={() => setCommandOpen(false)} />}
      {signInOpen && <AuthDialog onClose={() => setSignInOpen(false)} />}
      </div>
      </SignInContext.Provider>
    </LanguageContext.Provider>
  );
}

function LanguageSwitcher({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  const [open, setOpen] = useState(false);
  return <div style={{ position: 'relative' }}>
    <button type="button" className="tool-button" onClick={() => setOpen((value) => !value)} aria-label="Choose language" data-testid="button-language-switcher">{language}</button>
    {open && <div className="language-menu" role="menu">{(['EN', 'UZ', 'TR'] as Language[]).map((item) => <button type="button" role="menuitem" className={`language-option ${language === item ? 'active' : ''}`} key={item} onClick={() => { onChange(item); setOpen(false); }} data-testid={`button-language-${item.toLowerCase()}`}>{item} · {item === 'EN' ? 'English' : item === 'UZ' ? 'O‘zbekcha' : 'Türkçe'}</button>)}</div>}
  </div>;
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const search = query.trim().toLowerCase();
  const results = useMemo(() => {
    const navResults = navItems.map((item) => ({ id: item.href, label: item.label, detail: `Go to ${item.label}`, href: item.href, kind: 'Navigation' }));
    const projectResults = projects.map((item) => ({ id: item.slug, label: item.name, detail: item.summary, href: `/projects/${item.slug}`, kind: 'Project' }));
    const essayResults = essays.map((item) => ({ id: item.slug, label: item.title, detail: item.dek, href: `/essays/${item.slug}`, kind: 'Essay' }));
    const galleryResults = artPieces.map((item) => ({ id: item.id, label: item.title, detail: item.note, href: '/gallery', kind: 'Gallery' }));
    return [...navResults, ...projectResults, ...essayResults, ...galleryResults].filter((item) => !search || `${item.label} ${item.detail} ${item.kind}`.toLowerCase().includes(search));
  }, [search]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);
  const choose = (href: string) => {
    setLocation(href);
    onClose();
  };
  return <div className="command-backdrop" role="presentation" onClick={onClose}>
    <motion.div className="command-panel" role="dialog" aria-modal="true" aria-label="Command palette" initial={{ opacity: 0, y: -9 }} animate={{ opacity: 1, y: 0 }} onClick={(event) => event.stopPropagation()}>
      <div className="command-search"><Search size={17} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, essays, gallery..." aria-label="Search portfolio" data-testid="input-command-search" /><kbd>ESC</kbd></div>
      {results.length ? <><div className="command-section-label">{search ? 'Matches' : 'Navigate'}</div>{results.map((item) => <button type="button" className="command-result" key={`${item.kind}-${item.id}`} onClick={() => choose(item.href)} data-testid={`button-command-${item.kind.toLowerCase()}-${item.id}`}><Search size={14} /><span>{item.label}</span><small>{item.kind}</small></button>)}</> : <div className="command-empty">No results in this archive. Try a project name or a quieter phrase.</div>}
      <div className="command-hint">Tip: press <strong>Ctrl K</strong> or <strong>⌘ K</strong> from anywhere to open search.</div>
    </motion.div>
  </div>;
}

function AuthDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);
  const submitMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    try {
      await postMagicLink(email);
      setStatus('If an account exists, a magic link is on its way.');
    } catch {
      setStatus('Sign-in service is unavailable. Please try again shortly.');
    } finally {
      setPending(false);
    }
  };
  const google = async () => {
    setPending(true);
    try {
      const response = await postGoogleAuth();
      if (response.url) window.location.assign(response.url);
      else setStatus('Google sign-in is ready when the provider is connected.');
    } catch {
      setStatus('Google sign-in is unavailable right now.');
    } finally {
      setPending(false);
    }
  };
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><motion.div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} onClick={(event) => event.stopPropagation()}>
    <button type="button" className="close-modal" onClick={onClose} aria-label="Close sign in" data-testid="button-close-sign-in"><X size={18} /></button>
    <div className="eyebrow">Private access</div><h2 id="auth-title" className="serif">Keep your place.</h2><p>Sign in to like work, save notes, and return to the parts of this archive that matter to you.</p>
    <div className="auth-actions"><button type="button" className="button-quiet" onClick={google} disabled={pending} data-testid="button-sign-in-google"><ExternalLink size={14} /> Continue with Google</button><form className="auth-email" onSubmit={submitMagicLink}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-label="Email for magic link" required data-testid="input-magic-link-email" /><button type="submit" className="button-primary" disabled={pending} data-testid="button-send-magic-link">{pending ? 'Sending' : 'Email link'}</button></form></div>
    {status && <div className="auth-note" data-testid="status-auth">{status}</div>}
  </motion.div></div>;
}

function SiteFooter() {
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => {
    await navigator.clipboard?.writeText('hello@muhammadaziz.dev');
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <footer className="footer">
      <div className="page-wrap footer-grid">
        <div>
          <p className="footer-copy">A personal archive of software,<br />medicine, and things noticed.</p>
          <div className="footer-signoff">Designed and built by Muhammadaziz Yursinaliyev</div>
        </div>
        <div>
          <div className="footer-links">
            <Link href="/projects" data-testid="link-footer-projects">Projects</Link>
            <Link href="/essays" data-testid="link-footer-essays">Essays</Link>
            <Link href="/gallery" data-testid="link-footer-gallery">Gallery</Link>
            <Link href="/about" data-testid="link-footer-about">About</Link>
            <a href="mailto:hello@muhammadaziz.dev" data-testid="link-footer-email">Email</a>
          </div>
          <button type="button" className="text-link" style={{ marginTop: 20, background: 'none', border: 0, padding: 0, cursor: 'pointer' }} onClick={copyEmail} data-testid="button-copy-email">
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied to clipboard' : 'Copy email address'}
          </button>
        </div>
      </div>
    </footer>
  );
}

function PageFrame({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location} className="page-enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function Home() {
  return (
    <PageFrame>
      <section className="hero">
        <div className="page-wrap hero-grid">
          <motion.div className="hero-copy" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1, duration: .6 }}>
            <div className="eyebrow">Independent builder / 2024—25</div>
            <h1 className="display-title">Muhammadaziz Yursinaliyev — <span className="serif">At the intersection of Software Engineering and Medicine.</span></h1>
            <p className="body-lede">Building impactful software and preparing for a future in surgery.</p>
            <div className="hero-actions">
              <Link href="/projects" className="button-primary" data-testid="link-hero-projects">See selected work <ArrowRight size={15} /></Link>
              <a href="#contact" className="button-quiet" data-testid="link-hero-contact">Start a conversation <ArrowDownRight size={15} /></a>
            </div>
            <div className="hero-note"><span>+</span> Currently learning: anatomy, systems design, and the patience between them.</div>
          </motion.div>
          <motion.div className="hero-visual" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .25, duration: .75 }}>
            <div className="diagram-card">
              <div className="mono">FIELD NOTE / 004</div>
              <div className="diagram-title serif">Build<br /><em>with care.</em></div>
              <div className="diagram-line" />
              <div className="diagram-foot">A working principle for interfaces, incisions, and everything that asks to be handled well.</div>
              <div className="diagram-orbit" />
            </div>
            <div className="hero-corner" />
          </motion.div>
        </div>
      </section>

      <section className="home-projects section-rule">
        <div className="page-wrap">
          <div className="section-head">
            <div><div className="eyebrow">Selected work</div><h2 className="section-title serif">Small systems,<br /><em>real people.</em></h2></div>
            <p className="section-intro">A few projects where product thinking, engineering, and a respect for the user meet in the middle.</p>
          </div>
          {projects.slice(0, 2).map((project) => <ProjectPreview key={project.slug} project={project} />)}
          <div style={{ marginTop: 31 }}><Link href="/projects" className="text-link" data-testid="link-home-all-projects">View all projects <ArrowRight size={15} /></Link></div>
        </div>
      </section>

      <section className="statement">
        <div className="page-wrap">
          <div className="eyebrow" style={{ color: '#bdd5ff' }}>A note to self</div>
          <h2>There is no shortcut around <span className="serif">paying attention.</span></h2>
          <p>The codebase, the patient, the person on the other side of the screen — each deserves a careful first look and a better second one.</p>
          <Link href="/about" className="button-quiet" data-testid="link-home-about">More about the journey <ArrowRight size={15} /></Link>
        </div>
      </section>

      <section className="page-section" id="field-notes">
        <div className="page-wrap">
          <div className="section-head">
            <div><div className="eyebrow">Latest thinking</div><h2 className="section-title serif">From the<br /><em>notebook.</em></h2></div>
            <p className="section-intro">Notes on making, learning, and the quiet overlap between digital tools and physical practice.</p>
          </div>
          <div className="essay-grid">
            {essays.slice(0, 2).map((essay) => <EssayCard essay={essay} key={essay.slug} />)}
          </div>
          <Link href="/essays" className="text-link" style={{ marginTop: 15 }} data-testid="link-home-all-essays">Read the archive <ArrowRight size={15} /></Link>
        </div>
      </section>

      <Contact />
    </PageFrame>
  );
}

function ProjectPreview({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="project-preview" data-testid={`link-project-preview-${project.slug}`}>
      <div className="project-preview-main">
        <div className="project-preview-meta"><span>{project.number} / {project.role}</span><span>{project.year}</span></div>
        <h3 className="serif">{project.name}</h3>
        <p>{project.summary}</p>
      </div>
      <div className="project-preview-side">
        <div className="side-stat">Outcome<strong>{project.result}</strong></div>
        <div className="project-arrow"><MoveUpRight size={19} /></div>
      </div>
    </Link>
  );
}

function Contact() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim()) setSubmitted(true);
  };
  return (
    <section className="contact-section" id="contact">
      <div className="page-wrap contact-grid">
        <div><div className="eyebrow">Keep in touch</div><h2 className="serif">Have a good<br /><em>question?</em></h2><p>I am always interested in thoughtful problems, kind collaborators, and conversations that begin somewhere unexpected.</p></div>
        <div>
          <form className="contact-form" onSubmit={submit}>
            <input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setSubmitted(false); }} placeholder="Your email address" aria-label="Your email address" required data-testid="input-contact-email" />
            <button type="submit" data-testid="button-contact-submit">Say hello <ArrowRight size={14} /></button>
          </form>
          {submitted && <div className="form-success" data-testid="status-contact-success">Thank you — I will write back soon.</div>}
        </div>
      </div>
    </section>
  );
}

function InnerHero({ eyebrow, title, intro, children }: { eyebrow: string; title: ReactNode; intro: string; children?: ReactNode }) {
  return <section className="inner-hero"><div className="page-wrap"><div className="eyebrow">{eyebrow}</div><h1 className="display-title">{title}</h1><p className="body-lede">{intro}</p>{children}</div></section>;
}

function ProjectsPage() {
  const [filter, setFilter] = useState('All work');
  const filters = ['All work', 'Product', 'Research', 'Prototype'];
  const filtered = projects.filter((project) => filter === 'All work' || (filter === 'Product' && project.tags.includes('Product design')) || (filter === 'Research' && project.tags.includes('Research')) || (filter === 'Prototype' && project.tags.includes('Prototype')));
  return (
    <PageFrame>
      <InnerHero eyebrow="01 / Selected projects" title={<>Work with a point<br /><span className="serif">of view.</span></>} intro="Case studies from the overlap: products that make information easier to hold, systems that respect uncertainty, and prototypes built to learn in public.">
        <div className="filter-row">{filters.map((item) => <button type="button" key={item} className={`filter-button ${filter === item ? 'active' : ''}`} onClick={() => setFilter(item)} data-testid={`button-filter-${item.toLowerCase().replace(' ', '-')}`}>{item}</button>)}</div>
      </InnerHero>
      <section className="case-list page-wrap">
        {filtered.map((project) => <CaseCard project={project} key={project.slug} />)}
        {filtered.length === 0 && <div className="essay-empty">No work in this chapter yet. Try another filter.</div>}
      </section>
    </PageFrame>
  );
}

function CaseCard({ project }: { project: Project }) {
  return <Link href={`/projects/${project.slug}`} className="case-card" data-testid={`link-case-${project.slug}`}>
    <div className="case-number">{project.number}</div>
    <div><h2 className="serif">{project.name}</h2><p>{project.summary}</p><div className="case-tags">{project.tags.map((tag) => <span key={tag} className="case-tag">{tag}</span>)}</div></div>
    <div className="case-result"><strong>{project.result}</strong>{project.year}<br />{project.role}<div style={{ color: 'var(--blue)', marginTop: 20 }}><ArrowRight size={17} /></div></div>
  </Link>;
}

function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const project = projects.find((item) => item.slug === slug);
  if (!project) return <NotFound />;
  return (
    <PageFrame>
      <section className="detail-hero"><div className="content-wrap"><Link href="/projects" className="text-link" data-testid="link-back-projects"><ArrowLeft size={15} /> All projects</Link><div className="eyebrow" style={{ marginTop: 43 }}>{project.number} / Case study</div><h1 className="serif">{project.name}</h1><div className="detail-meta"><span>{project.year}</span><span>{project.role}</span><span>{project.tags.join(' · ')}</span></div></div></section>
      <section className="detail-layout content-wrap">
        <article className="detail-article"><p style={{ fontSize: 24, lineHeight: 1.38, color: 'var(--ink)' }}>{project.summary}</p><p>{project.detail}</p><h2>The question</h2><p>How might this become useful without becoming another demanding layer in someone’s day? I started with conversations, rough flows, and a bias toward showing the work early.</p><h2>What I made</h2><p>The system is intentionally modest: clear entry points, generous empty space, and a language that explains itself. Underneath, the engineering is modular enough to grow without asking the interface to carry every new possibility at once.</p><ul><li>Mapped the smallest useful version before adding features.</li><li>Made uncertainty visible rather than hiding it in the data model.</li><li>Tested the experience with real tasks, not just happy paths.</li></ul><h2>What stayed with me</h2><p>Good work is not always the work with the most surface area. Sometimes it is the thing that gives a person back a little time, confidence, or curiosity.</p></article>
        <aside className="detail-aside"><section><h3>Role</h3><p>{project.role}</p></section><section><h3>Stack / practice</h3><p>{project.tags.join(' · ')}</p></section><section><h3>Next step</h3><p>Keep listening to the people who use it.</p></section></aside>
      </section>
    </PageFrame>
  );
}

function EssayCard({ essay }: { essay: Essay }) {
  return <Link href={`/essays/${essay.slug}`} className="essay-card" data-testid={`link-essay-${essay.slug}`}><div className="essay-type">{essay.type}</div><h2 className="serif">{essay.title}</h2><p>{essay.dek}</p><footer><span>{essay.date}</span><span>{essay.read}</span></footer></Link>;
}

function EssaysPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All notes');
  const types = ['All notes', 'On making', 'Field notes', 'On place', 'Notebook'];
  const filtered = useMemo(() => essays.filter((essay) => (type === 'All notes' || essay.type === type) && `${essay.title} ${essay.dek}`.toLowerCase().includes(query.toLowerCase())), [query, type]);
  return (
    <PageFrame>
      <InnerHero eyebrow="02 / The essay archive" title={<>Thoughts in<br /><span className="serif">progress.</span></>} intro="Notes on software, medicine, attention, and the things that become clearer when they are written down. No finished opinions required.">
        <div className="filter-row">{types.map((item) => <button type="button" key={item} className={`filter-button ${type === item ? 'active' : ''}`} onClick={() => setType(item)} data-testid={`button-essay-filter-${item.toLowerCase().replace(' ', '-')}`}>{item}</button>)}</div>
      </InnerHero>
      <section className="essay-index page-wrap">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 30 }}><label style={{ width: 'min(100%, 290px)' }}><span className="sr-only">Search essays</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the notebook" style={{ width: '100%', border: 0, borderBottom: '1px solid var(--line)', background: 'transparent', padding: '10px 0', outline: 0, font: '12px var(--app-font-mono)', color: 'var(--ink)' }} data-testid="input-search-essays" /></label></div>
        <div className="essay-grid">{filtered.map((essay) => <EssayCard essay={essay} key={essay.slug} />)}</div>
        {filtered.length === 0 && <div className="essay-empty" data-testid="empty-essays">Nothing matched that search. Try a quieter phrase.</div>}
      </section>
    </PageFrame>
  );
}

function EssayDetail() {
  const { slug } = useParams<{ slug: string }>();
  const essay = essays.find((item) => item.slug === slug);
  if (!essay) return <NotFound />;
  return <PageFrame><article className="reading content-wrap"><header className="reading-head"><Link href="/essays" className="text-link" data-testid="link-back-essays"><ArrowLeft size={15} /> Essay archive</Link><div className="eyebrow" style={{ marginTop: 48 }}>{essay.type}</div><h1 className="serif">{essay.title}</h1><p className="reading-dek">{essay.dek}</p><div className="reading-byline"><span>Muhammadaziz Yursinaliyev</span><span>{essay.date}</span><span>{essay.read}</span></div></header><div className="reading-body">{essay.body}</div></article></PageFrame>;
}

type ArtPiece = { id: string; title: string; note: string; className: string; category: string };
const artPieces: ArtPiece[] = [
  { id: 'anatomy-01', title: 'A study of form', note: 'Graphite / anatomy', className: 'art-1', category: 'Anatomy' },
  { id: 'orbit-02', title: 'Orbit / 01', note: 'Ink / systems', className: 'art-2', category: 'Digital' },
  { id: 'heart-03', title: 'The generous heart', note: 'Pencil / anatomy', className: 'art-3', category: 'Anatomy' },
  { id: 'loop-04', title: 'A useful loop', note: 'Vector / process', className: 'art-4', category: 'Digital' },
  { id: 'structure-05', title: 'Structure study', note: 'Ink / observation', className: 'art-5', category: 'Anatomy' },
  { id: 'field-06', title: 'Field notes / 07', note: 'Digital / Tashkent', className: 'art-6', category: 'Digital' },
];

function GalleryPage() {
  const [category, setCategory] = useState('All work');
  const [selected, setSelected] = useState<ArtPiece | null>(null);
  const filtered = artPieces.filter((piece) => category === 'All work' || piece.category === category);
  return (
    <PageFrame>
      <InnerHero eyebrow="03 / Visual archive" title={<>Things I make<br /><span className="serif">to understand.</span></>} intro="A small collection of digital experiments and hand-drawn studies. Some are resolved. Most are useful because they are not.">
        <div className="filter-row">{['All work', 'Digital', 'Anatomy'].map((item) => <button type="button" key={item} className={`filter-button ${category === item ? 'active' : ''}`} onClick={() => setCategory(item)} data-testid={`button-gallery-filter-${item.toLowerCase().replace(' ', '-')}`}>{item}</button>)}</div>
      </InnerHero>
      <section className="gallery-grid page-wrap">
        {filtered.map((piece) => <button type="button" className={`art-card ${piece.className}`} key={piece.id} onClick={() => setSelected(piece)} aria-label={`Open ${piece.title}`} data-testid={`button-art-${piece.id}`}><div className="art-label">{piece.title} <span>— {piece.note}</span></div></button>)}
      </section>
      {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><div className="art-modal" role="dialog" aria-modal="true" aria-labelledby="art-modal-title" onClick={(event) => event.stopPropagation()}><button type="button" className="close-modal" onClick={() => setSelected(null)} aria-label="Close artwork" data-testid="button-close-art"><X size={18} /></button><div className="eyebrow">{selected.category} / archive</div><h2 id="art-modal-title" className="serif">{selected.title}</h2><p>{selected.note}. This piece is part of an ongoing practice of looking carefully: drawing a shape until its relationships become easier to remember.</p></div></div>}
    </PageFrame>
  );
}

function AboutPage() {
  const skills = ['React', 'TypeScript', 'Node.js', 'Product thinking', 'UX writing', 'Research', 'Anatomy study', 'Systems'];
  return (
    <PageFrame>
      <InnerHero eyebrow="04 / About" title={<>A builder with<br /><span className="serif">two toolkits.</span></>} intro="I am Muhammadaziz — a software engineer in Tashkent, studying toward a future in surgery. I care about useful systems, clear language, and the discipline of a second look." />
      <section className="page-wrap about-grid">
        <div className="about-copy"><p>I like the point where a complex thing becomes understandable without becoming simplistic. That might mean shaping a product, drawing a structure, or sitting with a problem long enough to see what it is really asking.</p><p>My engineering practice is grounded in making: shipping small, testing with real people, and treating the interface as part of the system — not a coat of paint over it.</p><div className="pull-quote">“The work gets better when the person stays visible.”</div><p>Medicine gives that belief a sharper edge. Preparing for surgery has made me more attentive to sequence, context, and the weight of small decisions. I am still learning how these disciplines will meet. That uncertainty is a good place to work from.</p></div>
        <aside className="about-aside"><section><h3>Tools & practice</h3><div className="skill-list">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section><section><h3>Academic journey</h3><div className="timeline"><div className="timeline-item"><time>2024—present</time><h4>Preparing for a future in surgery</h4><p>Anatomy, clinical foundations, and learning to observe before acting.</p></div><div className="timeline-item"><time>2023</time><h4>Udacity Full Stack Graduate</h4><p>Deepened my foundations in web architecture, APIs, testing, and deployment.</p></div><div className="timeline-item"><time>2021—22</time><h4>Independent software practice</h4><p>Built early products for readers, local communities, and curious friends.</p></div></div></section></aside>
      </section>
      <div className="page-wrap resume-bar"><p><strong>Looking for:</strong> kind collaborators and problems worth a close look.</p><a className="button-primary" href="mailto:hello@muhammadaziz.dev?subject=Hello%20Muhammadaziz" data-testid="link-about-email">Write an email <ExternalLink size={14} /></a></div>
      <Contact />
    </PageFrame>
  );
}

function Router() {
  const [location] = useLocation();
  return <Shell><ErrorBoundary resetKey={location}><Switch><Route path="/" component={Home} /><Route path="/projects" component={ProjectsPage} /><Route path="/projects/:slug" component={ProjectDetail} /><Route path="/essays" component={EssaysPage} /><Route path="/essays/:slug" component={EssayDetail} /><Route path="/gallery" component={GalleryPage} /><Route path="/about" component={AboutPage} /><Route component={NotFound} /></Switch></ErrorBoundary></Shell>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;