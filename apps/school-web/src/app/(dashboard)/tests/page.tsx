import { redirect } from 'next/navigation';
import { createServerApi } from '@/lib/supabase/server';
import { TestBuilder } from '@/components/test-builder';

export default async function TestsPage() {
  const api = await createServerApi();
  const session = await api.auth.getSession();
  if (!session) redirect('/login');

  const roleInfo = await api.profile.role(session.user.id);
  if (!roleInfo?.school_id) redirect('/login?error=not-staff');
  const schoolId = roleInfo.school_id;

  const [classes, students, topics, topicStats] = await Promise.all([
    api.staffData.classes(schoolId),
    api.staffData.students(schoolId),
    api.staffData.topics(),
    api.staffData.topicStats(schoolId),
  ]);

  return <TestBuilder classes={classes} students={students} topics={topics} topicStats={topicStats} />;
}
