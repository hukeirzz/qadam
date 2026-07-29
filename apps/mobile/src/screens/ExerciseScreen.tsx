import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { HeaderBar } from '../components/home/HeaderBar';
import { PracticeIslandCard } from '../components/practice/PracticeIslandCard';
import { colors, glow, subjectColors } from '../theme/colors';
import { subjects } from '../data/subjects';
import { islandImages } from '../assets/islandImages';
import { useAppStore } from '../store/useAppStore';
import { ExerciseStackParamList } from '../types/navigation';
import { playSound, vibrate } from '../services/soundService';

type NavProp = NativeStackNavigationProp<ExerciseStackParamList, 'ExerciseHome'>;

const PRACTICE_IDS = ['math', 'geometry', 'analogies', 'reading', 'grammar'] as const;

const schoolIslandImage = require('../../assets/partnershoolicon.png');

export const SUBJECT_META: Record<string, { icon: string; premiumId: string }> = {
  math:      { icon: 'Σ',  premiumId: 'math_premium' },
  geometry:  { icon: 'Δ',  premiumId: 'geometry_premium' },
  analogies: { icon: '⇄', premiumId: 'analogies_premium' },
  reading:   { icon: '📖', premiumId: 'reading_premium' },
  grammar:   { icon: 'Aa', premiumId: 'grammar_premium' },
};

function SchoolTestsBanner({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={[styles.bannerShadow, { shadowColor: glow.purple }]} onPress={onPress}>
      <View style={styles.banner}>
        <View style={styles.bannerIslandWrap}>
          <View style={[styles.bannerIslandGlow, { shadowColor: glow.purple }]} />
          <Image source={schoolIslandImage} style={styles.bannerIslandImage} resizeMode="contain" />
        </View>

        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Тесты</Text>
          <Text style={styles.bannerSubtitle}>
            Решай тесты, получай баллы и поднимай рейтинг школы!
          </Text>

          <View style={styles.bannerBtn}>
            <Text style={styles.bannerBtnText}>Перейти</Text>
          </View>

          <Text style={styles.bannerCount}>
            Доступно тестов: <Text style={styles.bannerCountValue}>5</Text>
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function ExerciseScreen() {
  const insets = useSafeAreaInsets();
  const completedTopics = useAppStore((s) => s.completedTopics);
  const navigation = useNavigation<NavProp>();

  const practiceSubjects = subjects.filter((s) => PRACTICE_IDS.includes(s.id as any));

  const goToSchoolTests = () => {
    vibrate();
    navigation.navigate('SchoolTests');
  };

  const goToSubject = (subjectId: string) => {
    playSound('tap');
    navigation.navigate('ExerciseSubject', { subjectId });
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
                Решай задачи, зарабатывай XP и повышай свой ранг!
              </Text>
            </View>
          </View>

          {/* ── Разделы ── */}
          <Text style={styles.sectionTitle}>Выбери раздел</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectRow}
          >
            {practiceSubjects.map((subject) => {
              const palette = subjectColors[subject.id as keyof typeof subjectColors];
              const completedCount = subject.topics.filter((t) => completedTopics.includes(t.id)).length;
              const total = subject.topics.length;

              return (
                <PracticeIslandCard
                  key={subject.id}
                  style={styles.subjectCell}
                  title={subject.title}
                  imageSrc={islandImages[subject.id as keyof typeof islandImages]}
                  accentColor={palette.primary}
                  glowColor={palette.glow}
                  currentSteps={completedCount}
                  totalSteps={total}
                  onPress={() => goToSubject(subject.id)}
                />
              );
            })}
          </ScrollView>

          {/* ── Тесты партнёрской школы ── */}
          <SchoolTestsBanner onPress={goToSchoolTests} />
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

  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 22,
    marginBottom: 12,
  },
  subjectRow: { gap: 12, paddingBottom: 4 },
  subjectCell: { width: 132 },

  /* School tests banner */
  bannerShadow: {
    marginTop: 26,
    borderRadius: 26,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  banner: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: 26,
    padding: 16,
  },
  bannerIslandWrap: {
    width: 96,
    height: 96,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerIslandGlow: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 999,
    backgroundColor: 'rgba(144,71,255,0.3)',
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  bannerIslandImage: {
    width: '100%',
    height: '100%',
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: colors.textMuted,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '500',
    marginBottom: 14,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.purple,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 14,
    shadowColor: glow.purple,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 10,
  },
  bannerBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  bannerCount: {
    color: colors.textMuted,
    fontSize: 12.5,
    fontWeight: '600',
  },
  bannerCountValue: {
    color: colors.purpleGlow,
    fontWeight: '800',
  },
});
