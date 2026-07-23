import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

const sizes = {
  sm: { width: 80,  height: 32,  tagline: 12 },
  md: { width: 110, height: 44,  tagline: 13 },
  lg: { width: 160, height: 64,  tagline: 15 },
};

const LOGO = require('../../../assets/icon.jpeg');

export function QadamLogo({ size = 'md', showTagline = false }: Props) {
  const s = sizes[size];

  return (
    <View style={styles.wrap}>
      <Image
        source={LOGO}
        style={{ width: s.width, height: s.height }}
        resizeMode="contain"
      />
      {showTagline ? (
        <Text style={[styles.tagline, { fontSize: s.tagline }]}>
          Делай шаги к знаниям каждый день
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  tagline: {
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 20,
    textAlign: 'center',
  },
});
