'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { TableIcon } from '@/components/icons';

// Ввод результатов пробных ОРТ таблицей (как в Excel) + сводная таблица всех
// пробных с прогрессом. Два режима ввода: по 4 официальным разделам основного
// теста (Итог = сумма) или сразу общий балл.
//
// NOTE: Stage-1 — данные локальные. Сохранение/чтение из Supabase (таблицы
// mock_exams / mock_results) подключим следующим шагом.

const SECTIONS = ['Математика', 'Аналогии', 'Чтение', 'Грамматика'];
const CLASSES = ['11А', '11Б', '10А', '10Б'];

const MOCKS = [
  { id: 'm6', name: 'Пробный 6', date: '12 мая' },
  { id: 'm5', name: 'Пробный 5', date: '28 апр' },
  { id: 'm4', name: 'Пробный 4', date: '14 апр' },
];

const EXAMS = ['Проб. 1', 'Проб. 2', 'Проб. 3', 'Проб. 4', 'Проб. 5', 'Проб. 6'];

const STUDENTS: { name: string; cls: string; base: number; growth: number }[] = [
  { name: 'Дружинин Алишер', cls: '11А', base: 188, growth: 8 },
  { name: 'Нурлан Бейбарс', cls: '11А', base: 168, growth: 9 },
  { name: 'Сиа Бексат', cls: '11А', base: 150, growth: 7 },
  { name: 'Бекзат Асан', cls: '11А', base: 104, growth: 4 },
  { name: 'Айдана Кубат', cls: '11А', base: 132, growth: 6 },
  { name: 'Элина Касымова', cls: '11Б', base: 176, growth: 8 },
  { name: 'Мадина Сапар', cls: '11Б', base: 158, growth: 5 },
  { name: 'Асель Рахат', cls: '11Б', base: 96, growth: 2 },
  { name: 'Данияр Талас', cls: '11Б', base: 120, growth: 6 },
  { name: 'Айгерим Максат', cls: '10А', base: 142, growth: 7 },
  { name: 'Тимур Осмон', cls: '10А', base: 110, growth: 3 },
  { name: 'Нургиза Бакыт', cls: '10А', base: 128, growth: 5 },
  { name: 'Руслан Токтогул', cls: '10Б', base: 134, growth: 6 },
  { name: 'Марат Кубат', cls: '10Б', base: 100, growth: 1 },
  { name: 'Алина Мурат', cls: '10Б', base: 112, growth: -3 },
];

const NOISE = [0, -2, 3, -1, 2, 1];
function seriesOf(s: { base: number; growth: number }): number[] {
  return NOISE.map((n, i) => Math.max(0, s.base + s.growth * i + n));
}

type Cell = number | '';

export default function ResultsPage() {
  const [mock, setMock] = useState<string>(MOCKS[0].id);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [cls, setCls] = useState('11А');
  const [mode, setMode] = useState<'sections' | 'total'>('sections');
  const [sec, setSec] = useState<Record<string, Cell[]>>({});
  const [tot, setTot] = useState<Record<string, Cell>>({});
  const [saved, setSaved] = useState<{ count: number; avg: number; mock?: string; cls: string } | null>(null);
  const [showEntry, setShowEntry] = useState(false);
  const [summaryClass, setSummaryClass] = useState('all');

  const rows = STUDENTS.filter((s) => s.cls === cls);
  const isNew = mock === 'new';
  const cols = mode === 'sections' ? SECTIONS : ['Балл ОРТ'];

  const getCell = (name: string, c: number): Cell =>
    mode === 'sections' ? sec[name]?.[c] ?? '' : tot[name] ?? '';

  function setCell(name: string, c: number, raw: string) {
    setSaved(null);
    const val: Cell = raw === '' ? '' : Math.max(0, Math.round(Number(raw) || 0));
    if (mode === 'sections') {
      setSec((prev) => {
        const arr = [...(prev[name] ?? (['', '', '', ''] as Cell[]))];
        arr[c] = val;
        return { ...prev, [name]: arr };
      });
    } else {
      setTot((prev) => ({ ...prev, [name]: val }));
    }
  }

  const rowTotal = (name: string): number =>
    mode === 'sections'
      ? (sec[name] ?? []).reduce<number>((s, v) => s + (typeof v === 'number' ? v : 0), 0)
      : typeof tot[name] === 'number'
        ? (tot[name] as number)
        : 0;

  const rowFilled = (name: string): boolean =>
    mode === 'sections' ? (sec[name] ?? []).some((v) => v !== '') : (tot[name] ?? '') !== '';

  function focusCell(r: number, c: number) {
    const el = document.getElementById(`c-${r}-${c}`) as HTMLInputElement | null;
    if (el) {
      el.focus();
      el.select();
    }
  }

  function onKeyDown(e: React.KeyboardEvent, r: number, c: number) {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      focusCell(r + 1, c);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusCell(r - 1, c);
    }
  }

  function onPaste(e: React.ClipboardEvent, r: number, c: number) {
    const text = e.clipboardData.getData('text');
    if (!/[\t\n]/.test(text)) return;
    e.preventDefault();
    const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.length > 0);
    lines.forEach((line, ri) => {
      const student = rows[r + ri];
      if (!student) return;
      line.split('\t').forEach((raw, ci) => {
        const col = c + ci;
        if (col < cols.length) setCell(student.name, col, raw.replace(/[^\d]/g, ''));
      });
    });
  }

  function openEntry() {
    setSaved(null);
    setShowEntry(true);
  }

  function handleSave() {
    const filled = rows.filter((s) => rowFilled(s.name));
    const totals = filled.map((s) => rowTotal(s.name));
    const avg = totals.length ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length) : 0;
    setSaved({ count: filled.length, avg, mock: mockLabel, cls });
    setShowEntry(false);
  }

  const mockLabel = isNew ? newName || 'Новый пробный' : MOCKS.find((m) => m.id === mock)?.name;
  const summaryRows = summaryClass === 'all' ? STUDENTS : STUDENTS.filter((s) => s.cls === summaryClass);

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

      {/* Controls */}
      <Card className="!p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-600">Пробный экзамен</label>
            <select
              value={mock}
              onChange={(e) => { setMock(e.target.value); setSaved(null); }}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand"
            >
              {MOCKS.map((m) => (
                <option key={m.id} value={m.id}>{m.name} · {m.date}</option>
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
              {CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {isNew && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-600">Название</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Напр. Пробный 7"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Дата проведения</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand"
                />
              </div>
            </>
          )}
        </div>

        {!showEntry && (
          <div className="mt-5 flex justify-end">
            <button
              onClick={openEntry}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              Внести результаты
            </button>
          </div>
        )}
      </Card>

      {saved && !showEntry && (
        <div className="flex items-start gap-2 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-700 ring-1 ring-emerald-100">
          <span className="mt-0.5">✓</span>
          <p>
            <b className="font-semibold">{saved.mock} · класс {saved.cls}:</b> внесено {saved.count}{' '}
            {plural(saved.count, 'результат', 'результата', 'результатов')} · средний балл {saved.avg}.
            <span className="text-emerald-600/70"> Сохранение в базу подключим следующим шагом.</span>
          </p>
        </div>
      )}

      {/* Entry grid — appears when opened, hides on save */}
      {showEntry && (
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-800">{mockLabel} · класс {cls}</h2>
          <div className="flex rounded-lg bg-slate-100 p-1 text-sm">
            <button
              onClick={() => { setMode('sections'); setSaved(null); }}
              className={`rounded-md px-3 py-1 transition ${mode === 'sections' ? 'bg-white font-medium text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              По разделам
            </button>
            <button
              onClick={() => { setMode('total'); setSaved(null); }}
              className={`rounded-md px-3 py-1 transition ${mode === 'total' ? 'bg-white font-medium text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              Общий балл
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-400">Enter / ↑↓ — навигация · Ctrl+V — вставить диапазон из Excel</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
                <th className="px-3 py-2 font-medium">Ученик</th>
                {cols.map((s) => (
                  <th key={s} className="px-2 py-2 text-center font-medium">{s}</th>
                ))}
                {mode === 'sections' && <th className="px-2 py-2 text-center font-medium">Итог</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((s, r) => (
                <tr key={s.name} className="border-b border-slate-100 last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-800">{s.name}</td>
                  {cols.map((_, c) => (
                    <td key={c} className="px-1 py-1.5 text-center">
                      <input
                        id={`c-${r}-${c}`}
                        inputMode="numeric"
                        value={getCell(s.name, c)}
                        onChange={(e) => setCell(s.name, c, e.target.value.replace(/[^\d]/g, ''))}
                        onKeyDown={(e) => onKeyDown(e, r, c)}
                        onPaste={(e) => onPaste(e, r, c)}
                        onFocus={(e) => e.target.select()}
                        className={`${mode === 'total' ? 'w-32' : 'w-20'} rounded-md border border-slate-200 bg-white px-2 py-2 text-center outline-none transition focus:border-brand focus:ring-1 focus:ring-brand/30`}
                      />
                    </td>
                  ))}
                  {mode === 'sections' && (
                    <td className="px-2 py-1.5 text-center">
                      <span className={`inline-block min-w-12 rounded-md px-2 py-2 font-semibold ${rowFilled(s.name) ? 'bg-violet-50 text-violet-700' : 'text-slate-300'}`}>
                        {rowFilled(s.name) ? rowTotal(s.name) : '—'}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-400">Заполнено: {rows.filter((s) => rowFilled(s.name)).length} из {rows.length}</span>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setShowEntry(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              Сохранить результаты
            </button>
          </div>
        </div>
      </Card>
      )}

      {/* Summary — all mock results with progress */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-slate-800">Сводная таблица пробных</h2>
            <p className="text-xs text-slate-400">Баллы по всем пробным · средний и прогресс (последний − первый)</p>
          </div>
          <select
            value={summaryClass}
            onChange={(e) => setSummaryClass(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 outline-none transition focus:border-brand"
          >
            <option value="all">Все классы</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-400">
                <th className="sticky left-0 z-10 bg-white px-3 py-2 text-left font-medium">Ученик</th>
                {EXAMS.map((e) => (
                  <th key={e} className="px-2 py-2 text-center font-medium">{e}</th>
                ))}
                <th className="px-2 py-2 text-center font-medium text-slate-500">Средний</th>
                <th className="px-2 py-2 text-center font-medium text-slate-500">Прогресс</th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((st) => {
                const s = seriesOf(st);
                const avg = Math.round(s.reduce((a, b) => a + b, 0) / s.length);
                const prog = s[s.length - 1] - s[0];
                return (
                  <tr key={st.name} className="border-b border-slate-100 last:border-0">
                    <td className="sticky left-0 z-10 whitespace-nowrap bg-white px-3 py-2.5">
                      <p className="font-medium text-slate-800">{st.name}</p>
                      <p className="text-xs text-slate-400">{st.cls}</p>
                    </td>
                    {s.map((v, i) => (
                      <td key={i} className="px-2 py-2.5 text-center text-slate-600">{v}</td>
                    ))}
                    <td className="px-2 py-2.5 text-center font-semibold text-slate-800">{avg}</td>
                    <td className="px-2 py-2.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
                          prog > 0 ? 'bg-emerald-50 text-emerald-600' : prog < 0 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {prog > 0 ? '▲' : prog < 0 ? '▼' : '—'} {prog > 0 ? '+' : ''}{prog !== 0 ? prog : ''}
                      </span>
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

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}
