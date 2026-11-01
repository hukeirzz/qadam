'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserApi } from '@/lib/supabase/client';
import { CheckIcon } from './icons';

const input =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15';
const primary =
  'shrink-0 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40';

/** Edit the student's own name and move to another class with a class code. */
export function ProfileEditor({ userId, name, classLabel }: { userId: string; name: string; classLabel: string | null }) {
  const router = useRouter();

  // — name —
  const [fullName, setFullName] = useState(name);
  const [nameBusy, setNameBusy] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const nameChanged = fullName.trim() !== name.trim() && fullName.trim().length >= 2;

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!nameChanged) return;
    setNameBusy(true); setNameMsg(null);
    const { error } = await createBrowserApi().studentData.updateName(userId, fullName);
    setNameBusy(false);
    if (error) { setNameMsg({ ok: false, text: 'Не удалось сохранить. Попробуйте ещё раз.' }); return; }
    setNameMsg({ ok: true, text: 'Имя сохранено' });
    router.refresh();
  }

  // — class by code —
  const [code, setCode] = useState('');
  const [info, setInfo] = useState<{ class_name: string; school_name: string } | null>(null);
  const [state, setState] = useState<'idle' | 'checking' | 'ok' | 'bad'>('idle');
  const [classBusy, setClassBusy] = useState(false);
  const [classMsg, setClassMsg] = useState<{ ok: boolean; text: string } | null>(null);

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

  const sameClass = state === 'ok' && !!info && info.class_name === classLabel;

  async function changeClass(e: React.FormEvent) {
    e.preventDefault();
    if (state !== 'ok' || sameClass) return;
    setClassBusy(true); setClassMsg(null);
    const { data, error } = await createBrowserApi().studentData.changeClass(code.trim());
    setClassBusy(false);
    if (error || !data) { setClassMsg({ ok: false, text: 'Не удалось сменить класс. Проверьте код.' }); return; }
    setClassMsg({ ok: true, text: `Вы теперь в классе ${data.class_name}` });
    setCode(''); setInfo(null); setState('idle');
    router.refresh();
  }

  return (
    <section className="min-w-0 rounded-xl bg-white p-5 ring-1 ring-slate-200/70" aria-labelledby="edit-title">
      <h2 id="edit-title" className="text-sm font-semibold text-slate-900">Редактирование профиля</h2>

      <form onSubmit={saveName} className="mt-4">
        <label htmlFor="fullname" className="text-xs font-medium text-slate-500">Имя и фамилия</label>
        <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
          <input id="fullname" value={fullName} onChange={(e) => { setFullName(e.target.value); setNameMsg(null); }}
            maxLength={80} autoComplete="name" className={input} />
          <button type="submit" disabled={!nameChanged || nameBusy} className={primary}>{nameBusy ? 'Сохраняем…' : 'Сохранить'}</button>
        </div>
        {nameMsg && <p role="status" className={`mt-2 text-xs ${nameMsg.ok ? 'text-emerald-600' : 'text-red-500'}`}>{nameMsg.text}</p>}
      </form>

      <form onSubmit={changeClass} className="mt-5 border-t border-slate-100 pt-5">
        <label htmlFor="classcode" className="text-xs font-medium text-slate-500">Сменить класс по коду</label>
        <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
          <input id="classcode" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setClassMsg(null); }} maxLength={12}
            placeholder="Код нового класса" autoComplete="off"
            className={`${input} uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal ${
              state === 'bad' ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : state === 'ok' ? 'border-emerald-300' : ''}`} />
          <button type="submit" disabled={state !== 'ok' || sameClass || classBusy} className={primary}>{classBusy ? 'Переводим…' : 'Перейти'}</button>
        </div>
        <p className="mt-2 min-h-4 text-xs" role="status">
          {state === 'checking' && <span className="text-slate-400">Проверяем код…</span>}
          {state === 'ok' && info && !sameClass && (
            <span className="flex items-center gap-1.5 font-medium text-emerald-600"><CheckIcon className="h-3.5 w-3.5" /> Класс {info.class_name} · {info.school_name}</span>
          )}
          {sameClass && <span className="text-slate-500">Вы уже в этом классе.</span>}
          {state === 'bad' && <span className="text-red-500">Такого кода нет. Уточните его у учителя.</span>}
          {classMsg && <span className={classMsg.ok ? 'text-emerald-600' : 'text-red-500'}>{classMsg.text}</span>}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-slate-400">Код выдаёт учитель. Назначенные тесты нового класса появятся у вас, если он в той же школе.</p>
      </form>
    </section>
  );
}
