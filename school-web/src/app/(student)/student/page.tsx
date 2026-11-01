import { getStudent } from '@/lib/auth';
import { loadStudentData } from '@/lib/student-data';
import { CARD, plural } from '@/components/student-widgets';
import { EmptyState, TaskList } from '@/components/student-tasks';

export default async function StudentHome() {
  const { student } = await getStudent();
  const { tasks } = await loadStudentData(student!.id);

  const pending = tasks.filter((t) => !t.done);
  const completed = tasks.filter((t) => t.done).sort((a, b) => b.done!.at.localeCompare(a.done!.at));
  const progress = tasks.length ? Math.round((100 * completed.length) / tasks.length) : 0;
  // Oldest assignment first — that's the one to do next.
  const pendingOrdered = [...pending].reverse();
  const firstName = student!.name.split(/\s+/)[0];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-x-8">
      <section className="lg:col-start-1 lg:row-start-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Привет, {firstName}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {pending.length > 0
            ? `У вас ${pending.length} ${plural(pending.length, 'невыполненное задание', 'невыполненных задания', 'невыполненных заданий')} от учителя.`
            : tasks.length > 0 ? 'Все назначенные задания выполнены.' : 'Учитель пока не назначил вам заданий.'}
        </p>
      </section>

      {/* Summary */}
      <aside className={`${CARD} p-5 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start`} aria-label="Сводка по заданиям">
        <h2 className="text-sm font-semibold text-slate-900">Задания</h2>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
          {[
            { label: 'Назначено', value: tasks.length },
            { label: 'Решено', value: completed.length },
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

      <section className="lg:col-start-1 lg:row-start-2" aria-labelledby="actual">
        <h2 id="actual" className="mb-3 text-sm font-semibold text-slate-900">Актуальные задания</h2>
        <TaskList tasks={pendingOrdered}
          empty={<EmptyState title={tasks.length ? 'Невыполненных заданий нет' : 'Пока нет назначенных заданий'}
            text={tasks.length ? undefined : 'Когда учитель отправит тест, он появится здесь.'} />} />
      </section>

      <section className="lg:col-start-1 lg:row-start-3" aria-labelledby="history">
        <h2 id="history" className="mb-3 text-sm font-semibold text-slate-900">История тестов</h2>
        <TaskList tasks={completed} empty={<EmptyState title="Решённых тестов пока нет" text="После первого решённого теста он появится здесь." />} />
      </section>
    </div>
  );
}
