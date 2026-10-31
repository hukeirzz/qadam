import Link from 'next/link';
import { getStudent, getServerApi } from '@/lib/auth';
import { ArrowRightIcon, BoltIcon, CheckIcon } from '@/components/icons';
import { StudentResultsList, type ResultItem } from '@/components/student-results-list';
import { AccuracyCard, CARD, StatCard, TopicsCard, plural } from '@/components/student-widgets';

export default async function StudentProfilePage() {
  const { student } = await getStudent();
  const api = await getServerApi();
  const [results, topics] = await Promise.all([api.studentData.results(student!.id), api.studentData.topicTitles()]);

  const bySubject = new Map<string, { s: number; t: number }>();
  const doneTopics = new Set<string>();
  let score = 0, total = 0;
  for (const r of results) {
    score += r.score; total += r.total;
    if (r.school_tests?.topic_id) doneTopics.add(r.school_tests.topic_id);
    const id = r.school_tests?.subject_id; if (!id) continue;
    const cur = bySubject.get(id) ?? { s: 0, t: 0 };
    bySubject.set(id, { s: cur.s + r.score, t: cur.t + r.total });
  }
  const topicsDone = doneTopics.size;

  const items: ResultItem[] = results.slice(0, 6).map((r) => ({
    testId: r.test_id, title: r.school_tests?.title ?? 'Тест', subjectId: r.school_tests?.subject_id ?? null,
    topicTitle: r.school_tests?.topic_id ? topics[r.school_tests.topic_id] ?? null : null,
    score: r.score, total: r.total, createdAt: r.created_at,
  }));

  const initials = student!.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  const info = [
    { label: 'Email', value: student!.email },
    { label: 'Класс', value: student!.classLabel ?? '—' },
    { label: 'Школа', value: student!.schoolName ?? '—' },
  ];

  // Two columns on lg sharing the same edges as the home page. Wrappers use `contents` on mobile
  // so the blocks interleave there: identity, stats, accuracy, history, topics.
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-x-6">
      <div className="contents lg:flex lg:flex-col lg:gap-5">
        <section className={`${CARD} order-1 p-5 lg:order-none`}>
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white">{initials}</span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">{student!.name}</h1>
              {student!.classLabel && <span className="mt-1 inline-block rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">{student!.classLabel} класс</span>}
            </div>
          </div>
          <dl className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
            {info.map((i) => (
              <div key={i.label} className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-slate-400">{i.label}</dt>
                <dd className="truncate text-sm font-medium text-slate-800">{i.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="order-4 lg:order-none">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 sm:text-lg">История тестов</h2>
            {results.length > 6 && (
              <Link href="/student/results" className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-brand hover:text-brand-hover">
                Все результаты <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
          <StudentResultsList items={items} />
        </section>
      </div>

      <div className="contents lg:flex lg:flex-col lg:gap-5">
        <div className="order-2 grid grid-cols-2 gap-3 lg:order-none">
          <StatCard icon={<CheckIcon className="h-5 w-5" />} value={topicsDone}
            label={`${plural(topicsDone, 'выполненная', 'выполненные', 'выполненных')} ${plural(topicsDone, 'тема', 'темы', 'тем')}`} />
          <StatCard icon={<BoltIcon className="h-5 w-5" />} value={results.length}
            label={`${plural(results.length, 'пройденный', 'пройденных', 'пройденных')} ${plural(results.length, 'тест', 'теста', 'тестов')}`} />
        </div>
        <AccuracyCard score={score} total={total} tests={results.length} className="order-3 lg:order-none" />
        <TopicsCard bySubject={bySubject} className="order-5 lg:order-none" />
      </div>
    </div>
  );
}
