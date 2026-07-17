import { createBrowserClient } from '@supabase/ssr';
import { wrapSupabaseClient } from '@qadam/api-client';

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/** Browser-side API client (auth/profile/theory/topics/questions), for use in Client Components. */
export function createBrowserApi() {
  return wrapSupabaseClient(createBrowserSupabaseClient());
}
