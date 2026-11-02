import Link from 'next/link';
import { Card } from '@/components/ui';
import { MockExamsCard, LevelHeatmapCard } from '@/components/analytics-cards';
import { ArrowRightIcon } from '@/components/icons';
import type { LevelHeatmapGroup } from '@/lib/aggregate';

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}


export function StudentProfile({
  student, className, levelMaps, mockHistory,
}: {
  student: { name: string };
  className: string;
  levelMaps: { id: string; label: string; groups: LevelHeatmapGroup[] }[];
  mockHistory: { name: string; total: number }[];
}) {
  const mockAvg = mockHistory.length ? Math.round(mockHistory.reduce((a, b) => a + b.total, 0) / mockHistory.length) : null;

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <Link href="/students" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand">
        <ArrowRightIcon className="h-4 w-4 rotate-180" /> Назад к ученикам
      </Link>

      {/* Header */}
      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xl font-semibold text-violet-700">{initials(student.name)}</span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">{student.name}</h1>
              <span className="mt-1.5 inline-block rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">{className}</span>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-2 sm:gap-3 lg:w-[340px] lg:shrink-0">
            <div className="rounded-lg bg-slate-50 px-4 py-3">
              <dt className="text-xs text-slate-500">Ср. балл ОРТ</dt>
              <dd className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold text-slate-900">{mockAvg != null ? mockAvg : '—'}</span>
                <span className="text-xs text-slate-400">из 245</span>
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 px-4 py-3">
              <dt className="text-xs text-slate-500">Пробных</dt>
              <dd className="mt-1 text-2xl font-semibold text-slate-900">{mockHistory.length}</dd>
            </div>
          </dl>
        </div>
      </Card>

      <MockExamsCard mockHistory={mockHistory} />

      {/* Per-level topic heatmaps (from school-test results) */}
      {levelMaps.map((lv) => <LevelHeatmapCard key={lv.id} label={lv.label} groups={lv.groups} />)}
    </div>
  );
}
