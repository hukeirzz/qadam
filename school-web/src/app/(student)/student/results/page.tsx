import { getStudent, getServerApi } from '@/lib/auth';
import { StudentResultsList } from '@/components/student-results-list';

export default async function StudentResultsPage() {
  const { student } = await getStudent();
  const api = await getServerApi();
  const [results, topics] = await Promise.all([api.studentData.results(student!.id), api.studentData.topicTitles()]);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Все результаты</h1>
      <StudentResultsList items={results.map((r) => ({
        testId: r.test_id, title: r.school_tests?.title ?? 'Тест', subjectId: r.school_tests?.subject_id ?? null,
        topicTitle: r.school_tests?.topic_id ? topics[r.school_tests.topic_id] ?? null : null,
        score: r.score, total: r.total, createdAt: r.created_at,
      }))} />
    </div>
  );
}
