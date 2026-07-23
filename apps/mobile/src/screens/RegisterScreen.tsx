import React, { useEffect, useState } from 'react';
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
import { signIn, signUp } from '../services/authService';
import { saveOnboarding } from '../services/progressService';
import { listSchools } from '../services/schoolsService';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [classLabel, setClassLabel] = useState('');
  const [schools, setSchoolsList] = useState<{ id: string; name: string }[]>([]);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [dataConsent, setDataConsent] = useState(false);
  const [showInRating, setShowInRating] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listSchools().then(setSchoolsList).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Заполни имя, email и пароль');
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

    setLoading(true);
    try {
      const { error: signUpErr } = await signUp(email.trim(), password, name.trim());
      if (signUpErr) { setError(translateError(signUpErr.message)); return; }

      const { data: loginData, error: loginErr } = await signIn(email.trim(), password);
      if (loginErr || !loginData.user) { setError('Аккаунт создан — войди с паролем'); return; }

      await saveOnboarding(loginData.user.id, {
        phone: phone.trim() || undefined,
        class_label: classLabel.trim() || undefined,
        school_id: schoolId,
        data_consent: dataConsent,
        show_in_school_rating: showInRating,
      });

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
          <Text style={styles.subtitle}>Путь к высоким баллам начинается здесь</Text>

          <Field icon="person-outline" placeholder="Имя" value={name} onChangeText={setName} autoCapitalize="words" />
          <Field icon="call-outline" placeholder="Телефон / Email" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
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

          <Field icon="school-outline" placeholder="Класс (например 9-А)" value={classLabel} onChangeText={setClassLabel} />

          {schools.length > 0 && (
            <View style={styles.schoolSection}>
              <Text style={styles.schoolLabel}>Школа (необязательно)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.schoolChips}>
                <Pressable
                  style={[styles.chip, schoolId === null && styles.chipActive]}
                  onPress={() => setSchoolId(null)}
                >
                  <Text style={[styles.chipText, schoolId === null && styles.chipTextActive]}>Без школы</Text>
                </Pressable>
                {schools.map((s) => (
                  <Pressable
                    key={s.id}
                    style={[styles.chip, schoolId === s.id && styles.chipActive]}
                    onPress={() => setSchoolId(s.id)}
                  >
                    <Text style={[styles.chipText, schoolId === s.id && styles.chipTextActive]}>{s.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <Consent
            checked={dataConsent}
            onToggle={() => setDataConsent((v) => !v)}
            label="Согласен на обработку персональных данных"
          />
          <Consent
            checked={showInRating}
            onToggle={() => setShowInRating((v) => !v)}
            label="Участвовать в школьном рейтинге"
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
    </ScreenBackground>
  );
}

function Field(props: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words';
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
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  subtitle: { color: colors.textMuted, fontSize: 14, marginBottom: 20, textAlign: 'center' },
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
  inputPass: { paddingRight: 0 },
  eyeBtn: { padding: 8 },
  schoolSection: { marginBottom: 12 },
  schoolLabel: { color: colors.textMuted, fontSize: 13, marginBottom: 8 },
  schoolChips: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.purple, borderColor: colors.purple },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.text },
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
});
