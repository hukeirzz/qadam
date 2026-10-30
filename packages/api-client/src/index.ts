// Storage-agnostic Supabase access used by
// school-web: each app calls Supabase only through this package,
// never `@supabase/supabase-js` directly, so swapping the backend later
// (or hardening it, e.g. server-side XP validation via a Postgres RPC
// instead of trusting the client) doesn't require touching either app's
// call sites.
//
// Each app creates its own client via createApiClient(), passing its own
// env vars and its own storage adapter (AsyncStorage on mobile,
// @supabase/ssr cookies on web) — this package has no RN/Next.js
// dependency itself.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/** Уровни сложности школьного теста. */
export type TestLevel = 'basic' | 'medium' | 'high';
export const TEST_LEVELS: { id: TestLevel; label: string }[] = [
  { id: 'basic', label: 'Базовый' },
  { id: 'medium', label: 'Средний' },
  { id: 'high', label: 'Высокий' },
];

export interface AuthStorageAdapter {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
}

export interface ApiClientConfig {
  url: string;
  anonKey: string;
  /** Omit on platforms where the Supabase SDK manages storage itself (e.g. SSR web). */
  storage?: AuthStorageAdapter;
  /** Mobile needs manual session persistence/refresh; web (SSR) typically doesn't. */
  persistSession?: boolean;
  autoRefreshToken?: boolean;
  detectSessionInUrl?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  streak: number;
  gems: number;
  xp: number;
  premium_unlocked: boolean;
  last_activity: string | null;
  completed_topics: string[];
  weekly_steps: number[];
  week_start: string | null;
  topic_hearts: Record<string, number>;
  daily_steps: Record<string, number>;
}

export interface QuizQuestionBase {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation?: string;
}

/** Question from the shared topic-scoped bank (`questions`/`options`). */
export interface QuizQuestionDTO extends QuizQuestionBase {
  topicId: string;
  subjectId: string;
}

/**
 * Question from a school-authored test (`school_test_questions`/
 * `school_test_options`) — no topic/subject: a coordinator types these by
 * hand and they aren't tied to the topic tree.
 */
export type SchoolTestQuestionDTO = QuizQuestionBase;

/**
 * Wraps an already-constructed SupabaseClient with the auth/profile/theory/
 * topics/questions namespaces. Use this when the platform needs to build
 * the client itself (e.g. school-web's @supabase/ssr browser/server
 * clients, which manage cookie-based storage internally and aren't
 * compatible with the getItem/setItem AuthStorageAdapter shape below).
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

  const schools = {
    /** For registration's optional school picker. Empty array, not null, when there are no rows yet. */
    async list(): Promise<{ id: string; name: string }[]> {
      const { data, error } = await supabase.from('schools').select('id, name').order('name');
      if (error || !data) return [];
      return data as { id: string; name: string }[];
    },

    /**
     * Fetches a single class row — used once a student is already linked
     * to a school (classes_read's RLS allows reading any class in your
     * own school, so this is a plain select, unlike findClassByCode).
     */
    async fetchClassById(classId: string): Promise<{ id: string; name: string } | null> {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('id', classId)
        .single();

      if (error || !data) return null;
      return data as { id: string; name: string };
    },

    /**
     * Looks up a class by its short join code — `classes.promo_code`
     * (backend_v2_tables) — via the public_find_class_by_code RPC
     * (supabase/migrations/20260729000001): classes_read's RLS requires
     * already being linked to the class's school, which a student
     * entering a code for the first time isn't yet, so a direct table
     * select would find nothing. Returns school_id too, so entering a
     * class code alone can link both school and class in one step.
     */
    async findClassByCode(code: string): Promise<{ id: string; name: string; school_id: string } | null> {
      const { data, error } = await supabase
        .rpc('public_find_class_by_code', { p_code: code.trim() })
        .maybeSingle();

      if (error || !data) return null;
      return data as { id: string; name: string; school_id: string };
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
        .select('id, name, class_id, xp, last_activity')
        .eq('school_id', schoolId)
        .order('xp', { ascending: false });
      return (data ?? []) as {
        id: string; name: string; class_id: string | null; xp: number;
        last_activity: string | null;
      }[];
    },

    async student(id: string) {
      const { data } = await supabase
        .from('students')
        .select('id, name, class_id, xp, last_activity, school_id')
        .eq('id', id).single();
      return data as {
        id: string; name: string; class_id: string | null; xp: number;
        last_activity: string | null; school_id: string | null;
      } | null;
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
        .select('test_id, student_id, score, total, created_at, school_tests!inner(topic_id, school_id)')
        .eq('school_tests.school_id', schoolId);
      return (data ?? []) as unknown as {
        test_id: string; student_id: string; score: number; total: number; created_at: string;
        school_tests: { topic_id: string | null };
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
            'school_test_questions(id, order_num, text, explanation, school_test_options(id, order_num, text, is_correct))',
        )
        .eq('id', testId)
        .single();
      return (data ?? null) as unknown as {
        id: string; title: string; description: string | null; level: TestLevel;
        subject_id: string | null; topic_id: string | null;
        published: boolean; created_at: string;
        school_test_students: { student_id: string }[];
        school_test_questions: {
          id: string; order_num: number; text: string; explanation: string | null;
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
          test_id: testId, order_num: i, text: q.text, explanation: q.explanation ?? null,
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
          'id, title, description, level, subject_id, ' +
            'school_test_questions(id, order_num, text, explanation, school_test_options(id, order_num, text, is_correct))',
        )
        .eq('id', testId)
        .single();
      return (data ?? null) as unknown as {
        id: string; title: string; description: string | null; level: TestLevel; subject_id: string | null;
        school_test_questions: {
          id: string; order_num: number; text: string; explanation: string | null;
          school_test_options: { id: string; order_num: number; text: string; is_correct: boolean }[];
        }[];
      } | null;
    },

    /** One attempt per test (unique test_id+student_id); total/score are re-checked by a DB trigger. */
    async submitResult(testId: string, studentId: string, score: number, durationSeconds: number) {
      const { error } = await supabase.from('school_test_results').insert({
        test_id: testId, student_id: studentId, score, total: 0, duration_seconds: durationSeconds,
      });
      return { error };
    },
  };

  return {
    supabase, auth, profile, schools, staffData, studentData,
  };
}

/**
 * Builds a plain @supabase/supabase-js client from a URL/anon key and an
 * injected getItem/setItem storage adapter (e.g. AsyncStorage on mobile),
 * then wraps it. For SSR web, build the client with @supabase/ssr instead
 * and call wrapSupabaseClient() directly.
 */
export function createApiClient(config: ApiClientConfig) {
  const supabase: SupabaseClient = createClient(config.url, config.anonKey, {
    auth: {
      storage: config.storage,
      autoRefreshToken: config.autoRefreshToken ?? true,
      persistSession: config.persistSession ?? true,
      detectSessionInUrl: config.detectSessionInUrl ?? false,
    },
  });
  return wrapSupabaseClient(supabase);
}

export type ApiClient = ReturnType<typeof wrapSupabaseClient>;
