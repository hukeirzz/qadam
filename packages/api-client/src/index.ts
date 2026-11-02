// Единственное место, где Qadam обращается к Supabase: school-web ходит в БД только через этот пакет
// и никогда не импортирует @supabase/supabase-js напрямую. Так бэкенд можно менять или усиливать
// (проверки на стороне Postgres/RPC) без правок в страницах.
//
// Клиент для Next.js (@supabase/ssr, с cookie-сессией) создаёт само приложение и передаёт его
// в wrapSupabaseClient().

import type { SupabaseClient } from '@supabase/supabase-js';

/** Уровни сложности школьного теста. */
export type TestLevel = 'basic' | 'medium' | 'high';
export const TEST_LEVELS: { id: TestLevel; label: string }[] = [
  { id: 'basic', label: 'Базовый' },
  { id: 'medium', label: 'Средний' },
  { id: 'high', label: 'Высокий' },
];

/**
 * Оборачивает готовый SupabaseClient в пространства имён: auth (вход/регистрация), profile (роль учителя),
 * staffData (всё для учителя: классы, ученики, тесты, пробные), studentData (кабинет ученика).
 * Права доступа всегда решает RLS в БД, а не этот код.
 */
export function wrapSupabaseClient(supabase: SupabaseClient) {
  const auth = {
    /**
     * Student self-registration. `classCode` rides along in the user metadata:
     * the handle_new_user trigger resolves it to class + school on insert, so
     * the student lands in their class even before the email is confirmed.
     */
    async signUp(email: string, password: string, name: string, classCode?: string) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, ...(classCode ? { class_code: classCode.trim() } : {}) } },
      });
      return { data, error };
    },

    async signIn(email: string, password: string) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { data, error };
    },

    async signOut() {
      return supabase.auth.signOut();
    },

    /** Change the currently signed-in user's password. */
    async updatePassword(newPassword: string) {
      return supabase.auth.updateUser({ password: newPassword });
    },

    /** Send a password-reset email (6-digit code template). */
    async resetPassword(email: string, redirectTo?: string) {
      return supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    },

    /** Verify the reset code from the email; on success a recovery session is created. */
    async verifyRecoveryCode(email: string, token: string) {
      return supabase.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'recovery' });
    },

    /**
     * Verify the signup confirmation code (email OTP template, see
     * `mailer_templates_confirmation_content`) — on success a live session
     * is created, same as clicking the confirmation link would, but
     * without leaving the app.
     */
    async verifySignupCode(email: string, token: string) {
      return supabase.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'signup' });
    },

    /** Resends the signup confirmation code to the given email. */
    async resendConfirmationCode(email: string) {
      return supabase.auth.resend({ type: 'signup', email: email.trim() });
    },

    async getSession() {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  };

  const profile = {
    /**
     * Staff role/school for a platform (web) user. Reads the `staff` table —
     * students live in `students` and never have a staff role. Returns null
     * for non-staff (e.g. a student who somehow reaches the web). `class_id`
     * is always null (staff aren't tied to a class) — kept for call-site
     * compatibility.
     */
    async role(userId: string): Promise<{ role: string; school_id: string | null; class_id: string | null } | null> {
      const { data, error } = await supabase
        .from('staff')
        .select('role, school_id')
        .eq('id', userId)
        .single();

      if (error || !data) return null;
      const row = data as { role: string; school_id: string | null };
      return { role: row.role, school_id: row.school_id, class_id: null };
    },

  };

  const BASE_SUBJECTS = ['math', 'geometry', 'analogies', 'reading', 'grammar'];


  // Staff-facing reads/writes over a school's roster and mock exams.
  // RLS scopes everything to the caller's own school.
  const staffData = {
    async classes(schoolId: string) {
      const { data } = await supabase
        .from('classes').select('id, name, promo_code').eq('school_id', schoolId).order('name');
      return (data ?? []) as { id: string; name: string; promo_code: string | null }[];
    },

    /** Creates a class in the school; the DB auto-generates its promo code. */
    async createClass(schoolId: string, name: string) {
      const { data, error } = await supabase
        .from('classes')
        .insert({ school_id: schoolId, name })
        .select('id, name, promo_code')
        .single();
      return { class: (data as { id: string; name: string; promo_code: string | null } | null), error };
    },

    /** Regenerates a class's join code (e.g. if it leaked). Returns the new code. */
    async regenerateClassCode(classId: string) {
      const { data, error } = await supabase.rpc('regenerate_class_code', { p_class: classId });
      return { code: (data as string | null) ?? null, error };
    },

    async students(schoolId: string) {
      const { data } = await supabase
        .from('students')
        .select('id, name, class_id')
        .eq('school_id', schoolId)
        .order('name');
      return (data ?? []) as { id: string; name: string; class_id: string | null }[];
    },

    async student(id: string) {
      const { data } = await supabase
        .from('students')
        .select('id, name, class_id, school_id')
        .eq('id', id).single();
      return data as { id: string; name: string; class_id: string | null; school_id: string | null } | null;
    },

    async studentMockResults(studentId: string) {
      const { data } = await supabase
        .from('mock_results')
        .select('exam_id, total, mock_exams!inner(name, exam_date)')
        .eq('student_id', studentId);
      return (data ?? []) as unknown as {
        exam_id: string; total: number; mock_exams: { name: string; exam_date: string | null };
      }[];
    },

    /** Все результаты школьных тестов школы с темой теста — для успеваемости и динамики по темам. */
    async schoolTopicResults(schoolId: string) {
      const { data } = await supabase
        .from('school_test_results')
        .select('test_id, student_id, score, total, created_at, school_tests!inner(topic_id, level, school_id)')
        .eq('school_tests.school_id', schoolId);
      return (data ?? []) as unknown as {
        test_id: string; student_id: string; score: number; total: number; created_at: string;
        school_tests: { topic_id: string | null; level: TestLevel };
      }[];
    },

    /** Какие темы входят в какой уровень сложности (тема может быть в нескольких). */
    async topicLevels() {
      const { data } = await supabase.from('topic_levels').select('topic_id, level');
      return (data ?? []) as { topic_id: string; level: TestLevel }[];
    },

    /** Результаты школьных тестов ученика с уровнем и темой теста — для тепловых карт по уровням. */
    async studentTestResults(studentId: string) {
      const { data } = await supabase
        .from('school_test_results')
        .select('score, total, school_tests!inner(level, topic_id)')
        .eq('student_id', studentId);
      return (data ?? []) as unknown as {
        score: number; total: number;
        school_tests: { level: TestLevel; topic_id: string | null };
      }[];
    },

    async topics() {
      const { data } = await supabase.from('topics').select('id, subject_id, title, order_num').order('order_num');
      return (data ?? []) as { id: string; subject_id: string; title: string; order_num: number }[];
    },

    async mockExams(schoolId: string) {
      const { data } = await supabase
        .from('mock_exams').select('id, name, exam_date')
        .eq('school_id', schoolId).order('exam_date', { ascending: true });
      return (data ?? []) as { id: string; name: string; exam_date: string | null }[];
    },

    async mockResults(schoolId: string) {
      const { data } = await supabase
        .from('mock_results')
        .select('exam_id, student_id, total, math, geometry, grammar, analogies, reading, mock_exams!inner(school_id)')
        .eq('mock_exams.school_id', schoolId);
      return (data ?? []) as unknown as {
        exam_id: string; student_id: string; total: number;
        math: number | null; geometry: number | null; grammar: number | null;
        analogies: number | null; reading: number | null;
      }[];
    },

    async createMockExam(schoolId: string, name: string, examDate: string | null, createdBy: string) {
      const { data, error } = await supabase
        .from('mock_exams')
        .insert({ school_id: schoolId, name, exam_date: examDate, created_by: createdBy })
        .select('id').single();
      return { id: (data as { id: string } | null)?.id ?? null, error };
    },

    async saveMockResults(
      examId: string,
      rows: {
        student_id: string; total: number;
        math?: number | null; geometry?: number | null; grammar?: number | null;
        analogies?: number | null; reading?: number | null;
      }[],
    ) {
      const payload = rows.map((r) => ({ exam_id: examId, ...r }));
      const { error } = await supabase
        .from('mock_results')
        .upsert(payload, { onConflict: 'exam_id,student_id' });
      return { error };
    },

    /** Tests this school's staff authored (RLS scopes to own school). */
    async schoolTests(schoolId: string) {
      const { data } = await supabase
        .from('school_tests')
        .select(
          'id, title, description, level, subject_id, topic_id, published, created_at, ' +
            'school_test_students(student_id), school_test_questions(id), school_test_results(id)',
        )
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });
      return (data ?? []) as unknown as {
        id: string; title: string; description: string | null; level: TestLevel;
        subject_id: string | null; topic_id: string | null;
        published: boolean; created_at: string;
        school_test_students: { student_id: string }[];
        school_test_questions: { id: string }[];
        school_test_results: { id: string }[];
      }[];
    },

    /** One test's metadata + authored questions (for a read-only detail view). */
    async schoolTest(testId: string) {
      const { data } = await supabase
        .from('school_tests')
        .select(
          'id, title, description, level, subject_id, topic_id, published, created_at, ' +
            'school_test_students(student_id), ' +
            'school_test_questions(id, order_num, text, explanation, image_url, figure, school_test_options(id, order_num, text, is_correct))',
        )
        .eq('id', testId)
        .single();
      return (data ?? null) as unknown as {
        id: string; title: string; description: string | null; level: TestLevel;
        subject_id: string | null; topic_id: string | null;
        published: boolean; created_at: string;
        school_test_students: { student_id: string }[];
        school_test_questions: {
          id: string; order_num: number; text: string; explanation: string | null; image_url: string | null; figure: unknown | null;
          school_test_options: { id: string; order_num: number; text: string; is_correct: boolean }[];
        }[];
      } | null;
    },

    /** Who took a test and with what score. Mirrors studentMockResults' embed style. */
    async schoolTestResults(testId: string) {
      const { data } = await supabase
        .from('school_test_results')
        .select('student_id, score, total, duration_seconds, created_at, students!inner(name, class_id)')
        .eq('test_id', testId)
        .order('score', { ascending: false });
      return (data ?? []) as unknown as {
        student_id: string; score: number; total: number; duration_seconds: number | null; created_at: string;
        students: { name: string; class_id: string | null };
      }[];
    },

    /**
     * Creates a test with its questions/options. supabase-js has no
     * transaction API (same constraint as createMockExam + saveMockResults),
     * so this is a sequence of inserts guarded two ways: `published` stays
     * false until the last step, so a half-written test is invisible to
     * students; and any failure best-effort deletes the parent row (cascades).
     */
    async createSchoolTest(
      schoolId: string,
      createdBy: string,
      test: {
        title: string;
        description?: string | null;
        level: TestLevel;
        subjectId: string | null;
        topicId?: string | null;
        studentIds: string[]; // видимость решает только это — назначенные ученики
      },
      questions: {
        text: string;
        explanation?: string | null;
        imageUrl?: string | null;
        figure?: unknown | null; // JSON-описание чертежа, рисуется Figure в school-web
        options: { text: string; isCorrect: boolean }[];
      }[],
    ): Promise<{ id: string | null; error: { message: string } | null }> {
      const { data: created, error: testErr } = await supabase
        .from('school_tests')
        .insert({
          school_id: schoolId, title: test.title, description: test.description ?? null,
          level: test.level, subject_id: test.subjectId, topic_id: test.topicId ?? null,
          created_by: createdBy, published: false,
        })
        .select('id').single();
      if (testErr || !created) {
        console.warn('staffData.createSchoolTest (test) error:', testErr?.message);
        return { id: null, error: testErr };
      }
      const testId = (created as { id: string }).id;

      const fail = async (e: { message: string }, step: string) => {
        console.warn(`staffData.createSchoolTest (${step}) error:`, e.message);
        await supabase.from('school_tests').delete().eq('id', testId); // best-effort rollback
        return { id: null, error: e };
      };

      if (test.studentIds.length > 0) {
        const { error } = await supabase.from('school_test_students')
          .insert(test.studentIds.map((student_id) => ({ test_id: testId, student_id })));
        if (error) return fail(error, 'students');
      }

      // order_num carries the mapping back to `questions[i]` — bulk insert
      // return order isn't guaranteed, so we sort by it instead of trusting it.
      const { data: qRows, error: qErr } = await supabase
        .from('school_test_questions')
        .insert(questions.map((q, i) => ({
          test_id: testId, order_num: i, text: q.text, explanation: q.explanation ?? null, image_url: q.imageUrl ?? null, figure: q.figure ?? null,
        })))
        .select('id, order_num');
      if (qErr || !qRows) return fail(qErr ?? { message: 'no questions inserted' }, 'questions');

      const ordered = [...(qRows as { id: string; order_num: number }[])]
        .sort((a, b) => a.order_num - b.order_num);
      const optionPayload = ordered.flatMap((row) =>
        questions[row.order_num].options.map((o, oi) => ({
          question_id: row.id, order_num: oi, text: o.text, is_correct: o.isCorrect,
        })));
      const { error: oErr } = await supabase.from('school_test_options').insert(optionPayload);
      if (oErr) return fail(oErr, 'options');

      const { error: pubErr } = await supabase
        .from('school_tests').update({ published: true }).eq('id', testId);
      if (pubErr) return fail(pubErr, 'publish');

      return { id: testId, error: null };
    },

    /** Deletes a student's account and everything tied to it. Only staff of the same school (checked in the DB). */
    /** Uploads a question photo (figure, diagram) to the public `question-images` bucket; returns its URL. */
    async uploadQuestionImage(schoolId: string, file: Blob): Promise<{ url: string | null; error: { message: string } | null }> {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const path = `${schoolId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('question-images').upload(path, file, { contentType: file.type });
      if (error) return { url: null, error };
      return { url: supabase.storage.from('question-images').getPublicUrl(path).data.publicUrl, error: null };
    },
    async moveStudent(studentId: string, classId: string) {
      const { error } = await supabase.rpc('staff_move_student', { p_student: studentId, p_class: classId });
      return { error };
    },
    async deleteStudent(studentId: string) {
      const { error } = await supabase.rpc('staff_delete_student', { p_student: studentId });
      return { error };
    },

    async deleteSchoolTest(testId: string) {
      const { error } = await supabase.from('school_tests').delete().eq('id', testId);
      if (error) console.warn('staffData.deleteSchoolTest error:', error.message);
      return { error };
    },
  };

  // Student-facing reads/writes. RLS limits everything to the signed-in
  // student: only tests assigned to them (and published) are visible.
  const studentData = {
    /** Public pre-registration check: class + school name for a join code, or null. */
    async checkClassCode(code: string): Promise<{ class_name: string; school_name: string } | null> {
      const { data, error } = await supabase.rpc('check_class_code', { p_code: code });
      if (error || !Array.isArray(data) || data.length === 0) return null;
      return data[0] as { class_name: string; school_name: string };
    },

    /** The student renames themselves (RLS: own row only). */
    async updateName(userId: string, name: string) {
      const { error } = await supabase.from('students').update({ name: name.trim() }).eq('id', userId);
      return { error };
    },

    /**
     * Moves the student to another class by its code. Goes through an RPC because a DB trigger
     * forbids changing class/school directly — a code is the only way in.
     */
    async changeClass(code: string) {
      const { data, error } = await supabase.rpc('change_class_by_code', { p_code: code });
      const row = Array.isArray(data) ? (data[0] as { class_name: string; school_name: string } | undefined) : undefined;
      return { data: row ?? null, error };
    },

    async me(userId: string) {
      const { data } = await supabase
        .from('students')
        .select('id, name, class_label, class_id, school_id, schools(name)')
        .eq('id', userId)
        .single();
      return (data ?? null) as unknown as {
        id: string; name: string; class_label: string | null; class_id: string | null; school_id: string | null;
        schools: { name: string } | { name: string }[] | null;
      } | null;
    },

    /** Tests assigned to the student (published only, by RLS), newest first. */
    async tests() {
      const { data } = await supabase
        .from('school_tests')
        .select('id, title, description, level, subject_id, topic_id, created_at, school_test_questions(id)')
        .order('created_at', { ascending: false });
      return ((data ?? []) as unknown as {
        id: string; title: string; description: string | null; level: TestLevel;
        subject_id: string | null; topic_id: string | null; created_at: string;
        school_test_questions: { id: string }[];
      }[]).map((t) => ({ ...t, question_count: t.school_test_questions.length }));
    },

    /** topic_id → title, for labelling tests ("Квадратные уравнения"). */
    async topicTitles() {
      const { data } = await supabase.from('topics').select('id, title');
      return Object.fromEntries(((data ?? []) as { id: string; title: string }[]).map((t) => [t.id, t.title]));
    },

    async results(studentId: string) {
      const { data } = await supabase
        .from('school_test_results')
        .select('test_id, score, total, duration_seconds, created_at, school_tests(title, subject_id, topic_id, level)')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      return (data ?? []) as unknown as {
        test_id: string; score: number; total: number; duration_seconds: number | null; created_at: string;
        school_tests: { title: string; subject_id: string | null; topic_id: string | null; level: TestLevel } | null;
      }[];
    },

    async test(testId: string) {
      const { data } = await supabase
        .from('school_tests')
        .select(
          'id, title, description, level, subject_id, topic_id, ' +
            'school_test_questions(id, order_num, text, explanation, image_url, figure, school_test_options(id, order_num, text, is_correct))',
        )
        .eq('id', testId)
        .single();
      return (data ?? null) as unknown as {
        id: string; title: string; description: string | null; level: TestLevel; subject_id: string | null; topic_id: string | null;
        school_test_questions: {
          id: string; order_num: number; text: string; explanation: string | null; image_url: string | null; figure: unknown | null;
          school_test_options: { id: string; order_num: number; text: string; is_correct: boolean }[];
        }[];
      } | null;
    },

    /** Later attempts. Kept apart from school_test_results so they never reach any analytics. */
    async retakes(studentId: string) {
      const { data } = await supabase
        .from('school_test_retakes')
        .select('test_id, score, total, duration_seconds, created_at')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      return (data ?? []) as { test_id: string; score: number; total: number; duration_seconds: number | null; created_at: string }[];
    },

    /** Only allowed by RLS after the first attempt exists; total/score are re-checked by a DB trigger. */
    async submitRetake(testId: string, studentId: string, score: number, durationSeconds: number) {
      const { error } = await supabase.from('school_test_retakes').insert({
        test_id: testId, student_id: studentId, score, total: 0, duration_seconds: durationSeconds,
      });
      return { error };
    },

    /** First attempt (unique test_id+student_id) — the only one analytics use. total/score are re-checked by a DB trigger. */
    async submitResult(testId: string, studentId: string, score: number, durationSeconds: number) {
      const { error } = await supabase.from('school_test_results').insert({
        test_id: testId, student_id: studentId, score, total: 0, duration_seconds: durationSeconds,
      });
      return { error };
    },
  };

  return {
    supabase, auth, profile, staffData, studentData,
  };
}

export type ApiClient = ReturnType<typeof wrapSupabaseClient>;
