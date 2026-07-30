import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { colors } from '../theme/colors';
import { ExerciseStackParamList } from '../types/navigation';
import { getQuestionsForTopic } from '../data/practiceQuestions';
import { PracticeQuestion, OptionKey } from '../data/practiceQuestions/types';
import { savePracticeResult } from '../utils/practiceStorage';
import { happyPetImages } from '../assets/happyPetImages';
import { sadPetImages } from '../assets/sadPetImages';
import { useAppStore } from '../store/useAppStore';
import { recordTopicStat } from '../services/progressService';
import { playSound, vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<ExerciseStackParamList, 'PracticeQuiz'>;

const OPTION_KEYS: OptionKey[] = ['А', 'Б', 'В', 'Г'];
const QUIZ_COUNT = 30;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PracticeQuizScreen({ route, navigation }: Props) {
  const { topicId, topicTitle, subjectId } = route.params;
  const insets = useSafeAreaInsets();
  const petType = useAppStore((s) => s.petType);
  const userId = useAppStore((s) => s.userId);
  const addXp = useAppStore((s) => s.addXp);

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<'quiz' | 'result'>('quiz');
  const [xpEarned, setXpEarned] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const buildQuestions = useCallback(() => {
    const pool = getQuestionsForTopic(topicId);
    const taken = shuffle(pool).slice(0, QUIZ_COUNT);
    setQuestions(taken);
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setPhase('quiz');
    setXpEarned(0);
    fadeAnim.setValue(1);
  }, [topicId]);

  useEffect(() => { buildQuestions(); }, [buildQuestions]);

  const current = questions[index];
  const isAnswered = selected !== null;
  const isCorrect = isAnswered && selected === current?.correct;

  const handleSelect = (key: OptionKey) => {
    if (isAnswered) return;
    setSelected(key);
    playSound(key === current.correct ? 'correct' : 'wrong', false);
    if (key === current.correct) setCorrectCount((c) => c + 1);
  };

  const handleNext = async () => {
    playSound('tap');
    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      // Единственное место, где реально копится точность по темам для
      // school-web («Точность по разделам») — острова/теория туда не
      // попадают, только практика.
      if (userId) {
        recordTopicStat(topicId, subjectId, correctCount, questions.length).catch(console.warn);
      }
      // XP: 10 за каждый верный ответ на первом прохождении темы; при
      // повторном — только за прирост над лучшим результатом (иначе можно
      // фармить XP, проходя одну тему по кругу).
      try {
        const { prevBest } = await savePracticeResult(topicId, correctCount, questions.length);
        const gained = Math.max(0, correctCount - prevBest) * 10;
        if (gained > 0) {
          addXp(gained);
          setXpEarned(gained);
        }
      } catch {
        // локальное хранилище недоступно — просто не начисляем XP в этот раз
      }
      playSound('complete');
      setPhase('result');
      return;
    }
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setIndex(nextIndex);
      setSelected(null);
    });
  };

  const handleRestart = () => {
    vibrate();
    buildQuestions();
  };

  if (phase === 'result') {
    const total = questions.length;
    const pct = Math.round((correctCount / total) * 100);
    const isGreat = pct >= 60;
    const petImage = (isGreat ? happyPetImages : sadPetImages)[petType ?? 'bars'];

    return (
      <ScreenBackground style={styles.resultRoot}>
        <Pressable
          style={[styles.resultBackBtn, { top: insets.top + 8 }]}
          onPress={() => { vibrate(); navigation.goBack(); }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.petWrap} pointerEvents="none">
          <Image source={petImage} style={styles.petImage} resizeMode="contain" />
        </View>

        <View style={[styles.resultContent, { paddingBottom: insets.bottom + 20 }]}>
          <Text style={styles.resultTitle}>{isGreat ? 'Отличная работа!' : 'Есть куда расти!'}</Text>
          <Text style={styles.resultXp}>+{xpEarned} XP</Text>
          <Text style={styles.resultPct}>{pct}%</Text>

          <View style={styles.resultStatsRow}>
            <View style={styles.resultStat}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.resultStatText}>Правильных {correctCount}</Text>
            </View>
            <View style={styles.resultStat}>
              <Ionicons name="close-circle" size={20} color="#FF6B6B" />
              <Text style={styles.resultStatText}>Ошибок {total - correctCount}</Text>
            </View>
          </View>

          <Pressable style={styles.btnPrimary} onPress={handleRestart}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.btnPrimaryText}>Пройти снова</Text>
          </Pressable>

          <Pressable style={styles.btnSecondary} onPress={() => { vibrate(); navigation.goBack(); }}>
            <Text style={styles.btnSecondaryText}>Вернуться к темам</Text>
          </Pressable>
        </View>
      </ScreenBackground>
    );
  }

  if (!current) return null;

  const progress = questions.length > 0 ? (index / questions.length) : 0;

  return (
    <ScreenBackground accentColor={colors.purple}>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{topicTitle}</Text>
          <Text style={styles.headerCounter}>{index + 1}/{questions.length}</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <ScrollView
          style={styles.flex}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.quizScroll, { paddingBottom: insets.bottom + 130 }]}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Question number label */}
            <Text style={styles.questionLabel}>Вопрос {index + 1} из {questions.length}</Text>

            {/* Question text */}
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{current.question}</Text>
            </View>

            {/* Options */}
            <View style={styles.optionsWrap}>
              {OPTION_KEYS.map((key) => {
                const isSelected = selected === key;
                const isRight = key === current.correct;
                let bg: string = colors.surfaceGlass;
                let border: string = colors.borderMuted;
                let textColor: string = colors.text;
                let badgeBg: string = '#F3F1FC';
                let badgeText: string = colors.textMuted;

                if (isAnswered) {
                  if (isRight) {
                    bg = 'rgba(74,222,128,0.12)';
                    border = '#4ADE80';
                    badgeBg = '#4ADE80';
                    badgeText = '#000';
                  } else if (isSelected) {
                    bg = 'rgba(239,68,68,0.12)';
                    border = '#EF4444';
                    badgeBg = '#EF4444';
                    badgeText = '#fff';
                    textColor = '#EF4444';
                  } else {
                    textColor = colors.textDim;
                  }
                } else if (isSelected) {
                  bg = 'rgba(144,71,255,0.15)';
                  border = colors.purple;
                  badgeBg = colors.purple;
                  badgeText = '#fff';
                }

                return (
                  <Pressable
                    key={key}
                    style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
                    onPress={() => handleSelect(key)}
                    android_ripple={{ color: 'rgba(144,71,255,0.12)' }}
                  >
                    <View style={[styles.optionBadge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.optionBadgeText, { color: badgeText }]}>{key}</Text>
                    </View>
                    <Text style={[styles.optionText, { color: textColor }]}>
                      {current.options[key]}
                    </Text>
                    {isAnswered && isRight && (
                      <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
                    )}
                    {isAnswered && isSelected && !isRight && (
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Explanation */}
            {isAnswered && (
              <View style={[styles.explanationCard, { borderColor: isCorrect ? '#4ADE8040' : '#EF444440' }]}>
                <Ionicons
                  name={isCorrect ? 'checkmark-circle' : 'information-circle'}
                  size={18}
                  color={isCorrect ? '#4ADE80' : '#5B9DFF'}
                />
                <Text style={styles.explanationText}>{current.explanation}</Text>
              </View>
            )}

            {/* Next button */}
            {isAnswered && (
              <Pressable style={styles.nextBtn} onPress={handleNext}>
                <Text style={styles.nextBtnText}>
                  {index + 1 < questions.length ? 'Следующий вопрос' : 'Посмотреть результат'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </Pressable>
            )}
          </Animated.View>
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
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: colors.text, fontSize: 16, fontWeight: '700', textAlign: 'center', marginHorizontal: 4 },
  headerCounter: { width: 44, color: colors.textMuted, fontSize: 13, fontWeight: '700', textAlign: 'right' },

  progressTrack: { height: 3, backgroundColor: colors.border },
  progressFill: { height: '100%', backgroundColor: colors.purple, borderRadius: 2 },

  quizScroll: { paddingHorizontal: 16, paddingTop: 16 },

  questionLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 10, letterSpacing: 0.3 },

  questionCard: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: 18,
    marginBottom: 16,
  },
  questionText: { color: colors.text, fontSize: 16, fontWeight: '600', lineHeight: 24 },

  optionsWrap: { gap: 10, marginBottom: 16 },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
  },
  optionBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionBadgeText: { fontSize: 14, fontWeight: '800' },
  optionText: { flex: 1, fontSize: 15, fontWeight: '500', lineHeight: 21 },

  explanationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(91,157,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  explanationText: { flex: 1, color: colors.textMuted, fontSize: 13, lineHeight: 20 },

  nextBtn: {
    backgroundColor: colors.purple,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    marginBottom: 8,
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Result screen styles
  resultRoot: { flex: 1 },
  resultBackBtn: {
    position: 'absolute',
    left: 8,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  petWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  petImage: {
    width: 300,
    height: 300,
  },
  resultContent: {
    justifyContent: 'flex-end',
    paddingHorizontal: 28,
    gap: 10,
  },
  resultTitle: { color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  resultXp: { color: colors.gold, fontSize: 15, fontWeight: '800', textAlign: 'center', marginTop: 2 },
  resultPct: { color: colors.gold, fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  resultStatsRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 18 },
  resultStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resultStatText: { color: colors.text, fontSize: 14, fontWeight: '700' },

  btnPrimary: {
    width: '100%',
    backgroundColor: colors.purple,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    marginBottom: 10,
  },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  btnSecondary: {
    width: '100%',
    backgroundColor: '#F3F1FC',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  btnSecondaryText: { color: colors.textMuted, fontSize: 16, fontWeight: '600' },
});
