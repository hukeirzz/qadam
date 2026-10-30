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
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[320px_minmax(0,1fr)] md:items-start">
      <div className="overflow-hidden rounded-3xl bg-white text-center shadow-sm shadow-violet-200/40 ring-1 ring-violet-100/80">
        <div className="h-24 bg-[linear-gradient(135deg,#7c3aed_0%,#6d28d9_45%,#4f46e5_100%)]" />
        <div className="-mt-12 px-6 pb-7">
          <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-500 text-3xl font-bold text-white shadow-lg shadow-violet-400/30 ring-4 ring-white">{initials}</span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-800">{student!.name}</h1>
          {student!.classLabel && <span className="mt-2 inline-block rounded-lg bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">{student!.classLabel} класс</span>}
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-3xl bg-white p-6 shadow-sm shadow-violet-200/40 ring-1 ring-violet-100/80">
              <p className="text-4xl font-bold tracking-tight text-slate-800">{s.value}</p>
              <p className="mt-1.5 text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        <dl className="divide-y divide-slate-100 rounded-3xl bg-white px-6 shadow-sm shadow-violet-200/40 ring-1 ring-violet-100/80">
          {info.map((i) => (
            <div key={i.label} className="flex items-center justify-between gap-4 py-4">
              <dt className="text-sm text-slate-400">{i.label}</dt>
              <dd className="truncate text-sm font-semibold text-slate-800">{i.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
