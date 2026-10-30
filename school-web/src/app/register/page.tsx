'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserApi } from '@/lib/supabase/client';
import { CheckIcon, GraduationIcon, LockIcon, MailIcon } from '@/components/icons';

type ClassInfo = { class_name: string; school_name: string };

function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes('already registered') || m.includes('already been registered')) return 'Этот email уже зарегистрирован — войдите в аккаунт.';
  if (m.includes('password') && m.includes('6')) return 'Пароль должен быть не короче 6 символов.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Слишком много попыток. Подождите минуту и повторите.';
  if (m.includes('invalid') && m.includes('email')) return 'Проверьте адрес почты.';
  if (m.includes('token') || m.includes('expired')) return 'Неверный или просроченный код. Запросите новый.';
  return message;
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pl-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [otp, setOtp] = useState('');
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [codeState, setCodeState] = useState<'idle' | 'checking' | 'ok' | 'bad'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Live-check the class code so the student sees which class they're joining.
  useEffect(() => {
    const c = code.trim();
    if (c.length < 4) { setCodeState('idle'); setClassInfo(null); return; }
    setCodeState('checking');
    const t = setTimeout(async () => {
      const res = await createBrowserApi().studentData.checkClassCode(c);
      setClassInfo(res);
      setCodeState(res ? 'ok' : 'bad');
    }, 350);
    return () => clearTimeout(t);
  }, [code]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (codeState !== 'ok') { setError('Введите правильный код класса — его выдаёт учитель.'); return; }
    setLoading(true);
    const { data, error: err } = await createBrowserApi().auth.signUp(email.trim(), password, name.trim(), code.trim());
    setLoading(false);
    if (err) { setError(friendly(err.message)); return; }
    // Supabase answers "success" with an obfuscated user (no identities) for an already-registered email.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('Этот email уже зарегистрирован — войдите в аккаунт.'); return;
    }
    if (data.session) { router.push('/student'); router.refresh(); return; }
    setStep('code');
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setInfo(null); setLoading(true);
    const { error: err } = await createBrowserApi().auth.verifySignupCode(email.trim(), otp);
    setLoading(false);
    if (err) { setError(friendly(err.message)); return; }
    router.push('/student');
    router.refresh();
  }

  async function resend() {
    setError(null); setInfo(null);
    const { error: err } = await createBrowserApi().auth.resendConfirmationCode(email.trim());
    if (err) setError(friendly(err.message)); else setInfo('Новый код отправлен на почту.');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#f4f2fd_0%,#eef1fb_100%)] px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 flex items-center justify-center gap-2.5">
          <Image src="/logo_qadam.png" alt="Qadam" width={40} height={40} className="h-9 w-9 object-contain" priority />
          <span className="text-2xl font-bold tracking-tight text-slate-800">Qadam</span>
        </div>

        <div className="rounded-3xl bg-white p-7 shadow-xl shadow-violet-200/40 ring-1 ring-violet-100 sm:p-9">
          {step === 'form' ? (
            <>
              <h1 className="text-2xl font-bold text-slate-800">Регистрация ученика</h1>
              <p className="mt-1.5 text-sm text-slate-500">Введите код класса от учителя — вы сразу попадёте в свой класс.</p>

              <form onSubmit={handleRegister} className="mt-7 space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-600">Имя и фамилия</span>
                  <div className="relative">
                    <GraduationIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Аскар Асанов" className={inputCls} />
                  </div>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-600">Gmail</span>
                  <div className="relative">
                    <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="name@gmail.com" className={inputCls} />
                  </div>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-600">Пароль</span>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Не короче 6 символов" className={inputCls} />
                  </div>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-600">Код класса</span>
                  <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={12} placeholder="например, 5KWS9A"
                    className={`w-full rounded-xl border bg-white px-4 py-3.5 text-center text-lg font-semibold uppercase tracking-[0.3em] outline-none transition placeholder:text-sm placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:ring-2 ${
                      codeState === 'ok' ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100'
                      : codeState === 'bad' ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-brand focus:ring-brand/20'}`} />
                  <p className="min-h-5 text-sm">
                    {codeState === 'checking' && <span className="text-slate-400">Проверяем код…</span>}
                    {codeState === 'ok' && classInfo && (
                      <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                        <CheckIcon className="h-4 w-4" /> Класс {classInfo.class_name} · {classInfo.school_name}
                      </span>
                    )}
                    {codeState === 'bad' && <span className="text-red-500">Такого кода нет. Уточните его у учителя.</span>}
                  </p>
                </label>

                {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full rounded-xl bg-brand px-3 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-50">
                  {loading ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-800">Подтвердите почту</h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Мы отправили письмо на <b className="text-slate-700">{email}</b>. Введите код из письма
                (или перейдите по ссылке в нём).
              </p>
              <form onSubmit={handleVerify} className="mt-7 space-y-4">
                <input required inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} maxLength={8} placeholder="000000"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-center text-2xl font-semibold tracking-[0.4em] outline-none transition placeholder:text-slate-300 focus:border-brand focus:ring-2 focus:ring-brand/20" />
                {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
                {info && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{info}</p>}
                <button type="submit" disabled={loading || otp.length < 6}
                  className="w-full rounded-xl bg-brand px-3 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-50">
                  {loading ? 'Проверяем…' : 'Подтвердить и войти'}
                </button>
                <button type="button" onClick={resend} className="w-full text-center text-sm font-medium text-brand hover:text-brand-hover">
                  Отправить код ещё раз
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Уже есть аккаунт? <Link href="/login" className="font-semibold text-brand hover:text-brand-hover">Войти</Link>
        </p>
      </div>
    </main>
  );
}
