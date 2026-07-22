import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard-header';
import { FakeSelect, SearchBox, Card, RankBadge, Avatar, ProgressBar } from '@/components/ui';
import { LineChart } from '@/components/charts';
import {
  UsersIcon,
  TrendingUpIcon,
  StarIcon,
  TrophyIcon,
  AnalyticsIcon,
  AlertIcon,
  TestsIcon,
  UserPlusIcon,
  CalendarIcon,
  MoreIcon,
} from '@/components/icons';

// NOTE: Stage-1 dashboard — figures below are placeholder data shaped to the
// design. Wire each block to Supabase aggregates once schools/classes are
// populated (school totals, activity series, attention rules, roster).

const STATS = [
  { label: 'Всего учеников', value: '245', hint: '+12 за неделю', hintTone: 'text-emerald-600', Icon: UsersIcon, tint: 'bg-violet-100 text-violet-600' },
  { label: 'Активны (7 дней)', value: '198', hint: '81% от всех', hintTone: 'text-muted', Icon: TrendingUpIcon, tint: 'bg-emerald-100 text-emerald-600' },
  { label: 'Средний ранг школы', value: 'B', hint: 'Хороший прогресс', hintTone: 'text-muted', Icon: StarIcon, tint: 'bg-amber-100 text-amber-600' },
  { label: 'Средний прогресс', value: '62%', hint: '+5% за неделю', hintTone: 'text-emerald-600', Icon: TrendingUpIcon, tint: 'bg-blue-100 text-blue-600' },
  { label: 'Ближайший дедлайн', value: 'Математический спринт', valueClass: 'text-base text-brand', hint: 'До конца: 2д 15ч', hintTone: 'text-muted', Icon: TrophyIcon, tint: 'bg-violet-100 text-violet-600' },
];

const ATTENTION = [
  { title: '9-Б класс', text: 'Активность упала: 45% учеников не заходили более 5 дней', severity: 'high' as const },
  { title: 'Алина К.', text: 'Пробелы в разделе «Геометрия»', severity: 'medium' as const },
  { title: '7-А класс', text: 'Отстают по разделу «Грамматика»', severity: 'medium' as const },
];

const ACTIVITY = {
  labels: ['7 мая', '8 мая', '9 мая', '10 мая', '11 мая', '12 мая', '13 мая'],
  values: [100, 180, 120, 170, 220, 250, 150],
};

const STUDENTS = [
  { n: 1, name: 'Дружинин А.', cls: '9-А', rank: 'A', streak: '7 дней', streakOk: true, last: 'Сегодня', progress: 80 },
  { n: 2, name: 'Нурлан Б.', cls: '9-А', rank: 'B', streak: '6 дней', streakOk: true, last: 'Вчера', progress: 75 },
  { n: 3, name: 'Зулия К.', cls: '9-А', rank: 'B', streak: '7 дней', streakOk: true, last: 'Сегодня', progress: 70 },
  { n: 4, name: 'Сиа (Бексат)', cls: '9-А', rank: 'C', streak: '5 дней', streakOk: true, last: 'Сегодня', progress: 60 },
  { n: 5, name: 'Руслан Т.', cls: '9-Б', rank: 'C', streak: '2 дня', streakOk: false, last: '2 дня назад', progress: 55 },
];

const QUICK_ACTIONS = [
  { href: '/tests', title: 'Создать тест', text: 'Назначить тест ученикам или класс', Icon: TestsIcon },
  { href: '/tests', title: 'Создать соревнование', text: 'Запустить соревнование для мотивации', Icon: TrophyIcon },
  { href: '/students', title: 'Пригласить ученика', text: 'Отправить ссылку для приглашения', Icon: UserPlusIcon },
  { href: '/analytics', title: 'Аналитика', text: 'Подробнее отчёты и рекомендации', Icon: AnalyticsIcon },
];

export default function DashboardHomePage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <DashboardHeader
        title="Главная"
        subtitle="Обзор школы"
        notifications={3}
        actions={
          <>
            <FakeSelect label="7 дней" icon={<CalendarIcon className="h-4 w-4" />} />
            <Link
              href="/students"
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              <UserPlusIcon className="h-4 w-4" />
              Пригласить ученика
            </Link>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface p-5 ring-1 ring-border">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-muted">{s.label}</p>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${s.tint}`}>
                <s.Icon className="h-5 w-5" />
              </span>
            </div>
            <p className={`mt-2 font-bold text-foreground ${s.valueClass ?? 'text-3xl'}`}>{s.value}</p>
            <p className={`mt-1 text-xs ${s.hintTone}`}>{s.hint}</p>
          </div>
        ))}
      </div>

      {/* Attention + Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Требует внимания</h2>
            <Link href="/analytics" className="text-sm font-medium text-brand hover:text-brand-hover">
              Смотреть все
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {ATTENTION.map((a) => (
              <li key={a.title} className="flex items-center gap-4 rounded-xl border border-border p-4">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    a.severity === 'high' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
                  }`}
                >
                  <AnalyticsIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{a.title}</p>
                  <p className="truncate text-sm text-muted">{a.text}</p>
                </div>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${
                    a.severity === 'high' ? 'bg-red-500' : 'bg-amber-400'
                  }`}
                >
                  <AlertIcon className="h-4 w-4" />
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Активность школы</h2>
            <FakeSelect label="7 дней" />
          </div>
          <LineChart labels={ACTIVITY.labels} values={ACTIVITY.values} max={300} />
        </Card>
      </div>

      {/* Students table */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-foreground">Ученики школы</h2>
          <div className="flex flex-wrap items-center gap-3">
            <FakeSelect label="Все классы" />
            <FakeSelect label="Все активности" />
            <SearchBox placeholder="Поиск по имени" />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-3 py-3 font-medium">#</th>
                <th className="px-3 py-3 font-medium">Ученик</th>
                <th className="px-3 py-3 font-medium">Класс</th>
                <th className="px-3 py-3 font-medium">Ранг</th>
                <th className="px-3 py-3 font-medium">Серия дней</th>
                <th className="px-3 py-3 font-medium">Последняя активность</th>
                <th className="px-3 py-3 font-medium">Прогресс</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {STUDENTS.map((s) => (
                <tr key={s.n} className="border-b border-border/70 last:border-0">
                  <td className="px-3 py-3.5 text-muted">{s.n}</td>
                  <td className="px-3 py-3.5">
                    <Link href="/students/1" className="flex items-center gap-3 hover:text-brand">
                      <Avatar name={s.name} />
                      <span className="font-medium text-foreground">{s.name}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-3.5 text-muted">{s.cls}</td>
                  <td className="px-3 py-3.5"><RankBadge rank={s.rank} /></td>
                  <td className={`px-3 py-3.5 font-medium ${s.streakOk ? 'text-emerald-600' : 'text-red-500'}`}>
                    {s.streak}
                  </td>
                  <td className="px-3 py-3.5 text-muted">{s.last}</td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={s.progress} />
                      <span className="text-xs font-medium text-foreground">{s.progress}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <button className="text-muted hover:text-foreground" aria-label="Действия">
                      <MoreIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 font-semibold text-foreground">Быстрые действия</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((q) => (
            <Link
              key={q.title}
              href={q.href}
              className="flex items-start gap-4 rounded-2xl bg-surface p-5 ring-1 ring-border transition hover:ring-brand/40"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <q.Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-foreground">{q.title}</p>
                <p className="mt-0.5 text-sm text-muted">{q.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
