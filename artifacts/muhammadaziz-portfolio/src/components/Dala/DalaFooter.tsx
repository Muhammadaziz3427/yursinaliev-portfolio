import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Send, ArrowUpRight } from 'lucide-react';
import { Link } from 'wouter';
import type { SiteConfig } from '@/lib/cms-api';

interface DalaFooterProps {
  siteConfig: SiteConfig;
}

const footerNav = [
  { label: 'Projects', href: '/projects' },
  { label: 'Essays', href: '/essays' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Books', href: '/books' },
  { label: 'About', href: '/about' },
];

const footerExplore = [
  { label: 'Travel', href: '/travel' },
  { label: 'Games', href: '/games' },
  { label: 'Security', href: '/security' },
  { label: 'Medical', href: '/medical' },
  { label: 'Quick Tips', href: '/tips' },
];

export function DalaFooter({ siteConfig }: DalaFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-32 border-t border-white/[0.06]">
      {/* Top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[1px] bg-gradient-to-r from-transparent via-[#8052ff]/50 to-transparent" />

      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 pt-20 pb-12">
        {/* Main Footer Grid — two-column asymmetric on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
          {/* Left: Brand + Statement */}
          <div className="md:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Logo */}
              <div className="flex items-center gap-3 mb-6">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <path d="M14 2L26 24H2L14 2Z" stroke="#8052ff" strokeWidth="2" fill="none" />
                </svg>
                <span className="text-white text-sm font-semibold tracking-wide">
                  {siteConfig.name || 'Muhammadaziz Yursinaliyev'}
                </span>
              </div>

              <p className="font-body-ultralight text-[#9a9a9a] max-w-sm leading-relaxed">
                {siteConfig.bio || 'Building at the intersection of medicine and technology. Exploring surgery, cybersecurity, and everything in between.'}
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-5 mt-8">
                {siteConfig.github_url && (
                  <a
                    href={siteConfig.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#9a9a9a] hover:text-[#8052ff] transition-colors duration-300"
                    aria-label="GitHub"
                  >
                    <Github size={18} />
                  </a>
                )}
                {siteConfig.linkedin_url && (
                  <a
                    href={siteConfig.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#9a9a9a] hover:text-[#8052ff] transition-colors duration-300"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={18} />
                  </a>
                )}
                {siteConfig.twitter_url && (
                  <a
                    href={siteConfig.twitter_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#9a9a9a] hover:text-[#8052ff] transition-colors duration-300"
                    aria-label="Twitter"
                  >
                    <Twitter size={18} />
                  </a>
                )}
                {siteConfig.telegram_url && (
                  <a
                    href={siteConfig.telegram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#9a9a9a] hover:text-[#8052ff] transition-colors duration-300"
                    aria-label="Telegram"
                  >
                    <Send size={18} />
                  </a>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right: Navigation columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <h4 className="font-caption-amber text-xs">Navigate</h4>
              {footerNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-[#9a9a9a] text-sm font-light hover:text-white transition-colors duration-300 group"
                >
                  <span className="flex items-center gap-1">
                    {item.label}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8052ff]" />
                  </span>
                </Link>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h4 className="font-caption-amber text-xs">Explore</h4>
              {footerExplore.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-[#9a9a9a] text-sm font-light hover:text-white transition-colors duration-300 group"
                >
                  <span className="flex items-center gap-1">
                    {item.label}
                    <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8052ff]" />
                  </span>
                </Link>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-4"
            >
              <h4 className="font-caption-amber text-xs">Connect</h4>
              {siteConfig.email && (
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="block text-[#9a9a9a] text-sm font-light hover:text-white transition-colors duration-300"
                >
                  {siteConfig.email}
                </a>
              )}
              <Link
                href="/admin"
                className="block text-[#8052ff] text-sm font-semibold hover:text-white transition-colors duration-300"
              >
                CMS Admin →
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#9a9a9a] text-xs font-light tracking-wide">
            © {currentYear} {siteConfig.name || 'Muhammadaziz Yursinaliyev'}. All rights reserved.
          </p>
          <p className="text-[#9a9a9a]/40 text-[10px] font-light tracking-widest uppercase">
            Constellation on Black Velvet
          </p>
        </div>
      </div>
    </footer>
  );
}
