// Типы заданий ОРТ по математике. Ответы на «сравнение» всегда одни и те же — их не пишет ни учитель, ни ИИ.
import type { TestKind } from '@qadam/api-client';

export const KIND_LABELS: Record<TestKind, string> = {
  choice: 'Вопросы с вариантами',
  compare: 'Сравнение величин',
};

export const COMPARE_OPTIONS = [
  'Величина в колонке А больше',
  'Величина в колонке Б больше',
  'Величины равны',
  'По имеющейся информации определить нельзя',
];

export const LETTERS = ['А', 'Б', 'В', 'Г', 'Д'];

/** Тип заданий выбирается только в математике и геометрии; остальные разделы — всегда с вариантами. */
export const hasKinds = (subjectId: string) => subjectId === 'math' || subjectId === 'geometry';

/** Вариантов ответа: в части II ОРТ по математике — пять, в остальных разделах — четыре. */
export const optionCount = (subjectId: string, kind: TestKind) => (kind === 'compare' ? 4 : hasKinds(subjectId) ? 5 : 4);
