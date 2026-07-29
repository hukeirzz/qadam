'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { createBrowserApi } from '@/lib/supabase/client';
import * as agg from '@/lib/aggregate';

type ClassRow = { id: string; name: string };
type Question = { id: string; text: string; options: string[]; correct: number };

const RANKS = ['D', 'C', 'B', 'A', 'S'];
const SECTIONS = agg.SUBJECTS.map((s) => ({ id: s.id, name: agg.SUBJECT_LABELS[s.id] }));

let qid = 0;
function blankQuestion(): Question {
  qid += 1;
  return { id: `q-${qid}`, text: '', options: ['', '', '', ''], correct: 0 };
}

export function TestBuilder({
  schoolId, classes, onDone, onCancel,
}: {
  schoolId: string;
  classes: ClassRow[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rank, setRank] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(SECTIONS[0]?.id ?? null);
  const [selClasses, setSelClasses] = useState<Set<string>>(new Set());
  const [questions, setQuestions] = useState<Question[]>([blankQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateQ = (i: number, patch: Partial<Question>) =>
    setQuestions((qs) => qs.map((q, qi) => (qi === i ? { ...q, ...patch } : q)));
  const updateOpt = (i: number, oi: number, val: string) =>
    setQuestions((qs) => qs.map((q, qi) => (qi === i ? { ...q, options: q.options.map((o, k) => (k === oi ? val : o)) } : q)));
  const addOpt = (i: number) =>
    setQuestions((qs) => qs.map((q, qi) => (qi === i ? { ...q, options: [...q.options, ''] } : q)));
  const delOpt = (i: number, oi: number) =>
    setQuestions((qs) => qs.map((q, qi) => {
      if (qi !== i) return q;
      const options = q.options.filter((_, k) => k !== oi);
      const correct = q.correct === oi ? 0 : q.correct > oi ? q.correct - 1 : q.correct;
      return { ...q, options, correct };
    }));
  const delQ = (i: number) => setQuestions((qs) => qs.filter((_, qi) => qi !== i));
  const addQ = () => setQuestions((qs) => [...qs, blankQuestion()]);

  const toggleClass = (id: string) =>
    setSelClasses((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const questionsValid = questions.length > 0 && questions.every((q) => {
    const filled = q.options.filter((o) => o.trim());
    return q.text.trim() && filled.length >= 2 && q.options[q.correct]?.trim();
  });

  async function handleSave() {
    setSaving(true);
    setError(null);
    const api = createBrowserApi();
    const { data: sess } = await api.supabase.auth.getUser();

    // Пары (текст, isCorrect) фильтруются ПОСЛЕ вычисления isCorrect по
    // исходному индексу — если сначала отфильтровать пустые варианты, а
    // потом сравнивать с q.correct, индексы съедут и правильный ответ
    // пометится неверно.
    const payload = questions.map((q) => ({
      text: q.text.trim(),
      options: q.options
        .map((text, i) => ({ text: text.trim(), isCorrect: i === q.correct }))
        .filter((o) => o.text),
    }));

    const { error: saveErr } = await api.staffData.createSchoolTest(
      schoolId,
      sess.user?.id ?? '',
      { title: title.trim(), description: description.trim() || null, targetRank: rank, subjectId, classIds: [...selClasses] },
      payload,
    );
    setSaving(false);
    if (saveErr) { setError(saveErr.message); return; }
    onDone();
  }

  return (
    <div className="space-y-4">
      {/* Stepper */}
      <div className="flex items-center gap-2 text-sm">
        {['Настройки', 'Вопросы', 'Готово'].map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={label} className="flex items-center gap-2">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? 'bg-brand text-white' : done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                {done ? '✓' : n}
              </span>
              <span className={`${active ? 'inline font-semibold text-slate-800' : 'hidden text-slate-400 sm:inline'}`}>{label}</span>
              {n < 3 && <span className="mx-1 h-px w-4 shrink-0 bg-slate-200 sm:w-6" />}
            </div>
          );
        })}
      </div>

      {/* Step 1 — settings */}
      {step === 1 && (
        <Card className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-600">Название теста</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Напр. Пробный тест по грамматике"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Описание (необязательно)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand" />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Ранг</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={() => setRank(null)}
                className={`h-10 rounded-xl px-4 text-sm font-semibold transition ${rank === null ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                Любой
              </button>
              {RANKS.map((r) => (
                <button key={r} onClick={() => setRank(r)}
                  className={`h-10 w-10 rounded-xl text-sm font-bold transition ${rank === r ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{r}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Раздел</label>
            <select value={subjectId ?? ''} onChange={(e) => setSubjectId(e.target.value || null)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand">
              <option value="">Без раздела</option>
              {SECTIONS.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Классы</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={() => setSelClasses(new Set())}
                className={`h-9 rounded-xl px-4 text-sm font-semibold transition ${selClasses.size === 0 ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                Вся школа
              </button>
              {classes.map((c) => (
                <button key={c.id} onClick={() => toggleClass(c.id)}
                  className={`h-9 rounded-xl px-4 text-sm font-medium transition ${selClasses.has(c.id) ? 'bg-violet-100 text-violet-700 ring-1 ring-brand/40' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  {c.name}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">Ничего не выбрано — тест увидит вся школа (с учётом ранга).</p>
          </div>

          <div className="flex justify-between">
            <button onClick={onCancel} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">Отмена</button>
            <button onClick={() => setStep(2)} disabled={!title.trim()}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60">Далее — вопросы</button>
          </div>
        </Card>
      )}

      {/* Step 2 — manual question editor */}
      {step === 2 && (
        <div className="space-y-4">
          <Card className="flex flex-wrap items-center justify-between gap-2 !py-4">
            <p className="text-sm text-slate-600">
              <b className="font-semibold text-slate-800">{title}</b> · {questions.length} вопросов
            </p>
            <button onClick={addQ} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">+ Добавить вопрос</button>
          </Card>

          {questions.map((q, i) => (
            <Card key={q.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Вопрос {i + 1}</span>
                {questions.length > 1 && (
                  <button onClick={() => delQ(i)} className="text-xs font-medium text-red-500 hover:text-red-600">Удалить вопрос</button>
                )}
              </div>
              <input value={q.text} onChange={(e) => updateQ(i, { text: e.target.value })} placeholder="Текст вопроса"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand" />
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => (
                  <label key={oi} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${q.correct === oi ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200'}`}>
                    <input type="radio" name={`c-${q.id}`} checked={q.correct === oi} onChange={() => updateQ(i, { correct: oi })} className="accent-emerald-500" />
                    <input value={opt} onChange={(e) => updateOpt(i, oi, e.target.value)} placeholder={`Вариант ${oi + 1}`}
                      className="w-full bg-transparent text-sm outline-none" />
                    {q.options.length > 2 && (
                      <button onClick={() => delOpt(i, oi)} className="text-slate-300 hover:text-red-500">×</button>
                    )}
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button onClick={() => addOpt(i)} className="text-xs font-medium text-brand hover:underline">+ вариант</button>
                <p className="text-xs text-slate-400">Отметьте зелёным верный вариант.</p>
              </div>
            </Card>
          ))}

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">Назад</button>
            <button onClick={() => setStep(3)} disabled={!questionsValid}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60">Далее — сохранить</button>
          </div>
        </div>
      )}

      {/* Step 3 — save */}
      {step === 3 && (
        <Card className="space-y-5">
          <div>
            <h2 className="font-semibold text-slate-800">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {questions.length} вопросов · {rank ? `ранг ${rank}` : 'любой ранг'} · {selClasses.size > 0 ? `${selClasses.size} класс(ов)` : 'вся школа'}
            </p>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">Назад</button>
            <button onClick={handleSave} disabled={saving}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60">
              {saving ? 'Сохраняем…' : 'Сохранить тест'}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
