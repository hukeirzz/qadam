import React from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const WELCOME = require('../../assets/welcome.png');
const LOGO1 = require('../../assets/logo1.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <Image source={WELCOME} style={styles.background} resizeMode="cover" />

      <LinearGradient
        colors={['transparent', 'rgba(10,8,24,0.2)', 'rgba(6,4,16,0.7)']}
        locations={[0, 0.65, 1]}
        style={styles.scrim}
      />

      <View style={styles.content}>
        <View style={styles.brandRow}>
          <Image source={LOGO1} style={styles.brandLogo} resizeMode="contain" />
          <Text style={styles.brand}>Qadam</Text>
        </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl + 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  brandLogo: {
    width: 40,
    height: 40,
  },
  brand: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
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
    marginTop: 40,
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
