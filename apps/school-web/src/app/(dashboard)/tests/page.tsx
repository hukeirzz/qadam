import { redirect } from 'next/navigation';
import { getStaff, getServerApi } from '@/lib/auth';
import { TestsManager } from '@/components/tests-manager';

export default async function TestsPage() {
  const { session, role } = await getStaff();
  if (!session) redirect('/login');
  if (!role?.school_id) redirect('/login?error=not-staff');
  const schoolId = role.school_id;

  const api = await getServerApi();

  const [classes, tests] = await Promise.all([
    api.staffData.classes(schoolId),
    api.staffData.schoolTests(schoolId),
  ]);

  return <TestsManager schoolId={schoolId} classes={classes} tests={tests} />;
}
