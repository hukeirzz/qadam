/**
 * Star rating for a completed topic/practice run, by how much of it was solved:
 *   • 3 stars — everything correct, or at most 2 mistakes
 *   • 2 stars — at least 2/3 of the questions correct
 *   • 1 star  — at least 1/3 of the questions correct
 *   • 0 stars — less than 1/3 correct
 */
export function computeStars(correct: number, total: number): number {
  if (total <= 0) return 0;
  const mistakes = total - correct;
  if (mistakes <= 2) return 3;
  if (correct * 3 >= total * 2) return 2;
  if (correct * 3 >= total) return 1;
  return 0;
}
