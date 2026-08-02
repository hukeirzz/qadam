import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { Rank } from '@qadam/business-logic';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, subjectColors } from '../theme/colors';
import { subjects } from '../data/subjects';
import { islandImages } from '../assets/islandImages';
import { rankImages } from '../assets/rankImages';
import { RANK_ORDER, RANK_XP_THRESHOLDS, getRankXpProgress } from '../data/rankProgress';
import { useAppStore } from '../store/useAppStore';
import { ExerciseStackParamList } from '../types/navigation';
import { SUBJECT_META } from './ExerciseScreen';
import { SubjectId, Topic } from '../types/subject';
import { fetchTopicsForSubject } from '../services/topicsService';
import { getQuestionsForTopic } from '../data/practiceQuestions';
import { getPracticeResults, PracticeResult } from '../utils/practiceStorage';
import { QUIZ_COUNT } from './PracticeQuizScreen';
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
  const topicHearts = useAppStore((s) => s.topicHearts);
  const gems = useAppStore((s) => s.gems);
  const xp = useAppStore((s) => s.xp);
  const rank = useAppStore((s) => s.rank);
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [remoteTopics, setRemoteTopics] = useState<Topic[] | null>(null);
  const [selectedRank, setSelectedRank] = useState<Rank>(rank ?? 'D');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [practiceResults, setPracticeResults] = useState<Record<string, PracticeResult>>({});

  const isPremium = subjectId.endsWith('_premium');
  const baseId = isPremium ? subjectId.replace('_premium', '') : subjectId;

  const subject = subjects.find((s) => s.id === baseId);
  const meta = SUBJECT_META[baseId];
  const palette = subjectColors[baseId as keyof typeof subjectColors];

  useEffect(() => {
    if (!subject) return;
    if (isPremium) {
      fetchTopicsForSubject(subjectId as SubjectId).then((fetched) => {
        if (fetched) setRemoteTopics(fetched);
      });
    }
  }, [subjectId]);

  // Обновляем при каждом возврате на экран — после прохождения практики
  // (PracticeQuizScreen) счётчик попыток/лучший результат должны обновиться
  // без перезапуска приложения.
  useFocusEffect(
    useCallback(() => {
      const idSet = new Set<string>();
      for (const t of subject?.topics ?? []) idSet.add(t.id);
      for (const t of remoteTopics ?? []) idSet.add(t.id);
      const ids = Array.from(idSet);
      if (ids.length === 0) return;
      getPracticeResults(ids).then(setPracticeResults);
    }, [subject, remoteTopics]),
  );

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

  const showRankInfo = () => {
    vibrate();
    Alert.alert(
      'Ранги и острова',
      'Темы этого острова относятся к D рангу. Темы для C–S рангов появятся здесь по мере добавления нового контента. Проходи темы на Главной, чтобы открыть их здесь для практики.',
    );
  };

  const toggleExpand = (topicId: string) => {
    vibrate();
    setExpandedTopicId((cur) => (cur === topicId ? null : topicId));
  };

  const renderTopicCard = (topic: Topic) => {
    const isUnlocked = completedTopics.includes(topic.id);
    const isExpanded = isUnlocked && expandedTopicId === topic.id;
    const hearts = topicHearts[topic.id]; // 0–3, undefined = ещё не пройдено
    const result = practiceResults[topic.id];
    // PracticeQuizScreen берёт максимум QUIZ_COUNT вопросов из пула —
    // показываем то же число, что реально увидит ученик, а не размер пула.
    const questionCount = result?.total ?? Math.min(QUIZ_COUNT, getQuestionsForTopic(topic.id).length);

    return (
      <View key={topic.id} style={styles.topicCard}>
        <Pressable
          style={[styles.topicRow, !isUnlocked && styles.topicRowLocked]}
          disabled={!isUnlocked}
          onPress={() => toggleExpand(topic.id)}
        >
          <View style={[styles.topicIcon, { backgroundColor: `${palette.primary}26` }]}>
            <Text style={[styles.topicIconGlyph, { color: palette.primary }]}>{subject.icon}</Text>
          </View>

          <View style={styles.topicInfo}>
            <View style={styles.topicTitleRow}>
              <Text style={[styles.topicTitle, !isUnlocked && styles.topicTitleLocked]} numberOfLines={1}>
                {topic.title}
              </Text>
              {isUnlocked && hearts !== undefined && (
                <View style={styles.topicStarsRow}>
                  {[0, 1, 2].map((i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={14}
                      color={i < hearts ? colors.gold : colors.border}
                    />
                  ))}
                </View>
              )}
            </View>

            {isUnlocked ? (
              <Text style={styles.topicSubUnlocked}>Доступно для практики</Text>
            ) : (
              <Text style={styles.topicSubLocked}>Сначала пройди на острове</Text>
            )}
          </View>

          <View style={styles.topicRight}>
            <View style={[styles.topicChevronBtn, !isUnlocked && styles.topicChevronBtnLocked]}>
              <Ionicons
                name={!isUnlocked ? 'lock-closed' : isExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={isUnlocked ? colors.text : colors.textDim}
              />
            </View>
          </View>
        </Pressable>

        {isExpanded && (
          <View style={styles.topicExpanded}>
            <View style={styles.topicStatsRow}>
              <View style={styles.topicStat}>
                <Ionicons name="help-circle-outline" size={20} color={colors.purpleGlow} />
                <Text style={styles.topicStatLabel}>Количество{'\n'}вопросов</Text>
                <Text style={styles.topicStatValue}>{questionCount}</Text>
              </View>
              <View style={styles.topicStat}>
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                <Text style={styles.topicStatLabel}>Правильные{'\n'}ответы</Text>
                <Text style={styles.topicStatValue}>{result?.best ?? 0}</Text>
              </View>
              <View style={styles.topicStat}>
                <Ionicons name="repeat" size={20} color="#3B82F6" />
                <Text style={styles.topicStatLabel}>Попыток</Text>
                <Text style={styles.topicStatValue}>{result?.attempts ?? 0}</Text>
              </View>
            </View>

            <Pressable style={styles.topicPassBtn} onPress={() => goToQuiz(topic.id, topic.title)}>
              <Text style={styles.topicPassBtnText}>Пройти</Text>
            </Pressable>
          </View>
        )}
      </View>
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
              <Text style={styles.heroTagline}>
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

                  // Полоска на карточке ранга отражает реальный прогресс по
                  // пройденным темам этого ранга, а не XP до его открытия —
                  // иначе D ранг (порог 0 XP) всегда выглядел бы заполненным.
                  const rTopics = topicsForRank(r, subject.topics);
                  const rDone = rTopics.filter((t) => completedTopics.includes(t.id)).length;
                  const rTotal = rTopics.length;
                  const topicProgressPct = rTotal > 0 ? (rDone / rTotal) * 100 : 0;

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
                      {isSelected && rTotal > 0 && (
                        <View style={styles.rankMiniTrack}>
                          <View
                            style={[
                              styles.rankMiniFill,
                              { width: `${topicProgressPct}%`, backgroundColor: accent },
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
                <Text style={[styles.sectionTitle, styles.sectionTitleInline]}>Темы {selectedRank} ранга</Text>
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
        </ScrollView>
      </View>
    </ScreenBackground>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
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
    backgroundColor: colors.border,
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
  sectionTitleInline: { marginBottom: 0 },
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
    backgroundColor: colors.border,
  },
  rankImg: { width: 56, height: 56, marginBottom: 8 },
  rankLabel: { color: colors.text, fontSize: 13, fontWeight: '800', marginBottom: 3 },
  rankXpLabel: { color: colors.textMuted, fontSize: 10.5, fontWeight: '600', textAlign: 'center' },
  rankMiniTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginTop: 10,
  },
  rankMiniFill: { height: '100%', borderRadius: 2 },

  /* Topic list */
  topicList: { gap: 10, marginBottom: 18 },

  topicCard: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    overflow: 'hidden',
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  topicRowLocked: { opacity: 0.55 },

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
  topicTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  topicTitle: { color: colors.text, fontSize: 14.5, fontWeight: '700', flexShrink: 1 },
  topicTitleLocked: { color: colors.textDim },
  topicStarsRow: { flexDirection: 'row', gap: 2, flexShrink: 0 },
  topicSubLocked: { color: colors.textDim, fontSize: 11 },
  topicSubUnlocked: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },

  topicRight: { alignItems: 'center', gap: 8, flexShrink: 0 },
  topicChevronBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(144,71,255,0.18)',
  },
  topicChevronBtnLocked: { backgroundColor: colors.border },

  topicExpanded: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 14,
  },
  topicStatsRow: {
    flexDirection: 'row',
    backgroundColor: colors.purpleDark,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  topicStat: { flex: 1, alignItems: 'center', gap: 4 },
  topicStatLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
    minHeight: 28,
  },
  topicStatValue: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 2 },
  topicPassBtn: {
    backgroundColor: colors.purple,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  topicPassBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  emptyRankCard: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingVertical: 22,
    alignItems: 'center',
  },
  emptyRankText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
});
