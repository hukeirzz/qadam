import { cache } from 'react';
import { createServerApi } from './supabase/server';

/**
 * Per-request memoized auth helpers. Next.js renders the dashboard layout and
 * the page in the same server request, and both need the session + staff role
 * — without memoization each does its own `getUser`/`role` round-trip, doubling
 * the latency before the page can render. `cache()` collapses duplicate calls
 * within a single request to one, so role/session hit the network only once.
 */

export const getServerApi = cache(createServerApi);

export const getSession = cache(async () => {
  const api = await getServerApi();
  return api.auth.getSession();
});

/**
 * Session + staff role/school + school name, fetched once per request in a
 * single round-trip (staff joined to schools) instead of a separate role()
 * lookup and schools.fetchById().
 */
export const getStaff = cache(async () => {
  const session = await getSession();
  if (!session) return { session: null, role: null, schoolName: null };
  const api = await getServerApi();
  const { data } = await api.supabase
    .from('staff')
    .select('role, school_id, schools(name)')
    .eq('id', session.user.id)
    .single();
  if (!data) return { session, role: null, schoolName: null };
  const row = data as { role: string; school_id: string | null; schools: { name: string } | { name: string }[] | null };
  const school = Array.isArray(row.schools) ? row.schools[0] : row.schools;
  return {
    session,
    role: { role: row.role, school_id: row.school_id, class_id: null as string | null },
    schoolName: school?.name ?? null,
  };
});
