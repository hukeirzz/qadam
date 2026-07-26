import React from 'react';
import { StyleSheet, View } from 'react-native';
import { homeIslands, HomeIslandItem } from '../../data/homeIslands';
import { getTopicIds } from '../../data/subjects';
import { SubjectId } from '../../types/subject';
import { IslandCard } from './IslandCard';
import { useAppStore } from '../../store/useAppStore';

interface Props {
  onIslandPress: (id: SubjectId) => void;
  /** По умолчанию — обычные острова (D-ранг). Передай свой список, чтобы
   * показать острова другого ранга (см. getIslandsForRank). */
  islands?: HomeIslandItem[];
}

export function IslandGrid({ onIslandPress, islands = homeIslands }: Props) {
  const completedTopics = useAppStore((s) => s.completedTopics);
  const remoteTopicIds  = useAppStore((s) => s.remoteTopicIds);
  const lastIndex = islands.length - 1;

  return (
    <View style={styles.grid}>
      {islands.map((island, index) => {
        // Prefer remote IDs (from Supabase), fall back to local static list
        const topicIds = remoteTopicIds[island.id]?.length
          ? remoteTopicIds[island.id]
          : getTopicIds(island.id);

        const currentSteps = completedTopics.filter((id) => topicIds.includes(id)).length;
        const totalSteps   = topicIds.length || island.totalSteps;

        return (
          <IslandCard
            key={island.id}
            title={island.title}
            currentSteps={currentSteps}
            totalSteps={totalSteps}
            imageSrc={island.imageSrc}
            progressColor={island.progressColor}
            index={index}
            onPress={() => onIslandPress(island.id)}
            style={index === lastIndex && islands.length % 2 !== 0
              ? styles.lastCard : undefined}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  lastCard: {
    alignSelf: 'center',
  },
});
