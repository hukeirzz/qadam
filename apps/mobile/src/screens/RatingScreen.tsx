import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RatingEntry } from '@qadam/types';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { RankBadge } from '../components/ui/RankBadge';
import { fetchGlobalRating, fetchSchoolRating, fetchClassRating } from '../services/ratingService';
import { useAppStore } from '../store/useAppStore';
import { HomeStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<HomeStackParamList, 'Rating'>;
type Scope = 'global' | 'school' | 'class';

export function RatingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const userId = useAppStore((s) => s.userId);
  const schoolId = useAppStore((s) => s.schoolId);
  const classId = useAppStore((s) => s.classId);

  const [scope, setScope] = useState<Scope>('global');
  const [entries, setEntries] = useState<RatingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetcher =
      scope === 'global'
        ? fetchGlobalRating()
        : scope === 'school'
          ? (schoolId ? fetchSchoolRating(schoolId) : Promise.resolve([]))
          : (classId ? fetchClassRating(classId) : Promise.resolve([]));

    fetcher.then((list) => {
      setEntries(list ?? []);
      setLoading(false);
    });
  }, [scope, schoolId, classId]);

  const needsSchool = scope === 'school' && !schoolId;
  const needsClass = scope === 'class' && !classId;

  return (
    <ScreenBackground>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => { vibrate(); navigation.goBack(); }} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Рейтинг</Text>
          <View style={styles.iconBtn} />
        </View>

        <View style={styles.tabs}>
          {(
            [
              ['global', 'Глобальный'],
              ['school', 'Моя школа'],
              ['class', 'Мой класс'],
            ] as [Scope, string][]
          ).map(([key, label]) => (
            <Pressable key={key} style={[styles.tab, scope === key && styles.tabActive]} onPress={() => setScope(key)}>
              <Text style={[styles.tabText, scope === key && styles.tabTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <View style={styles.empty}>
            <ActivityIndicator size="large" color={colors.purple} />
          </View>
        ) : needsSchool ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>У тебя не указана школа</Text>
          </View>
        ) : needsClass ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>У тебя не указан класс</Text>
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Пока нет данных</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
            {entries.map((e, i) => (
              <View key={e.id} style={[styles.row, e.id === userId && styles.rowSelf]}>
                <Text style={styles.rowPlace}>{i + 1}</Text>
                <Text style={styles.rowName} numberOfLines={1}>{e.display_name}</Text>
                {e.rank ? <RankBadge rank={e.rank} size="sm" /> : null}
                <Text style={styles.rowXp}>{e.xp} XP</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.text, fontSize: 17, fontWeight: '700' },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(6, 4, 20, 0.72)',
    borderRadius: 28,
    padding: 5,
    borderWidth: 1,
    borderColor: 'rgba(50, 42, 90, 0.5)',
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 22, alignItems: 'center' },
  tabActive: { backgroundColor: 'rgba(144,71,255,0.35)' },
  tabText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: colors.text, fontWeight: '700' },
  scroll: { paddingHorizontal: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  rowSelf: { backgroundColor: 'rgba(144,71,255,0.15)' },
  rowPlace: { color: colors.textMuted, fontSize: 13, fontWeight: '700', width: 24 },
  rowName: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '600' },
  rowXp: { color: colors.purpleGlow, fontSize: 13, fontWeight: '700', marginLeft: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 15, textAlign: 'center', paddingHorizontal: 32 },
});
