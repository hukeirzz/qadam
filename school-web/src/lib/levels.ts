// Difficulty level → Roman numeral. A topic taught at a given level is always shown with it,
// e.g. "Квадратные уравнения III" is the Квадратные уравнения topic at the high level.
export type LevelId = 'basic' | 'medium' | 'high';

export const LEVEL_NUMERAL: Record<LevelId, string> = { basic: 'I', medium: 'II', high: 'III' };

/** "Квадратные уравнения" + 'high' → "Квадратные уравнения III". No level → title unchanged. */
export function topicWithLevel(title: string, level: LevelId | null | undefined): string {
  return level ? `${title} ${LEVEL_NUMERAL[level]}` : title;
}
