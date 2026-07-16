import { supabase } from '../lib/supabase';
import { QuizQuestion } from '../types/quiz';
import { SubjectId } from '../types/subject';
import { getRandomQuiz as localFallback } from '../data/quizzes';

interface RemoteQuestion {
  id: string;
  topic_id: string;
  subject_id: string;
  text: string;
  explanation: string | null;
  xp_reward: number;
  options: { id: string; text: string; is_correct: boolean }[];
}

export async function fetchQuizQuestions(
  topicId: string,
  subjectId: SubjectId,
  count = 10,
): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('id, topic_id, subject_id, text, explanation, xp_reward, options(id, text, is_correct)')
    .eq('topic_id', topicId)
    .limit(count * 2); // берём с запасом, потом перемешаем

  if (error || !data || data.length === 0) {
    // Fallback на локальные вопросы если Supabase пустой или нет сети
    return localFallback(topicId, subjectId, count);
  }

  const questions: QuizQuestion[] = (data as RemoteQuestion[]).map((q) => {
    const correctOpt = q.options.find((o) => o.is_correct);
    return {
      id: q.id,
      topicId: q.topic_id,
      subjectId: q.subject_id as SubjectId,
      text: q.text,
      explanation: q.explanation ?? undefined,
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
      correctId: correctOpt?.id ?? q.options[0]?.id ?? '',
    };
  });

  // Перемешать и взять нужное количество
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions.slice(0, count);
}
