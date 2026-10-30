import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { wrapSupabaseClient } from '@qadam/api-client';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component with no request/response to write to —
            // safe to ignore as long as middleware.ts is refreshing the session.
          }
        },
      },
    },
  );
}

/** Server-side API client (auth/profile/theory/topics/questions), for use in Server Components/Actions. */
export async function createServerApi() {
  return wrapSupabaseClient(await createServerSupabaseClient());
}
