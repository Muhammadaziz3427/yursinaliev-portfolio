import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Heart, Activity, Check, BookOpen } from 'lucide-react';
import { listMedicalLearning, type MedicalLearning } from '@/lib/cms-api';

const defaultMedical: MedicalLearning[] = [
  {
    id: '1',
    topic: 'Cardiac Conduction & Electrophysiology Vector Analysis',
    system: 'Cardiovascular',
    status: 'Mastered',
    description: 'The intrinsic cardiac pacemaker hierarchy (SA Node → AV Node → Bundle of His → Purkinje Fibers). Analysis of physiological delays and vector summation in 12-lead Electrocardiography (ECG).',
    key_facts: [
      'Sinoatrial node possesses intrinsic automaticity (60-100 bpm) driven by funny current (If) channels.',
      'AV nodal delay (0.12s) permits complete atrial systole prior to ventricular contraction.',
      'Mean electrical axis deviation identifies ventricular hypertrophy and hemiblocks.'
    ],
    clinical_relevance: 'Essential for diagnosing life-threatening arrhythmias (VT/VF), second & third-degree AV blocks, and determining pacemaker implantation criteria during acute cardiac care.',
    diagram_urls: [
      'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&q=80'
    ]
  },
  {
    id: '2',
    topic: 'Brachial Plexus Topography & Traumatic Neuropathies',
    system: 'Nervous',
    status: 'Mastered',
    description: 'Detailed dissection of C5-T1 spinal nerve roots, five anatomical regions (Roots, Trunks, Divisions, Cords, Terminal Branches), and the musculocutaneous/median/ulnar/radial/axillary distribution.',
    key_facts: [
      'Upper trunk injury (C5-C6) leads to Erb-Duchenne palsy (waiter’s tip deformity).',
      'Lower trunk injury (C8-T1) causes Klumpke paralysis (claw hand presentation).',
      'Radial nerve compression in spiral groove impairs wrist and finger extension (wrist drop).'
    ],
    clinical_relevance: 'Directly informs surgical exploration in acute trauma, obstetric birth injuries, and selective nerve grafting procedures in orthopedics and plastic surgery.',
    diagram_urls: [
      'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80'
    ]
  },
  {
    id: '3',
    topic: 'Surgical Anatomy of the Inguinal Canal & Hernia Repair',
    system: 'Skeletal',
    status: 'Learning',
    description: 'Fascial planes, boundaries of the inguinal canal (Anterior: External oblique aponeurosis; Posterior: Transversalis fascia; Floor: Inguinal ligament; Roof: Conjoint tendon), and Hesselbach’s triangle landmarks.',
    key_facts: [
      'Direct inguinal hernias occur medial to the inferior epigastric vessels through Hesselbach’s triangle.',
      'Indirect inguinal hernias traverse the deep inguinal ring lateral to the inferior epigastric vessels.',
      'Preservation of ilioinguinal and genitofemoral nerves prevents chronic post-herniorrhaphy groin pain.'
    ],
    clinical_relevance: 'Foundational for tension-free Lichtenstein mesh repairs and laparoscopic TAPP/TEP hernia surgeries.',
    diagram_urls: [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80'
    ]
  }
];

export default function MedicalPage() {
  const [topics, setTopics] = useState<MedicalLearning[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemFilter, setSystemFilter] = useState<'All' | 'Cardiovascular' | 'Nervous' | 'Skeletal' | 'Digestive' | 'Endocrine'>('All');

  useEffect(() => {
    listMedicalLearning().then((data) => {
      setTopics(data.length > 0 ? data : defaultMedical);
      setLoading(false);
    });
  }, []);

  const filtered = topics.filter((t) => (systemFilter === 'All' ? true : t.system === systemFilter));

  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 space-y-12">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono">
          <Stethoscope size={13} />
          <span>Surgical Anatomy & Clinical Learning Log</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-100 font-serif">
          Medical & Surgical Learning
        </h1>
        <p className="text-slate-400 font-mono text-xs max-w-2xl leading-relaxed">
          Systematic anatomical reviews, surgical approaches, physiological models, and clinical diagnostic pearls.
        </p>

        {/* System filter */}
        <div className="flex flex-wrap gap-2 pt-4">
          {(['All', 'Cardiovascular', 'Nervous', 'Skeletal', 'Digestive', 'Endocrine'] as const).map((sys) => (
            <button
              key={sys}
              onClick={() => setSystemFilter(sys)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all border ${
                systemFilter === sys
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold shadow-[0_0_15px_rgba(0,210,255,0.15)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sys} ({sys === 'All' ? topics.length : topics.filter((t) => t.system === sys).length})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-500">Loading anatomical models...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filtered.map((topic) => (
            <motion.div
              key={topic.id || topic.topic}
              whileHover={{ y: -2 }}
              className="p-6 sm:p-8 rounded-2xl border border-slate-800 bg-[#131B27]/80 hover:border-cyan-500/40 transition-all space-y-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                      {topic.system}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                        topic.status === 'Mastered'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      {topic.status}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
                    {topic.topic}
                  </h3>
                </div>
              </div>

              {topic.description && (
                <p className="text-sm text-slate-300 font-sans leading-relaxed">
                  {topic.description}
                </p>
              )}

              {topic.key_facts && topic.key_facts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                    Key Anatomical & Physiological Facts
                  </div>
                  <ul className="space-y-2 text-xs font-mono text-slate-300">
                    {topic.key_facts.map((fact, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                        <Check size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {topic.clinical_relevance && (
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 space-y-1.5">
                  <div className="text-xs font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart size={13} className="text-cyan-400" /> Surgical & Clinical Relevance
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {topic.clinical_relevance}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
