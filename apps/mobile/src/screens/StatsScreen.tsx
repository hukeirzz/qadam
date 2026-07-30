import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text } from '../components/ui/Text';
import Svg, {
  Circle,
  Defs,
  Line as SvgLine,
  LinearGradient as SvgGradient,
  Polygon,
  Polyline,
  Stop,
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { Rank } from '@qadam/business-logic';
import { dateKey, useAppStore } from '../store/useAppStore';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { RankBadge } from '../components/ui/RankBadge';
import { colors, glow, subjectColors } from '../theme/colors';
import { getTopicIds, subjects } from '../data/subjects';
import { vibrate } from '../services/soundService';

const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']; // Date.getDay(): 0 = воскресенье
const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

type Period = '7d' | 'month' | 'year';

const PERIODS: { key: Period; label: string }[] = [
  { key: '7d', label: '7 дней' },
  { key: 'month', label: 'Месяц' },
  { key: 'year', label: 'Год' },
];

const RANK_ORDER: Rank[] = ['D', 'C', 'B', 'A', 'S'];

const CHART_H = 150;
const CHART_TOP_PAD = 18;
const CHART_BOTTOM_PAD = 6;
const Y_AXIS_W = 28;

/** День засчитан в серию, если в этот день пройдена хотя бы одна тема. */
function isActiveDay(dailySteps: Record<string, number>, d: Date): boolean {
  return (dailySteps[dateKey(d)] ?? 0) > 0;
}

/** Максимум по оси Y для периода — не «красивое» число, а реальный предел (день/неделя/месяц). */
function maxForPeriod(period: Period): number {
  if (period === '7d' || period === 'month') return 1;
  return 31;
}

/** Строит {data, labels}: сколько дней периода вошло в серию активности (не XP). */
function buildSeries(period: Period, dailySteps: Record<string, number>): { data: number[]; labels: string[] } {
  const today = new Date();

  if (period === '7d') {
    const data: number[] = [];
    const labels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      data.push(isActiveDay(dailySteps, d) ? 1 : 0);
      labels.push(WEEKDAYS[d.getDay()]);
    }
    return { data, labels };
  }

  if (period === 'month') {
    const data: number[] = [];
    const labels: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      data.push(isActiveDay(dailySteps, d) ? 1 : 0);
      const pos = 29 - i;
      labels.push(pos % 6 === 0 || pos === 29 ? String(d.getDate()) : '');
    }
    return { data, labels };
  }

  // 'year' — 12 месячных корзин. Значение — сколько дней месяца вошли в серию.
  const data: number[] = [];
  const labels: string[] = [];
  for (let m = 11; m >= 0; m--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
    let activeDays = 0;
    for (const key in dailySteps) {
      const [y, mo] = key.split('-').map(Number);
      if (y === monthDate.getFullYear() && mo === monthDate.getMonth() + 1 && dailySteps[key] > 0) activeDays++;
    }
    data.push(activeDays);
    labels.push(MONTHS[monthDate.getMonth()]);
  }
  return { data, labels };
}

function ActivityChart({
  data,
  labels,
  color,
  max,
}: {
  data: number[];
  labels: string[];
  color: string;
  max: number;
}) {
  const { width } = useWindowDimensions();
  const chartW = width - 32 - 36 - Y_AXIS_W - 8; // экран - паддинг скролла - паддинг карточки - ось Y - зазор
  const niceMax = Math.max(1, max);
  const n = data.length;
  const plotH = CHART_H - CHART_TOP_PAD - CHART_BOTTOM_PAD;
  const baselineY = CHART_H - CHART_BOTTOM_PAD;

  const points = data.map((val, i) => {
    const x = n > 1 ? (i / (n - 1)) * chartW : chartW / 2;
    const y = CHART_TOP_PAD + (1 - val / niceMax) * plotH;
    return { x, y, val };
  });

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints = `${points[0]?.x ?? 0},${baselineY} ${linePoints} ${points[points.length - 1]?.x ?? 0},${baselineY}`;
  // Целые дни, поэтому не всегда есть смысл в 5 засечках — берём
  // min(4, niceMax) шагов, чтобы для «1» получить просто «1»/«0».
  const steps = Math.min(4, niceMax);
  const yLabels = Array.from({ length: steps + 1 }, (_, i) => Math.round((niceMax / steps) * (steps - i)));

  return (
    <View style={styles.chartRow}>
      <View style={styles.yAxis}>
        {yLabels.map((v, i) => (
          <Text key={i} style={styles.yAxisLabel}>{v}</Text>
        ))}
      </View>
      <View>
        <Svg width={chartW} height={CHART_H}>
          <Defs>
            <SvgGradient id="statsAreaFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.35} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </SvgGradient>
          </Defs>
          {yLabels.map((_, k) => {
            const y = CHART_TOP_PAD + (plotH / steps) * k;
            return (
              <SvgLine
                key={k}
                x1={0} y1={y} x2={chartW} y2={y}
                stroke="#ECE9F7"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            );
          })}
          <Polygon points={areaPoints} fill="url(#statsAreaFill)" />
          <Polyline
            points={linePoints}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {points.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} stroke={colors.background} strokeWidth={1.5} />
          ))}
        </Svg>
        <View style={[styles.xAxis, { width: chartW }]}>
          {labels.map((l, i) =>
            l ? (
              <Text
                key={i}
                style={[styles.xAxisLabel, { left: points[i].x - 14 }]}
              >
                {l}
              </Text>
            ) : null,
          )}
        </View>
      </View>
    </View>
  );
}

export function StatsScreen() {
  const insets = useSafeAreaInsets();

  const completedTopics = useAppStore((s) => s.completedTopics);
  const dailySteps = useAppStore((s) => s.dailySteps);
  const remoteTopicIds = useAppStore((s) => s.remoteTopicIds);
  const userRank = useAppStore((s) => s.rank) ?? 'D';
  const [selectedRank, setSelectedRank] = useState<Rank>(userRank);
  const [period, setPeriod] = useState<Period>('7d');

  const series = useMemo(() => buildSeries(period, dailySteps), [period, dailySteps]);

  // Реальные темы/теория/вопросы существуют только для D ранга — для
  // C/B/A/S контента ещё нет, поэтому «Разделы» должны считать темы именно
  // выбранного ранга, а не общий прогресс независимо от фильтра.
  const isRealRank = selectedRank === RANK_ORDER[0];

  const subjectStats = subjects.map((subject) => {
    const ids = remoteTopicIds[subject.id]?.length ? remoteTopicIds[subject.id] : getTopicIds(subject.id);
    const total = isRealRank ? ids.length : 0;
    const done = isRealRank ? completedTopics.filter((id) => ids.includes(id)).length : 0;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const color = subjectColors[subject.id as keyof typeof subjectColors].primary;
    return { id: subject.id, title: subject.title, icon: subject.icon, color, pct, done, total };
  });

  const showActivityInfo = () => {
    vibrate();
    Alert.alert(
      'Активность',
      'Отмечает дни, когда ты проходил хотя бы одну тему — из таких дней подряд складывается серия (streak).',
    );
  };

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 120 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Статистика</Text>
        </View>

        {/* Period tabs */}
        <View style={styles.tabs}>
          {PERIODS.map((p) => (
            <Pressable
              key={p.key}
              style={[styles.tab, period === p.key && styles.tabActive]}
              onPress={() => { vibrate(); setPeriod(p.key); }}
            >
              <Text
                style={[styles.tabText, period === p.key && styles.tabTextActive]}
                numberOfLines={1}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Activity chart */}
        <SurfaceCard style={styles.cardShadow} glowColor={glow.gold} radius={20} padding={18}>
          <View style={styles.chartHeader}>
            <View style={styles.chartIconWrap}>
              <MaterialCommunityIcons name="fire" size={20} color="#FF8C3B" />
            </View>
            <Text style={styles.cardLabel}>Активность</Text>
            <Pressable onPress={showActivityInfo} hitSlop={8}>
              <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
          <ActivityChart data={series.data} labels={series.labels} color="#FF8C3B" max={maxForPeriod(period)} />
        </SurfaceCard>

        {/* Разделы */}
        <SurfaceCard style={styles.cardShadow} glowColor={glow.purple} radius={20} padding={18}>
          <View style={styles.sectionHeader}>
            <Ionicons name="layers-outline" size={18} color={colors.text} />
            <Text style={styles.sectionTitle}>Разделы</Text>
          </View>

          {/* Фильтр по рангам */}
          <View style={styles.rankFilterRow}>
            {RANK_ORDER.map((r) => {
              const active = r === selectedRank;
              const isEmptyRank = r !== RANK_ORDER[0];
              return (
                <Pressable
                  key={r}
                  style={[styles.rankFilterPill, active && styles.rankFilterPillActive]}
                  onPress={() => { vibrate(); setSelectedRank(r); }}
                >
                  <RankBadge rank={r} size="sm" />
                  {isEmptyRank && (
                    <Ionicons
                      name="time-outline"
                      size={10}
                      color={colors.textMuted}
                      style={styles.rankFilterLock}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          {!isRealRank && (
            <View style={styles.rankLockedNote}>
              <Ionicons name="time-outline" size={13} color={colors.textMuted} />
              <Text style={styles.rankLockedNoteText}>
                Темы {selectedRank} ранга появятся позже
              </Text>
            </View>
          )}

          {subjectStats.map((s) => (
            <View
              key={s.id}
              style={[styles.subjectRow, !isRealRank && styles.subjectRowLocked]}
            >
              <View style={[styles.subjectIconWrap, { backgroundColor: `${s.color}26` }]}>
                <Text style={[styles.subjectIconGlyph, { color: s.color }]}>{s.icon}</Text>
              </View>
              <Text style={styles.subjectName} numberOfLines={1}>{s.title}</Text>
              <View style={styles.subjectTrack}>
                <View style={[styles.subjectFill, { width: `${s.pct}%`, backgroundColor: s.color }]} />
              </View>
              <Text style={[styles.subjectPct, { color: s.color }]}>{s.pct}%</Text>
            </View>
          ))}
        </SurfaceCard>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16 },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pageTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.purple,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  cardShadow: {
    marginBottom: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  chartIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,140,59,0.22)',
  },
  cardLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  chartRow: {
    flexDirection: 'row',
  },
  yAxis: {
    width: Y_AXIS_W,
    height: CHART_H,
    justifyContent: 'space-between',
    paddingBottom: CHART_BOTTOM_PAD,
    paddingTop: CHART_TOP_PAD - 6,
    marginRight: 8,
  },
  yAxisLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
  },
  xAxis: {
    height: 18,
    marginTop: 6,
    position: 'relative',
  },
  xAxisLabel: {
    position: 'absolute',
    top: 0,
    width: 28,
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  rankFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  rankFilterPill: {
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rankFilterPillActive: {
    borderColor: colors.purple,
    backgroundColor: 'rgba(144,71,255,0.15)',
  },
  rankFilterLock: {
    position: 'absolute',
    right: -2,
    bottom: -2,
  },
  rankLockedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  rankLockedNoteText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  subjectRowLocked: {
    opacity: 0.5,
  },
  subjectIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectIconGlyph: {
    fontSize: 15,
    fontWeight: '800',
  },
  subjectName: {
    width: 108,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  subjectTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#ECE9F7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  subjectFill: { height: '100%', borderRadius: 3 },
  subjectPct: {
    fontSize: 12,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },
});
