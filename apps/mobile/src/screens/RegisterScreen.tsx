import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { TextInput } from '../components/ui/TextInput';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { QadamLogo } from '../components/ui/QadamLogo';
import { signIn, signUp } from '../services/authService';
import { loadUserProfile, saveOnboarding, saveProfileProgress } from '../services/progressService';
import { findClassByCode } from '../services/schoolsService';
import { useAppStore } from '../store/useAppStore';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [dataConsent, setDataConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useAppStore((s) => s.loadProfile);
  const setOnboardingInfo = useAppStore((s) => s.setOnboardingInfo);
  const setPremium = useAppStore((s) => s.setPremium);

  const handleSubmit = async () => {
    setError('');
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError('Заполни имя, фамилию, email и пароль');
      return;
    }
    if (password.length < 6) {
      setError('Пароль минимум 6 символов');
      return;
    }
    if (!dataConsent) {
      setError('Нужно дать согласие на обработку данных');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    setLoading(true);
    try {
      const { data: signUpData, error: signUpErr } = await signUp(email.trim(), password, fullName);
      if (signUpErr) { setError(translateError(signUpErr.message)); return; }

      // signUp already returns a live session when email confirmation isn't
      // required — no need for a separate signIn round trip in that case.
      // If there's no session, the Supabase project has "Confirm email"
      // turned on (Dashboard → Authentication → Sign In / Providers →
      // Email), which blocks sign-in until the link is clicked — that's a
      // project setting, not something this screen can bypass. Still try a
      // normal sign-in as a fallback in case it isn't actually required.
      let userId = signUpData.user?.id;
      if (!signUpData.session) {
        const { data: loginData, error: loginErr } = await signIn(email.trim(), password);
        if (loginErr || !loginData.user) {
          setError('Подтверди email по ссылке из письма, затем войди — после этого сможешь продолжить регистрацию');
          return;
        }
        userId = loginData.user.id;
      }
      if (!userId) { setError('Что-то пошло не так'); return; }
      const profile = await loadUserProfile(userId);
      loadProfile(
        profile ?? {
          id: userId, name: fullName,
          xp: 0, gems: 0, streak: 0,
          premium_unlocked: false, last_activity: null,
          completed_topics: [], weekly_steps: [0, 0, 0, 0, 0, 0, 0], week_start: null,
        },
      );

      // Код класса необязателен — если введён, но не найден, просто не
      // привязываем. Содержит свой school_id, так что заодно привязывает и школу.
      const studentClass = classCode.trim() ? await findClassByCode(classCode.trim()) : null;
      const resolvedSchoolId = studentClass?.school_id ?? null;

      await saveOnboarding(userId, {
        school_id: resolvedSchoolId,
        class_id: studentClass?.id ?? null,
        data_consent: dataConsent,
      });
      setOnboardingInfo({
        pet_name: null, rank: null, school_id: resolvedSchoolId, class_id: studentClass?.id ?? null,
      });

      // Партнёрская школа — все ранги и премиум-контент открываются автоматически.
      if (resolvedSchoolId) {
        setPremium(true);
        await saveProfileProgress(userId, { premium_unlocked: true });
      }

      navigation.replace('PetName');
    } catch (e) {
      console.warn('RegisterScreen submit error:', e);
      setError('Что-то пошло не так. Проверь соединение и попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoWrap}>
            <QadamLogo size="lg" />
          </View>

          <Text style={styles.title}>Создай аккаунт</Text>

          <Field icon="person-outline" placeholder="Имя" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
          <Field icon="person-outline" placeholder="Фамилия" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
          <Field icon="mail-outline" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

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
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textDim} />
            </Pressable>
          </View>

          <Field icon="people-outline" placeholder="Код класса" value={classCode} onChangeText={setClassCode} autoCapitalize="characters" />
          <Text style={styles.hint}>Если знаешь код своего класса — привяжет и школу, и класс</Text>

          <Consent checked={dataConsent} onToggle={() => setDataConsent((v) => !v)} label="Согласие на обработку данных" />

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#FF3B5C" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity activeOpacity={0.85} onPress={handleSubmit} disabled={loading || !dataConsent}>
            <LinearGradient
              colors={dataConsent ? [colors.purple, '#6B2FD4'] : [colors.surface, colors.surface]}
              style={[styles.btn, !dataConsent && styles.btnDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.btnText, !dataConsent && styles.btnTextDisabled]}>Зарегистрироваться</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Pressable style={styles.switchMode} onPress={() => navigation.replace('Login')}>
            <Text style={styles.switchText}>
              Уже есть аккаунт? <Text style={styles.switchLink}>Войти</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

function Field(props: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'characters';
}) {
  return (
    <View style={styles.inputWrap}>
      <Ionicons name={props.icon} size={18} color={colors.textDim} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={props.placeholder}
        placeholderTextColor={colors.textDim}
        value={props.value}
        onChangeText={props.onChangeText}
        keyboardType={props.keyboardType ?? 'default'}
        autoCapitalize={props.autoCapitalize ?? 'sentences'}
      />
    </View>
  );
}

function Consent({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <Pressable style={styles.consentRow} onPress={onToggle} hitSlop={6}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
      <Text style={styles.consentText}>{label}</Text>
    </Pressable>
  );
}

function translateError(msg: string): string {
  if (msg.includes('already registered') || msg.includes('already been registered'))
    return 'Этот email уже зарегистрирован';
  if (msg.includes('weak_password') || msg.includes('too short'))
    return 'Пароль слишком простой (мин. 6 символов)';
  return msg || 'Что-то пошло не так';
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 20 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
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
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, color: colors.text, fontSize: 15 },
  placeholder: { color: colors.textDim },
  inputPass: { paddingRight: 0 },
  eyeBtn: { padding: 8 },
  hint: { color: colors.textDim, fontSize: 12, marginTop: -6, marginBottom: 12, marginLeft: 4 },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.purple, borderColor: colors.purple },
  consentText: { color: colors.textMuted, fontSize: 13, flex: 1 },
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
  btn: { marginTop: 4, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  btnDisabled: { borderWidth: 1, borderColor: colors.border },
  btnText: { color: colors.text, fontWeight: '700', fontSize: 16 },
  btnTextDisabled: { color: colors.textDim },
  switchMode: { marginTop: 20, alignItems: 'center' },
  switchText: { color: colors.textMuted, fontSize: 14 },
  switchLink: { color: colors.purpleGlow, fontWeight: '700' },
});
