import { redirect } from 'next/navigation';
import { createServerApi } from '@/lib/supabase/server';
import { AnalyticsView } from '@/components/analytics-view';

export default async function AnalyticsPage() {
  const api = await createServerApi();
  const session = await api.auth.getSession();
  if (!session) redirect('/login');

  const roleInfo = await api.profile.role(session.user.id);
  if (!roleInfo?.school_id) redirect('/login?error=not-staff');
  const schoolId = roleInfo.school_id;

  const [classes, students, exams, results, stats] = await Promise.all([
    api.staffData.classes(schoolId),
    api.staffData.students(schoolId),
    api.staffData.mockExams(schoolId),
    api.staffData.mockResults(schoolId),
    api.staffData.topicStats(schoolId),
  ]);

  return (
    <AnalyticsView
      students={students}
      classes={classes}
      exams={exams}
      results={results}
      stats={stats}
    />
  );
}
