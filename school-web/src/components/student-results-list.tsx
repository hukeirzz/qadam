import Link from 'next/link';
import { ArrowRightIcon } from './icons';
import { formatDate, pct, pctTone, subjectGlyph, subjectLabel } from '@/lib/student-ui';

export type ResultItem = {
  testId: string; title: string; subjectId: string | null; topicTitle: string | null;
  score: number; total: number; createdAt: string;
};

/** Rounded card with a divided list of the student's results (design: «Последние результаты»). */
export function StudentResultsList({ items }: { items: ResultItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-400 shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
        Результатов пока нет — они появятся после первого теста.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-slate-100 rounded-3xl bg-white px-5 shadow-sm shadow-violet-200/40 ring-1 ring-violet-100/80">
      {items.map((r) => {
        const p = pct(r.score, r.total);
        const tone = pctTone(p);
        return (
          <li key={r.testId}>
            <Link href={`/student/tests/${r.testId}`} className="group -mx-3 flex items-center gap-4 rounded-2xl px-3 py-4 transition hover:bg-violet-50/60">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-bold ${tone.icon}`}>
                {subjectGlyph(r.subjectId)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-800">{subjectLabel(r.subjectId)}</p>
                <p className="truncate text-sm text-slate-400">{r.topicTitle ?? r.title} · Тест</p>
                <p className="mt-0.5 text-xs text-slate-400">{formatDate(r.createdAt)}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block rounded-xl px-3 py-1 text-sm font-bold ${tone.chip}`}>{r.score}/{r.total}</span>
                <p className="mt-1 text-xs text-slate-400">{p}%</p>
              </div>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
