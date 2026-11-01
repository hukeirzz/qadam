import { getStudent, getServerApi } from '@/lib/auth';
import { pct } from '@/lib/student-ui';
import { CARD } from '@/components/student-widgets';
import { ProfileEditor } from '@/components/profile-editor';

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
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[320px_minmax(0,1fr)] md:items-start md:gap-x-6">
      <div className={`${CARD} flex items-center gap-4 px-5 py-4 md:flex-col md:gap-0 md:px-6 md:py-8 md:text-center`}>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-lg font-bold text-white shadow-md shadow-violet-500/30 md:h-20 md:w-20 md:text-2xl">{initials}</span>
        <div className="min-w-0">
        <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 md:mt-4 md:text-xl">{student!.name}</h1>
        {student!.classLabel && (
          <span className="mt-1 inline-block rounded-md bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 md:mt-2">{student!.classLabel} класс</span>
        )}
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className={`${CARD} p-4 sm:p-5`}>
              <p className="text-xl font-bold text-slate-900 sm:text-2xl">{s.value}</p>
              <p className="mt-0.5 text-xs text-slate-400 sm:mt-1 sm:text-sm">{s.label}</p>
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

        <ProfileEditor userId={student!.id} name={student!.name} classLabel={student!.classLabel} />
      </div>
    </div>
  );
}
