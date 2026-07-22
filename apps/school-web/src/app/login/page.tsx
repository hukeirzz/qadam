'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createBrowserApi } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const api = createBrowserApi();
    const { error: signInError } = await api.auth.signIn(email, password);

    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-background p-3 sm:p-4">
      <div className="grid min-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-3xl bg-surface shadow-xl shadow-black/10 ring-1 ring-border sm:min-h-[calc(100dvh-2rem)] md:grid-cols-[minmax(300px,34%)_1fr]">
        {/* Brand panel */}
        <aside className="relative hidden flex-col overflow-hidden bg-[radial-gradient(120%_65%_at_50%_88%,#6d28d9_0%,#3b1d80_38%,#1e1b4b_70%,#181633_100%)] p-8 text-white md:flex lg:p-10">
          <div className="relative z-10 flex items-center gap-3">
            <Image
              src="/icon.jpeg"
              alt="Qadam"
              width={44}
              height={44}
              className="rounded-xl ring-1 ring-white/20"
              priority
            />
            <div className="leading-tight">
              <p className="text-xl font-bold tracking-tight">Qadam</p>
              <p className="text-sm text-white/60">Кабинет школы</p>
            </div>
          </div>

          {/* Mascot — Барсик */}
          <div className="relative z-10 mt-auto flex justify-center pt-8">
            <Image
              src="/icon.jpeg"
              alt="Барсик — маскот Qadam"
              width={220}
              height={220}
              className="w-full max-w-[220px] rounded-3xl shadow-2xl shadow-black/40 ring-1 ring-white/10"
              priority
            />
          </div>
        </aside>

        {/* Form panel */}
        <section className="flex flex-col px-6 py-10 sm:px-12 sm:py-14 lg:px-20 lg:py-16">
          <div className="w-full max-w-xl">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Вход в аккаунт</h1>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-muted">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="director@school.kg"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-base outline-none transition placeholder:text-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-muted">
                  Пароль
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 pr-12 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <Link
                href="/reset-password"
                className="inline-block text-sm font-medium text-muted hover:text-brand"
              >
                Забыли пароль?
              </Link>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand px-3 py-4 text-base font-semibold text-white transition hover:bg-brand-hover disabled:opacity-50"
              >
                {loading ? 'Входим…' : 'Войти'}
              </button>
            </form>
          </div>

          <p className="mt-auto pt-10 text-sm text-muted">© {new Date().getFullYear()} Qadam</p>
        </section>
      </div>
    </main>
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
