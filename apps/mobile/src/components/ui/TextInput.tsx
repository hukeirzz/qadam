import React from 'react';
import { StyleSheet, TextInput as RNTextInput, TextInputProps, TextStyle } from 'react-native';
import { nunitoFamily } from '../../theme/typography';

// Замена стандартного TextInput — вводимый текст тоже рендерится Nunito.
// Использовать вместо `TextInput` из 'react-native' везде в приложении.
export function TextInput({ style, ...rest }: TextInputProps) {
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const fontFamily = flat.fontFamily ?? nunitoFamily(flat.fontWeight);

  return <RNTextInput {...rest} style={[style, { fontFamily, fontWeight: 'normal' }]} />;
}
