import React, { useMemo } from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { appBackground } from '../../assets/images';
import { colors } from '../../theme/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  accentColor?: string;
}

// Небольшая «звёздная пыль» поверх фона — фиксированные точки, чтобы не
// пересчитывать координаты на каждый рендер.
const SPARKLES = Array.from({ length: 22 }, (_, i) => {
  const seed = i * 37.61;
  return {
    left: `${(seed * 13) % 100}%`,
    top: `${(seed * 7) % 100}%`,
    size: 1 + ((i * 5) % 3),
    opacity: 0.18 + ((i * 11) % 30) / 100,
  };
});

function StarField() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {SPARKLES.map((s, i) => (
        <View
          key={i}
          style={[
            styles.sparkle,
            {
              left: s.left as any,
              top: s.top as any,
              width: s.size,
              height: s.size,
              borderRadius: s.size,
              opacity: s.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

export function ScreenBackground({ children, style }: Props) {
  const sparkles = useMemo(() => <StarField />, []);

  return (
    <View style={[styles.root, style]}>
      <Image source={appBackground} style={styles.background} resizeMode="cover" />
      {sparkles}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(139,92,246,0.16)', 'rgba(139,92,246,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.45 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0)', 'rgba(4,2,14,0.55)']}
        start={{ x: 0.5, y: 0.75 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  sparkle: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
});
