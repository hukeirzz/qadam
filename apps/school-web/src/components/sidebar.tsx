'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserApi } from '@/lib/supabase/client';
import { HomeIcon, AnalyticsIcon, StudentsIcon, TestsIcon, TableIcon, LogoutIcon, CloseIcon } from './icons';

const NAV = [
  { href: '/', label: 'Главная', Icon: HomeIcon },
  { href: '/analytics', label: 'Аналитика', Icon: AnalyticsIcon },
  { href: '/results', label: 'Добавить результаты', Icon: TableIcon },
  { href: '/students', label: 'Ученики', Icon: StudentsIcon },
  { href: '/tests', label: 'Тесты школы', Icon: TestsIcon },
];

export function Sidebar({
  schoolName,
  open = false,
  onNavigate,
}: {
  schoolName: string;
  open?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const initial = schoolName.trim().charAt(0).toUpperCase() || 'Ш';

  async function handleLogout() {
    onNavigate?.();
    await createBrowserApi().auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo + mobile close */}
      <div className="flex items-center gap-2.5 px-6 pb-4 pt-6">
        <Image src="/logo_qadam.png" alt="Qadam" width={36} height={36} className="h-9 w-9 object-contain" />
        <div className="leading-tight">
          <p className="font-bold tracking-tight text-slate-800">Qadam</p>
          <p className="text-[11px] text-slate-400">Платформа для подготовки к ОРТ</p>
        </div>
        <button
          onClick={onNavigate}
          aria-label="Закрыть меню"
          className="ml-auto -mr-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      {/* School — directly under the logo, plain (not a button) */}
      <div className="mx-3 mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
          {initial}
        </span>
        <p className="min-w-0 text-sm font-semibold leading-snug text-slate-800">{schoolName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? 'bg-violet-50 text-brand' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout — pinned to the bottom */}
      <div className="mt-auto border-t border-slate-200 px-3 py-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
        >
          <LogoutIcon className="h-5 w-5" />
          Выйти
        </button>
      </div>
    </aside>
  );
}
