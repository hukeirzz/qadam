import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { appBackground } from '../../assets/images';
import { colors } from '../../theme/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  accentColor?: string;
}

export function ScreenBackground({ children, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <Image source={appBackground} style={styles.background} resizeMode="cover" />
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
  content: {
    flex: 1,
  },
});
