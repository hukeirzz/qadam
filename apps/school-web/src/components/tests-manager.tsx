'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, RankBadge } from '@/components/ui';
import { TestsIcon, PlusIcon } from '@/components/icons';
import { createBrowserApi } from '@/lib/supabase/client';
import { TestBuilder } from '@/components/test-builder';

type ClassRow = { id: string; name: string; promo_code: string | null };
type TestRow = {
  id: string; title: string; description: string | null;
  target_rank: string | null; subject_id: string | null;
  published: boolean; created_at: string;
  school_test_classes: { class_id: string }[];
  school_test_questions: { id: string }[];
  school_test_results: { id: string }[];
};

export function TestsManager({
  schoolId, classes, tests,
}: {
  schoolId: string;
  classes: ClassRow[];
  tests: TestRow[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const classNames = (ids: string[]) =>
    ids.map((id) => classes.find((c) => c.id === id)?.name).filter(Boolean).join(', ');

  async function handleDelete(id: string) {
    if (!window.confirm('Удалить тест? Результаты учеников тоже удалятся.')) return;
    setDeleting(id);
    const api = createBrowserApi();
    await api.staffData.deleteSchoolTest(id);
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <TestsIcon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Тесты школы</h1>
            <p className="mt-0.5 text-sm text-slate-500">Появляются у учеников автоматически — по школе, рангу и классу.</p>
          </div>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
          >
            <PlusIcon className="h-4 w-4" /> Создать тест
          </button>
        )}
      </header>

      {creating ? (
        <TestBuilder
          schoolId={schoolId}
          classes={classes}
          onDone={() => { setCreating(false); router.refresh(); }}
          onCancel={() => setCreating(false)}
        />
      ) : tests.length === 0 ? (
        <Card className="py-12 text-center text-sm text-slate-400">
          Пока нет ни одного теста — нажмите «Создать тест».
        </Card>
      ) : (
        <div className="space-y-3">
          {tests.map((t) => {
            const classIds = t.school_test_classes.map((c) => c.class_id);
            return (
              <Card key={t.id} className="!p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-800">{t.title}</h2>
                      {t.target_rank && <RankBadge rank={t.target_rank} />}
                    </div>
                    {t.description && <p className="mt-1 text-sm text-slate-500">{t.description}</p>}
                    <p className="mt-2 text-xs text-slate-400">
                      {t.school_test_questions.length} вопросов · {classIds.length > 0 ? classNames(classIds) : 'вся школа'} · {t.school_test_results.length} прошли
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/tests/${t.id}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Результаты
                    </Link>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deleting === t.id}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleting === t.id ? 'Удаляем…' : 'Удалить'}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
