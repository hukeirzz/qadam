import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  progress: number;
  color: string;
  secondaryColor: string;
  label?: string;
  height?: number;
}

export function GlowProgressBar({
  progress,
  color,
  secondaryColor,
  label,
  height = 5,
}: Props) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.track, { height }]}>
        <LinearGradient
          colors={[color, secondaryColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${clamped}%` }]}
        />
        <View
          style={[
            styles.glow,
            {
              width: `${clamped}%`,
              backgroundColor: color,
              shadowColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: '#8B85A8',
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  track: {
    backgroundColor: '#ECE9F7',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: 10,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    opacity: 0.35,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
});
