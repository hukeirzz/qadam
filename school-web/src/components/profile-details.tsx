'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserApi } from '@/lib/supabase/client';
import { CheckIcon } from './icons';

const input =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15';
const primary =
  'rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40';
const ghost = 'rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50';
const editBtn = 'shrink-0 rounded-md px-2 py-1 text-sm font-medium text-brand outline-none transition hover:bg-violet-50 focus-visible:ring-2 focus-visible:ring-brand/40';

type Editing = 'name' | 'class' | null;

/**
 * The profile details list. «Имя и фамилия» and «Класс» each have an «Изменить» button that
 * opens the editor in place; the class can only be changed with a class code.
 */
export function ProfileDetails({
  userId, name, email, classLabel, schoolName,
}: { userId: string; name: string; email: string; classLabel: string | null; schoolName: string | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);

  // — name —
  const [fullName, setFullName] = useState(name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameChanged = fullName.trim() !== name.trim() && fullName.trim().length >= 2;

  // — class by code —
  const [code, setCode] = useState('');
  const [info, setInfo] = useState<{ class_name: string; school_name: string } | null>(null);
  const [state, setState] = useState<'idle' | 'checking' | 'ok' | 'bad'>('idle');
  const sameClass = state === 'ok' && !!info && info.class_name === classLabel;

  useEffect(() => {
    const c = code.trim();
    if (c.length < 4) { setState('idle'); setInfo(null); return; }
    setState('checking');
    const t = setTimeout(async () => {
      const res = await createBrowserApi().studentData.checkClassCode(c);
      setInfo(res); setState(res ? 'ok' : 'bad');
    }, 350);
    return () => clearTimeout(t);
  }, [code]);

  function open(which: Editing) {
    setError(null); setCode(''); setInfo(null); setState('idle'); setFullName(name);
    setEditing(which);
  }
  const close = () => { setEditing(null); setError(null); };

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!nameChanged) return;
    setBusy(true); setError(null);
    const { error: err } = await createBrowserApi().studentData.updateName(userId, fullName);
    setBusy(false);
    if (err) { setError('Не удалось сохранить. Попробуйте ещё раз.'); return; }
    close(); router.refresh();
  }

  async function changeClass(e: React.FormEvent) {
    e.preventDefault();
    if (state !== 'ok' || sameClass) return;
    setBusy(true); setError(null);
    const { data, error: err } = await createBrowserApi().studentData.changeClass(code.trim());
    setBusy(false);
    if (err || !data) { setError('Не удалось сменить класс. Проверьте код.'); return; }
    close(); router.refresh();
  }

  const row = 'py-3.5';
  const label = 'text-sm text-slate-400';

  return (
    <dl className="divide-y divide-slate-100 rounded-xl bg-white px-5 ring-1 ring-slate-200/70">
      {/* Name */}
      <div className={row}>
        {editing === 'name' ? (
          <form onSubmit={saveName}>
            <label htmlFor="fullname" className={label}>Имя и фамилия</label>
            <input id="fullname" autoFocus value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={80} autoComplete="name" className={`${input} mt-2`} />
            {error && <p role="alert" className="mt-2 text-xs text-red-500">{error}</p>}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button type="submit" disabled={!nameChanged || busy} className={primary}>{busy ? 'Сохраняем…' : 'Сохранить'}</button>
              <button type="button" onClick={close} className={ghost}>Отмена</button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <dt className={label}>Имя и фамилия</dt>
            <div className="flex min-w-0 items-center gap-2">
              <dd className="truncate text-sm font-medium text-slate-800">{name}</dd>
              <button type="button" onClick={() => open('name')} className={editBtn} aria-label="Изменить имя и фамилию">Изменить</button>
            </div>
          </div>
        )}
      </div>

      {/* Email (read-only) */}
      <div className={`${row} flex items-center justify-between gap-4`}>
        <dt className={label}>Email</dt>
        <dd className="truncate text-sm font-medium text-slate-800">{email}</dd>
      </div>

      {/* Class */}
      <div className={row}>
        {editing === 'class' ? (
          <form onSubmit={changeClass}>
            <label htmlFor="classcode" className={label}>Новый класс — введите код, который выдал учитель</label>
            <input id="classcode" autoFocus value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={12}
              placeholder="Код класса" autoComplete="off"
              className={`${input} mt-2 uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal ${
                state === 'bad' ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : state === 'ok' ? 'border-emerald-300' : ''}`} />
            <p className="mt-2 min-h-4 text-xs" role="status">
              {state === 'checking' && <span className="text-slate-400">Проверяем код…</span>}
              {state === 'ok' && info && !sameClass && (
                <span className="flex items-center gap-1.5 font-medium text-emerald-600"><CheckIcon className="h-3.5 w-3.5" /> Класс {info.class_name} · {info.school_name}</span>
              )}
              {sameClass && <span className="text-slate-500">Вы уже в этом классе.</span>}
              {state === 'bad' && <span className="text-red-500">Такого кода нет. Уточните его у учителя.</span>}
              {error && <span role="alert" className="text-red-500">{error}</span>}
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button type="submit" disabled={state !== 'ok' || sameClass || busy} className={primary}>{busy ? 'Переводим…' : 'Перейти в класс'}</button>
              <button type="button" onClick={close} className={ghost}>Отмена</button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <dt className={label}>Класс</dt>
            <div className="flex min-w-0 items-center gap-2">
              <dd className="truncate text-sm font-medium text-slate-800">{classLabel ?? '—'}</dd>
              <button type="button" onClick={() => open('class')} className={editBtn} aria-label="Сменить класс по коду">Изменить</button>
            </div>
          </div>
        )}
      </div>

      {/* School (read-only) */}
      <div className={`${row} flex items-center justify-between gap-4`}>
        <dt className={label}>Школа</dt>
        <dd className="truncate text-sm font-medium text-slate-800">{schoolName ?? '—'}</dd>
      </div>
    </dl>
  );
}
