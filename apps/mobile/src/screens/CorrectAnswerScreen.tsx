import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { HomeStackParamList } from '../types/navigation';
import { subjectColors, colors } from '../theme/colors';
import { islandImages } from '../assets/islandImages';
import { useAppStore } from '../store/useAppStore';
import { playSound, vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<HomeStackParamList, 'CorrectAnswer'>;

export function CorrectAnswerScreen({ navigation, route }: Props) {
  const { subjectId, topicId, correctCount, total, earnedXp, livesRemaining } = route.params;
  const palette = subjectColors[subjectId];
  const insets = useSafeAreaInsets();
  const xp = earnedXp ?? 0;
  const isGreat = correctCount >= Math.ceil(total * 0.6);
  const heartsLost = 3 - (livesRemaining ?? 3);
  const completeQuiz = useAppStore((s) => s.completeQuiz);

  const floatY = useSharedValue(0);
  const scaleVal = useSharedValue(0.7);
  const opacityVal = useSharedValue(0);

  useEffect(() => {
    playSound('complete');
    completeQuiz(topicId, correctCount, total, xp, livesRemaining ?? 3);

    scaleVal.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.4)) });
    opacityVal.value = withTiming(1, { duration: 400 });
    floatY.value = withDelay(
      400,
      withRepeat(
        withTiming(-10, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
  }, []);

  const islandStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }, { scale: scaleVal.value }],
    opacity: opacityVal.value,
  }));

  return (
    <ScreenBackground accentColor={palette.primary}>
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
      >
        {/* Floating island */}
        <Animated.View style={[styles.islandWrap, islandStyle]}>
          <Image
            source={islandImages[subjectId]}
            style={[styles.islandImg, { shadowColor: palette.primary }]}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={styles.title}>
          {isGreat ? 'Отлично! 🎉' : 'Хорошая попытка! 💪'}
        </Text>
        <Text style={styles.sub}>
          {isGreat
            ? 'Ты сделал ещё один шаг к знаниям!'
            : 'Продолжай — каждый шаг важен'}
        </Text>

        {/* XP + rewards */}
        <View style={styles.rewards}>
          <View style={styles.reward}>
            <Text style={styles.rewardVal}>⭐ +{xp} XP</Text>
          </View>
          {isGreat ? (
            <View style={styles.reward}>
              <Text style={styles.rewardVal}>🔥 +1</Text>
            </View>
          ) : null}
        </View>

        {/* Hearts penalty indicator */}
        {heartsLost > 0 && (
          <View style={styles.penaltyRow}>
            <View style={styles.hearts}>
              {[0, 1, 2].map((i) => (
                <Ionicons
                  key={i}
                  name="heart"
                  size={16}
                  color={i < (livesRemaining ?? 3) ? palette.primary : 'rgba(255,255,255,0.18)'}
                />
              ))}
            </View>
            <Text style={styles.penaltyText}>
              {heartsLost === 1
                ? '-⅓ XP за потерянное сердце'
                : heartsLost === 2
                ? '-⅔ XP за потерянные сердца'
                : 'Нет XP — все сердца потеряны'}
            </Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{correctCount}/{total}</Text>
            <Text style={styles.statLabel}>верно</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: palette.primary }]}>
              {Math.round((correctCount / total) * 100)}%
            </Text>
            <Text style={styles.statLabel}>точность</Text>
          </View>
        </View>

        <Pressable
          style={styles.btnWrap}
          onPress={() => { vibrate(); navigation.navigate('IslandPath', { subjectId }); }}
        >
          <LinearGradient
            colors={[palette.primary, palette.secondary]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>Продолжить</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  islandWrap: {
    marginBottom: 12,
  },
  islandImg: {
    width: 200,
    height: 200,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },
  sub: {
    color: colors.textMuted,
    marginTop: 8,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  rewards: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  reward: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  rewardVal: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 28,
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 8, 28, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(90, 80, 140, 0.35)',
  },
  statItem: { alignItems: 'center', minWidth: 80 },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 24,
  },
  penaltyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,59,92,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,92,0.22)',
  },
  hearts: {
    flexDirection: 'row',
    gap: 3,
  },
  penaltyText: {
    color: '#FF6B8A',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  btnWrap: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  btn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  btnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
