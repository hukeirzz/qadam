import { Card } from '@/components/ui';
import { LineChart } from '@/components/charts';
import { accColor, type LevelHeatmapGroup } from '@/lib/aggregate';

/** «Пробные ОРТ»: средний / последний / прогресс и линия с порогом 110. Одинаков у учителя и у ученика. */
export function MockExamsCard({ mockHistory }: { mockHistory: { name: string; total: number }[] }) {
  const mockAvg = mockHistory.length ? Math.round(mockHistory.reduce((a, b) => a + b.total, 0) / mockHistory.length) : null;
  const latest = mockHistory.at(-1)?.total ?? null;
  const progress = mockHistory.length >= 2 ? mockHistory.at(-1)!.total - mockHistory[0].total : null;
  return (
    <Card className="!p-4 sm:!p-6">
      <h2 className="font-semibold text-slate-800">Пробные ОРТ</h2>
      <p className="mt-1 text-xs text-slate-400">Баллы по пробным · пунктир — порог 110</p>
      {mockHistory.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">Пробных пока нет.</p>
      ) : (
        <>
          <dl className={`mt-4 grid gap-2 sm:gap-3 ${progress != null ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <div className="rounded-lg bg-slate-50 px-3 py-3 sm:px-4">
              <dt className="text-xs text-slate-500">Средний</dt>
              <dd className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">{mockAvg}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-3 sm:px-4">
              <dt className="text-xs text-slate-500">Последний</dt>
              <dd className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">{latest}</dd>
            </div>
            {progress != null && (
              <div className="rounded-lg bg-slate-50 px-3 py-3 sm:px-4">
                <dt className="text-xs text-slate-500">Прогресс</dt>
                <dd className={`mt-1 text-xl font-semibold sm:text-2xl ${progress > 0 ? 'text-emerald-600' : progress < 0 ? 'text-red-500' : 'text-slate-500'}`}>{progress > 0 ? '+' : ''}{progress}</dd>
              </div>
            )}
          </dl>
          {mockHistory.length >= 2 ? (
            <LineChart labels={mockHistory.map((m) => m.name)} values={mockHistory.map((m) => m.total)} max={245} threshold={110} thresholdLabel="Порог 110" />
          ) : (
            <p className="mt-6 text-xs text-slate-400">График появится после второго пробного.</p>
          )}
        </>
      )}
    </Card>
  );
}

/** Тепловая карта точности по темам одного уровня (по результатам школьных тестов). */
export function LevelHeatmapCard({ label, groups }: { label: string; groups: LevelHeatmapGroup[] }) {
  return (
    <Card className="!p-4 sm:!p-6">
      <h2 className="font-semibold text-slate-800">Тепловая карта · {label} уровень</h2>
      <p className="mt-1 text-xs text-slate-400">Точность по темам этого уровня — по результатам школьных тестов. Серые темы ещё не проходились.</p>
      {groups.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">В этом уровне пока нет тем.</p>
      ) : (
        <div className="mt-5 space-y-6">
          {groups.map((g) => {
            const scored = g.topics.filter((t) => t.acc != null);
            const gAvg = scored.length ? Math.round(scored.reduce((a, t) => a + (t.acc as number), 0) / scored.length) : null;
            return (
              <div key={g.id}>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-700">{g.label}</h3>
                  <span className="text-xs text-slate-400">· {gAvg != null ? `средняя ${gAvg}%` : 'нет данных'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {g.topics.map((t) => (
                    <div key={t.title} className="rounded-lg p-2.5" style={t.acc != null ? accColor(t.acc) : { backgroundColor: '#f1f5f9', color: '#94a3b8' }}>
                      <span className="text-base font-bold">{t.acc != null ? `${t.acc}%` : '—'}</span>
                      <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-tight opacity-95">{t.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
