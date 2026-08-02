import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { TextInput } from '../components/ui/TextInput';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PetType } from '@qadam/types';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { saveOnboarding } from '../services/progressService';
import { useAppStore } from '../store/useAppStore';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'PetName'>;

const PET_OPTIONS: { type: PetType; label: string; image: any; defaultName: string }[] = [
  { type: 'bars', label: 'Снежный барс', image: require('../../assets/petbars.png'), defaultName: 'Барсик' },
  { type: 'cat', label: 'Кот', image: require('../../assets/petcat.png'), defaultName: 'Барсик' },
  { type: 'dog', label: 'Пёс', image: require('../../assets/petdog.png'), defaultName: 'Барсик' },
  { type: 'eagle', label: 'Орёл', image: require('../../assets/peteagle.png'), defaultName: 'Барсик' },
  { type: 'penguin', label: 'Пингвин', image: require('../../assets/petpenguin.png'), defaultName: 'Барсик' },
];

export function PetNameScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const userId = useAppStore((s) => s.userId);
  const setOnboardingInfo = useAppStore((s) => s.setOnboardingInfo);
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const rank = useAppStore((s) => s.rank);
  const schoolId = useAppStore((s) => s.schoolId);
  const classId = useAppStore((s) => s.classId);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const selected = PET_OPTIONS[index];

  const handleContinue = async () => {
    const trimmed = name.trim() || selected.defaultName;
    setLoading(true);
    try {
      if (userId) {
        await saveOnboarding(userId, { pet_name: trimmed, pet_type: selected.type });
        setOnboardingInfo({
          pet_name: trimmed, pet_type: selected.type, rank,
          school_id: schoolId, class_id: classId,
        });
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
              onPress={() => setIndex((v) => (v - 1 + PET_OPTIONS.length) % PET_OPTIONS.length)}
              hitSlop={10}
            >
              <Ionicons name="chevron-back" size={26} color={colors.text} />
            </Pressable>

            <View style={styles.mascotWrap}>
              <Image source={selected.image} style={styles.mascot} resizeMode="contain" />
            </View>

            <Pressable
              style={styles.arrowBtn}
              onPress={() => setIndex((v) => (v + 1) % PET_OPTIONS.length)}
              hitSlop={10}
            >
              <Ionicons name="chevron-forward" size={26} color={colors.text} />
            </Pressable>
          </View>

          <Text style={styles.petLabel}>{selected.label}</Text>

          <Text style={styles.subtitle}>Как назвать твоего питомца?</Text>

          <TextInput
            style={styles.input}
            placeholder={selected.defaultName}
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

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  title: { color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  carousel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },
  arrowBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  mascotWrap: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: { width: 160, height: 160 },
  petLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 20 },
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
  btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
