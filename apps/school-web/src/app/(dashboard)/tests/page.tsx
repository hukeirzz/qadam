import { redirect } from 'next/navigation';
import { getStaff, getServerApi } from '@/lib/auth';
import { TestBuilder } from '@/components/test-builder';

export default async function TestsPage() {
  const { session, role } = await getStaff();
  if (!session) redirect('/login');
  if (!role?.school_id) redirect('/login?error=not-staff');
  const schoolId = role.school_id;

  const api = await getServerApi();

  const [classes, students, topics, topicStats] = await Promise.all([
    api.staffData.classes(schoolId),
    api.staffData.students(schoolId),
    api.staffData.topics(),
    api.staffData.topicStats(schoolId),
  ]);

  return <TestBuilder classes={classes} students={students} topics={topics} topicStats={topicStats} />;
}
