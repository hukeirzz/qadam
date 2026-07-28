import { ImageSourcePropType } from 'react-native';
import type { PetType } from '@qadam/types';

// Полноэкранный фон экрана результата теста (>=60% верно) — питомец
// пользователя с поднятым большим пальцем на фирменном градиенте.
export const testSuccessBackgrounds: Record<PetType, ImageSourcePropType> = {
  bars: require('../../assets/testpetbars-happy.png'),
  cat: require('../../assets/testpetcat-happy.png'),
  dog: require('../../assets/testpetdog-happy.png'),
  eagle: require('../../assets/testpeteagle-happy.png'),
  penguin: require('../../assets/testpetpenguin-happy.png'),
};

// Тот же фон, но для результата <60% — питомец расстроен.
export const testFailBackgrounds: Record<PetType, ImageSourcePropType> = {
  bars: require('../../assets/testpetbars-sad.png'),
  cat: require('../../assets/testpetcat-sad.png'),
  dog: require('../../assets/testpetdog-sad.png'),
  eagle: require('../../assets/testpeteagle-sad.png'),
  // Имя файла с опечаткой ("teast...") — так он был сохранён в assets.
  penguin: require('../../assets/teastpetpenguin-sad.png'),
};
