import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { saveOnboarding } from '../services/progressService';
import { useAppStore } from '../store/useAppStore';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'PetName'>;

const MASCOT = require('../../assets/mascot.png');

// Only one mascot illustration exists — there's no real distinct artwork
// for different "appearances" to page through. The arrows still work and
// cycle a color accent (glow tint) as a stand-in for outfit variants,
// rather than faking art that doesn't exist.
const VARIANT_TINTS = [colors.purple, '#3B8BFF', '#FF8C3B', '#2EE59D'];

export function PetNameScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [variant, setVariant] = useState(0);
  const [loading, setLoading] = useState(false);
  const userId = useAppStore((s) => s.userId);
  const setOnboardingInfo = useAppStore((s) => s.setOnboardingInfo);
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const rank = useAppStore((s) => s.rank);
  const schoolId = useAppStore((s) => s.schoolId);
  const classId = useAppStore((s) => s.classId);

  const tint = VARIANT_TINTS[variant];

  const handleContinue = async () => {
    const trimmed = name.trim() || 'Барсик';
    setLoading(true);
    try {
      if (userId) {
        await saveOnboarding(userId, { pet_name: trimmed });
        setOnboardingInfo({ pet_name: trimmed, rank, school_id: schoolId, class_id: classId });
      }
      setOnboarded(true);
      navigation.replace('Main');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground accentColor={colors.purple}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.content}>
          <Text style={styles.title}>Выберите своего питомца</Text>

          <View style={styles.carousel}>
            <Pressable
              style={styles.arrowBtn}
              onPress={() => setVariant((v) => (v - 1 + VARIANT_TINTS.length) % VARIANT_TINTS.length)}
              hitSlop={10}
            >
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </Pressable>

            <View style={styles.mascotWrap}>
              <View style={[styles.mascotGlow, { backgroundColor: tint, shadowColor: tint }]} />
              <Image source={MASCOT} style={styles.mascot} resizeMode="contain" />
            </View>

            <Pressable
              style={styles.arrowBtn}
              onPress={() => setVariant((v) => (v + 1) % VARIANT_TINTS.length)}
              hitSlop={10}
            >
              <Ionicons name="chevron-forward" size={26} color={colors.text} />
            </Pressable>
          </View>

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
  title: { color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  carousel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 },
  arrowBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  mascotWrap: { width: 160, height: 190, alignItems: 'center', justifyContent: 'center' },
  mascotGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.35,
    shadowOpacity: 0.9,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  mascot: { width: 160, height: 190 },
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
