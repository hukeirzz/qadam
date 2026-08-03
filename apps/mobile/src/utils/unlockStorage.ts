import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Rank } from '@qadam/business-logic';

// Which ranks the player has explicitly opened (tapped «Открыть»). Rank D is
// always available. Persisted locally — eligibility (enough XP / premium) comes
// from synced state, this only remembers that the unlock celebration was shown.
const KEY = 'unlocked_ranks';

export async function loadUnlockedRanks(): Promise<Rank[]> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    const arr = v ? (JSON.parse(v) as Rank[]) : [];
    return arr.includes('D') ? arr : ['D', ...arr];
  } catch {
    return ['D'];
  }
}

export async function saveUnlockedRanks(ranks: Rank[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(ranks));
  } catch {
    // best-effort — a failed write just re-shows «Открыть» next time
  }
}
