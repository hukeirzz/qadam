import React, { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/useAppStore';
import { RANK_ORDER, getRankXpProgress } from '../../data/rankProgress';
import { useTheme } from '../../theme/ThemeContext';
import { CardTheme, ColorPalette } from '../../theme/colors';
import { gradients } from '../../theme/colors';
import { petImages } from '../../assets/petImages';

export function ProgressSummary() {
  const xp = useAppStore((s) => s.xp);
  const rank = useAppStore((s) => s.rank);
  const petType = useAppStore((s) => s.petType);
  const petImage = petImages[petType ?? 'bars'];
  const { colors, cardTheme, glow } = useTheme();
  const styles = useMemo(() => createStyles(colors, cardTheme), [colors, cardTheme]);

  const currentRank = rank ?? RANK_ORDER[0];
  const rankIdx = RANK_ORDER.indexOf(currentRank);
  const nextRank = rankIdx >= 0 && rankIdx < RANK_ORDER.length - 1 ? RANK_ORDER[rankIdx + 1] : null;
  const rankProgress = nextRank ? getRankXpProgress(nextRank, xp) : null;
  const fillPct = rankProgress ? rankProgress.progressPct : 100;

  return (
    <View style={[styles.shadowWrap, { shadowColor: glow.purple }]}>
      <View style={styles.card}>
        <View style={styles.content}>
          <Text style={styles.label}>ТВОЙ ПРОГРЕСС</Text>
          <Text style={styles.statsLabel}>Опыт (XP)</Text>
          <Text style={styles.statsValue}>{xp} XP</Text>

          <View style={styles.track}>
            <LinearGradient
              colors={[gradients.auroraCool[0], gradients.auroraCool[1]]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.fill, { width: `${fillPct}%` }]}
            />
          </View>
          <Text style={styles.statsHint}>
            {nextRank
              ? `До ранга ${nextRank}: ${rankProgress!.remaining} XP`
              : 'Максимальный ранг достигнут'}
          </Text>
        </View>
      </View>

      <View style={[styles.petGlow, { shadowColor: glow.purple }]} pointerEvents="none" />
      <Image source={petImage} style={styles.pet} resizeMode="contain" />
    </View>
  );
}

const createStyles = (colors: ColorPalette, cardTheme: CardTheme) => StyleSheet.create({
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
    marginBottom: 12,
  },
  track: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  statsHint: {
    color: colors.textMuted,
    fontSize: 11.5,
    fontWeight: '600',
  },
});
