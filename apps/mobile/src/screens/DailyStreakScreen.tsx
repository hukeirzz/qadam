import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { ProfileStackParamList } from '../navigation/ProfileStack';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'DailyStreak'>;

const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function DailyStreakScreen({ navigation }: Props) {
  const streak = useAppStore((s) => s.streak);
  const weekActivity = useAppStore((s) => s.weekActivity);
  const dailyGoalCurrent = useAppStore((s) => s.dailyGoalCurrent);
  const dailyGoalTarget = useAppStore((s) => s.dailyGoalTarget);
  const completedSteps = useAppStore((s) => s.completedSteps);
  const insets = useSafeAreaInsets();

  const goalPct = dailyGoalTarget > 0 ? (dailyGoalCurrent / dailyGoalTarget) * 100 : 0;

  return (
    <ScreenBackground accentColor="#FF6B35">
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Ежедневные цели</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Flame + streak count */}
          <View style={styles.flameSection}>
            <Text style={styles.flame}>🔥</Text>
            <Text style={styles.streakCount}>{streak}</Text>
            <Text style={styles.streakLabel}>Текущая серия</Text>
          </View>

          {/* Week calendar */}
          <View style={styles.card}>
            <View style={styles.weekRow}>
              {DAYS_SHORT.map((day, i) => {
                const done = weekActivity[i] ?? false;
                return (
                  <View key={day} style={styles.dayCol}>
                    <Text style={styles.dayLabel}>{day}</Text>
                    <View style={[styles.dayDot, done && styles.dayDotDone]}>
                      {done ? (
                        <Ionicons name="checkmark" size={14} color={colors.text} />
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Daily goal */}
          <View style={styles.card}>
            <Text style={styles.goalTitle}>Сегодняшняя цель</Text>
            <View style={styles.goalRow}>
              <Text style={styles.goalText}>
                Пройди {dailyGoalTarget} шагов
              </Text>
              <Text style={styles.goalProgress}>
                {dailyGoalCurrent}/{dailyGoalTarget}
              </Text>
            </View>
            <View style={styles.goalTrack}>
              <LinearGradient
                colors={[colors.purple, colors.purpleGlow]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[styles.goalFill, { width: `${goalPct}%` }]}
              />
            </View>
            <Pressable onPress={() => navigation.goBack()} style={styles.ctaWrap}>
              <LinearGradient
                colors={[colors.purple, '#6B2FD4']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.cta}
              >
                <Text style={styles.ctaText}>Продолжить</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Overall stats */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Общая статистика</Text>
            {[
              { icon: '🏆', label: 'Всего шагов', value: String(completedSteps + 1124) },
              { icon: '🔥', label: 'Лучший стрик', value: `${streak} дня` },
              { icon: '⏱️', label: 'Время обучения', value: '48 ч' },
            ].map((item) => (
              <View key={item.label} style={styles.statRow}>
                <Text style={styles.statIcon}>{item.icon}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={styles.statValue}>{item.value}</Text>
              </View>
            ))}
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 16,
  },
  flameSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  flame: { fontSize: 56 },
  streakCount: {
    color: colors.text,
    fontSize: 56,
    fontWeight: '800',
    marginTop: 8,
    lineHeight: 60,
  },
  streakLabel: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 4,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotDone: {
    backgroundColor: colors.purple,
    borderColor: colors.purpleGlow,
  },
  goalTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  goalProgress: {
    color: colors.purple,
    fontSize: 18,
    fontWeight: '800',
  },
  goalTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  goalFill: {
    height: '100%',
    borderRadius: 4,
  },
  ctaWrap: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  cta: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
  },
  ctaText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  statIcon: { fontSize: 18, width: 24 },
  statLabel: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
