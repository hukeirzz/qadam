import React from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { cardTheme, colors } from '../../theme/colors';

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
  /** Подсвеченная (по центру карусели) карточка — цветная рамка и полная непрозрачность. */
  featured?: boolean;
  /** Затемнённая/уменьшенная карточка (соседи в карусели, не в фокусе). */
  dimmed?: boolean;
  /** Кружок-стрелка в углу — скрывается в карусели, где нет отдельной кнопки перехода. */
  showCorner?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

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
  featured = false,
  dimmed = false,
  showCorner = true,
  onPress,
  style,
}: Props) {
  const progress = totalSteps > 0 ? Math.min(1, currentSteps / totalSteps) : 0;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.shadowWrap,
        { shadowColor: glowColor, opacity: dimmed ? 0.55 : 1 },
        dimmed && styles.dimmedScale,
        style,
      ]}
    >
      <View style={[styles.card, featured && [styles.cardFeatured, { borderColor: accentColor }]]}>
        <View style={styles.imageWrap}>
          <Image
            source={imageSrc}
            style={[styles.image, locked && styles.imageLocked, { shadowColor: glowColor }]}
            resizeMode="contain"
          />
          {locked && (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
            </View>
          )}
        </View>

        {!locked && showCorner && (
          <View style={styles.cornerBtn}>
            <Ionicons name="chevron-forward" size={15} color={colors.text} />
          </View>
        )}

        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {locked ? (
          <Text style={styles.lockedHint} numberOfLines={2}>
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  dimmedScale: {
    transform: [{ scale: 0.9 }],
  },
  card: {
    backgroundColor: cardTheme.fill,
    borderWidth: 1,
    borderColor: cardTheme.border,
    borderRadius: 24,
    paddingTop: 14,
    paddingHorizontal: 10,
    paddingBottom: 12,
    position: 'relative',
  },
  cardFeatured: {
    borderWidth: 2,
    backgroundColor: 'rgba(144,71,255,0.1)',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  image: {
    width: '100%',
    height: '100%',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  imageLocked: {
    opacity: 0.35,
  },
  lockBadge: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(124, 58, 237, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  title: {
    color: colors.text,
    fontSize: 13.5,
    fontWeight: '800',
    lineHeight: 17,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
    marginBottom: 6,
  },
  lockedHint: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
    lineHeight: 14,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
