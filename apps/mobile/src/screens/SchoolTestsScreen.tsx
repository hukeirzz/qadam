import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { colors, subjectColors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { subjects } from '../data/subjects';
import { ExerciseStackParamList, MainTabParamList } from '../types/navigation';
import { BaseSubjectId, BASE_SUBJECT_IDS } from '../types/subject';
import { SUBJECT_META } from './ExerciseScreen';
import { vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<ExerciseStackParamList, 'SchoolTests'>;

const schoolBuildingImage = require('../../assets/partnershoolicon.png');

type FilterId = 'all' | BaseSubjectId;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'math', label: 'Математика' },
  { id: 'geometry', label: 'Геометрия' },
  { id: 'analogies', label: 'Аналогии' },
  { id: 'reading', label: 'Чтение' },
  { id: 'grammar', label: 'Грамматика' },
];

interface SchoolTest {
  id: string;
  subjectId: BaseSubjectId;
  subjectTitle: string;
  topicTitle: string;
  icon: string;
  questionCount: number;
  isNew: boolean;
}

const QUESTION_COUNTS: Record<BaseSubjectId, number> = {
  math: 25,
  geometry: 20,
  analogies: 15,
  reading: 20,
  grammar: 20,
};

// Разделы ОРТ — подпись-пилюля с названием раздела, а крупным заголовком
// идёт конкретная тема, по которой будет тест.
const SCHOOL_TESTS: SchoolTest[] = BASE_SUBJECT_IDS.map((id) => {
  const subject = subjects.find((s) => s.id === id)!;
  return {
    id: `${id}-1`,
    subjectId: id,
    subjectTitle: subject.title,
    topicTitle: subject.topics[0]?.title ?? subject.title,
    icon: SUBJECT_META[id].icon,
    questionCount: QUESTION_COUNTS[id],
    isNew: true,
  };
});

export function SchoolTestsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const userName = useAppStore((s) => s.userName);
  const tabNavigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [filter, setFilter] = useState<FilterId>('all');

  const initial = userName ? userName.charAt(0).toUpperCase() : '?';
  const filteredTests = SCHOOL_TESTS.filter((t) => filter === 'all' || t.subjectId === filter);

  const startTest = (test: SchoolTest) => {
    vibrate();
    Alert.alert(`${test.subjectTitle} • ${test.topicTitle}`, 'Тест скоро будет доступен для прохождения.');
  };

  return (
    <ScreenBackground>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 130 }]}
        >
          <View style={styles.topRow}>
            <Pressable
              style={styles.iconBtn}
              onPress={() => { vibrate(); navigation.goBack(); }}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
            <Pressable
              style={styles.avatarBadge}
              onPress={() => { vibrate(); tabNavigation.navigate('ProfileTab'); }}
            >
              <Text style={styles.avatarText}>{initial}</Text>
            </Pressable>
          </View>

          <View style={styles.heroRow}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>Тесты для{'\n'}партнёрской школы</Text>
              <Text style={styles.heroSubtitle}>
                Решай тесты, зарабатывай XP и помогай своей школе быть лучшей!
              </Text>
            </View>
            <Image source={schoolBuildingImage} style={styles.heroImage} resizeMode="contain" />
          </View>

          <Text style={styles.sectionTitle}>Доступные тесты</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTERS.map((f) => (
              <Pressable
                key={f.id}
                style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
                onPress={() => { vibrate(); setFilter(f.id); }}
              >
                <Text style={[styles.filterChipText, filter === f.id && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.testList}>
            {filteredTests.map((test) => {
              const palette = subjectColors[test.subjectId];
              return (
                <View key={test.id} style={styles.testCard}>
                  <View style={styles.testTopRow}>
                    <View style={styles.testLeftCol}>
                      {test.isNew && (
                        <View style={styles.newBadge}>
                          <Text style={styles.newBadgeText}>Новое</Text>
                        </View>
                      )}
                      <View style={[styles.testIcon, { backgroundColor: `${palette.primary}26` }]}>
                        <Text style={[styles.testIconGlyph, { color: palette.primary }]}>{test.icon}</Text>
                      </View>
                    </View>

                    <View style={styles.testInfo}>
                      <View style={styles.testLabelPill}>
                        <Text style={styles.testLabelPillText}>{test.subjectTitle}</Text>
                      </View>
                      <Text style={styles.testSubject} numberOfLines={1}>{test.topicTitle}</Text>
                      <Text style={styles.testMeta}>{test.questionCount} вопросов</Text>
                    </View>

                    <Pressable style={styles.startBtn} onPress={() => startTest(test)}>
                      <Text style={styles.startBtnText}>Начать тест</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  avatarBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1.5,
    borderColor: colors.purple,
  },
  avatarText: { color: colors.text, fontSize: 15, fontWeight: '800' },

  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
  },
  heroTextWrap: { flex: 1, paddingRight: 8 },
  heroTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 10,
  },
  heroSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  heroImage: {
    width: 138,
    height: 138,
    flexShrink: 0,
  },

  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: 12 },

  filterRow: { gap: 8, paddingBottom: 16 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(6, 4, 20, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(50, 42, 90, 0.5)',
  },
  filterChipActive: { backgroundColor: 'rgba(144,71,255,0.35)', borderColor: 'rgba(144,71,255,0.5)' },
  filterChipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: colors.text, fontWeight: '700' },

  testList: { gap: 12 },
  testCard: {
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: 18,
    padding: 14,
  },
  testTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  testLeftCol: { alignItems: 'center', gap: 2, flexShrink: 0 },
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  testIconGlyph: { fontSize: 19, fontWeight: '800' },
  testInfo: { flex: 1, minWidth: 0, justifyContent: 'center' },
  testLabelPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(144,71,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(144,71,255,0.35)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginBottom: 5,
  },
  testLabelPillText: { color: colors.purpleGlow, fontSize: 10.5, fontWeight: '700' },
  testSubject: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  testMeta: { color: colors.textMuted, fontSize: 12 },

  newBadge: {
    backgroundColor: 'rgba(46,229,157,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(46,229,157,0.3)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  newBadgeText: { color: colors.success, fontSize: 10, fontWeight: '800' },
  startBtn: {
    backgroundColor: colors.purple,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexShrink: 0,
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  startBtnText: { color: '#FFFFFF', fontSize: 12.5, fontWeight: '800' },
});
