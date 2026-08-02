import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../../store/useAppStore';
import { HomeStackParamList, MainTabParamList } from '../../types/navigation';
import { vibrate } from '../../services/soundService';
import { useTheme } from '../../theme/ThemeContext';
import { CardTheme, ColorPalette } from '../../theme/colors';
import { petImages } from '../../assets/petImages';

export function HeaderBar() {
  const streak = useAppStore((s) => s.streak);
  const gems = useAppStore((s) => s.gems);
  const userName = useAppStore((s) => s.userName);
  const petType = useAppStore((s) => s.petType);
  const nav = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { colors, cardTheme, glow } = useTheme();
  const styles = useMemo(() => createStyles(colors, cardTheme), [colors, cardTheme]);

  const initial = userName ? userName.charAt(0).toUpperCase() : '?';

  const openPremium = () => {
    vibrate();
    // Не во всех стеках есть экран Premium (например, во вкладке Практика) —
    // тогда открываем его через стек профиля.
    if (nav.getState()?.routeNames?.includes('Premium')) {
      nav.navigate('Premium');
    } else {
      (tabNav as any).navigate('ProfileTab', { screen: 'Premium' });
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.chip, { shadowColor: glow.gold }]}>
        <MaterialCommunityIcons name="fire" size={20} color="#FFA75E" />
        <Text style={styles.chipText}>{streak}</Text>
      </View>

      <View style={styles.right}>
        <Pressable
          style={[styles.chip, { shadowColor: glow.cyan }]}
          onPress={openPremium}
          hitSlop={8}
        >
          <Ionicons name="diamond" size={16} color="#63B4FF" />
          <Text style={styles.chipText}>{gems}</Text>
        </Pressable>

        <Pressable
          style={[styles.avatarShadow, { shadowColor: glow.purple }]}
          onPress={() => { vibrate(); tabNav.navigate('ProfileTab'); }}
          hitSlop={8}
        >
          <View style={styles.avatarRing}>
            {petType ? (
              <Image source={petImages[petType]} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorPalette, cardTheme: CardTheme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: cardTheme.fill,
    borderWidth: 1,
    borderColor: cardTheme.borderSoft,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  chipText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarShadow: {
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderRadius: 21,
  },
  avatarRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: colors.purple,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    borderRadius: 19,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
});
