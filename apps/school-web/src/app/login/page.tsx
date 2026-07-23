'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createBrowserApi } from '@/lib/supabase/client';
import {
  AnalyticsIcon,
  TargetIcon,
  TrophyIcon,
  GraduationIcon,
  BookIcon,
  StarIcon,
  ShieldIcon,
  LockIcon,
} from '@/components/icons';

const FEATURES = [
  { Icon: AnalyticsIcon, title: 'Аналитика по школе', text: 'Прогресс учеников и классов в реальном времени' },
  { Icon: TargetIcon, title: 'Выявляйте пробелы', text: 'Слабые темы по каждому разделу ОРТ' },
  { Icon: TrophyIcon, title: 'Тесты и соревнования', text: 'Назначайте задания и мотивируйте учеников' },
];

const STATS = [
  { Icon: GraduationIcon, value: '245', label: 'Учеников под контролем' },
  { Icon: BookIcon, value: '12', label: 'Классов в школе' },
  { Icon: StarIcon, value: '62%', label: 'Средний прогресс' },
  { Icon: ShieldIcon, value: 'Надёжно', label: 'Данные под защитой' },
];

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await createBrowserApi().auth.signIn(login, password);

    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* ── Left / brand ── */}
        <section className="relative flex flex-col overflow-hidden bg-[linear-gradient(160deg,#f4f2fd_0%,#eef1fb_100%)] px-8 py-8 lg:w-[56%] lg:px-14 lg:py-10">
          <div className="relative z-10 flex items-center gap-2.5">
            <Image src="/logo_qadam.png" alt="Qadam" width={40} height={40} className="h-9 w-9 object-contain" priority />
            <span className="text-2xl font-bold tracking-tight text-slate-800">Qadam</span>
          </div>

          <div className="relative z-10 flex flex-1 flex-col justify-center py-8">
            <h1 className="max-w-lg text-3xl font-bold leading-tight text-slate-800 lg:text-4xl">
              Управляйте подготовкой школы к ОРТ из <span className="text-brand">единого кабинета</span>
            </h1>
            <p className="mt-5 max-w-md text-slate-500">
              Qadam — платформа для школ и координаторов ОРТ. Следите за успеваемостью учеников
              и классов, находите пробелы и готовьте к экзамену эффективнее.
            </p>

            <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row">
              <div className="w-full space-y-3 sm:w-64">
                {FEATURES.map((f) => (
                  <div
                    key={f.title}
                    className="flex items-start gap-3 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-brand">
                      <f.Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{f.title}</p>
                      <p className="text-xs text-slate-500">{f.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative flex-1">
                <Image
                  src="/mascot-desk.png"
                  alt="Барсик за учёбой"
                  width={620}
                  height={413}
                  className="h-auto w-full"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-black/5 backdrop-blur sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-brand">
                  <s.Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-slate-800">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

        </section>

        {/* ── Right / form ── */}
        <section className="flex flex-col bg-white px-8 py-8 lg:w-[44%] lg:px-14 lg:py-10">
          <div className="flex flex-1 flex-col justify-center">
            <div className="mx-auto w-full max-w-md">
              <div className="flex justify-center">
                <Image src="/logo_qadam.png" alt="Qadam" width={52} height={52} className="h-12 w-12 object-contain" priority />
              </div>
              <h2 className="mt-4 text-center text-3xl font-bold text-slate-800">Вход в аккаунт</h2>
              <p className="mt-2 text-center text-slate-500">Добро пожаловать обратно! Рады вас видеть 👋</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="login" className="text-sm font-medium text-slate-600">
                    Логин
                  </label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="login"
                      type="text"
                      required
                      autoComplete="username"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      placeholder="Введите логин"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pl-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-slate-600">
                    Пароль
                  </label>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Введите пароль"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pl-11 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#6d28d9]"
                  />
                  Запомнить меня
                </label>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-brand px-3 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-50"
                >
                  {loading ? 'Входим…' : 'Войти в аккаунт'}
                </button>

                <p className="text-center text-sm text-slate-500">
                  Забыли логин или пароль? Обратитесь к вашему представителю Qadam —
                  мы выдадим данные заново.
                </p>
              </form>
            </div>
          </div>

          <p className="text-right text-xs text-slate-400">
            © 2026 Qadam Platform. Все права защищены.
          </p>
        </section>
      </div>
    </main>
  );
}

function UserIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68M6.6 6.6C3.6 8.3 2 12 2 12s3.5 7 10 7a9.3 9.3 0 0 0 5.4-1.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="m2 2 20 20" />
    </svg>
  );
}
