'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserApi } from '@/lib/supabase/client';
import { CheckIcon } from './icons';
import { pct } from '@/lib/student-ui';
import { outcome } from './student-tasks';

type Option = { id: string; order_num: number; text: string; is_correct: boolean };
type Question = { id: string; order_num: number; text: string; explanation: string | null; school_test_options: Option[] };

export function TestRunner({
  testId, studentId, title, subtitle, questions, retake = false,
}: { testId: string; studentId: string; title: string; subtitle: string; questions: Question[]; retake?: boolean }) {
  const router = useRouter();
  const qs = useMemo(
    () => [...questions].sort((a, b) => a.order_num - b.order_num)
      .map((q) => ({ ...q, options: [...q.school_test_options].sort((a, b) => a.order_num - b.order_num) })),
    [questions],
  );
  const startedAt = useRef(Date.now());
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const q = qs[index];
  const answered = picked !== null;
  const last = index === qs.length - 1;

  function pick(o: Option) {
    if (answered) return;
    setPicked(o.id);
    if (o.is_correct) setScore((s) => s + 1);
  }

  async function next() {
    if (!last) { setIndex((i) => i + 1); setPicked(null); return; }
    setSaving(true); setError(null);
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    const api = createBrowserApi().studentData;
    const { error: err } = retake ? await api.submitRetake(testId, studentId, score, seconds) : await api.submitResult(testId, studentId, score, seconds);
    setSaving(false);
    if (err) { setError('Не удалось сохранить результат. Попробуйте ещё раз.'); return; }
    setDone(true);
    router.refresh();
  }

  if (done) {
    const p = pct(score, qs.length);
    const perfect = outcome({ score, total: qs.length }) === 'perfect';
    return (
      <div className="rounded-xl bg-white p-8 text-center ring-1 ring-slate-200/70">
        <span className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold ${perfect ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{p}%</span>
        <h1 className="mt-5 text-2xl font-bold text-slate-800">{perfect ? 'Без ошибок!' : p >= 50 ? 'Хороший результат!' : 'Есть куда расти!'}</h1>
        <p className="mt-1.5 text-slate-500">Верных ответов: {score} из {qs.length}</p>
        {retake && <p className="mx-auto mt-3 max-w-sm text-sm text-slate-400">Это пересдача — на аналитику она не влияет, учитывается только первая сдача.</p>}
        <Link href="/student" className="mt-7 inline-block rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover">
          На главную
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-400">{subtitle}{retake ? ' · пересдача' : ''}</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-violet-100">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${((index + (answered ? 1 : 0)) / qs.length) * 100}%` }} />
        </div>
        <span className="text-sm font-medium text-slate-500">{index + 1} / {qs.length}</span>
      </div>

      <div className="rounded-xl bg-white p-6 ring-1 ring-slate-200/70">
        <p className="text-lg font-semibold leading-snug text-slate-800">{q.text}</p>

        <div className="mt-5 space-y-2.5">
          {q.options.map((o) => {
            const chosen = picked === o.id;
            const show = answered;
            const tone = !show
              ? 'border-slate-200 hover:border-brand/50 hover:bg-violet-50/50'
              : o.is_correct ? 'border-emerald-300 bg-emerald-50'
              : chosen ? 'border-red-300 bg-red-50' : 'border-slate-100 opacity-60';
            return (
              <button key={o.id} onClick={() => pick(o)} disabled={answered}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium text-slate-700 transition ${tone}`}>
                <span className="flex-1">{o.text}</span>
                {show && o.is_correct && <CheckIcon className="h-5 w-5 text-emerald-600" />}
              </button>
            );
          })}
        </div>

        {answered && q.explanation && (
          <p className="mt-5 rounded-xl bg-violet-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
            <span className="font-semibold text-violet-700">Пояснение: </span>{q.explanation}
          </p>
        )}
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <button onClick={next} disabled={!answered || saving}
        className="w-full rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-40">
        {saving ? 'Сохраняем…' : last ? 'Завершить' : 'Дальше'}
      </button>
    </div>
  );
}
