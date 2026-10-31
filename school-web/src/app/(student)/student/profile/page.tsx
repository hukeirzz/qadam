import { getStudent, getServerApi } from '@/lib/auth';
import { pct } from '@/lib/student-ui';
import { CARD } from '@/components/student-widgets';

export default async function StudentProfilePage() {
  const { student } = await getStudent();
  const api = await getServerApi();
  const results = await api.studentData.results(student!.id);
  const score = results.reduce((a, r) => a + r.score, 0);
  const total = results.reduce((a, r) => a + r.total, 0);
  const initials = student!.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

  const stats = [
    { label: 'Тестов пройдено', value: String(results.length) },
    { label: 'Верных ответов', value: total ? `${pct(score, total)}%` : '—' },
  ];
  const info = [
    { label: 'Email', value: student!.email },
    { label: 'Класс', value: student!.classLabel ?? '—' },
    { label: 'Школа', value: student!.schoolName ?? '—' },
  ];

  // Same outer edges as the home page: identity card on the left, stats + details on the right.
  return (
    <div className="grid gap-5 md:grid-cols-[320px_minmax(0,1fr)] md:items-start md:gap-x-6">
      <div className={`${CARD} flex flex-col items-center px-6 py-8 text-center`}>
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-2xl font-bold text-white shadow-md shadow-violet-500/30">{initials}</span>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900">{student!.name}</h1>
        {student!.classLabel && (
          <span className="mt-2 inline-block rounded-md bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">{student!.classLabel} класс</span>
        )}
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className={`${CARD} p-5`}>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="mt-1 text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        <dl className={`${CARD} divide-y divide-slate-100 px-5`}>
          {info.map((i) => (
            <div key={i.label} className="flex items-center justify-between gap-4 py-3.5">
              <dt className="text-sm text-slate-400">{i.label}</dt>
              <dd className="truncate text-sm font-medium text-slate-800">{i.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
