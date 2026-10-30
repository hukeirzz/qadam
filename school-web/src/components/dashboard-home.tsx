import Link from 'next/link';
import { Card } from '@/components/ui';
import { LineChart } from '@/components/charts';
import { UsersIcon, WarningIcon, TrendingUpIcon, StarIcon, ChevronDownIcon } from '@/components/icons';

const THRESHOLD = 110;

const RANK_META: Record<string, { color: string; badge: string }> = {
  S: { color: '#3b82f6', badge: 'bg-blue-100 text-blue-700' },
  A: { color: '#22c55e', badge: 'bg-emerald-100 text-emerald-700' },
  B: { color: '#f59e0b', badge: 'bg-amber-100 text-amber-700' },
  C: { color: '#ef4444', badge: 'bg-red-100 text-red-700' },
  D: { color: '#7c3aed', badge: 'bg-violet-100 text-violet-700' },
};

function initialsOf(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export type Attention = { id: string; name: string; cls: string; reason: string; tone: string };

export function DashboardHome({
  totalStudents, attentionCount, avgRank, sCount, rankDist, attention, dynamics,
}: {
  totalStudents: number;
  attentionCount: number;
  avgRank: string;
  sCount: number;
  rankDist: Record<string, number>;
  attention: Attention[];
  dynamics: { labels: string[]; values: number[] };
}) {
  const STATS = [
    { label: 'Всего учеников', value: String(totalStudents), Icon: UsersIcon, chip: 'bg-violet-100 text-violet-600', num: 'text-violet-600' },
    { label: 'Требуют внимания', value: String(attentionCount), Icon: WarningIcon, chip: 'bg-orange-100 text-orange-500', num: 'text-red-500' },
    { label: 'Средний ранг по школе', value: avgRank, Icon: TrendingUpIcon, chip: 'bg-emerald-100 text-emerald-600', num: 'text-emerald-600' },
    { label: 'S ранг ученики', value: String(sCount), Icon: StarIcon, chip: 'bg-violet-100 text-violet-600', num: 'text-violet-600' },
  ];

  const rankTotal = Object.values(rankDist).reduce((a, b) => a + b, 0) || 1;
  const rankRows = ['S', 'A', 'B', 'C', 'D'].map((r) => ({
    rank: r, count: rankDist[r] ?? 0, pct: Math.round((100 * (rankDist[r] ?? 0)) / rankTotal), ...RANK_META[r],
  }));

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Добро пожаловать! 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Сегодня отличный день для новых достижений ваших учеников.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col gap-2.5 rounded-2xl bg-white p-4 shadow-sm shadow-slate-200/50 ring-1 ring-slate-100 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${s.chip}`}><s.Icon className="h-5 w-5 sm:h-6 sm:w-6" /></span>
            <p className="min-w-0 flex-1 text-sm font-semibold leading-tight text-slate-700">{s.label}</p>
            <p className={`text-2xl font-bold tracking-tight sm:text-3xl ${s.num}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Требуют внимания</h2>
            <Link href="/students" className="text-sm font-medium text-brand hover:text-brand-hover">Посмотреть всех</Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
                  <th className="px-2 py-3 font-medium">Ученик</th>
                  <th className="px-2 py-3 font-medium">Класс</th>
                  <th className="px-2 py-3 font-medium">Описание</th>
                  <th className="hidden px-2 py-3 font-medium xl:table-cell" />
                </tr>
              </thead>
              <tbody>
                {attention.length === 0 && (
                  <tr><td colSpan={4} className="px-2 py-6 text-center text-sm text-slate-400">Все в норме — рисков нет 🎉</td></tr>
                )}
                {attention.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-700">{initialsOf(a.name)}</span>
                        <span className="font-medium text-slate-800">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3"><span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">{a.cls}</span></td>
                    <td className={`px-2 py-3 text-xs font-medium ${a.tone}`}>{a.reason}</td>
                    <td className="hidden px-2 py-3 xl:table-cell">
                      <div className="flex items-center justify-end gap-1">
                        <Link href="/students" className="whitespace-nowrap rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">Открыть профиль</Link>
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
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Карта прогресса школы</h2>
            <Link href="/analytics" className="text-sm font-medium text-brand hover:text-brand-hover">Подробнее</Link>
          </div>
          <ul className="mt-5 space-y-4">
            {rankRows.map((r) => (
              <li key={r.rank} className="flex items-center gap-2.5 sm:gap-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${r.badge}`}>{r.rank}</span>
                <span className="w-20 shrink-0 text-sm text-slate-600">{r.count} учеников</span>
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
                <span className="w-9 shrink-0 text-right text-sm font-medium text-slate-700">{r.pct}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-slate-800">Динамика среднего балла пробных</h2>
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
