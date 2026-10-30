import Link from 'next/link';
import { getStudent, getServerApi } from '@/lib/auth';
import { ArrowRightIcon, CalendarIcon, FileIcon, CheckIcon, TargetIcon } from '@/components/icons';
import { StudentResultsList, type ResultItem } from '@/components/student-results-list';
import { formatDate, pct, subjectGlyph, subjectLabel } from '@/lib/student-ui';

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

/** Circular progress (SVG): track + brand arc with the percentage in the middle. */
function Ring({ value, size = 132 }: { value: number; size?: number }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ede9fe" strokeWidth="12" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ring)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight text-slate-800">{value}%</span>
        <span className="text-[11px] font-medium text-slate-400">верных</span>
      </span>
    </div>
  );
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

  const items: ResultItem[] = results.slice(0, 4).map((r) => ({
    testId: r.test_id, title: r.school_tests?.title ?? 'Тест', subjectId: r.school_tests?.subject_id ?? null,
    topicTitle: r.school_tests?.topic_id ? topics[r.school_tests.topic_id] ?? null : null,
    score: r.score, total: r.total, createdAt: r.created_at,
  }));

  // «Мои темы» — усвоение по разделу = доля верных ответов по всем тестам раздела.
  const bySubject = new Map<string, { s: number; t: number }>();
  let allS = 0, allT = 0;
  for (const r of results) {
    allS += r.score; allT += r.total;
    const id = r.school_tests?.subject_id; if (!id) continue;
    const cur = bySubject.get(id) ?? { s: 0, t: 0 };
    bySubject.set(id, { s: cur.s + r.score, t: cur.t + r.total });
  }
  const overall = pct(allS, allT);

  const stats = [
    { label: 'К выполнению', value: todo.length, Icon: TargetIcon },
    { label: 'Пройдено тестов', value: results.length, Icon: CheckIcon },
  ];

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Hero */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">Привет, {firstName}! 👋</h1>
          <p className="mt-2 text-base text-slate-500 sm:text-lg">
            {todo.length > 0
              ? `Сегодня у тебя ${todo.length} ${plural(todo.length, 'задание', 'задания', 'заданий')}`
              : 'Все задания выполнены — отличная работа!'}
          </p>
        </div>
        <div className="hidden gap-3 sm:flex">
          {stats.map(({ label, value, Icon }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3.5 shadow-sm shadow-violet-200/40 ring-1 ring-violet-100/80">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-brand"><Icon className="h-5 w-5" /></span>
              <div><p className="text-2xl font-bold leading-none text-slate-800">{value}</p><p className="mt-1 text-xs text-slate-400">{label}</p></div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-10">
        {/* Main column */}
        <div className="space-y-8 lg:space-y-10">
          {next ? (
            <Link href={`/student/tests/${next.id}`}
              className="group relative block overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#7c3aed_0%,#6d28d9_45%,#4f46e5_100%)] p-6 text-white shadow-xl shadow-violet-300/40 transition hover:shadow-2xl hover:shadow-violet-300/60 sm:p-8">
              <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
              <span aria-hidden className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-white/[0.07]" />
              <span className="relative inline-block rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">Ближайшее задание</span>
              <div className="relative mt-4 flex items-center justify-between gap-5">
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{next.topic_id ? topics[next.topic_id] ?? next.title : next.title}</h2>
                  <p className="mt-1.5 text-white/75">Тема · {subjectLabel(next.subject_id)}</p>
                </div>
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-lg transition group-hover:translate-x-1 group-hover:scale-105">
                  <ArrowRightIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="relative mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/85">
                <span className="flex items-center gap-2"><CalendarIcon className="h-[18px] w-[18px] text-white/60" />{formatDate(next.created_at)}</span>
                <span className="flex items-center gap-2"><FileIcon className="h-[18px] w-[18px] text-white/60" />
                  {next.question_count} {plural(next.question_count, 'вопрос', 'вопроса', 'вопросов')}
                </span>
                {todo.length > 1 && <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">+ ещё {todo.length - 1}</span>}
              </div>
            </Link>
          ) : (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckIcon className="h-7 w-7" /></span>
              <p className="mt-4 text-lg font-semibold text-slate-700">Новых заданий нет</p>
              <p className="mt-1 text-sm text-slate-400">Когда учитель отправит тест, он появится здесь.</p>
            </div>
          )}

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Последние результаты</h2>
              {results.length > 4 && (
                <Link href="/student/results" className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-hover">
                  Все результаты <ArrowRightIcon className="h-4 w-4" />
                </Link>
              )}
            </div>
            <StudentResultsList items={items} />
          </section>
        </div>

        {/* Side column */}
        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm shadow-violet-200/40 ring-1 ring-violet-100/80">
            <h2 className="text-base font-bold text-slate-800">Моя точность</h2>
            {allT > 0 ? (
              <div className="mt-4 flex items-center gap-5">
                <Ring value={overall} />
                <div className="text-sm text-slate-500">
                  <p><b className="text-slate-800">{allS}</b> верных из <b className="text-slate-800">{allT}</b></p>
                  <p className="mt-1">в {results.length} {plural(results.length, 'тесте', 'тестах', 'тестах')}</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Пройди первый тест — здесь появится твоя точность.</p>
            )}
          </div>

          {bySubject.size > 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-sm shadow-violet-200/40 ring-1 ring-violet-100/80">
              <h2 className="text-base font-bold text-slate-800">Мои темы</h2>
              <ul className="mt-4 space-y-5">
                {[...bySubject.entries()].map(([id, v]) => {
                  const p = pct(v.s, v.t);
                  return (
                    <li key={id}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-bold text-violet-600">{subjectGlyph(id)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="truncate font-semibold text-slate-800">{subjectLabel(id)}</p>
                            <span className="text-sm font-bold text-slate-700">{p}%</span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-violet-100">
                            <div className="h-full rounded-full bg-[linear-gradient(90deg,#8b5cf6,#6d28d9)]" style={{ width: `${p}%` }} />
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
