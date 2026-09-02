import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client instance.
 * VITE_ prefixed env vars are injected by Vite at build time.
 */
export const supabase: SupabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
);

/** Get current session (if any) */
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

/** Check if the logged‑in user has admin role */
export const isAdmin = async (): Promise<boolean> => {
  const session = await getSession();
  if (!session?.user?.id) return false;
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  if (error) return false;
  return data?.role === 'admin';
};

/** Sign out current user */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
