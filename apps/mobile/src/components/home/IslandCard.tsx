import React, { useEffect } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const FLOAT_DISTANCE = 16;
const FLOAT_DURATION = 2600;

export interface IslandCardProps {
  title: string;
  currentSteps: number;
  totalSteps: number;
  imageSrc: ImageSourcePropType;
  progressColor: string;
  onPress?: () => void;
  style?: ViewStyle;
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function IslandCard({
  title,
  currentSteps,
  totalSteps,
  imageSrc,
  progressColor,
  onPress,
  style,
  index = 0,
}: IslandCardProps) {
  const progress =
    totalSteps > 0 ? Math.min(1, currentSteps / totalSteps) : 0;
  const floatY = useSharedValue(0);
  const wobble = useSharedValue(0); // лёгкий наклон + «дыхание» масштаба

  useEffect(() => {
    floatY.value = withDelay(
      index * 240,
      withRepeat(
        withTiming(-FLOAT_DISTANCE, {
          duration: FLOAT_DURATION,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );
    wobble.value = withDelay(
      index * 240,
      withRepeat(
        withTiming(1, {
          duration: FLOAT_DURATION,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );
  }, [floatY, wobble, index]);

  const floatStyle = useAnimatedStyle(() => {
    // wobble идёт 0→1→0; делаем колебание -1..1 для наклона.
    const swing = wobble.value * 2 - 1;
    return {
      transform: [
        { translateY: floatY.value },
        { rotate: `${swing * 2.5}deg` },
        { scale: 1 + wobble.value * 0.05 },
      ],
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.card, style]}
      disabled={!onPress}
    >
      <Animated.View style={[styles.visual, floatStyle]}>
        <Image
          source={imageSrc}
          style={[
            styles.image,
            {
              shadowColor: progressColor,
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>

      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      <View style={styles.progressRow}>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${progress * 100}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
        <Text style={styles.steps}>
          {currentSteps}/{totalSteps}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 22,
    alignItems: 'center',
  },
  visual: {
    width: '100%',
    height: 228,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  image: {
    width: '170%',
    height: 220,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 50,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  progressRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  steps: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
});
