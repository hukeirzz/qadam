import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View, Image } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { RankBadge } from '../components/ui/RankBadge';
import { ProfileStackParamList } from '../navigation/ProfileStack';
import { MainTabParamList } from '../types/navigation';
import { useAppStore } from '../store/useAppStore';
import { colors, glow, subjectColors } from '../theme/colors';
import { subjects, getTopicIds } from '../data/subjects';
import { RANK_ORDER, getRankXpProgress } from '../data/rankProgress';
import { petImages } from '../assets/petImages';
import { loadAverageMockScore } from '../services/progressService';
import { vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const tabNavigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const userId = useAppStore((s) => s.userId);
  const userName = useAppStore((s) => s.userName);
  const classLabel = useAppStore((s) => s.classLabel);
  const petName = useAppStore((s) => s.petName);
  const petType = useAppStore((s) => s.petType);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const rank = useAppStore((s) => s.rank);
  const completedSteps = useAppStore((s) => s.completedSteps);
  const completedTopics = useAppStore((s) => s.completedTopics);
  const remoteTopicIds = useAppStore((s) => s.remoteTopicIds);

  const currentRank = rank ?? 'D';
  const rankIdx = RANK_ORDER.indexOf(currentRank);
  const nextRank = rankIdx < RANK_ORDER.length - 1 ? RANK_ORDER[rankIdx + 1] : null;
  const rankProgress = nextRank ? getRankXpProgress(nextRank, xp) : null;

  // Средний балл ОРТ считается не в приложении, а на стороне партнёрской
  // школы: координатор ОРТ вносит баллы пробных экзаменов в school-web
  // (mock_results), здесь просто читаем среднее. Для учеников без школы
  // или пока координатор ничего не внёс — average остаётся null → «—».
  const [mockScore, setMockScore] = useState<{ average: number | null; count: number } | null>(null);
  useEffect(() => {
    if (!userId) return;
    loadAverageMockScore(userId).then(setMockScore).catch(console.warn);
  }, [userId]);

  const subjectStats = subjects.map((subject) => {
    const ids = remoteTopicIds[subject.id]?.length ? remoteTopicIds[subject.id] : getTopicIds(subject.id);
    const total = ids.length;
    const done = completedTopics.filter((id) => ids.includes(id)).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const color = subjectColors[subject.id as keyof typeof subjectColors].primary;
    return { id: subject.id, title: subject.title, icon: subject.icon, color, pct };
  });

  const openSettings = () => { vibrate(); navigation.navigate('Settings'); };
  const openStats = () => { vibrate(); tabNavigation.navigate('StatsTab'); };
  const openSubject = (subjectId: string) => {
    vibrate();
    (tabNavigation as any).navigate('PathTab', { screen: 'IslandPath', params: { subjectId } });
  };
  const showStatsInfo = () => {
    vibrate();
    Alert.alert(
      'Как считаются показатели',
      '«Тестов пройдено» — количество завершённых тем.\n\n«Средний балл ОРТ» — средний балл пробных экзаменов ОРТ, которые вносит координатор ОРТ твоей партнёрской школы. Если школа не подключена к партнёрской программе или баллы ещё не внесены, показывается «—».',
    );
  };

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 120 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Профиль</Text>
          <Pressable style={styles.gearBtn} onPress={openSettings} hitSlop={8}>
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* Profile card */}
        <SurfaceCard style={styles.cardShadow} glowColor={glow.purple} radius={22} padding={18}>
          <View style={styles.identityRow}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarRing}>
                {petType ? (
                  <Image source={petImages[petType]} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>{userName.charAt(0)}</Text>
                  </View>
                )}
              </View>
              <Pressable style={styles.editBtn} onPress={openSettings} hitSlop={6}>
                <Ionicons name="pencil" size={13} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.identityInfo}>
              <Text style={styles.name} numberOfLines={1}>{userName}</Text>
              <View style={styles.subLineRow}>
                {petName ? (
                  <View style={styles.petNameRow}>
                    <Ionicons name="paw" size={12} color={colors.purpleGlow} />
                    <Text style={styles.petNameText} numberOfLines={1}>{petName}</Text>
                  </View>
                ) : null}
                {classLabel ? <Text style={styles.classLabel}>{classLabel}</Text> : null}
              </View>

              <View style={styles.rankHeaderRow}>
                <View style={styles.rankPill}>
                  <RankBadge rank={currentRank} size="sm" />
                  <Text style={styles.rankPillText}>{currentRank} ранг</Text>
                </View>
                <View style={styles.xpTrophyRow}>
                  <Ionicons name="trophy" size={14} color={colors.gold} />
                  <Text style={styles.xpTrophyText}>
                    {xp}{nextRank ? ` / ${rankProgress!.required}` : ''} XP
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.rankTrack}>
            <LinearGradient
              colors={[colors.purple, colors.purpleGlow]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.rankFill, { width: `${nextRank ? rankProgress!.progressPct : 100}%` }]}
            />
          </View>
          <Text style={styles.rankHint}>
            {nextRank ? `До следующего ранга: ${rankProgress!.remaining} XP` : 'Максимальный ранг достигнут'}
          </Text>

          {/* Stats grid — иконки/цифры/подписи идут отдельными рядами, а не
              4 независимыми колонками, чтобы разные иконки (разных шрифтов)
              не сбивали построчное выравнивание. */}
          <View style={styles.statsRow}>
            <View style={styles.statIconsRow}>
              <View style={styles.statCol}>
                <Ionicons name="star" size={18} color={colors.gold} />
              </View>
              <View style={styles.statCol}>
                <MaterialCommunityIcons name="fire" size={18} color="#FF8C3B" />
              </View>
              <View style={styles.statCol}>
                <MaterialCommunityIcons name="target" size={18} color={colors.success} />
              </View>
              <View style={styles.statCol}>
                <MaterialCommunityIcons name="chart-bar" size={18} color={colors.purpleGlow} />
              </View>
            </View>

            <View style={styles.statValuesRow}>
              <Text style={[styles.statVal, styles.statCol]}>{xp}</Text>
              <Text style={[styles.statVal, styles.statCol]}>{streak}</Text>
              <Text style={[styles.statVal, styles.statCol]}>{completedSteps}</Text>
              <Text style={[styles.statVal, styles.statCol]}>{mockScore?.average ?? '—'}</Text>
            </View>

            <View style={styles.statLabelsRow}>
              <Text style={[styles.statLbl, styles.statCol]}>XP</Text>
              <Text style={[styles.statLbl, styles.statCol]}>Серия дней</Text>
              <Text style={[styles.statLbl, styles.statCol]}>Тестов пройдено</Text>
              <Text style={[styles.statLbl, styles.statCol]}>Средний балл ОРТ</Text>
            </View>

            <Pressable style={styles.statInfoBtn} onPress={showStatsInfo} hitSlop={8}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        </SurfaceCard>

        {/* Мои предметы */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Мои предметы</Text>
          <Pressable onPress={openStats} hitSlop={6}>
            <Text style={styles.sectionLink}>Смотреть все</Text>
          </Pressable>
        </View>
        <SurfaceCard style={styles.cardShadow} glowColor={glow.purple} radius={20} padding={8}>
          {subjectStats.map((s, i) => (
            <Pressable
              key={s.id}
              style={[styles.subjectRow, i < subjectStats.length - 1 && styles.subjectRowDivider]}
              onPress={() => openSubject(s.id)}
            >
              <View style={[styles.subjectIconWrap, { backgroundColor: `${s.color}26` }]}>
                <Text style={[styles.subjectIconGlyph, { color: s.color }]}>{s.icon}</Text>
              </View>
              <Text style={styles.subjectName} numberOfLines={1}>{s.title}</Text>
              <View style={styles.subjectTrack}>
                <View style={[styles.subjectFill, { width: `${s.pct}%`, backgroundColor: s.color }]} />
              </View>
              <Text style={[styles.subjectPct, { color: s.color }]}>{s.pct}%</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
            </Pressable>
          ))}
        </SurfaceCard>

        {/* Статистика */}
        <Pressable style={styles.statsLinkRow} onPress={openStats}>
          <View style={styles.statsLinkIconWrap}>
            <Ionicons name="stats-chart" size={18} color={colors.purpleGlow} />
          </View>
          <View style={styles.statsLinkTextWrap}>
            <Text style={styles.statsLinkTitle}>Статистика</Text>
            <Text style={styles.statsLinkSubtitle}>Подробная статистика и прогресс</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
        </Pressable>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },
  gearBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  cardShadow: { marginBottom: 18 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatarWrap: { width: 76, height: 76 },
  avatarRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    padding: 3,
    borderWidth: 2,
    borderColor: colors.purple,
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 34 },
  avatarFallback: {
    flex: 1,
    borderRadius: 34,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: { color: colors.text, fontSize: 26, fontWeight: '800' },
  editBtn: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.purple,
    borderWidth: 2,
    borderColor: colors.background,
  },
  identityInfo: { flex: 1 },
  name: { color: colors.text, fontSize: 19, fontWeight: '800' },
  subLineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  petNameRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  petNameText: { color: colors.purpleGlow, fontSize: 13, fontWeight: '700' },
  classLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  rankHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 10,
    paddingLeft: 3,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(144,71,255,0.18)',
    borderWidth: 1,
    borderColor: colors.purple,
  },
  rankPillText: { color: colors.text, fontSize: 12, fontWeight: '800' },
  xpTrophyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  xpTrophyText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  rankTrack: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  rankFill: { height: '100%', borderRadius: 5 },
  rankHint: { color: colors.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 18 },
  statsRow: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderMuted,
    position: 'relative',
  },
  statIconsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  statValuesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  statLabelsRow: { flexDirection: 'row', alignItems: 'flex-start' },
  statCol: { flex: 1, alignItems: 'center', textAlign: 'center' },
  statVal: { color: colors.text, fontSize: 18, fontWeight: '800' },
  statLbl: { color: colors.textMuted, fontSize: 10.5, fontWeight: '600' },
  statInfoBtn: { position: 'absolute', top: -8, right: -4 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  sectionLink: { color: colors.purpleGlow, fontSize: 13, fontWeight: '700' },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  subjectRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  subjectIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectIconGlyph: { fontSize: 15, fontWeight: '800' },
  subjectName: { width: 96, color: colors.text, fontSize: 13, fontWeight: '600' },
  subjectTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  subjectFill: { height: '100%', borderRadius: 3 },
  subjectPct: { fontSize: 12, fontWeight: '700', width: 34, textAlign: 'right' },
  statsLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surfaceGlass,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  statsLinkIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(144,71,255,0.15)',
  },
  statsLinkTextWrap: { flex: 1 },
  statsLinkTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  statsLinkSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
