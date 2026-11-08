'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserApi } from '@/lib/supabase/client';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from '@/components/icons';

function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes('rate limit') || m.includes('too many') || m.includes('seconds')) return 'Слишком много попыток. Подождите минуту и повторите.';
  if (m.includes('invalid') && m.includes('email')) return 'Проверьте адрес почты.';
  if (m.includes('token') || m.includes('expired') || m.includes('invalid')) return 'Неверный или просроченный код. Запросите новый.';
  if (m.includes('password') && m.includes('same')) return 'Новый пароль должен отличаться от старого.';
  if (m.includes('password') && m.includes('6')) return 'Пароль должен быть не короче 6 символов.';
  return message;
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pl-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20';
const btnCls =
  'w-full rounded-xl bg-brand px-3 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-50';

/** Восстановление пароля: почта → код из письма → новый пароль. Работает для учеников, учителей и администраторов. */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    const { error: err } = await createBrowserApi().auth.resetPassword(email);
    setLoading(false);
    if (err) { setError(friendly(err.message)); return; }
    if (step === 'code') setInfo('Новый код отправлен на почту.');
    setStep('code');
  }

  async function checkCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    const { error: err } = await createBrowserApi().auth.verifyRecoveryCode(email, otp);
    setLoading(false);
    if (err) { setError(friendly(err.message)); return; }
    setStep('password');
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError('Пароль должен быть не короче 6 символов.'); return; }
    if (password !== repeat) { setError('Пароли не совпадают.'); return; }
    setLoading(true);
    const { error: err } = await createBrowserApi().auth.updatePassword(password);
    setLoading(false);
    if (err) { setError(friendly(err.message)); return; }
    router.push('/');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#f4f2fd_0%,#eef1fb_100%)] px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 flex items-center justify-center gap-2.5">
          <Image src="/logo_qadam.png" alt="Qadam" width={40} height={40} className="h-9 w-9 object-contain" priority />
          <span className="text-2xl font-bold tracking-tight text-slate-800">Qadam</span>
        </div>

        <div className="rounded-3xl bg-white p-7 shadow-xl shadow-violet-200/40 ring-1 ring-violet-100 sm:p-9">
          {step === 'email' && (
            <>
              <h1 className="text-2xl font-bold text-slate-800">Забыли пароль?</h1>
              <p className="mt-1.5 text-sm text-slate-500">Укажите почту, на которую зарегистрирован аккаунт, — мы пришлём код для сброса пароля.</p>
              <form onSubmit={sendCode} className="mt-7 space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-600">Email</span>
                  <div className="relative">
                    <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="name@gmail.com" className={inputCls} />
                  </div>
                </label>
                {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={loading} className={btnCls}>{loading ? 'Отправляем…' : 'Отправить код'}</button>
              </form>
            </>
          )}

          {step === 'code' && (
            <>
              <h1 className="text-2xl font-bold text-slate-800">Введите код</h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Мы отправили письмо на <b className="text-slate-700">{email}</b>. Введите код из письма. Если письма нет, проверьте «Спам».
              </p>
              <form onSubmit={checkCode} className="mt-7 space-y-4">
                <input required inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} maxLength={8} placeholder="000000"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-center text-2xl font-semibold tracking-[0.4em] outline-none transition placeholder:text-slate-300 focus:border-brand focus:ring-2 focus:ring-brand/20" />
                {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
                {info && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{info}</p>}
                <button type="submit" disabled={loading || otp.length < 6} className={btnCls}>{loading ? 'Проверяем…' : 'Продолжить'}</button>
                <button type="button" onClick={() => sendCode()} disabled={loading} className="w-full text-center text-sm font-medium text-brand hover:text-brand-hover disabled:opacity-50">
                  Отправить код ещё раз
                </button>
              </form>
            </>
          )}

          {step === 'password' && (
            <>
              <h1 className="text-2xl font-bold text-slate-800">Новый пароль</h1>
              <p className="mt-1.5 text-sm text-slate-500">Придумайте новый пароль — после этого вы сразу войдёте в аккаунт.</p>
              <form onSubmit={savePassword} className="mt-7 space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-600">Новый пароль</span>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input required type={showPassword ? 'text' : 'password'} minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Не короче 6 символов" className={`${inputCls} pr-11`} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-600">Повторите пароль</span>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input required type={showPassword ? 'text' : 'password'} minLength={6} value={repeat} onChange={(e) => setRepeat(e.target.value)} autoComplete="new-password" placeholder="Ещё раз" className={inputCls} />
                  </div>
                </label>
                {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={loading} className={btnCls}>{loading ? 'Сохраняем…' : 'Сохранить и войти'}</button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/login" className="font-semibold text-brand hover:text-brand-hover">Вернуться ко входу</Link>
        </p>
      </div>
    </main>
  );
}
