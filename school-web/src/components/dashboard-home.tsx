import Link from 'next/link';
import { Card } from '@/components/ui';
import { KpiCard } from '@/components/kpi-card';
import { plural } from '@/components/student-widgets';
import { LineChart } from '@/components/charts';
import { UsersIcon, GraduationIcon, WarningIcon, StarIcon, ChevronDownIcon } from '@/components/icons';

const THRESHOLD = 110;

function initialsOf(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export type Attention = { id: string; name: string; cls: string; accuracy: number; mock: number | null };

export function DashboardHome({
  totalStudents, classCount, avgMock, helpCount, topCount, helpBelow, topAbove, needHelp, dynamics,
}: {
  totalStudents: number;
  classCount: number;
  avgMock: number;
  helpCount: number;
  topCount: number;
  helpBelow: number;
  topAbove: number;
  needHelp: Attention[];
  dynamics: { labels: string[]; values: number[] };
}) {
  const mockCount = dynamics.values.length;
  const stats = [
    { Icon: UsersIcon, label: 'Учеников', value: String(totalStudents), sub: classCount ? `в ${classCount} ${plural(classCount, 'классе', 'классах', 'классах')}` : undefined, tone: 'violet' as const },
    { Icon: GraduationIcon, label: 'Средний балл ОРТ', value: avgMock ? String(avgMock) : '—', sub: mockCount ? `по ${mockCount} ${plural(mockCount, 'пробному', 'пробным', 'пробным')} · из 245` : 'пробных пока нет', tone: 'teal' as const },
    { Icon: WarningIcon, label: 'Нужна поддержка', value: String(helpCount), sub: `точность ниже ${helpBelow}%`, tone: 'orange' as const, alert: helpCount > 0 },
    { Icon: StarIcon, label: 'Сильные ученики', value: String(topCount), sub: `выше ${topAbove}% по каждой теме`, tone: 'emerald' as const },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Главная</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((st) => <KpiCard key={st.label} {...st} />)}
      </div>

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">Ученики, которым нужна помощь</h2>
            <p className="text-xs text-slate-400">Точность по школьным тестам ниже {helpBelow}%</p>
          </div>
          <Link href="/students" className="shrink-0 self-start whitespace-nowrap text-sm font-medium text-brand hover:text-brand-hover sm:self-auto">Все ученики</Link>
        </div>
        <ul className="mt-3 divide-y divide-slate-100 sm:hidden">
          {needHelp.length === 0 && <li className="py-7 text-center"><p className="text-sm font-semibold text-slate-700">Всё в норме 🎉</p><p className="mt-1 text-xs text-slate-400">Учеников, которым нужна помощь, нет</p></li>}
          {needHelp.map((a) => (
            <li key={a.id}>
              <Link href={`/students/${a.id}`} className="flex items-center gap-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-700">{initialsOf(a.name)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{a.name}</p>
                  <p className="text-xs text-slate-400">{a.cls}{a.mock != null ? ` · ОРТ ${a.mock}` : ''}</p>
                </div>
                <span className="text-sm font-semibold text-red-500">{a.accuracy}%</span>
                <ChevronDownIcon className="h-4 w-4 shrink-0 -rotate-90 text-slate-300" />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 hidden overflow-x-auto sm:block">
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
