import Link from 'next/link';
import { getStudent, getServerApi } from '@/lib/auth';
import { ArrowRightIcon, BoltIcon, CalendarIcon, CheckIcon, FileIcon } from '@/components/icons';
import { StudentResultsList, type ResultItem } from '@/components/student-results-list';
import { SubjectIcon } from '@/components/subject-icon';
import { formatDate, pct, subjectLabel } from '@/lib/student-ui';

const CARD = 'rounded-[28px] bg-white shadow-[0_8px_30px_rgba(109,40,217,0.06)] ring-1 ring-violet-100/60';

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

/** Circular progress (SVG): soft track + violet arc, percentage and caption in the middle. */
function Ring({ value, size = 150 }: { value: number; size?: number }) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#efeafd" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ring)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[34px] font-bold leading-none tracking-tight text-slate-800">{value}%</span>
        <span className="mt-1 text-sm text-slate-400">средняя</span>
      </span>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className={`${CARD} flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5`}>
      <span className="flex h-10 w-10 shrink-0 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-violet-100/70 text-brand">{icon}</span>
      <div className="min-w-0">
        <p className="text-3xl font-bold leading-none text-slate-800">{value}</p>
        <p className="mt-1.5 text-[13px] leading-tight text-slate-400 sm:max-w-[120px] sm:text-sm">{label}</p>
      </div>
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
  const doneTopics = new Set<string>();
  let allS = 0, allT = 0;
  for (const r of results) {
    allS += r.score; allT += r.total;
    if (r.school_tests?.topic_id) doneTopics.add(r.school_tests.topic_id);
    const id = r.school_tests?.subject_id; if (!id) continue;
    const cur = bySubject.get(id) ?? { s: 0, t: 0 };
    bySubject.set(id, { s: cur.s + r.score, t: cur.t + r.total });
  }
  const overall = pct(allS, allT);
  const topicsDone = doneTopics.size;

  const stats = (
    <>
      <StatCard icon={<CheckIcon className="h-6 w-6" />} value={topicsDone}
        label={`${plural(topicsDone, 'выполненная', 'выполненные', 'выполненных')} ${plural(topicsDone, 'тема', 'темы', 'тем')}`} />
      <StatCard icon={<BoltIcon className="h-6 w-6" />} value={results.length}
        label={`${plural(results.length, 'пройденный', 'пройденных', 'пройденных')} ${plural(results.length, 'тест', 'теста', 'тестов')}`} />
    </>
  );

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Hero */}
      <section className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[34px] font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">Привет, {firstName}! 👋</h1>
          <p className="mt-3 max-w-md text-base text-slate-500 sm:text-lg">Ты на шаг ближе к своей цели — отличным результатам на ORT!</p>
        </div>
        <div className="hidden gap-4 lg:flex">{stats}</div>
      </section>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-x-8 lg:gap-y-9">
        {/* Nearest task / empty state */}
        <div className="lg:col-start-1 lg:row-start-1">
          {next ? (
            <Link href={`/student/tests/${next.id}`}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#f3f0ff_0%,#e9e4ff_100%)] p-7 ring-1 ring-violet-200/60 transition hover:shadow-[0_14px_40px_rgba(109,40,217,0.14)] sm:p-9">
              <span aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full bg-white/50" />
              <div className="relative">
                <span className="inline-block rounded-lg bg-white/70 px-3 py-1 text-xs font-semibold text-violet-600">Ближайшее задание</span>
                <div className="mt-4 flex items-center justify-between gap-5">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold leading-tight text-slate-800 sm:text-3xl">{next.topic_id ? topics[next.topic_id] ?? next.title : next.title}</h2>
                    <p className="mt-1.5 text-slate-500">Тема · {subjectLabel(next.subject_id)}</p>
                  </div>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-violet-400/40 transition group-hover:translate-x-1">
                    <ArrowRightIcon className="h-6 w-6" />
                  </span>
                </div>
              </div>
              <div className="relative mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                <span className="flex items-center gap-2"><CalendarIcon className="h-[18px] w-[18px] text-slate-400" />{formatDate(next.created_at)}</span>
                <span className="flex items-center gap-2"><FileIcon className="h-[18px] w-[18px] text-slate-400" />
                  {next.question_count} {plural(next.question_count, 'вопрос', 'вопроса', 'вопросов')}
                </span>
                {todo.length > 1 && <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-violet-600">+ ещё {todo.length - 1}</span>}
              </div>
            </Link>
          ) : (
            <div className={`${CARD} flex h-full flex-col items-center justify-center px-6 py-10 text-center`}>
              <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-violet-100/80 text-brand"><CheckIcon className="h-9 w-9" /></span>
              <p className="mt-5 text-xl font-bold text-slate-800">Новых заданий нет</p>
              <p className="mt-1.5 text-slate-400">Когда учитель отправит тест, он появится здесь.</p>
            </div>
          )}
        </div>

        {/* Stats — mobile only (desktop shows them in the hero) */}
        <div className="grid grid-cols-2 gap-3 lg:hidden">{stats}</div>

        {/* Accuracy */}
        <div className={`${CARD} p-7 lg:col-start-2 lg:row-start-1`}>
          <h2 className="text-lg font-bold text-slate-800">Моя точность</h2>
          {allT > 0 ? (
            <div className="mt-5 flex items-center gap-6">
              <Ring value={overall} />
              <span className="hidden h-24 w-px bg-slate-100 sm:block" />
              <div className="text-base text-slate-500">
                <p className="font-semibold text-slate-800">{allS} верных из {allT}</p>
                <p className="mt-1">в {results.length} {plural(results.length, 'тесте', 'тестах', 'тестах')}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Пройди первый тест — здесь появится твоя точность.</p>
          )}
        </div>

        {/* Recent results */}
        <section className="lg:col-start-1 lg:row-start-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 sm:text-xl">Последние результаты</h2>
            {results.length > 0 && (
              <Link href="/student/results" className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-brand hover:text-brand-hover">
                Все результаты <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
          <StudentResultsList items={items} />
        </section>

        {/* My topics */}
        {bySubject.size > 0 && (
          <section className={`${CARD} p-7 lg:col-start-2 lg:row-start-2 lg:self-start`}>
            <h2 className="text-lg font-bold text-slate-800">Мои темы</h2>
            <ul className="mt-5 space-y-6">
              {[...bySubject.entries()].map(([id, v]) => {
                const p = pct(v.s, v.t);
                return (
                  <li key={id} className="flex items-center gap-4">
                    <SubjectIcon id={id} tone="violet" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate font-semibold text-slate-800">{subjectLabel(id)}</p>
                        <span className="text-sm font-medium text-slate-500">{p}%</span>
                      </div>
                      <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-violet-100/80">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,#8b5cf6,#6d28d9)]" style={{ width: `${p}%` }} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
