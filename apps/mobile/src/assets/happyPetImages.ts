import type { PetType } from '@qadam/types';

// Питомец радуется — экран результата теста при хорошем проценте (>=60%).
export const happyPetImages: Record<PetType, any> = {
  bars: require('../../assets/happy-bars.png'),
  cat: require('../../assets/happy-cat.png'),
  dog: require('../../assets/happy-dog.png'),
  eagle: require('../../assets/happy-eagle.png'),
  penguin: require('../../assets/happy-penguin.png'),
};
