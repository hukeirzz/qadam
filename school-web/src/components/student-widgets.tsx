import { SubjectIcon } from './subject-icon';
import { pct, subjectLabel } from '@/lib/student-ui';

export const CARD = 'rounded-2xl bg-white ring-1 ring-slate-200/70';

export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

/** Circular progress (SVG): neutral track + violet arc, percentage and caption in the middle. */
export function Ring({ value, size = 116 }: { value: number; size?: number }) {
  const stroke = 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef0f4" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#6d28d9" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold leading-none text-slate-800">{value}%</span>
        <span className="mt-1 text-xs text-slate-400">средняя</span>
      </span>
    </div>
  );
}

export function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className={`${CARD} flex min-w-0 items-center gap-3 px-4 py-3.5`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-brand">{icon}</span>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none text-slate-800">{value}</p>
        <p className="mt-1 text-xs leading-tight text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export function AccuracyCard({ score, total, tests, className = '' }: { score: number; total: number; tests: number; className?: string }) {
  return (
    <div className={`${CARD} p-5 ${className}`}>
      <h2 className="text-base font-bold text-slate-800">Моя точность</h2>
      {total > 0 ? (
        <div className="mt-4 flex items-center gap-5">
          <Ring value={pct(score, total)} />
          <span className="h-16 w-px bg-slate-100" />
          <div className="text-sm text-slate-500">
            <p className="font-semibold text-slate-800">{score} верных из {total}</p>
            <p className="mt-0.5">в {tests} {plural(tests, 'тесте', 'тестах', 'тестах')}</p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-400">Пройди первый тест — здесь появится твоя точность.</p>
      )}
    </div>
  );
}

/** Per-subject progress bars. `bySubject`: subject id → summed score/total over its tests. */
export function TopicsCard({ bySubject, className = '' }: { bySubject: Map<string, { s: number; t: number }>; className?: string }) {
  if (bySubject.size === 0) return null;
  return (
    <section className={`${CARD} p-5 ${className}`}>
      <h2 className="text-base font-bold text-slate-800">Мои темы</h2>
      <ul className="mt-4 space-y-5">
        {[...bySubject.entries()].map(([id, v]) => {
          const p = pct(v.s, v.t);
          return (
            <li key={id} className="flex items-center gap-3">
              <SubjectIcon id={id} tone="violet" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-800">{subjectLabel(id)}</p>
                  <span className="text-xs font-medium text-slate-500">{p}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${p}%` }} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
