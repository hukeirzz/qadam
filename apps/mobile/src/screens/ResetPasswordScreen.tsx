import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { TextInput } from '../components/ui/TextInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { RootStackParamList } from '../types/navigation';
import { resetPassword, verifyRecoveryCode, updatePassword, signOut } from '../services/authService';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;
type Step = 'request' | 'reset';

export function ResetPasswordScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Шаг 1 — отправить код на email.
  const handleSendCode = async () => {
    setError('');
    if (!email.trim()) {
      setError('Введи email');
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await resetPassword(email);
      if (err) {
        const status = (err as any)?.status;
        if (status === 504 || /timeout|deadline|gateway/i.test(err.message ?? '')) {
          setError('Сервер не успел отправить письмо. Попробуй чуть позже.');
        } else if (status === 429 || /rate|too many/i.test(err.message ?? '')) {
          setError('Слишком часто. Подожди минуту и попробуй снова.');
        } else {
          setError('Не удалось отправить код. Попробуй позже.');
        }
        return;
      }
      setStep('reset');
      Alert.alert('Код отправлен', `На ${email.trim()} отправлен 8-значный код. Проверь почту (и «Спам»).`);
    } catch {
      setError('Не удалось отправить код. Проверь интернет.');
    } finally {
      setLoading(false);
    }
  };

  // Шаг 2 — проверить код и сменить пароль.
  const handleReset = async () => {
    setError('');
    if (code.trim().length < 6) {
      setError('Введи код из письма');
      return;
    }
    if (password.length < 6) {
      setError('Пароль минимум 6 символов');
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    setLoading(true);
    try {
      const { error: otpErr } = await verifyRecoveryCode(email, code);
      if (otpErr) {
        setError('Неверный или просроченный код. Запроси новый.');
        return;
      }
      const { error: pwErr } = await updatePassword(password);
      if (pwErr) {
        setError(pwErr.message);
        return;
      }
      await signOut().catch(() => {});
      Alert.alert('Готово', 'Пароль обновлён. Войди с новым паролем.', [
        {
          text: 'OK',
          onPress: () =>
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
        },
      ]);
    } catch {
      setError('Что-то пошло не так. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground accentColor={colors.purple}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>

          <Ionicons name="lock-open-outline" size={44} color={colors.purpleGlow} style={styles.icon} />
          <Text style={styles.title}>Сброс пароля</Text>
          <Text style={styles.subtitle}>
            {step === 'request'
              ? 'Введи email — пришлём код для сброса'
              : 'Введи код из письма и новый пароль'}
          </Text>

          {/* Email — всегда виден */}
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={colors.textDim} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textDim}
              value={email}
              onChangeText={setEmail}
              editable={step === 'request'}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {step === 'reset' && (
            <>
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

              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textDim} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Новый пароль (мин. 6)"
                  placeholderTextColor={colors.textDim}
                  secureTextEntry={!show}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShow((s) => !s)} hitSlop={8}>
                  <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textDim} />
                </Pressable>
              </View>

              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textDim} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Повтори пароль"
                  placeholderTextColor={colors.textDim}
                  secureTextEntry={!show}
                  value={confirm}
                  onChangeText={setConfirm}
                  autoCapitalize="none"
                />
              </View>
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={step === 'request' ? handleSendCode : handleReset}
            disabled={loading}
            style={styles.saveBtn}
          >
            <LinearGradient colors={[colors.purple, '#5B2ED4']} style={styles.saveGrad}>
              <Text style={styles.saveText}>
                {loading
                  ? 'Подожди…'
                  : step === 'request'
                  ? 'Отправить код'
                  : 'Сохранить пароль'}
              </Text>
            </LinearGradient>
          </Pressable>

          {step === 'reset' && (
            <Pressable onPress={handleSendCode} disabled={loading} style={styles.resend}>
              <Text style={styles.resendText}>Отправить код ещё раз</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, flexGrow: 1 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
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
  error: { color: '#FF6B85', fontSize: 13, marginBottom: 10 },
  saveBtn: { marginTop: 8, borderRadius: 16, overflow: 'hidden' },
  saveGrad: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  saveText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  resend: { marginTop: 16, alignItems: 'center' },
  resendText: { color: colors.purpleGlow, fontSize: 14, fontWeight: '600' },
});
