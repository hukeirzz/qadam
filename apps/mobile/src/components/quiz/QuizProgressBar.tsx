import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  progress: number;
  color: string;
}

export function QuizProgressBar({ progress, color }: Props) {
  const clamped = Math.min(100, Math.max(0, progress));

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

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
});
