import { redirect } from 'next/navigation';
import { createServerApi } from '@/lib/supabase/server';
import { StudentsRoster } from '@/components/students-roster';

export default async function StudentsPage() {
  const api = await createServerApi();
  const session = await api.auth.getSession();
  if (!session) redirect('/login');

  const roleInfo = await api.profile.role(session.user.id);
  if (!roleInfo?.school_id) redirect('/login?error=not-staff');
  const schoolId = roleInfo.school_id;

  const [students, classes] = await Promise.all([
    api.staffData.students(schoolId),
    api.staffData.classes(schoolId),
  ]);

  return <StudentsRoster students={students} classes={classes} />;
}
