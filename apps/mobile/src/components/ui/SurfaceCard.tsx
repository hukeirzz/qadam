import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { cardTheme, glow } from '../../theme/colors';

interface Props extends ViewProps {
  /** Цвет ambient-свечения под карточкой (shadowColor). */
  glowColor?: string;
  /** Внутренние отступы контента. */
  padding?: number;
  radius?: number;
  contentStyle?: ViewStyle;
}

// Общая поверхность карточек главного экрана: сплошная заливка, тонкая
// граница и цветное ambient-свечение под карточкой.
export function SurfaceCard({
  style,
  contentStyle,
  children,
  glowColor = glow.purple,
  padding = 16,
  radius = 20,
  ...rest
}: Props) {
  return (
    <View
      style={[
        styles.shadowWrap,
        { borderRadius: radius, shadowColor: glowColor },
        style,
      ]}
      {...rest}
    >
      <View style={[styles.fill, { borderRadius: radius, padding }]}>
        <View style={contentStyle}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  fill: {
    backgroundColor: cardTheme.fill,
    borderWidth: 1,
    borderColor: cardTheme.border,
    overflow: 'hidden',
  },
});
