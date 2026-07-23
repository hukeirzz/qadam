import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { QadamLogo } from '../components/ui/QadamLogo';
import { signIn } from '../services/authService';
import { loadUserProfile, loadOnboardingInfo } from '../services/progressService';
import { loadAllTopicsToCache, getCachedSubjectTopicIds } from '../services/topicsService';
import { useAppStore } from '../store/useAppStore';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useAppStore((s) => s.loadProfile);
  const setRemoteTopics = useAppStore((s) => s.setRemoteTopics);
  const setOnboardingInfo = useAppStore((s) => s.setOnboardingInfo);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Заполни все поля');
      return;
    }
    if (password.length < 6) {
      setError('Пароль минимум 6 символов');
      return;
    }

    setLoading(true);
    try {
      const { data, error: err } = await signIn(email.trim(), password);
      if (err || !data.user) { setError(translateError(err?.message ?? '')); return; }
      const displayName = data.user.user_metadata?.name ?? email.split('@')[0];
      await afterLogin(data.user.id, displayName);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Открываем отдельное окно сброса пароля (email можно подставить из поля).
    (navigation as any).navigate('ResetPassword', { email: email.trim() || undefined });
  };

  const afterLogin = async (userId: string, displayName: string) => {
    const profile = await loadUserProfile(userId);
    loadProfile(
      profile ?? {
        id: userId,
        name: displayName,
        xp: 0, gems: 0, streak: 0,
        premium_unlocked: false,
        last_activity: null,
        completed_topics: [],
        weekly_steps: [0,0,0,0,0,0,0],
        week_start: null,
      },
    );
    // Подгружаем темы и реальные id по предметам, чтобы счётчик шагов был
    // корректным сразу после входа, а не только после захода на остров.
    loadAllTopicsToCache().then(() => {
      const ids = getCachedSubjectTopicIds();
      if (Object.keys(ids).length > 0) setRemoteTopics(ids);
    });
    // Best-effort — pet/rank/school columns may not exist yet if the
    // migrations haven't been applied live; a failure here shouldn't
    // block login.
    loadOnboardingInfo(userId).then((info) => {
      if (info) setOnboardingInfo(info);
    }).catch(() => {});
    navigation.replace('Main');
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoWrap}>
            <QadamLogo size="lg" />
          </View>

          <Text style={styles.subtitle}>Продолжи свой путь</Text>

          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={colors.textDim} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textDim}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textDim} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.inputPass]}
              placeholder="Пароль"
              placeholderTextColor={colors.textDim}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <Pressable onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
              <Ionicons
                name={showPass ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.textDim}
              />
            </Pressable>
          </View>

          <Pressable onPress={handleForgotPassword} style={styles.forgot} hitSlop={6}>
            <Text style={styles.forgotText}>Забыли пароль?</Text>
          </Pressable>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#FF3B5C" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={loading}
          >
            <LinearGradient
              colors={[colors.purple, '#6B2FD4']}
              style={styles.btn}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Войти</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Pressable style={styles.switchMode} onPress={() => navigation.replace('Register')}>
            <Text style={styles.switchText}>
              Нет аккаунта? <Text style={styles.switchLink}>Зарегистрируйся</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login') || msg.includes('invalid_credentials'))
    return 'Неверный email или пароль';
  if (msg.includes('already registered') || msg.includes('already been registered'))
    return 'Этот email уже зарегистрирован';
  if (msg.includes('Email not confirmed'))
    return 'Подтверди email перед входом';
  if (msg.includes('weak_password') || msg.includes('too short'))
    return 'Пароль слишком простой (мин. 6 символов)';
  return msg || 'Что-то пошло не так';
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 28,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.purple,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    color: colors.text,
    fontSize: 15,
  },
  inputPass: {
    paddingRight: 0,
  },
  eyeBtn: {
    padding: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,59,92,0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,59,92,0.25)',
  },
  errorText: {
    color: '#FF3B5C',
    fontSize: 13,
    flex: 1,
  },
  btn: {
    marginTop: 4,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  btnText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  switchMode: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  switchLink: {
    color: colors.purpleGlow,
    fontWeight: '700',
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 6,
  },
  forgotText: {
    color: colors.purpleGlow,
    fontSize: 13,
    fontWeight: '600',
  },
});
