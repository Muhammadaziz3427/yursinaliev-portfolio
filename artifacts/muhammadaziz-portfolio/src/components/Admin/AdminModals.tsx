import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star, Upload, Plus, Trash2, Eye } from 'lucide-react';
import type {
  Project,
  Essay,
  Book,
  Travel,
  Game,
  SecurityNote,
  MedicalLearning,
  QuickTip,
  ArtPiece
} from '@/lib/cms-api';

type ModalMode = 'create' | 'edit';

// ----------------------------------------------------------------------
// 1. PROJECT MODAL
// ----------------------------------------------------------------------
export function ProjectModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: ModalMode;
  initial?: Partial<Project>;
  onClose: () => void;
  onSave: (data: Partial<Project> & { imageFile?: File }) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Project> & { imageFile?: File }>({
    name: '',
    category: 'Product',
    year: '2024',
    role: 'Lead Architect',
    summary: '',
    problem: '',
    solution: '',
    result: '',
    liveUrl: '',
    githubUrl: '',
    status: 'Live',
    featured: false,
    ...initial,
  });
  const [techInput, setTechInput] = useState((initial?.techStack || initial?.tech_stack || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const techStack = techInput.split(',').map((s) => s.trim()).filter(Boolean);
      await onSave({ ...form, techStack, tech_stack: techStack });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save project.');
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
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-emerald-500/30 bg-[#131B27] p-6 space-y-5 shadow-2xl font-mono"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-emerald-400 uppercase">
            {mode === 'create' ? 'Create New Project' : 'Edit Project'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Project Name *</label>
              <input
                required
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Category</label>
              <select
                value={form.category || 'Product'}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
              >
                {['Product', 'Security', 'Medicine', 'Prototype', 'Systems'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Year</label>
              <input
                value={form.year || '2024'}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Role / Responsibility</label>
              <input
                value={form.role || ''}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Tech Stack (comma separated)</label>
            <input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="Next.js 14, TypeScript, Supabase, Tailwind CSS"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Short Summary *</label>
            <textarea
              required
              rows={2}
              value={form.summary || ''}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Problem Statement</label>
              <textarea
                rows={3}
                value={form.problem || ''}
                onChange={(e) => setForm({ ...form, problem: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Architectural Solution</label>
              <textarea
                rows={3}
                value={form.solution || ''}
                onChange={(e) => setForm({ ...form, solution: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400 resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Live URL</label>
              <input
                value={form.liveUrl || ''}
                onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">GitHub URL</label>
              <input
                value={form.githubUrl || ''}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Hero Image File</label>
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
              {saving ? 'Saving…' : mode === 'create' ? 'Create Project' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. ESSAY MODAL
// ----------------------------------------------------------------------
export function EssayModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: ModalMode;
  initial?: Partial<Essay>;
  onClose: () => void;
  onSave: (data: Partial<Essay> & { imageFile?: File }) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Essay> & { imageFile?: File }>({
    title: '',
    category: 'Tech',
    type: 'Clinical & Technical',
    read: '5 min read',
    dek: '',
    content_markdown: '',
    published: true,
    ...initial,
  });
  const [tagsInput, setTagsInput] = useState((initial?.tags || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const tags = tagsInput.split(',').map((s) => s.trim()).filter(Boolean);
      await onSave({ ...form, tags });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save essay.');
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
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-500/30 bg-[#131B27] p-6 space-y-5 shadow-2xl font-mono"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-cyan-400 uppercase">
            {mode === 'create' ? 'Write New Essay' : 'Edit Essay'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Essay Title *</label>
              <input
                required
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Category</label>
              <select
                value={form.category || 'Tech'}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400"
              >
                {['Tech', 'Medicine', 'Philosophy', 'Security', 'General'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Estimated Read Time</label>
              <input
                value={form.read || '5 min read'}
                onChange={(e) => setForm({ ...form, read: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Tags (comma separated)</label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Architecture, Surgery, Distributed Systems"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Subtitle / Excerpt (Dek) *</label>
            <textarea
              required
              rows={2}
              value={form.dek || ''}
              onChange={(e) => setForm({ ...form, dek: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Full Content (Markdown Supported) *</label>
            <textarea
              required
              rows={10}
              value={form.content_markdown || ''}
              onChange={(e) => setForm({ ...form, content_markdown: e.target.value })}
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none focus:border-cyan-400 resize-y leading-relaxed font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Cover Image File</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] })}
              className="w-full text-slate-400 file:mr-3 file:px-3 file:py-1 file:rounded file:bg-slate-800 file:text-cyan-400 file:border file:border-cyan-500/30 file:text-xs"
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
              className="px-5 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold hover:bg-cyan-500/30 disabled:opacity-50"
            >
              {saving ? 'Publishing…' : mode === 'create' ? 'Publish Essay' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. BOOK MODAL
// ----------------------------------------------------------------------
export function BookModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: ModalMode;
  initial?: Partial<Book>;
  onClose: () => void;
  onSave: (data: Partial<Book> & { imageFile?: File }) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Book> & { imageFile?: File }>({
    title: '',
    author: '',
    category: 'Tech',
    status: 'Completed',
    rating: 5,
    review: '',
    book_link: '',
    ...initial,
  });
  const [takeawaysInput, setTakeawaysInput] = useState((initial?.key_takeaways || []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const key_takeaways = takeawaysInput.split('\n').map((s) => s.trim()).filter(Boolean);
      await onSave({ ...form, key_takeaways });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save book.');
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
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-amber-500/30 bg-[#131B27] p-6 space-y-5 shadow-2xl font-mono"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-amber-400 uppercase">
            {mode === 'create' ? 'Add Book to Bookshelf' : 'Edit Book'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Book Title *</label>
              <input
                required
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Author *</label>
              <input
                required
                value={form.author || ''}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Category</label>
              <select
                value={form.category || 'Tech'}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-amber-400"
              >
                {['Tech', 'Medicine', 'Philosophy', 'Science', 'History', 'Fiction'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Reading Status</label>
              <select
                value={form.status || 'Completed'}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-amber-400"
              >
                <option value="Completed">Completed</option>
                <option value="Reading">Currently Reading</option>
                <option value="Wishlist">Wishlist</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Rating (1-5)</label>
              <select
                value={form.rating || 5}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-amber-400"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} Stars</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Review / Critical Summary</label>
            <textarea
              rows={3}
              value={form.review || ''}
              onChange={(e) => setForm({ ...form, review: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Key Takeaways (one per line)</label>
            <textarea
              rows={3}
              value={takeawaysInput}
              onChange={(e) => setTakeawaysInput(e.target.value)}
              placeholder="1. Flow of work&#10;2. Cognitive load constraints"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Goodreads / Amazon Link</label>
            <input
              value={form.book_link || ''}
              onChange={(e) => setForm({ ...form, book_link: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Cover Image File</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] })}
              className="w-full text-slate-400 file:mr-3 file:px-3 file:py-1 file:rounded file:bg-slate-800 file:text-amber-400 file:border file:border-amber-500/30 file:text-xs"
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
              className="px-5 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold hover:bg-amber-500/30 disabled:opacity-50"
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Add Book' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. SECURITY NOTE MODAL
// ----------------------------------------------------------------------
export function SecurityNoteModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: ModalMode;
  initial?: Partial<SecurityNote>;
  onClose: () => void;
  onSave: (data: Partial<SecurityNote>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<SecurityNote>>({
    title: '',
    category: 'Concept',
    difficulty: 'Intermediate',
    content: '',
    code_snippets: '',
    ...initial,
  });
  const [tagsInput, setTagsInput] = useState((initial?.tags || []).join(', '));
  const [refsInput, setRefsInput] = useState((initial?.references || []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const tags = tagsInput.split(',').map((s) => s.trim()).filter(Boolean);
      const references = refsInput.split('\n').map((s) => s.trim()).filter(Boolean);
      await onSave({ ...form, tags, references });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save security note.');
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
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-emerald-500/30 bg-[#131B27] p-6 space-y-5 shadow-2xl font-mono"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-emerald-400 uppercase">
            {mode === 'create' ? 'New Security Note' : 'Edit Security Note'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Title *</label>
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
                value={form.category || 'Concept'}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
              >
                {['Concept', 'Tool', 'Vulnerability', 'Best Practice'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Difficulty</label>
              <select
                value={form.difficulty || 'Intermediate'}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
              >
                {['Beginner', 'Intermediate', 'Advanced'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Tags (comma separated)</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Cryptography, Zero-Trust, WebCrypto, RLS"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Detailed Explanation / Content *</label>
            <textarea
              required
              rows={4}
              value={form.content || ''}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Code Snippet / Config</label>
            <textarea
              rows={5}
              value={form.code_snippets || ''}
              onChange={(e) => setForm({ ...form, code_snippets: e.target.value })}
              className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-emerald-300 font-mono text-xs outline-none focus:border-emerald-400 resize-y"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">References (one per line)</label>
            <textarea
              rows={2}
              value={refsInput}
              onChange={(e) => setRefsInput(e.target.value)}
              placeholder="NIST SP 800-207&#10;RFC 5869"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-emerald-400 resize-none"
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
              {saving ? 'Saving…' : mode === 'create' ? 'Create Note' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. QUICK TIP MODAL
// ----------------------------------------------------------------------
export function QuickTipModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: ModalMode;
  initial?: Partial<QuickTip>;
  onClose: () => void;
  onSave: (data: Partial<QuickTip>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<QuickTip>>({
    insight: '',
    category: 'Tech',
    ...initial,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save tip.');
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
        className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-[#131B27] p-6 space-y-5 shadow-2xl font-mono"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-amber-400 uppercase">
            {mode === 'create' ? 'New Quick Tip / Heuristic' : 'Edit Quick Tip'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Category</label>
            <select
              value={form.category || 'Tech'}
              onChange={(e) => setForm({ ...form, category: e.target.value as any })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-amber-400"
            >
              {['Tech', 'Life', 'Medicine', 'Philosophy'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Epigram / Insight Text *</label>
            <textarea
              required
              rows={4}
              value={form.insight || ''}
              onChange={(e) => setForm({ ...form, insight: e.target.value })}
              placeholder="Code should be like medicine: exact, calm, and bound by unwavering ethics..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-amber-400 resize-none"
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
              className="px-5 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold hover:bg-amber-500/30 disabled:opacity-50"
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Create Tip' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
