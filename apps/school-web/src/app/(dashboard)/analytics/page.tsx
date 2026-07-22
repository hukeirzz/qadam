import { DashboardHeader } from '@/components/dashboard-header';
import { Card, FakeSelect, Avatar, ProgressBar } from '@/components/ui';
import { Segmented } from '@/components/segmented';
import { DonutChart, BarChart } from '@/components/charts';

// NOTE: Stage-1 analytics — placeholder figures shaped to the design.
// Replace with Supabase aggregates (per-class progress, subject mastery,
// XP leaderboards, weak-topic detection) once school data exists.

const SUBJECT_COLORS: Record<string, string> = {
  Математика: '#6d28d9',
  Геометрия: '#2563eb',
  Аналогии: '#0891b2',
  'Чтение и понимание': '#16a34a',
  Грамматика: '#f59e0b',
};

const CLASS_RANKING = [
  { cls: '9-Б', v: 78 },
  { cls: '10-А', v: 68 },
  { cls: '9-А', v: 64 },
  { cls: '8-А', v: 58 },
  { cls: '8-Б', v: 52 },
];

const SUBJECTS = [
  { label: 'Математика', value: 66 },
  { label: 'Геометрия', value: 54 },
  { label: 'Аналогии', value: 58 },
  { label: 'Чтение и понимание', value: 60 },
  { label: 'Грамматика', value: 50 },
];

const TOP_STUDENTS = [
  { name: 'Дружинин А.', xp: 2400 },
  { name: 'Нурлан Б.', xp: 2100 },
  { name: 'Элина К.', xp: 1950 },
  { name: 'Сиа (Бексат)', xp: 1800 },
  { name: 'Руслан Т.', xp: 1660 },
];

const LAGGING_STUDENTS = [
  { name: 'Алина М.', xp: 450 },
  { name: 'Асель Р.', xp: 520 },
  { name: 'Бексат А.', xp: 600 },
  { name: 'Мария К.', xp: 620 },
  { name: 'Тимур С.', xp: 650 },
];

const SCHOOL_XP = {
  labels: ['7 мая', '8 мая', '9 мая', '10 мая', '11 мая', '12 мая'],
  values: [320, 280, 420, 360, 480, 400],
};

const WEAK_TOPICS = [
  { topic: 'Геометрия: Углы', v: 32 },
  { topic: 'Алгебра: Уравнения', v: 38 },
  { topic: 'Грамматика: Времена', v: 41 },
  { topic: 'Чтение: Главная идея', v: 43 },
  { topic: 'Математика: Дроби', v: 45 },
];

const MEDAL = ['bg-amber-400', 'bg-slate-300', 'bg-orange-400'];

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <DashboardHeader
        title="Аналитика"
        subtitle="Обзор успеваемости школы"
        actions={
          <>
            <FakeSelect label="Все ранги" />
            <FakeSelect label="Все классы" />
          </>
        }
      />

      <Segmented options={['7 дней', '30 дней', '90 дней', '365 дней']} />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Class ranking */}
        <Card>
          <h2 className="font-semibold text-foreground">Рейтинг классов</h2>
          <ul className="mt-4 space-y-3">
            {CLASS_RANKING.map((c, i) => (
              <li key={c.cls} className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                    MEDAL[i] ?? 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="w-12 shrink-0 text-sm font-medium text-foreground">{c.cls}</span>
                <ProgressBar value={c.v} className="flex-1" />
                <span className="w-10 shrink-0 text-right text-sm font-medium text-foreground">{c.v}%</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Subjects donut */}
        <Card>
          <h2 className="font-semibold text-foreground">Прогресс по разделам</h2>
          <div className="mt-4 flex items-center gap-5">
            <DonutChart
              segments={SUBJECTS.map((s) => ({ label: s.label, value: s.value, color: SUBJECT_COLORS[s.label] }))}
              size={150}
            />
            <ul className="flex-1 space-y-2">
              {SUBJECTS.map((s) => (
                <li key={s.label} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: SUBJECT_COLORS[s.label] }} />
                  <span className="flex-1 text-muted">{s.label}</span>
                  <span className="font-medium text-foreground">{s.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Top students */}
        <Card>
          <h2 className="font-semibold text-foreground">Топ-5 лучших учеников</h2>
          <ul className="mt-4 space-y-3">
            {TOP_STUDENTS.map((s, i) => (
              <li key={s.name} className="flex items-center gap-3">
                <span className="w-4 text-sm font-semibold text-muted">{i + 1}</span>
                <Avatar name={s.name} />
                <span className="flex-1 text-sm font-medium text-foreground">{s.name}</span>
                <span className="text-sm font-semibold text-brand">{s.xp} XP</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Lagging students */}
        <Card>
          <h2 className="font-semibold text-foreground">Топ-5 отстающих учеников</h2>
          <ul className="mt-4 space-y-3">
            {LAGGING_STUDENTS.map((s, i) => (
              <li key={s.name} className="flex items-center gap-3">
                <span className="w-4 text-sm font-semibold text-muted">{i + 1}</span>
                <Avatar name={s.name} />
                <span className="flex-1 text-sm font-medium text-foreground">{s.name}</span>
                <span className="text-sm font-semibold text-amber-600">{s.xp} XP</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* School activity */}
        <Card>
          <h2 className="font-semibold text-foreground">Активность школы</h2>
          <p className="mt-1 text-xs text-muted">Суммарный XP по дням</p>
          <BarChart labels={SCHOOL_XP.labels} values={SCHOOL_XP.values} max={500} />
        </Card>

        {/* Weak topics */}
        <Card>
          <h2 className="font-semibold text-foreground">Слабые темы (по школе)</h2>
          <ul className="mt-4 space-y-3">
            {WEAK_TOPICS.map((t) => (
              <li key={t.topic} className="flex items-center gap-3">
                <span className="flex-1 text-sm text-foreground">{t.topic}</span>
                <ProgressBar value={t.v} className="w-24" />
                <span className="w-10 text-right text-sm font-medium text-red-500">{t.v}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
