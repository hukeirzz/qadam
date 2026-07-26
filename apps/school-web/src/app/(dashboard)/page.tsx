import { createServerApi } from '@/lib/supabase/server';
import { DashboardHome, type Attention } from '@/components/dashboard-home';
import * as agg from '@/lib/aggregate';

export default async function DashboardHomePage() {
  const api = await createServerApi();
  const session = await api.auth.getSession();
  const name =
    (session?.user.user_metadata?.name as string | undefined) ||
    session?.user.email?.split('@')[0] ||
    'Пользователь';
  const firstName = name.split(/\s+/)[0];

  const roleInfo = session ? await api.profile.role(session.user.id) : null;
  const schoolId = roleInfo?.school_id ?? null;

  let students: agg.Student[] = [];
  let classes: agg.ClassRow[] = [];
  let exams: agg.Exam[] = [];
  let results: agg.Result[] = [];
  if (schoolId) {
    [classes, students, exams, results] = await Promise.all([
      api.staffData.classes(schoolId),
      api.staffData.students(schoolId),
      api.staffData.mockExams(schoolId),
      api.staffData.mockResults(schoolId),
    ]);
  }

  const latest = agg.latestMockByStudent(exams, results);
  const rankDist = agg.rankDistribution(students);
  const clsName = (id: string | null) => classes.find((c) => c.id === id)?.name ?? '—';

  const atRisk = students
    .map((s): Attention | null => {
      const m = latest.get(s.id);
      if (m != null && m < 110) return { id: s.id, name: s.name, cls: clsName(s.class_id), reason: `Ниже проходного порога · балл ${m}`, tone: 'text-red-500' };
      if (s.rank === 'C' || s.rank === 'D') return { id: s.id, name: s.name, cls: clsName(s.class_id), reason: `Низкий ранг ${s.rank}${m != null ? ` · балл ${m}` : ''}`, tone: 'text-amber-600' };
      return null;
    })
    .filter((x): x is Attention => x !== null);

  return (
    <DashboardHome
      firstName={firstName}
      totalStudents={students.length}
      attentionCount={atRisk.length}
      avgRank={agg.avgRankLetter(students)}
      sCount={rankDist.S}
      rankDist={rankDist}
      attention={atRisk.slice(0, 5)}
      dynamics={agg.mockDynamics(exams, results)}
    />
  );
}
