import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../../store/useAppStore';
import { HomeStackParamList, MainTabParamList } from '../../types/navigation';
import { vibrate } from '../../services/soundService';
import { cardTheme, glow } from '../../theme/colors';

export function HeaderBar() {
  const streak = useAppStore((s) => s.streak);
  const gems = useAppStore((s) => s.gems);
  const userName = useAppStore((s) => s.userName);
  const nav = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const tabNav = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

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
          <LinearGradient
            colors={['#B490FF', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarRing}
          >
            <View style={styles.avatarInner}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: '#FFFFFF',
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
    padding: 2.5,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 17,
    backgroundColor: '#2A1866',
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
