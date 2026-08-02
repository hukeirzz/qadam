import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import Svg, { Circle } from 'react-native-svg';
import { useAppStore } from '../../store/useAppStore';
import { premiumIslands } from '../../data/homeIslands';
import { getTopicIds } from '../../data/subjects';
import { useTheme } from '../../theme/ThemeContext';
import { ColorPalette } from '../../theme/colors';

const SIZE = 64;
const STROKE = 6;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function CircularProgress({
  percent,
  trackColor,
  progressColor,
  textColor,
}: {
  percent: number;
  trackColor: string;
  progressColor: string;
  textColor: string;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const dash = (clamped / 100) * CIRC;

  return (
    <View style={styles.ringWrap}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          stroke={trackColor}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          stroke={progressColor}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${dash} ${CIRC}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={[styles.ringPercent, { color: textColor }]}>{clamped}%</Text>
      </View>
    </View>
  );
}

/**
 * Отдельный прогресс для премиум-островов. Считается независимо от верхнего
 * «Твой прогресс» (тот учитывает только обычные 5 островов).
 */
export function PremiumProgressSummary() {
  const completedTopics = useAppStore((s) => s.completedTopics);
  const remoteTopicIds = useAppStore((s) => s.remoteTopicIds);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  let completedSteps = 0;
  let totalSteps = 0;
  for (const island of premiumIslands) {
    const topicIds = remoteTopicIds[island.id]?.length
      ? remoteTopicIds[island.id]
      : getTopicIds(island.id);
    completedSteps += completedTopics.filter((id) => topicIds.includes(id)).length;
    totalSteps += topicIds.length || island.totalSteps;
  }
  if (totalSteps < completedSteps) totalSteps = completedSteps;

  const overallProgress = totalSteps > 0
    ? Math.round((completedSteps / totalSteps) * 100)
    : 0;

  return (
    <View style={styles.card}>
      <CircularProgress
        percent={overallProgress}
        trackColor={colors.border}
        progressColor={colors.purpleGlow}
        textColor={colors.text}
      />
      <View style={styles.stats}>
        <Text style={styles.statsLabel}>Прогресс премиум-островов</Text>
        <Text style={styles.statsValue}>
          {completedSteps}/{totalSteps} шагов
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 14,
    fontWeight: '800',
  },
});

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.purpleDark,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.28)',
    marginBottom: 16,
  },
  stats: {
    flex: 1,
    marginLeft: 14,
  },
  statsLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 4,
  },
  statsValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
});
