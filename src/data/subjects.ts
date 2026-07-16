import { BaseSubjectId, Subject, toPremiumSubjectId } from '../types/subject';

const mathTopics = [
  { id: 'm1', title: 'Целые числа', status: 'current' as const },
  { id: 'm2', title: 'Делимость чисел', status: 'locked' as const },
  { id: 'm3', title: 'Обыкновенные дроби', status: 'locked' as const },
  { id: 'm4', title: 'Десятичные дроби', status: 'locked' as const },
  { id: 'm5', title: 'Линейные уравнения', status: 'locked' as const },
  { id: 'm6', title: 'Линейные неравенства', status: 'locked' as const },
  { id: 'm7', title: 'Системы уравнений', status: 'locked' as const },
  { id: 'm8', title: 'Степени', status: 'locked' as const },
  { id: 'm9', title: 'Отношение и пропорция', status: 'locked' as const },
  { id: 'm10', title: 'Процент', status: 'locked' as const },
];

const geometryTopics = [
  { id: 'g1', title: 'Углы', status: 'completed' as const },
  { id: 'g2', title: 'Треугольники', status: 'current' as const },
  { id: 'g3', title: 'Четырёхугольники', status: 'locked' as const },
  { id: 'g4', title: 'Окружность и круг', status: 'locked' as const },
  { id: 'g5', title: 'Вероятность', status: 'locked' as const },
];

const analogiesTopics = [
  { id: 'a1', title: 'Синонимы', status: 'current' as const },
  { id: 'a2', title: 'Степени сравнения', status: 'locked' as const },
  { id: 'a3', title: 'Антонимы', status: 'locked' as const },
  { id: 'a4', title: 'Причина и следствие', status: 'locked' as const },
  { id: 'a5', title: 'Порядок', status: 'locked' as const },
  { id: 'a6', title: 'Часть, состав, разновидность', status: 'locked' as const },
];

const readingTopics = [
  { id: 'r1', title: 'Фрагменты текста и отношения', status: 'current' as const },
  { id: 'r2', title: 'Тема, главная мысль, цель', status: 'locked' as const },
  { id: 'r3', title: 'Детальные вопросы', status: 'locked' as const },
  { id: 'r4', title: 'Подведение итогов', status: 'locked' as const },
];

const grammarTopics = [
  { id: 'gr1', title: 'Лексикология', status: 'current' as const },
  { id: 'gr2', title: 'Орфография', status: 'locked' as const },
  { id: 'gr6', title: 'Морфология. Имя существительное', status: 'locked' as const },
  { id: 'gr8', title: 'Морфология. Имя прилагательное', status: 'locked' as const },
  { id: 'gr11', title: 'Морфология. Имя числительное', status: 'locked' as const },
  { id: 'gr10', title: 'Морфология. Местоимение', status: 'locked' as const },
  { id: 'gr7', title: 'Морфология. Глагол', status: 'locked' as const },
  { id: 'gr9', title: 'Морфология. Причастие', status: 'locked' as const },
  { id: 'gr5', title: 'Пунктуация (простые случаи)', status: 'locked' as const },
];

type SubjectConfig = Omit<Subject, 'completedSteps' | 'totalSteps'>;

const subjectConfigs: SubjectConfig[] = [
  {
    id: 'math',
    number: 1,
    title: 'Математика',
    levelLabel: 'Базовый уровень',
    icon: 'Σ',
    topics: mathTopics,
  },
  {
    id: 'geometry',
    number: 2,
    title: 'Геометрия',
    levelLabel: 'Базовый уровень',
    icon: 'Δ',
    topics: geometryTopics,
  },
  {
    id: 'analogies',
    number: 3,
    title: 'Аналогии',
    shortTitle: 'АДП',
    levelLabel: 'Базовый уровень',
    icon: '⇄',
    topics: analogiesTopics,
  },
  {
    id: 'reading',
    number: 4,
    title: 'Чтение и понимание',
    shortTitle: 'ЧП',
    levelLabel: 'Базовый уровень',
    icon: '📖',
    topics: readingTopics,
  },
  {
    id: 'grammar',
    number: 5,
    title: 'Грамматика',
    levelLabel: 'Базовый уровень',
    icon: 'Aa',
    topics: grammarTopics,
  },
];

// Шаги считаются автоматически из списка тем — добавил/убрал тему,
// и число шагов меняется само, без ручного редактирования.
export const subjects: Subject[] = subjectConfigs.map((config) => ({
  ...config,
  totalSteps: config.topics.length,
  completedSteps: config.topics.filter((t) => t.status === 'completed').length,
}));

// Премиум-острова: те же предметы, но с id `<base>_premium`. Темы приходят из
// Supabase (subject_id = 'math_premium' и т.д.), поэтому здесь topics пустые —
// число шагов подтянется автоматически из remoteTopicIds.
export const premiumSubjects: Subject[] = subjectConfigs.map((config) => ({
  ...config,
  id: toPremiumSubjectId(config.id as BaseSubjectId),
  levelLabel: 'Продвинутый уровень',
  isPremium: true,
  topics: [],
  totalSteps: 0,
  completedSteps: 0,
}));

const allSubjects: Subject[] = [...subjects, ...premiumSubjects];

export function getSubjectById(id: string): Subject | undefined {
  return allSubjects.find((s) => s.id === id);
}

export function getTopicIds(subjectId: string): string[] {
  return getSubjectById(subjectId)?.topics.map((t) => t.id) ?? [];
}
