import { ImageSourcePropType } from 'react-native';
import type { Rank } from '@qadam/business-logic';
import { BaseSubjectId } from '../types/subject';

// Картинки островов для каждого ранга (D/C/B/A/S) по предметам.
// Имена файлов заданы дизайном: <rank>rankisland-<subject>.png
// (у грамматики в названии файла опечатка "grammer", а не "grammar").
export const rankIslandImages: Record<Rank, Record<BaseSubjectId, ImageSourcePropType>> = {
  D: {
    math: require('../../assets/drankisland-math.png'),
    geometry: require('../../assets/drankisland-geometry.png'),
    analogies: require('../../assets/drankisland-analogy.png'),
    reading: require('../../assets/drankisland-reading.png'),
    grammar: require('../../assets/drankisland-grammer.png'),
  },
  C: {
    math: require('../../assets/crankisland-math.png'),
    geometry: require('../../assets/crankisland-geometry.png'),
    analogies: require('../../assets/crankisland-analogy.png'),
    reading: require('../../assets/crankisland-reading.png'),
    grammar: require('../../assets/crankisland-grammer.png'),
  },
  B: {
    math: require('../../assets/brankisland-math.png'),
    geometry: require('../../assets/brankisland-geometry.png'),
    analogies: require('../../assets/brankisland-analogy.png'),
    reading: require('../../assets/brankisland-reading.png'),
    grammar: require('../../assets/brankisland-grammer.png'),
  },
  A: {
    math: require('../../assets/arankisland-math.png'),
    geometry: require('../../assets/arankisland-geometry.png'),
    analogies: require('../../assets/arankisland-analogy.png'),
    reading: require('../../assets/arankisland-reading.png'),
    grammar: require('../../assets/arankisland-grammer.png'),
  },
  S: {
    math: require('../../assets/srankisland-math.png'),
    geometry: require('../../assets/srankisland-geometry.png'),
    analogies: require('../../assets/srankisland-analogy.png'),
    reading: require('../../assets/srankisland-reading.png'),
    grammar: require('../../assets/srankisland-grammer.png'),
  },
};

// Мягкий акцентный цвет для каждого ранга — используется в свечении
// карточек и шапке блока.
export const rankAccentColors: Record<Rank, string> = {
  D: '#C9793D',
  C: '#9CA3AF',
  B: '#A855F7',
  A: '#E23B3B',
  S: '#FFD166',
};
