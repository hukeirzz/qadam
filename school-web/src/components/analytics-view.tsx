'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, InfoHint } from '@/components/ui';
import { LineChart, DonutChart } from '@/components/charts';
import { UsersIcon, GraduationIcon, WarningIcon, StarIcon } from '@/components/icons';
import * as agg from '@/lib/aggregate';

const THRESHOLD = 110;
const MAX_SCORE = 245;
const HELP_BELOW = 40; // точность по школьным тестам, % — ниже нужна помощь
const TOP_ABOVE = 80; // точность, % — выше по всем темам
const TOPICS_PREVIEW = 6;
const WEAK_BELOW = 50; // тема считается слабой при точности ниже, %

function topicColor(acc: number) {
  if (acc >= 75) return '#22c55e';
  if (acc >= 50) return '#6366f1';
  if (acc >= 40) return '#f59e0b';
  return '#ef4444';
}

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
  const [showAllTopics, setShowAllTopics] = useState(false);
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

  const topicProgress = agg.topicTestProgress(topicResults);
  const topicRows = topics
    .flatMap((t) => {
      const v = topicProgress.get(t.id);
      return v ? [{ id: t.id, title: t.title, acc: v.acc, delta: v.delta }] : [];
    })
    .sort((a, b) => a.acc - b.acc);
  const shownTopics = showAllTopics ? topicRows : topicRows.slice(0, TOPICS_PREVIEW);

  const examTotals = results.filter((r) => r.exam_id === examId).map((r) => r.total);
  const buckets = agg.scoreBuckets(examTotals);
  const examAvg = examTotals.length ? Math.round(examTotals.reduce((a, b) => a + b, 0) / examTotals.length) : 0;

  const KPI = [
    { label: 'Кол-во учеников', value: String(students.length), Icon: UsersIcon, chip: 'bg-violet-100 text-violet-600', num: 'text-violet-600' },
    { label: 'Средний балл ОРТ', value: avgMock ? String(avgMock) : '—', Icon: GraduationIcon, chip: 'bg-teal-100 text-teal-600', num: 'text-teal-600' },
    { label: 'Нужна поддержка', hint: `Точность ответов ниже ${HELP_BELOW}%`, value: String(needHelp.length), Icon: WarningIcon, chip: 'bg-orange-100 text-orange-500', num: 'text-red-500' },
    { label: 'Сильные ученики', hint: `Выше ${TOP_ABOVE}% по каждой теме`, value: String(students.filter((s) => topSet.has(s.id)).length), Icon: StarIcon, chip: 'bg-emerald-100 text-emerald-600', num: 'text-emerald-600' },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Аналитика</h1>
      </header>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {KPI.map((s) => (
          <div key={s.label} className="flex flex-col gap-2.5 rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/50 ring-1 ring-slate-100 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${s.chip}`}><s.Icon className="h-5 w-5 sm:h-6 sm:w-6" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight text-slate-700">
                {s.label}
                {s.hint && <> <InfoHint text={s.hint} /></>}
              </p>
            </div>
            <p className={`text-2xl font-bold tracking-tight sm:text-3xl ${s.num}`}>{s.value}</p>
          </div>
        ))}
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
                  <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Успеваемость по темам</h2>
            <p className="text-xs text-slate-400">Результаты школьных тестов по темам, от слабых к сильным · динамика — последний тест против предыдущего</p>
          </div>
          {topicRows.length > TOPICS_PREVIEW && (
            <button onClick={() => setShowAllTopics((v) => !v)} className="text-sm font-medium text-brand hover:text-brand-hover">
              {showAllTopics ? 'Свернуть' : 'Все темы →'}
            </button>
          )}
        </div>
        {topicRows.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">Пока нет результатов школьных тестов по темам.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
                  <th className="px-2 py-3 font-medium">Тема</th>
                  <th className="px-2 py-3 font-medium">Процент правильных ответов</th>
                  <th className="px-2 py-3 text-right font-medium">Динамика</th>
                </tr>
              </thead>
              <tbody>
                {shownTopics.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-2 py-3.5 font-medium text-slate-800">{t.title}</td>
                    <td className="px-2 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 min-w-24 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full" style={{ width: `${t.acc}%`, background: topicColor(t.acc) }} />
                        </div>
                        <span className="w-10 shrink-0 text-right font-medium text-slate-700">{t.acc}%</span>
                      </div>
                    </td>
                    <td className={`whitespace-nowrap px-2 py-3.5 text-right text-xs font-semibold ${t.delta == null ? 'text-slate-400' : t.delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {t.delta == null ? '—' : `${t.delta >= 0 ? '↑ +' : '↓ −'}${Math.abs(t.delta)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Ученики, которым нужна помощь</h2>
            <p className="text-xs text-slate-400">Точность по школьным тестам ниже {HELP_BELOW}%</p>
          </div>
          <Link href="/students" className="text-sm font-medium text-brand hover:text-brand-hover">Все ученики</Link>
        </div>
        <div className="mt-4 overflow-x-auto">
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
