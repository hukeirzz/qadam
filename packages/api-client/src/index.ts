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
  QuestionWithOptionsRow,
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

export interface QuizQuestionDTO {
  id: string;
  topicId: string;
  subjectId: string;
  text: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation?: string;
}

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
        .from('user_profiles')
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
     * Role/school/class for a user, from the schools/classes/roles
     * migration (supabase/migrations/20260716000010). Kept separate from
     * load() above so apps/mobile's existing profile load doesn't depend
     * on that migration having been applied to the live project yet.
     */
    async role(userId: string): Promise<{ role: string; school_id: string | null; class_id: string | null } | null> {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role, school_id, class_id')
        .eq('id', userId)
        .single();

      if (error || !data) return null;
      return data as { role: string; school_id: string | null; class_id: string | null };
    },

    async save(
      userId: string,
      updates: {
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
        const { error } = await supabase.from('user_profiles').update(mainUpdates).eq('id', userId);
        if (error) console.warn('profile.save error:', error.message);
      }

      if (topic_hearts !== undefined) {
        await supabase.from('user_profiles').update({ topic_hearts }).eq('id', userId);
      }

      if (daily_steps !== undefined) {
        await supabase.from('user_profiles').update({ daily_steps }).eq('id', userId);
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
    /**
     * Fetches a single school row. Returns `null` on error / no row (e.g.
     * the schools/classes/roles migration 20260716000010 not applied yet),
     * so callers render a fallback rather than crashing.
     */
    async fetchById(schoolId: string): Promise<{ id: string; name: string } | null> {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('id', schoolId)
        .single();

      if (error || !data) return null;
      return data as { id: string; name: string };
    },
  };

  return { supabase, auth, profile, theory, topics, questions, schools };
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
