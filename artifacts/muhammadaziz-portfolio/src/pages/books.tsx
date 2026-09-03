import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Star, ExternalLink, Bookmark, CheckCircle, Clock } from 'lucide-react';
import { listBooks, type Book } from '@/lib/cms-api';

const defaultBooks: Book[] = [
  {
    id: '1',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    category: 'Philosophy',
    status: 'Completed',
    rating: 5,
    review: 'A profound exploration of cognitive evolution, myth-making capabilities of Homo sapiens, and how shared fictions bind global cooperation.',
    key_takeaways: [
      'The Cognitive Revolution gave humans the unique ability to transmit information about things that do not exist.',
      'Money, nations, and corporations are inter-subjective realities created by shared narratives.',
      'Agricultural Revolution was history’s biggest trap: more population but less varied diet and freedom.'
    ],
    book_link: 'https://www.goodreads.com/book/show/23692271-sapiens',
    cover_image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80'
  },
  {
    id: '2',
    title: 'The Phoenix Project: A Novel about IT & DevOps',
    author: 'Gene Kim, Kevin Behr, George Spafford',
    category: 'Tech',
    status: 'Completed',
    rating: 5,
    review: 'An indispensable guide to systemic constraints, flow of work, feedback loops, and high-reliability systems architecture.',
    key_takeaways: [
      'The Three Ways: Flow of Work, Fast Feedback Loops, and Culture of Continuous Experimentation.',
      'Theory of Constraints: Any improvement made anywhere besides the bottleneck is an illusion.',
      'Unplanned work is the killer of all engineering velocity and operational safety.'
    ],
    book_link: 'https://www.goodreads.com/book/show/17255186-the-phoenix-project',
    cover_image_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=600&q=80'
  },
  {
    id: '3',
    title: 'When Breath Becomes Air',
    author: 'Paul Kalanithi',
    category: 'Medicine',
    status: 'Completed',
    rating: 5,
    review: 'A neurosurgeon facing terminal cancer reflects on the meaning of life, surgical rigor, mortality, and the profound doctor-patient relationship.',
    key_takeaways: [
      'The surgeon’s duty is not merely to stave off death, but to hold patients and families in their arms when mortality arrives.',
      'Technical excellence in surgery must always be accompanied by deep moral clarity and empathy.',
      'Life’s significance is not measured by its length, but by the depth of purpose and relationships cultivated.'
    ],
    book_link: 'https://www.goodreads.com/book/show/25899336-when-breath-becomes-air',
    cover_image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80'
  },
  {
    id: '4',
    title: 'Zero to One: Notes on Startups',
    author: 'Peter Thiel, Blake Masters',
    category: 'Tech',
    status: 'Completed',
    rating: 4,
    review: 'Sharp perspectives on monopoly theory, technological secrets, vertical progress (0 to 1), and building the future.',
    key_takeaways: [
      'Horizontal progress is copying things that work (1 to n); vertical progress is doing something new (0 to 1).',
      'Proprietary technology must be at least 10x better than the closest substitute.',
      'Every great business is built on a secret that is hidden from plain view.'
    ],
    book_link: 'https://www.goodreads.com/book/show/18050143-zero-to-one',
    cover_image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80'
  }
];

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Reading' | 'Completed' | 'Wishlist'>('All');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    listBooks().then((data) => {
      setBooks(data.length > 0 ? data : defaultBooks);
      setLoading(false);
    });
  }, []);

  const filteredBooks = books.filter((b) => (filter === 'All' ? true : b.status === filter));

  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
          <BookOpen size={13} />
          <span>Curated Intellectual Library</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-100 font-serif">
          Bookshelf & Reading Log
        </h1>
        <p className="text-slate-400 font-mono text-xs max-w-2xl leading-relaxed">
          Detailed notes, ratings, and mental models extracted from books across Medicine, Systems Architecture, Cybersecurity, and Philosophy.
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-4">
          {(['All', 'Reading', 'Completed', 'Wishlist'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all border ${
                filter === tab
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(0,245,160,0.15)] font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab} ({tab === 'All' ? books.length : books.filter((b) => b.status === tab).length})
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-500">Scanning bookshelf...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBooks.map((b) => (
            <motion.div
              key={b.id || b.title}
              whileHover={{ y: -3 }}
              onClick={() => setSelectedBook(b)}
              className="p-6 rounded-2xl border border-slate-800 bg-[#131B27]/80 hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                      {b.category || 'General'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition-colors mt-2">
                      {b.title}
                    </h3>
                    <p className="text-xs font-mono text-slate-400">by {b.author}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: b.rating || 5 }).map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-400" />
                    ))}
                  </div>
                </div>

                {b.review && (
                  <p className="text-xs text-slate-300 font-sans leading-relaxed line-clamp-3">
                    {b.review}
                  </p>
                )}

                {b.key_takeaways && b.key_takeaways.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-slate-800/60">
                    <div className="text-[10px] font-mono text-emerald-400 uppercase">Key Takeaway</div>
                    <p className="text-[11px] font-mono text-slate-400 line-clamp-1">
                      → {b.key_takeaways[0]}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/60 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  {b.status === 'Completed' ? (
                    <CheckCircle size={13} className="text-emerald-400" />
                  ) : b.status === 'Reading' ? (
                    <Clock size={13} className="text-cyan-400" />
                  ) : (
                    <Bookmark size={13} className="text-slate-500" />
                  )}
                  {b.status}
                </span>

                <span className="text-emerald-400 group-hover:underline flex items-center gap-1 text-xs">
                  Read Summary →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setSelectedBook(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-emerald-500/30 bg-[#131B27] p-6 sm:p-8 space-y-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                  {selectedBook.category}
                </span>
                <h2 className="text-2xl font-bold text-slate-100 font-serif mt-2">{selectedBook.title}</h2>
                <p className="text-xs font-mono text-slate-400">Author: {selectedBook.author}</p>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: selectedBook.rating || 5 }).map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400" />
                ))}
              </div>
            </div>

            {selectedBook.review && (
              <div className="space-y-2">
                <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Review & Critical Thoughts</div>
                <p className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  {selectedBook.review}
                </p>
              </div>
            )}

            {selectedBook.key_takeaways && selectedBook.key_takeaways.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Key Architectural & Clinical Takeaways</div>
                <ul className="space-y-2 text-xs font-mono text-slate-300">
                  {selectedBook.key_takeaways.map((k, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                      <span className="text-emerald-400 font-bold">{i + 1}.</span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {selectedBook.book_link ? (
                <a
                  href={selectedBook.book_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:underline"
                >
                  <ExternalLink size={13} /> View on Goodreads / Amazon
                </a>
              ) : <div />}
              <button
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-mono"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
