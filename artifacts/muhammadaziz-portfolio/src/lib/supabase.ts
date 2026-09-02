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

export const ALLOWED_ADMIN_EMAILS = [
  'admin@yursinaliev.com',
  'yursinaliyevm@gmail.com',
  'yursinaliyev@gmail.com',
];

/** Check if the logged-in user (or given email) has admin role */
export const isAdmin = async (explicitEmail?: string): Promise<boolean> => {
  let email = (explicitEmail ?? '').trim().toLowerCase();

  if (email && ALLOWED_ADMIN_EMAILS.includes(email)) {
    return true;
  }

  try {
    const session = await getSession();
    if (session?.user?.email) {
      const sessionEmail = session.user.email.trim().toLowerCase();
      if (ALLOWED_ADMIN_EMAILS.includes(sessionEmail)) {
        return true;
      }
      if (!email) email = sessionEmail;
    }

    if (!session?.user?.id && !email) return false;

    // Check role in profiles table
    if (session?.user?.id) {
      const { data } = await withTimeout(
        supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()
      );
      if (data?.role === 'admin') return true;
    }

    // Fallback check against admin_profiles table
    if (email) {
      const { data: adminRow } = await withTimeout(
        supabase
          .from('admin_profiles')
          .select('email')
          .ilike('email', email)
          .maybeSingle()
      );
      if (adminRow?.email) return true;
    }

    return false;
  } catch {
    // If explicit email is in allowed list, always allow
    if (email && ALLOWED_ADMIN_EMAILS.includes(email)) {
      return true;
    }
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

