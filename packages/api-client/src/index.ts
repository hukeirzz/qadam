// Storage-agnostic Supabase access shared by apps/mobile and
// apps/school-web: each app calls Supabase only through this package,
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
import type {
  OptionRow,
  PetType,
  QuestionWithOptionsRow,
  Rank,
  RatingEntry,
  SchoolTestQuestionWithOptionsRow,
  TopicRow,
  TopicTheoryRow,
} from '@qadam/types';

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
 * the client itself (e.g. apps/school-web's @supabase/ssr browser/server
 * clients, which manage cookie-based storage internally and aren't
 * compatible with the getItem/setItem AuthStorageAdapter shape below).
 * apps/mobile uses createApiClient() instead, which builds the client too.
 */
export function wrapSupabaseClient(supabase: SupabaseClient) {
  const auth = {
    async signUp(email: string, password: string, name: string) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
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

    /**
     * Delete the account. Auth users can't be deleted from the client
     * directly, so this calls the `delete_account` RPC (SECURITY DEFINER).
     * Signs out locally on success.
     */
    async deleteAccount() {
      const { error } = await supabase.rpc('delete_account');
      if (!error) await supabase.auth.signOut();
      return { error };
    },

    async getSession() {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  };

  const profile = {
    async load(userId: string): Promise<UserProfile | null> {
      const { data, error } = await supabase
        .from('students')
        .select(
          'id, name, streak, gems, xp, premium_unlocked, last_activity, completed_topics, weekly_steps, week_start, topic_hearts, daily_steps',
        )
        .eq('id', userId)
        .single();

      if (error || !data) return null;

      const row = data as any;
      return {
        id: row.id,
        name: row.name ?? 'Игрок',
        streak: row.streak ?? 0,
        gems: row.gems ?? 0,
        xp: row.xp ?? 0,
        premium_unlocked: row.premium_unlocked ?? false,
        last_activity: row.last_activity ?? null,
        completed_topics: row.completed_topics ?? [],
        weekly_steps: row.weekly_steps ?? [0, 0, 0, 0, 0, 0, 0],
        week_start: row.week_start ?? null,
        topic_hearts: row.topic_hearts ?? {},
        daily_steps: row.daily_steps ?? {},
      };
    },

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

    /**
     * Pet name/type, entrance-test rank, and school/class linkage. Kept
     * separate from load() above for the same reason role() is — apps/
     * mobile's existing profile load doesn't depend on this data.
     */
    async onboardingInfo(userId: string): Promise<{
      pet_name: string | null;
      pet_type: PetType | null;
      rank: Rank | null;
      school_id: string | null;
      class_id: string | null;
      class_label: string | null;
    } | null> {
      const { data, error } = await supabase
        .from('students')
        .select('pet_name, pet_type, rank, school_id, class_id, class_label')
        .eq('id', userId)
        .single();

      if (error || !data) return null;
      return data as {
        pet_name: string | null;
        pet_type: PetType | null;
        rank: Rank | null;
        school_id: string | null;
        class_id: string | null;
        class_label: string | null;
      };
    },

    /**
     * A student's average ОРТ score across all mock exams their school's
     * coordinator has entered (mock_results.total, see results-editor.tsx
     * in apps/school-web) — null/0 count for students not linked to a
     * partner school, or whose coordinator hasn't entered scores yet.
     */
    async averageMockScore(studentId: string): Promise<{ average: number | null; count: number }> {
      const { data, error } = await supabase
        .from('mock_results')
        .select('total')
        .eq('student_id', studentId);

      if (error || !data || data.length === 0) return { average: null, count: 0 };
      const rows = data as { total: number }[];
      const average = Math.round(rows.reduce((sum, r) => sum + r.total, 0) / rows.length);
      return { average, count: rows.length };
    },

    /**
     * Adds this quiz attempt's correct/answered counts to the student's
     * running per-topic accuracy (student_topic_stats — read by school-web's
     * "Точность по разделам"/heatmap). Goes through the record_topic_stat
     * RPC (supabase/migrations/20260729000005) so the increment is atomic
     * instead of a client-side read-then-write.
     */
    async recordTopicStat(topicId: string, subjectId: string, correct: number, answered: number) {
      const { error } = await supabase.rpc('record_topic_stat', {
        p_topic_id: topicId, p_subject_id: subjectId, p_correct: correct, p_answered: answered,
      });
      if (error) console.warn('profile.recordTopicStat error:', error.message);
      return { error };
    },

    async saveOnboarding(
      userId: string,
      updates: {
        pet_name?: string;
        pet_type?: PetType;
        school_id?: string | null;
        class_id?: string | null;
        class_label?: string;
        data_consent?: boolean;
      },
    ) {
      const { error } = await supabase.from('students').update(updates).eq('id', userId);
      if (error) console.warn('profile.saveOnboarding error:', error.message);
      return { error };
    },

    async save(
      userId: string,
      updates: {
        name?: string;
        xp?: number;
        gems?: number;
        streak?: number;
        last_activity?: string;
        completed_topics?: string[];
        weekly_steps?: number[];
        week_start?: string;
        topic_hearts?: Record<string, number>;
        daily_steps?: Record<string, number>;
        premium_unlocked?: boolean;
      },
    ) {
      // Isolate jsonb columns that may not exist yet — keep them from blocking critical saves
      const { topic_hearts, daily_steps, ...mainUpdates } = updates;

      if (Object.keys(mainUpdates).length > 0) {
        const { error } = await supabase.from('students').update(mainUpdates).eq('id', userId);
        if (error) console.warn('profile.save error:', error.message);
      }

      if (topic_hearts !== undefined) {
        await supabase.from('students').update({ topic_hearts }).eq('id', userId);
      }

      if (daily_steps !== undefined) {
        await supabase.from('students').update({ daily_steps }).eq('id', userId);
      }
    },
  };

  const theory = {
    async fetchForTopic(topicId: string): Promise<TopicTheoryRow | null> {
      const { data, error } = await supabase
        .from('topic_theories')
        .select('id, topic_id, subject_id, title, content')
        .eq('topic_id', topicId)
        .single();

      if (error || !data) return null;
      return data as TopicTheoryRow;
    },
  };

  // In-memory cache shared across calls on this client instance — not
  // RN-specific (plain module closure), so it moved here as-is.
  let topicsCache: Map<string, TopicRow[]> | null = null;
  let topicsCacheTime = 0;
  const TOPICS_CACHE_TTL = 5 * 60 * 1000; // 5 минут

  async function refreshTopicsCache(): Promise<void> {
    const { data, error } = await supabase
      .from('topics')
      .select('id, subject_id, title, order_num, xp_reward')
      .order('order_num', { ascending: true });

    if (error || !data) return;

    topicsCache = new Map();
    for (const row of data as TopicRow[]) {
      if (!topicsCache.has(row.subject_id)) topicsCache.set(row.subject_id, []);
      topicsCache.get(row.subject_id)!.push(row);
    }
    topicsCacheTime = Date.now();
  }

  const topics = {
    async fetchForSubject(subjectId: string): Promise<TopicRow[] | null> {
      const now = Date.now();
      if (topicsCache && now - topicsCacheTime < TOPICS_CACHE_TTL) {
        return topicsCache.get(subjectId) ?? null;
      }
      await refreshTopicsCache();
      return topicsCache?.get(subjectId) ?? null;
    },

    /**
     * Rank-aware topics for one subject (selects the `rank` column, uncached).
     * Returns null if the column doesn't exist yet (seed migration not applied)
     * — callers then simply show no per-rank topics, without breaking the main
     * (rank-less) topics cache used by the island flow.
     */
    async fetchWithRank(subjectId: string): Promise<TopicRow[] | null> {
      const { data, error } = await supabase
        .from('topics')
        .select('id, subject_id, title, order_num, xp_reward, rank')
        .eq('subject_id', subjectId)
        .order('order_num', { ascending: true });
      if (error || !data) return null;
      return data as TopicRow[];
    },

    /** Warms the in-memory cache; call once at app startup so subsequent per-subject reads are instant. */
    async loadAllToCache(): Promise<void> {
      if (topicsCache && Date.now() - topicsCacheTime < TOPICS_CACHE_TTL) return; // already warm
      await refreshTopicsCache();
    },

    invalidateCache() {
      topicsCache = null;
      topicsCacheTime = 0;
    },

    getCachedTotalCount(): number {
      if (!topicsCache) return 0;
      let total = 0;
      for (const list of topicsCache.values()) total += list.length;
      return total;
    },

    getCachedSubjectTopicIds(): Record<string, string[]> {
      if (!topicsCache) return {};
      const result: Record<string, string[]> = {};
      for (const [subjectId, list] of topicsCache.entries()) {
        result[subjectId] = list.map((t) => t.id);
      }
      return result;
    },
  };

  const questions = {
    /**
     * Fetches up to `count` shuffled questions for a topic. Returns `null`
     * (not an empty array) when Supabase has no rows or errors, so the
     * caller can fall back to its own bundled question data — this package
     * doesn't ship any fallback content itself.
     */
    async fetchForTopic(topicId: string, count = 10): Promise<QuizQuestionDTO[] | null> {
      const { data, error } = await supabase
        .from('questions')
        .select('id, topic_id, subject_id, text, explanation, xp_reward, options(id, text, is_correct)')
        .eq('topic_id', topicId)
        .limit(count * 2); // берём с запасом, потом перемешаем

      if (error || !data || data.length === 0) return null;

      const rows = data as unknown as QuestionWithOptionsRow[];
      const shaped: QuizQuestionDTO[] = rows.map((q) => {
        const correctOpt = q.options.find((o: OptionRow) => o.is_correct);
        return {
          id: q.id,
          topicId: q.topic_id,
          subjectId: q.subject_id,
          text: q.text,
          explanation: q.explanation ?? undefined,
          options: q.options.map((o: OptionRow) => ({ id: o.id, text: o.text })),
          correctId: correctOpt?.id ?? q.options[0]?.id ?? '',
        };
      });

      for (let i = shaped.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shaped[i], shaped[j]] = [shaped[j], shaped[i]];
      }
      return shaped.slice(0, count);
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

  const entranceTest = {
    /**
     * Samples questions evenly across the 5 base subjects (not fully
     * random) so no subject is ever entirely absent by chance, then
     * shuffles — same shape/shuffle convention as questions.fetchForTopic.
     * Reuses the existing questions/options content, no dedicated
     * entrance-test question bank.
     */
    async fetchQuestions(count = 20): Promise<QuizQuestionDTO[] | null> {
      const perSubject = Math.max(1, Math.round(count / BASE_SUBJECTS.length));
      const results = await Promise.all(
        BASE_SUBJECTS.map((subjectId) =>
          supabase
            .from('questions')
            .select('id, topic_id, subject_id, text, explanation, xp_reward, options(id, text, is_correct)')
            .eq('subject_id', subjectId)
            .limit(perSubject * 2),
        ),
      );

      const rows = results.flatMap((r) => (r.data ?? []) as unknown as QuestionWithOptionsRow[]);
      if (rows.length === 0) return null;

      const shaped: QuizQuestionDTO[] = rows.map((q) => {
        const correctOpt = q.options.find((o: OptionRow) => o.is_correct);
        return {
          id: q.id,
          topicId: q.topic_id,
          subjectId: q.subject_id,
          text: q.text,
          explanation: q.explanation ?? undefined,
          options: q.options.map((o: OptionRow) => ({ id: o.id, text: o.text })),
          correctId: correctOpt?.id ?? q.options[0]?.id ?? '',
        };
      });

      for (let i = shaped.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shaped[i], shaped[j]] = [shaped[j], shaped[i]];
      }
      return shaped.slice(0, count);
    },

    async submitResult(userId: string, rank: Rank) {
      const { error } = await supabase.from('students').update({ rank }).eq('id', userId);
      if (error) console.warn('entranceTest.submitResult error:', error.message);
      return { error };
    },
  };

  // Тесты партнёрской школы (supabase/migrations/20260729000003). Никакой
  // фильтрации по школе/классу/рангу здесь нет намеренно: всё решает RLS
  // (can_student_see_school_test) — приложению достаточно спросить «что
  // мне видно».
  const schoolTests = {
    /** Tests visible to the signed-in student, with their own attempt if any. */
    async list(): Promise<{
      id: string; title: string; description: string | null; subjectId: string | null;
      targetRank: Rank | null; questionCount: number;
      myScore: number | null; myTotal: number | null;
    }[]> {
      const { data, error } = await supabase
        .from('school_tests')
        .select(
          'id, title, description, subject_id, target_rank, created_at, ' +
            'school_test_questions(id), school_test_results(score, total)',
        )
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return (data as any[]).map((t) => {
        const mine = t.school_test_results?.[0]; // RLS отдаёт только свою строку
        return {
          id: t.id, title: t.title, description: t.description ?? null,
          subjectId: t.subject_id ?? null, targetRank: t.target_rank ?? null,
          questionCount: t.school_test_questions?.length ?? 0,
          myScore: mine?.score ?? null, myTotal: mine?.total ?? null,
        };
      });
    },

    /**
     * Full questions for one test, shaped like the other quiz fetchers.
     * Returns null (not []) on error/empty so the screen can show its own
     * fallback — same convention as questions.fetchForTopic. Not shuffled:
     * a coordinator's manual ordering is intentional (unlike the sampled
     * practice/entrance pools).
     */
    async fetchQuestions(testId: string): Promise<SchoolTestQuestionDTO[] | null> {
      const { data, error } = await supabase
        .from('school_test_questions')
        .select('id, order_num, text, explanation, school_test_options(id, order_num, text, is_correct)')
        .eq('test_id', testId)
        .order('order_num', { ascending: true });
      if (error || !data || data.length === 0) return null;

      return (data as unknown as SchoolTestQuestionWithOptionsRow[]).map((q) => {
        const opts = [...q.school_test_options].sort((a, b) => a.order_num - b.order_num);
        const correct = opts.find((o) => o.is_correct);
        return {
          id: q.id,
          text: q.text,
          explanation: q.explanation ?? undefined,
          options: opts.map((o) => ({ id: o.id, text: o.text })),
          correctId: correct?.id ?? opts[0]?.id ?? '',
        };
      });
    },

    /**
     * One attempt per student — unique(test_id, student_id) + INSERT-only
     * RLS, so a repeat submit fails with 23505 rather than overwriting the
     * score. The DB trigger recomputes `total`, so it's sent only for
     * readability. `durationSeconds` is wall-clock time from when the
     * student started the test to submit — tracked silently (no in-app
     * timer UI), surfaced only to the coordinator in results.
     */
    async submitResult(
      testId: string,
      studentId: string,
      score: number,
      total: number,
      durationSeconds?: number,
    ) {
      const { error } = await supabase
        .from('school_test_results')
        .insert({ test_id: testId, student_id: studentId, score, total, duration_seconds: durationSeconds ?? null });
      if (error) console.warn('schoolTests.submitResult error:', error.message);
      return { error, alreadyTaken: error?.code === '23505' };
    },
  };

  const rating = {
    async global(limit = 50): Promise<RatingEntry[] | null> {
      const { data, error } = await supabase
        .from('public_rating')
        .select('*')
        .order('xp', { ascending: false })
        .limit(limit);
      if (error || !data) return null;
      return data as RatingEntry[];
    },

    async school(schoolId: string, limit = 50): Promise<RatingEntry[] | null> {
      const { data, error } = await supabase
        .from('public_rating')
        .select('*')
        .eq('school_id', schoolId)
        .order('xp', { ascending: false })
        .limit(limit);
      if (error || !data) return null;
      return data as RatingEntry[];
    },

    async classRank(classId: string, limit = 50): Promise<RatingEntry[] | null> {
      const { data, error } = await supabase
        .from('public_rating')
        .select('*')
        .eq('class_id', classId)
        .order('xp', { ascending: false })
        .limit(limit);
      if (error || !data) return null;
      return data as RatingEntry[];
    },
  };

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
        .select('id, name, class_id, xp, rank, premium_source, streak, max_streak, last_activity')
        .eq('school_id', schoolId)
        .order('xp', { ascending: false });
      return (data ?? []) as {
        id: string; name: string; class_id: string | null; xp: number;
        rank: string; premium_source: string; streak: number; max_streak: number; last_activity: string | null;
      }[];
    },

    async student(id: string) {
      const { data } = await supabase
        .from('students')
        .select('id, name, class_id, xp, rank, premium_source, premium_unlocked, streak, max_streak, last_activity, school_id')
        .eq('id', id).single();
      return data as {
        id: string; name: string; class_id: string | null; xp: number; rank: string;
        premium_source: string; premium_unlocked: boolean; streak: number; max_streak: number;
        last_activity: string | null; school_id: string | null;
      } | null;
    },

    async studentTopicStats(studentId: string) {
      const { data } = await supabase
        .from('student_topic_stats')
        .select('topic_id, subject_id, correct_first, answered')
        .eq('student_id', studentId);
      return (data ?? []) as { topic_id: string; subject_id: string; correct_first: number; answered: number }[];
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

    async topicStats(schoolId: string) {
      const { data } = await supabase
        .from('student_topic_stats')
        .select('student_id, topic_id, subject_id, correct_first, answered, students!inner(school_id)')
        .eq('students.school_id', schoolId);
      return (data ?? []) as unknown as {
        student_id: string; topic_id: string; subject_id: string; correct_first: number; answered: number;
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
          'id, title, description, target_rank, subject_id, topic_id, published, created_at, ' +
            'school_test_students(student_id), school_test_questions(id), school_test_results(id)',
        )
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });
      return (data ?? []) as unknown as {
        id: string; title: string; description: string | null;
        target_rank: string | null; subject_id: string | null; topic_id: string | null;
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
          'id, title, description, target_rank, subject_id, topic_id, published, created_at, ' +
            'school_test_students(student_id), ' +
            'school_test_questions(id, order_num, text, explanation, school_test_options(id, order_num, text, is_correct))',
        )
        .eq('id', testId)
        .single();
      return (data ?? null) as unknown as {
        id: string; title: string; description: string | null;
        target_rank: string | null; subject_id: string | null; topic_id: string | null;
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
        targetRank: string | null; // null = любой ранг — информационное поле, не фильтр видимости
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
          target_rank: test.targetRank, subject_id: test.subjectId, topic_id: test.topicId ?? null,
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

  return {
    supabase, auth, profile, theory, topics, questions, schools,
    entranceTest, schoolTests, rating, staffData,
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
