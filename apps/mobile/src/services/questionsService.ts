import { questions } from '../lib/supabase';
import { QuizQuestion } from '../types/quiz';
import { SubjectId } from '../types/subject';
import { getRandomQuiz as localFallback } from '../data/quizzes';

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
