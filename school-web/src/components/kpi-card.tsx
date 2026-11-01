import type { ComponentType } from 'react';
import { TrendingUpIcon } from './icons';

const TONES = {
  violet: 'bg-violet-50 text-violet-600',
  teal: 'bg-teal-50 text-teal-600',
  orange: 'bg-orange-50 text-orange-500',
  emerald: 'bg-emerald-50 text-emerald-600',
  red: 'bg-red-50 text-red-500',
} as const;
export type KpiTone = keyof typeof TONES;

/**
 * Summary tile: small tinted icon + label on top, a big number, and one line of context below.
 * `alert` paints the context line red (something needs attention).
 */
export function KpiCard({
  Icon, label, value, sub, tone, alert = false,
}: { Icon: ComponentType<{ className?: string }>; label: string; value: string; sub?: string; tone: KpiTone; alert?: boolean }) {
  return (
    <div className="min-w-0 rounded-xl bg-white p-4 ring-1 ring-slate-200/70 sm:p-5">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TONES[tone]}`}><Icon className="h-4 w-4" /></span>
        <p className="min-w-0 text-[13px] font-medium leading-tight text-slate-600 sm:truncate sm:text-sm">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold leading-none tracking-tight text-slate-900 sm:text-3xl">{value}</p>
      {sub && (
        <p className={`mt-2.5 flex items-start gap-1 text-xs leading-snug ${alert ? 'text-red-500' : 'text-slate-400'}`}>
          <TrendingUpIcon className="mt-px h-3.5 w-3.5 shrink-0" /> <span className="min-w-0">{sub}</span>
        </p>
      )}
    </div>
  );
}
