import { supabase } from './supabase';

/** Helper to upload media files to the `portfolio-media` bucket */
export const uploadMedia = async (file: File, folder: string = ''): Promise<string> => {
  const fileExt = file.name.split('.').pop() || 'png';
  const cleanName = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`;
  const filePath = folder ? `${folder}/${cleanName}` : cleanName;
  
  const { error } = await supabase.storage.from('portfolio-media').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('portfolio-media').getPublicUrl(filePath);
  return data.publicUrl;
};

// ==========================================
// 1. SITE CONFIG
// ==========================================
export interface SiteConfig {
  id?: string;
  name: string;
  title: string;
  headline: string;
  bio: string;
  profile_image_url?: string;
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  email?: string;
  status_text?: string;
  theme?: string;
  updated_at?: string;
}

export const getSiteConfig = async (): Promise<SiteConfig | null> => {
  try {
    const { data, error } = await supabase.from('site_config').select('*').maybeSingle();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
};

export const updateSiteConfig = async (updates: Partial<SiteConfig> & { imageFile?: File }): Promise<SiteConfig> => {
  let profileImageUrl = updates.profile_image_url;
  if (updates.imageFile) {
    profileImageUrl = await uploadMedia(updates.imageFile, 'avatar');
  }
  const payload: any = { ...updates, updated_at: new Date().toISOString() };
  if (profileImageUrl !== undefined) payload.profile_image_url = profileImageUrl;
  delete payload.imageFile;

  const existing = await getSiteConfig();
  if (existing?.id) {
    const { data, error } = await supabase
      .from('site_config')
      .update(payload)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('site_config')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// ==========================================
// 2. ESSAYS
// ==========================================
export interface Essay {
  id?: string;
  slug: string;
  title: string;
  type?: string;
  category?: string;
  dek?: string;
  date?: string;
  read?: string;
  read_time?: number;
  tags?: string[];
  content?: string;
  content_markdown?: string;
  featured_image_url?: string;
  cover_image?: string;
  published?: boolean;
  published_at?: string;
  likes_count?: number;
  sections?: { id: string; title: string; content: string }[];
}

export const listEssays = async (): Promise<Essay[]> => {
  try {
    const { data, error } = await supabase.from('essays').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((e: any) => ({
      ...e,
      slug: e.slug || '',
      type: e.type || e.category || 'Clinical & Technical',
      category: e.category || e.type || 'Tech',
      title: e.title || '',
      dek: e.dek || e.excerpt || '',
      date: e.date || (e.published_at ? new Date(e.published_at).toLocaleDateString() : ''),
      read: e.read || (e.read_time ? `${e.read_time} min read` : '5 min read'),
      read_time: e.read_time || 5,
      tags: e.tags || [],
      content_markdown: e.content_markdown || e.content || '',
      featured_image_url: e.featured_image_url || e.cover_image || '',
      sections: e.sections || (e.content_markdown ? [{ id: 'sec-1', title: 'Content', content: e.content_markdown }] : []),
    }));
  } catch {
    return [];
  }
};

export const createEssay = async (essay: Omit<Essay, 'slug'> & { imageFile?: File; slug?: string }): Promise<Essay> => {
  let coverUrl = essay.featured_image_url || essay.cover_image || '';
  if (essay.imageFile) {
    coverUrl = await uploadMedia(essay.imageFile, 'essays');
  }
  const slug = essay.slug || (essay.title || 'essay').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const payload: any = {
    ...essay,
    slug,
    content: essay.content_markdown || essay.content || '',
    content_markdown: essay.content_markdown || essay.content || '',
    featured_image_url: coverUrl,
    cover_image: coverUrl,
    created_at: new Date().toISOString(),
    published_at: essay.published_at || new Date().toISOString(),
  };
  delete payload.imageFile;

  const { data, error } = await supabase.from('essays').insert(payload).select().single();
  if (error) throw error;
  return data as Essay;
};

export const updateEssay = async (id: string, updates: Partial<Essay> & { imageFile?: File }): Promise<Essay> => {
  let coverUrl = updates.featured_image_url || updates.cover_image;
  if (updates.imageFile) {
    coverUrl = await uploadMedia(updates.imageFile, 'essays');
  }
  const payload: any = { ...updates, updated_at: new Date().toISOString() };
  if (coverUrl !== undefined) {
    payload.featured_image_url = coverUrl;
    payload.cover_image = coverUrl;
  }
  if (updates.content_markdown) payload.content = updates.content_markdown;
  delete payload.imageFile;

  const { data, error } = await supabase
    .from('essays')
    .update(payload)
    .eq(id.length > 20 ? 'id' : 'slug', id)
    .select()
    .single();
  if (error) throw error;
  return data as Essay;
};

export const deleteEssay = async (id: string) => {
  const { error } = await supabase.from('essays').delete().eq(id.length > 20 ? 'id' : 'slug', id);
  if (error) throw error;
};

// ==========================================
// 3. BOOKS
// ==========================================
export interface Book {
  id?: string;
  title: string;
  author: string;
  cover_image_url?: string;
  category?: string;
  status: 'Reading' | 'Completed' | 'Wishlist';
  rating: number;
  review?: string;
  key_takeaways?: string[];
  book_link?: string;
  created_at?: string;
}

export const listBooks = async (): Promise<Book[]> => {
  try {
    const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((b: any) => ({
      ...b,
      status: b.status || 'Completed',
      rating: b.rating || 5,
      key_takeaways: b.key_takeaways || [],
    }));
  } catch {
    return [];
  }
};

export const createBook = async (book: Omit<Book, 'id'> & { imageFile?: File }): Promise<Book> => {
  let coverUrl = book.cover_image_url || '';
  if (book.imageFile) {
    coverUrl = await uploadMedia(book.imageFile, 'books');
  }
  const payload: any = {
    ...book,
    cover_image_url: coverUrl,
    created_at: new Date().toISOString(),
  };
  delete payload.imageFile;

  const { data, error } = await supabase.from('books').insert(payload).select().single();
  if (error) throw error;
  return data as Book;
};

export const updateBook = async (id: string, updates: Partial<Book> & { imageFile?: File }): Promise<Book> => {
  let coverUrl = updates.cover_image_url;
  if (updates.imageFile) {
    coverUrl = await uploadMedia(updates.imageFile, 'books');
  }
  const payload: any = { ...updates, updated_at: new Date().toISOString() };
  if (coverUrl !== undefined) payload.cover_image_url = coverUrl;
  delete payload.imageFile;

  const { data, error } = await supabase.from('books').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data as Book;
};

export const deleteBook = async (id: string) => {
  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) throw error;
};

// ==========================================
// 4. TRAVELS
// ==========================================
export interface Travel {
  id?: string;
  trip_title: string;
  location: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  photo_urls?: string[];
  lessons_learned?: string[];
  rating?: string;
  highlights?: string;
  created_at?: string;
}

export const listTravels = async (): Promise<Travel[]> => {
  try {
    const { data, error } = await supabase.from('travels').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((t: any) => ({
      ...t,
      photo_urls: t.photo_urls || [],
      lessons_learned: t.lessons_learned || [],
    }));
  } catch {
    return [];
  }
};

export const createTravel = async (travel: Omit<Travel, 'id'> & { imageFiles?: File[] }): Promise<Travel> => {
  const photoUrls = [...(travel.photo_urls || [])];
  if (travel.imageFiles?.length) {
    for (const file of travel.imageFiles) {
      const url = await uploadMedia(file, 'travel');
      photoUrls.push(url);
    }
  }
  const payload: any = {
    ...travel,
    photo_urls: photoUrls,
    created_at: new Date().toISOString(),
  };
  delete payload.imageFiles;

  const { data, error } = await supabase.from('travels').insert(payload).select().single();
  if (error) throw error;
  return data as Travel;
};

export const updateTravel = async (id: string, updates: Partial<Travel> & { imageFiles?: File[] }): Promise<Travel> => {
  const photoUrls = [...(updates.photo_urls || [])];
  if (updates.imageFiles?.length) {
    for (const file of updates.imageFiles) {
      const url = await uploadMedia(file, 'travel');
      photoUrls.push(url);
    }
  }
  const payload: any = { ...updates, photo_urls: photoUrls };
  delete payload.imageFiles;

  const { data, error } = await supabase.from('travels').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data as Travel;
};

export const deleteTravel = async (id: string) => {
  const { error } = await supabase.from('travels').delete().eq('id', id);
  if (error) throw error;
};

// ==========================================
// 5. GAMES & INTERESTS
// ==========================================
export interface Game {
  id?: string;
  name: string;
  type: 'Video Game' | 'Board Game' | 'Hobby' | 'Sport';
  description?: string;
  playtime?: string;
  rating: number;
  image_url?: string;
  why_i_like?: string;
  achievements?: string[];
  created_at?: string;
}

export const listGames = async (): Promise<Game[]> => {
  try {
    const { data, error } = await supabase.from('games').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((g: any) => ({
      ...g,
      type: g.type || 'Video Game',
      rating: g.rating || 5,
      achievements: g.achievements || [],
    }));
  } catch {
    return [];
  }
};

export const createGame = async (game: Omit<Game, 'id'> & { imageFile?: File }): Promise<Game> => {
  let imgUrl = game.image_url || '';
  if (game.imageFile) {
    imgUrl = await uploadMedia(game.imageFile, 'games');
  }
  const payload: any = {
    ...game,
    image_url: imgUrl,
    created_at: new Date().toISOString(),
  };
  delete payload.imageFile;

  const { data, error } = await supabase.from('games').insert(payload).select().single();
  if (error) throw error;
  return data as Game;
};

export const updateGame = async (id: string, updates: Partial<Game> & { imageFile?: File }): Promise<Game> => {
  let imgUrl = updates.image_url;
  if (updates.imageFile) {
    imgUrl = await uploadMedia(updates.imageFile, 'games');
  }
  const payload: any = { ...updates };
  if (imgUrl !== undefined) payload.image_url = imgUrl;
  delete payload.imageFile;

  const { data, error } = await supabase.from('games').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data as Game;
};

export const deleteGame = async (id: string) => {
  const { error } = await supabase.from('games').delete().eq('id', id);
  if (error) throw error;
};

// ==========================================
// 6. SECURITY NOTES
// ==========================================
export interface SecurityNote {
  id?: string;
  title: string;
  category: 'Concept' | 'Tool' | 'Vulnerability' | 'Best Practice';
  content: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags?: string[];
  code_snippets?: string;
  references?: string[];
  created_at?: string;
}

export const listSecurityNotes = async (): Promise<SecurityNote[]> => {
  try {
    const { data, error } = await supabase.from('security_notes').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((s: any) => ({
      ...s,
      category: s.category || 'Concept',
      difficulty: s.difficulty || 'Intermediate',
      tags: s.tags || [],
      references: s.references || [],
    }));
  } catch {
    return [];
  }
};

export const createSecurityNote = async (note: Omit<SecurityNote, 'id'>): Promise<SecurityNote> => {
  const payload: any = {
    ...note,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('security_notes').insert(payload).select().single();
  if (error) throw error;
  return data as SecurityNote;
};

export const updateSecurityNote = async (id: string, updates: Partial<SecurityNote>): Promise<SecurityNote> => {
  const payload: any = { ...updates, updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from('security_notes').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data as SecurityNote;
};

export const deleteSecurityNote = async (id: string) => {
  const { error } = await supabase.from('security_notes').delete().eq('id', id);
  if (error) throw error;
};

// ==========================================
// 7. MEDICAL LEARNING
// ==========================================
export interface MedicalLearning {
  id?: string;
  topic: string;
  system: 'Cardiovascular' | 'Nervous' | 'Skeletal' | 'Digestive' | 'Endocrine';
  description?: string;
  diagram_urls?: string[];
  key_facts?: string[];
  clinical_relevance?: string;
  status: 'Learning' | 'Mastered' | 'Interested';
  created_at?: string;
}

export const listMedicalLearning = async (): Promise<MedicalLearning[]> => {
  try {
    const { data, error } = await supabase.from('medical_learning').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((m: any) => ({
      ...m,
      system: m.system || 'Cardiovascular',
      status: m.status || 'Learning',
      diagram_urls: m.diagram_urls || [],
      key_facts: m.key_facts || [],
    }));
  } catch {
    return [];
  }
};

export const createMedicalLearning = async (item: Omit<MedicalLearning, 'id'> & { imageFiles?: File[] }): Promise<MedicalLearning> => {
  const diagramUrls = [...(item.diagram_urls || [])];
  if (item.imageFiles?.length) {
    for (const file of item.imageFiles) {
      const url = await uploadMedia(file, 'medical');
      diagramUrls.push(url);
    }
  }
  const payload: any = {
    ...item,
    diagram_urls: diagramUrls,
    created_at: new Date().toISOString(),
  };
  delete payload.imageFiles;

  const { data, error } = await supabase.from('medical_learning').insert(payload).select().single();
  if (error) throw error;
  return data as MedicalLearning;
};

export const updateMedicalLearning = async (id: string, updates: Partial<MedicalLearning> & { imageFiles?: File[] }): Promise<MedicalLearning> => {
  const diagramUrls = [...(updates.diagram_urls || [])];
  if (updates.imageFiles?.length) {
    for (const file of updates.imageFiles) {
      const url = await uploadMedia(file, 'medical');
      diagramUrls.push(url);
    }
  }
  const payload: any = { ...updates, diagram_urls: diagramUrls };
  delete payload.imageFiles;

  const { data, error } = await supabase.from('medical_learning').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data as MedicalLearning;
};

export const deleteMedicalLearning = async (id: string) => {
  const { error } = await supabase.from('medical_learning').delete().eq('id', id);
  if (error) throw error;
};

// ==========================================
// 8. PROJECTS
// ==========================================
export interface Project {
  id?: string;
  slug: string;
  number?: string;
  name: string;
  summary: string;
  description?: string;
  problem?: string;
  solution?: string;
  techStack?: string[];
  tech_stack?: string[];
  result?: string;
  year?: string;
  role?: string;
  githubUrl?: string;
  github_url?: string;
  liveUrl?: string;
  live_url?: string;
  category: 'Product' | 'Security' | 'Medicine' | 'Prototype' | string;
  imageUrl?: string;
  image_url?: string;
  hero_image_url?: string;
  gallery_urls?: string[];
  status?: 'Live' | 'In Progress' | 'Archived';
  featured?: boolean;
  likes_count?: number;
}

export const listProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((p: any) => ({
      ...p,
      name: p.name || p.title || '',
      summary: p.summary || p.description || '',
      description: p.description || p.summary || '',
      problem: p.problem || '',
      solution: p.solution || '',
      techStack: p.techStack || p.tech_stack || [],
      tech_stack: p.tech_stack || p.techStack || [],
      result: p.result || '',
      year: p.year || '',
      role: p.role || '',
      githubUrl: p.githubUrl || p.github_url || '',
      github_url: p.github_url || p.githubUrl || '',
      liveUrl: p.liveUrl || p.live_url || p.demo_url || '',
      live_url: p.live_url || p.liveUrl || p.demo_url || '',
      category: p.category || 'Product',
      number: p.number || '01',
      imageUrl: p.imageUrl || p.image_url || p.hero_image_url || '',
      hero_image_url: p.hero_image_url || p.image_url || p.imageUrl || '',
      status: p.status || 'Live',
      featured: p.featured ?? false,
    }));
  } catch {
    return [];
  }
};

export const createProject = async (
  proj: Omit<Project, 'slug'> & { imageFile?: File; slug?: string }
): Promise<Project> => {
  let imageUrl = proj.imageUrl ?? proj.hero_image_url ?? '';
  if (proj.imageFile) {
    imageUrl = await uploadMedia(proj.imageFile, 'projects');
  }
  const slug = proj.slug || (proj.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const payload: any = {
    ...proj,
    slug,
    image_url: imageUrl,
    hero_image_url: imageUrl,
    tech_stack: proj.techStack || proj.tech_stack || [],
    description: proj.description || proj.summary || '',
    created_at: new Date().toISOString(),
  };
  delete payload.imageFile;

  const { data, error } = await supabase.from('projects').insert(payload).select().single();
  if (error) throw error;
  return data as Project;
};

export const updateProject = async (
  id: string,
  updates: Partial<Project> & { imageFile?: File }
): Promise<Project> => {
  let imageUrl = updates.imageUrl ?? updates.hero_image_url;
  if (updates.imageFile) {
    imageUrl = await uploadMedia(updates.imageFile, 'projects');
  }
  const payload: any = { ...updates, updated_at: new Date().toISOString() };
  if (imageUrl !== undefined) {
    payload.image_url = imageUrl;
    payload.hero_image_url = imageUrl;
  }
  if (updates.techStack) payload.tech_stack = updates.techStack;
  delete payload.imageFile;

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq(id.length > 20 ? 'id' : 'slug', id)
    .select()
    .single();
  if (error) throw error;
  return data as Project;
};

export const deleteProject = async (id: string) => {
  const { error } = await supabase.from('projects').delete().eq(id.length > 20 ? 'id' : 'slug', id);
  if (error) throw error;
};

// ==========================================
// 9. QUICK TIPS
// ==========================================
export interface QuickTip {
  id?: string;
  insight: string;
  category: 'Tech' | 'Life' | 'Medicine' | 'Philosophy';
  created_at?: string;
}

export const listQuickTips = async (): Promise<QuickTip[]> => {
  try {
    const { data, error } = await supabase.from('quick_tips').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((q: any) => ({
      ...q,
      category: q.category || 'Tech',
    }));
  } catch {
    return [];
  }
};

export const createQuickTip = async (tip: Omit<QuickTip, 'id'>): Promise<QuickTip> => {
  const payload = { ...tip, created_at: new Date().toISOString() };
  const { data, error } = await supabase.from('quick_tips').insert(payload).select().single();
  if (error) throw error;
  return data as QuickTip;
};

export const updateQuickTip = async (id: string, updates: Partial<QuickTip>): Promise<QuickTip> => {
  const { data, error } = await supabase.from('quick_tips').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as QuickTip;
};

export const deleteQuickTip = async (id: string) => {
  const { error } = await supabase.from('quick_tips').delete().eq('id', id);
  if (error) throw error;
};

// ==========================================
// 10. GALLERY
// ==========================================
export interface ArtPiece {
  id?: string;
  title: string;
  note?: string;
  category: 'Anatomy' | 'UI Design' | 'Cyber Architecture' | 'Architecture' | 'Art' | 'Security';
  aspectRatio?: string;
  aspect_ratio?: string;
  details?: string[];
  imageUrl?: string;
  image_url?: string;
  description?: string;
  image_alt?: string;
  order?: number;
  created_at?: string;
}

export const listGallery = async (): Promise<ArtPiece[]> => {
  try {
    const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((g: any) => ({
      ...g,
      id: g.id || '',
      title: g.title || '',
      note: g.note || g.description || '',
      description: g.description || g.note || '',
      category: g.category || 'Anatomy',
      aspectRatio: g.aspectRatio || g.aspect_ratio || '16/10',
      details: g.details || [],
      imageUrl: g.imageUrl || g.image_url || '',
      image_url: g.image_url || g.imageUrl || '',
    }));
  } catch {
    return [];
  }
};

export const createGalleryItem = async (
  item: Omit<ArtPiece, 'imageUrl'> & { imageFile?: File; imageUrl?: string }
): Promise<ArtPiece> => {
  let imageUrl = item.imageUrl ?? item.image_url ?? '';
  if (item.imageFile) {
    imageUrl = await uploadMedia(item.imageFile, 'gallery');
  }
  const payload: any = {
    ...item,
    image_url: imageUrl,
    description: item.description || item.note || '',
    created_at: new Date().toISOString(),
  };
  delete payload.imageFile;

  const { data, error } = await supabase.from('gallery').insert(payload).select().single();
  if (error) throw error;
  return data as ArtPiece;
};

export const updateGalleryItem = async (
  id: string,
  updates: Partial<ArtPiece> & { imageFile?: File }
): Promise<ArtPiece> => {
  let imageUrl = updates.imageUrl ?? updates.image_url;
  if (updates.imageFile) {
    imageUrl = await uploadMedia(updates.imageFile, 'gallery');
  }
  const payload: any = { ...updates, updated_at: new Date().toISOString() };
  if (imageUrl !== undefined) payload.image_url = imageUrl;
  if (updates.note) payload.description = updates.note;
  delete payload.imageFile;

  const { data, error } = await supabase.from('gallery').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data as ArtPiece;
};

export const deleteGalleryItem = async (id: string) => {
  const { error } = await supabase.from('gallery').delete().eq('id', id);
  if (error) throw error;
};

// ==========================================
// 11. TELEMETRY LOGS
// ==========================================
export const addTelemetryLog = async (log: { log_level: string; message: string; component: string }) => {
  try {
    await supabase.from('telemetry_logs').insert({
      ...log,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Telemetry log write ignored:', e);
  }
};

export const listTelemetryLogs = async () => {
  try {
    const { data, error } = await supabase
      .from('telemetry_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
};

