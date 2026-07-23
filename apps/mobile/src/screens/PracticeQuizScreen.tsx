import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { colors } from '../theme/colors';
import { ExerciseStackParamList } from '../types/navigation';
import { getQuestionsForTopic } from '../data/practiceQuestions';
import { PracticeQuestion, OptionKey } from '../data/practiceQuestions/types';
import { savePracticeResult } from '../utils/practiceStorage';
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

function grade(pct: number): { label: string; icon: string; color: string } {
  if (pct >= 90) return { label: 'Отлично', icon: '🏆', color: '#FFD166' };
  if (pct >= 70) return { label: 'Хорошо', icon: '⭐', color: '#4ADE80' };
  if (pct >= 50) return { label: 'Неплохо', icon: '💪', color: '#5B9DFF' };
  return { label: 'Нужно повторить', icon: '📚', color: colors.textMuted };
}

export function PracticeQuizScreen({ route, navigation }: Props) {
  const { topicId, topicTitle, subjectId } = route.params;
  const insets = useSafeAreaInsets();

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<'quiz' | 'result'>('quiz');

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const buildQuestions = useCallback(() => {
    const pool = getQuestionsForTopic(topicId);
    const taken = shuffle(pool).slice(0, QUIZ_COUNT);
    setQuestions(taken);
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setPhase('quiz');
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

  const handleNext = () => {
    playSound('tap');
    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      const finalCorrect = correctCount + (isCorrect ? 0 : 0); // already updated
      savePracticeResult(topicId, correctCount + (selected === current.correct ? 1 : 0) - (isCorrect ? 0 : 0), questions.length).catch(() => {});
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
    const g = grade(pct);
    return (
      <ScreenBackground accentColor={colors.purple}>
        <View style={[styles.flex, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <Pressable style={styles.backBtn} onPress={() => { vibrate(); navigation.goBack(); }}>
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </Pressable>
            <Text style={styles.headerTitle}>{topicTitle}</Text>
            <View style={styles.backBtn} />
          </View>

          <ScrollView contentContainerStyle={[styles.resultScroll, { paddingBottom: insets.bottom + 130 }]}>
            <View style={styles.resultHero}>
              <Text style={styles.resultGradeIcon}>{g.icon}</Text>
              <Text style={[styles.resultGradeLabel, { color: g.color }]}>{g.label}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultScoreSmall}>Правильных ответов</Text>
              <Text style={styles.resultScore}>
                {correctCount} <Text style={styles.resultScoreTotal}>из {total}</Text>
              </Text>
              <View style={styles.pctBarTrack}>
                <View style={[styles.pctBarFill, { width: `${pct}%`, backgroundColor: g.color }]} />
              </View>
              <Text style={[styles.pctText, { color: g.color }]}>{pct}%</Text>
            </View>

            <Pressable style={styles.btnPrimary} onPress={handleRestart}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>Пройти снова</Text>
            </Pressable>

            <Pressable style={styles.btnSecondary} onPress={() => { vibrate(); navigation.goBack(); }}>
              <Text style={styles.btnSecondaryText}>Вернуться к темам</Text>
            </Pressable>
          </ScrollView>
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
                let badgeBg: string = 'rgba(255,255,255,0.08)';
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
                    android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
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

  progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.07)' },
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
  resultScroll: { paddingHorizontal: 20, paddingTop: 24, alignItems: 'center' },
  resultHero: { alignItems: 'center', marginBottom: 28 },
  resultGradeIcon: { fontSize: 64, marginBottom: 10 },
  resultGradeLabel: { fontSize: 24, fontWeight: '800' },

  resultCard: {
    width: '100%',
    backgroundColor: colors.surfaceGlass,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  resultScoreSmall: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  resultScore: { color: colors.text, fontSize: 52, fontWeight: '900' },
  resultScoreTotal: { fontSize: 28, color: colors.textMuted, fontWeight: '600' },
  pctBarTrack: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' },
  pctBarFill: { height: '100%', borderRadius: 4 },
  pctText: { fontSize: 22, fontWeight: '800' },

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
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  btnSecondaryText: { color: colors.textMuted, fontSize: 16, fontWeight: '600' },
});
