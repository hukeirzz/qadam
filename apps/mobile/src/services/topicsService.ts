import { topics } from '../lib/supabase';
import { Topic, SubjectId } from '../types/subject';

function toTopic(row: { id: string; title: string }): Topic {
  return { id: row.id, title: row.title, status: 'locked' };
}

export async function fetchTopicsForSubject(subjectId: SubjectId): Promise<Topic[] | null> {
  const rows = await topics.fetchForSubject(subjectId);
  return rows ? rows.map(toTopic) : null;
}

/**
 * Fetches all topics from Supabase (or uses the existing cache if fresh)
 * and warms the in-memory cache. Designed to be called at app startup so
 * subsequent per-subject reads are instant.
 */
export const loadAllTopicsToCache = topics.loadAllToCache;
export const invalidateTopicsCache = topics.invalidateCache;

/** Total topic count across all subjects from in-memory cache. */
export const getCachedTotalCount = topics.getCachedTotalCount;

/** Per-subject topic ID lists from in-memory cache. */
export const getCachedSubjectTopicIds = topics.getCachedSubjectTopicIds;
