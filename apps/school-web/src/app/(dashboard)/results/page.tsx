import { redirect } from 'next/navigation';
import { createServerApi } from '@/lib/supabase/server';
import { ResultsEditor } from '@/components/results-editor';

export default async function ResultsPage() {
  const api = await createServerApi();
  const session = await api.auth.getSession();
  if (!session) redirect('/login');

  const roleInfo = await api.profile.role(session.user.id);
  if (!roleInfo?.school_id) redirect('/login?error=not-staff');
  const schoolId = roleInfo.school_id;

  const [classes, students, exams, results] = await Promise.all([
    api.staffData.classes(schoolId),
    api.staffData.students(schoolId),
    api.staffData.mockExams(schoolId),
    api.staffData.mockResults(schoolId),
  ]);

  return (
    <ResultsEditor
      schoolId={schoolId}
      classes={classes}
      students={students}
      exams={exams}
      results={results}
    />
  );
}
