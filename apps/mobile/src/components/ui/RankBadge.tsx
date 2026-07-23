import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Rank } from '@qadam/business-logic';
import { colors } from '../../theme/colors';

interface Props {
  rank: Rank | null;
  size?: 'sm' | 'md' | 'lg';
  /** Shown instead of the badge when rank is null (e.g. entrance test not taken yet). */
  onPressCta?: () => void;
}

const RANK_COLORS: Record<Rank, [string, string]> = {
  D: ['#7D75A8', '#655B96'],
  C: ['#3B8BFF', '#1E5FCC'],
  B: ['#9047FF', '#6B2FD4'],
  A: ['#FF8C3B', '#CC6A1E'],
  S: ['#FFD166', '#E8A93B'],
};

const SIZES = { sm: 36, md: 56, lg: 96 };
const FONT_SIZES = { sm: 15, md: 22, lg: 40 };

export function RankBadge({ rank, size = 'md', onPressCta }: Props) {
  const dim = SIZES[size];

  if (!rank) {
    if (!onPressCta) return null;
    return (
      <Pressable style={styles.cta} onPress={onPressCta} hitSlop={6}>
        <Text style={styles.ctaText}>Пройти тест на ранг</Text>
      </Pressable>
    );
  }

  return (
    <LinearGradient
      colors={RANK_COLORS[rank]}
      style={[styles.badge, { width: dim, height: dim, borderRadius: dim * 0.28 }]}
    >
      <Text style={[styles.rankText, { fontSize: FONT_SIZES[size] }]}>{rank}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '0deg' }],
  },
  rankText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  cta: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(144,71,255,0.15)',
    borderWidth: 1,
    borderColor: colors.purple,
  },
  ctaText: {
    color: colors.purpleGlow,
    fontSize: 12,
    fontWeight: '700',
  },
});
