import { redirect } from 'next/navigation';
import { createServerApi } from '@/lib/supabase/server';
import { AppShell } from '@/components/app-shell';

const STAFF_ROLES = ['coordinator', 'admin', 'director'];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const api = await createServerApi();
  const session = await api.auth.getSession();
  if (!session) redirect('/login');

  const roleInfo = await api.profile.role(session.user.id);
  // roleInfo is null if the schools/classes/roles migration
  // (20260716000010) hasn't been applied to this Supabase project yet —
  // treat that the same as "not staff" rather than crashing the page.
  if (!roleInfo || !STAFF_ROLES.includes(roleInfo.role)) {
    redirect('/login?error=not-staff');
  }

  const school = roleInfo.school_id ? await api.schools.fetchById(roleInfo.school_id) : null;
  const schoolName = school?.name ?? 'Школа';

  return <AppShell schoolName={schoolName}>{children}</AppShell>;
}
