import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useAppStore } from '../../store/useAppStore';
import { homeIslands, premiumIslands } from '../../data/homeIslands';
import { getTopicIds } from '../../data/subjects';
import { cardTheme, colors, glow, gradients } from '../../theme/colors';
import { petImages } from '../../assets/petImages';

const SIZE = 78;
const STROKE = 7;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function CircularProgress({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const dash = (clamped / 100) * CIRC;

  return (
    <View style={styles.ringWrap}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <SvgGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={gradients.auroraCool[0]} />
            <Stop offset="1" stopColor={gradients.auroraCool[1]} />
          </SvgGradient>
        </Defs>
        {/* Track */}
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          stroke="#ECE9F7"
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          stroke="url(#progressGrad)"
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
  const petType = useAppStore((s) => s.petType);
  const petImage = petImages[petType ?? 'bars'];

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
    <View style={[styles.shadowWrap, { shadowColor: glow.purple }]}>
      <View style={styles.card}>
        <View style={styles.content}>
          <Text style={styles.label}>ТВОЙ ПРОГРЕСС</Text>
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
      </View>

      <View style={styles.petGlow} pointerEvents="none" />
      <Image source={petImage} style={styles.pet} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    marginHorizontal: 16,
    marginTop: 30,
    borderRadius: 22,
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  card: {
    padding: 18,
    paddingRight: 96,
    borderRadius: 22,
    backgroundColor: cardTheme.fill,
    borderWidth: 1,
    borderColor: cardTheme.border,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  petGlow: {
    position: 'absolute',
    right: 6,
    top: 24,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(180,144,255,0.18)',
    shadowColor: glow.purple,
    shadowOpacity: 1,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 0 },
  },
  pet: {
    position: 'absolute',
    right: 4,
    top: 10,
    width: 108,
    height: 128,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
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
    fontWeight: '500',
    marginBottom: 4,
  },
  statsValue: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 27,
  },
});
