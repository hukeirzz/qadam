import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '../components/ui/ScreenBackground';
import { ProfileStackParamList } from '../navigation/ProfileStack';
import { useAppStore, calcLevel, getRankTitle, xpToReachLevel } from '../store/useAppStore';
import { signOut, deleteAccount } from '../services/authService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { vibrate } from '../services/soundService';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

const menu: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: keyof ProfileStackParamList;
  color?: string;
}[] = [
  { label: 'Premium', icon: 'diamond', screen: 'Premium', color: colors.purpleGlow },
  { label: 'Изменить пароль', icon: 'key', screen: 'ChangePassword' },
];

export function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const userName = useAppStore((s) => s.userName);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const gems = useAppStore((s) => s.gems);
  const logout = useAppStore((s) => s.logout);

  const handleLogout = () => {
    vibrate();
    // signOut triggers onAuthStateChange(SIGNED_OUT) → RootNavigator navigates then clears store
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
            }
            // при успехе deleteAccount разлогинит → RootNavigator уведёт на Splash
          },
        },
      ],
    );
  };

  const level = calcLevel(xp);
  const rankTitle = getRankTitle(xp);

  // График показывает ОБЩИЙ накопленный XP и порог следующего уровня.
  const nextLevelTotal = xpToReachLevel(level + 1);
  const xpPct = nextLevelTotal > 0 ? (xp / nextLevelTotal) * 100 : 0;
  const xpToNext = Math.max(0, nextLevelTotal - xp);

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* Avatar */}
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
          </View>
        </View>

        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.rank}>{rankTitle}</Text>

        {/* Level + XP badge */}
        <View style={styles.levelRow}>
          <LinearGradient
            colors={[colors.purple, '#5B2ED4']}
            style={styles.levelBadge}
          >
            <Text style={styles.levelText}>Уровень {level}</Text>
          </LinearGradient>
          <Text style={styles.xpText}>
            {xp}/{nextLevelTotal} XP
          </Text>
        </View>

        {/* XP progress bar */}
        <View style={styles.xpTrack}>
          <LinearGradient
            colors={[colors.purple, colors.purpleGlow]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.xpFill, { width: `${xpPct}%` }]}
          />
        </View>
        <Text style={styles.xpHint}>
          До {level + 1} уровня осталось {xpToNext} XP
        </Text>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{streak}</Text>
            <Text style={styles.statLbl}>🔥 Дней</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{gems}</Text>
            <Text style={styles.statLbl}>💎 Кристаллы</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{xp}</Text>
            <Text style={styles.statLbl}>⭐ XP</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {menu.map((item) => (
            <Pressable
              key={item.screen}
              style={styles.row}
              onPress={() => { vibrate(); navigation.navigate(item.screen); }}
            >
              <View style={[styles.iconBg, item.color ? { backgroundColor: `${item.color}22` } : undefined]}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={item.color ?? colors.textMuted}
                />
              </View>
              <Text style={styles.rowText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
            </Pressable>
          ))}

          {/* Logout */}
          <Pressable style={styles.row} onPress={handleLogout}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(255,59,92,0.12)' }]}>
              <Ionicons name="log-out-outline" size={20} color="#FF3B5C" />
            </View>
            <Text style={[styles.rowText, { color: '#FF3B5C' }]}>Выйти</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
          </Pressable>

          {/* Delete account */}
          <Pressable style={styles.row} onPress={handleDeleteAccount}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(255,59,92,0.12)' }]}>
              <Ionicons name="trash-outline" size={20} color="#FF3B5C" />
            </View>
            <Text style={[styles.rowText, { color: '#FF3B5C' }]}>Удалить аккаунт</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
          </Pressable>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.purple,
  },
  avatar: {
    flex: 1,
    borderRadius: 44,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.text, fontSize: 34, fontWeight: '800' },
  name: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 14,
  },
  rank: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 14,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  levelBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  xpText: {
    color: colors.purpleGlow,
    fontSize: 14,
    fontWeight: '700',
  },
  xpTrack: {
    width: '82%',
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 6,
  },
  xpFill: {
    height: '100%',
    borderRadius: 6,
  },
  xpHint: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceGlass,
    borderRadius: 20,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  statLbl: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  menu: {
    width: '100%',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surfaceGlass,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  rowText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
