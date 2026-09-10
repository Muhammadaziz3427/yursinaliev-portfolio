import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Menu, X, Globe } from 'lucide-react';

type Language = 'EN' | 'UZ' | 'TR';

interface DalaNavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  t: (key: string) => string;
}

const navLinks = [
  { href: '/projects', label: 'Manifesto', key: 'projects' },
  { href: '/essays', label: 'Essays', key: 'essays' },
  { href: '/about', label: 'Team', key: 'about' },
  { href: '/gallery', label: 'Gallery', key: 'gallery' },
  { href: '/books', label: 'Library', key: 'books' },
];

export function DalaNavbar({ language, onLanguageChange, t }: DalaNavbarProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (href: string) => (href === '/' ? location === '/' : location.startsWith(href));

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-black/60 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-[1280px] mx-auto flex items-center justify-between px-6 sm:px-10 h-[72px]">
        {/* Logo — triangular glyph + wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-8 h-8 flex items-center justify-center"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2L26 24H2L14 2Z" stroke="#8052ff" strokeWidth="2" fill="none" />
              <path d="M14 8L21 22H7L14 8Z" stroke="#8052ff" strokeWidth="1" strokeOpacity="0.4" fill="none" />
            </svg>
          </motion.div>
          <span className="text-white text-sm font-semibold tracking-wide font-nav-label select-none">
            MY
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`link-ghost transition-all duration-300 relative ${
                isActive(link.href) ? 'text-white' : ''
              }`}
            >
              {t(link.key) || link.label}
              {isActive(link.href) && (
                <motion.div
                  layoutId="dala-nav-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#8052ff] rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right Side: Language + CTA */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-nav-label text-[#9a9a9a] hover:text-white transition-colors"
            >
              <Globe size={14} />
              <span>{language}</span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-32 rounded-xl border border-white/10 bg-black/95 backdrop-blur-xl p-1 shadow-2xl"
                >
                  {(['EN', 'UZ', 'TR'] as Language[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        onLanguageChange(item);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-nav-label rounded-lg transition-all ${
                        language === item
                          ? 'bg-[#8052ff]/20 text-white'
                          : 'text-[#9a9a9a] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item === 'EN' ? 'English' : item === 'UZ' ? "O'zbekcha" : 'Türkçe'}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Electric Iris CTA Pill */}
          <Link
            href="/admin"
            className="btn-electric-iris !py-2.5 !px-5 !text-[12px]"
          >
            CMS Admin
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <Link href="/admin" className="btn-electric-iris !py-2 !px-4 !text-[11px]">
            Admin
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[#9a9a9a] hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-black/95 backdrop-blur-2xl border-t border-white/5 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-3 text-lg font-display tracking-tight transition-colors ${
                      isActive(link.href) ? 'text-white' : 'text-[#9a9a9a]'
                    }`}
                  >
                    {t(link.key) || link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Language */}
              <div className="flex gap-2 pt-4 border-t border-white/5 mt-4">
                {(['EN', 'UZ', 'TR'] as Language[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      onLanguageChange(item);
                      setMobileOpen(false);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-nav-label transition-all ${
                      language === item
                        ? 'bg-[#8052ff] text-white'
                        : 'bg-white/5 text-[#9a9a9a] hover:text-white'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
