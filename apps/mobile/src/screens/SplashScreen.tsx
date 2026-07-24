import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const MASCOT = require('../../assets/mascot.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.04, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [scale]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <ScreenBackground accentColor={colors.purple}>
      <View style={styles.content}>
        <Animated.View style={[styles.mascotWrap, mascotStyle]}>
          <View style={styles.mascotGlow} />
          <Image source={MASCOT} style={styles.mascot} resizeMode="contain" />
        </Animated.View>

        <Text style={styles.brand}>ОРТ</Text>

        <Text style={styles.tagline}>Путь к высоким баллам начинается здесь!</Text>

        <View style={styles.actions}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.replace('Register')}>
            <LinearGradient colors={[colors.purple, '#6B2FD4']} style={styles.primaryBtn}>
              <Text style={styles.primaryText}>Начать</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Pressable style={styles.loginLink} onPress={() => navigation.replace('Login')} hitSlop={8}>
          <Text style={styles.loginLinkText}>У меня уже есть аккаунт</Text>
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
    paddingHorizontal: spacing.xl,
  },
  mascotWrap: {
    width: 220,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  mascotGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.purple,
    opacity: 0.35,
    shadowColor: colors.purple,
    shadowOpacity: 0.9,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  mascot: {
    width: 220,
    height: 260,
  },
  brand: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: colors.purpleGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    marginTop: 48,
    gap: 12,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  primaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: {
    marginTop: 20,
    padding: 8,
  },
  loginLinkText: {
    color: colors.purpleGlow,
    fontSize: 14,
    fontWeight: '600',
  },
});
