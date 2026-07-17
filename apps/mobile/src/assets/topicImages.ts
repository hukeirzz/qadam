import { ImageSourcePropType } from 'react-native';

// Картинки островов для тем математики (базовый уровень)
// Файлы: assets/topics/math_m1.png ... math_m10.png
const mathTopicImages: Record<string, ImageSourcePropType> = {
  m1:  require('../../assets/topics/math_m1.png'),
  m2:  require('../../assets/topics/math_m2.png'),
  m3:  require('../../assets/topics/math_m3.png'),
  m4:  require('../../assets/topics/math_m4.png'),
  m5:  require('../../assets/topics/math_m5.png'),
  m6:  require('../../assets/topics/math_m6.png'),
  m7:  require('../../assets/topics/math_m7.png'),
  m8:  require('../../assets/topics/math_m8.png'),
  m9:  require('../../assets/topics/math_m9.png'),
  m10: require('../../assets/topics/math_m10.png'),
};

export function getTopicImage(topicId: string): ImageSourcePropType | null {
  if (topicId in mathTopicImages) return mathTopicImages[topicId];
  return null;
}
