import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard-header';
import { Card, FakeSelect, SearchBox, Avatar, RankBadge, ProgressBar } from '@/components/ui';
import { UserPlusIcon, MoreIcon } from '@/components/icons';

// NOTE: Stage-1 roster — placeholder data shaped to the design. Wire to
// Supabase (students filtered by school_id, grouped by class) later.

const CLASSES = [
  { cls: '9-А', students: 28, rank: 'B', progress: 68 },
  { cls: '9-Б', students: 26, rank: 'C', progress: 58 },
  { cls: '10-А', students: 24, rank: 'B', progress: 61 },
  { cls: '8-А', students: 22, rank: 'C', progress: 58 },
  { cls: '8-Б', students: 20, rank: 'D', progress: 52 },
];

const STUDENTS = [
  { id: 1, name: 'Дружинин А.', cls: '9-А', rank: 'A', streak: '7 дней', streakOk: true, last: 'Сегодня', progress: 80 },
  { id: 2, name: 'Нурлан Б.', cls: '9-А', rank: 'B', streak: '6 дней', streakOk: true, last: 'Вчера', progress: 75 },
  { id: 3, name: 'Зулия К.', cls: '9-А', rank: 'B', streak: '7 дней', streakOk: true, last: 'Сегодня', progress: 70 },
  { id: 4, name: 'Сиа (Бексат)', cls: '9-А', rank: 'C', streak: '5 дней', streakOk: true, last: 'Сегодня', progress: 60 },
  { id: 5, name: 'Руслан Т.', cls: '9-Б', rank: 'C', streak: '2 дня', streakOk: false, last: '2 дня назад', progress: 55 },
  { id: 6, name: 'Элина К.', cls: '9-Б', rank: 'B', streak: '4 дня', streakOk: true, last: 'Сегодня', progress: 66 },
  { id: 7, name: 'Алина М.', cls: '8-А', rank: 'D', streak: '0 дней', streakOk: false, last: '6 дней назад', progress: 28 },
  { id: 8, name: 'Тимур С.', cls: '8-Б', rank: 'C', streak: '3 дня', streakOk: true, last: 'Вчера', progress: 48 },
];

export default function StudentsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <DashboardHeader
        title="Ученики"
        subtitle="Классы и профили учеников"
        actions={
          <Link
            href="/students"
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
          >
            <UserPlusIcon className="h-4 w-4" />
            Пригласить ученика
          </Link>
        }
      />

      {/* Classes */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Классы</h2>
          <button className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background">
            + Создать класс
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {CLASSES.map((c) => (
            <div key={c.cls} className="rounded-2xl bg-surface p-5 ring-1 ring-border">
              <div className="flex items-start justify-between">
                <p className="text-xl font-bold text-foreground">{c.cls}</p>
                <RankBadge rank={c.rank} />
              </div>
              <p className="mt-1 text-sm text-muted">{c.students} учеников</p>
              <div className="mt-4 flex items-center gap-2">
                <ProgressBar value={c.progress} className="flex-1" />
                <span className="text-xs font-medium text-foreground">{c.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Roster */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-foreground">Все ученики</h2>
          <div className="flex flex-wrap items-center gap-3">
            <FakeSelect label="Все классы" />
            <FakeSelect label="Все ранги" />
            <SearchBox placeholder="Поиск по имени" />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
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
                <tr key={s.id} className="border-b border-border/70 last:border-0">
                  <td className="px-3 py-3.5">
                    <Link href={`/students/${s.id}`} className="flex items-center gap-3 hover:text-brand">
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
                    <Link href={`/students/${s.id}`} className="text-muted hover:text-foreground" aria-label="Открыть профиль">
                      <MoreIcon className="h-5 w-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
