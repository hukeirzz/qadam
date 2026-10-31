import type { ReactNode } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { MockExamsCard, LevelHeatmapCard } from '@/components/analytics-cards';
import { ArrowRightIcon, ShieldIcon } from '@/components/icons';
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
  const latest = mockHistory.at(-1)?.total ?? null;
  const progress = mockHistory.length >= 2 ? mockHistory.at(-1)!.total - mockHistory[0].total : null;

  const stat = (label: string, value: ReactNode, sub?: string, center = false) => (
    <div className={`min-w-[58px] ${center ? 'text-center' : ''}`}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1.5 text-3xl font-bold leading-none text-slate-800">{value}</p>
      <p className="mt-1.5 h-3.5 text-[11px] leading-none text-slate-400">{sub ?? ''}</p>
    </div>
  );

  const tile = (label: string, value: ReactNode, sub?: string) => (
    <div className="rounded-2xl bg-slate-50 px-4 py-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-bold leading-none text-slate-800">{value}</p>
      <p className="mt-1.5 h-3.5 text-[11px] leading-none text-slate-400">{sub ?? ''}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <Link href="/students" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand">
        <ArrowRightIcon className="h-4 w-4 rotate-180" /> Назад к ученикам
      </Link>

      {/* Header */}
      <Card>
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-xl font-bold text-white shadow-sm shadow-violet-500/25">{initials(student.name)}</span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">{student.name}</h1>
            <span className="mt-1.5 inline-block rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">{className}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-2">
          {tile('Ср. балл ОРТ', mockAvg != null ? String(mockAvg) : '—', 'из 245')}
          {tile('Пробных', (
            <span className="inline-flex items-center gap-1.5">
              <ShieldIcon className="h-5 w-5 text-violet-300" />
              {mockHistory.length}
            </span>
          ))}
        </div>
      </Card>

      <MockExamsCard mockHistory={mockHistory} />

      {/* Per-level topic heatmaps (from school-test results) */}
      {levelMaps.map((lv) => <LevelHeatmapCard key={lv.id} label={lv.label} groups={lv.groups} />)}
    </div>
  );
}
