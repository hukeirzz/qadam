import { SubjectId } from './subject';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  subjectId: SubjectId;
  text: string;
  options: QuizOption[];
  correctId: string;
  explanation?: string;
}

export type AnswerState = 'idle' | 'correct' | 'wrong';
