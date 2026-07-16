import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PracticeResult {
  correct: number;
  total: number;
  pct: number;
}

const KEY = (topicId: string) => `practice_result_${topicId}`;

export async function savePracticeResult(
  topicId: string,
  correct: number,
  total: number,
): Promise<void> {
  const result: PracticeResult = { correct, total, pct: Math.round((correct / total) * 100) };
  await AsyncStorage.setItem(KEY(topicId), JSON.stringify(result));
}

export async function getPracticeResult(topicId: string): Promise<PracticeResult | null> {
  const raw = await AsyncStorage.getItem(KEY(topicId));
  return raw ? (JSON.parse(raw) as PracticeResult) : null;
}

export async function getPracticeResults(
  topicIds: string[],
): Promise<Record<string, PracticeResult>> {
  const pairs = await AsyncStorage.multiGet(topicIds.map(KEY));
  const result: Record<string, PracticeResult> = {};
  for (const [key, val] of pairs) {
    if (val) {
      const topicId = key.replace('practice_result_', '');
      result[topicId] = JSON.parse(val) as PracticeResult;
    }
  }
  return result;
}
