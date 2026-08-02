import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { AnswerState } from '../../types/quiz';
import { useTheme } from '../../theme/ThemeContext';
import { ColorPalette } from '../../theme/colors';

interface Props {
  label: string;
  text: string;
  state: AnswerState;
  disabled: boolean;
  accentColor: string;
  onPress: () => void;
}

export function AnswerCard({
  label,
  text,
  state,
  disabled,
  accentColor,
  onPress,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const resolved =
    state === 'correct'
      ? styles.cardCorrect
      : state === 'wrong'
        ? styles.cardWrong
        : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        pressed && !disabled && styles.cardPressed,
        resolved,
        state === 'idle' && { borderColor: colors.border },
      ]}
    >
      <View style={[styles.badge, { borderColor: accentColor }]}>
        <Text style={[styles.badgeText, { color: accentColor }]}>{label}</Text>
      </View>
      <Text style={styles.answerText}>{text}</Text>
      {state === 'correct' ? (
        <Ionicons name="checkmark-circle" size={22} color={colors.success} />
      ) : null}
      {state === 'wrong' ? (
        <Ionicons name="close-circle" size={22} color="#FF6B6B" />
      ) : null}
    </Pressable>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  cardCorrect: {
    borderColor: colors.success,
    backgroundColor: 'rgba(46, 229, 157, 0.12)',
  },
  cardWrong: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontWeight: '800',
    fontSize: 14,
  },
  answerText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
});
