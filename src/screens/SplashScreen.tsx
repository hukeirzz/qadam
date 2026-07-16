import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

const APP_ICON = require('../../assets/logo.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.06, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [scale]);

  const portalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <ScreenBackground accentColor={colors.purple}>
      <View style={styles.content}>
        <Animated.View style={[styles.portal, portalStyle]}>
          <LinearGradient
            colors={['#6B2FD4', '#9047FF', '#3D1A7A']}
            style={styles.portalInner}
          >
            <Image source={APP_ICON} style={styles.portalLogo} resizeMode="contain" />
          </LinearGradient>
        </Animated.View>

        <Text style={styles.brand}>Qadam</Text>

        <Text style={styles.tagline}>Делай шаги к знаниям каждый день</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.replace('Login', { mode: 'register' })}
          >
            <LinearGradient
              colors={[colors.purple, '#6B2FD4']}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryText}>Начать путь</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  portal: {
    marginBottom: 40,
  },
  portalInner: {
    width: 140,
    height: 140,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.purple,
    shadowOpacity: 0.8,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  portalLogo: {
    width: 200,
    height: 200,
    borderRadius: 20,
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
});
