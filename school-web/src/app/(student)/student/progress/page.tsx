import { getStudent, getServerApi } from '@/lib/auth';
import { loadStudentData } from '@/lib/student-data';
import * as agg from '@/lib/aggregate';
import { TEST_LEVELS } from '@qadam/api-client';
import { CARD } from '@/components/student-widgets';
import { MockExamsCard, LevelHeatmapCard } from '@/components/analytics-cards';
import { pct } from '@/lib/student-ui';

/**
 * «Успеваемость» — the same analytics the teacher sees on this student's profile (mock ORT scores
 * and per-level topic heatmaps), built from the same queries. Only first attempts reach it:
 * retakes live in a separate table.
 */
export default async function StudentProgressPage() {
  const { student } = await getStudent();
  const api = await getServerApi();
  const [{ results }, testResults, mocks, topics, topicLevels] = await Promise.all([
    loadStudentData(student!.id),
    api.staffData.studentTestResults(student!.id),
    api.staffData.studentMockResults(student!.id),
    api.staffData.topics(),
    api.staffData.topicLevels(),
  ]);

  const mockHistory = [...mocks]
    .sort((a, b) => (a.mock_exams.exam_date ?? '').localeCompare(b.mock_exams.exam_date ?? ''))
    .map((m) => ({ name: m.mock_exams.name, total: m.total }));

  const score = results.reduce((a, r) => a + r.score, 0);
  const total = results.reduce((a, r) => a + r.total, 0);
  const stats = [
    { label: 'Верных ответов', value: total ? `${pct(score, total)}%` : '—', hint: total ? `${score} из ${total}` : undefined },
    { label: 'Решено вопросов', value: String(total) },
    { label: 'Решено тестов', value: String(results.length) },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Успеваемость</h1>
        <p className="mt-1 text-sm text-slate-500">Учитывается только первая сдача каждого теста — пересдачи на аналитику не влияют.</p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className={`${CARD} p-5`}>
            <dt className="text-sm text-slate-500">{s.label}</dt>
            <dd className="mt-1.5 text-2xl font-semibold text-slate-900">{s.value}</dd>
            {s.hint && <p className="mt-0.5 text-xs text-slate-400">{s.hint}</p>}
          </div>
        ))}
      </dl>

      <MockExamsCard mockHistory={mockHistory} />

      {TEST_LEVELS.map((l) => (
        <LevelHeatmapCard key={l.id} label={l.label} groups={agg.levelHeatmap(l.id, testResults, topicLevels, topics)} />
      ))}
    </div>
  );
}
