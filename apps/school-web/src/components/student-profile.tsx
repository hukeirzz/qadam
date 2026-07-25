import type { ReactNode } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { RadarChart, LineChart } from '@/components/charts';
import { ArrowRightIcon } from '@/components/icons';
import { accColor, SUBJECT_AXIS } from '@/lib/aggregate';

const RANK_TEXT: Record<string, string> = {
  S: 'text-blue-600', A: 'text-emerald-600', B: 'text-amber-500', C: 'text-red-500', D: 'text-violet-600',
};
function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

type SectionAcc = { id: string; label: string; acc: number; answered: number };
type TopicGroup = { id: string; label: string; topics: { title: string; order: number; acc: number; answered: number }[] };

export function StudentProfile({
  student, className, sectionAcc, topicGroups, mockHistory,
}: {
  student: { name: string; rank: string; xp: number; streak: number; max_streak: number; premium_source: string };
  className: string;
  sectionAcc: SectionAcc[];
  topicGroups: TopicGroup[];
  mockHistory: { name: string; total: number }[];
}) {
  const mockAvg = mockHistory.length ? Math.round(mockHistory.reduce((a, b) => a + b.total, 0) / mockHistory.length) : null;
  const latest = mockHistory.at(-1)?.total ?? null;
  const progress = mockHistory.length >= 2 ? mockHistory.at(-1)!.total - mockHistory[0].total : null;
  const withData = sectionAcc.filter((s) => s.answered > 0);
  const weakest = [...withData].sort((a, b) => a.acc - b.acc)[0];

  const stat = (label: string, value: ReactNode, sub?: string) => (
    <div className="min-w-[60px]">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold leading-none text-slate-800">{value}</p>
      <p className="mt-1 h-3.5 text-[11px] leading-none text-slate-400">{sub ?? ''}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <Link href="/students" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand">
        <ArrowRightIcon className="h-4 w-4 rotate-180" /> Назад к ученикам
      </Link>

      {/* Header */}
      <Card>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-lg font-bold text-violet-700">{initials(student.name)}</span>
            <div className="leading-tight">
              <h1 className="text-xl font-bold tracking-tight text-slate-800">{student.name}</h1>
              <span className="mt-1 inline-block rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">{className}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
            {stat('Ранг', <span className={`font-extrabold ${RANK_TEXT[student.rank] ?? 'text-slate-600'}`}>{student.rank}</span>)}
            {stat('XP', String(student.xp))}
            {stat('Серия', `🔥 ${student.streak}`, `макс. ${student.max_streak}`)}
            {stat('Ср. балл ОРТ', mockAvg != null ? String(mockAvg) : '—', 'из 245')}
            {stat('Пробных', String(mockHistory.length))}
          </div>
        </div>
      </Card>

      {/* Accuracy radar */}
      <Card>
          <h2 className="font-semibold text-slate-800">Точность по разделам</h2>
          <p className="mt-1 text-xs text-slate-400">Доля верных ответов с первой попытки</p>
          {withData.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Пока нет данных по практике.</p>
          ) : (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-6 sm:flex-nowrap">
              <RadarChart axes={sectionAcc.map((s) => SUBJECT_AXIS[s.id])} series={[{ label: 'Точность', color: '#7c3aed', values: sectionAcc.map((s) => s.acc) }]} max={100} size={260} />
              <ul className="w-full flex-1 space-y-2.5">
                {sectionAcc.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 text-sm">
                    <span className="w-28 shrink-0 text-slate-600">{SUBJECT_AXIS[s.id]}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${s.acc}%`, backgroundColor: accColor(s.acc).backgroundColor }} />
                    </div>
                    <span className="w-9 text-right font-semibold text-slate-800">{s.acc}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {weakest && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              Слабее всего: <b className="font-semibold">{weakest.label}</b> ({weakest.acc}%) — стоит подтянуть.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-800">Пробные ОРТ</h2>
          <p className="mt-1 text-xs text-slate-400">Баллы по пробным · пунктир — порог 110</p>
          {mockHistory.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">Пробных пока нет.</p>
          ) : (
            <>
              <div className="mt-3 flex gap-6 text-sm">
                {stat('Средний', String(mockAvg))}
                {stat('Последний', String(latest))}
                {progress != null && (
                  <div>
                    <p className="text-xs text-slate-400">Прогресс</p>
                    <p className={`mt-0.5 text-lg font-bold ${progress > 0 ? 'text-emerald-600' : progress < 0 ? 'text-red-500' : 'text-slate-500'}`}>{progress > 0 ? '+' : ''}{progress}</p>
                  </div>
                )}
              </div>
              {mockHistory.length >= 2 ? (
                <LineChart labels={mockHistory.map((m) => m.name)} values={mockHistory.map((m) => m.total)} max={245} threshold={110} thresholdLabel="Порог 110" />
              ) : (
                <p className="mt-6 text-xs text-slate-400">График появится после второго пробного.</p>
              )}
            </>
          )}
        </Card>

      {/* Topic accuracy heatmap */}
      <Card>
        <h2 className="font-semibold text-slate-800">Тепловая карта точности по темам</h2>
        <p className="mt-1 text-xs text-slate-400">Красные темы — самые слабые: их стоит подтянуть точечными заданиями.</p>
        {topicGroups.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">Пока нет данных по практике.</p>
        ) : (
          <div className="mt-5 space-y-6">
            {topicGroups.map((g) => {
              const gc = g.topics.reduce((a, t) => a + t.acc * t.answered, 0);
              const ga = g.topics.reduce((a, t) => a + t.answered, 0);
              const gAvg = ga ? Math.round(gc / ga) : 0;
              return (
                <div key={g.id}>
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-700">{g.label}</h3>
                    <span className="text-xs text-slate-400">· средняя {gAvg}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {g.topics.map((t) => (
                      <div key={t.title} className="rounded-lg p-2.5" style={accColor(t.acc)}>
                        <span className="text-base font-bold">{t.acc}%</span>
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
    </div>
  );
}
