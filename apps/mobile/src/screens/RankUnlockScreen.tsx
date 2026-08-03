import { useEffect, useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text } from '../components/ui/Text';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { RoundedStar } from '../components/ui/RoundedStar';
import { useTheme } from '../theme/ThemeContext';
import { ColorPalette } from '../theme/colors';
import { ExerciseStackParamList } from '../types/navigation';
import { useAppStore } from '../store/useAppStore';
import { happyPetImages } from '../assets/happyPetImages';
import { playSound } from '../services/soundService';

type Props = NativeStackScreenProps<ExerciseStackParamList, 'RankUnlock'>;

export function RankUnlockScreen({ route, navigation }: Props) {
  const { rank } = route.params;
  const insets = useSafeAreaInsets();
  const openRank = useAppStore((s) => s.openRank);
  const petType = useAppStore((s) => s.petType);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    openRank(rank);
    playSound('unlock');
  }, [rank]);

  return (
    <ScreenBackground accentColor={colors.purple}>
      <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.starsRow}>
          {[0, 1, 2].map((i) => (
            <RoundedStar key={i} size={28} color={colors.gold} />
          ))}
        </View>

        <Image source={happyPetImages[petType ?? 'bars']} style={styles.pet} resizeMode="contain" />

        <Text style={styles.title}>Поздравляем!</Text>
        <View style={styles.rankBadge}>
          <Text style={styles.rankBadgeText}>Открыт ранг {rank}</Text>
        </View>
        <Text style={styles.subtitle}>Новые острова и темы уже ждут тебя. Вперёд к новым баллам!</Text>

        <Pressable style={styles.btnWrap} onPress={() => navigation.goBack()}>
          <LinearGradient
            colors={[colors.purple, colors.purpleGlow]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>Продолжить</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScreenBackground>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
    starsRow: { flexDirection: 'row', gap: 8 },
    pet: { width: 180, height: 180 },
    title: { color: colors.text, fontSize: 30, fontWeight: '800', textAlign: 'center' },
    rankBadge: { backgroundColor: colors.gold, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 8 },
    rankBadgeText: { color: '#3B2A00', fontSize: 18, fontWeight: '800' },
    subtitle: { color: colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
    btnWrap: { width: '100%', marginTop: 8 },
    btn: { borderRadius: 18, paddingVertical: 16, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  });
}
