import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { saveOnboarding } from '../services/progressService';
import { useAppStore } from '../store/useAppStore';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'PetName'>;

// No dedicated mascot illustration exists yet — following the same
// emoji-placeholder convention already used elsewhere in this app
// (e.g. PracticeScreen.tsx's 💬) rather than inventing a fake asset.
const PET_EMOJI = '🐆';

export function PetNameScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const userId = useAppStore((s) => s.userId);
  const setOnboardingInfo = useAppStore((s) => s.setOnboardingInfo);
  const rank = useAppStore((s) => s.rank);
  const schoolId = useAppStore((s) => s.schoolId);
  const classId = useAppStore((s) => s.classId);

  const handleContinue = async () => {
    const trimmed = name.trim() || 'Барсик';
    setLoading(true);
    try {
      if (userId) {
        await saveOnboarding(userId, { pet_name: trimmed });
        setOnboardingInfo({ pet_name: trimmed, rank, school_id: schoolId, class_id: classId });
      }
      navigation.replace('EntranceTest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground accentColor={colors.purple}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.content}>
          <View style={styles.portal}>
            <LinearGradient colors={['#6B2FD4', '#9047FF', '#3D1A7A']} style={styles.portalInner}>
              <Text style={styles.petEmoji}>{PET_EMOJI}</Text>
            </LinearGradient>
          </View>

          <Text style={styles.title}>Выбери своего снежного барса</Text>
          <Text style={styles.subtitle}>Как назвать твоего барса?</Text>

          <TextInput
            style={styles.input}
            placeholder="Барсик"
            placeholderTextColor={colors.textDim}
            value={name}
            onChangeText={setName}
            maxLength={20}
            autoCapitalize="words"
          />

          <TouchableOpacity activeOpacity={0.85} onPress={handleContinue} disabled={loading} style={styles.btnWrap}>
            <LinearGradient colors={[colors.purple, '#6B2FD4']} style={styles.btn}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Продолжить</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  portal: { marginBottom: 32 },
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
  petEmoji: { fontSize: 72 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 24 },
  input: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  btnWrap: { width: '100%' },
  btn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  btnText: { color: colors.text, fontWeight: '700', fontSize: 16 },
});
