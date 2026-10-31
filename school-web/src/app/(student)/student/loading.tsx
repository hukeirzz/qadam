export default function Loading() {
  return (
    <div className="space-y-5" role="status" aria-live="polite" aria-label="Загрузка">
      <div className="h-7 w-48 animate-pulse rounded-md bg-slate-200/70" />
      <div className="h-4 w-72 max-w-full animate-pulse rounded-md bg-slate-200/60" />
      <div className="space-y-2 pt-2">
        {[0, 1, 2].map((i) => <div key={i} className="h-[76px] animate-pulse rounded-xl bg-white ring-1 ring-slate-200/70" />)}
      </div>
    </div>
  );
}
