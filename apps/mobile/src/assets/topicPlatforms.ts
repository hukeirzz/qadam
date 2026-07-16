import { ImageSourcePropType } from 'react-native';
import { SubjectId } from '../types/subject';

/** 3D-платформы узлов пути тем (по предмету). */
export const topicPlatforms: Record<SubjectId, ImageSourcePropType> = {
  math: require('../../assets/math1.png'),
  geometry: require('../../assets/geom1.png'),
  analogies: require('../../assets/analogy1.png'),
  reading: require('../../assets/reading1.png'),
  grammar: require('../../assets/grammar1.png'),
  // Премиум-темы используют общую премиум-платформу пути.
  math_premium: require('../../assets/premium.png'),
  geometry_premium: require('../../assets/premium.png'),
  analogies_premium: require('../../assets/premium.png'),
  reading_premium: require('../../assets/premium.png'),
  grammar_premium: require('../../assets/premium.png'),
};
