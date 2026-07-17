export type BaseSubjectId =
  | 'math'
  | 'geometry'
  | 'analogies'
  | 'reading'
  | 'grammar';

export type PremiumSubjectId = `${BaseSubjectId}_premium`;

export type SubjectId = BaseSubjectId | PremiumSubjectId;

export const BASE_SUBJECT_IDS: BaseSubjectId[] = [
  'math',
  'geometry',
  'analogies',
  'reading',
  'grammar',
];

/** true для премиум-предметов (например, 'math_premium'). */
export function isPremiumSubjectId(id: string): id is PremiumSubjectId {
  return id.endsWith('_premium');
}

/** 'math_premium' -> 'math'. Базовый id остаётся как есть. */
export function toBaseSubjectId(id: SubjectId): BaseSubjectId {
  return id.replace('_premium', '') as BaseSubjectId;
}

/** 'math' -> 'math_premium'. */
export function toPremiumSubjectId(id: BaseSubjectId): PremiumSubjectId {
  return `${id}_premium`;
}

export type TopicStatus = 'completed' | 'current' | 'locked';

export interface Topic {
  id: string;
  title: string;
  status: TopicStatus;
  stars?: number;
}

export interface Subject {
  id: SubjectId;
  number: number;
  title: string;
  shortTitle?: string;
  levelLabel: string;
  completedSteps: number;
  totalSteps: number;
  icon: string;
  topics: Topic[];
  isPremium?: boolean;
}
