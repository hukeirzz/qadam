import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { Rank } from '@qadam/business-logic';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { colors, subjectColors } from '../theme/colors';
import { subjects } from '../data/subjects';
import { islandImages } from '../assets/islandImages';
import { rankImages } from '../assets/rankImages';
import { RANK_ORDER, RANK_XP_THRESHOLDS, getRankXpProgress } from '../data/rankProgress';
import { useAppStore } from '../store/useAppStore';
import { ExerciseStackParamList } from '../types/navigation';
import { SUBJECT_META } from './ExerciseScreen';
import { SubjectId, Topic } from '../types/subject';
import { getPracticeResults, PracticeResult } from '../utils/practiceStorage';
import { fetchTopicsForSubject } from '../services/topicsService';
import { vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<ExerciseStackParamList, 'ExerciseSubject'>;

const RANK_ACCENT: Record<Rank, string> = {
  D: '#B5804A',
  C: '#9AA7C7',
  B: '#8B6DFF',
  A: '#FF4D6D',
  S: '#FFC24B',
};

const SUBJECT_TAGLINES: Record<string, string> = {
  math: 'Решай задачи, развивай логику и набирай максимум баллов!',
  geometry: 'Изучай фигуры, углы и пространственное мышление!',
  analogies: 'Находи связи между словами и тренируй смекалку!',
  reading: 'Понимай тексты глубже и отвечай точнее!',
  grammar: 'Совершенствуй язык и не теряй баллы на мелочах!',
};

function rankXpLabel(rank: Rank): string {
  const idx = RANK_ORDER.indexOf(rank);
  const min = RANK_XP_THRESHOLDS[rank];
  const next = RANK_ORDER[idx + 1];
  return next ? `${min} – ${RANK_XP_THRESHOLDS[next] - 1} XP` : `${min}+ XP`;
}

/**
 * Темы предмета (subject.topics) — это контент D ранга, единственного острова
 * с реально составленными темами на сегодня. Остальные ранги показывают свои
 * будущие острова пустыми, а не «раздёргивают» тему D ранга по кусочкам.
 */
function topicsForRank(rank: Rank, topics: Topic[]): Topic[] {
  return rank === RANK_ORDER[0] ? topics : [];
}

export function ExerciseSubjectScreen({ route }: Props) {
  const { subjectId } = route.params;
  const insets = useSafeAreaInsets();
  const completedTopics = useAppStore((s) => s.completedTopics);
  const premiumUnlocked = useAppStore((s) => s.premiumUnlocked);
  const gems = useAppStore((s) => s.gems);
  const xp = useAppStore((s) => s.xp);
  const rank = useAppStore((s) => s.rank);
  const navigation = useNavigation<any>();

  const [results, setResults] = useState<Record<string, PracticeResult>>({});
  const [remoteTopics, setRemoteTopics] = useState<Topic[] | null>(null);
  const [selectedRank, setSelectedRank] = useState<Rank>(rank ?? 'D');

  const isPremium = subjectId.endsWith('_premium');
  const baseId = isPremium ? subjectId.replace('_premium', '') : subjectId;

  const subject = subjects.find((s) => s.id === baseId);
  const meta = SUBJECT_META[baseId];
  const palette = subjectColors[baseId as keyof typeof subjectColors];

  useEffect(() => {
    if (!subject) return;
    if (isPremium) {
      fetchTopicsForSubject(subjectId as SubjectId).then((fetched) => {
        if (fetched) {
          setRemoteTopics(fetched);
          getPracticeResults(fetched.map((t) => t.id)).then(setResults);
        }
      });
    } else {
      getPracticeResults(subject.topics.map((t) => t.id)).then(setResults);
    }
  }, [subjectId]);

  if (!subject || !meta) return null;

  const displayTopics: Topic[] = isPremium ? (remoteTopics ?? []) : subject.topics;
  const unlockedCount = displayTopics.filter((t) => completedTopics.includes(t.id)).length;
  const total = displayTopics.length;
  const progress = total > 0 ? unlockedCount / total : 0;

  const rankTopics = topicsForRank(selectedRank, subject.topics);

  const goToQuiz = (topicId: string, topicTitle: string) => {
    vibrate();
    navigation.navigate('PracticeQuiz', { topicId, topicTitle, subjectId });
  };

  const handlePremiumPress = () => {
    vibrate();
    if (premiumUnlocked) {
      navigation.navigate('PathTab', { screen: 'IslandPath', params: { subjectId: meta.premiumId } });
    } else {
      Alert.alert(
        'Требуется Premium',
        'Открой продвинутый уровень за 1000 сом',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Открыть', onPress: () => navigation.navigate('Premium') },
        ],
      );
    }
  };

  const showRankInfo = () => {
    vibrate();
    Alert.alert(
      'Ранги и острова',
      'Темы этого острова относятся к D рангу. Темы для C–S рангов появятся здесь по мере добавления нового контента. Проходи темы на Главной, чтобы открыть их здесь для практики.',
    );
  };

  const renderTopicCard = (topic: Topic) => {
    const isUnlocked = completedTopics.includes(topic.id);
    const result = results[topic.id];
    const hasTested = !!result;
    const cardProgress = hasTested ? result.pct / 100 : 0;

    return (
      <Pressable
        key={topic.id}
        style={[styles.topicCard, !isUnlocked && styles.topicCardLocked]}
        disabled={!isUnlocked}
        onPress={() => goToQuiz(topic.id, topic.title)}
      >
        <View style={[styles.topicIcon, { backgroundColor: `${palette.primary}26` }]}>
          <Text style={[styles.topicIconGlyph, { color: palette.primary }]}>{subject.icon}</Text>
        </View>

        <View style={styles.topicInfo}>
          <Text style={[styles.topicTitle, !isUnlocked && styles.topicTitleLocked]} numberOfLines={1}>
            {topic.title}
          </Text>

          {isUnlocked ? (
            <View style={styles.topicProgressRow}>
              <View style={styles.topicTrack}>
                <View
                  style={[
                    styles.topicFill,
                    { width: `${cardProgress * 100}%`, backgroundColor: palette.primary },
                  ]}
                />
              </View>
              <Text style={styles.topicFraction}>
                {hasTested ? `${result.correct} / ${result.total}` : 'Не пройдено'}
              </Text>
            </View>
          ) : (
            <Text style={styles.topicSubLocked}>Сначала пройди на острове</Text>
          )}
        </View>

        <View style={styles.topicRight}>
          <View style={[styles.topicChevronBtn, !isUnlocked && styles.topicChevronBtnLocked]}>
            <Ionicons
              name={isUnlocked ? 'chevron-forward' : 'lock-closed'}
              size={16}
              color={isUnlocked ? colors.text : colors.textDim}
            />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenBackground>
      <View style={[styles.flex, { paddingTop: insets.top }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => { vibrate(); navigation.goBack(); }}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
          <View style={styles.flexSpacer} />
          <View style={styles.gemsChip}>
            <Ionicons name="diamond" size={15} color="#63B4FF" />
            <Text style={styles.gemsText}>{gems}</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 130 }]}
        >

          {/* ── Hero ── */}
          <View style={styles.heroRow}>
            <Image
              source={islandImages[subjectId as keyof typeof islandImages]}
              style={styles.heroIsland}
              resizeMode="contain"
            />
            <View style={styles.heroInfo}>
              <Text style={styles.heroTitle}>{subject.title}</Text>
              <Text style={styles.heroTagline} numberOfLines={2}>
                {isPremium ? 'Продвинутые задачи для полной подготовки!' : (SUBJECT_TAGLINES[baseId] ?? '')}
              </Text>
            </View>
          </View>

          <View style={styles.heroProgressRow}>
            <Text style={styles.heroProgressLabel}>Твой прогресс</Text>
            <Text style={[styles.heroProgressCount, { color: palette.primary }]}>
              {unlockedCount} / {total}
            </Text>
          </View>
          <View style={styles.heroTrack}>
            <View
              style={[
                styles.heroFill,
                { width: `${progress * 100}%` as any, backgroundColor: palette.primary },
              ]}
            />
          </View>

          {isPremium ? (
            <>
              {/* ── Info banner ── */}
              <View style={styles.infoBanner}>
                <Ionicons name="information-circle" size={18} color={colors.purpleGlow} />
                <Text style={styles.infoText}>
                  Пройди тему на Главной — она откроется здесь для практики
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Темы раздела</Text>
              <View style={styles.topicList}>
                {displayTopics.map((topic) => renderTopicCard(topic))}
              </View>
            </>
          ) : (
            <>
              {/* ── Выбери ранг ── */}
              <Text style={styles.sectionTitle}>Выбери ранг</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rankRow}
              >
                {RANK_ORDER.map((r) => {
                  const isSelected = r === selectedRank;
                  const rProgress = getRankXpProgress(r, xp);
                  const accent = RANK_ACCENT[r];

                  return (
                    <Pressable
                      key={r}
                      style={[
                        styles.rankCard,
                        isSelected && [styles.rankCardSelected, { borderColor: accent }],
                      ]}
                      onPress={() => { vibrate(); setSelectedRank(r); }}
                    >
                      {!rProgress.achieved && (
                        <View style={styles.rankLockBadge}>
                          <Ionicons name="lock-closed" size={10} color={colors.textMuted} />
                        </View>
                      )}
                      <Image source={rankImages[r]} style={styles.rankImg} resizeMode="contain" />
                      <Text style={styles.rankLabel}>{r} ранг</Text>
                      <Text style={styles.rankXpLabel}>{rankXpLabel(r)}</Text>
                      {isSelected && (
                        <View style={styles.rankMiniTrack}>
                          <View
                            style={[
                              styles.rankMiniFill,
                              { width: `${rProgress.progressPct}%`, backgroundColor: accent },
                            ]}
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* ── Темы ранга ── */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Темы {selectedRank} ранга</Text>
                <View style={styles.islandPill}>
                  <Text style={styles.islandPillText}>Остров {subject.number} из {subjects.length}</Text>
                </View>
                <Pressable onPress={showRankInfo} hitSlop={8} style={styles.infoBtn}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
                </Pressable>
              </View>

              <View style={styles.topicList}>
                {rankTopics.length > 0 ? (
                  rankTopics.map((topic) => renderTopicCard(topic))
                ) : (
                  <View style={styles.emptyRankCard}>
                    <Text style={styles.emptyRankText}>Темы этого острова скоро появятся</Text>
                  </View>
                )}
              </View>

            </>
          )}

          {/* ── Premium banner ── */}
          {!premiumUnlocked && (
            <Pressable style={styles.premiumBanner} onPress={handlePremiumPress}>
              <View style={styles.premiumLock}>
                <Ionicons name="lock-closed" size={18} color={colors.purpleGlow} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.premiumTitle}>Продвинутый уровень</Text>
                <Text style={styles.premiumSub}>Открыть за 1000 сом →</Text>
              </View>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  flexSpacer: { flex: 1 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  gemsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  gemsText: { color: colors.text, fontSize: 15, fontWeight: '800' },

  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  /* Hero */
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  heroIsland: { width: 168, height: 168 },
  heroInfo: { flex: 1 },
  heroTitle: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 6 },
  heroTagline: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },

  heroProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  heroProgressLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  heroProgressCount: { fontSize: 16, fontWeight: '800' },
  heroTrack: {
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 22,
  },
  heroFill: { height: '100%', borderRadius: 4 },

  /* Info banner */
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(144,71,255,0.10)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(144,71,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },
  infoText: { flex: 1, color: colors.textMuted, fontSize: 12, lineHeight: 18 },

  /* Section */
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: 12 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  islandPill: {
    backgroundColor: 'rgba(144,71,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(144,71,255,0.3)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  islandPillText: { color: colors.purpleGlow, fontSize: 12, fontWeight: '700' },
  infoBtn: { marginLeft: 'auto' },

  /* Rank selector */
  rankRow: { gap: 10, paddingBottom: 4, marginBottom: 22 },
  rankCard: {
    width: 128,
    alignItems: 'center',
    backgroundColor: colors.surfaceGlass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  rankCardSelected: {
    borderWidth: 2,
    backgroundColor: 'rgba(144,71,255,0.1)',
  },
  rankLockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  rankImg: { width: 56, height: 56, marginBottom: 8 },
  rankLabel: { color: colors.text, fontSize: 13, fontWeight: '800', marginBottom: 3 },
  rankXpLabel: { color: colors.textMuted, fontSize: 10.5, fontWeight: '600', textAlign: 'center' },
  rankMiniTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginTop: 10,
  },
  rankMiniFill: { height: '100%', borderRadius: 2 },

  /* Topic list */
  topicList: { gap: 10, marginBottom: 18 },

  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceGlass,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  topicCardLocked: { opacity: 0.55 },

  topicIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  topicIconGlyph: { fontSize: 18, fontWeight: '800' },

  topicInfo: { flex: 1, minWidth: 0 },
  topicTitle: { color: colors.text, fontSize: 14.5, fontWeight: '700', marginBottom: 4 },
  topicTitleLocked: { color: colors.textDim },
  topicSubLocked: { color: colors.textDim, fontSize: 11 },

  topicProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topicTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  topicFill: { height: '100%', borderRadius: 3 },
  topicFraction: { color: colors.textMuted, fontSize: 11, fontWeight: '600', flexShrink: 0 },

  topicRight: { alignItems: 'center', gap: 8, flexShrink: 0 },
  topicChevronBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(144,71,255,0.18)',
  },
  topicChevronBtnLocked: { backgroundColor: 'rgba(255,255,255,0.06)' },

  emptyRankCard: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingVertical: 22,
    alignItems: 'center',
  },
  emptyRankText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },

  /* Premium */
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(144,71,255,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(144,71,255,0.3)',
    padding: 14,
  },
  premiumLock: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(144,71,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  premiumSub: { color: colors.purpleGlow, fontSize: 13, fontWeight: '600', marginTop: 2 },
});
