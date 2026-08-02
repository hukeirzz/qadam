/** Разбивает текст объяснения на шаги по переносам строк, чтобы длинные
 * объяснения можно было листать по одному шагу за раз. */
export function splitExplanationSteps(explanation: string | undefined | null): string[] {
  if (!explanation) return [];
  return explanation
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}
