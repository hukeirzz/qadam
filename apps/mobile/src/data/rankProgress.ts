import type { Rank } from '@qadam/business-logic';

export const RANK_ORDER: Rank[] = ['D', 'C', 'B', 'A', 'S'];

// Презентационная шкала для карточки «Твой ранг» на экране Практики — сколько
// суммарного XP нужно, чтобы держать/открыть каждый ранг. Отдельно от
// calcRank() из business-logic (тот определяет ранг по входному тесту) —
// здесь просто наглядный прогресс-бар по общему XP игрока.
export const RANK_XP_THRESHOLDS: Record<Rank, number> = {
  D: 0,
  C: 600,
  B: 1200,
  A: 2000,
  S: 3200,
};

export interface RankXpProgress {
  required: number;
  achieved: boolean;
  remaining: number;
  progressPct: number;
}

export function getRankXpProgress(rank: Rank, xp: number): RankXpProgress {
  const required = RANK_XP_THRESHOLDS[rank];
  const achieved = xp >= required;
  return {
    required,
    achieved,
    remaining: Math.max(0, required - xp),
    progressPct: required > 0 ? Math.min(100, (xp / required) * 100) : 100,
  };
}
