import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

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
  glowColor,
  padding = 16,
  radius = 20,
  ...rest
}: Props) {
  const { cardTheme, glow } = useTheme();
  const resolvedGlow = glowColor ?? glow.purple;

  return (
    <View
      style={[
        styles.shadowWrap,
        { borderRadius: radius, shadowColor: resolvedGlow },
        style,
      ]}
      {...rest}
    >
      <View
        style={[
          styles.fill,
          { borderRadius: radius, padding, backgroundColor: cardTheme.fill, borderColor: cardTheme.border },
        ]}
      >
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
    borderWidth: 1,
    overflow: 'hidden',
  },
});
