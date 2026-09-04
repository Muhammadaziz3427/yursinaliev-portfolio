import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star, Upload, Plus, Trash2 } from 'lucide-react';
import type { Travel, Game, MedicalLearning, ArtPiece } from '@/lib/cms-api';

type ModalMode = 'create' | 'edit';

// ----------------------------------------------------------------------
// 6. TRAVEL MODAL
// ----------------------------------------------------------------------
export function TravelModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: ModalMode;
  initial?: Partial<Travel>;
  onClose: () => void;
  onSave: (data: Partial<Travel> & { imageFiles?: File[] }) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Travel> & { imageFiles?: File[] }>({
    trip_title: '',
    location: '',
    country: '',
    start_date: '',
    end_date: '',
    rating: '⭐⭐⭐⭐⭐',
    description: '',
    highlights: '',
    ...initial,
  });
  const [lessonsInput, setLessonsInput] = useState((initial?.lessons_learned || []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const lessons_learned = lessonsInput.split('\n').map((s) => s.trim()).filter(Boolean);
      await onSave({ ...form, lessons_learned });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save travel record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-teal-500/30 bg-[#131B27] p-6 space-y-5 shadow-2xl font-mono"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-teal-400 uppercase">
            {mode === 'create' ? 'Record New Travel Expedition' : 'Edit Travel Record'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Trip Title *</label>
            <input
              required
              value={form.trip_title || ''}
              onChange={(e) => setForm({ ...form, trip_title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-teal-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Location (City) *</label>
              <input
                required
                value={form.location || ''}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Country</label>
              <input
                value={form.country || ''}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                value={form.start_date || ''}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">End Date</label>
              <input
                type="date"
                value={form.end_date || ''}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Rating</label>
              <input
                value={form.rating || '⭐⭐⭐⭐⭐'}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Description & Highlights</label>
            <textarea
              rows={3}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-teal-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Lessons Learned / Insights (one per line)</label>
            <textarea
              rows={3}
              value={lessonsInput}
              onChange={(e) => setLessonsInput(e.target.value)}
              placeholder="Architecture reflects cultural synthesis&#10;Historical stonework precision"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-teal-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Upload Photo(s)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setForm({ ...form, imageFiles: e.target.files ? Array.from(e.target.files) : [] })}
              className="w-full text-slate-400 file:mr-3 file:px-3 file:py-1 file:rounded file:bg-slate-800 file:text-teal-400 file:border file:border-teal-500/30 file:text-xs"
            />
          </div>

          {error && <div className="p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-300">{error}</div>}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-slate-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold hover:bg-teal-500/30 disabled:opacity-50"
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Record Trip' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 7. GAME MODAL
// ----------------------------------------------------------------------
export function GameModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: ModalMode;
  initial?: Partial<Game>;
  onClose: () => void;
  onSave: (data: Partial<Game> & { imageFile?: File }) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Game> & { imageFile?: File }>({
    name: '',
    type: 'Video Game',
    playtime: '1,000+ Hours',
    rating: 5,
    description: '',
    why_i_like: '',
    ...initial,
  });
  const [achievementsInput, setAchievementsInput] = useState((initial?.achievements || []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const achievements = achievementsInput.split('\n').map((s) => s.trim()).filter(Boolean);
      await onSave({ ...form, achievements });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save game.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-pink-500/30 bg-[#131B27] p-6 space-y-5 shadow-2xl font-mono"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-pink-400 uppercase">
            {mode === 'create' ? 'Add Game / Hobby' : 'Edit Game'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Game / Hobby Name *</label>
            <input
              required
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-pink-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Type</label>
              <select
                value={form.type || 'Video Game'}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-pink-400"
              >
                {['Video Game', 'Board Game', 'Hobby', 'Sport'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Playtime / Experience</label>
              <input
                value={form.playtime || ''}
                onChange={(e) => setForm({ ...form, playtime: e.target.value })}
                placeholder="1,500+ Hours"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-pink-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Rating (1-5)</label>
              <select
                value={form.rating || 5}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-pink-400"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} Stars</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-pink-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Why I Like / Reflection</label>
            <textarea
              rows={2}
              value={form.why_i_like || ''}
              onChange={(e) => setForm({ ...form, why_i_like: e.target.value })}
              placeholder="Teaches cold discipline and tactical triage..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-pink-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Achievements & Milestones (one per line)</label>
            <textarea
              rows={3}
              value={achievementsInput}
              onChange={(e) => setAchievementsInput(e.target.value)}
              placeholder="Divine Rank Achieved&#10;Tournament Captain"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-pink-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Cover Image File</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] })}
              className="w-full text-slate-400 file:mr-3 file:px-3 file:py-1 file:rounded file:bg-slate-800 file:text-pink-400 file:border file:border-pink-500/30 file:text-xs"
            />
          </div>

          {error && <div className="p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-300">{error}</div>}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-slate-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 font-bold hover:bg-pink-500/30 disabled:opacity-50"
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Add Game' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 8. MEDICAL LEARNING MODAL
// ----------------------------------------------------------------------
export function MedicalLearningModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: ModalMode;
  initial?: Partial<MedicalLearning>;
  onClose: () => void;
  onSave: (data: Partial<MedicalLearning> & { imageFiles?: File[] }) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<MedicalLearning> & { imageFiles?: File[] }>({
    topic: '',
    system: 'Cardiovascular',
    status: 'Learning',
    description: '',
    clinical_relevance: '',
    ...initial,
  });
  const [factsInput, setFactsInput] = useState((initial?.key_facts || []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const key_facts = factsInput.split('\n').map((s) => s.trim()).filter(Boolean);
      await onSave({ ...form, key_facts });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save medical topic.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-blue-500/30 bg-[#131B27] p-6 space-y-5 shadow-2xl font-mono"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-blue-400 uppercase">
            {mode === 'create' ? 'Record Medical / Surgical Topic' : 'Edit Medical Topic'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Topic Title *</label>
            <input
              required
              value={form.topic || ''}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Anatomical System</label>
              <select
                value={form.system || 'Cardiovascular'}
                onChange={(e) => setForm({ ...form, system: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-blue-400"
              >
                {['Cardiovascular', 'Nervous', 'Skeletal', 'Digestive', 'Endocrine'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Status</label>
              <select
                value={form.status || 'Learning'}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-blue-400"
              >
                <option value="Learning">Learning</option>
                <option value="Mastered">Mastered</option>
                <option value="Interested">Interested</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Anatomical & Physiological Description</label>
            <textarea
              rows={3}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Key Facts (one per line)</label>
            <textarea
              rows={3}
              value={factsInput}
              onChange={(e) => setFactsInput(e.target.value)}
              placeholder="SA node intrinsic rate: 60-100 bpm&#10;AV delay: 0.12s"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Surgical & Clinical Relevance</label>
            <textarea
              rows={2}
              value={form.clinical_relevance || ''}
              onChange={(e) => setForm({ ...form, clinical_relevance: e.target.value })}
              placeholder="Essential for diagnosis of arrhythmias..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Upload Diagram / Plates</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setForm({ ...form, imageFiles: e.target.files ? Array.from(e.target.files) : [] })}
              className="w-full text-slate-400 file:mr-3 file:px-3 file:py-1 file:rounded file:bg-slate-800 file:text-blue-400 file:border file:border-blue-500/30 file:text-xs"
            />
          </div>

          {error && <div className="p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-300">{error}</div>}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-slate-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold hover:bg-blue-500/30 disabled:opacity-50"
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Record Topic' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 9. GALLERY MODAL
// ----------------------------------------------------------------------
export function GalleryModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: ModalMode;
  initial?: Partial<ArtPiece>;
  onClose: () => void;
  onSave: (data: Partial<ArtPiece> & { imageFile?: File }) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<ArtPiece> & { imageFile?: File }>({
    title: '',
    note: '',
    category: 'Anatomy',
    aspectRatio: '16/10',
    ...initial,
  });
  const [detailsInput, setDetailsInput] = useState((initial?.details || []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const details = detailsInput.split('\n').map((s) => s.trim()).filter(Boolean);
      await onSave({ ...form, details });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save gallery item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-emerald-500/30 bg-[#131B27] p-6 space-y-5 shadow-2xl font-mono"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-emerald-400 uppercase">
            {mode === 'create' ? 'Add Gallery Plate' : 'Edit Gallery Plate'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Plate Title *</label>
            <input
              required
              value={form.title || ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Category</label>
              <select
                value={form.category || 'Anatomy'}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
              >
                {['Anatomy', 'UI Design', 'Cyber Architecture', 'Architecture', 'Art'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Aspect Ratio</label>
              <select
                value={form.aspectRatio || '16/10'}
                onChange={(e) => setForm({ ...form, aspectRatio: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
              >
                {['16/10', '16/9', '4/3', '1/1'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Medium / Notes</label>
            <input
              value={form.note || ''}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Graphite & Vector / C5-T1 nerve roots"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Anatomical Details / Bullets (one per line)</label>
            <textarea
              rows={3}
              value={detailsInput}
              onChange={(e) => setDetailsInput(e.target.value)}
              placeholder="Roots: C5, C6, C7, C8, T1&#10;Clinical significance: Erb's Palsy"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Image File Upload</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] })}
              className="w-full text-slate-400 file:mr-3 file:px-3 file:py-1 file:rounded file:bg-slate-800 file:text-emerald-400 file:border file:border-emerald-500/30 file:text-xs"
            />
          </div>

          {error && <div className="p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-300">{error}</div>}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-slate-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold hover:bg-emerald-500/30 disabled:opacity-50"
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Add Plate' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
