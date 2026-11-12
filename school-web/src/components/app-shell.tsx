'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Sidebar } from './sidebar';
import { MenuIcon } from './icons';

export function AppShell({
  schoolName,
  children,
}: {
  schoolName: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar schoolName={schoolName} open={open} onNavigate={close} />

      {/* Backdrop (mobile only, when drawer is open) */}
      {open && (
        <div
          onClick={close}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar with hamburger */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Открыть меню"
            className="-ml-1 rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <Image src="/logo_qadam.png" alt="Qadam" width={28} height={28} className="h-7 w-7 object-contain" />
          <span className="font-bold tracking-tight text-slate-800">Qadam</span>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8 lg:py-6">{children}</main>
      </div>
    </div>
  );
}
