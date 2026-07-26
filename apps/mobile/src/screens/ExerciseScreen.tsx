import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { HeaderBar } from '../components/home/HeaderBar';
import { colors, subjectColors } from '../theme/colors';
import { subjects } from '../data/subjects';
import { islandImages } from '../assets/islandImages';
import { useAppStore } from '../store/useAppStore';
import { ExerciseStackParamList } from '../types/navigation';
import { playSound } from '../services/soundService';

type NavProp = NativeStackNavigationProp<ExerciseStackParamList, 'ExerciseHome'>;

const PRACTICE_IDS = ['math', 'geometry', 'analogies', 'reading', 'grammar'] as const;

export const SUBJECT_META: Record<string, { icon: string; premiumId: string }> = {
  math:      { icon: 'Σ',  premiumId: 'math_premium' },
  geometry:  { icon: 'Δ',  premiumId: 'geometry_premium' },
  analogies: { icon: '⇄', premiumId: 'analogies_premium' },
  reading:   { icon: '📖', premiumId: 'reading_premium' },
  grammar:   { icon: 'Aa', premiumId: 'grammar_premium' },
};

export function ExerciseScreen() {
  const insets = useSafeAreaInsets();
  const completedTopics = useAppStore((s) => s.completedTopics);
  const premiumUnlocked = useAppStore((s) => s.premiumUnlocked);
  const navigation = useNavigation<NavProp>();

  const practiceSubjects = subjects.filter((s) => PRACTICE_IDS.includes(s.id as any));

  const goToPremium = () => {
    playSound('tap');
    // Открываем Premium внутри стека Практики, чтобы «назад» вернул сюда же.
    navigation.navigate('Premium');
  };

  return (
    <ScreenBackground>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 130 }]}
        >
          {/* Компенсируем paddingHorizontal скролла: у HeaderBar и заголовка свои отступы */}
          <View style={styles.headerBlock}>
            <HeaderBar />

            {/* ── Header ── */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Практика</Text>
              <Text style={styles.headerSub}>
                Закрепляй знания, решай задачи и отслеживай прогресс
              </Text>
            </View>
          </View>

          {/* ── Базовый уровень ── */}
          <View style={styles.sectionHeader}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <View>
              <Text style={styles.sectionTitle}>Базовый уровень</Text>
              <Text style={styles.sectionSub}>Доступные разделы</Text>
            </View>
          </View>

          <View style={styles.bigCard}>
            {practiceSubjects.map((subject, index) => {
              const palette = subjectColors[subject.id as keyof typeof subjectColors];
              const completedCount = subject.topics.filter((t) =>
                completedTopics.includes(t.id),
              ).length;
              const total = subject.topics.length;
              const progress = total > 0 ? completedCount / total : 0;
              const isLast = index === practiceSubjects.length - 1;

              return (
                <View key={subject.id}>
                  <Pressable
                    style={styles.subjectRow}
                    onPress={() => {
                      playSound('tap');
                      navigation.navigate('ExerciseSubject', { subjectId: subject.id });
                    }}
                  >
                    <Image
                      source={islandImages[subject.id as keyof typeof islandImages]}
                      style={styles.islandImg}
                      resizeMode="contain"
                    />
                    <View style={styles.subjectInfo}>
                      <Text style={styles.subjectTitle}>{subject.title}</Text>
                      <Text style={styles.subjectCount}>
                        Решено {completedCount}/{total}
                      </Text>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${progress * 100}%` as any,
                              backgroundColor: palette.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </Pressable>
                  {!isLast && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>

          {/* ── Продвинутый уровень ── */}
          <View style={styles.sectionHeader}>
            <View style={[styles.dot, { backgroundColor: colors.purple }]} />
            <View>
              <Text style={styles.sectionTitle}>Продвинутый уровень</Text>
              <Text style={styles.sectionSub}>Закрытые разделы</Text>
            </View>
          </View>

          {premiumUnlocked ? (
            /* Premium разблокирован — показываем предметы */
            <View style={styles.bigCard}>
              {practiceSubjects.map((subject, index) => {
                const premiumId = (subject.id + '_premium') as keyof typeof islandImages;
                const palette = subjectColors[subject.id as keyof typeof subjectColors];
                const isLast = index === practiceSubjects.length - 1;

                return (
                  <View key={premiumId}>
                    <Pressable
                      style={styles.subjectRow}
                      onPress={() => {
                        playSound('tap');
                        navigation.navigate('ExerciseSubject', { subjectId: subject.id + '_premium' });
                      }}
                    >
                      <Image
                        source={islandImages[premiumId]}
                        style={styles.islandImg}
                        resizeMode="contain"
                      />
                      <View style={styles.subjectInfo}>
                        <Text style={styles.subjectTitle}>{subject.title}</Text>
                        <Text style={styles.subjectCount}>Продвинутый</Text>
                        <View style={styles.progressTrack}>
                          <View style={[styles.progressFill, { width: '0%', backgroundColor: palette.primary }]} />
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </Pressable>
                    {!isLast && <View style={styles.divider} />}
                  </View>
                );
              })}
            </View>
          ) : (
            /* Premium заблокирован — карточка-замок */
            <View style={styles.bigCard}>
              {practiceSubjects.map((subject, index) => {
                const premiumId = (subject.id + '_premium') as keyof typeof islandImages;
                const isLast = index === practiceSubjects.length - 1;
                return (
                  <View key={premiumId}>
                    <Pressable style={styles.lockedRow} onPress={goToPremium}>
                      <View style={styles.lockedImgWrap} pointerEvents="none">
                        <Image
                          source={islandImages[premiumId]}
                          style={styles.lockedImg}
                          resizeMode="contain"
                        />
                        <View style={styles.lockBadgeSquare}>
                          <Ionicons name="lock-closed" size={22} color="#FFFFFF" />
                        </View>
                      </View>
                      <View style={styles.lockedInfo}>
                        <Text style={styles.lockedTitle}>{subject.title}</Text>
                        <Text style={styles.lockedLevel}>Продвинутый уровень</Text>
                        <Text style={styles.lockedHint}>Пройди предыдущую тему</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
                    </Pressable>
                    {!isLast && <View style={styles.divider} />}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  headerBlock: {
    marginHorizontal: -16,
    marginTop: -12,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'left',
  },
  headerSub: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'left',
    marginTop: 4,
    lineHeight: 18,
  },

  scroll: { paddingHorizontal: 16, paddingTop: 12, gap: 0 },

  /* Section header */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSub: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },

  /* Big card wrapping all subjects */
  bigCard: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },

  divider: {
    height: 1,
    backgroundColor: colors.borderMuted,
    marginHorizontal: 16,
  },

  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 0,
    paddingRight: 14,
    paddingVertical: 6,
    gap: 10,
  },

  islandImg: {
    width: 100,
    height: 100,
  },

  subjectInfo: {
    flex: 1,
    gap: 3,
  },
  subjectTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subjectCount: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  solveBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  solveBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* Lock card */
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 14,
    paddingVertical: 6,
  },
  lockedImgWrap: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedImg: {
    width: 140,
    height: 140,
  },
  lockBadgeSquare: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(124, 58, 237, 0.4)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B47AFF',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  lockedInfo: {
    flex: 1,
    gap: 4,
  },
  lockedTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  lockedLevel: {
    color: colors.purpleGlow,
    fontSize: 13,
    fontWeight: '700',
  },
  lockedHint: {
    color: colors.textMuted,
    fontSize: 12.5,
  },
});
