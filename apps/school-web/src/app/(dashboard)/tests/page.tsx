'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, Avatar } from '@/components/ui';
import { TestsIcon, TrophyIcon } from '@/components/icons';

// NOTE: Stage-1 — placeholder tests/competitions shaped to the design.
// Wire to Supabase (assigned tests, submissions, competition standings) later.

const TESTS = [
  { name: 'Математический спринт', target: '9-А, 9-Б', deadline: '16.05.2024', status: 'Активен', done: 75 },
  { name: 'Грамматика: времена', target: '10-А', deadline: '20.05.2024', status: 'Активен', done: 60 },
  { name: 'Геометрия: углы', target: '9-А', deadline: '10.05.2024', status: 'Завершён', done: 100 },
  { name: 'Алгебра: уравнения', target: '8-А, 8-Б', deadline: '05.05.2024', status: 'Завершён', done: 100 },
];

const COMPETITIONS = [
  { name: 'Математический спринт', target: '9-А, 9-Б', deadline: 'Осталось 2д 15ч', status: 'Активно' },
  { name: 'Весенняя лига знаний', target: 'Вся школа', deadline: 'Осталось 5д', status: 'Активно' },
];

const LEADERS = [
  { name: 'Дружинин А.', cls: '9-А', xp: 2400 },
  { name: 'Нурлан Б.', cls: '9-А', xp: 2100 },
  { name: 'Элина К.', cls: '9-А', xp: 1950 },
  { name: 'Сиа (Бексат)', cls: '9-А', xp: 1800 },
  { name: 'Руслан Т.', cls: '9-Б', xp: 1650 },
];

const TABS = ['Тесты', 'Соревнования'];

export default function TestsPage() {
  const [tab, setTab] = useState(0);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <DashboardHeader
        title="Свои тесты"
        subtitle="Тесты и соревнования для учеников"
        actions={
          <>
            <Link
              href="/tests/new"
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-background"
            >
              <TestsIcon className="h-4 w-4" />
              Создать тест
            </Link>
            <Link
              href="/tests/new"
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              <TrophyIcon className="h-4 w-4" />
              Создать соревнование
            </Link>
          </>
        }
      />

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
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-6 py-4 font-medium">Название</th>
                  <th className="px-6 py-4 font-medium">Кому назначено</th>
                  <th className="px-6 py-4 font-medium">Дедлайн</th>
                  <th className="px-6 py-4 font-medium">Статус</th>
                  <th className="px-6 py-4 font-medium">Выполнено</th>
                </tr>
              </thead>
              <tbody>
                {TESTS.map((t) => (
                  <tr key={t.name} className="border-b border-border/70 last:border-0">
                    <td className="px-6 py-4 font-medium text-foreground">{t.name}</td>
                    <td className="px-6 py-4 text-muted">{t.target}</td>
                    <td className="px-6 py-4 text-muted">{t.deadline}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">{t.done}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 1 && (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted">
                    <th className="px-6 py-4 font-medium">Название</th>
                    <th className="px-6 py-4 font-medium">Участники</th>
                    <th className="px-6 py-4 font-medium">Осталось</th>
                    <th className="px-6 py-4 font-medium">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPETITIONS.map((c) => (
                    <tr key={c.name} className="border-b border-border/70 last:border-0">
                      <td className="px-6 py-4 font-medium text-foreground">{c.name}</td>
                      <td className="px-6 py-4 text-muted">{c.target}</td>
                      <td className="px-6 py-4 text-muted">{c.deadline}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Leaderboard (5.5) */}
          <Card>
            <div className="flex items-center gap-2">
              <TrophyIcon className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold text-foreground">Математический спринт</h2>
            </div>
            <p className="mt-1 text-xs text-muted">Командная лига · до конца 2д 15ч</p>
            <ol className="mt-4 space-y-3">
              {LEADERS.map((l, i) => (
                <li key={l.name} className="flex items-center gap-3">
                  <span className="w-4 text-sm font-semibold text-muted">{i + 1}</span>
                  <Avatar name={l.name} />
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {l.name} <span className="text-muted">· {l.cls}</span>
                  </span>
                  <span className="text-sm font-semibold text-brand">{l.xp} XP</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const done = status === 'Завершён';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        done ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
      }`}
    >
      {status}
    </span>
  );
}
