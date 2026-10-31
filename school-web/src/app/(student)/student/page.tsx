import Link from 'next/link';
import { getStudent, getServerApi } from '@/lib/auth';
import { ArrowRightIcon, BoltIcon, CalendarIcon, CheckIcon, FileIcon } from '@/components/icons';
import { StudentResultsList, type ResultItem } from '@/components/student-results-list';
import { AccuracyCard, CARD, StatCard, TopicsCard, plural } from '@/components/student-widgets';
import { formatDate, pct, subjectLabel } from '@/lib/student-ui';

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

      <AccuracyCard score={allS} total={allT} tests={results.length} className="lg:col-start-2 lg:row-start-2" />

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

      <TopicsCard bySubject={bySubject} className="lg:col-start-2 lg:row-start-3 lg:self-start" />
    </div>
  );
}
