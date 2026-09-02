import { supabase } from './supabase';
import type { QueryClient } from '@tanstack/react-query';

/**
 * Sets up Supabase Realtime subscriptions for all content tables.
 * Call once at app root level, passing the TanStack QueryClient.
 */
export function setupRealtimeSync(queryClient: QueryClient) {
  const tables = ['projects', 'essays', 'gallery', 'telemetry_logs'];

  tables.forEach((table) => {
    supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          // Invalidate the matching query so it refetches
          queryClient.invalidateQueries({ queryKey: [table] });
        }
      )
      .subscribe();
  });
}
