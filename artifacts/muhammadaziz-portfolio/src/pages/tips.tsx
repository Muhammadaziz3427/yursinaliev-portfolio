import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles, Tag, Quote } from 'lucide-react';
import { listQuickTips, type QuickTip } from '@/lib/cms-api';

const defaultTips: QuickTip[] = [
  {
    id: '1',
    insight: 'Code should be like medicine: exact, calm, and bound by unwavering ethics. A careless variable mutation is as destructive as a careless incision.',
    category: 'Philosophy'
  },
  {
    id: '2',
    insight: 'Never store JWT or sensitive tokens in browser LocalStorage. Use HttpOnly, Secure, SameSite=Strict cookies or ephemeral in-memory WebCrypto key sessions.',
    category: 'Tech'
  },
  {
    id: '3',
    insight: 'Before cutting into tissue or refactoring a core module: verify the vascular supply and the dependency graph. Irreversible actions demand double verification.',
    category: 'Medicine'
  },
  {
    id: '4',
    insight: 'Minimalism is not emptiness; it is the deliberate elimination of the unnecessary so that the essential may speak clearly.',
    category: 'Life'
  },
  {
    id: '5',
    insight: 'Any optimization outside the primary systemic constraint is an illusion. Locate the bottleneck before accelerating throughput.',
    category: 'Tech'
  }
];

export default function TipsPage() {
  const [tips, setTips] = useState<QuickTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Tech' | 'Life' | 'Medicine' | 'Philosophy'>('All');

  useEffect(() => {
    listQuickTips().then((data) => {
      setTips(data.length > 0 ? data : defaultTips);
      setLoading(false);
    });
  }, []);

  const filtered = tips.filter((t) => (categoryFilter === 'All' ? true : t.category === categoryFilter));

  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono">
          <Lightbulb size={13} />
          <span>Micro-Insights, Mental Models & Epigrams</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-100 font-serif">
          Quick Tips & Epigrams
        </h1>
        <p className="text-slate-400 font-mono text-xs max-w-2xl leading-relaxed">
          Concise mental models, software security heuristics, surgical rules of thumb, and philosophical reminders.
        </p>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 pt-4">
          {(['All', 'Tech', 'Life', 'Medicine', 'Philosophy'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all border ${
                categoryFilter === cat
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat} ({cat === 'All' ? tips.length : tips.filter((t) => t.category === cat).length})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-500">Loading insights...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((tip, idx) => (
            <motion.div
              key={tip.id || idx}
              whileHover={{ y: -3 }}
              className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-[#131B27]/80 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-6 relative group"
            >
              <Quote className="absolute top-6 right-6 text-slate-800 group-hover:text-amber-500/20 transition-colors" size={32} />
              
              <div className="space-y-3 relative z-10">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-amber-500/30 bg-amber-500/10 text-amber-300">
                  {tip.category}
                </span>
                <p className="text-sm sm:text-base text-slate-200 font-sans leading-relaxed pt-2">
                  "{tip.insight}"
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 pt-3 border-t border-slate-800/60">
                <Sparkles size={11} className="text-amber-400" />
                <span>Field Heuristic #{idx + 1}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
