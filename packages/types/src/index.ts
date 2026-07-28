// Shared TypeScript types for Kadam, consumed by both apps/mobile and
// apps/school-web. These mirror Supabase table rows (snake_case, matching
// Postgres columns 1:1) — presentation/UI-shaped types (e.g. apps/mobile's
// camelCase QuizQuestion, or its icon/status-bearing Subject/Topic) stay
// local to whichever app renders them, since those are UI-layer concerns.

export type Role = 'student' | 'coordinator' | 'admin' | 'director';
export type PetType = 'bars' | 'cat' | 'dog' | 'eagle' | 'penguin';

export interface UserProfileRow {
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
  school_id: string | null;
  class_id: string | null;
  pet_name: string | null;
  pet_type: PetType | null;
  rank: Rank | null;
}

export interface TopicRow {
  id: string;
  subject_id: string;
  title: string;
  order_num: number;
  xp_reward: number;
}

export interface OptionRow {
  id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
}

export interface QuestionRow {
  id: string;
  topic_id: string;
  subject_id: string;
  text: string;
  explanation: string | null;
  xp_reward: number;
}

/** questions joined with its options, as returned by a Supabase embedded select. */
export interface QuestionWithOptionsRow extends QuestionRow {
  options: OptionRow[];
}

export interface TopicTheoryRow {
  id: string;
  topic_id: string;
  subject_id: string;
  title: string;
  content: string;
}

// Stage-1 school-web concepts — see supabase/migrations for the schema.
export interface School {
  id: string;
  name: string;
}

export interface SchoolClass {
  id: string;
  school_id: string;
  name: string;
}

// Entrance-test rank + rating — see supabase/migrations for the schema.
export type Rank = 'D' | 'C' | 'B' | 'A' | 'S';

/** Row shape returned by the `public_rating` view (safe columns only). */
export interface RatingEntry {
  id: string;
  display_name: string;
  xp: number;
  rank: Rank | null;
  streak: number;
  max_streak: number;
  school_id: string | null;
  class_id: string | null;
}
