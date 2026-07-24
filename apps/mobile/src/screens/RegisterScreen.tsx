import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
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
import { signIn, signUp } from '../services/authService';
import { loadUserProfile, saveOnboarding } from '../services/progressService';
import { findSchoolByCode } from '../services/schoolsService';
import { useAppStore } from '../store/useAppStore';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const CLASS_OPTIONS = ['8 класс', '9 класс', '10 класс', '11 класс'];

export function RegisterScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [schoolCode, setSchoolCode] = useState('');
  const [classLabel, setClassLabel] = useState<string | null>(null);
  const [classPickerOpen, setClassPickerOpen] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [showInRating, setShowInRating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useAppStore((s) => s.loadProfile);
  const setOnboardingInfo = useAppStore((s) => s.setOnboardingInfo);

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
      setError('Нужно согласие на обработку данных');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    setLoading(true);
    try {
      const { error: signUpErr } = await signUp(email.trim(), password, fullName);
      if (signUpErr) { setError(translateError(signUpErr.message)); return; }

      const { data: loginData, error: loginErr } = await signIn(email.trim(), password);
      if (loginErr || !loginData.user) { setError('Аккаунт создан — войди с паролем'); return; }

      const userId = loginData.user.id;
      const profile = await loadUserProfile(userId);
      loadProfile(
        profile ?? {
          id: userId, name: fullName,
          xp: 0, gems: 0, streak: 0,
          premium_unlocked: false, last_activity: null,
          completed_topics: [], weekly_steps: [0, 0, 0, 0, 0, 0, 0], week_start: null,
        },
      );

      // Код школы необязателен — если введён, но не найден, просто не привязываем школу.
      const school = schoolCode.trim() ? await findSchoolByCode(schoolCode.trim()) : null;

      await saveOnboarding(userId, {
        class_label: classLabel ?? undefined,
        school_id: school?.id ?? null,
        data_consent: dataConsent,
        show_in_school_rating: showInRating,
      });
      setOnboardingInfo({ pet_name: null, rank: null, school_id: school?.id ?? null, class_id: null });

      navigation.replace('PetName');
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

          <Field icon="key-outline" placeholder="Код школы" value={schoolCode} onChangeText={setSchoolCode} autoCapitalize="characters" />
          <Text style={styles.hint}>Необязательно, если ты не ученик партнёрской школы</Text>

          <Pressable style={styles.inputWrap} onPress={() => setClassPickerOpen(true)}>
            <Ionicons name="school-outline" size={18} color={colors.textDim} style={styles.inputIcon} />
            <Text style={[styles.input, !classLabel && styles.placeholder]}>{classLabel ?? 'Класс'}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.textDim} />
          </Pressable>

          <Consent checked={dataConsent} onToggle={() => setDataConsent((v) => !v)} label="Согласие на обработку данных" />
          <Consent
            checked={showInRating}
            onToggle={() => setShowInRating((v) => !v)}
            label="Участвовать в школьном рейтинге (опционально)"
          />

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#FF3B5C" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity activeOpacity={0.85} onPress={handleSubmit} disabled={loading}>
            <LinearGradient colors={[colors.purple, '#6B2FD4']} style={styles.btn}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Зарегистрироваться</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <Pressable style={styles.switchMode} onPress={() => navigation.replace('Login')}>
            <Text style={styles.switchText}>
              Уже есть аккаунт? <Text style={styles.switchLink}>Войти</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={classPickerOpen} transparent animationType="fade" onRequestClose={() => setClassPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setClassPickerOpen(false)}>
          <View style={styles.modalCard}>
            {CLASS_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                style={styles.modalOption}
                onPress={() => { setClassLabel(opt); setClassPickerOpen(false); }}
              >
                <Text style={styles.modalOptionText}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
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
  btnText: { color: colors.text, fontWeight: '700', fontSize: 16 },
  switchMode: { marginTop: 20, alignItems: 'center' },
  switchText: { color: colors.textMuted, fontSize: 14 },
  switchLink: { color: colors.purpleGlow, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionText: { color: colors.text, fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
