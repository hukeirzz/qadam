import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { SegmentTabs, PathTab } from '../components/path/SegmentTabs';
import { TopicPathMap } from '../components/path/TopicPathMap';
import { getSubjectById } from '../data/subjects';
import { fetchTopicsForSubject, getCachedSubjectTopicIds } from '../services/topicsService';
import { HomeStackParamList } from '../types/navigation';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette, subjectColors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { Topic } from '../types/subject';
import { useAppStore } from '../store/useAppStore';
import { vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<HomeStackParamList, 'IslandPath'>;

const topicBackground = require('../../assets/topic-background.png');

const XP_RULES = [
  { icon: '⭐⭐⭐', label: 'Все звёзды целы',    xp: '100% XP', color: '#4ADE80' },
  { icon: '⭐⭐☆', label: '1 звезда потеряна',  xp: '⅔ XP',   color: '#FACC15' },
  { icon: '⭐☆☆', label: '2 звезды потеряно',  xp: '⅓ XP',   color: '#FB923C' },
  { icon: '☆☆☆', label: 'Все звёзды потеряны', xp: '0 XP',   color: '#F87171' },
];

export function IslandPathScreen({ navigation, route }: Props) {
  const { subjectId } = route.params;
  const userRank = useAppStore((s) => s.rank) ?? 'D';
  const rank = route.params.rank ?? userRank;
  const subject = getSubjectById(subjectId);
  const palette = subjectColors[subjectId];
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [tab, setTab] = useState<PathTab>('path');
  const [topics, setTopics] = useState<Topic[]>(subject?.topics ?? []);
  const [loading, setLoading] = useState(true);
  const completedTopics = useAppStore((s) => s.completedTopics);
  const topicHearts = useAppStore((s) => s.topicHearts);
  const setRemoteTopics = useAppStore((s) => s.setRemoteTopics);

  useEffect(() => {
    let cancelled = false;
    fetchTopicsForSubject(subjectId).then((remote) => {
      if (cancelled || !remote) {
        setLoading(false);
        return;
      }

      const withStatus: Topic[] = remote.map((t, i) => {
        if (completedTopics.includes(t.id)) return { ...t, status: 'completed' as const };
        const prevDone = i === 0 || completedTopics.includes(remote[i - 1]?.id ?? '');
        if (prevDone) return { ...t, status: 'current' as const };
        return { ...t, status: 'locked' as const };
      });

      setTopics(withStatus);
      setLoading(false);

      // After a full fetch the cache has ALL subjects — push real IDs into store
      const ids = getCachedSubjectTopicIds();
      if (Object.keys(ids).length > 0) setRemoteTopics(ids);
    });
    return () => { cancelled = true; };
  }, [subjectId, completedTopics]);

  if (!subject) return null;

  const openTopic = (topicId: string) => {
    vibrate();
    navigation.navigate('Theory', { subjectId, topicId });
  };

  const doneCount = topics.filter((t) => t.status === 'completed').length;
  const totalCount = topics.length;

  return (
    <ScreenBackground backgroundImage={topicBackground}>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => { vibrate(); navigation.goBack(); }} style={styles.back}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>{subject.title}</Text>
          <View style={styles.back} />
        </View>

        <SegmentTabs active={tab} onChange={setTab} accentColor={palette.primary} />

        {tab === 'info' ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.infoScroll,
              { paddingBottom: insets.bottom + 130 },
            ]}
          >
            {/* Progress card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>{subject.title}</Text>
              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%',
                        backgroundColor: palette.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressLabel, { color: palette.primary }]}>
                  {doneCount}/{totalCount}
                </Text>
              </View>
              <Text style={styles.infoText}>
                Пройди все темы, чтобы получить максимум XP и звёзд.{'\n'}
                Каждый шаг засчитывается в общий прогресс ОРТ.
              </Text>
            </View>

            {/* XP rules */}
            <Text style={styles.sectionLabel}>Система XP и звёзд</Text>
            <View style={styles.infoCard}>
              <Text style={styles.xpDesc}>
                За каждый шаг XP считается от точности ответов и оставшихся звёзд:
              </Text>
              {XP_RULES.map((rule, i) => (
                <View key={i} style={styles.ruleRow}>
                  <Text style={styles.ruleIcon}>{rule.icon}</Text>
                  <Text style={styles.ruleLabel}>{rule.label}</Text>
                  <Text style={[styles.ruleXp, { color: rule.color }]}>{rule.xp}</Text>
                </View>
              ))}
              <View style={styles.divider} />
              <Text style={styles.xpTip}>
                💡 Перепройди тему с большим числом звёзд — получи оставшийся XP!
              </Text>
            </View>

            {/* Replay info */}
            <Text style={styles.sectionLabel}>Повторное прохождение</Text>
            <View style={styles.infoCard}>
              {[
                { icon: '✅', text: 'Пройденные темы можно проходить повторно' },
                { icon: '⭐', text: 'Улучши результат по звёздам — получи дополнительный XP' },
                { icon: '🔥', text: 'Стрик обновляется при любом прохождении' },
              ].map((item, i) => (
                <View key={i} style={styles.tipRow}>
                  <Text style={styles.tipIcon}>{item.icon}</Text>
                  <Text style={styles.tipText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={palette.primary} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.pathScroll,
              { paddingBottom: insets.bottom + 130 },
            ]}
          >
            <TopicPathMap
              topics={topics}
              subjectId={subjectId}
              rank={rank}
              topicHearts={topicHearts}
              onTopicPress={openTopic}
            />
          </ScrollView>
        )}
      </View>
    </ScreenBackground>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathScroll: {
    paddingTop: 8,
  },
  infoScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 4,
  },
  infoCard: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    gap: 10,
  },
  infoCardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'right',
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  xpDesc: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ruleIcon: {
    fontSize: 14,
    width: 56,
  },
  ruleLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  ruleXp: {
    fontSize: 13,
    fontWeight: '800',
    minWidth: 48,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderMuted,
  },
  xpTip: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipIcon: {
    fontSize: 16,
    width: 24,
  },
  tipText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
