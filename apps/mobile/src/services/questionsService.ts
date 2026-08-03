import { questions } from '../lib/supabase';
import { QuizQuestion } from '../types/quiz';
import { SubjectId } from '../types/subject';
import { getRandomQuiz as localFallback } from '../data/quizzes';
import { getQuestionsForTopic } from '../data/practiceQuestions';
import { PracticeQuestion, OptionKey } from '../data/practiceQuestions/types';

export async function fetchQuizQuestions(
  topicId: string,
  subjectId: SubjectId,
  count = 10,
): Promise<QuizQuestion[]> {
  const remote = await questions.fetchForTopic(topicId, count);
  // Fallback to local bundled questions if Supabase is empty or unreachable
  if (!remote) return localFallback(topicId, subjectId, count);
  return remote.map((q) => ({ ...q, subjectId: q.subjectId as SubjectId }));
}

const OPTION_KEYS: OptionKey[] = ['А', 'Б', 'В', 'Г'];

/**
 * Practice questions from Supabase, mapped to the local PracticeQuestion shape
 * (А/Б/В/Г). Falls back to the bundled question bank if the DB is empty or
 * unreachable, so practice keeps working offline / before the seed is applied.
 */
export async function fetchPracticeQuestions(
  topicId: string,
  count = 30,
): Promise<PracticeQuestion[]> {
  const remote = await questions.fetchForTopic(topicId, count);
  if (!remote || remote.length === 0) return getQuestionsForTopic(topicId);

  return remote.map((q, qi): PracticeQuestion => {
    const options: Record<OptionKey, string> = { 'А': '', 'Б': '', 'В': '', 'Г': '' };
    let correct: OptionKey = 'А';
    q.options.slice(0, 4).forEach((o, i) => {
      options[OPTION_KEYS[i]] = o.text;
      if (o.id === q.correctId) correct = OPTION_KEYS[i];
    });
    return { id: qi + 1, question: q.text, options, correct, explanation: q.explanation ?? '' };
  });
}
