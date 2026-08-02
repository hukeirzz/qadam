import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { ColorPalette } from '../../theme/colors';

interface Props {
  progress: number;
  color: string;
}

export function QuizProgressBar({ progress, color }: Props) {
  const clamped = Math.min(100, Math.max(0, progress));
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          { width: `${clamped}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 6,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
});
