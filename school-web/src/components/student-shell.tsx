'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserApi } from '@/lib/supabase/client';
import { ChevronDownIcon, HomeIcon, LogoutIcon, ProfileIcon } from './icons';

const TABS = [
  { href: '/student', label: 'Главная', Icon: HomeIcon },
  { href: '/student/profile', label: 'Профиль', Icon: ProfileIcon },
];

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'У';
}

export function StudentShell({
  name, email, children,
}: { name: string; email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const isActive = (href: string) => (href === '/student' ? pathname === href : pathname.startsWith(href));

  async function logout() {
    await createBrowserApi().auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f6ff_0%,#fbfbfe_40%,#ffffff_100%)]">
      <header className="sticky top-0 z-30 border-b border-slate-100/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3.5">
          <Link href="/student" className="flex items-center gap-2.5">
            <Image src="/logo_qadam.png" alt="Qadam" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold tracking-tight text-slate-800">Qadam</span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {TABS.map(({ href, label, Icon }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  isActive(href) ? 'bg-violet-50 text-brand' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                <Icon className="h-[18px] w-[18px]" /> {label}
              </Link>
            ))}
          </nav>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setOpen((o) => !o)} aria-label="Меню профиля"
              className="flex items-center gap-1.5 rounded-full p-0.5 pr-2 transition hover:bg-slate-50">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
                {initials(name)}
              </span>
              <ChevronDownIcon className={`h-4 w-4 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-lg shadow-slate-200/60">
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
                  <p className="truncate text-xs text-slate-400">{email}</p>
                </div>
                <button onClick={logout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                  <LogoutIcon className="h-[18px] w-[18px]" /> Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-28 pt-7 sm:pb-12">{children}</main>

      {/* Bottom tab bar — mobile only */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2">
          {TABS.map(({ href, label, Icon }) => (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-1 py-3 text-xs font-medium ${isActive(href) ? 'text-brand' : 'text-slate-400'}`}>
              <Icon className="h-6 w-6" /> {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
