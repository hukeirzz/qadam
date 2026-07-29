import { redirect } from 'next/navigation';
import { getStaff, getServerApi } from '@/lib/auth';
import { StudentsRoster } from '@/components/students-roster';
import { ClassManager } from '@/components/class-manager';

export default async function StudentsPage() {
  const { session, role } = await getStaff();
  if (!session) redirect('/login');
  if (!role?.school_id) redirect('/login?error=not-staff');
  const schoolId = role.school_id;

  const api = await getServerApi();

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
