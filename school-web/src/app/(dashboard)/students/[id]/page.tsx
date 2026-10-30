import { redirect, notFound } from 'next/navigation';
import { getStaff, getServerApi } from '@/lib/auth';
import { StudentProfile } from '@/components/student-profile';
import * as agg from '@/lib/aggregate';

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, role } = await getStaff();
  if (!session) redirect('/login');
  if (!role?.school_id) redirect('/login?error=not-staff');

  const api = await getServerApi();
  const student = await api.staffData.student(id);
  if (!student) notFound();

  const [classes, stats, mocks, topics] = await Promise.all([
    api.staffData.classes(role.school_id),
    api.staffData.studentTopicStats(id),
    api.staffData.studentMockResults(id),
    api.staffData.topics(),
  ]);

  const className = classes.find((c) => c.id === student.class_id)?.name ?? '—';
  const mockHistory = [...mocks]
    .sort((a, b) => (a.mock_exams.exam_date ?? '').localeCompare(b.mock_exams.exam_date ?? ''))
    .map((m) => ({ name: m.mock_exams.name, total: m.total }));

  return (
    <StudentProfile
      student={{
        name: student.name, rank: student.rank, xp: student.xp,
        streak: student.streak, max_streak: student.max_streak, premium_source: student.premium_source,
      }}
      className={className}
      sectionAcc={agg.sectionAccuracy(stats)}
      topicGroups={agg.topicAccuracyBySubject(stats, topics)}
      mockHistory={mockHistory}
    />
  );
}
