'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserApi } from '@/lib/supabase/client';
import { Card } from '@/components/ui';
import { SearchIcon, MoreIcon } from '@/components/icons';
import type { Student, ClassRow } from '@/lib/aggregate';

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export function StudentsRoster({ students, classes }: { students: Student[]; classes: ClassRow[] }) {
  const router = useRouter();
  const [cls, setCls] = useState('all');
  const [q, setQ] = useState('');
  // Row menu («⋯»): fixed position so the table's horizontal scroll container can't clip it.
  const [menu, setMenu] = useState<{ student: Student; top: number; right: number } | null>(null);
  const [confirm, setConfirm] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!menu) return;
    // Ignore the scroll a click itself can trigger (focus/scroll-into-view) right after opening.
    const openedAt = Date.now();
    const close = (e: Event) => { if (e.type === 'scroll' && Date.now() - openedAt < 400) return; setMenu(null); };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [menu]);

  async function doDelete() {
    if (!confirm) return;
    setDeleting(true); setError(null);
    const { error: err } = await createBrowserApi().staffData.deleteStudent(confirm.id);
    setDeleting(false);
    if (err) { setError('Не удалось удалить ученика. Попробуйте ещё раз.'); return; }
    setConfirm(null);
    router.refresh();
  }

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
                <th className="w-10 px-1 py-3 sm:px-3" />
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
                    <td className="w-10 px-1 py-3.5 text-right sm:px-3">
                      <button type="button" aria-label={`Действия: ${s.name}`} aria-haspopup="menu" aria-expanded={menu?.student.id === s.id}
                        onClick={(e) => {
                          const r = e.currentTarget.getBoundingClientRect();
                          const MENU_H = 92; // approximate height of the two-item menu
                          const top = r.bottom + 4 + MENU_H > window.innerHeight ? r.top - 4 - MENU_H : r.bottom + 4; // flip up near the bottom edge
                          setMenu(menu?.student.id === s.id ? null : { student: s, top, right: window.innerWidth - r.right });
                        }}
                        className="rounded-lg p-1.5 text-slate-400 outline-none transition hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-brand/40">
                        <MoreIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} aria-hidden />
          <div role="menu" style={{ top: menu.top, right: menu.right }}
            className="fixed z-50 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/70">
            <Link role="menuitem" href={`/students/${menu.student.id}`} onClick={() => setMenu(null)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Открыть профиль</Link>
            <button role="menuitem" type="button" onClick={() => { setConfirm(menu.student); setError(null); setMenu(null); }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">Удалить ученика</button>
          </div>
        </>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="del-title">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="del-title" className="text-base font-semibold text-slate-900">Удалить ученика?</h2>
            <p className="mt-2 text-sm text-slate-600"><b className="font-semibold">{confirm.name}</b> будет удалён вместе с аккаунтом и всеми результатами тестов. Это действие нельзя отменить.</p>
            {error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setConfirm(null)} disabled={deleting}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50">Отмена</button>
              <button type="button" onClick={doDelete} disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60">{deleting ? 'Удаляем…' : 'Удалить'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
