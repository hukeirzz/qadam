import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Rank } from '@qadam/business-logic';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { RankBadge } from '../components/ui/RankBadge';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useAppStore } from '../store/useAppStore';

type Props = NativeStackScreenProps<RootStackParamList, 'EntranceTestResult'>;

const RANK_BLURB: Record<Rank, string> = {
  D: 'Начало пути — впереди много интересного.',
  C: 'Хорошая база, есть куда расти.',
  B: 'Уверенный уровень знаний.',
  A: 'Отличный результат!',
  S: 'Превосходно! Ты почти готов к ОРТ.',
};

export function EntranceTestResultScreen({ navigation, route }: Props) {
  const { score, total, rank } = route.params;
  const setOnboarded = useAppStore((s) => s.setOnboarded);

  const handleContinue = () => {
    setOnboarded(true);
    navigation.replace('Main');
  };

  return (
    <ScreenBackground accentColor={colors.purple}>
      <View style={styles.content}>
        <Text style={styles.title}>Твой уровень</Text>

        <View style={styles.badgeWrap}>
          <RankBadge rank={rank} size="lg" />
        </View>

        <Text style={styles.rankLetter}>{rank}-ранг</Text>
        <Text style={styles.blurb}>{RANK_BLURB[rank]}</Text>

        <View style={styles.statRow}>
          <Text style={styles.statText}>
            Правильных ответов: <Text style={styles.statValue}>{score}/{total}</Text>
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.85} onPress={handleContinue} style={styles.btnWrap}>
          <LinearGradient colors={[colors.purple, '#6B2FD4']} style={styles.btn}>
            <Text style={styles.btnText}>Перейти на главную</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 24 },
  badgeWrap: { marginBottom: 20 },
  rankLetter: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  blurb: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 24 },
  statRow: { marginBottom: 32 },
  statText: { color: colors.textMuted, fontSize: 14 },
  statValue: { color: colors.text, fontWeight: '700' },
  btnWrap: { width: '100%' },
  btn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  btnText: { color: colors.text, fontWeight: '700', fontSize: 16 },
});
