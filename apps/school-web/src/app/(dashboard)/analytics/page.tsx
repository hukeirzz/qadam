'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { LineChart, RadarChart } from '@/components/charts';
import { UsersIcon, GraduationIcon, TrophyIcon, StarIcon } from '@/components/icons';

// NOTE: Stage-1 analytics — placeholder figures shaped to the design.
// Built on the three student signals: точность (first-try accuracy), XP
// (app engagement), пробные (mock ОРТ scores). Wire to Supabase aggregates
// once school data exists.

const THRESHOLD = 110; // проходной порог ОРТ (грант/поступление)
const CLASSES = ['11А', '11Б', '10А', '10Б'];

const STATS = [
  { label: 'Кол-во учеников', value: '248', Icon: UsersIcon, chip: 'bg-violet-100 text-violet-600', num: 'text-violet-600' },
  { label: 'Средний балл ОРТ', value: '156', Icon: GraduationIcon, chip: 'bg-teal-100 text-teal-600', num: 'text-teal-600' },
  { label: 'Средний ранг', value: 'B', Icon: TrophyIcon, chip: 'bg-amber-100 text-amber-600', num: 'text-amber-500' },
  { label: 'S ранг ученики', value: '18', Icon: StarIcon, chip: 'bg-violet-100 text-violet-600', num: 'text-violet-600' },
];

const MOCK = {
  labels: ['Проб. 1', 'Проб. 2', 'Проб. 3', 'Проб. 4', 'Проб. 5', 'Проб. 6'],
  values: [128, 134, 141, 148, 152, 156],
  max: 245,
};

// #2 — mock ОРТ averages per class
const CLASS_SCORES = [
  { cls: '11Б', v: 210 },
  { cls: '11А', v: 180 },
  { cls: '10Б', v: 150 },
  { cls: '10А', v: 120 },
];

// #3 — average XP per class (app engagement)
const CLASS_XP = [
  { cls: '11Б', v: 2400 },
  { cls: '11А', v: 2100 },
  { cls: '10А', v: 1600 },
];
const XP_MAX = 3000;

// #4 / #5 — first-try accuracy per class × section (higher = better)
const ACC_COLS = ['Мат', 'Гео', 'Анал', 'Чт', 'Грам'];
const ACC_ROWS = [
  { cls: '11А', vals: [85, 90, 78, 72, 80] },
  { cls: '11Б', vals: [88, 70, 82, 76, 74] },
  { cls: '10А', vals: [72, 80, 75, 68, 78] },
  { cls: '10Б', vals: [65, 70, 82, 60, 72] },
];

const RADAR_AXES = ACC_COLS;
const RADAR_SERIES = [
  { label: '11А', color: '#7c3aed', values: ACC_ROWS[0].vals },
  { label: '11Б', color: '#14b8a6', values: ACC_ROWS[1].vals },
  { label: '10А', color: '#ef4444', values: ACC_ROWS[2].vals },
  { label: '10Б', color: '#94a3b8', values: ACC_ROWS[3].vals },
];

// #6 — students by XP (engagement)
const STUDENTS = [
  { name: 'Дружинин Алишер', cls: '11Б', xp: 2450 },
  { name: 'Нурлан Бейбарс', cls: '11А', xp: 2270 },
  { name: 'Элина Касымова', cls: '11Б', xp: 2150 },
  { name: 'Сиа Бексат', cls: '11А', xp: 2100 },
  { name: 'Руслан Токтогул', cls: '10Б', xp: 2050 },
  { name: 'Айгерим Максат', cls: '10А', xp: 1980 },
  { name: 'Мадина Сапар', cls: '11Б', xp: 1720 },
  { name: 'Тимур Осмон', cls: '10А', xp: 1540 },
  { name: 'Данияр Талас', cls: '10А', xp: 560 },
  { name: 'Марат Кубат', cls: '10Б', xp: 480 },
  { name: 'Бекзат Асан', cls: '11А', xp: 420 },
  { name: 'Асель Рахат', cls: '11Б', xp: 380 },
  { name: 'Алина Мурат', cls: '10Б', xp: 320 },
];

function accStyle(v: number) {
  const a = 0.1 + (v / 100) * 0.75;
  return { backgroundColor: `rgba(34, 197, 94, ${a})`, color: v >= 58 ? '#fff' : '#15803d' };
}

function initialsOf(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

function ClassSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 outline-none transition focus:border-brand"
    >
      <option value="all">Все классы</option>
      {CLASSES.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );
}

export default function AnalyticsPage() {
  const [scoreClass, setScoreClass] = useState('all');
  const [bestClass, setBestClass] = useState('all');
  const [supportClass, setSupportClass] = useState('all');

  const shownScores = scoreClass === 'all' ? CLASS_SCORES : CLASS_SCORES.filter((c) => c.cls === scoreClass);
  const bestPool = bestClass === 'all' ? STUDENTS : STUDENTS.filter((s) => s.cls === bestClass);
  const supportPool = supportClass === 'all' ? STUDENTS : STUDENTS.filter((s) => s.cls === supportClass);
  const best = [...bestPool].sort((a, b) => b.xp - a.xp).slice(0, 5);
  const support = [...supportPool].sort((a, b) => a.xp - b.xp).slice(0, 5);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Аналитика</h1>
        <p className="mt-1 text-sm text-slate-500">Три сигнала ученика: точность ответов, XP-активность и результаты пробных ОРТ.</p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm shadow-slate-200/50 ring-1 ring-slate-100">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.chip}`}>
              <s.Icon className="h-6 w-6" />
            </span>
            <p className="flex-1 text-sm font-semibold leading-tight text-slate-700">{s.label}</p>
            <p className={`text-3xl font-bold tracking-tight ${s.num}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* 1) Mock test dynamics */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-slate-800">Динамика пробных тестов</h2>
            <p className="text-xs text-slate-400">Средний балл школы по пробным ОРТ · пунктир — проходной порог {THRESHOLD}</p>
          </div>
          <span className="flex items-center gap-2 text-sm text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" />
            Средний балл
          </span>
        </div>
        <LineChart labels={MOCK.labels} values={MOCK.values} max={MOCK.max} threshold={THRESHOLD} thresholdLabel={`Порог ${THRESHOLD}`} />
      </Card>

      {/* 2) Class ranking by mock score + 3) class ranking by XP */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-slate-800">Рейтинг классов по среднему баллу ОРТ</h2>
              <p className="text-xs text-slate-400">Средний балл пробных по классам</p>
            </div>
            <ClassSelect value={scoreClass} onChange={setScoreClass} />
          </div>
          <ul className="mt-5 space-y-4">
            {shownScores.map((c) => (
              <li key={c.cls} className="flex items-center gap-3">
                <span className="w-9 shrink-0 text-sm font-medium text-slate-600">{c.cls}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${(c.v / 250) * 100}%`, background: 'linear-gradient(90deg,#a78bfa,#6d28d9)' }} />
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
              {[3000, 2400, 1800, 1200, 600, 0].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="flex-1">
              <div className="relative h-48">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-px bg-slate-100" />
                  ))}
                </div>
                <div className="relative flex h-full items-end justify-around">
                  {CLASS_XP.map((b) => (
                    <div key={b.cls} className="w-11 rounded-t-md" style={{ height: `${(b.v / XP_MAX) * 100}%`, background: 'linear-gradient(180deg,#8b5cf6,#6d28d9)' }} />
                  ))}
                </div>
              </div>
              <div className="mt-2 flex justify-around text-xs font-medium text-slate-500">
                {CLASS_XP.map((b) => (
                  <span key={b.cls}>{b.cls}</span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 4) Accuracy heatmap + 5) accuracy radar */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-slate-800">Карта точности по разделам</h2>
          <p className="mt-1 text-xs text-slate-400">Средняя точность ответов с первой попытки — зелёным где сильнее</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[440px] border-separate border-spacing-1 text-center text-sm">
              <thead>
                <tr className="text-xs text-slate-400">
                  <th className="py-1" />
                  {ACC_COLS.map((c) => (
                    <th key={c} className="py-1 font-medium">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACC_ROWS.map((row) => (
                  <tr key={row.cls}>
                    <td className="pr-2 text-left text-sm font-semibold text-slate-600">{row.cls}</td>
                    {row.vals.map((v, i) => (
                      <td key={i}>
                        <div className="rounded-md py-2.5 text-xs font-semibold" style={accStyle(v)}>
                          {v}%
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span>0%</span>
            <div className="h-2 w-40 rounded-full" style={{ background: 'linear-gradient(90deg,#dcfce7,#22c55e)' }} />
            <span>100%</span>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-800">Сравнение классов по разделам</h2>
          <p className="mt-1 text-xs text-slate-400">Средняя точность по разделам ОРТ</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-6 sm:flex-nowrap">
            <RadarChart axes={RADAR_AXES} series={RADAR_SERIES} max={100} size={280} />
            <div className="flex flex-col gap-2">
              {RADAR_SERIES.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 6) Top by XP + needs-support, with class filters and names */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-slate-800">Топ-5 по активности</h2>
              <p className="text-xs text-slate-400">Больше всего XP</p>
            </div>
            <ClassSelect value={bestClass} onChange={setBestClass} />
          </div>
          <ul className="mt-4 space-y-1">
            {best.map((s, i) => (
              <li key={s.name} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50">
                <span className="w-4 shrink-0 text-sm font-semibold text-slate-400">{i + 1}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                  {initialsOf(s.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.cls}</p>
                </div>
                <span className="text-sm font-bold text-teal-600">{s.xp} XP</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-slate-800">Требуют поддержки</h2>
              <p className="text-xs text-slate-400">Меньше всего активности в приложении</p>
            </div>
            <ClassSelect value={supportClass} onChange={setSupportClass} />
          </div>
          <ul className="mt-4 space-y-1">
            {support.map((s) => (
              <li key={s.name} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                  {initialsOf(s.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.cls}</p>
                </div>
                <span className="text-sm font-bold text-amber-600">{s.xp} XP</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
