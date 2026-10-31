import { cache } from 'react';
import { getServerApi } from './auth';
import type { Task } from '@/components/student-tasks';
import { topicWithLevel } from './levels';

/**
 * Everything the student screens need, from real data only:
 *  - tasks: tests the teacher assigned (RLS already limits `tests()` to those), each with
 *    its saved result if the student has completed it;
 *  - results: first attempts only (school_test_results holds nothing else), newest first;
 *  - retakes: later attempts, shown to the student but never used for analytics.
 * There is no "in progress" state in the database, so a task is either pending or done.
 * Memoized per request: layout/pages can call it freely.
 */
export const loadStudentData = cache(async (studentId: string) => {
  const api = await getServerApi();
  const [tests, results, topicTitles, retakes] = await Promise.all([
    api.studentData.tests(), api.studentData.results(studentId), api.studentData.topicTitles(), api.studentData.retakes(studentId),
  ]);
  const retakeCount = new Map<string, number>();
  for (const r of retakes) retakeCount.set(r.test_id, (retakeCount.get(r.test_id) ?? 0) + 1);

  const doneByTest = new Map(results.map((r) => [r.test_id, r]));
  const tasks: Task[] = tests.map((t) => {
    const r = doneByTest.get(t.id);
    return {
      id: t.id,
      title: t.title,
      subjectId: t.subject_id,
      topicTitle: t.topic_id && topicTitles[t.topic_id] ? topicWithLevel(topicTitles[t.topic_id], t.level) : null,
      questionCount: t.question_count,
      createdAt: t.created_at,
      done: r ? { score: r.score, total: r.total, at: r.created_at } : null,
      retakes: retakeCount.get(t.id) ?? 0,
    };
  });

  return { tasks, results, topicTitles, retakes };
});
