import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, LockKeyhole, Terminal, Code, Tag, ExternalLink } from 'lucide-react';
import { listSecurityNotes, type SecurityNote } from '@/lib/cms-api';

const defaultNotes: SecurityNote[] = [
  {
    id: '1',
    title: 'Zero-Trust Ephemeral Key Derivation Protocol (HKDF)',
    category: 'Concept',
    difficulty: 'Advanced',
    content: 'Standard bearer tokens residing in LocalStorage or sessionStorage are constantly vulnerable to Cross-Site Scripting (XSS) extraction. By utilizing client-side Web Crypto API with HMAC-based Key Derivation (HKDF) and ephemeral elliptic curve Diffie-Hellman keys, session state cannot be exfiltrated via simple DOM scraping.',
    tags: ['Cryptography', 'Zero-Trust', 'WebCrypto', 'ECDH'],
    code_snippets: `// Client-side ephemeral key derivation
const keyPair = await window.crypto.subtle.generateKey(
  { name: "ECDH", namedCurve: "P-256" },
  false,
  ["deriveKey", "deriveBits"]
);

const sharedSecret = await window.crypto.subtle.deriveKey(
  { name: "ECDH", public: serverPublicKey },
  keyPair.privateKey,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt", "decrypt"]
);`,
    references: [
      'RFC 5869: HMAC-based Extract-and-Expand Key Derivation Function (HKDF)',
      'NIST SP 800-207: Zero Trust Architecture'
    ]
  },
  {
    id: '2',
    title: 'Strict Row-Level Security (RLS) Multi-Tenant Hardening in PostgreSQL',
    category: 'Best Practice',
    difficulty: 'Intermediate',
    content: 'Relying on application-layer `WHERE user_id = :id` queries inevitably leads to Broken Object Level Authorization (BOLA/IDOR). Enforcing database-native Row-Level Security policies with `auth.uid()` and strict `SECURITY DEFINER` function scopes guarantees zero-leakage regardless of frontend bugs.',
    tags: ['PostgreSQL', 'RLS', 'Supabase', 'IDOR-Prevention'],
    code_snippets: `-- Enforce RLS on user profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_owner_access" ON public.profiles
FOR ALL USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());`,
    references: [
      'OWASP Top 10 API Security - API1:2023 Broken Object Level Authorization'
    ]
  },
  {
    id: '3',
    title: 'Cross-Site Scripting (XSS) Defensive Matrix & CSP Nonces',
    category: 'Vulnerability',
    difficulty: 'Beginner',
    content: 'Modern reactive frameworks minimize raw HTML injection, but `dangerouslySetInnerHTML`, SVG uploads, and unescaped markdown parsers can still introduce script execution. A hardened Content-Security-Policy (CSP) with strict nonce validation blocks inline script execution even when markup injection occurs.',
    tags: ['XSS', 'CSP', 'Browser-Security', 'Sanitization'],
    code_snippets: `Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'nonce-rAnd0m123' 'strict-dynamic';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  frame-ancestors 'none';
  object-src 'none';`,
    references: [
      'Mozilla Web Security Guidelines: Content Security Policy'
    ]
  }
];

export default function SecurityPage() {
  const [notes, setNotes] = useState<SecurityNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');

  useEffect(() => {
    listSecurityNotes().then((data) => {
      setNotes(data.length > 0 ? data : defaultNotes);
      setLoading(false);
    });
  }, []);

  const filtered = notes.filter((n) => (difficultyFilter === 'All' ? true : n.difficulty === difficultyFilter));

  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
          <Shield size={13} />
          <span>Offensive & Defensive Cybersecurity Notebook</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-100 font-serif">
          Security Notes & Architecture
        </h1>
        <p className="text-slate-400 font-mono text-xs max-w-2xl leading-relaxed">
          Field notes on cryptographic protocols, vulnerability mitigation, zero-trust infrastructure, and low-level software hardening.
        </p>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 pt-4">
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all border ${
                difficultyFilter === diff
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold shadow-[0_0_15px_rgba(0,245,160,0.15)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {diff} ({diff === 'All' ? notes.length : notes.filter((n) => n.difficulty === diff).length})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-500">Decrypting security notes...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filtered.map((note) => (
            <motion.div
              key={note.id || note.title}
              whileHover={{ y: -2 }}
              className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-[#131B27]/80 hover:border-emerald-500/40 transition-all space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                      {note.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                        note.difficulty === 'Advanced'
                          ? 'border-red-500/30 bg-red-500/10 text-red-300'
                          : note.difficulty === 'Intermediate'
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      }`}
                    >
                      {note.difficulty}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
                    {note.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                {note.content}
              </p>

              {note.code_snippets && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                    <Code size={13} className="text-emerald-400" />
                    <span>Implementation Code</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                    <code>{note.code_snippets}</code>
                  </pre>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
                <div className="flex flex-wrap gap-1.5">
                  {note.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-1"
                    >
                      <Tag size={10} className="text-emerald-400" />
                      {tag}
                    </span>
                  ))}
                </div>

                {note.references && note.references.length > 0 && (
                  <div className="text-[11px] font-mono text-slate-500">
                    Ref: {note.references[0]}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
