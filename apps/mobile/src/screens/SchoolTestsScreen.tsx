import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { colors, subjectColors, glow } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { ExerciseStackParamList, MainTabParamList } from '../types/navigation';
import { BaseSubjectId } from '../types/subject';
import { SUBJECT_META } from './ExerciseScreen';
import { fetchSchoolTests } from '../services/schoolTestsService';
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

const SUBJECT_LABELS: Record<string, string> = {
  math: 'Математика', geometry: 'Геометрия', analogies: 'Аналогии',
  reading: 'Чтение', grammar: 'Грамматика',
};

const FALLBACK_PALETTE = { primary: colors.purple, glow: glow.purple };

type SchoolTestRow = Awaited<ReturnType<typeof fetchSchoolTests>>[number];

export function SchoolTestsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const userName = useAppStore((s) => s.userName);
  const tabNavigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [filter, setFilter] = useState<FilterId>('all');
  const [tests, setTests] = useState<SchoolTestRow[]>([]);
  const [loading, setLoading] = useState(true);

  const initial = userName ? userName.charAt(0).toUpperCase() : '?';
  const filteredTests = tests.filter((t) => filter === 'all' || t.subjectId === filter);

  // Загружаем при каждом возврате на экран — после прохождения теста
  // отметка «Пройден» должна появиться без перезапуска приложения.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      fetchSchoolTests().then((rows) => {
        if (!cancelled) { setTests(rows); setLoading(false); }
      });
      return () => { cancelled = true; };
    }, []),
  );

  const startTest = (test: SchoolTestRow) => {
    vibrate();
    navigation.navigate('SchoolTestQuiz', { testId: test.id, title: test.title });
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

          {loading ? (
            <ActivityIndicator size="large" color={colors.purple} style={styles.loading} />
          ) : filteredTests.length === 0 ? (
            <Text style={styles.emptyText}>Пока нет тестов от вашей школы</Text>
          ) : (
            <View style={styles.testList}>
              {filteredTests.map((test) => {
                const palette = test.subjectId
                  ? subjectColors[test.subjectId as keyof typeof subjectColors] ?? FALLBACK_PALETTE
                  : FALLBACK_PALETTE;
                const icon = test.subjectId ? SUBJECT_META[test.subjectId]?.icon ?? '📝' : '📝';
                const passed = test.myScore != null;

                return (
                  <View key={test.id} style={styles.testCard}>
                    <View style={styles.testTopRow}>
                      <View style={styles.testLeftCol}>
                        <View style={[styles.testIcon, { backgroundColor: `${palette.primary}26` }]}>
                          <Text style={[styles.testIconGlyph, { color: palette.primary }]}>{icon}</Text>
                        </View>
                      </View>

                      <View style={styles.testInfo}>
                        <View style={styles.pillRow}>
                          {test.subjectId && (
                            <View style={styles.testLabelPill}>
                              <Text style={styles.testLabelPillText}>{SUBJECT_LABELS[test.subjectId] ?? test.subjectId}</Text>
                            </View>
                          )}
                          {test.targetRank && (
                            <View style={styles.rankPill}>
                              <Text style={styles.rankPillText}>Ранг {test.targetRank}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.testSubject} numberOfLines={1}>{test.title}</Text>
                        <Text style={styles.testMeta}>{test.questionCount} вопросов</Text>
                      </View>

                      {passed ? (
                        <View style={styles.passedBadge}>
                          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                          <Text style={styles.passedBadgeText}>{test.myScore} / {test.myTotal}</Text>
                        </View>
                      ) : (
                        <Pressable style={styles.startBtn} onPress={() => startTest(test)}>
                          <Text style={styles.startBtnText}>Начать тест</Text>
                        </Pressable>
                      )}
                    </View>
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
    backgroundColor: '#F3F1FC',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: 'rgba(144,71,255,0.35)', borderColor: 'rgba(144,71,255,0.5)' },
  filterChipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: colors.text, fontWeight: '700' },

  loading: { marginTop: 30 },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 30 },

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
  pillRow: { flexDirection: 'row', gap: 6, marginBottom: 5 },
  testLabelPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(144,71,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(144,71,255,0.35)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  testLabelPillText: { color: colors.purpleGlow, fontSize: 10.5, fontWeight: '700' },
  rankPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,194,75,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,194,75,0.4)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  rankPillText: { color: '#FFC24B', fontSize: 10.5, fontWeight: '700' },
  testSubject: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  testMeta: { color: colors.textMuted, fontSize: 12 },

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

  passedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(46,229,157,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(46,229,157,0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexShrink: 0,
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  passedBadgeText: { color: colors.success, fontSize: 12.5, fontWeight: '800' },
});
