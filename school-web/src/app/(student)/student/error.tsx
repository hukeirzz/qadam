'use client';

export default function StudentError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-xl bg-white px-6 py-12 text-center ring-1 ring-slate-200/70" role="alert">
      <p className="text-sm font-semibold text-slate-800">Не удалось загрузить данные</p>
      <p className="mt-1 text-sm text-slate-400">Проверьте соединение и попробуйте ещё раз.</p>
      <button onClick={reset} className="mt-5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">
        Повторить
      </button>
    </div>
  );
}
