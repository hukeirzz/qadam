// Pure aggregation helpers over the school's raw rows (students, mock exams/
// results, per-topic accuracy). Shared by the dashboard and analytics pages.

export type Student = {
  id: string; name: string; class_id: string | null; xp: number;
  rank: string; premium_source: string; last_activity: string | null;
};
export type ClassRow = { id: string; name: string };
export type Exam = { id: string; name: string; exam_date: string | null };
export type Result = { exam_id: string; student_id: string; total: number };
export type Stat = { student_id: string; subject_id: string; correct_first: number; answered: number };

export const RANKS = ['D', 'C', 'B', 'A', 'S'] as const;
export const SUBJECTS = [
  { id: 'math', label: 'Мат' },
  { id: 'geometry', label: 'Гео' },
  { id: 'grammar', label: 'Грам' },
  { id: 'analogies', label: 'Анал' },
  { id: 'reading', label: 'Чт' },
];

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

export function rankDistribution(students: Student[]) {
  const counts: Record<string, number> = { D: 0, C: 0, B: 0, A: 0, S: 0 };
  for (const s of students) counts[s.rank] = (counts[s.rank] ?? 0) + 1;
  return counts;
}

export function avgRankLetter(students: Student[]): string {
  if (!students.length) return '—';
  const nums = students.map((s) => RANKS.indexOf(s.rank as (typeof RANKS)[number]) + 1).filter((n) => n > 0);
  const a = avg(nums);
  return RANKS[Math.min(RANKS.length - 1, Math.max(0, Math.round(a) - 1))];
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

/** Average XP per class, sorted desc. */
export function classXpAvg(students: Student[], classes: ClassRow[]) {
  return classes
    .map((c) => {
      const xps = students.filter((s) => s.class_id === c.id).map((s) => s.xp);
      return { cls: c.name, v: xps.length ? round(avg(xps)) : 0 };
    })
    .filter((x) => x.v > 0)
    .sort((a, b) => b.v - a.v);
}

/** Per class × subject first-try accuracy (pooled), 0–100. */
export function accuracyByClassSubject(students: Student[], classes: ClassRow[], stats: Stat[]) {
  const classOf = new Map(students.map((s) => [s.id, s.class_id]));
  // key: classId|subjectId -> {correct, answered}
  const acc = new Map<string, { c: number; a: number }>();
  for (const st of stats) {
    const cid = classOf.get(st.student_id);
    if (!cid) continue;
    const k = `${cid}|${st.subject_id}`;
    const cur = acc.get(k) ?? { c: 0, a: 0 };
    cur.c += st.correct_first;
    cur.a += st.answered;
    acc.set(k, cur);
  }
  const withData = classes.filter((c) => SUBJECTS.some((s) => acc.has(`${c.id}|${s.id}`)));
  const rows = withData.map((c) => ({
    cls: c.name,
    vals: SUBJECTS.map((s) => {
      const v = acc.get(`${c.id}|${s.id}`);
      return v && v.a ? round((100 * v.c) / v.a) : 0;
    }),
  }));
  return { cols: SUBJECTS.map((s) => s.label), rows };
}

export function topByXp(students: Student[], n: number, classId?: string) {
  return [...students]
    .filter((s) => !classId || classId === 'all' || s.class_id === classId)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, n);
}
export function bottomByXp(students: Student[], n: number, classId?: string) {
  return [...students]
    .filter((s) => !classId || classId === 'all' || s.class_id === classId)
    .sort((a, b) => a.xp - b.xp)
    .slice(0, n);
}

/** Students genuinely lagging: XP below the group average, lowest first. */
export function needsSupport(students: Student[], n: number, classId?: string) {
  const pool = students.filter((s) => !classId || classId === 'all' || s.class_id === classId);
  if (!pool.length) return [];
  const mean = avg(pool.map((s) => s.xp));
  return pool.filter((s) => s.xp < mean).sort((a, b) => a.xp - b.xp).slice(0, n);
}
