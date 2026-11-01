'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { TestsIcon, PlusIcon } from '@/components/icons';
import { createBrowserApi } from '@/lib/supabase/client';
import { TestBuilder } from '@/components/test-builder';
import type { TestResultRow } from '@/lib/aggregate';
import { TEST_LEVELS, type TestLevel } from '@qadam/api-client';

type ClassRow = { id: string; name: string; promo_code: string | null };
type StudentRow = { id: string; name: string; class_id: string | null };
type TopicRow = { id: string; subject_id: string; title: string; order_num: number };
type TestRow = {
  id: string; title: string; description: string | null; level: TestLevel;
  subject_id: string | null; topic_id: string | null;
  published: boolean; created_at: string;
  school_test_students: { student_id: string }[];
  school_test_questions: { id: string }[];
  school_test_results: { id: string }[];
};

export function TestsManager({
  schoolId, classes, tests, students, topics, topicLevels, topicResults,
}: {
  schoolId: string;
  classes: ClassRow[];
  tests: TestRow[];
  students: StudentRow[];
  topics: TopicRow[];
  topicLevels: { topic_id: string; level: TestLevel }[];
  topicResults: TestResultRow[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

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
            <p className="mt-0.5 text-sm text-slate-500">Сгенерируйте тест по теме и отправьте его выбранным ученикам.</p>
          </div>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            aria-label="Создать тест"
            className="flex h-11 w-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand text-sm font-semibold text-white transition hover:bg-brand-hover sm:h-auto sm:w-auto sm:px-4 sm:py-2.5"
          >
            <PlusIcon className="h-5 w-5 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Создать тест</span>
          </button>
        )}
      </header>

      {creating ? (
        <TestBuilder
          schoolId={schoolId}
          classes={classes}
          students={students}
          topics={topics}
          topicLevels={topicLevels}
          topicResults={topicResults}
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
            return (
              <Card key={t.id} className="!p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-800">{t.title}</h2>
                      <span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">{TEST_LEVELS.find((l) => l.id === t.level)?.label}</span>
                    </div>
                    {t.description && <p className="mt-1 text-sm text-slate-500">{t.description}</p>}
                    <p className="mt-2 text-xs text-slate-400">
                      {t.school_test_questions.length} вопросов · отправлено {t.school_test_students.length} ученикам · {t.school_test_results.length} прошли
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                    <Link
                      href={`/tests/${t.id}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-center text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Результаты
                    </Link>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deleting === t.id}
                      className="rounded-lg px-3 py-1.5 text-center text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
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
