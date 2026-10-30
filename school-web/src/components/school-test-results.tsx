import Link from 'next/link';
import { Card, RankBadge } from '@/components/ui';
import { ArrowRightIcon } from '@/components/icons';

type TestDetail = {
  id: string; title: string; description: string | null;
  target_rank: string | null; subject_id: string | null;
  school_test_students: { student_id: string }[];
  school_test_questions: { id: string }[];
};
type ResultRow = {
  student_id: string; score: number; total: number; duration_seconds: number | null; created_at: string;
  students: { name: string; class_id: string | null };
};
type ClassRow = { id: string; name: string };
type StudentRow = { id: string; name: string; class_id: string | null };

function formatDuration(seconds: number | null): string {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function SchoolTestResults({
  test, results, classes, students,
}: {
  test: TestDetail;
  results: ResultRow[];
  classes: ClassRow[];
  students: StudentRow[];
}) {
  const className = (classId: string | null) => classes.find((c) => c.id === classId)?.name ?? '—';
  const assignedIds = test.school_test_students.map((a) => a.student_id);
  const doneIds = new Set(results.map((r) => r.student_id));
  const pending = assignedIds
    .filter((id) => !doneIds.has(id))
    .map((id) => students.find((s) => s.id === id))
    .filter((s): s is StudentRow => !!s);

  const avgScore = results.length
    ? Math.round((results.reduce((a, r) => a + r.score, 0) / results.length) * 10) / 10
    : null;
  const avgPct = results.length
    ? Math.round(results.reduce((a, r) => a + (r.total > 0 ? (r.score / r.total) * 100 : 0), 0) / results.length)
    : null;

  const tile = (label: string, value: string) => (
    <div className="rounded-2xl bg-slate-50 px-4 py-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-bold leading-none text-slate-800">{value}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <Link href="/tests" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand">
        <ArrowRightIcon className="h-4 w-4 rotate-180" /> Назад к тестам
      </Link>

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-800">{test.title}</h1>
          {test.target_rank && <RankBadge rank={test.target_rank} />}
        </div>
        {test.description && <p className="mt-1.5 text-sm text-slate-500">{test.description}</p>}
        <p className="mt-2 text-xs text-slate-400">
          {test.school_test_questions.length} вопросов · отправлено {assignedIds.length} ученикам
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {tile('Прошли', String(results.length))}
          {tile('Средний балл', avgScore != null ? `${avgScore} / ${results[0]?.total ?? '—'}` : '—')}
          {tile('Средний %', avgPct != null ? `${avgPct}%` : '—')}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-800">Результаты</h2>
        {results.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">Пока никто не прошёл этот тест.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
                  <th className="px-3 py-2 font-medium">Ученик</th>
                  <th className="px-2 py-2 font-medium">Класс</th>
                  <th className="px-2 py-2 text-center font-medium">Балл</th>
                  <th className="px-2 py-2 text-center font-medium">%</th>
                  <th className="px-2 py-2 text-center font-medium">Время</th>
                  <th className="px-2 py-2 text-right font-medium">Дата</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const pct = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
                  return (
                    <tr key={r.student_id} className="border-b border-slate-100 last:border-0">
                      <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-800">{r.students.name}</td>
                      <td className="px-2 py-2.5 text-slate-500">{className(r.students.class_id)}</td>
                      <td className="px-2 py-2.5 text-center font-semibold text-slate-800">{r.score} / {r.total}</td>
                      <td className="px-2 py-2.5 text-center">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${pct >= 65 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-center text-slate-500">{formatDuration(r.duration_seconds)}</td>
                      <td className="px-2 py-2.5 text-right text-xs text-slate-400">
                        {new Date(r.created_at).toLocaleDateString('ru-RU')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pending.length > 0 && (
        <Card>
          <h2 className="font-semibold text-slate-800">Ещё не проходили</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {pending.map((s) => (
              <li key={s.id} className="rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
                {s.name} <span className="text-slate-400">· {className(s.class_id)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
