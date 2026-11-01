'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { SearchIcon, MoreIcon } from '@/components/icons';
import type { Student, ClassRow } from '@/lib/aggregate';

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export function StudentsRoster({ students, classes }: { students: Student[]; classes: ClassRow[] }) {
  const [cls, setCls] = useState('all');
  const [q, setQ] = useState('');

  const clsName = (id: string | null) => classes.find((c) => c.id === id)?.name ?? '—';
  const rows = students.filter(
    (s) =>
      (cls === 'all' || s.class_id === cls) &&
      (q.trim() === '' || s.name.toLowerCase().includes(q.trim().toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Ученики</h1>
        <p className="mt-1 text-sm text-slate-500">Ростер школы — класс, активность и профиль каждого ученика.</p>
      </header>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-800">Все ученики <span className="text-slate-400">· {rows.length}</span></h2>
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <select value={cls} onChange={(e) => setCls(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 outline-none transition focus:border-brand">
              <option value="all">Все классы</option>
              {classes.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm sm:flex-none">
              <SearchIcon className="h-4 w-4 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по имени"
                className="w-full min-w-0 outline-none placeholder:text-slate-400 sm:w-36" />
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
                <th className="px-2 py-3 font-medium sm:px-3">Ученик</th>
                <th className="hidden px-2 py-3 font-medium sm:table-cell sm:px-3">Класс</th>
                <th className="hidden px-3 py-3 md:table-cell" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={3} className="px-3 py-8 text-center text-sm text-slate-400">Ничего не найдено</td></tr>
              )}
              {rows.map((s) => {
                return (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-2 py-3.5 sm:px-3">
                      <Link href={`/students/${s.id}`} className="flex items-center gap-2.5 hover:text-brand sm:gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">{initials(s.name)}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-slate-800">{s.name}</span>
                          <span className="block text-xs text-slate-400 sm:hidden">{clsName(s.class_id)}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="hidden px-2 py-3.5 text-slate-500 sm:table-cell sm:px-3">{clsName(s.class_id)}</td>
                    <td className="hidden px-3 py-3.5 md:table-cell">
                      <Link href={`/students/${s.id}`} className="text-slate-400 hover:text-slate-700" aria-label="Открыть профиль">
                        <MoreIcon className="h-5 w-5" />
                      </Link>
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
