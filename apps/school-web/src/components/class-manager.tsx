'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserApi } from '@/lib/supabase/client';
import { Card } from '@/components/ui';
import { CopyIcon, RefreshIcon, PlusIcon } from '@/components/icons';

type ClassRow = { id: string; name: string; promo_code: string | null };

export function ClassManager({ schoolId, classes }: { schoolId: string; classes: ClassRow[] }) {
  const router = useRouter();
  const [list, setList] = useState<ClassRow[]>(classes);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function create() {
    const n = name.trim();
    if (!n) return;
    setCreating(true);
    setError('');
    const { class: created, error: err } = await createBrowserApi().staffData.createClass(schoolId, n);
    setCreating(false);
    if (err || !created) { setError('Не удалось создать класс. Попробуйте ещё раз.'); return; }
    setList((l) => [...l, created].sort((a, b) => a.name.localeCompare(b.name, 'ru')));
    setName('');
    router.refresh();
  }

  async function regenerate(id: string) {
    setBusy(id);
    setError('');
    const { code, error: err } = await createBrowserApi().staffData.regenerateClassCode(id);
    setBusy(null);
    if (err || !code) { setError('Не удалось обновить промокод.'); return; }
    setList((l) => l.map((c) => (c.id === id ? { ...c, promo_code: code } : c)));
    router.refresh();
  }

  async function copy(code: string, id: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(id);
      setTimeout(() => setCopied((v) => (v === id ? null : v)), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  return (
    <Card>
      <div>
        <h2 className="font-semibold text-slate-800">Классы и промокоды</h2>
        <p className="mt-1 text-xs text-slate-400">Ученик вводит промокод класса при регистрации, чтобы попасть в него и получить доступ от школы.</p>
      </div>

      {/* Create a class */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') create(); }}
          placeholder="Название класса, напр. 11В"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand/30"
        />
        <button
          onClick={create}
          disabled={creating || !name.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4" /> {creating ? 'Создаём…' : 'Создать класс'}
        </button>
      </div>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {/* Existing classes */}
      <ul className="mt-4 space-y-2">
        {list.length === 0 && (
          <li className="py-6 text-center text-sm text-slate-400">Пока нет классов — создайте первый выше.</li>
        )}
        {list.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-700">{c.name.slice(0, 3)}</span>
            <span className="text-sm font-semibold text-slate-800">{c.name}</span>
            <div className="ml-auto flex items-center gap-2">
              <code className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-sm font-semibold tracking-widest text-slate-700">{c.promo_code ?? '—'}</code>
              {c.promo_code && (
                <button
                  onClick={() => copy(c.promo_code!, c.id)}
                  title={copied === c.id ? 'Скопировано' : 'Скопировать промокод'}
                  className={`rounded-lg border border-slate-200 p-2 transition hover:bg-white ${copied === c.id ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <CopyIcon className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => regenerate(c.id)}
                disabled={busy === c.id}
                title="Обновить промокод"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-white hover:text-brand disabled:opacity-50"
              >
                <RefreshIcon className={`h-4 w-4 ${busy === c.id ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
