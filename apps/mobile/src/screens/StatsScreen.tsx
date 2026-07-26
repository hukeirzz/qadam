import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text } from '../components/ui/Text';
import Svg, { Circle, Line as SvgLine, Polyline } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dateKey, useAppStore } from '../store/useAppStore';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { colors, subjectColors } from '../theme/colors';
import { getTopicIds } from '../data/subjects';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const SUBJECT_META = [
  { id: 'math',      label: 'Математика', color: subjectColors.math.primary },
  { id: 'geometry',  label: 'Геометрия',  color: subjectColors.geometry.primary },
  { id: 'analogies', label: 'Аналогии',   color: subjectColors.analogies.primary },
  { id: 'reading',   label: 'ЧП',         color: subjectColors.reading.primary },
  { id: 'grammar',   label: 'Грамматика', color: subjectColors.grammar.primary },
];

type Period = 'week' | 'month';

function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const { width } = useWindowDimensions();
  const chartH = 80;
  const max = Math.max(...data, 1);

  return (
    <View style={{ height: chartH + 24 }}>
      <View style={[styles.chartArea, { height: chartH }]}>
        {data.map((val, i) => {
          const barH = Math.max(val > 0 ? 4 : 2, (val / max) * chartH);
          return (
            <View key={i} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: barH, backgroundColor: val > 0 ? color : 'rgba(255,255,255,0.06)' },
                  ]}
                />
              </View>
              <Text style={styles.barVal}>{val > 0 ? val : ''}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.labelsRow}>
        {labels.map((l, i) => (
          <Text key={i} style={styles.barLabel}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

const LABEL_W = 26;
// Отступы внутри графика, чтобы точки не упирались в края/верх.
const CHART_TOP_PAD = 16; // верх: точка с максимумом не лежит на границе
const CHART_BOTTOM_PAD = 6; // низ: точка с 0 шагов чуть выше базовой линии
const CHART_X_INSET = LABEL_W / 2; // лево/право: крайние точки и подписи влезают

function LineChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const { width } = useWindowDimensions();
  const chartW = width - 32 - 36; // screen - scroll padding (16*2) - card padding (18*2)
  const chartH = 120; // выше, чем раньше — больше места по вертикали (Y)
  const max = Math.max(...data, 1);
  const n = data.length;
  const plotW = chartW - CHART_X_INSET * 2;
  const plotH = chartH - CHART_TOP_PAD - CHART_BOTTOM_PAD;

  const points = data.map((val, i) => {
    const x = CHART_X_INSET + (n > 1 ? (i / (n - 1)) * plotW : plotW / 2);
    // val=max -> верх (CHART_TOP_PAD), val=0 -> низ (chartH - CHART_BOTTOM_PAD)
    const y = CHART_TOP_PAD + (1 - val / max) * plotH;
    return { x, y, val };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const baselineY = chartH - CHART_BOTTOM_PAD;

  return (
    <View style={{ height: chartH + 22 }}>
      <Svg width={chartW} height={chartH}>
        <SvgLine x1={0} y1={baselineY} x2={chartW} y2={baselineY} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        <Polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) =>
          p.val > 0 ? (
            <Circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
          ) : null,
        )}
      </Svg>
      {/* Дата строго под своей точкой (по той же x-координате). */}
      <View style={styles.lineLabels}>
        {labels.map((l, i) =>
          l ? (
            <Text
              key={i}
              style={[
                styles.lineLabel,
                { width: LABEL_W, left: points[i].x - LABEL_W / 2 },
              ]}
            >
              {l}
            </Text>
          ) : null,
        )}
      </View>
    </View>
  );
}

export function StatsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('week');

  const completedTopics = useAppStore((s) => s.completedTopics);
  const completedSteps  = useAppStore((s) => s.completedSteps);
  const streak          = useAppStore((s) => s.streak);
  const xp              = useAppStore((s) => s.xp);
  const weeklySteps     = useAppStore((s) => s.weeklySteps);
  const dailySteps      = useAppStore((s) => s.dailySteps);
  const remoteTopicIds  = useAppStore((s) => s.remoteTopicIds);

  const monthChart = useMemo(() => {
    const data: number[] = [];
    const labels: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      data.push(dailySteps[key] ?? 0);
      // pos: 0 = 29 days ago ... 29 = today. Label every 6 days + today.
      const pos = 29 - i;
      labels.push(pos % 6 === 0 || pos === 29 ? String(d.getDate()) : '');
    }
    return { data, labels };
  }, [dailySteps]);

  const monthTotal = monthChart.data.reduce((a, b) => a + b, 0);
  const weekTotal  = weeklySteps.reduce((a, b) => a + b, 0);

  const chartData   = period === 'week' ? weeklySteps : monthChart.data;
  const chartLabels = period === 'week' ? DAYS : monthChart.labels;
  const chartTotal  = period === 'week' ? weekTotal : monthTotal;

  const subjectStats = SUBJECT_META.map((s) => {
    // Prefer remote IDs (reflect Supabase additions), fall back to local static
    const ids   = remoteTopicIds[s.id]?.length ? remoteTopicIds[s.id] : getTopicIds(s.id);
    const total = ids.length;
    const done  = completedTopics.filter((id) => ids.includes(id)).length;
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
    return { ...s, pct, done, total };
  });

  return (
    <ScreenBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
      >
        <Text style={styles.pageTitle}>Статистика</Text>

        {/* Period tabs */}
        <View style={styles.tabs}>
          {(['week', 'month'] as Period[]).map((p) => (
            <Pressable
              key={p}
              style={[styles.tab, period === p && styles.tabActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.tabText, period === p && styles.tabTextActive]}>
                {p === 'week' ? 'Неделя' : 'Месяц'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Steps bar chart */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            {period === 'week' ? 'Шагов на этой неделе' : 'Шагов за последние 30 дней'}
          </Text>
          <Text style={styles.bigNumber}>{chartTotal}</Text>
          {period === 'week' ? (
            <BarChart data={chartData} labels={chartLabels} color={colors.purple} />
          ) : (
            <LineChart data={chartData} labels={chartLabels} color={colors.purple} />
          )}
        </View>

        {/* Overall stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statVal}>{completedSteps}</Text>
            <Text style={styles.statLbl}>Шагов</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statVal}>{streak}</Text>
            <Text style={styles.statLbl}>Стрик</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statVal}>{xp}</Text>
            <Text style={styles.statLbl}>XP</Text>
          </View>
        </View>

        {/* Subject breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>По предметам</Text>
          {subjectStats.map((s) => (
            <View key={s.id} style={styles.subjectRow}>
              <View style={[styles.subjectDot, { backgroundColor: s.color }]} />
              <Text style={styles.subjectName}>{s.label}</Text>
              <View style={styles.subjectTrack}>
                <View
                  style={[
                    styles.subjectFill,
                    { width: `${s.pct}%`, backgroundColor: s.color },
                  ]}
                />
              </View>
              <Text style={[styles.subjectPct, { color: s.color }]}>
                {s.done}/{s.total}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16 },
  pageTitle: {
    color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.purple,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  cardLabel: {
    color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 6,
  },
  bigNumber: {
    color: colors.text, fontSize: 40, fontWeight: '800', lineHeight: 44, marginBottom: 16,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    width: '80%',
    height: 80,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  barVal: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 2,
    fontWeight: '600',
  },
  labelsRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  lineLabels: {
    height: 18,
    marginTop: 6,
    position: 'relative',
  },
  lineLabel: {
    position: 'absolute',
    top: 0,
    color: colors.textDim,
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  barLabel: {
    flex: 1,
    color: colors.textDim,
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceGlass,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statVal: { color: colors.text, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  statLbl: { color: colors.textMuted, fontSize: 9, marginTop: 2, textAlign: 'center' },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  subjectDot: { width: 10, height: 10, borderRadius: 5 },
  subjectName: { color: colors.text, fontSize: 12, fontWeight: '600', width: 76 },
  subjectTrack: {
    flex: 1, height: 6,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 3, overflow: 'hidden',
  },
  subjectFill: { height: '100%', borderRadius: 3 },
  subjectPct: { fontSize: 11, fontWeight: '700', width: 36, textAlign: 'right' },
});
