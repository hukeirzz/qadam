import { supabase } from '../lib/supabase';
import { Topic, SubjectId } from '../types/subject';

export interface RemoteTopic {
  id: string;
  subject_id: string;
  title: string;
  order_num: number;
  xp_reward: number;
}

// Кэш чтобы не дёргать Supabase при каждом рендере
let cache: Map<SubjectId, Topic[]> | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

export async function fetchTopicsForSubject(subjectId: SubjectId): Promise<Topic[] | null> {
  const now = Date.now();

  if (cache && now - cacheTime < CACHE_TTL) {
    return cache.get(subjectId) ?? null;
  }

  const { data, error } = await supabase
    .from('topics')
    .select('id, subject_id, title, order_num, xp_reward')
    .order('order_num', { ascending: true });

  if (error || !data) {
    return null;
  }

  // Пересобираем кэш
  cache = new Map();
  for (const row of data as RemoteTopic[]) {
    const sid = row.subject_id as SubjectId;
    if (!cache.has(sid)) cache.set(sid, []);
    cache.get(sid)!.push({
      id: row.id,
      title: row.title,
      status: 'locked' as const,
    });
  }
  cacheTime = now;

  return cache.get(subjectId) ?? null;
}

export function invalidateTopicsCache() {
  cache = null;
  cacheTime = 0;
}

/** Total topic count across all subjects from in-memory cache. */
export function getCachedTotalCount(): number {
  if (!cache) return 0;
  let total = 0;
  for (const topics of cache.values()) total += topics.length;
  return total;
}

/** Per-subject topic ID lists from in-memory cache. */
export function getCachedSubjectTopicIds(): Record<string, string[]> {
  if (!cache) return {};
  const result: Record<string, string[]> = {};
  for (const [subjectId, topics] of cache.entries()) {
    result[subjectId] = topics.map((t) => t.id);
  }
  return result;
}

/**
 * Fetches all topics from Supabase (or uses the existing cache if fresh)
 * and warms the in-memory cache. Designed to be called at app startup so
 * subsequent per-subject reads are instant.
 */
export async function loadAllTopicsToCache(): Promise<void> {
  if (cache && Date.now() - cacheTime < CACHE_TTL) return; // already warm

  const { data, error } = await supabase
    .from('topics')
    .select('id, subject_id, title, order_num, xp_reward')
    .order('order_num', { ascending: true });

  if (error || !data) return;

  cache = new Map();
  for (const row of data as RemoteTopic[]) {
    const sid = row.subject_id as SubjectId;
    if (!cache.has(sid)) cache.set(sid, []);
    cache.get(sid)!.push({ id: row.id, title: row.title, status: 'locked' as const });
  }
  cacheTime = Date.now();
}
