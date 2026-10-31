import Link from 'next/link';
import { getStudent, getServerApi } from '@/lib/auth';
import { ArrowRightIcon, BoltIcon, CalendarIcon, CheckIcon, FileIcon } from '@/components/icons';
import { StudentResultsList, type ResultItem } from '@/components/student-results-list';
import { SubjectIcon } from '@/components/subject-icon';
import { formatDate, pct, subjectLabel } from '@/lib/student-ui';

const CARD = 'rounded-2xl bg-white ring-1 ring-slate-200/70';

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

/** Circular progress (SVG): neutral track + violet arc, percentage and caption in the middle. */
function Ring({ value, size = 116 }: { value: number; size?: number }) {
  const stroke = 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef0f4" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#6d28d9" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold leading-none text-slate-800">{value}%</span>
        <span className="mt-1 text-xs text-slate-400">средняя</span>
      </span>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className={`${CARD} flex min-w-0 items-center gap-3 px-4 py-3.5`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-brand">{icon}</span>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none text-slate-800">{value}</p>
        <p className="mt-1 text-xs leading-tight text-slate-400">{label}</p>
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

  // One grid for the whole page so the right column's edges line up from top to bottom.
  // DOM order = mobile order (hero, task, stats, accuracy, results, topics); on lg it is placed explicitly.
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-6 lg:gap-y-6">
      <section className="lg:col-start-1 lg:row-start-1 lg:self-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Привет, {firstName}! 👋</h1>
        <p className="mt-1.5 max-w-md text-sm text-slate-500 sm:text-base">Ты на шаг ближе к своей цели — отличным результатам на ORT!</p>
      </section>

      {/* Nearest task / empty state */}
      <div className="lg:col-start-1 lg:row-start-2">
        {next ? (
          <Link href={`/student/tests/${next.id}`}
            className="group flex h-full flex-col justify-between gap-6 rounded-2xl bg-violet-50 p-6 ring-1 ring-violet-200/70 transition hover:ring-violet-300">
            <div>
              <span className="inline-block rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-violet-600">Ближайшее задание</span>
              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-slate-800">{next.topic_id ? topics[next.topic_id] ?? next.title : next.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">Тема · {subjectLabel(next.subject_id)}</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white transition group-hover:translate-x-0.5">
                  <ArrowRightIcon className="h-5 w-5" />
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
              <span className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-slate-400" />{formatDate(next.created_at)}</span>
              <span className="flex items-center gap-2"><FileIcon className="h-4 w-4 text-slate-400" />
                {next.question_count} {plural(next.question_count, 'вопрос', 'вопроса', 'вопросов')}
              </span>
              {todo.length > 1 && <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-violet-600">+ ещё {todo.length - 1}</span>}
            </div>
          </Link>
        ) : (
          <div className={`${CARD} flex h-full min-h-[200px] flex-col items-center justify-center px-6 py-8 text-center`}>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-brand"><CheckIcon className="h-6 w-6" /></span>
            <p className="mt-4 text-base font-bold text-slate-800">Новых заданий нет</p>
            <p className="mt-1 text-sm text-slate-400">Когда учитель отправит тест, он появится здесь.</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:col-start-2 lg:row-start-1 lg:self-center">
        <StatCard icon={<CheckIcon className="h-5 w-5" />} value={topicsDone}
          label={`${plural(topicsDone, 'выполненная', 'выполненные', 'выполненных')} ${plural(topicsDone, 'тема', 'темы', 'тем')}`} />
        <StatCard icon={<BoltIcon className="h-5 w-5" />} value={results.length}
          label={`${plural(results.length, 'пройденный', 'пройденных', 'пройденных')} ${plural(results.length, 'тест', 'теста', 'тестов')}`} />
      </div>

      {/* Accuracy */}
      <div className={`${CARD} p-5 lg:col-start-2 lg:row-start-2`}>
        <h2 className="text-base font-bold text-slate-800">Моя точность</h2>
        {allT > 0 ? (
          <div className="mt-4 flex items-center gap-5">
            <Ring value={overall} />
            <span className="h-16 w-px bg-slate-100" />
            <div className="text-sm text-slate-500">
              <p className="font-semibold text-slate-800">{allS} верных из {allT}</p>
              <p className="mt-0.5">в {results.length} {plural(results.length, 'тесте', 'тестах', 'тестах')}</p>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400">Пройди первый тест — здесь появится твоя точность.</p>
        )}
      </div>

      {/* Recent results */}
      <section className="lg:col-start-1 lg:row-start-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 sm:text-lg">Последние результаты</h2>
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
        <section className={`${CARD} p-5 lg:col-start-2 lg:row-start-3 lg:self-start`}>
          <h2 className="text-base font-bold text-slate-800">Мои темы</h2>
          <ul className="mt-4 space-y-5">
            {[...bySubject.entries()].map(([id, v]) => {
              const p = pct(v.s, v.t);
              return (
                <li key={id} className="flex items-center gap-3">
                  <SubjectIcon id={id} tone="violet" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-800">{subjectLabel(id)}</p>
                      <span className="text-xs font-medium text-slate-500">{p}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${p}%` }} />
                    </div>
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
