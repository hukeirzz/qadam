import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { useTheme } from '../../theme/ThemeContext';
import { ColorPalette } from '../../theme/colors';
import { vibrate } from '../../services/soundService';

export type PathTab = 'path' | 'info';

interface Props {
  active: PathTab;
  onChange: (tab: PathTab) => void;
  accentColor: string;
}

export function SegmentTabs({ active, onChange, accentColor }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const activePill = `${accentColor}33`;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => { vibrate(); onChange('path'); }}
        style={[styles.tab, active === 'path' && { backgroundColor: activePill }]}
      >
        <Text style={[styles.text, active === 'path' && styles.textActive]}>
          Путь тем
        </Text>
      </Pressable>
      <Pressable
        onPress={() => { vibrate(); onChange('info'); }}
        style={[styles.tab, active === 'info' && { backgroundColor: activePill }]}
      >
        <Text style={[styles.text, active === 'info' && styles.textActive]}>
          Информация
        </Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: colors.purpleDark,
    borderRadius: 28,
    padding: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 22,
    alignItems: 'center',
  },
  text: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  textActive: {
    color: colors.text,
    fontWeight: '700',
  },
});
