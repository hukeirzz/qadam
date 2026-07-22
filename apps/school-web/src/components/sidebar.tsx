'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserApi } from '@/lib/supabase/client';
import {
  HomeIcon,
  AnalyticsIcon,
  StudentsIcon,
  TestsIcon,
  LogoutIcon,
  ArrowRightIcon,
} from './icons';

const NAV = [
  { href: '/', label: 'Главная', Icon: HomeIcon },
  { href: '/analytics', label: 'Аналитика', Icon: AnalyticsIcon },
  { href: '/students', label: 'Ученики', Icon: StudentsIcon },
  { href: '/tests', label: 'Свои тесты', Icon: TestsIcon },
];

export function Sidebar({
  schoolName,
  roleLabel,
}: {
  schoolName: string;
  roleLabel: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await createBrowserApi().auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-[#0f1122] text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <Image src="/icon.jpeg" alt="Qadam" width={40} height={40} className="rounded-xl" />
        <div className="leading-tight">
          <p className="font-bold tracking-tight">Qadam</p>
          <p className="text-xs text-white/50">Кабинет школы</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'bg-brand text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* School card */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
          <Image src="/icon.jpeg" alt="" width={40} height={40} className="rounded-xl" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold">{schoolName}</p>
            <p className="text-xs text-white/50">{roleLabel}</p>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-white/40" />
        </div>
      </div>

      {/* Logout */}
      <div className="border-t border-white/10 px-3 py-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          <LogoutIcon className="h-5 w-5" />
          Выйти
        </button>
      </div>
    </aside>
  );
}
