'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { TableIcon } from '@/components/icons';
import { createBrowserApi } from '@/lib/supabase/client';

const SECTIONS = [
  { key: 'math', label: 'Математика' },
  { key: 'geometry', label: 'Геометрия' },
  { key: 'grammar', label: 'Грамматика' },
  { key: 'analogies', label: 'Аналогии' },
  { key: 'reading', label: 'Чтение' },
] as const;

type Cell = number | '';
type ClassRow = { id: string; name: string };
type StudentRow = { id: string; name: string; class_id: string | null };
type ExamRow = { id: string; name: string; exam_date: string | null };
type ResultRow = {
  exam_id: string; student_id: string; total: number;
  math: number | null; geometry: number | null; grammar: number | null;
  analogies: number | null; reading: number | null;
};

export function ResultsEditor({
  schoolId, classes, students, exams, results,
}: {
  schoolId: string;
  classes: ClassRow[];
  students: StudentRow[];
  exams: ExamRow[];
  results: ResultRow[];
}) {
  const router = useRouter();
  const [mock, setMock] = useState<string>(exams[exams.length - 1]?.id ?? 'new');
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [cls, setCls] = useState<string>(classes[0]?.id ?? '');
  const [mode, setMode] = useState<'sections' | 'total'>('sections');
  const [sec, setSec] = useState<Record<string, Cell[]>>({});
  const [tot, setTot] = useState<Record<string, Cell>>({});
  const [showEntry, setShowEntry] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ count: number; avg: number; mock: string; cls: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summaryClass, setSummaryClass] = useState('all');

  const isNew = mock === 'new';
  const cols = mode === 'sections' ? SECTIONS.map((s) => s.label) : ['Балл ОРТ'];
  const rows = students.filter((s) => s.class_id === cls);
  const clsName = classes.find((c) => c.id === cls)?.name ?? '';
  const mockLabel = isNew ? newName || 'Новый пробный' : exams.find((e) => e.id === mock)?.name;

  const getCell = (id: string, c: number): Cell => (mode === 'sections' ? sec[id]?.[c] ?? '' : tot[id] ?? '');

  function setCell(id: string, c: number, raw: string) {
    setSaved(null);
    const val: Cell = raw === '' ? '' : Math.max(0, Math.round(Number(raw) || 0));
    if (mode === 'sections') {
      setSec((prev) => {
        const arr = [...(prev[id] ?? (['', '', '', '', ''] as Cell[]))];
        arr[c] = val;
        return { ...prev, [id]: arr };
      });
    } else {
      setTot((prev) => ({ ...prev, [id]: val }));
    }
  }

  const rowTotal = (id: string): number =>
    mode === 'sections'
      ? (sec[id] ?? []).reduce<number>((s, v) => s + (typeof v === 'number' ? v : 0), 0)
      : typeof tot[id] === 'number' ? (tot[id] as number) : 0;
  const rowFilled = (id: string): boolean =>
    mode === 'sections' ? (sec[id] ?? []).some((v) => v !== '') : (tot[id] ?? '') !== '';

  function openEntry() {
    setSaved(null);
    setError(null);
    // Prefill from existing results of the selected exam
    const nextSec: Record<string, Cell[]> = {};
    const nextTot: Record<string, Cell> = {};
    if (!isNew) {
      for (const r of results.filter((r) => r.exam_id === mock)) {
        nextSec[r.student_id] = [r.math ?? '', r.geometry ?? '', r.grammar ?? '', r.analogies ?? '', r.reading ?? ''];
        nextTot[r.student_id] = r.total ?? '';
      }
    }
    setSec(nextSec);
    setTot(nextTot);
    setShowEntry(true);
  }

  function focusCell(r: number, c: number) {
    const el = document.getElementById(`c-${r}-${c}`) as HTMLInputElement | null;
    if (el) { el.focus(); el.select(); }
  }
  function onKeyDown(e: React.KeyboardEvent, r: number, c: number) {
    if (e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); focusCell(r + 1, c); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusCell(r - 1, c); }
  }
  function onPaste(e: React.ClipboardEvent, r: number, c: number) {
    const text = e.clipboardData.getData('text');
    if (!/[\t\n]/.test(text)) return;
    e.preventDefault();
    text.replace(/\r/g, '').split('\n').filter((l) => l.length > 0).forEach((line, ri) => {
      const student = rows[r + ri];
      if (!student) return;
      line.split('\t').forEach((raw, ci) => {
        const col = c + ci;
        if (col < cols.length) setCell(student.id, col, raw.replace(/[^\d]/g, ''));
      });
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const api = createBrowserApi();

    let examId = mock;
    if (isNew) {
      const { data: sess } = await api.supabase.auth.getUser();
      const { id, error: exErr } = await api.staffData.createMockExam(
        schoolId, newName.trim() || 'Пробный', newDate || null, sess.user?.id ?? '',
      );
      if (exErr || !id) { setSaving(false); setError(exErr?.message ?? 'Не удалось создать пробный'); return; }
      examId = id;
    }

    const filled = rows.filter((s) => rowFilled(s.id));
    const payload = filled.map((s) => {
      const base = { student_id: s.id, total: rowTotal(s.id) };
      if (mode === 'sections') {
        const arr = sec[s.id] ?? [];
        return {
          ...base,
          math: (arr[0] as number) ?? null, geometry: (arr[1] as number) ?? null,
          grammar: (arr[2] as number) ?? null, analogies: (arr[3] as number) ?? null,
          reading: (arr[4] as number) ?? null,
        };
      }
      return base;
    });

    const { error: saveErr } = await api.staffData.saveMockResults(examId, payload);
    setSaving(false);
    if (saveErr) { setError(saveErr.message); return; }

    const avg = payload.length ? Math.round(payload.reduce((a, b) => a + b.total, 0) / payload.length) : 0;
    setSaved({ count: payload.length, avg, mock: mockLabel ?? '', cls: clsName });
    setShowEntry(false);
    router.refresh();
  }

  // Summary — real results grouped by student across exams
  const summaryStudents = summaryClass === 'all' ? students : students.filter((s) => s.class_id === summaryClass);
  const resultByKey = new Map(results.map((r) => [`${r.exam_id}:${r.student_id}`, r.total]));

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <TableIcon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Добавить результаты</h1>
          <p className="mt-0.5 text-sm text-slate-500">Внесите баллы пробного ОРТ по классу — таблицей, как в Excel.</p>
        </div>
      </header>

      <Card className="!p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-600">Пробный экзамен</label>
            <select
              value={mock}
              onChange={(e) => { setMock(e.target.value); setSaved(null); }}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand"
            >
              {exams.map((m) => (
                <option key={m.id} value={m.id}>{m.name}{m.exam_date ? ` · ${m.exam_date}` : ''}</option>
              ))}
              <option value="new">+ Новый пробный</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Класс</label>
            <select
              value={cls}
              onChange={(e) => { setCls(e.target.value); setSaved(null); }}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand"
            >
              {classes.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          {isNew && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-600">Название</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Напр. Пробный 3"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Дата проведения</label>
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand" />
              </div>
            </>
          )}
        </div>

        {!showEntry && (
          <div className="mt-5 flex justify-end">
            <button onClick={openEntry} disabled={!cls}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-50">
              Внести результаты
            </button>
          </div>
        )}
      </Card>

      {saved && !showEntry && (
        <div className="flex items-start gap-2 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-700 ring-1 ring-emerald-100">
          <span className="mt-0.5">✓</span>
          <p><b className="font-semibold">{saved.mock} · класс {saved.cls}:</b> сохранено {saved.count} · средний балл {saved.avg}.</p>
        </div>
      )}

      {showEntry && (
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-800">{mockLabel} · класс {clsName}</h2>
          <div className="flex rounded-lg bg-slate-100 p-1 text-sm">
            <button onClick={() => { setMode('sections'); setSaved(null); }}
              className={`rounded-md px-3 py-1 transition ${mode === 'sections' ? 'bg-white font-medium text-slate-800 shadow-sm' : 'text-slate-500'}`}>По разделам</button>
            <button onClick={() => { setMode('total'); setSaved(null); }}
              className={`rounded-md px-3 py-1 transition ${mode === 'total' ? 'bg-white font-medium text-slate-800 shadow-sm' : 'text-slate-500'}`}>Общий балл</button>
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-400">Enter / ↑↓ — навигация · Ctrl+V — вставить диапазон из Excel</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
                <th className="px-3 py-2 font-medium">Ученик</th>
                {cols.map((s) => (<th key={s} className="px-2 py-2 text-center font-medium">{s}</th>))}
                {mode === 'sections' && <th className="px-2 py-2 text-center font-medium">Итог</th>}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-6 text-center text-sm text-slate-400">В этом классе пока нет учеников</td></tr>
              )}
              {rows.map((s, r) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-800">{s.name}</td>
                  {cols.map((_, c) => (
                    <td key={c} className="px-1 py-1.5 text-center">
                      <input id={`c-${r}-${c}`} inputMode="numeric" value={getCell(s.id, c)}
                        onChange={(e) => setCell(s.id, c, e.target.value.replace(/[^\d]/g, ''))}
                        onKeyDown={(e) => onKeyDown(e, r, c)} onPaste={(e) => onPaste(e, r, c)}
                        onFocus={(e) => e.target.select()}
                        className={`${mode === 'total' ? 'w-32' : 'w-16'} rounded-md border border-slate-200 bg-white px-2 py-2 text-center outline-none transition focus:border-brand focus:ring-1 focus:ring-brand/30`} />
                    </td>
                  ))}
                  {mode === 'sections' && (
                    <td className="px-2 py-1.5 text-center">
                      <span className={`inline-block min-w-12 rounded-md px-2 py-2 font-semibold ${rowFilled(s.id) ? 'bg-violet-50 text-violet-700' : 'text-slate-300'}`}>
                        {rowFilled(s.id) ? rowTotal(s.id) : '—'}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">Заполнено: {rows.filter((s) => rowFilled(s.id)).length} из {rows.length}</span>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setShowEntry(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100">Отмена</button>
            <button onClick={handleSave} disabled={saving}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-50">
              {saving ? 'Сохраняем…' : 'Сохранить результаты'}
            </button>
          </div>
        </div>
      </Card>
      )}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-slate-800">Сводная таблица пробных</h2>
            <p className="text-xs text-slate-400">Баллы по всем пробным · средний и прогресс (последний − первый)</p>
          </div>
          <select value={summaryClass} onChange={(e) => setSummaryClass(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 outline-none transition focus:border-brand">
            <option value="all">Все классы</option>
            {classes.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-400">
                <th className="px-3 py-2 text-left font-medium">Ученик</th>
                {exams.map((e) => (<th key={e.id} className="px-2 py-2 text-center font-medium">{e.name}</th>))}
                <th className="px-2 py-2 text-center font-medium text-slate-500">Средний</th>
                <th className="px-2 py-2 text-center font-medium text-slate-500">Прогресс</th>
              </tr>
            </thead>
            <tbody>
              {summaryStudents.map((st) => {
                const vals = exams.map((e) => resultByKey.get(`${e.id}:${st.id}`));
                const present = vals.filter((v): v is number => typeof v === 'number');
                const avg = present.length ? Math.round(present.reduce((a, b) => a + b, 0) / present.length) : null;
                const prog = present.length >= 2 ? present[present.length - 1] - present[0] : null;
                return (
                  <tr key={st.id} className="border-b border-slate-100 last:border-0">
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <p className="font-medium text-slate-800">{st.name}</p>
                      <p className="text-xs text-slate-400">{classes.find((c) => c.id === st.class_id)?.name ?? '—'}</p>
                    </td>
                    {vals.map((v, i) => (<td key={i} className="px-2 py-2.5 text-center text-slate-600">{v ?? '—'}</td>))}
                    <td className="px-2 py-2.5 text-center font-semibold text-slate-800">{avg ?? '—'}</td>
                    <td className="px-2 py-2.5 text-center">
                      {prog === null ? <span className="text-slate-300">—</span> : (
                        <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${prog > 0 ? 'bg-emerald-50 text-emerald-600' : prog < 0 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                          {prog > 0 ? '▲' : prog < 0 ? '▼' : '—'} {prog > 0 ? '+' : ''}{prog !== 0 ? prog : ''}
                        </span>
                      )}
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
