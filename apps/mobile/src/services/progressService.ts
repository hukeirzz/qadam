import { supabase } from '../lib/supabase';

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

export async function loadUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, name, streak, gems, xp, premium_unlocked, last_activity, completed_topics, weekly_steps, week_start, topic_hearts, daily_steps')
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
}

export async function saveProfileProgress(
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
    const { error } = await supabase
      .from('user_profiles')
      .update(mainUpdates)
      .eq('id', userId);
    if (error) console.warn('saveProfileProgress error:', error.message);
  }

  if (topic_hearts !== undefined) {
    await supabase
      .from('user_profiles')
      .update({ topic_hearts })
      .eq('id', userId);
  }

  if (daily_steps !== undefined) {
    await supabase
      .from('user_profiles')
      .update({ daily_steps })
      .eq('id', userId);
  }
}
