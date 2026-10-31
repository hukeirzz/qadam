import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStudent, getServerApi } from '@/lib/auth';
import { loadStudentData } from '@/lib/student-data';
import { TestRunner } from '@/components/test-runner';
import { outcomeUI } from '@/components/student-tasks';
import { formatDate, formatDuration, pct, subjectLabel } from '@/lib/student-ui';

export default async function StudentTestPage({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ retake?: string }> }) {
  const { id } = await params;
  const { retake } = await searchParams;
  const { student } = await getStudent();
  const api = await getServerApi();
  const [test, { results, retakes }] = await Promise.all([api.studentData.test(id), loadStudentData(student!.id)]);
  if (!test) notFound();

  const title = test.title;
  const subtitle = `${subjectLabel(test.subject_id)} · Тест`;
  const first = results.find((r) => r.test_id === id);
  const attempts = retakes.filter((r) => r.test_id === id);
  const hasQuestions = test.school_test_questions.length > 0;

  if (!hasQuestions) {
    return <p className="mx-auto max-w-2xl rounded-xl bg-white p-8 text-center text-slate-400 ring-1 ring-slate-200/70">В этом тесте пока нет вопросов.</p>;
  }

  // Re-taking is only possible after the first attempt exists.
  if (first && retake === '1') {
    return (
      <div className="mx-auto max-w-2xl">
        <TestRunner testId={id} studentId={student!.id} title={title} subtitle={subtitle} retake questions={test.school_test_questions} />
      </div>
    );
  }

  if (first) {
    const ui = outcomeUI(first);
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="rounded-xl bg-white p-8 text-center ring-1 ring-slate-200/70">
          <p className="text-sm text-slate-400">{subtitle}</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{title}</h1>
          <span className={`mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold ${ui.chip}`}>{pct(first.score, first.total)}%</span>
          <p className="mt-4 text-slate-700">Первая сдача: {first.score} из {first.total}</p>
          <p className="mt-1 text-sm text-slate-400">
            {formatDate(first.created_at)}{formatDuration(first.duration_seconds) ? ` · ${formatDuration(first.duration_seconds)}` : ''}
          </p>
          <p className="mx-auto mt-4 max-w-sm text-xs text-slate-400">Именно этот результат учитывается в аналитике. Пересдача её не меняет.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={`/student/tests/${id}?retake=1`} className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover">Пересдать</Link>
            <Link href="/student" className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50">На главную</Link>
          </div>
        </div>

        {attempts.length > 0 && (
          <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200/70" aria-labelledby="attempts">
            <h2 id="attempts" className="text-sm font-semibold text-slate-900">Пересдачи</h2>
            <p className="mt-0.5 text-xs text-slate-400">Не влияют на аналитику</p>
            <ul className="mt-3 divide-y divide-slate-100">
              {attempts.map((a) => (
                <li key={a.created_at} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-slate-500">{formatDate(a.created_at)}</span>
                  <span className="font-medium text-slate-800">{a.score} из {a.total} · {pct(a.score, a.total)}%</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <TestRunner testId={id} studentId={student!.id} title={title} subtitle={subtitle} questions={test.school_test_questions} />
    </div>
  );
}
