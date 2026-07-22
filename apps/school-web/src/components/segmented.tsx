'use client';

import { useState } from 'react';

/** Interactive pill segmented control (highlight only — no data wiring yet). */
export function Segmented({ options, initial = 0 }: { options: string[]; initial?: number }) {
  const [active, setActive] = useState(initial);
  return (
    <div className="inline-flex rounded-xl bg-background p-1 ring-1 ring-border">
      {options.map((o, i) => (
        <button
          key={o}
          onClick={() => setActive(i)}
          className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
            i === active ? 'bg-surface text-foreground shadow-sm ring-1 ring-border' : 'text-muted hover:text-foreground'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** Tab bar with an underline indicator (highlight only). */
export function Tabs({ tabs, initial = 0 }: { tabs: string[]; initial?: number }) {
  const [active, setActive] = useState(initial);
  return (
    <div className="flex gap-6 border-b border-border">
      {tabs.map((t, i) => (
        <button
          key={t}
          onClick={() => setActive(i)}
          className={`-mb-px border-b-2 pb-3 text-sm font-medium transition ${
            i === active ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
