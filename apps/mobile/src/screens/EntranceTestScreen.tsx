import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { calcRank } from '@qadam/business-logic';
import type { QuizQuestionDTO } from '@qadam/api-client';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { QuizProgressBar } from '../components/quiz/QuizProgressBar';
import { AnswerCard } from '../components/quiz/AnswerCard';
import { fetchEntranceTestQuestions, submitEntranceTestResult } from '../services/entranceTestService';
import { RootStackParamList } from '../types/navigation';
import { AnswerState } from '../types/quiz';
import { colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { playSound } from '../services/soundService';

type Props = NativeStackScreenProps<RootStackParamList, 'EntranceTest'>;

const LABELS = ['A', 'B', 'C', 'D'];
const QUESTION_COUNT = 20;

export function EntranceTestScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const userId = useAppStore((s) => s.userId);

  const [questions, setQuestions] = useState<QuizQuestionDTO[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    fetchEntranceTestQuestions(QUESTION_COUNT).then((qs) => {
      setQuestions(qs ?? []);
      setLoadingQuestions(false);
    });
  }, []);

  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [submitting, setSubmitting] = useState(false);

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
      const rank = calcRank(correctCount, total);
      setSubmitting(true);
      if (userId) {
        await submitEntranceTestResult(userId, rank);
      }
      setSubmitting(false);
      navigation.replace('EntranceTestResult', { score: correctCount, total, rank });
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

  if (!question) {
    return (
      <ScreenBackground>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Вопросы теста скоро появятся</Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Вступительный тест</Text>
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
                label={LABELS[i] ?? option.id.toUpperCase()}
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
  nextText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 16, textAlign: 'center', paddingHorizontal: 32 },
});
