import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Competition } from '@qadam/types';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { listCompetitions } from '../services/competitionsService';
import { useAppStore } from '../store/useAppStore';
import { HomeStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<HomeStackParamList, 'Competitions'>;

type Filter = 'all' | 'school' | 'platform';

function daysLeft(endAt: string): string {
  const ms = new Date(endAt).getTime() - Date.now();
  if (ms <= 0) return 'Завершено';
  const days = Math.ceil(ms / 86_400_000);
  return `Осталось ${days} дн.`;
}

export function CompetitionsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const schoolId = useAppStore((s) => s.schoolId);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    listCompetitions(schoolId).then((list) => {
      setCompetitions(list ?? []);
      setLoading(false);
    });
  }, [schoolId]);

  const filtered = competitions.filter((c) => filter === 'all' || c.source === filter);

  return (
    <ScreenBackground>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => { vibrate(); navigation.goBack(); }} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Соревнования</Text>
          <View style={styles.iconBtn} />
        </View>

        <View style={styles.tabs}>
          {(
            [
              ['all', 'Все'],
              ['school', 'От школы'],
              ['platform', 'От платформы'],
            ] as [Filter, string][]
          ).map(([key, label]) => (
            <Pressable
              key={key}
              style={[styles.tab, filter === key && styles.tabActive]}
              onPress={() => setFilter(key)}
            >
              <Text style={[styles.tabText, filter === key && styles.tabTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <View style={styles.empty}>
            <ActivityIndicator size="large" color={colors.purple} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Пока нет соревнований</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
            showsVerticalScrollIndicator={false}
          >
            {filtered.map((c) => (
              <Pressable
                key={c.id}
                style={styles.card}
                onPress={() => { vibrate(); navigation.navigate('CompetitionDetail', { competitionId: c.id }); }}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="trophy" size={20} color={colors.gold} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{c.title}</Text>
                  {c.prize ? <Text style={styles.cardPrize}>Приз: {c.prize}</Text> : null}
                  <Text style={styles.cardMeta}>{daysLeft(c.end_at)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
              </Pressable>
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
  tabText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: colors.text, fontWeight: '700' },
  scroll: { paddingHorizontal: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,209,102,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  cardPrize: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  cardMeta: { color: colors.purpleGlow, fontSize: 12, marginTop: 4, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 15 },
});
