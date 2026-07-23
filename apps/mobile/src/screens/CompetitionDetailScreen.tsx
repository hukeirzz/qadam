import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Competition } from '@qadam/types';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import {
  fetchCompetitionById,
  fetchCompetitionLeaderboard,
  joinCompetition,
} from '../services/competitionsService';
import { useAppStore } from '../store/useAppStore';
import { HomeStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<HomeStackParamList, 'CompetitionDetail'>;

type LeaderboardRow = { userId: string; displayName: string; xpEarned: number };

export function CompetitionDetailScreen({ navigation, route }: Props) {
  const { competitionId } = route.params;
  const insets = useSafeAreaInsets();
  const userId = useAppStore((s) => s.userId);

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const load = () => {
    Promise.all([fetchCompetitionById(competitionId), fetchCompetitionLeaderboard(competitionId)]).then(
      ([c, lb]) => {
        setCompetition(c);
        setLeaderboard(lb ?? []);
        setLoading(false);
      },
    );
  };

  useEffect(() => { load(); }, [competitionId]);

  if (loading || !competition) {
    return (
      <ScreenBackground>
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      </ScreenBackground>
    );
  }

  const hasJoined = leaderboard.some((r) => r.userId === userId);
  const isOver = new Date(competition.end_at).getTime() < Date.now();
  const myPlace = hasJoined ? leaderboard.findIndex((r) => r.userId === userId) + 1 : null;

  const handleJoin = async () => {
    if (!userId) return;
    vibrate();
    setJoining(true);
    await joinCompetition(competitionId, userId);
    setJoining(false);
    load();
  };

  return (
    <ScreenBackground>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => { vibrate(); navigation.goBack(); }} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{competition.title}</Text>
          <View style={styles.iconBtn} />
        </View>

        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
          {isOver && (
            <View style={styles.resultBanner}>
              <Ionicons name="trophy" size={22} color={colors.gold} />
              <Text style={styles.resultText}>
                {myPlace ? `Соревнование завершено — твоё место: ${myPlace}` : 'Соревнование завершено'}
              </Text>
            </View>
          )}

          {competition.description ? <Text style={styles.description}>{competition.description}</Text> : null}
          {competition.prize ? (
            <View style={styles.infoRow}>
              <Ionicons name="gift-outline" size={16} color={colors.textMuted} />
              <Text style={styles.infoText}>Приз: {competition.prize}</Text>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
            <Text style={styles.infoText}>
              {new Date(competition.start_at).toLocaleDateString('ru-RU')} — {new Date(competition.end_at).toLocaleDateString('ru-RU')}
            </Text>
          </View>

          {!isOver && !hasJoined && (
            <Pressable onPress={handleJoin} disabled={joining} style={styles.joinWrap}>
              <LinearGradient colors={[colors.purple, '#6B2FD4']} style={styles.joinBtn}>
                {joining ? <ActivityIndicator color="#fff" /> : <Text style={styles.joinText}>Участвовать</Text>}
              </LinearGradient>
            </Pressable>
          )}

          <Text style={styles.sectionTitle}>Таблица лидеров</Text>
          {leaderboard.length === 0 ? (
            <Text style={styles.emptyLeaderboard}>Пока никто не участвует</Text>
          ) : (
            leaderboard.map((row, i) => (
              <View
                key={row.userId}
                style={[styles.row, row.userId === userId && styles.rowSelf]}
              >
                <Text style={styles.rowPlace}>{i + 1}</Text>
                <Text style={styles.rowName} numberOfLines={1}>{row.displayName}</Text>
                <Text style={styles.rowXp}>{row.xpEarned} XP</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.text, fontSize: 16, fontWeight: '700' },
  scroll: { paddingHorizontal: 20 },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,209,102,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,209,102,0.35)',
    marginBottom: 16,
  },
  resultText: { color: colors.text, fontSize: 13, fontWeight: '700', flex: 1 },
  description: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoText: { color: colors.textMuted, fontSize: 13 },
  joinWrap: { marginTop: 16, marginBottom: 24 },
  joinBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  joinText: { color: colors.text, fontWeight: '700', fontSize: 15 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  emptyLeaderboard: { color: colors.textMuted, fontSize: 13 },
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
  rowPlace: { color: colors.textMuted, fontSize: 13, fontWeight: '700', width: 20 },
  rowName: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '600' },
  rowXp: { color: colors.purpleGlow, fontSize: 13, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
