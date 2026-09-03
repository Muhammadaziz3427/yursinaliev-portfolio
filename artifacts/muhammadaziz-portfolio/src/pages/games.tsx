import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Star, Trophy, Clock, Heart } from 'lucide-react';
import { listGames, type Game } from '@/lib/cms-api';

const defaultGames: Game[] = [
  {
    id: '1',
    name: 'Dota 2',
    type: 'Video Game',
    description: 'A 5v5 competitive strategy game demanding microsecond reflexes, macro-economic positioning, and real-time team synchronization under severe psychological pressure.',
    playtime: '4+ Years · 1,500+ Hours',
    rating: 5,
    why_i_like: 'Mastering Dota 2 is equivalent to managing high-stakes distributed system operations: split-second triage, strategic resource allocation, and zero-sum vision control.',
    achievements: [
      'Divine Rank Achieved',
      'Captain & Shot-Caller in collegiate tournaments',
      'Deep mechanical mastery of invoker and micro-control heroes'
    ],
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80'
  },
  {
    id: '2',
    name: 'Chess (1800+ ELO)',
    type: 'Board Game',
    description: 'Pure deterministic information theory and calculation. Relentless tactical pattern matching and deep prophylactic positional play.',
    playtime: 'Lifelong Hobby',
    rating: 5,
    why_i_like: 'Teaches cold discipline, the cost of premature offensive moves, and the essential concept of zugzwang: where every available move degrades your position.',
    achievements: [
      '1800+ Rapid Rating on Chess.com',
      'Caro-Kann Defense and Catalan Opening specialist',
      'Tactical puzzle streak: 45 consecutive puzzles'
    ],
    image_url: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80'
  },
  {
    id: '3',
    name: 'CyberSec CTFs (Capture The Flag)',
    type: 'Hobby',
    description: 'Competitive vulnerability exploitation, binary reverse engineering, web application security penetration testing, and cryptographic puzzles.',
    playtime: '300+ CTF challenges solved',
    rating: 5,
    why_i_like: 'Forces you to think like an adversarial threat actor to design unbreachable zero-trust defensive perimeters.',
    achievements: [
      'Top 5% in national university cybersecurity challenges',
      'Authored custom heap exploitation writeups',
      'Built automated fuzzing scripts in Python and Rust'
    ],
    image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80'
  }
];

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listGames().then((data) => {
      setGames(data.length > 0 ? data : defaultGames);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400 text-xs font-mono">
          <Gamepad2 size={13} />
          <span>Strategic Hobbies, Games & Mental Disciplines</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-100 font-serif">
          Games & Interests
        </h1>
        <p className="text-slate-400 font-mono text-xs max-w-2xl leading-relaxed">
          Analytical recreation, strategic video games, competitive board games, and adversarial challenges that sharpen tactical decision-making.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-500">Loading games & interests...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <motion.div
              key={game.id || game.name}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl border border-slate-800 bg-[#131B27]/80 hover:border-pink-500/40 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-pink-500/30 bg-pink-500/10 text-pink-300">
                      {game.type}
                    </span>
                    <h3 className="text-xl font-bold text-slate-100 font-serif mt-2">
                      {game.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: game.rating || 5 }).map((_, i) => (
                      <Star key={i} size={11} className="fill-amber-400" />
                    ))}
                  </div>
                </div>

                {game.playtime && (
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                    <Clock size={12} className="text-pink-400" />
                    <span>{game.playtime}</span>
                  </div>
                )}

                {game.description && (
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {game.description}
                  </p>
                )}

                {game.why_i_like && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono text-pink-400 uppercase flex items-center gap-1">
                      <Heart size={10} className="fill-pink-400" /> Why It Matters
                    </div>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed">
                      {game.why_i_like}
                    </p>
                  </div>
                )}

                {game.achievements && game.achievements.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                    <div className="text-[10px] font-mono text-emerald-400 uppercase flex items-center gap-1">
                      <Trophy size={10} /> Milestones & Highlights
                    </div>
                    <ul className="space-y-1 text-[11px] font-mono text-slate-400">
                      {game.achievements.map((ach, aIdx) => (
                        <li key={aIdx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-400" />
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
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
