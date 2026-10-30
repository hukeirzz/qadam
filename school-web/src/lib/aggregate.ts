// Pure aggregation helpers over the school's raw rows (students, mock exams/
// results, school-test results). Shared by the dashboard and analytics pages.

export type Student = {
  id: string; name: string; class_id: string | null; xp: number;
  last_activity: string | null;
};

/** "Сегодня" / "Вчера" / "N дней назад" from an ISO date (yyyy-mm-dd). */
export function relDay(iso: string | null): string {
  if (!iso) return 'нет данных';
  const d = new Date(iso + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (days <= 0) return 'Сегодня';
  if (days === 1) return 'Вчера';
  if (days < 5) return `${days} дня назад`;
  return `${days} дней назад`;
}
export type ClassRow = { id: string; name: string };
export type Exam = { id: string; name: string; exam_date: string | null };
export type Result = { exam_id: string; student_id: string; total: number };

const round = (n: number) => Math.round(n);
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Latest mock total per student (by exam order). */
export function latestMockByStudent(exams: Exam[], results: Result[]): Map<string, number> {
  const order = new Map(exams.map((e, i) => [e.id, i]));
  const best = new Map<string, { i: number; total: number }>();
  for (const r of results) {
    const i = order.get(r.exam_id) ?? -1;
    const cur = best.get(r.student_id);
    if (!cur || i > cur.i) best.set(r.student_id, { i, total: r.total });
  }
  return new Map([...best].map(([k, v]) => [k, v.total]));
}


/** One student's result on one school test (api: staffData.schoolTopicResults). */
export type TestResultRow = {
  test_id: string; student_id: string; score: number; total: number; created_at: string;
  school_tests: { topic_id: string | null };
};

/** Per-student overall accuracy on school tests (0–100, pooled). */
export function studentAccuracy(rows: TestResultRow[]) {
  const acc = new Map<string, { s: number; t: number }>();
  for (const r of rows) {
    const cur = acc.get(r.student_id) ?? { s: 0, t: 0 };
    cur.s += r.score; cur.t += r.total; acc.set(r.student_id, cur);
  }
  return new Map([...acc].filter(([, v]) => v.t > 0).map(([k, v]) => [k, round((100 * v.s) / v.t)]));
}

/** student -> topic -> pooled accuracy (0–100) over that student's tests on the topic. */
function studentTopicAccuracy(rows: TestResultRow[]) {
  const acc = new Map<string, Map<string, { s: number; t: number }>>();
  for (const r of rows) {
    const topic = r.school_tests.topic_id;
    if (!topic || !r.total) continue;
    if (!acc.has(r.student_id)) acc.set(r.student_id, new Map());
    const m = acc.get(r.student_id)!;
    const cur = m.get(topic) ?? { s: 0, t: 0 };
    cur.s += r.score; cur.t += r.total; m.set(topic, cur);
  }
  return new Map(
    [...acc].map(([sid, m]) => [sid, new Map([...m].map(([tid, v]) => [tid, (100 * v.s) / v.t]))] as const),
  );
}

/** Students whose accuracy is above `bar`% on every topic they have tested. */
export function allTopicsAbove(rows: TestResultRow[], bar: number): Set<string> {
  return new Set(
    [...studentTopicAccuracy(rows)]
      .filter(([, m]) => m.size > 0 && [...m.values()].every((v) => v > bar))
      .map(([sid]) => sid),
  );
}


export function schoolAvgMock(exams: Exam[], results: Result[]): number {
  const latest = [...latestMockByStudent(exams, results).values()];
  return latest.length ? round(avg(latest)) : 0;
}

/** School-wide average total per exam, in exam order. */
export function mockDynamics(exams: Exam[], results: Result[]) {
  const byExam = new Map<string, number[]>();
  for (const r of results) {
    if (!byExam.has(r.exam_id)) byExam.set(r.exam_id, []);
    byExam.get(r.exam_id)!.push(r.total);
  }
  const used = exams.filter((e) => byExam.has(e.id));
  return {
    labels: used.map((e) => e.name),
    values: used.map((e) => round(avg(byExam.get(e.id)!))),
  };
}

/** Average latest mock total per class, sorted desc. */
export function classMockAvg(students: Student[], classes: ClassRow[], exams: Exam[], results: Result[]) {
  const latest = latestMockByStudent(exams, results);
  return classes
    .map((c) => {
      const totals = students.filter((s) => s.class_id === c.id).map((s) => latest.get(s.id)).filter((v): v is number => v != null);
      return { cls: c.name, v: totals.length ? round(avg(totals)) : 0 };
    })
    .filter((x) => x.v > 0)
    .sort((a, b) => b.v - a.v);
}


export const SUBJECT_LABELS: Record<string, string> = {
  math: 'Математика', geometry: 'Геометрия',
};


/** Diverging color 0=red · 50=white · 100=green. */
export function accColor(v: number) {
  const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
  let r: number, g: number, b: number;
  if (v <= 50) { const t = v / 50; r = lerp(239, 255, t); g = lerp(68, 255, t); b = lerp(68, 255, t); }
  else { const t = (v - 50) / 50; r = lerp(255, 34, t); g = lerp(255, 197, t); b = lerp(255, 94, t); }
  return { backgroundColor: `rgb(${r}, ${g}, ${b})`, color: v <= 22 || v >= 82 ? '#fff' : '#334155' };
}


/** Change between a student's last two mock totals (by exam order); undefined if fewer than two. */
export function mockDeltaByStudent(exams: Exam[], results: Result[]): Map<string, number> {
  const order = new Map(exams.map((e, i) => [e.id, i]));
  const by = new Map<string, { i: number; total: number }[]>();
  for (const r of results) {
    if (!by.has(r.student_id)) by.set(r.student_id, []);
    by.get(r.student_id)!.push({ i: order.get(r.exam_id) ?? -1, total: r.total });
  }
  const out = new Map<string, number>();
  for (const [id, xs] of by) {
    if (xs.length < 2) continue;
    xs.sort((a, b) => a.i - b.i);
    out.set(id, xs[xs.length - 1].total - xs[xs.length - 2].total);
  }
  return out;
}

/** Titles of the student's weakest topics (test accuracy below `bar`%), weakest first. */
export function weakTopicTitles(
  rows: TestResultRow[],
  topics: { id: string; title: string }[],
  bar: number,
  limit: number,
): Map<string, string[]> {
  const title = new Map(topics.map((t) => [t.id, t.title]));
  return new Map(
    [...studentTopicAccuracy(rows)].map(([sid, m]) => [
      sid,
      [...m]
        .filter(([tid, v]) => v < bar && title.has(tid))
        .sort((a, b) => a[1] - b[1])
        .slice(0, limit)
        .map(([tid]) => title.get(tid)!),
    ]),
  );
}


/** Score buckets for one exam's results (max 245, pass mark 110). */
export function scoreBuckets(totals: number[]) {
  const defs = [
    { label: '200–245', color: '#22c55e', test: (v: number) => v >= 200 },
    { label: '150–199', color: '#3b82f6', test: (v: number) => v >= 150 && v < 200 },
    { label: '110–149', color: '#f59e0b', test: (v: number) => v >= 110 && v < 150 },
    { label: 'менее 110', color: '#ef4444', test: (v: number) => v < 110 },
  ];
  return defs.map((d) => ({ label: d.label, color: d.color, value: totals.filter(d.test).length }));
}

export type TestLevelId = 'basic' | 'medium' | 'high';
export type LevelHeatmapGroup = { id: string; label: string; topics: { title: string; acc: number | null; tests: number }[] };

/**
 * Per-level topic heatmap for one student, from their school-test results.
 * Which topics belong to a level comes from topic_levels (a topic may be in
 * only some levels); accuracy is score/total pooled over that student's tests
 * of this level on that topic, null when the student hasn't taken one yet.
 */
export function levelHeatmap(
  level: TestLevelId,
  testResults: { score: number; total: number; school_tests: { level: TestLevelId; topic_id: string | null } }[],
  topicLevels: { topic_id: string; level: TestLevelId }[],
  topics: { id: string; subject_id: string; title: string; order_num: number }[],
): LevelHeatmapGroup[] {
  const inLevel = new Set(topicLevels.filter((l) => l.level === level).map((l) => l.topic_id));
  const acc = new Map<string, { s: number; t: number; n: number }>();
  for (const r of testResults) {
    if (r.school_tests.level !== level || !r.school_tests.topic_id) continue;
    const cur = acc.get(r.school_tests.topic_id) ?? { s: 0, t: 0, n: 0 };
    cur.s += r.score; cur.t += r.total; cur.n += 1; acc.set(r.school_tests.topic_id, cur);
  }
  const by = new Map<string, LevelHeatmapGroup>();
  for (const t of [...topics].filter((x) => inLevel.has(x.id)).sort((a, b) => a.order_num - b.order_num)) {
    if (!by.has(t.subject_id)) by.set(t.subject_id, { id: t.subject_id, label: SUBJECT_LABELS[t.subject_id] ?? t.subject_id, topics: [] });
    const v = acc.get(t.id);
    by.get(t.subject_id)!.topics.push({ title: t.title, acc: v && v.t ? Math.round((100 * v.s) / v.t) : null, tests: v?.n ?? 0 });
  }
  return [...by.values()].sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Школьная успеваемость по темам из результатов тестов: общая точность по теме
 * и динамика — точность последнего теста по теме минус предыдущего (пункты %).
 * Динамика null, пока по теме меньше двух тестов.
 */
export function topicTestProgress(results: TestResultRow[]) {
  type T = { s: number; t: number; last: string };
  const by = new Map<string, Map<string, T>>(); // topic -> test -> sums
  for (const r of results) {
    const topic = r.school_tests.topic_id;
    if (!topic) continue;
    if (!by.has(topic)) by.set(topic, new Map());
    const tests = by.get(topic)!;
    const cur = tests.get(r.test_id) ?? { s: 0, t: 0, last: r.created_at };
    cur.s += r.score; cur.t += r.total;
    if (r.created_at > cur.last) cur.last = r.created_at;
    tests.set(r.test_id, cur);
  }
  return new Map(
    [...by].flatMap(([topic, tests]) => {
      const list = [...tests.values()].filter((x) => x.t > 0).sort((a, b) => a.last.localeCompare(b.last));
      if (!list.length) return [];
      const pct = (x: T) => (100 * x.s) / x.t;
      const all = list.reduce((a, x) => ({ s: a.s + x.s, t: a.t + x.t }), { s: 0, t: 0 });
      const delta = list.length >= 2 ? round(pct(list[list.length - 1]) - pct(list[list.length - 2])) : null;
      return [[topic, { acc: round((100 * all.s) / all.t), delta, tests: list.length }] as const];
    }),
  );
}
