import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { colors, subjectColors } from '../theme/colors';
import { subjects, getSubjectById } from '../data/subjects';
import { islandImages } from '../assets/islandImages';
import { useAppStore } from '../store/useAppStore';
import { ExerciseStackParamList } from '../types/navigation';
import { SUBJECT_META } from './ExerciseScreen';
import { SubjectId, Topic } from '../types/subject';
import { getPracticeResults, PracticeResult } from '../utils/practiceStorage';
import { fetchTopicsForSubject } from '../services/topicsService';
import { vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<ExerciseStackParamList, 'ExerciseSubject'>;

export function ExerciseSubjectScreen({ route }: Props) {
  const { subjectId } = route.params;
  const insets = useSafeAreaInsets();
  const completedTopics = useAppStore((s) => s.completedTopics);
  const premiumUnlocked = useAppStore((s) => s.premiumUnlocked);
  const gems = useAppStore((s) => s.gems);
  const streak = useAppStore((s) => s.streak);
  const navigation = useNavigation<any>();

  const [results, setResults] = useState<Record<string, PracticeResult>>({});
  const [remoteTopics, setRemoteTopics] = useState<Topic[] | null>(null);

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

  // Переход к теории острова
  const goToTheory = (topicId: string) => {
    navigation.navigate('PathTab', {
      screen: 'Theory',
      params: { subjectId: baseId as SubjectId, topicId },
    });
  };

  // Переход к тесту практики
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

  return (
    <ScreenBackground>
      <View style={[styles.flex, { paddingTop: insets.top }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => { vibrate(); navigation.goBack(); }}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Практика</Text>
          <View style={styles.headerRight}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statVal}>{streak}</Text>
            <Ionicons name="diamond" size={14} color="#5B9DFF" style={{ marginLeft: 10 }} />
            <Text style={styles.statVal}>{gems}</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 130 }]}
        >

          {/* ── Hero card ── */}
          <View style={styles.heroCard}>
            <View style={styles.heroRow}>
              <Image
                source={islandImages[subjectId as keyof typeof islandImages]}
                style={styles.heroIsland}
                resizeMode="contain"
              />
              <View style={styles.heroInfo}>
                <Text style={styles.heroTitle}>{subject.title}</Text>
                <Text style={[styles.heroLevel, { color: palette.primary }]}>
                  {isPremium ? 'Продвинутый уровень' : 'Базовый уровень'}
                </Text>
                <View style={styles.heroProgressRow}>
                  <Text style={styles.heroProgressLabel}>Открыто тем</Text>
                  <Text style={[styles.heroProgressCount, { color: palette.primary }]}>
                    {unlockedCount}/{total}
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
              </View>
            </View>
          </View>

          {/* ── Info banner ── */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={18} color={colors.purpleGlow} />
            <Text style={styles.infoText}>
              Пройди тему на Главной — она откроется здесь для практики
            </Text>
          </View>

          {/* ── Section header ── */}
          <Text style={styles.sectionTitle}>Темы раздела</Text>

          {/* ── Topic cards ── */}
          <View style={styles.topicList}>
            {displayTopics.map((topic, idx) => {
              const isUnlocked = completedTopics.includes(topic.id);
              const result = results[topic.id];
              const hasTested = !!result;

              return (
                <Pressable
                  key={topic.id}
                  style={[
                    styles.topicCard,
                    isUnlocked && { borderColor: palette.primary + '55' },
                    !isUnlocked && styles.topicCardLocked,
                  ]}
                  disabled={!isUnlocked}
                  onPress={() => goToQuiz(topic.id, topic.title)}
                >
                  {/* Number badge */}
                  {isUnlocked ? (
                    <LinearGradient colors={palette.gradient as [string, string]} style={styles.numBadge}>
                      <Text style={styles.numBadgeText}>{idx + 1}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.numBadgeLocked}>
                      <Text style={styles.numBadgeTextLocked}>{idx + 1}</Text>
                    </View>
                  )}

                  {/* Info */}
                  <View style={styles.topicInfo}>
                    <Text style={[styles.topicTitle, !isUnlocked && styles.topicTitleLocked]}>
                      {topic.title}
                    </Text>

                    {isUnlocked ? (
                      hasTested ? (
                        <Text style={[styles.topicResult, { color: palette.secondary }]}>
                          Результат: {result.correct}/{result.total} ({result.pct}%)
                        </Text>
                      ) : (
                        <Text style={styles.topicSub}>Тема открыта · Ещё не проходил</Text>
                      )
                    ) : (
                      <Text style={styles.topicSubLocked}>Сначала пройди на острове</Text>
                    )}
                  </View>

                  {/* Buttons */}
                  {isUnlocked ? (
                    <Ionicons name="chevron-forward" size={20} color={palette.secondary} />
                  ) : (
                    <Ionicons name="lock-closed" size={20} color={colors.textDim} />
                  )}
                </Pressable>
              );
            })}
          </View>

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
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: colors.text, fontSize: 18, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  statEmoji: { fontSize: 14 },
  statVal: { color: colors.text, fontSize: 14, fontWeight: '700', marginLeft: 4 },

  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  /* Hero */
  heroCard: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: 16,
    marginBottom: 14,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroIsland: { width: 110, height: 110 },
  heroInfo: { flex: 1 },
  heroTitle: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 2 },
  heroLevel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  heroProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  heroProgressLabel: { color: colors.textMuted, fontSize: 12 },
  heroProgressCount: { fontSize: 12, fontWeight: '700' },
  heroTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  heroFill: { height: '100%', borderRadius: 3 },

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

  /* Topic list */
  topicList: { gap: 10, marginBottom: 20 },

  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceGlass,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  topicCardLocked: { opacity: 0.55 },

  numBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numBadgeLocked: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  numBadgeTextLocked: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '700',
  },

  topicInfo: { flex: 1 },
  topicTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 3 },
  topicTitleLocked: { color: colors.textDim },
  topicSub: { color: colors.textMuted, fontSize: 11 },
  topicSubLocked: { color: colors.textDim, fontSize: 11 },
  topicResult: { fontSize: 11, fontWeight: '600' },

  testBtn: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    flexShrink: 0,
  },
  testBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  openBtn: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    flexShrink: 0,
    borderWidth: 1.5,
    borderColor: colors.purple,
  },
  openBtnText: { color: colors.purpleGlow, fontSize: 13, fontWeight: '700' },

  /* Hint */
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(144,71,255,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(144,71,255,0.25)',
    padding: 14,
    marginBottom: 14,
  },
  hintIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: { flex: 1, color: colors.textMuted, fontSize: 13, lineHeight: 20 },

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
