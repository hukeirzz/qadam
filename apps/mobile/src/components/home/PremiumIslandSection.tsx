import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { premiumIslands } from '../../data/homeIslands';
import { getTopicIds } from '../../data/subjects';
import { useTheme } from '../../theme/ThemeContext';
import { ColorPalette } from '../../theme/colors';
import { SubjectId } from '../../types/subject';
import { useAppStore } from '../../store/useAppStore';
import { IslandCard } from './IslandCard';
import { PremiumProgressSummary } from './PremiumProgressSummary';

interface Props {
  unlocked: boolean;
  onUnlockPress: () => void;
  onIslandPress: (id: SubjectId) => void;
}

export function PremiumIslandSection({ unlocked, onUnlockPress, onIslandPress }: Props) {
  const completedTopics = useAppStore((s) => s.completedTopics);
  const remoteTopicIds = useAppStore((s) => s.remoteTopicIds);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const lastIndex = premiumIslands.length - 1;

  return (
    <View style={styles.section}>
      {/* Header: badge + unlock button (только пока заблокировано) */}
      <View style={styles.headerRow}>
        <View style={styles.lockBadge}>
          <Ionicons
            name={unlocked ? 'sparkles' : 'lock-closed'}
            size={13}
            color={colors.text}
          />
          <Text style={styles.lockBadgeText}>Продвинутый уровень</Text>
        </View>

        {!unlocked && (
          <Pressable onPress={onUnlockPress} style={styles.unlockBtnWrap}>
            <LinearGradient
              colors={[colors.purple, '#5B2ED4']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.unlockGrad}
            >
              <Text style={styles.unlockText}>Открыть</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>

      <Text style={styles.subtitle}>
        Более сложные задания для тех, кто готов к вызову
      </Text>

      {/* Отдельный прогресс премиум-островов (только когда открыто). */}
      {unlocked && <PremiumProgressSummary />}

      {unlocked ? (
        // Разблокировано — настоящие играбельные острова со своим прогрессом.
        <View style={styles.grid}>
          {premiumIslands.map((island, index) => {
            const topicIds = remoteTopicIds[island.id]?.length
              ? remoteTopicIds[island.id]
              : getTopicIds(island.id);
            const currentSteps = completedTopics.filter((id) => topicIds.includes(id)).length;
            const totalSteps = topicIds.length || island.totalSteps;

            return (
              <IslandCard
                key={island.id}
                title={island.title}
                currentSteps={currentSteps}
                totalSteps={totalSteps}
                imageSrc={island.imageSrc}
                progressColor={island.progressColor}
                index={index}
                onPress={() => onIslandPress(island.id)}
                style={index === lastIndex && premiumIslands.length % 2 !== 0
                  ? styles.lastCard : undefined}
              />
            );
          })}
        </View>
      ) : (
        // Заблокировано — превью с замком, тап ведёт на экран оплаты.
        <View style={styles.grid}>
          {premiumIslands.map((item, index) => {
            const isLast = index === premiumIslands.length - 1;
            return (
              <Pressable
                key={item.id}
                onPress={onUnlockPress}
                style={[styles.card, isLast && premiumIslands.length % 2 !== 0 && styles.cardCenter]}
              >
                <View style={styles.imgWrap} pointerEvents="none">
                  <Image
                    source={item.imageSrc}
                    style={styles.img}
                    resizeMode="contain"
                  />
                  <View style={styles.imgOverlay} />
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color="rgba(255,255,255,0.5)"
                    style={styles.lockIcon}
                  />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  section: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(144, 71, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(144, 71, 255, 0.4)',
  },
  lockBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  unlockBtnWrap: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  unlockGrad: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lastCard: {
    alignSelf: 'center',
  },
  card: {
    width: '48%',
    marginBottom: 20,
    alignItems: 'center',
  },
  cardCenter: {
    alignSelf: 'center',
  },
  imgWrap: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  img: {
    width: 250,
    height: 250,
    opacity: 0.3,
  },
  imgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,4,20,0.25)',
    borderRadius: 60,
  },
  lockIcon: {
    position: 'absolute',
  },
  cardTitle: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
