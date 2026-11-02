// Small presentational building blocks shared across dashboard pages.

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-surface p-4 ring-1 ring-border sm:p-6 ${className}`}>{children}</div>;
}
