'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { LineChart, RadarChart } from '@/components/charts';
import { UsersIcon, GraduationIcon, TrophyIcon, StarIcon } from '@/components/icons';
import * as agg from '@/lib/aggregate';

const THRESHOLD = 110;
const PALETTE = ['#7c3aed', '#14b8a6', '#ef4444', '#f59e0b', '#3b82f6', '#94a3b8'];

// Diverging scale: 0% red → 50% white → 100% green, so mid-range values
// (60–80%) get clearly distinct shades.
function accStyle(v: number) {
  const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
  let r: number, g: number, b: number;
  if (v <= 50) {
    const t = v / 50;
    r = lerp(239, 255, t); g = lerp(68, 255, t); b = lerp(68, 255, t);
  } else {
    const t = (v - 50) / 50;
    r = lerp(255, 34, t); g = lerp(255, 197, t); b = lerp(255, 94, t);
  }
  const strong = v <= 22 || v >= 82;
  return { backgroundColor: `rgb(${r}, ${g}, ${b})`, color: strong ? '#fff' : '#334155' };
}
function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export function AnalyticsView({
  students, classes, exams, results, stats,
}: {
  students: agg.Student[]; classes: agg.ClassRow[]; exams: agg.Exam[]; results: agg.Result[]; stats: agg.Stat[];
}) {
  const [scoreClass, setScoreClass] = useState('all');
  const [bestClass, setBestClass] = useState('all');
  const [supportClass, setSupportClass] = useState('all');
  const [hiddenRadar, setHiddenRadar] = useState<Set<string>>(new Set());
  const toggleRadar = (cls: string) =>
    setHiddenRadar((prev) => {
      const n = new Set(prev);
      if (n.has(cls)) n.delete(cls); else n.add(cls);
      return n;
    });

  const avgMock = agg.schoolAvgMock(exams, results);
  const avgRank = agg.avgRankLetter(students);
  const sCount = agg.rankDistribution(students).S;
  const dyn = agg.mockDynamics(exams, results);
  const classScores = agg.classMockAvg(students, classes, exams, results);
  const classXp = agg.classXpAvg(students, classes);
  const accuracy = agg.accuracyByClassSubject(students, classes, stats);
  const best = agg.topByXp(students, 5, bestClass);
  const support = agg.needsSupport(students, 5, supportClass);
  const clsName = (id: string) => classes.find((c) => c.id === id)?.name ?? '';

  const shownScores = scoreClass === 'all' ? classScores : classScores.filter((c) => c.cls === clsName(scoreClass));
  const xpMax = Math.max(1, ...classXp.map((c) => c.v));
  const xpNice = Math.ceil(xpMax / 1000) * 1000 || 1000;
  const radarSeries = accuracy.rows.map((r, i) => ({ label: r.cls, color: PALETTE[i % PALETTE.length], values: r.vals }));
  const shownRadar = radarSeries.filter((s) => !hiddenRadar.has(s.label));

  const KPI = [
    { label: 'Кол-во учеников', value: String(students.length), Icon: UsersIcon, chip: 'bg-violet-100 text-violet-600', num: 'text-violet-600' },
    { label: 'Средний балл ОРТ', value: avgMock ? String(avgMock) : '—', Icon: GraduationIcon, chip: 'bg-teal-100 text-teal-600', num: 'text-teal-600' },
    { label: 'Средний ранг', value: avgRank, Icon: TrophyIcon, chip: 'bg-amber-100 text-amber-600', num: 'text-amber-500' },
    { label: 'S ранг ученики', value: String(sCount), Icon: StarIcon, chip: 'bg-violet-100 text-violet-600', num: 'text-violet-600' },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Аналитика</h1>
        <p className="mt-1 text-sm text-slate-500">Три сигнала ученика: точность ответов, XP-активность и результаты пробных ОРТ.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm shadow-slate-200/50 ring-1 ring-slate-100">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.chip}`}><s.Icon className="h-6 w-6" /></span>
            <p className="flex-1 text-sm font-semibold leading-tight text-slate-700">{s.label}</p>
            <p className={`text-3xl font-bold tracking-tight ${s.num}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Mock dynamics */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-slate-800">Динамика пробных тестов</h2>
            <p className="text-xs text-slate-400">Средний балл школы по пробным ОРТ · пунктир — проходной порог {THRESHOLD}</p>
          </div>
          <span className="flex items-center gap-2 text-sm text-slate-500"><span className="h-2.5 w-2.5 rounded-full bg-brand" />Средний балл</span>
        </div>
        {dyn.values.length >= 2 ? (
          <LineChart labels={dyn.labels} values={dyn.values} max={245} threshold={THRESHOLD} thresholdLabel={`Порог ${THRESHOLD}`} />
        ) : (
          <p className="py-10 text-center text-sm text-slate-400">Нужно минимум два пробных, чтобы построить динамику.</p>
        )}
      </Card>

      {/* Class rankings */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-slate-800">Рейтинг классов по среднему баллу ОРТ</h2>
              <p className="text-xs text-slate-400">Средний балл пробных по классам</p>
            </div>
            <ClassSelect value={scoreClass} onChange={setScoreClass} classes={classes} />
          </div>
          <ul className="mt-5 space-y-4">
            {shownScores.length === 0 && <li className="py-4 text-center text-sm text-slate-400">Нет данных пробных</li>}
            {shownScores.map((c) => (
              <li key={c.cls} className="flex items-center gap-3">
                <span className="w-9 shrink-0 text-sm font-medium text-slate-600">{c.cls}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${(c.v / 245) * 100}%`, background: 'linear-gradient(90deg,#a78bfa,#6d28d9)' }} />
                </div>
                <span className="w-9 shrink-0 text-right text-sm font-semibold text-slate-700">{c.v}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-800">Рейтинг классов по XP</h2>
          <p className="text-xs text-slate-400">Активность в приложении Кадам (средний XP)</p>
          <div className="mt-4 flex gap-3">
            <div className="flex h-48 flex-col justify-between text-[11px] leading-none text-slate-400">
              {[1, 0.8, 0.6, 0.4, 0.2, 0].map((f) => (<span key={f}>{Math.round(xpNice * f)}</span>))}
            </div>
            <div className="flex-1">
              <div className="relative h-48">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-px bg-slate-100" />))}
                </div>
                <div className="relative flex h-full items-end justify-around">
                  {classXp.map((b) => (<div key={b.cls} className="w-11 rounded-t-md" style={{ height: `${(b.v / xpNice) * 100}%`, background: 'linear-gradient(180deg,#8b5cf6,#6d28d9)' }} />))}
                </div>
              </div>
              <div className="mt-2 flex justify-around text-xs font-medium text-slate-500">
                {classXp.map((b) => (<span key={b.cls}>{b.cls}</span>))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Accuracy heatmap + radar */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-slate-800">Карта точности по разделам</h2>
          <p className="mt-1 text-xs text-slate-400">Средняя точность ответов с первой попытки — зелёным где сильнее</p>
          {accuracy.rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Пока нет данных по практике.</p>
          ) : (
            <>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[440px] border-separate border-spacing-1 text-center text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400">
                      <th className="py-1" />
                      {accuracy.cols.map((c) => (<th key={c} className="py-1 font-medium">{c}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {accuracy.rows.map((row) => (
                      <tr key={row.cls}>
                        <td className="pr-2 text-left text-sm font-semibold text-slate-600">{row.cls}</td>
                        {row.vals.map((v, i) => (<td key={i}><div className="rounded-md py-2.5 text-xs font-semibold" style={accStyle(v)}>{v}%</div></td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <span>0%</span>
                <div className="h-2 w-48 rounded-full ring-1 ring-slate-200" style={{ background: 'linear-gradient(90deg,#ef4444,#ffffff 50%,#22c55e)' }} />
                <span>100%</span>
              </div>
            </>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-800">Сравнение классов по разделам</h2>
          <p className="mt-1 text-xs text-slate-400">Средняя точность по разделам ОРТ</p>
          {radarSeries.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Пока нет данных по практике.</p>
          ) : (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-6 sm:flex-nowrap">
              {shownRadar.length === 0 ? (
                <div className="flex h-[280px] w-full max-w-[280px] items-center justify-center text-center text-sm text-slate-400">Выберите класс справа</div>
              ) : (
                <RadarChart axes={accuracy.cols} series={shownRadar} max={100} size={280} />
              )}
              <div className="flex flex-col gap-2">
                {radarSeries.map((s) => {
                  const on = !hiddenRadar.has(s.label);
                  return (
                    <button key={s.label} onClick={() => toggleRadar(s.label)} className="flex items-center gap-2 text-sm text-slate-600 transition hover:text-slate-800">
                      <span className="flex h-4 w-4 items-center justify-center rounded-[5px] transition" style={{ background: on ? s.color : '#e2e8f0' }}>
                        {on && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 6" /></svg>
                        )}
                      </span>
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Top / support by XP */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><h2 className="font-semibold text-slate-800">Топ-5 по активности</h2><p className="text-xs text-slate-400">Больше всего XP</p></div>
            <ClassSelect value={bestClass} onChange={setBestClass} classes={classes} />
          </div>
          <ul className="mt-4 space-y-1">
            {best.map((s, i) => (
              <li key={s.id} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50">
                <span className="w-4 shrink-0 text-sm font-semibold text-slate-400">{i + 1}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">{initials(s.name)}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{s.name}</p><p className="text-xs text-slate-400">{clsName(s.class_id ?? '')}</p></div>
                <span className="text-sm font-bold text-teal-600">{s.xp} XP</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><h2 className="font-semibold text-slate-800">Требуют поддержки</h2><p className="text-xs text-slate-400">Меньше всего активности в приложении</p></div>
            <ClassSelect value={supportClass} onChange={setSupportClass} classes={classes} />
          </div>
          <ul className="mt-4 space-y-1">
            {support.length === 0 && (
              <li className="py-6 text-center text-sm text-slate-400">Все ученики выше среднего по XP 🎉</li>
            )}
            {support.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">{initials(s.name)}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{s.name}</p><p className="text-xs text-slate-400">{clsName(s.class_id ?? '')}</p></div>
                <span className="text-sm font-bold text-amber-600">{s.xp} XP</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function ClassSelect({ value, onChange, classes }: { value: string; onChange: (v: string) => void; classes: agg.ClassRow[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 outline-none transition focus:border-brand">
      <option value="all">Все классы</option>
      {classes.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
    </select>
  );
}
