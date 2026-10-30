import { redirect } from 'next/navigation';
import { getStaff, getServerApi } from '@/lib/auth';
import { ResultsEditor } from '@/components/results-editor';

export default async function ResultsPage() {
  const { session, role } = await getStaff();
  if (!session) redirect('/login');
  if (!role?.school_id) redirect('/login?error=not-staff');
  const schoolId = role.school_id;

  const api = await getServerApi();

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
