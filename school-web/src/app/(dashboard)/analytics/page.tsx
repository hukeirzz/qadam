import { redirect } from 'next/navigation';
import { getStaff, getServerApi } from '@/lib/auth';
import { AnalyticsView } from '@/components/analytics-view';

export default async function AnalyticsPage() {
  const { session, role } = await getStaff();
  if (!session) redirect('/login');
  if (!role?.school_id) redirect('/login?error=not-staff');
  const schoolId = role.school_id;

  const api = await getServerApi();

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
