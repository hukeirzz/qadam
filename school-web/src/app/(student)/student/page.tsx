import Link from 'next/link';
import { getStudent, getServerApi } from '@/lib/auth';
import { ArrowRightIcon, CalendarIcon, FileIcon } from '@/components/icons';
import { StudentResultsList, type ResultItem } from '@/components/student-results-list';
import { formatDate, pct, subjectGlyph, subjectLabel } from '@/lib/student-ui';

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

export default async function StudentHome() {
  const { student } = await getStudent();
  const api = await getServerApi();
  const [tests, results, topics] = await Promise.all([
    api.studentData.tests(), api.studentData.results(student!.id), api.studentData.topicTitles(),
  ]);

  const solved = new Set(results.map((r) => r.test_id));
  const todo = tests.filter((t) => !solved.has(t.id));
  const next = todo[todo.length - 1] ?? null; // oldest unsolved first
  const firstName = student!.name.split(/\s+/)[0];

  const items: ResultItem[] = results.slice(0, 3).map((r) => ({
    testId: r.test_id, title: r.school_tests?.title ?? 'Тест', subjectId: r.school_tests?.subject_id ?? null,
    topicTitle: r.school_tests?.topic_id ? topics[r.school_tests.topic_id] ?? null : null,
    score: r.score, total: r.total, createdAt: r.created_at,
  }));

  // «Мои темы» — усвоение по разделу = доля верных ответов по всем тестам раздела.
  const bySubject = new Map<string, { s: number; t: number }>();
  for (const r of results) {
    const id = r.school_tests?.subject_id; if (!id) continue;
    const cur = bySubject.get(id) ?? { s: 0, t: 0 };
    bySubject.set(id, { s: cur.s + r.score, t: cur.t + r.total });
  }

  return (
    <div className="space-y-9">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Привет, {firstName}!</h1>
        <p className="mt-1.5 text-slate-500">
          {todo.length > 0
            ? `Сегодня у тебя ${todo.length} ${plural(todo.length, 'задание', 'задания', 'заданий')}`
            : 'Все задания выполнены — отличная работа!'}
        </p>
      </section>

      {next ? (
        <Link href={`/student/tests/${next.id}`}
          className="group block rounded-3xl bg-[linear-gradient(135deg,#f1eefe_0%,#ebe8fd_100%)] p-6 ring-1 ring-violet-100 transition hover:shadow-md hover:shadow-violet-200/50">
          <span className="inline-block rounded-lg bg-white/70 px-2.5 py-1 text-xs font-semibold text-violet-600">Ближайшее задание</span>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold text-slate-800">
                {next.topic_id ? topics[next.topic_id] ?? next.title : next.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">Тема · {subjectLabel(next.subject_id)}</p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-md shadow-violet-300/50 transition group-hover:scale-105">
              <ArrowRightIcon className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <span className="flex items-center gap-2"><CalendarIcon className="h-[18px] w-[18px] text-slate-400" />{formatDate(next.created_at)}</span>
            <span className="hidden h-4 w-px bg-slate-300/70 sm:block" />
            <span className="flex items-center gap-2"><FileIcon className="h-[18px] w-[18px] text-slate-400" />
              {next.question_count} {plural(next.question_count, 'вопрос', 'вопроса', 'вопросов')}
            </span>
          </div>
        </Link>
      ) : (
        <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-slate-100">
          <p className="font-semibold text-slate-700">Новых заданий нет</p>
          <p className="mt-1 text-sm text-slate-400">Когда учитель отправит тест, он появится здесь.</p>
        </div>
      )}

      <section>
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Последние результаты</h2>
          {results.length > 3 && (
            <Link href="/student/results" className="flex items-center gap-1.5 text-sm font-medium text-brand">
              Все результаты <ArrowRightIcon className="h-4 w-4" />
            </Link>
          )}
        </div>
        <StudentResultsList items={items} />
      </section>

      {bySubject.size > 0 && (
        <section>
          <h2 className="mb-3.5 text-lg font-bold text-slate-800">Мои темы</h2>
          <ul className="divide-y divide-slate-100 rounded-3xl bg-white px-5 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
            {[...bySubject.entries()].map(([id, v]) => {
              const p = pct(v.s, v.t);
              return (
                <li key={id} className="flex items-center gap-4 py-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-base font-bold text-violet-600">{subjectGlyph(id)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800">{subjectLabel(id)}</p>
                    <p className="text-sm text-slate-400">Усвоено на {p}%</p>
                  </div>
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-violet-100 sm:w-44">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${p}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
