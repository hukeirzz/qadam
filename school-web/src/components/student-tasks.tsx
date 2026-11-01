import Link from 'next/link';
import { ArrowRightIcon } from './icons';
import { SubjectIcon } from './subject-icon';
import { formatDate, pct, subjectLabel } from '@/lib/student-ui';
import { plural } from './student-widgets';

export type Task = {
  id: string;
  title: string;
  subjectId: string | null;
  topicTitle: string | null;
  questionCount: number;
  createdAt: string;
  /** First attempt (the one analytics use); null = not solved yet. */
  done: { score: number; total: number; at: string } | null;
  /** Best attempt (first or a retake). Only colours the history; analytics use `done`. */
  best: { score: number; total: number } | null;
  /** How many times the student re-took it (never counted anywhere). */
  retakes: number;
};

/** Completed tests are tinted by outcome: all correct → green, otherwise → orange. */
export function outcome(done: { score: number; total: number }): 'perfect' | 'mistakes' {
  return done.total > 0 && done.score === done.total ? 'perfect' : 'mistakes';
}

const OUTCOME_UI = {
  perfect: { row: 'bg-emerald-50/50', chip: 'bg-emerald-100 text-emerald-800', badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', label: 'Без ошибок' },
  mistakes: { row: 'bg-orange-50/50', chip: 'bg-orange-100 text-orange-800', badge: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500', label: 'Есть ошибки' },
};
export const outcomeUI = (done: { score: number; total: number }) => OUTCOME_UI[outcome(done)];

export function StatusBadge({ done }: { done: { score: number; total: number } | null }) {
  const ui = done ? outcomeUI(done) : null;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${ui ? ui.badge : 'bg-violet-50 text-violet-700'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ui ? ui.dot : 'bg-violet-500'}`} aria-hidden /> {ui ? ui.label : 'К выполнению'}
    </span>
  );
}

/** One assigned test: title, topic, size, status. The row itself is static — only the button opens the test. */
export function TaskRow({ task }: { task: Task }) {
  const shown = task.best ?? task.done; // best attempt decides colour and the score chip
  const ui = shown ? outcomeUI(shown) : null;
  const p = shown ? pct(shown.score, shown.total) : null;
  const improved = !!task.done && !!shown && shown.score > task.done.score;
  const btn = 'flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-brand/40';
  return (
    <li className={`rounded-lg ${ui ? ui.row : ''}`}>
      <div className="flex items-center gap-4 px-3 py-3.5 sm:px-4">
        <SubjectIcon id={task.subjectId} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{task.topicTitle ?? task.title}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {subjectLabel(task.subjectId)} · {task.questionCount} {plural(task.questionCount, 'вопрос', 'вопроса', 'вопросов')}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusBadge done={shown} />
            <span className="text-xs text-slate-400">
              {task.done ? `Решён ${formatDate(task.done.at)}` : `Создан ${formatDate(task.createdAt)}`}
              {task.retakes > 0 ? ` · пересдач: ${task.retakes}` : ''}
              {improved ? ` · первая сдача: ${task.done!.score}/${task.done!.total}` : ''}
            </span>
          </div>
        </div>
        {shown && ui && (
          <div className="text-right">
            <span className={`inline-block rounded-md px-2.5 py-1 text-sm font-semibold ${ui.chip}`}>{shown.score}/{shown.total}</span>
            <p className="mt-1 text-xs text-slate-400">{p}%</p>
          </div>
        )}
        {task.done ? (
          <Link href={`/student/tests/${task.id}`} className={`${btn} text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50`}>Результат</Link>
        ) : (
          <Link href={`/student/tests/${task.id}`} className={`${btn} bg-brand text-white hover:bg-brand-hover`}>
            Начать <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}
      </div>
    </li>
  );
}

export function TaskList({ tasks, empty }: { tasks: Task[]; empty: React.ReactNode }) {
  if (tasks.length === 0) return <>{empty}</>;
  return <ul className="space-y-1 rounded-xl bg-white p-1.5 ring-1 ring-slate-200/70">{tasks.map((t) => <TaskRow key={t.id} task={t} />)}</ul>;
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="rounded-xl bg-white px-6 py-12 text-center ring-1 ring-slate-200/70">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {text && <p className="mt-1 text-sm text-slate-400">{text}</p>}
    </div>
  );
}
