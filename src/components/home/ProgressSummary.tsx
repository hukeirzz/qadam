import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useAppStore } from '../../store/useAppStore';
import { homeIslands, premiumIslands } from '../../data/homeIslands';
import { getTopicIds } from '../../data/subjects';
import { colors } from '../../theme/colors';

const SIZE = 76;
const STROKE = 6;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function CircularProgress({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const dash = (clamped / 100) * CIRC;

  return (
    <View style={styles.ringWrap}>
      <Svg width={SIZE} height={SIZE}>
        {/* Track */}
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          stroke={colors.purple}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${dash} ${CIRC}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringPercent}>{clamped}%</Text>
      </View>
    </View>
  );
}

export function ProgressSummary() {
  const completedTopics = useAppStore((s) => s.completedTopics);
  const remoteTopicIds = useAppStore((s) => s.remoteTopicIds);

  // Пройденные шаги берём из реально сохранённого прогресса (completedTopics),
  // а не из пересечения с темами — иначе при входе, пока remoteTopicIds ещё не
  // загружены, число «сбрасывалось» к начальному.
  // НО исключаем темы премиум-островов — у них свой отдельный прогресс.
  const premiumTopicIds = new Set<string>();
  for (const island of premiumIslands) {
    (remoteTopicIds[island.id] ?? []).forEach((id) => premiumTopicIds.add(id));
  }
  const completedSteps = completedTopics.filter((id) => !premiumTopicIds.has(id)).length;

  // Всего шагов считаем динамически из тем (remote, иначе статичный список),
  // чтобы число менялось автоматически при добавлении новых тем.
  let totalSteps = 0;
  for (const island of homeIslands) {
    const topicIds = remoteTopicIds[island.id]?.length
      ? remoteTopicIds[island.id]
      : getTopicIds(island.id);
    totalSteps += topicIds.length || island.totalSteps;
  }
  if (totalSteps < completedSteps) totalSteps = completedSteps;

  const overallProgress = totalSteps > 0
    ? Math.round((completedSteps / totalSteps) * 100)
    : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Твой прогресс</Text>
      <View style={styles.row}>
        <CircularProgress percent={overallProgress} />
        <View style={styles.stats}>
          <Text style={styles.statsLabel}>Всего пройдено</Text>
          <Text style={styles.statsValue}>
            {completedSteps}/{totalSteps} шагов
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.28)',
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ringWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercent: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  stats: {
    flex: 1,
    marginLeft: 16,
  },
  statsLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 4,
  },
  statsValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
});
