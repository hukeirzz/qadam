import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { QuizProgressBar } from '../components/quiz/QuizProgressBar';
import { AnswerCard } from '../components/quiz/AnswerCard';
import { fetchQuizQuestions } from '../services/questionsService';
import { getSubjectById } from '../data/subjects';
import { HomeStackParamList } from '../types/navigation';
import { AnswerState, QuizQuestion } from '../types/quiz';
import { subjectColors, colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';
import { playSound, vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<HomeStackParamList, 'Quiz'>;

const LABELS = ['A', 'B', 'C', 'D'];

export function QuizScreen({ navigation, route }: Props) {
  const { subjectId, topicId } = route.params;
  const subject = getSubjectById(subjectId);
  const palette = subjectColors[subjectId];
  const insets = useSafeAreaInsets();
  const completedTopics = useAppStore((s) => s.completedTopics);
  const topicHearts = useAppStore((s) => s.topicHearts);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    fetchQuizQuestions(topicId, subjectId, 10).then((qs) => {
      setQuestions(qs);
      setLoadingQuestions(false);
    });
  }, [topicId, subjectId]);

  const topicTitle =
    subject?.topics.find((t) => t.id === topicId)?.title ?? 'Квиз';

  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [lives, setLives] = useState(3);

  const parseQuestion = (text: string) => {
    const idx = text.indexOf('\n[img:');
    if (idx !== -1 && text.endsWith(']')) {
      return { text: text.slice(0, idx), imageUrl: text.slice(idx + 6, -1) };
    }
    return { text, imageUrl: null as string | null };
  };

  const question = questions[index];
  const total = questions.length;
  const progress =
    total > 0 ? ((index + (answerState !== 'idle' ? 1 : 0)) / total) * 100 : 0;

  const handleSelect = (optionId: string) => {
    if (answerState !== 'idle' || !question) return;

    const isCorrect = optionId === question.correctId;
    setSelectedId(optionId);
    setAnswerState(isCorrect ? 'correct' : 'wrong');
    playSound(isCorrect ? 'correct' : 'wrong', false);
    if (isCorrect) setCorrectCount((c) => c + 1);
    else setLives((l) => Math.max(0, l - 1));
  };

  const handleNext = () => {
    playSound('tap');
    if (index + 1 >= total) {
      const baseXp = Math.round((correctCount / total) * 10) * 10;
      const isAlreadyDone = completedTopics.includes(topicId);
      const prevHearts = isAlreadyDone ? (topicHearts[topicId] ?? 0) : -1;

      let earnedXp: number;
      if (!isAlreadyDone) {
        // Первое прохождение: полный XP с учётом сердец
        earnedXp = Math.floor(baseXp * (lives / 3));
      } else {
        // Повторное: только прирост за улучшение сердец
        const heartImprovement = Math.max(0, lives - Math.max(0, prevHearts));
        earnedXp = Math.floor(baseXp * (heartImprovement / 3));
      }

      navigation.replace('CorrectAnswer', {
        subjectId,
        topicId,
        correctCount,
        total,
        earnedXp,
        livesRemaining: lives,
      });
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
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      </ScreenBackground>
    );
  }

  if (!question) {
    return (
      <ScreenBackground>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Вопросы скоро появятся</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Назад</Text>
          </Pressable>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => { vibrate(); navigation.goBack(); }} style={styles.iconBtn}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {topicTitle}
            </Text>
            <Text style={styles.headerSub}>
              {index + 1} / {total}
            </Text>
          </View>
          <View style={styles.lives}>
            {[...Array(3)].map((_, i) => (
              <Ionicons
                key={i}
                name="heart"
                size={18}
                color={i < lives ? palette.primary : 'rgba(255,255,255,0.15)'}
              />
            ))}
          </View>
        </View>

        <View style={styles.progressWrap}>
          <QuizProgressBar progress={progress} color={palette.primary} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 16 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.questionLabel}>Вопрос</Text>
          {(() => {
            const { text: qText, imageUrl } = parseQuestion(question.text);
            return (
              <>
                <Text style={styles.question}>{qText}</Text>
                {imageUrl && (
                  <View style={styles.qImgWrap}>
                    <Image source={{ uri: imageUrl }} style={styles.qImg} resizeMode="contain" />
                  </View>
                )}
              </>
            );
          })()}

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
                accentColor={palette.primary}
                onPress={() => handleSelect(option.id)}
              />
            );
          })}

          {answerState !== 'idle' && question.explanation ? (
            <View style={styles.explanation}>
              <Text style={styles.explanationTitle}>Объяснение</Text>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Bottom bar */}
        {answerState !== 'idle' && (
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 116 }]}>
            {question.explanation && answerState === 'wrong' ? (
              <Pressable style={styles.explainBtn}>
                <Text style={styles.explainBtnText}>Объяснение</Text>
              </Pressable>
            ) : <View style={styles.explainBtn} />}

            <Pressable onPress={handleNext} style={styles.nextWrap}>
              <LinearGradient
                colors={[palette.primary, palette.primary]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.nextBtn}
              >
                <Text style={styles.nextText}>
                  {index + 1 >= total ? 'Завершить' : 'Далее'}
                </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  headerSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  lives: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 64,
    justifyContent: 'flex-end',
  },
  progressWrap: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  questionLabel: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  question: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 24,
  },
  qImgWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginBottom: 20,
    marginTop: -8,
  },
  qImg: {
    width: '100%',
    height: 200,
  },
  explanation: {
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(10, 8, 28, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(90, 80, 140, 0.35)',
  },
  explanationTitle: {
    color: colors.purpleGlow,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  explanationText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    backgroundColor: 'transparent',
  },
  explainBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explainBtnText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  nextWrap: {
    flex: 2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  nextBtn: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  nextText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  backLink: {
    color: colors.purpleGlow,
    marginTop: 16,
    fontWeight: '600',
  },
});
