import type { Rank } from '@qadam/business-logic';
import { islandImages } from '../assets/islandImages';
import { rankIslandImages } from '../assets/rankIslandImages';
import { subjectColors } from '../theme/colors';
import { BaseSubjectId, SubjectId } from '../types/subject';
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

// Острова, оформленные под конкретный ранг (D/C/B/A/S) — та же линейка
// предметов, что и homeIslands, но с картинкой острова своего ранга.
export function getIslandsForRank(rank: Rank): HomeIslandItem[] {
  return subjects.map((subject) => {
    const palette = subjectColors[subject.id];
    return {
      id: subject.id,
      title: subject.title,
      currentSteps: subject.completedSteps,
      totalSteps: subject.totalSteps,
      imageSrc: rankIslandImages[rank][subject.id as BaseSubjectId],
      progressColor: palette.primary,
    };
  });
}
