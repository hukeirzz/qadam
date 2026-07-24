import Link from 'next/link';
import { Card } from '@/components/ui';
import { LineChart } from '@/components/charts';
import {
  UsersIcon,
  WarningIcon,
  TrendingUpIcon,
  StarIcon,
  ChevronDownIcon,
  ArrowRightIcon,
} from '@/components/icons';

// NOTE: Stage-1 dashboard — placeholder figures shaped to the design.
// Wire to Supabase aggregates once school data is populated.

const STATS = [
  { label: 'Всего учеников', value: '245', Icon: UsersIcon, chip: 'bg-violet-100 text-violet-600', num: 'text-violet-600' },
  { label: 'Требуют внимания', value: '18', Icon: WarningIcon, chip: 'bg-orange-100 text-orange-500', num: 'text-red-500' },
  { label: 'Средний ранг по школе', value: 'B', Icon: TrendingUpIcon, chip: 'bg-emerald-100 text-emerald-600', num: 'text-emerald-600' },
  { label: 'S ранг ученики', value: '14', Icon: StarIcon, chip: 'bg-violet-100 text-violet-600', num: 'text-violet-600' },
];

const ATTENTION = [
  { name: 'Нурлан Б.', cls: '11-А', desc: 'Не занимался 7 дней', tone: 'text-red-500' },
  { name: 'Алина К.', cls: '11-Б', desc: 'Пробный тест меньше чем 120 баллов', tone: 'text-amber-600' },
  { name: 'Элина С.', cls: '11-А', desc: 'Набрала 200+ на 2 пробных. До S не хватает 1 пробного', tone: 'text-brand' },
  { name: 'Бекзат С.', cls: '10-В', desc: 'Снизил результат на 23 балла', tone: 'text-red-500' },
  { name: 'Ильяс Т.', cls: '11-Б', desc: 'Имеет критические пробелы по 3 темам', tone: 'text-amber-600' },
];

const RANKS = [
  { rank: 'D', count: 48, pct: 19, color: '#7c3aed', badge: 'bg-violet-100 text-violet-700' },
  { rank: 'C', count: 72, pct: 29, color: '#ef4444', badge: 'bg-red-100 text-red-700' },
  { rank: 'B', count: 61, pct: 25, color: '#f59e0b', badge: 'bg-amber-100 text-amber-700' },
  { rank: 'A', count: 50, pct: 20, color: '#22c55e', badge: 'bg-emerald-100 text-emerald-700' },
  { rank: 'S', count: 14, pct: 6, color: '#3b82f6', badge: 'bg-blue-100 text-blue-700' },
];

const ACTIVITY = {
  labels: ['13 мая', '14 мая', '15 мая', '16 мая', '17 мая', '18 мая', '19 мая'],
  values: [210, 275, 235, 250, 195, 260, 275],
  max: 300,
};

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export function DashboardHome({ firstName }: { firstName: string }) {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Добро пожаловать, {firstName}! 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Сегодня отличный день для новых достижений ваших учеников.
        </p>
      </header>

      {/* Stat cards — no descriptions */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm shadow-slate-200/50 ring-1 ring-slate-100"
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.chip}`}>
              <s.Icon className="h-6 w-6" />
            </span>
            <p className="flex-1 text-sm font-semibold leading-tight text-slate-700">{s.label}</p>
            <p className={`text-3xl font-bold tracking-tight ${s.num}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Attention table + School rank map */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Требуют внимания</h2>
            <Link href="/students" className="text-sm font-medium text-brand hover:text-brand-hover">
              Посмотреть всех
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
                  <th className="px-2 py-3 font-medium">Ученик</th>
                  <th className="px-2 py-3 font-medium">Класс</th>
                  <th className="px-2 py-3 font-medium">Описание</th>
                  <th className="px-2 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {ATTENTION.map((a) => (
                  <tr key={a.name} className="border-b border-slate-100 last:border-0">
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-700">
                          {initialsOf(a.name)}
                        </span>
                        <span className="font-medium text-slate-800">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                        {a.cls}
                      </span>
                    </td>
                    <td className={`px-2 py-3 text-xs font-medium ${a.tone}`}>{a.desc}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href="/students"
                          className="whitespace-nowrap rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                          Открыть профиль
                        </Link>
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
            <Link href="/analytics" className="text-sm font-medium text-brand hover:text-brand-hover">
              Подробнее
            </Link>
          </div>
          <ul className="mt-5 space-y-4">
            {RANKS.map((r) => (
              <li key={r.rank} className="flex items-center gap-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${r.badge}`}>
                  {r.rank}
                </span>
                <span className="w-24 shrink-0 text-sm text-slate-600">{r.count} учеников</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
                <span className="w-10 shrink-0 text-right text-sm font-medium text-slate-700">{r.pct}%</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-slate-600">
              <ArrowRightIcon className="h-4 w-4 shrink-0 -rotate-90 text-emerald-600" />
              <span><b className="font-semibold text-slate-800">12 учеников</b> повысили ранг за месяц</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-slate-600">
              <ArrowRightIcon className="h-4 w-4 shrink-0 rotate-90 text-red-500" />
              <span><b className="font-semibold text-slate-800">9 учеников</b> не продвигаются более 30 дней</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity dynamics — activity only */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-800">Динамика активности</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex rounded-lg bg-slate-100 p-1 text-sm">
              <span className="rounded-md bg-white px-3 py-1 font-medium text-slate-800 shadow-sm">Неделя</span>
              <span className="px-3 py-1 text-slate-500">Месяц</span>
              <span className="px-3 py-1 text-slate-500">Год</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-brand" />
              Активные ученики
            </div>
          </div>
        </div>
        <LineChart labels={ACTIVITY.labels} values={ACTIVITY.values} max={ACTIVITY.max} />
      </Card>
    </div>
  );
}
