// Small presentational building blocks shared across dashboard pages.
import { ChevronDownIcon, SearchIcon } from './icons';

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
    <div className={`h-2 overflow-hidden rounded-none bg-slate-200 ${className}`}>
      <div className="h-full rounded-none bg-brand" style={{ width: `${value}%` }} />
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
  return <div className={`rounded-2xl bg-surface p-4 ring-1 ring-border sm:p-6 ${className}`}>{children}</div>;
}

/** Маленький «?» — подсказка по наведению или фокусу. */
/** `align="end"` right-aligns the tooltip to the "?" — use it for hints near the right edge of the screen. */
export function InfoHint({ text, align = 'center' }: { text: string; align?: 'center' | 'end' }) {
  return (
    <span className="group relative inline-flex align-middle">
      <span
        tabIndex={0}
        role="img"
        aria-label={text}
        className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-400 outline-none transition hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-brand"
      >
        ?
      </span>
      <span
        role="tooltip"
        className={`pointer-events-none absolute top-full z-10 mt-1.5 w-max max-w-[200px] ${align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2'} rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-normal leading-snug text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100`}
      >
        {text}
      </span>
    </span>
  );
}
