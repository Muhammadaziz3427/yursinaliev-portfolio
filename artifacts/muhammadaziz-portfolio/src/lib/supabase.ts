import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/**
 * Supabase client instance.
 * Safe initialization with fallback values.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** Helper to race a promise or thenable against a timeout */
const withTimeout = async <T>(promise: PromiseLike<T>, ms = 2500): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Auth request timeout')), ms)),
  ]);
};

/** Get current session (if any) */
export const getSession = async () => {
  try {
    const { data, error } = await withTimeout(supabase.auth.getSession());
    if (error) return null;
    return data?.session ?? null;
  } catch {
    return null;
  }
};

/** Check if the logged-in user has admin role */
export const isAdmin = async (): Promise<boolean> => {
  try {
    const session = await getSession();
    if (!session?.user?.id) return false;

    const email = session.user.email?.toLowerCase();
    if (email === 'admin@yursinaliev.com' || email === 'yursinaliyev@gmail.com') {
      return true;
    }

    const { data, error } = await withTimeout(
      supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()
    );

    if (error) {
      // Fallback check against admin_profiles table
      const { data: adminRow } = await withTimeout(
        supabase
          .from('admin_profiles')
          .select('email')
          .eq('email', email)
          .maybeSingle()
      );
      return !!adminRow;
    }

    return data?.role === 'admin';
  } catch {
    return false;
  }
};

/** Sign out current user */
export const signOut = async () => {
  try {
    const { error } = await withTimeout(supabase.auth.signOut());
    if (error) throw error;
  } catch (err) {
    console.warn('Sign out completed locally:', err);
  }
};

