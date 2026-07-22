'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, FakeSelect } from '@/components/ui';

// NOTE: Stage-1 test builder — visual only. Wire topic selection + AI
// question generation + assignment to Supabase / an edge function later.

const STEPS = ['Темы', 'Настройки', 'Назначение'];
const TOPICS = ['Уравнения', 'Неравенства', 'Функции', 'Текстовые задачи', 'Дроби и проценты'];

export default function NewTestPage() {
  const [selected, setSelected] = useState<string[]>(['Уравнения', 'Функции']);

  function toggle(topic: string) {
    setSelected((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <DashboardHeader title="Создать тест" subtitle="Соберите тест из банка платформы" />

      {/* Steps */}
      <div className="flex items-center gap-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  i === 0 ? 'bg-brand text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {i + 1}
              </span>
              <span className={`text-sm font-medium ${i === 0 ? 'text-foreground' : 'text-muted'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <span className="h-px w-10 bg-border" />}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Topic picker */}
        <Card>
          <h2 className="font-semibold text-foreground">Выберите раздел и темы</h2>
          <div className="mt-4">
            <FakeSelect label="Математика" />
          </div>
          <ul className="mt-4 space-y-2">
            {TOPICS.map((t) => (
              <li key={t}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm hover:bg-background">
                  <input
                    type="checkbox"
                    checked={selected.includes(t)}
                    onChange={() => toggle(t)}
                    className="h-4 w-4 accent-[#6d28d9]"
                  />
                  <span className="text-foreground">{t}</span>
                </label>
              </li>
            ))}
          </ul>
        </Card>

        {/* AI assistant */}
        <Card>
          <h2 className="font-semibold text-foreground">ИИ-помощник</h2>
          <p className="mt-2 text-sm text-muted">
            Сгенерировать вопросы по выбранным темам{selected.length > 0 ? `: ${selected.join(', ')}` : ''}.
          </p>
          <button className="mt-4 w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover">
            Сгенерировать
          </button>
          <p className="mt-3 text-xs text-muted">
            ИИ предложит вопросы — вы сможете просмотреть и выбрать нужные перед добавлением в тест.
          </p>
        </Card>
      </div>

      <div className="flex justify-between">
        <Link
          href="/tests"
          className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-background"
        >
          Отмена
        </Link>
        <button className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover">
          Далее
        </button>
      </div>
    </div>
  );
}
