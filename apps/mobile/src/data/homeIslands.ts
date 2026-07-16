import { islandImages } from '../assets/islandImages';
import { subjectColors } from '../theme/colors';
import { SubjectId } from '../types/subject';
import { premiumSubjects, subjects } from './subjects';

export interface HomeIslandItem {
  id: SubjectId;
  title: string;
  currentSteps: number;
  totalSteps: number;
  imageSrc: (typeof islandImages)[SubjectId];
  progressColor: string;
}

function toIsland(subject: typeof subjects[number]): HomeIslandItem {
  const palette = subjectColors[subject.id];
  return {
    id: subject.id,
    title: subject.title,
    currentSteps: subject.completedSteps,
    totalSteps: subject.totalSteps,
    imageSrc: islandImages[subject.id],
    progressColor: palette.primary,
  };
}

export const homeIslands: HomeIslandItem[] = subjects.map(toIsland);

// Премиум-острова (картинки *-premium.png). Показываются снизу обычных.
export const premiumIslands: HomeIslandItem[] = premiumSubjects.map(toIsland);
