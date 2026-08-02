import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PracticeResult {
  correct: number;
  total: number;
  pct: number;
  /** Best `correct` ever reached for this topic — used to only pay out XP for the improvement. */
  best: number;
  /** How many times this topic's practice quiz has been completed. */
  attempts: number;
}

const KEY = (topicId: string) => `practice_result_${topicId}`;

/**
 * Записи, сохранённые до появления счётчика попыток, не содержат `attempts` —
 * раз результат вообще есть, значит попытка была минимум одна.
 */
function normalize(parsed: Partial<PracticeResult>): PracticeResult {
  return {
    correct: parsed.correct ?? 0,
    total: parsed.total ?? 0,
    pct: parsed.pct ?? 0,
    best: parsed.best ?? 0,
    attempts: parsed.attempts ?? 1,
  };
}

/** Returns the previous best `correct` (before this save), so the caller can pay XP for the improvement only. */
export async function savePracticeResult(
  topicId: string,
  correct: number,
  total: number,
): Promise<{ prevBest: number }> {
  const existing = await getPracticeResult(topicId);
  const prevBest = existing?.best ?? 0;
  const result: PracticeResult = {
    correct, total, pct: Math.round((correct / total) * 100),
    best: Math.max(prevBest, correct),
    attempts: (existing?.attempts ?? 0) + 1,
  };
  await AsyncStorage.setItem(KEY(topicId), JSON.stringify(result));
  return { prevBest };
}

export async function getPracticeResult(topicId: string): Promise<PracticeResult | null> {
  const raw = await AsyncStorage.getItem(KEY(topicId));
  return raw ? normalize(JSON.parse(raw)) : null;
}

export async function getPracticeResults(
  topicIds: string[],
): Promise<Record<string, PracticeResult>> {
  const pairs = await AsyncStorage.multiGet(topicIds.map(KEY));
  const result: Record<string, PracticeResult> = {};
  for (const [key, val] of pairs) {
    if (val) {
      const topicId = key.replace('practice_result_', '');
      result[topicId] = normalize(JSON.parse(val));
    }
  }
  return result;
}

/**
 * Результаты практики хранятся в AsyncStorage на устройстве, а не привязаны
 * к userId — при выходе/удалении аккаунта их нужно стереть явно, иначе они
 * «утекают» новому аккаунту, вошедшему на этом же устройстве.
 */
export async function clearAllPracticeResults(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const practiceKeys = keys.filter((k) => k.startsWith('practice_result_'));
  if (practiceKeys.length > 0) await AsyncStorage.multiRemove(practiceKeys);
}
