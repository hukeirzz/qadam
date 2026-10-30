import { redirect, notFound } from 'next/navigation';
import { getStaff, getServerApi } from '@/lib/auth';
import { StudentProfile } from '@/components/student-profile';
import * as agg from '@/lib/aggregate';
import { TEST_LEVELS } from '@qadam/api-client';

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, role } = await getStaff();
  if (!session) redirect('/login');
  if (!role?.school_id) redirect('/login?error=not-staff');

  const api = await getServerApi();
  const student = await api.staffData.student(id);
  if (!student) notFound();

  const [classes, testResults, mocks, topics, topicLevels] = await Promise.all([
    api.staffData.classes(role.school_id),
    api.staffData.studentTestResults(id),
    api.staffData.studentMockResults(id),
    api.staffData.topics(),
    api.staffData.topicLevels(),
  ]);

  const className = classes.find((c) => c.id === student.class_id)?.name ?? '—';
  const mockHistory = [...mocks]
    .sort((a, b) => (a.mock_exams.exam_date ?? '').localeCompare(b.mock_exams.exam_date ?? ''))
    .map((m) => ({ name: m.mock_exams.name, total: m.total }));

  return (
    <StudentProfile
      student={{ name: student.name }}
      className={className}
      levelMaps={TEST_LEVELS.map((l) => ({ id: l.id, label: l.label, groups: agg.levelHeatmap(l.id, testResults, topicLevels, topics) }))}
      mockHistory={mockHistory}
    />
  );
}
