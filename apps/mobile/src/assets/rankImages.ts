import type { ImageSourcePropType } from 'react-native';
import type { Rank } from '@qadam/business-logic';

export const rankImages: Record<Rank, ImageSourcePropType> = {
  D: require('../../assets/drankicon.png'),
  C: require('../../assets/crankicon.png'),
  B: require('../../assets/brankicon.png'),
  A: require('../../assets/arankicon.png'),
  S: require('../../assets/srankicon.png'),
};
