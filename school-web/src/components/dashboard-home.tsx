import Link from 'next/link';
import { Card, InfoHint } from '@/components/ui';
import { LineChart } from '@/components/charts';
import { UsersIcon, GraduationIcon, WarningIcon, StarIcon, ChevronDownIcon } from '@/components/icons';

const THRESHOLD = 110;

function initialsOf(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export type Attention = { id: string; name: string; cls: string; accuracy: number; mock: number | null };

export function DashboardHome({
  totalStudents, avgMock, helpCount, topCount, helpBelow, topAbove, needHelp, dynamics,
}: {
  totalStudents: number;
  avgMock: number;
  helpCount: number;
  topCount: number;
  helpBelow: number;
  topAbove: number;
  needHelp: Attention[];
  dynamics: { labels: string[]; values: number[] };
}) {
  const STATS = [
    { label: 'Кол-во учеников', value: String(totalStudents), Icon: UsersIcon, chip: 'bg-violet-100 text-violet-600', num: 'text-violet-600' },
    { label: 'Средний балл ОРТ', value: avgMock ? String(avgMock) : '—', Icon: GraduationIcon, chip: 'bg-teal-100 text-teal-600', num: 'text-teal-600' },
    { label: 'Нужна поддержка', hint: `Точность ответов ниже ${helpBelow}%`, value: String(helpCount), Icon: WarningIcon, chip: 'bg-orange-100 text-orange-500', num: 'text-red-500' },
    { label: 'Сильные ученики', hint: `Выше ${topAbove}% по каждой теме`, value: String(topCount), Icon: StarIcon, chip: 'bg-emerald-100 text-emerald-600', num: 'text-emerald-600' },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Главная</h1>
      </header>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col gap-2.5 rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/50 ring-1 ring-slate-100 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${s.chip}`}><s.Icon className="h-5 w-5 sm:h-6 sm:w-6" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight text-slate-700">
                {s.label}
                {s.hint && <> <InfoHint text={s.hint} /></>}
              </p>
            </div>
            <p className={`text-2xl font-bold tracking-tight sm:text-3xl ${s.num}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Ученики, которым нужна помощь</h2>
            <p className="text-xs text-slate-400">Точность ответов с первой попытки ниже {helpBelow}%</p>
          </div>
          <Link href="/students" className="text-sm font-medium text-brand hover:text-brand-hover">Все ученики</Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
                <th className="px-2 py-3 font-medium">Ученик</th>
                <th className="px-2 py-3 font-medium">Класс</th>
                <th className="px-2 py-3 font-medium">Точность</th>
                <th className="px-2 py-3 font-medium">Балл ОРТ</th>
                <th className="hidden px-2 py-3 sm:table-cell" />
              </tr>
            </thead>
            <tbody>
              {needHelp.length === 0 && (
                <tr><td colSpan={5} className="px-2 py-8 text-center text-sm text-slate-400">Всё в норме — таких учеников нет 🎉</td></tr>
              )}
              {needHelp.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-700">{initialsOf(a.name)}</span>
                      <span className="font-medium text-slate-800">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3"><span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">{a.cls}</span></td>
                  <td className="px-2 py-3 font-semibold text-red-500">{a.accuracy}%</td>
                  <td className="px-2 py-3 text-slate-600">{a.mock ?? '—'}</td>
                  <td className="hidden px-2 py-3 sm:table-cell">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/students/${a.id}`} className="whitespace-nowrap rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">Открыть профиль</Link>
                      <ChevronDownIcon className="h-4 w-4 -rotate-90 text-slate-300" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-slate-800">Динамика пробных тестов</h2>
            <p className="text-xs text-slate-400">Средний балл школы по пробным ОРТ · пунктир — проходной порог {THRESHOLD}</p>
          </div>
          <span className="flex items-center gap-2 text-sm text-slate-500"><span className="h-2.5 w-2.5 rounded-full bg-brand" />Средний балл</span>
        </div>
        {dynamics.values.length >= 2 ? (
          <LineChart labels={dynamics.labels} values={dynamics.values} max={245} threshold={THRESHOLD} thresholdLabel={`Порог ${THRESHOLD}`} />
        ) : (
          <p className="py-10 text-center text-sm text-slate-400">Динамика появится после двух пробных экзаменов.</p>
        )}
      </Card>
    </div>
  );
}
