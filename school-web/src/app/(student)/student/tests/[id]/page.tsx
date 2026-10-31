import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStudent, getServerApi } from '@/lib/auth';
import { TestRunner } from '@/components/test-runner';
import { formatDate, formatDuration, pct, pctTone, subjectLabel } from '@/lib/student-ui';

export default async function StudentTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { student } = await getStudent();
  const api = await getServerApi();
  const [test, results] = await Promise.all([api.studentData.test(id), api.studentData.results(student!.id)]);
  if (!test) notFound();

  const title = test.title;
  const subtitle = `${subjectLabel(test.subject_id)} · Тест`;
  const done = results.find((r) => r.test_id === id);

  if (done) {
    const p = pct(done.score, done.total);
    const tone = pctTone(p);
    return (
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 text-center ring-1 ring-slate-200/70">
        <p className="text-sm text-slate-400">{subtitle}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">{title}</h1>
        <span className={`mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold ${tone.icon}`}>{p}%</span>
        <p className="mt-4 text-slate-600">Результат: {done.score} из {done.total}</p>
        <p className="mt-1 text-sm text-slate-400">
          Пройден {formatDate(done.created_at)}{formatDuration(done.duration_seconds) ? ` · ${formatDuration(done.duration_seconds)}` : ''}
        </p>
        <Link href="/student/tasks" className="mt-7 inline-block rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover">
          К заданиям
        </Link>
      </div>
    );
  }

  if (test.school_test_questions.length === 0) {
    return <p className="mx-auto max-w-2xl rounded-xl bg-white p-8 text-center text-slate-400 ring-1 ring-slate-100">В этом тесте пока нет вопросов.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl"><TestRunner testId={id} studentId={student!.id} title={title} subtitle={subtitle}
      questions={test.school_test_questions} /></div>
  );
}
