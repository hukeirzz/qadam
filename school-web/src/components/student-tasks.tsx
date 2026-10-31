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
  /** null = ещё не решён */
  done: { score: number; total: number; at: string } | null;
};

export function StatusBadge({ done }: { done: boolean }) {
  return done ? (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden /> Завершён
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
      <span className="h-1.5 w-1.5 rounded-full bg-violet-500" aria-hidden /> К выполнению
    </span>
  );
}

/** One assigned test: title, topic, size, status and the primary action. Whole row is a single link. */
export function TaskRow({ task }: { task: Task }) {
  const p = task.done ? pct(task.done.score, task.done.total) : null;
  return (
    <li>
      <Link href={`/student/tests/${task.id}`}
        className="group flex items-center gap-4 rounded-lg px-3 py-3.5 outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand/40 sm:px-4">
        <SubjectIcon id={task.subjectId} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{task.topicTitle ?? task.title}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {subjectLabel(task.subjectId)} · {task.questionCount} {plural(task.questionCount, 'вопрос', 'вопроса', 'вопросов')}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusBadge done={!!task.done} />
            <span className="text-xs text-slate-400">Создан {formatDate(task.createdAt)}</span>
          </div>
        </div>
        {task.done ? (
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{task.done.score}/{task.done.total}</p>
            <p className="text-xs text-slate-400">{p}%</p>
          </div>
        ) : (
          <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-white transition group-hover:bg-brand-hover">
            Начать <ArrowRightIcon className="h-4 w-4" />
          </span>
        )}
      </Link>
    </li>
  );
}

export function TaskList({ tasks, empty }: { tasks: Task[]; empty: React.ReactNode }) {
  if (tasks.length === 0) return <>{empty}</>;
  return <ul className="divide-y divide-slate-100 rounded-xl bg-white p-1.5 ring-1 ring-slate-200/70">{tasks.map((t) => <TaskRow key={t.id} task={t} />)}</ul>;
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="rounded-xl bg-white px-6 py-12 text-center ring-1 ring-slate-200/70">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {text && <p className="mt-1 text-sm text-slate-400">{text}</p>}
    </div>
  );
}
