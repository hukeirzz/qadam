import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { Rank } from '@qadam/business-logic';
import { cardTheme, colors, glow } from '../../theme/colors';
import { rankAccentColors } from '../../assets/rankIslandImages';
import { getIslandsForRank } from '../../data/homeIslands';
import { SubjectId } from '../../types/subject';
import { useAppStore } from '../../store/useAppStore';
import { RankBadge } from '../ui/RankBadge';
import { SurfaceCard } from '../ui/SurfaceCard';
import { IslandGrid } from './IslandGrid';

interface Props {
  onIslandPress: (id: SubjectId, rank: Rank) => void;
  onPremiumPress: () => void;
}

const RANK_ORDER: Rank[] = ['D', 'C', 'B', 'A', 'S'];

const premiumPetImage = require('../../../assets/premiumpet.png');

function RankSection({
  rank,
  isCurrent,
  locked,
  expanded,
  onToggle,
  onIslandPress,
}: {
  rank: Rank;
  isCurrent: boolean;
  locked: boolean;
  expanded: boolean;
  onToggle: () => void;
  onIslandPress: (id: SubjectId, rank: Rank) => void;
}) {
  const accent = rankAccentColors[rank];

  // Закрытые ранги не сворачиваются/разворачиваются и никуда не ведут по
  // тапу (раньше открывали покупку Premium) — просто статичная строка-превью:
  // бейдж ранга слева, подпись, справа иконка замка.
  if (locked) {
    return (
      <View style={[styles.lockedRowShadow, { shadowColor: accent }]}>
        <View style={[styles.lockedRow, { borderColor: `${accent}55` }]}>
          <View style={styles.rankRow}>
            <RankBadge rank={rank} size="sm" />
            <Text style={styles.rankLabel}>{rank} ранг</Text>
          </View>
          <Ionicons name="lock-closed" size={18} color={colors.textMuted} />
        </View>
      </View>
    );
  }

  const islands = getIslandsForRank(rank);

  return (
    <SurfaceCard
      style={styles.card}
      glowColor={isCurrent ? glow.purple : accent}
      padding={0}
      contentStyle={styles.cardContent}
    >
      <Pressable style={styles.headerRow} onPress={onToggle}>
        <View style={styles.rankRow}>
          <RankBadge rank={rank} size="sm" />
          <Text style={styles.rankLabel}>{rank} ранг</Text>
        </View>
        <View style={styles.headerRight}>
          {isCurrent && (
            <View style={styles.availableBadge}>
              <Text style={styles.availableText}>ДОСТУПНО</Text>
            </View>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textMuted}
          />
        </View>
      </Pressable>

      {expanded && (
        <Animated.View entering={FadeInDown.duration(240)} exiting={FadeOutUp.duration(180)}>
          <IslandGrid islands={islands} onIslandPress={(id) => onIslandPress(id, rank)} />
        </Animated.View>
      )}
    </SurfaceCard>
  );
}

function PremiumBanner({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={[styles.premiumShadow, { shadowColor: glow.gold }]} onPress={onPress}>
      <View style={styles.premiumRow}>
        <View style={styles.premiumIconWrap}>
          <Image source={premiumPetImage} style={styles.premiumPetImg} resizeMode="cover" />
        </View>
        <View style={styles.premiumTextWrap}>
          <Text style={styles.premiumTitle}>Открой весь мир Qadam!</Text>
          <Text style={styles.premiumSubtitle}>
            Купи Premium и получи доступ ко всем рангам, заданиям и эксклюзивным наградам!
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

export function RankIslandMap({ onIslandPress, onPremiumPress }: Props) {
  const rank = useAppStore((s) => s.rank) ?? 'D';
  const premiumUnlocked = useAppStore((s) => s.premiumUnlocked);
  // Текущий ранг открыт по умолчанию, остальные — свёрнуты, пока их не
  // раскроют вручную. Храним только «переопределения» дефолта.
  const [expandedOverrides, setExpandedOverrides] = useState<Partial<Record<Rank, boolean>>>({});

  const isExpanded = (r: Rank) => expandedOverrides[r] ?? r === rank;
  const toggleExpanded = (r: Rank) =>
    setExpandedOverrides((prev) => ({ ...prev, [r]: !isExpanded(r) }));

  const otherRanks = RANK_ORDER.filter((r) => r !== rank);

  return (
    <View>
      <RankSection
        rank={rank}
        isCurrent
        locked={false}
        expanded={isExpanded(rank)}
        onToggle={() => toggleExpanded(rank)}
        onIslandPress={onIslandPress}
      />

      <View>
        {otherRanks.map((r) => (
          <RankSection
            key={r}
            rank={r}
            isCurrent={false}
            locked={!premiumUnlocked}
            expanded={isExpanded(r)}
            onToggle={() => toggleExpanded(r)}
            onIslandPress={onIslandPress}
          />
        ))}
      </View>

      {!premiumUnlocked && (
        <View style={styles.premiumWrap}>
          <PremiumBanner onPress={onPremiumPress} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  cardContent: {
    paddingTop: 16,
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankLabel: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(46,229,157,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(46,229,157,0.3)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  availableText: {
    color: colors.success,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  lockedRowShadow: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 18,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: cardTheme.fill,
    borderWidth: 1,
  },
  premiumWrap: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  premiumShadow: {
    borderRadius: 18,
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  premiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: cardTheme.fill,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
  },
  premiumIconWrap: {
    width: 76,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 209, 102, 0.16)',
    overflow: 'hidden',
  },
  premiumPetImg: {
    width: '100%',
    height: '100%',
  },
  premiumTextWrap: {
    flex: 1,
  },
  premiumTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },
  premiumSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
});
