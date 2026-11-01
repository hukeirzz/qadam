import { getStaff, getServerApi } from '@/lib/auth';
import { DashboardHome, type Attention } from '@/components/dashboard-home';
import * as agg from '@/lib/aggregate';

const HELP_BELOW = 40; // точность по школьным тестам, % — ниже нужна помощь
const TOP_ABOVE = 80; // точность, % — выше по всем темам

export default async function DashboardHomePage() {
  const { role } = await getStaff();
  const schoolId = role?.school_id ?? null;

  const api = await getServerApi();

  let students: agg.Student[] = [];
  let classes: agg.ClassRow[] = [];
  let exams: agg.Exam[] = [];
  let results: agg.Result[] = [];
  let testResults: agg.TestResultRow[] = [];
  if (schoolId) {
    [classes, students, exams, results, testResults] = await Promise.all([
      api.staffData.classes(schoolId),
      api.staffData.students(schoolId),
      api.staffData.mockExams(schoolId),
      api.staffData.mockResults(schoolId),
      api.staffData.schoolTopicResults(schoolId),
    ]);
  }

  const latest = agg.latestMockByStudent(exams, results);
  const accuracy = agg.studentAccuracy(testResults);
  const clsName = (id: string | null) => classes.find((c) => c.id === id)?.name ?? '—';

  const needHelp = students
    .flatMap((s): Attention[] => {
      const acc = accuracy.get(s.id);
      return acc != null && acc < HELP_BELOW
        ? [{ id: s.id, name: s.name, cls: clsName(s.class_id), accuracy: acc, mock: latest.get(s.id) ?? null }]
        : [];
    })
    .sort((a, b) => a.accuracy - b.accuracy);

  const topStudents = agg.allTopicsAbove(testResults, TOP_ABOVE);

  return (
    <DashboardHome
      totalStudents={students.length}
      classCount={classes.length}
      avgMock={agg.schoolAvgMock(exams, results)}
      helpCount={needHelp.length}
      topCount={students.filter((s) => topStudents.has(s.id)).length}
      helpBelow={HELP_BELOW}
      topAbove={TOP_ABOVE}
      needHelp={needHelp}
      dynamics={agg.mockDynamics(exams, results)}
    />
  );
}
