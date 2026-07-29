import { ImageSourcePropType } from 'react-native';
import type { Rank } from '@qadam/business-logic';
import { BaseSubjectId } from '../types/subject';

// «Мини-острова» тем внутри острова предмета (TopicNode) — по рангу и
// предмету. Имена файлов: <rank>ranktopic-<subject>.png (у грамматики в
// названии файла опечатка "grammer", как и у остальных ассетов проекта).
export const topicNodeImages: Record<Rank, Record<BaseSubjectId, ImageSourcePropType>> = {
  D: {
    math: require('../../assets/dranktopic-math.png'),
    geometry: require('../../assets/dranktopic-geometry.png'),
    analogies: require('../../assets/dranktopic-analogy.png'),
    reading: require('../../assets/dranktopic-reading.png'),
    grammar: require('../../assets/dranktopic-grammer.png'),
  },
  C: {
    math: require('../../assets/cranktopic-math.png'),
    geometry: require('../../assets/cranktopic-geometry.png'),
    analogies: require('../../assets/cranktopic-analogy.png'),
    reading: require('../../assets/cranktopic-reading.png'),
    grammar: require('../../assets/cranktopic-grammer.png'),
  },
  B: {
    math: require('../../assets/branktopic-math.png'),
    geometry: require('../../assets/branktopic-geometry.png'),
    analogies: require('../../assets/branktopic-analogy.png'),
    reading: require('../../assets/branktopic-reading.png'),
    grammar: require('../../assets/branktopic-grammer.png'),
  },
  A: {
    math: require('../../assets/aranktopic-math.png'),
    geometry: require('../../assets/aranktopic-geometry.png'),
    analogies: require('../../assets/aranktopic-analogy.png'),
    reading: require('../../assets/aranktopic-reading.png'),
    grammar: require('../../assets/aranktopic-grammer.png'),
  },
  S: {
    math: require('../../assets/sranktopic-math.png'),
    geometry: require('../../assets/sranktopic-geometry.png'),
    analogies: require('../../assets/sranktopic-analogy.png'),
    reading: require('../../assets/sranktopic-reading.png'),
    grammar: require('../../assets/sranktopic-grammer.png'),
  },
};
