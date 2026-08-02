import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import type { Rank } from '@qadam/business-logic';
import { useTheme } from '../../theme/ThemeContext';
import { rankImages } from '../../assets/rankImages';

interface Props {
  rank: Rank | null;
  size?: 'sm' | 'md' | 'lg';
  /** Shown instead of the badge when rank is null (e.g. entrance test not taken yet). */
  onPressCta?: () => void;
}

const SIZES = { sm: 36, md: 56, lg: 96 };

export function RankBadge({ rank, size = 'md', onPressCta }: Props) {
  const { colors } = useTheme();
  const dim = SIZES[size];

  if (!rank) {
    if (!onPressCta) return null;
    return (
      <Pressable
        style={[styles.cta, { borderColor: colors.purple }]}
        onPress={onPressCta}
        hitSlop={6}
      >
        <Text style={[styles.ctaText, { color: colors.purpleGlow }]}>Пройти тест на ранг</Text>
      </Pressable>
    );
  }

  const radius = dim * 0.22;

  return (
    <View style={[styles.badge, { width: dim, height: dim, borderRadius: radius }]}>
      <Image
        source={rankImages[rank]}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cta: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(144,71,255,0.15)',
    borderWidth: 1,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
