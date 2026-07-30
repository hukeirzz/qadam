import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { AnswerCard } from '../components/quiz/AnswerCard';
import { HomeStackParamList } from '../types/navigation';
import { subjectColors, colors } from '../theme/colors';
import { vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<HomeStackParamList, 'MistakesReview'>;

const LABELS = ['A', 'B', 'C', 'D'];

export function MistakesReviewScreen({ navigation, route }: Props) {
  const { subjectId, mistakes } = route.params;
  const palette = subjectColors[subjectId];
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground accentColor={palette.primary}>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => { vibrate(); navigation.goBack(); }} style={styles.back}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Разбор ошибок</Text>
          <View style={styles.back} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 130 }]}
        >
          {mistakes.map(({ question, chosenId }, index) => (
            <View key={`${question.id}-${index}`} style={styles.card}>
              <Text style={styles.questionLabel}>Вопрос {index + 1}</Text>
              <Text style={styles.question}>{question.text}</Text>

              {question.options.map((option, i) => {
                const state =
                  option.id === question.correctId
                    ? 'correct'
                    : option.id === chosenId
                      ? 'wrong'
                      : 'idle';
                return (
                  <AnswerCard
                    key={option.id}
                    label={LABELS[i] ?? option.id.toUpperCase()}
                    text={option.text}
                    state={state}
                    disabled
                    accentColor={palette.primary}
                    onPress={() => {}}
                  />
                );
              })}

              {question.explanation ? (
                <View style={styles.explanation}>
                  <Text style={styles.explanationTitle}>Объяснение</Text>
                  <Text style={styles.explanationText}>{question.explanation}</Text>
                </View>
              ) : null}
            </View>
          ))}
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
  scroll: {
    paddingHorizontal: 20,
    gap: 20,
  },
  card: {
    marginBottom: 4,
  },
  questionLabel: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  question: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 16,
  },
  explanation: {
    marginTop: 4,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F3F1FC',
    borderWidth: 1,
    borderColor: colors.border,
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
});
