import { getStudent, getServerApi } from '@/lib/auth';
import { pct } from '@/lib/student-ui';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-3xl bg-white p-6 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-xl font-bold text-white shadow-sm shadow-violet-500/25">{initials}</span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-slate-800">{student!.name}</h1>
          {student!.classLabel && <span className="mt-1.5 inline-block rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">{student!.classLabel}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-5 ring-1 ring-slate-100">
            <p className="text-3xl font-bold text-slate-800">{s.value}</p>
            <p className="mt-1 text-sm text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <dl className="divide-y divide-slate-100 rounded-3xl bg-white px-5 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
        {info.map((i) => (
          <div key={i.label} className="flex items-center justify-between gap-4 py-4">
            <dt className="text-sm text-slate-400">{i.label}</dt>
            <dd className="truncate text-sm font-medium text-slate-800">{i.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
