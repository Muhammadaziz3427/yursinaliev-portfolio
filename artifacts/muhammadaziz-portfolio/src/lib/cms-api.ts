import { supabase } from './supabase';
import type { Project, Essay, ArtPiece } from '@/App'; // reuse types from App.tsx

/** Helper to upload media files to the `portfolio-media` bucket */
export const uploadMedia = async (file: File, folder: string = ''): Promise<string> => {
  const filePath = folder ? `${folder}/${file.name}` : file.name;
  const { error } = await supabase.storage.from('portfolio-media').upload(filePath, file);
  if (error) throw error;
  const { data } = supabase.storage.from('portfolio-media').getPublicUrl(filePath);
  return data.publicUrl;
};

// -------------------------- Projects --------------------------
export const listProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase.from('projects').select('*');
  if (error) throw error;
  return (data || []).map((p: any) => ({
    ...p,
    name: p.name || p.title || '',
    summary: p.summary || p.description || '',
    problem: p.problem || '',
    solution: p.solution || '',
    techStack: p.techStack || p.tech_stack || [],
    result: p.result || '',
    year: p.year || '',
    role: p.role || '',
    githubUrl: p.githubUrl || p.github_url || '',
    liveUrl: p.liveUrl || p.live_url || p.demo_url || '',
    category: p.category || 'Product',
    number: p.number || '01',
    imageUrl: p.imageUrl || p.image_url || '',
  })) as Project[];
};

export const createProject = async (
  proj: Omit<Project, 'slug'> & { imageFile?: File }
): Promise<Project> => {
  let imageUrl = proj.imageUrl ?? '';
  if (proj.imageFile) {
    imageUrl = await uploadMedia(proj.imageFile, 'projects');
  }
  const slug = (proj.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...proj,
      image_url: imageUrl,
      slug,
      created_at: new Date().toISOString(),
    })
    .single();
  if (error) throw error;
  return data as Project;
};

export const updateProject = async (
  id: string,
  updates: Partial<Project> & { imageFile?: File }
): Promise<Project> => {
  let imageUrl = updates.imageUrl;
  if (updates.imageFile) {
    imageUrl = await uploadMedia(updates.imageFile, 'projects');
  }
  const payload: any = { ...updates };
  if (imageUrl !== undefined) {
    payload.image_url = imageUrl;
  }
  delete payload.imageFile;
  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq(id.length > 20 ? 'id' : 'slug', id)
    .single();
  if (error) throw error;
  return data as Project;
};

export const deleteProject = async (id: string) => {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
};

// -------------------------- Essays --------------------------
export const listEssays = async (): Promise<Essay[]> => {
  const { data, error } = await supabase.from('essays').select('*');
  if (error) throw error;
  return (data || []).map((e: any) => ({
    ...e,
    slug: e.slug || '',
    type: e.type || e.category || 'Clinical & Technical',
    title: e.title || '',
    dek: e.dek || e.excerpt || '',
    date: e.date || (e.published_at ? new Date(e.published_at).toLocaleDateString() : ''),
    read: e.read || (e.read_time ? `${e.read_time} min read` : '5 min read'),
    sections: e.sections || (e.content_markdown ? [{ id: 'sec-1', title: 'Content', content: e.content_markdown }] : []),
  })) as Essay[];
};

export const createEssay = async (essay: Omit<Essay, 'slug'>): Promise<Essay> => {
  const slug = (essay.title || 'essay').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const { data, error } = await supabase
    .from('essays')
    .insert({
      ...essay,
      slug,
      created_at: new Date().toISOString(),
    })
    .single();
  if (error) throw error;
  return data as Essay;
};

export const updateEssay = async (id: string, updates: Partial<Essay>): Promise<Essay> => {
  const { data, error } = await supabase
    .from('essays')
    .update(updates)
    .eq(id.length > 20 ? 'id' : 'slug', id)
    .single();
  if (error) throw error;
  return data as Essay;
};

export const deleteEssay = async (id: string) => {
  const { error } = await supabase
    .from('essays')
    .delete()
    .eq(id.length > 20 ? 'id' : 'slug', id);
  if (error) throw error;
};

// -------------------------- Gallery --------------------------
export const listGallery = async (): Promise<ArtPiece[]> => {
  const { data, error } = await supabase.from('gallery').select('*');
  if (error) throw error;
  return (data || []).map((g: any) => ({
    ...g,
    id: g.id || '',
    title: g.title || '',
    note: g.note || g.description || '',
    category: g.category || 'Anatomy',
    aspectRatio: g.aspectRatio || g.aspect_ratio || '16/10',
    details: g.details || [],
    imageUrl: g.imageUrl || g.image_url || '',
  })) as ArtPiece[];
};

export const createGalleryItem = async (
  item: Omit<ArtPiece, 'imageUrl'> & { imageFile?: File; imageUrl?: string }
): Promise<ArtPiece> => {
  let imageUrl = item.imageUrl ?? '';
  if (item.imageFile) {
    imageUrl = await uploadMedia(item.imageFile, 'gallery');
  }
  const payload: any = { ...item, image_url: imageUrl };
  delete payload.imageFile;
  const { data, error } = await supabase
    .from('gallery')
    .insert({
      ...payload,
      created_at: new Date().toISOString(),
    })
    .single();
  if (error) throw error;
  return data as ArtPiece;
};

export const updateGalleryItem = async (
  id: string,
  updates: Partial<ArtPiece> & { imageFile?: File }
): Promise<ArtPiece> => {
  let imageUrl = updates.imageUrl;
  if (updates.imageFile) {
    imageUrl = await uploadMedia(updates.imageFile, 'gallery');
  }
  const payload: any = { ...updates };
  if (imageUrl !== undefined) {
    payload.image_url = imageUrl;
  }
  delete payload.imageFile;
  const { data, error } = await supabase
    .from('gallery')
    .update(payload)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as ArtPiece;
};

export const deleteGalleryItem = async (id: string) => {
  const { error } = await supabase.from('gallery').delete().eq('id', id);
  if (error) throw error;
};

// -------------------------- Site Config --------------------------
export const getSiteConfig = async () => {
  const { data, error } = await supabase.from('site_config').select('*').maybeSingle();
  if (error) throw error;
  return data;
};

export const updateSiteConfig = async (updates: Partial<any>) => {
  const { data, error } = await supabase.from('site_config').update(updates).maybeSingle();
  if (error) throw error;
  return data;
};

// -------------------------- Telemetry Logs --------------------------
export const addTelemetryLog = async (log: { log_level: string; message: string; component: string }) => {
  const { error } = await supabase.from('telemetry_logs').insert({
    ...log,
    timestamp: new Date().toISOString(),
  });
  if (error) throw error;
};

export const listTelemetryLogs = async () => {
  const { data, error } = await supabase
    .from('telemetry_logs')
    .select('*')
    .order('timestamp', { ascending: false });
  if (error) throw error;
  return data as any[];
};
