'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { KpiCard } from '@/components/kpi-card';
import { plural } from '@/components/student-widgets';
import { LineChart, DonutChart } from '@/components/charts';
import { UsersIcon, GraduationIcon, WarningIcon, StarIcon } from '@/components/icons';
import * as agg from '@/lib/aggregate';

const THRESHOLD = 110;
const MAX_SCORE = 245;
const HELP_BELOW = 40; // точность по школьным тестам, % — ниже нужна помощь
const TOP_ABOVE = 80; // точность, % — выше по всем темам
const WEAK_BELOW = 50; // тема считается слабой при точности ниже, %

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export function AnalyticsView({
  students, classes, exams, results, topics, topicResults,
}: {
  students: agg.Student[]; classes: agg.ClassRow[]; exams: agg.Exam[]; results: agg.Result[];
  topics: { id: string; title: string }[];
  topicResults: agg.TestResultRow[];
}) {
  const examsWithResults = exams.filter((e) => results.some((r) => r.exam_id === e.id));
  const [examId, setExamId] = useState(examsWithResults[examsWithResults.length - 1]?.id ?? '');

  const avgMock = agg.schoolAvgMock(exams, results);
  const dyn = agg.mockDynamics(exams, results);
  const classScores = agg.classMockAvg(students, classes, exams, results);
  const accuracy = agg.studentAccuracy(topicResults);
  const deltas = agg.mockDeltaByStudent(exams, results);
  const latest = agg.latestMockByStudent(exams, results);
  const weak = agg.weakTopicTitles(topicResults, topics, WEAK_BELOW, 2);
  const topSet = agg.allTopicsAbove(topicResults, TOP_ABOVE);
  const clsName = (id: string | null) => classes.find((c) => c.id === id)?.name ?? '—';

  const needHelp = students
    .flatMap((s) => {
      const acc = accuracy.get(s.id);
      return acc != null && acc < HELP_BELOW ? [{ s, acc }] : [];
    })
    .sort((a, b) => a.acc - b.acc);


  const examTotals = results.filter((r) => r.exam_id === examId).map((r) => r.total);
  const buckets = agg.scoreBuckets(examTotals);
  const examAvg = examTotals.length ? Math.round(examTotals.reduce((a, b) => a + b, 0) / examTotals.length) : 0;

  const mockCount = examsWithResults.length;
  const supportCount = needHelp.length;
  const kpis = [
    { Icon: UsersIcon, label: 'Учеников', value: String(students.length), sub: classes.length ? `в ${classes.length} ${plural(classes.length, 'классе', 'классах', 'классах')}` : undefined, tone: 'violet' as const },
    { Icon: GraduationIcon, label: 'Средний балл ОРТ', value: avgMock ? String(avgMock) : '—', sub: mockCount ? `по ${mockCount} ${plural(mockCount, 'пробному', 'пробным', 'пробным')} · из 245` : 'пробных пока нет', tone: 'teal' as const },
    { Icon: WarningIcon, label: 'Нужна поддержка', value: String(supportCount), sub: `точность ниже ${HELP_BELOW}%`, tone: 'orange' as const, alert: supportCount > 0 },
    { Icon: StarIcon, label: 'Сильные ученики', value: String(students.filter((s) => topSet.has(s.id)).length), sub: `выше ${TOP_ABOVE}% по каждой теме`, tone: 'emerald' as const },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Аналитика</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-slate-800">Динамика пробных тестов</h2>
            <p className="text-xs text-slate-400">Средний балл школы по пробным ОРТ · пунктир — проходной порог {THRESHOLD}</p>
          </div>
          <span className="flex items-center gap-2 text-sm text-slate-500"><span className="h-2.5 w-2.5 rounded-full bg-brand" />Средний балл</span>
        </div>
        {dyn.values.length >= 2 ? (
          <LineChart labels={dyn.labels} values={dyn.values} max={MAX_SCORE} threshold={THRESHOLD} thresholdLabel={`Порог ${THRESHOLD}`} />
        ) : (
          <p className="py-10 text-center text-sm text-slate-400">Динамика появится после двух пробных экзаменов.</p>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-slate-800">Рейтинг классов по среднему баллу ОРТ</h2>
          {classScores.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Пока нет результатов пробных.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {classScores.map((c, i) => (
                <li key={c.cls} className="flex items-center gap-3">
                  <span className="w-5 shrink-0 text-sm font-semibold text-slate-400">{i + 1}</span>
                  <span className="w-20 shrink-0 truncate text-sm font-medium text-slate-700">{c.cls}</span>
                  <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-none bg-slate-100">
                    <div
                      className="h-full rounded-none"
                      style={{ width: `${Math.min(100, (100 * c.v) / MAX_SCORE)}%`, background: c.v >= THRESHOLD ? '#6d28d9' : '#ef4444' }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm font-semibold text-slate-700">{c.v}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-slate-800">Результаты пробных ОРТ</h2>
            {examsWithResults.length > 0 && (
              <select value={examId} onChange={(e) => setExamId(e.target.value)}
                className="max-w-[10rem] rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 outline-none transition focus:border-brand">
                {examsWithResults.map((e) => (<option key={e.id} value={e.id}>{e.name}</option>))}
              </select>
            )}
          </div>
          {examTotals.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Пока нет результатов пробных.</p>
          ) : (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-8">
              <div className="relative">
                <DonutChart segments={buckets} size={180} thickness={26} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800">{examAvg}</span>
                  <span className="text-xs text-slate-400">средний балл</span>
                </div>
              </div>
              <ul className="space-y-2.5 text-sm">
                {buckets.map((b) => (
                  <li key={b.label} className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: b.color }} />
                    <span className="w-24 text-slate-600">{b.label}</span>
                    <span className="font-medium text-slate-700">{b.value} {pluralStudents(b.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">Ученики, которым нужна помощь</h2>
            <p className="text-xs text-slate-400">Точность по школьным тестам ниже {HELP_BELOW}%</p>
          </div>
          <Link href="/students" className="shrink-0 self-start whitespace-nowrap text-sm font-medium text-brand hover:text-brand-hover sm:self-auto">Все ученики</Link>
        </div>
        <ul className="mt-3 divide-y divide-slate-100 sm:hidden">
          {needHelp.length === 0 && <li className="py-7 text-center"><p className="text-sm font-semibold text-slate-700">Всё в норме 🎉</p><p className="mt-1 text-xs text-slate-400">Учеников, которым нужна помощь, нет</p></li>}
          {needHelp.map(({ s, acc }) => {
            const d = deltas.get(s.id);
            const weakList = (weak.get(s.id) ?? []).join(', ');
            return (
              <li key={s.id} className="py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-700">{initials(s.name)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400">{clsName(s.class_id)}{latest.has(s.id) ? ` · ОРТ ${latest.get(s.id)}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-500">{acc}%</p>
                    <p className={`text-xs font-semibold ${d == null ? 'text-slate-400' : d >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{d == null ? '—' : `${d >= 0 ? '↑ +' : '↓ −'}${Math.abs(d)}`}</p>
                  </div>
                </div>
                {weakList && <p className="mt-1.5 text-xs text-slate-500">Слабые темы: {weakList}</p>}
                <Link href={`/students/${s.id}`} className="mt-2 inline-block rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">Посмотреть</Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 hidden overflow-x-auto sm:block">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
                <th className="px-2 py-3 font-medium">Ученик</th>
                <th className="hidden px-2 py-3 font-medium sm:table-cell">Слабые темы</th>
                <th className="px-2 py-3 font-medium">Средний результат</th>
                <th className="px-2 py-3 font-medium">Динамика</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {needHelp.length === 0 && (
                <tr><td colSpan={5} className="px-2 py-8 text-center text-sm text-slate-400">Всё в норме — таких учеников нет 🎉</td></tr>
              )}
              {needHelp.map(({ s, acc }) => {
                const d = deltas.get(s.id);
                return (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-700">{initials(s.name)}</span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">{s.name}</p>
                          <p className="text-xs text-slate-400">{clsName(s.class_id)}{latest.has(s.id) ? ` · ОРТ ${latest.get(s.id)}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-2 py-3 text-slate-600 sm:table-cell">{(weak.get(s.id) ?? []).join(', ') || '—'}</td>
                    <td className="px-2 py-3 font-semibold text-red-500">{acc}%</td>
                    <td className={`px-2 py-3 text-xs font-semibold ${d == null ? 'text-slate-400' : d >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {d == null ? '—' : `${d >= 0 ? '↑ +' : '↓ −'}${Math.abs(d)}`}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <Link href={`/students/${s.id}`} className="whitespace-nowrap rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:bg-violet-100">Посмотреть</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function pluralStudents(n: number) {
  const m = n % 100;
  if (m >= 11 && m <= 14) return 'учеников';
  const l = n % 10;
  if (l === 1) return 'ученик';
  if (l >= 2 && l <= 4) return 'ученика';
  return 'учеников';
}
