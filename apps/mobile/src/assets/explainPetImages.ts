import type { PetType } from '@qadam/types';

// Питомец объясняет ответ — показывается рядом с блоком объяснения в квизе.
export const explainPetImages: Record<PetType, any> = {
  bars: require('../../assets/bars-explain.png'),
  cat: require('../../assets/cat-explain.png'),
  dog: require('../../assets/dog-explain.png'),
  eagle: require('../../assets/eagle-explain.png'),
  penguin: require('../../assets/penguin-explain.png'),
};
