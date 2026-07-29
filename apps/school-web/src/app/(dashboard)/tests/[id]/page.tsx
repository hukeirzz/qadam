import { redirect, notFound } from 'next/navigation';
import { getStaff, getServerApi } from '@/lib/auth';
import { SchoolTestResults } from '@/components/school-test-results';

export default async function SchoolTestResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, role } = await getStaff();
  if (!session) redirect('/login');
  if (!role?.school_id) redirect('/login?error=not-staff');

  const api = await getServerApi();
  const test = await api.staffData.schoolTest(id);
  if (!test) notFound(); // RLS already scopes to own school — a foreign id 404s

  const [results, classes] = await Promise.all([
    api.staffData.schoolTestResults(id),
    api.staffData.classes(role.school_id),
  ]);

  return <SchoolTestResults test={test} results={results} classes={classes} />;
}
