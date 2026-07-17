import { ImageSourcePropType } from 'react-native';
import { SubjectId } from '../types/subject';

export const islandImages: Record<SubjectId, ImageSourcePropType> = {
  math: require('../../assets/math.png'),
  geometry: require('../../assets/geom.png'),
  analogies: require('../../assets/analogy.png'),
  reading: require('../../assets/reading.png'),
  grammar: require('../../assets/grammar.png'),
  // Премиум-острова (открываются после оплаты, показываются снизу обычных).
  math_premium: require('../../assets/math-premium.png'),
  geometry_premium: require('../../assets/geom-premium.png'),
  analogies_premium: require('../../assets/analogy-premium.png'),
  reading_premium: require('../../assets/reading-premium.png'),
  grammar_premium: require('../../assets/grammar-premium.png'),
};
