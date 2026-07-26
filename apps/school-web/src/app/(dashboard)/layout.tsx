import { redirect } from 'next/navigation';
import { createServerApi } from '@/lib/supabase/server';
import { Sidebar } from '@/components/sidebar';

const STAFF_ROLES = ['coordinator', 'admin', 'director'];

const ROLE_LABELS: Record<string, string> = {
  director: 'Директор',
  coordinator: 'Координатор ОРТ',
  admin: 'Администрация',
  student: 'Ученик',
};

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

  const userName =
    (session.user.user_metadata?.name as string | undefined) ||
    session.user.email?.split('@')[0] ||
    'Пользователь';

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={userName} roleLabel={ROLE_LABELS[roleInfo.role] ?? 'Сотрудник'} />
      <main className="flex-1 overflow-x-hidden px-6 py-6 lg:px-8">{children}</main>
    </div>
  );
}
