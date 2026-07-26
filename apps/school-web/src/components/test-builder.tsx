'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { SparkleIcon } from '@/components/icons';
import * as agg from '@/lib/aggregate';

type Topic = { id: string; subject_id: string; title: string; order_num: number };
type ClassRow = { id: string; name: string };
type Student = { id: string; name: string; class_id: string | null; rank: string };
type TStat = { student_id: string; topic_id: string; correct_first: number; answered: number };
type Question = { id: string; text: string; options: string[]; correct: number };

const RANKS = ['D', 'C', 'B', 'A', 'S'];
const COUNTS = [5, 10, 15, 20];
const SECTIONS = agg.SUBJECTS.map((s) => ({ id: s.id, name: agg.SUBJECT_LABELS[s.id] }));
const REC_THRESHOLD = 65;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}
const RANK_BADGE: Record<string, string> = {
  S: 'bg-blue-100 text-blue-700', A: 'bg-emerald-100 text-emerald-700',
  B: 'bg-amber-100 text-amber-700', C: 'bg-red-100 text-red-700', D: 'bg-violet-100 text-violet-700',
};

export function TestBuilder({
  topics, classes, students, topicStats,
}: {
  topics: Topic[]; classes: ClassRow[]; students: Student[]; topicStats: TStat[];
}) {
  const firstTopic = (subj: string) => topics.find((t) => t.subject_id === subj)?.id ?? '';

  const [step, setStep] = useState(1);
  const [rank, setRank] = useState('B');
  const [subjectId, setSubjectId] = useState(SECTIONS[0].id);
  const [topicId, setTopicId] = useState(firstTopic(SECTIONS[0].id));
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selClass, setSelClass] = useState(classes[0]?.id ?? '');
  const [selStudents, setSelStudents] = useState<Set<string>>(new Set());

  const sectionTopics = topics.filter((t) => t.subject_id === subjectId);
  const topicTitle = topics.find((t) => t.id === topicId)?.title ?? '';
  const subjectName = SECTIONS.find((s) => s.id === subjectId)?.name ?? '';

  const statMap = new Map(topicStats.map((s) => [`${s.student_id}:${s.topic_id}`, s]));
  const topicAcc = (studentId: string): number | null => {
    const s = statMap.get(`${studentId}:${topicId}`);
    return s && s.answered ? Math.round((100 * s.correct_first) / s.answered) : null;
  };
  const classStudents = students.filter((s) => s.class_id === selClass);
  const recommended = new Set(classStudents.filter((s) => { const a = topicAcc(s.id); return a != null && a < REC_THRESHOLD; }).map((s) => s.id));

  function changeSubject(v: string) { setSubjectId(v); setTopicId(firstTopic(v)); }

  function generate() {
    setGenerating(true);
    setTimeout(() => {
      const qs: Question[] = Array.from({ length: count }, (_, i) => ({
        id: `q-${Date.now()}-${i}`,
        text: `${topicTitle}: вопрос ${i + 1}`,
        options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
        correct: 0,
      }));
      setQuestions(qs);
      setGenerating(false);
      setStep(2);
    }, 900);
  }

  const updateQ = (i: number, patch: Partial<Question>) =>
    setQuestions((qs) => qs.map((q, qi) => (qi === i ? { ...q, ...patch } : q)));
  const updateOpt = (i: number, oi: number, val: string) =>
    setQuestions((qs) => qs.map((q, qi) => (qi === i ? { ...q, options: q.options.map((o, k) => (k === oi ? val : o)) } : q)));
  const delQ = (i: number) => setQuestions((qs) => qs.filter((_, qi) => qi !== i));
  const addQ = () => setQuestions((qs) => [...qs, { id: `q-${Date.now()}`, text: '', options: ['', '', '', ''], correct: 0 }]);

  const toggleStudent = (id: string) => setSelStudents((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const addRecommended = () => setSelStudents((s) => new Set([...s, ...recommended]));

  function reset() {
    setStep(1); setQuestions([]); setSelStudents(new Set());
  }

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Свои тесты</h1>
        <p className="mt-1 text-sm text-slate-500">Сгенерируйте ИИ-тест по теме и отправьте его ученикам.</p>
      </header>

      {/* Stepper */}
      <div className="flex items-center gap-2 text-sm">
        {['Настройки', 'Вопросы', 'Назначение'].map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={label} className="flex items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${active ? 'bg-brand text-white' : done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                {done ? '✓' : n}
              </span>
              <span className={active ? 'font-semibold text-slate-800' : 'text-slate-400'}>{label}</span>
              {n < 3 && <span className="mx-1 h-px w-6 bg-slate-200" />}
            </div>
          );
        })}
      </div>

      {/* Step 1 — settings */}
      {step === 1 && (
        <Card className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-600">Уровень сложности (ранг)</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {RANKS.map((r) => (
                <button key={r} onClick={() => setRank(r)}
                  className={`h-10 w-10 rounded-xl text-sm font-bold transition ${rank === r ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{r}</button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-600">Раздел</label>
              <select value={subjectId} onChange={(e) => changeSubject(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand">
                {SECTIONS.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Тема</label>
              <select value={topicId} onChange={(e) => setTopicId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand">
                {sectionTopics.map((t) => (<option key={t.id} value={t.id}>{t.title}</option>))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Количество вопросов</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {COUNTS.map((c) => (
                <button key={c} onClick={() => setCount(c)}
                  className={`h-10 min-w-12 rounded-xl px-3 text-sm font-semibold transition ${count === c ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{c}</button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={generating || !topicId}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-60">
            <SparkleIcon className="h-5 w-5" />
            {generating ? 'Генерируем тест…' : 'Сгенерировать тест'}
          </button>
          <p className="text-center text-xs text-slate-400">ИИ-генерация подключится позже — пока создаются заготовки, которые можно отредактировать.</p>
        </Card>
      )}

      {/* Step 2 — edit questions */}
      {step === 2 && (
        <div className="space-y-4">
          <Card className="flex flex-wrap items-center justify-between gap-2 !py-4">
            <p className="text-sm text-slate-600">
              <b className="font-semibold text-slate-800">{subjectName} · {topicTitle}</b> · уровень {rank} · {questions.length} вопросов
            </p>
            <button onClick={addQ} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">+ Добавить вопрос</button>
          </Card>

          {questions.map((q, i) => (
            <Card key={q.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Вопрос {i + 1}</span>
                <button onClick={() => delQ(i)} className="text-xs font-medium text-red-500 hover:text-red-600">Удалить</button>
              </div>
              <input value={q.text} onChange={(e) => updateQ(i, { text: e.target.value })} placeholder="Текст вопроса"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand" />
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => (
                  <label key={oi} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${q.correct === oi ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200'}`}>
                    <input type="radio" name={`c-${q.id}`} checked={q.correct === oi} onChange={() => updateQ(i, { correct: oi })} className="accent-emerald-500" />
                    <input value={opt} onChange={(e) => updateOpt(i, oi, e.target.value)} placeholder={`Вариант ${oi + 1}`}
                      className="w-full bg-transparent text-sm outline-none" />
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-400">Отметьте зелёным верный вариант.</p>
            </Card>
          ))}

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">Назад</button>
            <button onClick={() => setStep(3)} disabled={questions.length === 0}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60">Далее — назначить</button>
          </div>
        </div>
      )}

      {/* Step 3 — assignment */}
      {step === 3 && (
        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-800">Кому отправить</h2>
              <div className="flex items-center gap-2">
                {recommended.size > 0 && (
                  <button onClick={addRecommended} className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-brand hover:bg-violet-100">
                    + Добавить рекомендованных ({recommended.size})
                  </button>
                )}
                <select value={selClass} onChange={(e) => { setSelClass(e.target.value); setSelStudents(new Set()); }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 outline-none focus:border-brand">
                  {classes.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Рекомендованы ученики со слабой точностью по теме «{topicTitle}» (ниже {REC_THRESHOLD}%) — им тест полезнее всего.
            </p>

            <ul className="space-y-1">
              {classStudents.length === 0 && <li className="py-4 text-center text-sm text-slate-400">В классе нет учеников</li>}
              {classStudents.map((s) => {
                const acc = topicAcc(s.id);
                const rec = recommended.has(s.id);
                const on = selStudents.has(s.id);
                return (
                  <li key={s.id}>
                    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition ${on ? 'border-brand/40 bg-violet-50/40' : 'border-transparent hover:bg-slate-50'}`}>
                      <input type="checkbox" checked={on} onChange={() => toggleStudent(s.id)} className="h-4 w-4 rounded accent-[#6d28d9]" />
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">{initials(s.name)}</span>
                      <span className="flex-1 text-sm font-medium text-slate-800">{s.name}</span>
                      {rec && <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-500">рекомендуется</span>}
                      <span className="text-xs text-slate-400">{acc != null ? `точность ${acc}%` : 'нет данных'}</span>
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ${RANK_BADGE[s.rank] ?? 'bg-slate-100 text-slate-600'}`}>{s.rank}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button onClick={() => setStep(2)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">Назад</button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Выбрано: {selStudents.size}</span>
              <button onClick={() => setStep(4)} disabled={selStudents.size === 0}
                className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60">Отправить тест</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4 — success */}
      {step === 4 && (
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✓</span>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Тест отправлен</h2>
            <p className="mt-1 text-sm text-slate-500">
              «{topicTitle}» · {questions.length} вопросов · уровень {rank} — отправлен {selStudents.size} ученикам.
            </p>
          </div>
          <button onClick={reset} className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover">Создать ещё один</button>
        </Card>
      )}
    </div>
  );
}
