import { redirect } from 'next/navigation';
import { getStaff, getStudent } from '@/lib/auth';
import { StudentShell } from '@/components/student-shell';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { session, student } = await getStudent();
  if (!session) redirect('/login');
  if (!student) {
    // Not a student: teachers belong in the dashboard.
    const { role } = await getStaff();
    redirect(role ? '/' : '/login?error=no-account');
  }
  return <StudentShell name={student.name} email={student.email}>{children}</StudentShell>;
}
