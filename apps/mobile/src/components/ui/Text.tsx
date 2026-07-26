import React from 'react';
import { Text as RNText, StyleSheet, TextProps, TextStyle } from 'react-native';
import { nunitoFamily } from '../../theme/typography';

// Замена стандартного Text — всегда рендерит Nunito нужного начертания,
// подобранного по fontWeight из переданного style (800 -> ExtraBold и т.д.).
// Использовать вместо `Text` из 'react-native' везде в приложении.
export function Text({ style, ...rest }: TextProps) {
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const fontFamily = flat.fontFamily ?? nunitoFamily(flat.fontWeight);

  return <RNText {...rest} style={[style, { fontFamily, fontWeight: 'normal' }]} />;
}
