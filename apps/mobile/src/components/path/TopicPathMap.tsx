import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import type { Rank } from '@qadam/business-logic';
import { topicPlatforms } from '../../assets/topicPlatforms';
import { topicNodeImages } from '../../assets/topicNodeImages';
import { BaseSubjectId, isPremiumSubjectId, Topic, SubjectId } from '../../types/subject';
import { PathSnake } from './PathSnake';
import { TopicNode, getPlatformCenter, ROW_HEIGHT, H_PAD } from './TopicNode';

const getSide = (index: number): 'left' | 'right' =>
  index % 2 === 0 ? 'left' : 'right';

interface Props {
  topics: Topic[];
  subjectId: SubjectId;
  rank: Rank;
  topicHearts: Record<string, number>;
  onTopicPress: (topicId: string) => void;
}

export function TopicPathMap({ topics, subjectId, rank, topicHearts, onTopicPress }: Props) {
  const { width } = useWindowDimensions();
  // Премиум-предметы не привязаны к рангам — у них своя общая платформа.
  const platformImage = isPremiumSubjectId(subjectId)
    ? topicPlatforms[subjectId]
    : topicNodeImages[rank][subjectId as BaseSubjectId];
  const mapHeight = topics.length * ROW_HEIGHT + 8;

  const centers = useMemo(
    () => topics.map((_, i) => getPlatformCenter(getSide(i), i, width)),
    [topics, width],
  );

  return (
    <View style={[styles.map, { height: mapHeight }]}>
      <PathSnake points={centers} width={width} height={mapHeight} />

      {topics.map((topic, index) => {
        const side = getSide(index);
        const isEven = (index + 1) % 2 === 0;
        const hearts = topicHearts[topic.id]; // undefined = never completed
        return (
          <View
            key={topic.id}
            style={[
              styles.nodeRow,
              { top: index * ROW_HEIGHT },
              isEven ? styles.nodeRowEven : styles.nodeRowOdd,
            ]}
          >
            <TopicNode
              topic={topic}
              index={index}
              subjectId={subjectId}
              platformImage={platformImage}
              side={side}
              heartsRemaining={hearts}
              onPress={() => onTopicPress(topic.id)}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    position: 'relative',
    width: '100%',
    marginTop: 6,
  },
  nodeRow: {
    position: 'absolute',
    left: H_PAD,
    right: H_PAD,
    zIndex: 2,
  },
  nodeRowOdd: {
    alignItems: 'flex-start',
  },
  nodeRowEven: {
    alignItems: 'flex-end',
  },
});
