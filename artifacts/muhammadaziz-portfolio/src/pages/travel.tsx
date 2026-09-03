import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, MapPin, Calendar, Star, Check } from 'lucide-react';
import { listTravels, type Travel } from '@/lib/cms-api';

const defaultTravels: Travel[] = [
  {
    id: '1',
    trip_title: 'Istanbul: Bridge of Continents & Byzantine Architecture',
    location: 'Istanbul, Turkey',
    country: 'Turkey',
    start_date: '2023-09-15',
    end_date: '2023-09-22',
    description: 'Explored the timeless spatial geometry of Hagia Sophia, Sultanahmet, and the bustling maritime trade routes of the Bosphorus strait.',
    rating: '⭐⭐⭐⭐⭐',
    highlights: 'Bosphorus crossing, Byzantine dome engineering analysis, historic spice bazaars.',
    lessons_learned: [
      'Architecture reflects cultural fault lines and historical synthesis.',
      'Maritime trade networks were the physical precursors to global packet-switching networks.',
      'Surgical precision in ancient stonework mirrors modern fault-tolerant engineering.'
    ],
    photo_urls: [
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
      'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&q=80'
    ]
  },
  {
    id: '2',
    trip_title: 'Samarkand & Bukhara: Silk Road Mathematical Heritage',
    location: 'Samarkand, Uzbekistan',
    country: 'Uzbekistan',
    start_date: '2024-04-10',
    end_date: '2024-04-14',
    description: 'Deep study of Ulugh Beg’s astronomical observatory, complex girih tiling geometry in the Registan, and Ibn Sina’s medical heritage in Bukhara.',
    rating: '⭐⭐⭐⭐⭐',
    highlights: 'Ulugh Beg Sextant, Registan tile symmetries, historic Ark of Bukhara.',
    lessons_learned: [
      'Girih tiles prove medieval Islamic mathematicians mastered quasi-crystalline Penrose tiling 500 years before the West.',
      'Ibn Sina’s Canon of Medicine was the first algorithmic taxonomy of pathophysiology.',
      'Cultural preservation requires modern digital archiving.'
    ],
    photo_urls: [
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80'
    ]
  }
];

export default function TravelPage() {
  const [travels, setTravels] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Travel | null>(null);

  useEffect(() => {
    listTravels().then((data) => {
      setTravels(data.length > 0 ? data : defaultTravels);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono">
          <Compass size={13} />
          <span>Geographical Explorations & Field Studies</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-100 font-serif">
          Travel & Expeditions
        </h1>
        <p className="text-slate-400 font-mono text-xs max-w-2xl leading-relaxed">
          Observations on world architecture, cultural systems, medical traditions, and geographic history.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-500">Loading travel log...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {travels.map((trip, idx) => (
            <motion.div
              key={trip.id || trip.trip_title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-[#131B27]/80 hover:border-cyan-500/40 transition-all space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mb-1">
                    <MapPin size={13} />
                    <span>{trip.location}</span>
                    {trip.country && (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px]">
                        {trip.country}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
                    {trip.trip_title}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-amber-400">{trip.rating}</span>
                  {(trip.start_date || trip.end_date) && (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                      <Calendar size={12} className="text-emerald-400" />
                      <span>{trip.start_date} {trip.end_date ? `— ${trip.end_date}` : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {trip.description && (
                <p className="text-sm text-slate-300 font-sans leading-relaxed">
                  {trip.description}
                </p>
              )}

              {/* Photos Gallery */}
              {trip.photo_urls && trip.photo_urls.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trip.photo_urls.map((photo, pIdx) => (
                    <div
                      key={pIdx}
                      className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 aspect-video relative group cursor-pointer"
                      onClick={() => setSelectedTrip(trip)}
                    >
                      <img
                        src={photo}
                        alt={`${trip.trip_title} - photo ${pIdx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Lessons Learned */}
              {trip.lessons_learned && trip.lessons_learned.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                    Architectural & Cultural Insights
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {trip.lessons_learned.map((l, lIdx) => (
                      <div
                        key={lIdx}
                        className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed flex items-start gap-2"
                      >
                        <Check size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
