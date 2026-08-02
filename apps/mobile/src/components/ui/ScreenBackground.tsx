import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  accentColor?: string;
  /** Светлая декоративная картинка на весь экран — рисуется только в light-теме,
   * чтобы не спорить с тёмной палитрой (см. IslandPathScreen). */
  backgroundImage?: ImageSourcePropType;
}

export function ScreenBackground({ children, style, backgroundImage }: Props) {
  const { colors, mode } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.background }, style]}>
      {backgroundImage && mode === 'light' && (
        <Image source={backgroundImage} style={StyleSheet.absoluteFill} resizeMode="contain" />
      )}
      <LinearGradient
        pointerEvents="none"
        colors={
          mode === 'dark'
            ? ['rgba(139,92,246,0.16)', 'rgba(139,92,246,0)']
            : ['rgba(139,92,246,0.08)', 'rgba(139,92,246,0)']
        }
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.35 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
