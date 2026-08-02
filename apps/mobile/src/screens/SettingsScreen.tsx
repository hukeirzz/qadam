import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { TextInput } from '../components/ui/TextInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PetType } from '@qadam/types';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { ProfileStackParamList } from '../navigation/ProfileStack';
import { ColorPalette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useAppStore } from '../store/useAppStore';
import { petImages } from '../assets/petImages';
import { signOut, deleteAccount, getSession } from '../services/authService';
import { clearAllPracticeResults } from '../utils/practiceStorage';
import { saveOnboarding, saveProfileProgress } from '../services/progressService';
import { fetchClassById, findClassByCode } from '../services/schoolsService';
import { vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

const PET_TYPES: { type: PetType; label: string }[] = [
  { type: 'bars', label: 'Снежный барс' },
  { type: 'cat', label: 'Кот' },
  { type: 'dog', label: 'Пёс' },
  { type: 'eagle', label: 'Орёл' },
  { type: 'penguin', label: 'Пингвин' },
];

const PET_TYPE_LABELS: Record<PetType, string> = {
  bars: 'Снежный барс', cat: 'Кот', dog: 'Пёс', eagle: 'Орёл', penguin: 'Пингвин',
};

export function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, mode, toggleMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const userId = useAppStore((s) => s.userId);
  const userName = useAppStore((s) => s.userName);
  const classLabel = useAppStore((s) => s.classLabel);
  const petName = useAppStore((s) => s.petName);
  const petType = useAppStore((s) => s.petType);
  const rank = useAppStore((s) => s.rank);
  const schoolId = useAppStore((s) => s.schoolId);
  const classId = useAppStore((s) => s.classId);
  const setOnboardingInfo = useAppStore((s) => s.setOnboardingInfo);
  const setUserName = useAppStore((s) => s.setUserName);
  const setPremium = useAppStore((s) => s.setPremium);

  const [email, setEmail] = useState<string | null>(null);
  const [linkedClassName, setLinkedClassName] = useState<string | null>(null);

  const [namePickerOpen, setNamePickerOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [petPickerOpen, setPetPickerOpen] = useState(false);
  const [petNameModalOpen, setPetNameModalOpen] = useState(false);
  const [petNameDraft, setPetNameDraft] = useState('');
  const [classCodeModalOpen, setClassCodeModalOpen] = useState(false);
  const [classCodeDraft, setClassCodeDraft] = useState('');
  const [classCodeSaving, setClassCodeSaving] = useState(false);

  useEffect(() => {
    getSession().then((session) => setEmail(session?.user?.email ?? null));
  }, []);

  useEffect(() => {
    if (!classId) { setLinkedClassName(null); return; }
    fetchClassById(classId).then((c) => setLinkedClassName(c?.name ?? null));
  }, [classId]);

  const persistOnboarding = async (
    patch: Partial<{ pet_name: string; pet_type: PetType; class_label: string; school_id: string | null; class_id: string | null }>,
  ) => {
    if (!userId) return;
    await saveOnboarding(userId, patch);
    setOnboardingInfo({
      pet_name: patch.pet_name ?? petName,
      pet_type: patch.pet_type ?? petType,
      rank,
      school_id: patch.school_id !== undefined ? patch.school_id : schoolId,
      class_id: patch.class_id !== undefined ? patch.class_id : classId,
      class_label: patch.class_label ?? classLabel,
    });
  };

  const selectPetType = (type: PetType) => {
    vibrate();
    setPetPickerOpen(false);
    persistOnboarding({ pet_type: type }).catch(console.warn);
  };

  const openNameModal = () => {
    vibrate();
    setNameDraft(userName);
    setNamePickerOpen(true);
  };

  const saveName = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    setNamePickerOpen(false);
    setUserName(trimmed);
  };

  const openPetNameModal = () => {
    vibrate();
    setPetNameDraft(petName ?? '');
    setPetNameModalOpen(true);
  };

  const savePetName = () => {
    const trimmed = petNameDraft.trim();
    if (!trimmed) return;
    setPetNameModalOpen(false);
    persistOnboarding({ pet_name: trimmed }).catch(console.warn);
  };

  const openClassCodeModal = () => {
    vibrate();
    setClassCodeDraft('');
    setClassCodeModalOpen(true);
  };

  const saveClassCode = async () => {
    const code = classCodeDraft.trim();
    if (!code) return;
    setClassCodeSaving(true);
    try {
      const studentClass = await findClassByCode(code);
      if (!studentClass) {
        Alert.alert('Класс не найден', 'Проверь код и попробуй снова');
        return;
      }
      setLinkedClassName(studentClass.name);
      await persistOnboarding({ school_id: studentClass.school_id, class_id: studentClass.id });
      // Класс всегда принадлежит партнёрской школе — ранги и премиум-контент открываются автоматически.
      setPremium(true);
      if (userId) await saveProfileProgress(userId, { premium_unlocked: true });
      setClassCodeModalOpen(false);
    } finally {
      setClassCodeSaving(false);
    }
  };

  const handleLogout = () => {
    vibrate();
    // signOut triggers onAuthStateChange(SIGNED_OUT) → RootNavigator навигирует и очищает store
    signOut().catch(console.warn);
  };

  const handleDeleteAccount = () => {
    vibrate();
    Alert.alert(
      'Удалить аккаунт?',
      'Это действие необратимо. Весь прогресс и данные будут удалены.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteAccount();
            if (error) {
              Alert.alert('Ошибка', error.message ?? 'Не удалось удалить аккаунт');
              return;
            }
            // Результаты практики лежат в AsyncStorage без привязки к userId —
            // при обычном выходе их нужно сохранить (тот же аккаунт войдёт
            // снова), а вот при удалении аккаунта они должны стереться, иначе
            // достанутся следующему, кто зарегистрируется на этом устройстве.
            clearAllPracticeResults().catch(console.warn);
          },
        },
      ],
    );
  };

  return (
    <ScreenBackground>
      <View style={[styles.flex, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => { vibrate(); navigation.goBack(); }} hitSlop={6}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Настройки</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
        >
        {/* Профиль */}
        <Text style={styles.sectionTitle}>Профиль</Text>
        <View style={styles.card}>
          <Row icon="person" label="ФИО" value={userName} isLast onPress={openNameModal} />
        </View>

        {/* Питомец */}
        <Text style={styles.sectionTitle}>Питомец</Text>
        <View style={[styles.card, styles.petCard]}>
          <View style={styles.petAvatarRing}>
            {petType ? (
              <Image source={petImages[petType]} style={styles.petAvatarImage} resizeMode="cover" />
            ) : (
              <MaterialCommunityIcons name="paw" size={28} color={colors.textMuted} />
            )}
          </View>
          <View style={styles.petRows}>
            <Row
              icon="paw"
              iconSet="material"
              label="Питомец"
              value={petType ? `${petName ?? ''} (${PET_TYPE_LABELS[petType]})` : 'Не выбран'}
              isLast={false}
              onPress={() => { vibrate(); setPetPickerOpen(true); }}
              bare
            />
            <Row
              icon="pencil"
              label="Имя питомца"
              value={petName ?? '—'}
              isLast
              onPress={openPetNameModal}
              bare
            />
          </View>
        </View>

        {/* Аккаунт */}
        <Text style={styles.sectionTitle}>Аккаунт</Text>
        <View style={styles.card}>
          <Row icon="mail" label="Почта" value={email ?? '—'} isLast={false} />
          <Row
            icon="lock-closed"
            label="Пароль"
            value="Изменить пароль"
            isLast
            onPress={() => { vibrate(); navigation.navigate('ChangePassword'); }}
          />
        </View>

        {/* Школа */}
        <Text style={styles.sectionTitle}>Школа</Text>
        <View style={styles.card}>
          <Row
            icon="people"
            label="Код класса"
            value={linkedClassName ?? 'Ввести код класса'}
            isLast
            onPress={openClassCodeModal}
          />
        </View>

        {/* Оформление */}
        <Text style={styles.sectionTitle}>Оформление</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <Ionicons name="moon" size={17} color={colors.purpleGlow} />
            </View>
            <Text style={[styles.rowLabel, { flex: 1 }]} numberOfLines={1}>Тёмная тема</Text>
            <Switch
              value={mode === 'dark'}
              onValueChange={() => { vibrate(); toggleMode(); }}
              trackColor={{ false: colors.borderMuted, true: colors.purple }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Другое */}
        <Text style={styles.sectionTitle}>Другое</Text>
        <View style={styles.card}>
          <Row icon="log-out-outline" label="Выйти из аккаунта" isLast={false} onPress={handleLogout} />
          <Row icon="trash-outline" label="Удалить аккаунт" isLast danger onPress={handleDeleteAccount} />
        </View>

        <Text style={styles.version}>Версия 1.0.0</Text>
        </ScrollView>
      </View>

      {/* Name edit */}
      <Modal visible={namePickerOpen} transparent animationType="fade" onRequestClose={() => setNamePickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setNamePickerOpen(false)}>
          <Pressable style={styles.editModalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.editModalTitle}>ФИО</Text>
            <TextInput
              style={styles.editInput}
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="ФИО"
              placeholderTextColor={colors.textDim}
              autoCapitalize="words"
              maxLength={60}
              autoFocus
            />
            <Pressable style={styles.editSaveBtn} onPress={saveName}>
              <Text style={styles.editSaveBtnText}>Сохранить</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Pet type picker */}
      <Modal visible={petPickerOpen} transparent animationType="fade" onRequestClose={() => setPetPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPetPickerOpen(false)}>
          <View style={styles.modalCard}>
            {PET_TYPES.map((p) => (
              <Pressable key={p.type} style={styles.modalPetOption} onPress={() => selectPetType(p.type)}>
                <Image source={petImages[p.type]} style={styles.modalPetImage} resizeMode="cover" />
                <Text style={styles.modalOptionText}>{p.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Pet name edit */}
      <Modal visible={petNameModalOpen} transparent animationType="fade" onRequestClose={() => setPetNameModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPetNameModalOpen(false)}>
          <Pressable style={styles.editModalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.editModalTitle}>Имя питомца</Text>
            <TextInput
              style={styles.editInput}
              value={petNameDraft}
              onChangeText={setPetNameDraft}
              placeholder="Имя питомца"
              placeholderTextColor={colors.textDim}
              maxLength={20}
              autoFocus
            />
            <Pressable style={styles.editSaveBtn} onPress={savePetName}>
              <Text style={styles.editSaveBtnText}>Сохранить</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Class code edit */}
      <Modal visible={classCodeModalOpen} transparent animationType="fade" onRequestClose={() => setClassCodeModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setClassCodeModalOpen(false)}>
          <Pressable style={styles.editModalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.editModalTitle}>Код класса</Text>
            <TextInput
              style={styles.editInput}
              value={classCodeDraft}
              onChangeText={setClassCodeDraft}
              placeholder="Код класса"
              placeholderTextColor={colors.textDim}
              autoCapitalize="characters"
              autoFocus
            />
            <Pressable style={styles.editSaveBtn} onPress={saveClassCode} disabled={classCodeSaving}>
              <Text style={styles.editSaveBtnText}>{classCodeSaving ? 'Проверка…' : 'Сохранить'}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenBackground>
  );
}

function Row({
  icon,
  iconSet = 'ionicons',
  label,
  value,
  isLast,
  onPress,
  danger,
  bare,
}: {
  icon: string;
  iconSet?: 'ionicons' | 'material';
  label: string;
  value?: string;
  isLast: boolean;
  onPress?: () => void;
  danger?: boolean;
  bare?: boolean;
}) {
  const IconComp = iconSet === 'material' ? MaterialCommunityIcons : Ionicons;
  const Wrapper: any = onPress ? Pressable : View;
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Wrapper
      style={[styles.row, !isLast && styles.rowDivider, bare && styles.rowBare]}
      onPress={onPress}
    >
      <View style={[styles.rowIconWrap, danger && styles.rowIconWrapDanger]}>
        <IconComp name={icon as any} size={17} color={danger ? '#FF3B5C' : colors.purpleGlow} />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]} numberOfLines={1}>{label}</Text>
      {value ? <Text style={styles.rowValue} numberOfLines={1}>{value}</Text> : null}
      {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textDim} /> : null}
    </Wrapper>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  content: { paddingHorizontal: 16 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 18 },
  card: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    overflow: 'hidden',
  },
  petCard: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  petAvatarRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  petAvatarImage: { width: '100%', height: '100%' },
  petRows: { flex: 1, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowBare: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingVertical: 12,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(144,71,255,0.15)',
  },
  rowIconWrapDanger: { backgroundColor: 'rgba(255,59,92,0.12)' },
  rowLabel: { color: colors.text, fontSize: 14.5, fontWeight: '600' },
  rowLabelDanger: { color: '#FF3B5C' },
  rowValue: { flex: 1, color: colors.textMuted, fontSize: 13, fontWeight: '600', textAlign: 'right', marginRight: 2 },
  version: { color: colors.textDim, fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 24 },
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
  modalOptionText: { color: colors.text, fontSize: 15, fontWeight: '600', textAlign: 'center' },
  modalPetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalPetImage: { width: 40, height: 40, borderRadius: 12 },
  editModalCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  editModalTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 14, textAlign: 'center' },
  editInput: {
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  editSaveBtn: { backgroundColor: colors.purple, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  editSaveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
