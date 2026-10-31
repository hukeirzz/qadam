import Link from 'next/link';
import { getStudent } from '@/lib/auth';
import { loadStudentData } from '@/lib/student-data';
import { CARD, plural } from '@/components/student-widgets';
import { EmptyState } from '@/components/student-tasks';
import { SubjectIcon } from '@/components/subject-icon';
import { ArrowRightIcon } from '@/components/icons';
import { formatDate, formatDuration, pct, subjectLabel } from '@/lib/student-ui';

const WEAK_BELOW = 60; // % — below this a topic is shown under "Стоит повторить"

export default async function StudentResultsPage() {
  const { student } = await getStudent();
  const { results, topicTitles } = await loadStudentData(student!.id);

  const score = results.reduce((a, r) => a + r.score, 0);
  const total = results.reduce((a, r) => a + r.total, 0);

  // Accuracy per topic. A test belongs to exactly one topic, so this is exact — tests
  // without a topic are left out of this breakdown (they still count in the totals).
  const byTopic = new Map<string, { title: string; s: number; t: number; tests: number }>();
  for (const r of results) {
    const tid = r.school_tests?.topic_id;
    if (!tid) continue;
    const cur = byTopic.get(tid) ?? { title: topicTitles[tid] ?? 'Тема', s: 0, t: 0, tests: 0 };
    cur.s += r.score; cur.t += r.total; cur.tests += 1;
    byTopic.set(tid, cur);
  }
  const topics = [...byTopic.values()].map((v) => ({ ...v, p: pct(v.s, v.t) })).sort((a, b) => a.p - b.p);
  const weak = topics.filter((t) => t.p < WEAK_BELOW);

  const stats = [
    { label: 'Верных ответов', value: total ? `${pct(score, total)}%` : '—', hint: total ? `${score} из ${total}` : undefined },
    { label: 'Решено вопросов', value: String(total), hint: undefined },
    { label: 'Завершено тестов', value: String(results.length), hint: undefined },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Результаты</h1>
        <p className="mt-1 text-sm text-slate-500">По завершённым тестам.</p>
      </div>

      {results.length === 0 ? (
        <EmptyState title="Результатов пока нет" text="Они появятся после первого завершённого теста." />
      ) : (
        <>
          <dl className="grid gap-3 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className={`${CARD} p-5`}>
                <dt className="text-sm text-slate-500">{s.label}</dt>
                <dd className="mt-1.5 text-2xl font-semibold text-slate-900">{s.value}</dd>
                {s.hint && <p className="mt-0.5 text-xs text-slate-400">{s.hint}</p>}
              </div>
            ))}
          </dl>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-x-8">
            <section aria-labelledby="history">
              <h2 id="history" className="mb-3 text-sm font-semibold text-slate-900">История тестов</h2>
              <ul className="divide-y divide-slate-100 rounded-xl bg-white p-1.5 ring-1 ring-slate-200/70">
                {results.map((r) => {
                  const p = pct(r.score, r.total);
                  const topic = r.school_tests?.topic_id ? topicTitles[r.school_tests.topic_id] : null;
                  return (
                    <li key={r.test_id}>
                      <Link href={`/student/tests/${r.test_id}`}
                        className="group flex items-center gap-4 rounded-lg px-3 py-3.5 outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand/40 sm:px-4">
                        <SubjectIcon id={r.school_tests?.subject_id ?? null} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{topic ?? r.school_tests?.title ?? 'Тест'}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">{subjectLabel(r.school_tests?.subject_id ?? null)}</p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {formatDate(r.created_at)}{formatDuration(r.duration_seconds) ? ` · ${formatDuration(r.duration_seconds)}` : ''}
                          </p>
                        </div>
                        <div className="w-24 text-right">
                          <p className="text-sm font-semibold text-slate-900">{r.score}/{r.total} <span className="font-normal text-slate-400">· {p}%</span></p>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className={`h-full rounded-full ${p < WEAK_BELOW ? 'bg-amber-500' : 'bg-brand'}`} style={{ width: `${p}%` }} />
                          </div>
                        </div>
                        <ArrowRightIcon className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-brand" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>

            <div className="space-y-6">
              {topics.length > 0 && (
                <section className={`${CARD} p-5`} aria-labelledby="topics">
                  <h2 id="topics" className="text-sm font-semibold text-slate-900">По темам</h2>
                  <ul className="mt-4 space-y-4">
                    {topics.map((t) => (
                      <li key={t.title}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="truncate font-medium text-slate-800">{t.title}</span>
                          <span className="shrink-0 text-xs text-slate-500">{t.p}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full ${t.p < WEAK_BELOW ? 'bg-amber-500' : 'bg-brand'}`} style={{ width: `${t.p}%` }} />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">{t.tests} {plural(t.tests, 'тест', 'теста', 'тестов')} · {t.s} из {t.t}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {weak.length > 0 && (
                <section className="rounded-xl bg-amber-50/60 p-5 ring-1 ring-amber-200/70" aria-labelledby="weak">
                  <h2 id="weak" className="text-sm font-semibold text-amber-900">Стоит повторить</h2>
                  <p className="mt-1 text-xs text-amber-800/80">Точность ниже {WEAK_BELOW}%:</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-amber-950">
                    {weak.map((t) => <li key={t.title} className="flex justify-between gap-3"><span className="truncate">{t.title}</span><span className="shrink-0 font-medium">{t.p}%</span></li>)}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
