import Image from 'next/image';
import { BellIcon } from './icons';

/**
 * Shared page header for the dashboard: title/subtitle on the left,
 * optional page-specific `actions` on the right, followed by the always-on
 * notification bell and user avatar.
 */
export function DashboardHeader({
  title,
  subtitle,
  actions,
  notifications = 0,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  notifications?: number;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actions}

        <button
          type="button"
          aria-label="Уведомления"
          className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-muted ring-1 ring-border transition hover:text-foreground"
        >
          <BellIcon className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
              {notifications}
            </span>
          )}
        </button>

        <Image
          src="/icon.jpeg"
          alt="Профиль"
          width={44}
          height={44}
          className="h-11 w-11 rounded-xl ring-1 ring-border"
        />
      </div>
    </header>
  );
}
