import Link from 'next/link';
import { getStudent } from '@/lib/auth';
import { loadStudentData } from '@/lib/student-data';
import { ArrowRightIcon } from '@/components/icons';
import { CARD, plural } from '@/components/student-widgets';
import { EmptyState, TaskList } from '@/components/student-tasks';

export default async function StudentHome() {
  const { student } = await getStudent();
  const { tasks } = await loadStudentData(student!.id);

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.length - pending.length;
  const progress = tasks.length ? Math.round((100 * done) / tasks.length) : 0;
  // Pending first (oldest = the one to do next), then the latest completed ones.
  const pendingOrdered = [...pending].reverse();
  const featured = [...pendingOrdered, ...tasks.filter((t) => t.done)].slice(0, 5);
  const firstName = student!.name.split(/\s+/)[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-x-8">
      <section className="lg:col-start-1 lg:row-start-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Привет, {firstName}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {pending.length > 0
            ? `У вас ${pending.length} ${plural(pending.length, 'невыполненное задание', 'невыполненных задания', 'невыполненных заданий')} от учителя.`
            : tasks.length > 0 ? 'Все назначенные задания выполнены.' : 'Учитель пока не назначил вам заданий.'}
        </p>
      </section>

      {/* Summary */}
      <aside className={`${CARD} p-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start`} aria-label="Сводка по заданиям">
        <h2 className="text-sm font-semibold text-slate-900">Задания</h2>
        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Назначено', value: tasks.length },
            { label: 'К выполнению', value: pending.length },
            { label: 'Завершено', value: done },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-slate-50 px-1 py-3">
              <dd className="text-xl font-semibold text-slate-900">{s.value}</dd>
              <dt className="mt-0.5 text-[11px] leading-tight text-slate-500">{s.label}</dt>
            </div>
          ))}
        </dl>
        {tasks.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Выполнено</span><span className="font-medium text-slate-700">{progress}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </aside>

      <section className="lg:col-start-1 lg:row-start-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Актуальные задания</h2>
          {tasks.length > 0 && (
            <Link href="/student/tasks" className="flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-hover">
              Все задания <ArrowRightIcon className="h-4 w-4" />
            </Link>
          )}
        </div>
        <TaskList tasks={featured} empty={<EmptyState title="Пока нет назначенных заданий" text="Когда учитель отправит тест, он появится здесь." />} />
      </section>
    </div>
  );
}
