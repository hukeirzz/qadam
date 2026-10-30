// Small presentational building blocks shared across dashboard pages.
import { ChevronDownIcon, SearchIcon } from './icons';

const RANK_TINT: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-amber-100 text-amber-700',
  D: 'bg-orange-100 text-orange-700',
  F: 'bg-red-100 text-red-700',
};

export function RankBadge({ rank }: { rank: string }) {
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
        RANK_TINT[rank] ?? 'bg-slate-100 text-slate-600'
      }`}
    >
      {rank}
    </span>
  );
}

export function Avatar({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span
      className={`flex items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700 ${
        className || 'h-8 w-8'
      }`}
    >
      {name.charAt(0)}
    </span>
  );
}

export function ProgressBar({ value, className = 'w-28' }: { value: number; className?: string }) {
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-slate-200 ${className}`}>
      <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
    </div>
  );
}

/** Presentational-only dropdown (no menu behavior yet). */
export function FakeSelect({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm font-medium text-foreground transition hover:bg-background"
    >
      {icon}
      {label}
      <ChevronDownIcon className="h-4 w-4 text-muted" />
    </button>
  );
}

export function SearchBox({ placeholder }: { placeholder: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted">
      <SearchIcon className="h-4 w-4" />
      <span>{placeholder}</span>
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-surface p-6 ring-1 ring-border ${className}`}>{children}</div>;
}
