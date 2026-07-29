import { redirect } from 'next/navigation';
import { createServerApi } from '@/lib/supabase/server';
import { StudentsRoster } from '@/components/students-roster';
import { ClassManager } from '@/components/class-manager';

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

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <ClassManager schoolId={schoolId} classes={classes} />
      <StudentsRoster students={students} classes={classes} />
    </div>
  );
}
