'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, ProgressBar } from './ui';
import { ChevronDownIcon } from './icons';

// NOTE: placeholder profile — the same mock student renders for any id.
// Wire to Supabase (profile + per-subject mastery + attempt history) later.

const STUDENT = {
  name: 'Сиа (Бексат)',
  cls: '9-А',
  rank: 'C',
  xp: 980,
  xpMax: 1600,
  streak: 6,
};

const SUBJECTS = ['Математика', 'Геометрия', 'Аналогии', 'Чтение', 'Грамматика'];

const RADAR = [
  { label: 'Ученик', color: '#6d28d9', values: [55, 40, 65, 70, 58] },
  { label: 'Среднее по школе', color: '#94a3b8', values: [62, 54, 58, 60, 50] },
];

const HEATMAP_TOPICS = [
  { topic: 'Углы', values: [70, 32, 68, 80, 74] },
  { topic: 'Уравнения', values: [38, 55, 60, 72, 66] },
  { topic: 'Функции', values: [52, 48, 63, 70, 78] },
  { topic: 'Текстовые задачи', values: [45, 50, 58, 55, 82] },
  { topic: 'Времена', values: [60, 62, 55, 48, 41] },
  { topic: 'Главная идея', values: [66, 70, 60, 43, 58] },
  { topic: 'Синонимы', values: [72, 68, 64, 75, 62] },
];

const OVERVIEW = [
  { label: 'Математика', v: 55 },
  { label: 'Геометрия', v: 40 },
  { label: 'Аналогии', v: 65 },
  { label: 'Чтение', v: 70 },
  { label: 'Грамматика', v: 58 },
];

const HISTORY = [
  { date: 'Сегодня, 14:20', text: 'Прошёл тест «Геометрия: Углы» — 8/10' },
  { date: 'Сегодня, 13:05', text: 'Заработал 120 XP в разделе «Аналогии»' },
  { date: 'Вчера, 18:40', text: 'Серия 6 дней подряд' },
  { date: '2 дня назад', text: 'Прошёл тест «Математика: Дроби» — 6/10' },
];

const TABS = ['Обзор', 'Пробелы', 'История'];

export function StudentProfile() {
  const [tab, setTab] = useState(1);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <Link href="/students" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground">
        ← Назад
      </Link>

      {/* Header */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="flex flex-wrap items-center gap-5">
            <Image src="/icon.jpeg" alt="" width={80} height={80} className="h-20 w-20 rounded-2xl" />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground">{STUDENT.name}</h1>
                <span className="rounded-lg bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                  {STUDENT.cls} класс
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-xs text-muted">Ранг</p>
                  <button className="mt-0.5 flex items-center gap-1 text-2xl font-bold text-foreground">
                    {STUDENT.rank}
                    <ChevronDownIcon className="h-4 w-4 text-muted" />
                  </button>
                </div>
                <div className="min-w-[180px] flex-1">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>XP</span>
                    <span>{STUDENT.xp} / {STUDENT.xpMax} XP</span>
                  </div>
                  <ProgressBar value={(STUDENT.xp / STUDENT.xpMax) * 100} className="mt-1 w-full" />
                </div>
                <div className="text-sm font-semibold text-orange-500">{STUDENT.streak} дней 🔥</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <Image src="/icon.jpeg" alt="Барсик" width={64} height={64} className="h-16 w-16 rounded-2xl" />
          <div>
            <p className="font-semibold text-foreground">Барсик</p>
            <p className="text-sm text-emerald-600">Счастлив</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition ${
              i === tab ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <Card>
          <h2 className="font-semibold text-foreground">Прогресс по разделам</h2>
          <ul className="mt-4 space-y-3">
            {OVERVIEW.map((o) => (
              <li key={o.label} className="flex items-center gap-3">
                <span className="w-32 text-sm text-foreground">{o.label}</span>
                <ProgressBar value={o.v} className="flex-1" />
                <span className="w-10 text-right text-sm font-medium text-foreground">{o.v}%</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 1 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="font-semibold text-foreground">Профиль по разделам</h2>
            <div className="mt-2 flex justify-center">
              <Radar axes={SUBJECTS} series={RADAR} />
            </div>
            <div className="mt-2 flex justify-center gap-5">
              {RADAR.map((s) => (
                <span key={s.label} className="flex items-center gap-2 text-xs text-muted">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-foreground">Темы</h2>
            <Heatmap />
            <div className="mt-4 flex items-center gap-3 text-xs text-muted">
              <span>Сильное владение</span>
              <span className="h-2 flex-1 rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-red-400" />
              <span>Нужно подтянуть</span>
            </div>
          </Card>
        </div>
      )}

      {tab === 2 && (
        <Card>
          <h2 className="font-semibold text-foreground">История активности</h2>
          <ul className="mt-4 space-y-4">
            {HISTORY.map((h, i) => (
              <li key={i} className="flex gap-4">
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand" />
                <div>
                  <p className="text-sm text-foreground">{h.text}</p>
                  <p className="text-xs text-muted">{h.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Radar({ axes, series }: { axes: string[]; series: { label: string; color: string; values: number[] }[] }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = 92;
  const n = axes.length;
  const angle = (i: number) => (-90 + (i * 360) / n) * (Math.PI / 180);
  const point = (i: number, val: number): [number, number] => [
    cx + Math.cos(angle(i)) * r * (val / 100),
    cy + Math.sin(angle(i)) * r * (val / 100),
  ];
  const poly = (vals: number[]) => vals.map((v, i) => point(i, v).join(',')).join(' ');
  const rings = [25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Лепестковая диаграмма">
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={axes.map((_, i) => point(i, ring).join(',')).join(' ')}
          fill="none"
          stroke="#eef0f3"
          strokeWidth="1"
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#eef0f3" strokeWidth="1" />;
      })}
      {series.map((s) => (
        <polygon key={s.label} points={poly(s.values)} fill={s.color} fillOpacity="0.15" stroke={s.color} strokeWidth="2" />
      ))}
      {axes.map((label, i) => {
        const [x, y] = point(i, 122);
        return (
          <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#6b7280">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

/** value 0..100 → red (low) through amber to green (high). */
function heatColor(v: number) {
  const hue = (v / 100) * 120; // 0 = red, 120 = green
  return `hsl(${hue} 70% 55%)`;
}

function Heatmap() {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="text-left font-medium text-muted" />
            {SUBJECTS.map((s) => (
              <th key={s} className="px-1 pb-1 text-center font-medium text-muted">
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HEATMAP_TOPICS.map((row) => (
            <tr key={row.topic}>
              <td className="whitespace-nowrap pr-2 text-muted">{row.topic}</td>
              {row.values.map((v, i) => (
                <td key={i}>
                  <div
                    className="flex h-7 items-center justify-center rounded-md font-medium text-white/90"
                    style={{ background: heatColor(v) }}
                    title={`${v}%`}
                  >
                    {v}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
