import React, { useEffect, useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HomeStackParamList } from '../types/navigation';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette } from '../theme/colors';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { happyPetImages } from '../assets/happyPetImages';
import { sadPetImages } from '../assets/sadPetImages';
import { getTopicIds } from '../data/subjects';
import { useAppStore } from '../store/useAppStore';
import { playSound, vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<HomeStackParamList, 'CorrectAnswer'>;

export function CorrectAnswerScreen({ navigation, route }: Props) {
  const { subjectId, topicId, correctCount, total, earnedXp, livesRemaining, mistakes } = route.params;
  const isGreat = correctCount >= Math.ceil(total * 0.6);

  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const petType = useAppStore((s) => s.petType);
  const remoteTopicIds = useAppStore((s) => s.remoteTopicIds);
  const completeQuiz = useAppStore((s) => s.completeQuiz);
  const wrongCount = total - correctCount;

  useEffect(() => {
    playSound('complete');
    completeQuiz(topicId, correctCount, total, earnedXp, livesRemaining);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topicIds = remoteTopicIds[subjectId]?.length
    ? remoteTopicIds[subjectId]
    : getTopicIds(subjectId);
  const currentIndex = topicIds.indexOf(topicId);
  const nextTopicId =
    currentIndex >= 0 && currentIndex + 1 < topicIds.length ? topicIds[currentIndex + 1] : null;

  const goNextTopic = () => {
    vibrate();
    if (nextTopicId) {
      navigation.replace('Theory', { subjectId, topicId: nextTopicId });
    } else {
      navigation.replace('IslandPath', { subjectId });
    }
  };

  const repeatTopic = () => {
    vibrate();
    navigation.replace('Quiz', { subjectId, topicId });
  };

  const reviewMistakes = () => {
    vibrate();
    navigation.navigate('MistakesReview', { subjectId, mistakes });
  };

  const petImage = (isGreat ? happyPetImages : sadPetImages)[petType ?? 'bars'];

  return (
    <ScreenBackground style={styles.root}>
      <View style={styles.petWrap} pointerEvents="none">
        <Image source={petImage} style={styles.petImage} resizeMode="contain" />
      </View>

      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.title}>{isGreat ? 'Отличная работа!' : 'Есть куда расти!'}</Text>
        <Text style={styles.xp}>+{earnedXp} XP</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.statText}>Правильных {correctCount}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="close-circle" size={20} color="#FF6B6B" />
            <Text style={styles.statText}>Ошибок {wrongCount}</Text>
          </View>
        </View>

        {mistakes.length > 0 && (
          <Pressable style={styles.secondaryBtn} onPress={reviewMistakes}>
            <Text style={styles.secondaryBtnText}>Разбор ошибок</Text>
          </Pressable>
        )}

        <Pressable style={styles.secondaryBtn} onPress={repeatTopic}>
          <Text style={styles.secondaryBtnText}>Повторить тему</Text>
        </Pressable>

        <Pressable style={styles.primaryBtnWrap} onPress={goNextTopic}>
          <LinearGradient
            colors={[colors.purple, '#5B2ED4']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Следующая тема</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScreenBackground>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  root: {
    flex: 1,
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
  content: {
    justifyContent: 'flex-end',
    paddingHorizontal: 28,
    gap: 10,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  xp: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 18,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.purpleDark,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  primaryBtnWrap: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
  },
  primaryBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
