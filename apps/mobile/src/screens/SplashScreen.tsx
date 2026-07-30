import React from 'react';
import { Image, ImageBackground, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const BACKGROUND = require('../../assets/Welcome01.png');
const PAW_LOGO = require('../../assets/logo1.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  return (
    <ImageBackground source={BACKGROUND} style={styles.root} resizeMode="cover">
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(247,246,252,0.92)', 'rgba(247,246,252,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.top}>
        <Image source={PAW_LOGO} style={styles.pawLogo} resizeMode="contain" />
        <Text style={styles.brand}>Qadam</Text>
        <Text style={styles.tagline}>Учись. Практикуй. Достигай.</Text>
        <Text style={styles.subtagline}>Твоё будущее начинается с Qadam!</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.replace('Register')}>
          <LinearGradient colors={[colors.purple, '#6B2FD4']} style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Начать</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Pressable
          style={styles.secondaryBtn}
          onPress={() => navigation.replace('Login')}
          hitSlop={8}
        >
          <Text style={styles.secondaryText}>У меня уже есть аккаунт</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  top: {
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: spacing.xl,
  },
  pawLogo: {
    width: 96,
    height: 96,
    marginBottom: 4,
  },
  brand: {
    color: colors.purple,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtagline: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 2,
  },
  actions: {
    width: '100%',
    gap: 12,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl + 24,
    marginTop: 'auto',
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  secondaryText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
