export type OptionKey = 'А' | 'Б' | 'В' | 'Г';

export interface PracticeQuestion {
  id: number;
  question: string;
  options: Record<OptionKey, string>;
  correct: OptionKey;
  explanation: string;
}

export type TopicQuestionsMap = Record<string, PracticeQuestion[]>;
