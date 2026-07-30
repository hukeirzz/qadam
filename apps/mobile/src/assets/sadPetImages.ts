import type { PetType } from '@qadam/types';

// Питомец растерян/расстроен — экран результата теста при низком проценте (<60%).
export const sadPetImages: Record<PetType, any> = {
  bars: require('../../assets/sad-bars.png'),
  cat: require('../../assets/sad-cat.png'),
  dog: require('../../assets/sad-dog.png'),
  eagle: require('../../assets/sad-eagle.png'),
  penguin: require('../../assets/sad-penguin.png'),
};
