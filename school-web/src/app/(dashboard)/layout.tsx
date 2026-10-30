import { redirect } from 'next/navigation';
import { getStaff, getStudent } from '@/lib/auth';
import { AppShell } from '@/components/app-shell';

const STAFF_ROLES = ['coordinator', 'admin', 'director'];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, role, schoolName } = await getStaff();
  if (!session) redirect('/login');

  // role is null if the schools/classes/roles migration (20260716000010)
  // hasn't been applied yet — treat that as "not staff" rather than crashing.
  if (!role || !STAFF_ROLES.includes(role.role)) {
    // Students share the login; send them to their own screen.
    const { student } = await getStudent();
    redirect(student ? '/student' : '/login?error=not-staff');
  }

  return <AppShell schoolName={schoolName ?? 'Школа'}>{children}</AppShell>;
}
