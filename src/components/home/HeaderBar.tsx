import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAppStore } from '../../store/useAppStore';
import { HomeStackParamList, MainTabParamList } from '../../types/navigation';
import { vibrate } from '../../services/soundService';

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
      <View style={styles.streak}>
        <MaterialCommunityIcons name="fire" size={22} color="#FF8C3B" />
        <Text style={styles.streakText}>{streak}</Text>
      </View>

      <View style={styles.right}>
        <Pressable
          style={styles.balance}
          onPress={openPremium}
          hitSlop={8}
        >
          <Ionicons name="diamond" size={18} color="#5B9DFF" />
          <Text style={styles.balanceText}>{gems}</Text>
        </Pressable>

        <Pressable
          style={styles.avatarRing}
          onPress={() => { vibrate(); tabNav.navigate('ProfileTab'); }}
          hitSlop={8}
        >
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
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
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#A855F7',
    padding: 2,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#5B21B6',
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
