import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerApi } from '@/lib/supabase/server';

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

  return (
    <div className="min-h-screen">
      <nav className="flex gap-4 border-b p-4 text-sm">
        <Link href="/">Главная</Link>
        <Link href="/students">Ученики</Link>
        <Link href="/analytics">Аналитика</Link>
        <Link href="/tests">Свои тесты</Link>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
