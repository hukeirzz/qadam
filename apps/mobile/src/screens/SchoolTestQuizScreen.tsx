import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SchoolTestQuestionDTO } from '@qadam/api-client';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { QuizProgressBar } from '../components/quiz/QuizProgressBar';
import { AnswerCard } from '../components/quiz/AnswerCard';
import { fetchSchoolTestQuestions, submitSchoolTestResult } from '../services/schoolTestsService';
import { ExerciseStackParamList } from '../types/navigation';
import { AnswerState } from '../types/quiz';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { playSound } from '../services/soundService';

type Props = NativeStackScreenProps<ExerciseStackParamList, 'SchoolTestQuiz'>;

const LABELS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export function SchoolTestQuizScreen({ route, navigation }: Props) {
  const { testId, title } = route.params;
  const insets = useSafeAreaInsets();
  const userId = useAppStore((s) => s.userId);

  const [questions, setQuestions] = useState<SchoolTestQuestionDTO[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    fetchSchoolTestQuestions(testId).then((qs) => {
      setQuestions(qs ?? []);
      setLoadingQuestions(false);
    });
  }, [testId]);

  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<'quiz' | 'result'>('quiz');
  const [alreadyTaken, setAlreadyTaken] = useState(false);

  const question = questions[index];
  const total = questions.length;
  const progress = total > 0 ? ((index + (answerState !== 'idle' ? 1 : 0)) / total) * 100 : 0;

  const handleSelect = (optionId: string) => {
    if (answerState !== 'idle' || !question) return;
    const isCorrect = optionId === question.correctId;
    setSelectedId(optionId);
    setAnswerState(isCorrect ? 'correct' : 'wrong');
    playSound(isCorrect ? 'correct' : 'wrong', false);
    if (isCorrect) setCorrectCount((c) => c + 1);
  };

  const handleNext = async () => {
    playSound('tap');
    if (index + 1 >= total) {
      setSubmitting(true);
      if (userId) {
        const { alreadyTaken: taken } = await submitSchoolTestResult(testId, userId, correctCount, total);
        setAlreadyTaken(!!taken);
      }
      setSubmitting(false);
      setPhase('result');
      return;
    }
    setIndex((i) => i + 1);
    setSelectedId(null);
    setAnswerState('idle');
  };

  if (loadingQuestions) {
    return (
      <ScreenBackground>
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.purple} />
        </View>
      </ScreenBackground>
    );
  }

  if (!question && phase === 'quiz') {
    return (
      <ScreenBackground>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Вопросы теста скоро появятся</Text>
        </View>
      </ScreenBackground>
    );
  }

  if (phase === 'result') {
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    return (
      <ScreenBackground>
        <View style={[styles.flex, styles.resultWrap, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
          <Ionicons
            name={pct >= 60 ? 'trophy' : 'school'}
            size={72}
            color={pct >= 60 ? colors.gold : colors.purpleGlow}
          />
          <Text style={styles.resultTitle}>{title}</Text>
          {alreadyTaken ? (
            <Text style={styles.resultSub}>Этот тест уже был пройден — засчитан первый результат.</Text>
          ) : (
            <Text style={styles.resultSub}>Результат сохранён и виден координатору школы.</Text>
          )}
          <View style={styles.resultScoreCard}>
            <Text style={styles.resultPct}>{pct}%</Text>
            <Text style={styles.resultFraction}>{correctCount} / {total} правильно</Text>
          </View>
          <Pressable onPress={() => navigation.goBack()} style={styles.nextWrap}>
            <LinearGradient colors={[colors.purple, '#6B2FD4']} style={styles.nextBtn}>
              <Text style={styles.nextText}>Вернуться к тестам</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.headerSub}>Вопрос {index + 1} из {total}</Text>
        </View>

        <View style={styles.progressWrap}>
          <QuizProgressBar progress={progress} color={colors.purple} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 16 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.questionLabel}>Вопрос</Text>
          <Text style={styles.question}>{question.text}</Text>

          {question.options.map((option, i) => {
            let state: AnswerState = 'idle';
            if (answerState !== 'idle' && selectedId === option.id) {
              state = answerState;
            } else if (answerState !== 'idle' && option.id === question.correctId) {
              state = 'correct';
            }

            return (
              <AnswerCard
                key={option.id}
                label={LABELS[i] ?? String(i + 1)}
                text={option.text}
                state={state}
                disabled={answerState !== 'idle'}
                accentColor={colors.purple}
                onPress={() => handleSelect(option.id)}
              />
            );
          })}
        </ScrollView>

        {answerState !== 'idle' && (
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
            <Pressable onPress={handleNext} style={styles.nextWrap} disabled={submitting}>
              <LinearGradient colors={[colors.purple, '#6B2FD4']} style={styles.nextBtn}>
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.nextText}>{index + 1 >= total ? 'Завершить' : 'Далее'}</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center' },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  headerSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  progressWrap: { paddingHorizontal: 20, marginBottom: 20 },
  scroll: { paddingHorizontal: 20 },
  questionLabel: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  question: { color: colors.text, fontSize: 20, fontWeight: '700', lineHeight: 28, marginBottom: 24 },
  bottomBar: { paddingHorizontal: 20, paddingTop: 12 },
  nextWrap: { borderRadius: 14, overflow: 'hidden' },
  nextBtn: { height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  nextText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 16, textAlign: 'center', paddingHorizontal: 32 },

  resultWrap: { alignItems: 'center', paddingHorizontal: 32 },
  resultTitle: { color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 16 },
  resultSub: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 19 },
  resultScoreCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 40,
    marginTop: 28,
    marginBottom: 32,
  },
  resultPct: { color: colors.text, fontSize: 40, fontWeight: '800' },
  resultFraction: { color: colors.textMuted, fontSize: 14, fontWeight: '600', marginTop: 4 },
});
