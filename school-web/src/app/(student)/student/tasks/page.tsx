import Link from 'next/link';
import { getStudent } from '@/lib/auth';
import { loadStudentData } from '@/lib/student-data';
import { EmptyState, TaskList } from '@/components/student-tasks';

type Filter = 'all' | 'pending' | 'done';

export default async function StudentTasksPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter: Filter = status === 'pending' || status === 'done' ? status : 'all';

  const { student } = await getStudent();
  const { tasks } = await loadStudentData(student!.id);

  const counts = { all: tasks.length, pending: tasks.filter((t) => !t.done).length, done: tasks.filter((t) => t.done).length };
  const shown = filter === 'all' ? tasks : filter === 'pending' ? tasks.filter((t) => !t.done) : tasks.filter((t) => t.done);
  // Unfinished work first, otherwise newest first.
  const ordered = [...shown].sort((a, b) => Number(!!a.done) - Number(!!b.done) || b.createdAt.localeCompare(a.createdAt));

  // `short` is used below sm so all three tabs fit on a phone.
  const tabs: { id: Filter; label: string; short: string }[] = [
    { id: 'all', label: 'Все', short: 'Все' },
    { id: 'pending', label: 'Ожидают решения', short: 'Ожидают' },
    { id: 'done', label: 'Завершённые', short: 'Готовые' },
  ];

  const emptyText: Record<Filter, string> = {
    all: 'Пока нет назначенных заданий',
    pending: 'Нет заданий, ожидающих решения',
    done: 'Завершённых заданий пока нет',
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Задания</h1>
        <p className="mt-1 text-sm text-slate-500">Тесты, которые назначил вам учитель.</p>
      </div>

      <nav aria-label="Фильтр по статусу" className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => {
          const active = filter === t.id;
          return (
            <Link key={t.id} href={t.id === 'all' ? '/student/tasks' : `/student/tasks?status=${t.id}`} aria-current={active ? 'page' : undefined}
              className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-2.5 py-2.5 sm:gap-2 sm:px-3 text-sm font-medium transition ${
                active ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              <span className="sm:hidden">{t.short}</span><span className="hidden sm:inline">{t.label}</span>
              <span className={`rounded-md px-1.5 text-xs ${active ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>{counts[t.id]}</span>
            </Link>
          );
        })}
      </nav>

      <TaskList tasks={ordered} empty={<EmptyState title={emptyText[filter]} />} />
    </div>
  );
}
