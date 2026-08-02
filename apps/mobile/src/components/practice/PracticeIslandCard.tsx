import React, { useMemo } from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { CardTheme, ColorPalette } from '../../theme/colors';

interface Props {
  title: string;
  imageSrc: ImageSourcePropType;
  accentColor: string;
  glowColor: string;
  currentSteps?: number;
  totalSteps?: number;
  /** Заменяет строку "Решено X / Y" и прячет прогресс-бар (напр. для открытого премиум-раздела без счётчика). */
  subtitle?: string;
  locked?: boolean;
  lockedHint?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

// Строка раздела в вертикальном списке «Практики» — картинка слева,
// название/прогресс по центру, стрелка справа (как у карточек тем на острове).
export function PracticeIslandCard({
  title,
  imageSrc,
  accentColor,
  glowColor,
  currentSteps = 0,
  totalSteps = 0,
  subtitle,
  locked = false,
  lockedHint = 'Пройди предыдущую тему',
  onPress,
  style,
}: Props) {
  const { colors, cardTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, cardTheme), [colors, cardTheme]);
  const progress = totalSteps > 0 ? Math.min(1, currentSteps / totalSteps) : 0;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.shadowWrap, { shadowColor: glowColor }, style]}
    >
      <View style={styles.card}>
        <View style={styles.imageWrap}>
          <Image
            source={imageSrc}
            style={[styles.image, locked && styles.imageLocked]}
            resizeMode="contain"
          />
          {locked && (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={14} color="#FFFFFF" />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          {locked ? (
            <Text style={styles.lockedHint} numberOfLines={1}>
              {lockedHint}
            </Text>
          ) : subtitle ? (
            <Text style={styles.progressText}>{subtitle}</Text>
          ) : (
            <>
              <Text style={styles.progressText}>
                Решено {currentSteps} / {totalSteps}
              </Text>
              <View style={styles.track}>
                <View
                  style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: accentColor }]}
                />
              </View>
            </>
          )}
        </View>

        <View style={styles.chevronBtn}>
          <Ionicons
            name={locked ? 'lock-closed' : 'chevron-forward'}
            size={16}
            color={locked ? colors.textDim : colors.text}
          />
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ColorPalette, cardTheme: CardTheme) => StyleSheet.create({
  shadowWrap: {
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cardTheme.fill,
    borderWidth: 1,
    borderColor: cardTheme.border,
    borderRadius: 20,
    padding: 12,
  },
  imageWrap: {
    width: 60,
    height: 60,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLocked: {
    opacity: 0.35,
  },
  lockBadge: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 9,
    backgroundColor: 'rgba(124, 58, 237, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 6,
  },
  lockedHint: {
    color: colors.textDim,
    fontSize: 11.5,
    fontWeight: '600',
  },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  chevronBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.purpleDark,
    borderWidth: 1,
    borderColor: cardTheme.border,
    flexShrink: 0,
  },
});
