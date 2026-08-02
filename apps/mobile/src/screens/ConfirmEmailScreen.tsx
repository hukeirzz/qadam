import React, { useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { TextInput } from '../components/ui/TextInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { RootStackParamList } from '../types/navigation';
import { verifySignupCode, resendConfirmationCode } from '../services/authService';
import { completeRegistration } from '../services/registrationService';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ConfirmEmail'>;

export function ConfirmEmailScreen({ navigation, route }: Props) {
  const { email, fullName, classCode = '', dataConsent = true } = route.params;
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const handleConfirm = async () => {
    setError('');
    setNotice('');
    if (code.trim().length < 6) {
      setError('Введи код из письма');
      return;
    }
    setLoading(true);
    try {
      const { data, error: otpErr } = await verifySignupCode(email, code);
      if (otpErr || !data.session || !data.user) {
        setError('Неверный или просроченный код. Запроси новый.');
        return;
      }
      await completeRegistration(data.user.id, fullName, classCode, dataConsent);
      navigation.replace('Onboarding');
    } catch (e) {
      console.warn('ConfirmEmailScreen submit error:', e);
      setError('Что-то пошло не так. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setNotice('');
    setResending(true);
    try {
      const { error: resendErr } = await resendConfirmationCode(email);
      if (resendErr) {
        setError('Не удалось отправить код. Попробуй позже.');
        return;
      }
      setNotice('Новый код отправлен на почту');
    } catch {
      setError('Не удалось отправить код. Проверь интернет.');
    } finally {
      setResending(false);
    }
  };

  return (
    <ScreenBackground accentColor={colors.purple}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Ionicons name="mail-open-outline" size={44} color={colors.purpleGlow} style={styles.icon} />
          <Text style={styles.title}>Подтверди email</Text>
          <Text style={styles.subtitle}>
            Мы отправили код на {email}. Введи его ниже, чтобы завершить регистрацию.
          </Text>

          <View style={styles.inputWrap}>
            <Ionicons name="key-outline" size={18} color={colors.textDim} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.codeInput]}
              placeholder="Код из письма"
              placeholderTextColor={colors.textDim}
              value={code}
              onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 10))}
              keyboardType="number-pad"
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#FF3B5C" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}

          <Pressable onPress={handleConfirm} disabled={loading} style={styles.saveBtn}>
            <LinearGradient colors={[colors.purple, '#6B2FD4']} style={styles.saveGrad}>
              <Text style={styles.saveText}>
                {loading ? <ActivityIndicator color="#fff" /> : 'Подтвердить'}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={handleResend} disabled={resending} style={styles.resend}>
            <Text style={styles.resendText}>{resending ? 'Отправляем…' : 'Отправить код ещё раз'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, flexGrow: 1 },
  icon: { alignSelf: 'center', marginBottom: 12 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 6, marginBottom: 24 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceGlass,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 14 },
  codeInput: { letterSpacing: 6, fontWeight: '800', fontSize: 18 },
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
  errorText: { color: '#FF3B5C', fontSize: 13, flex: 1 },
  notice: { color: colors.purpleGlow, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  saveBtn: { marginTop: 8, borderRadius: 16, overflow: 'hidden' },
  saveGrad: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resend: { marginTop: 16, alignItems: 'center' },
  resendText: { color: colors.purpleGlow, fontSize: 14, fontWeight: '600' },
});
