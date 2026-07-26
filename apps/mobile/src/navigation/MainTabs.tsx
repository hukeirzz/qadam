import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeStack } from './HomeStack';
import { ExerciseStack } from './ExerciseStack';
import { PracticeScreen } from '../screens/PracticeScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { ProfileStack } from './ProfileStack';
import { MainTabParamList } from '../types/navigation';
import { colors, glow } from '../theme/colors';
import { vibrate } from '../services/soundService';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  ChatTab: { active: 'chatbubbles', inactive: 'chatbubbles-outline' },
  StatsTab: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  PathTab: { active: 'home', inactive: 'home-outline' },
  ExerciseTab: { active: 'book', inactive: 'book-outline' },
  ProfileTab: { active: 'person', inactive: 'person-outline' },
};

const TAB_LABELS: Record<string, string> = {
  ChatTab: 'Общение',
  StatsTab: 'Статистика',
  PathTab: 'Главная',
  ExerciseTab: 'Практика',
  ProfileTab: 'Профиль',
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={[styles.tabBarShadow, { shadowColor: glow.purple }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const icons = TAB_ICONS[route.name];

          const onPress = () => {
            vibrate();
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable key={route.key} style={styles.tabItem} onPress={onPress}>
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Ionicons
                  name={focused ? icons.active : icons.inactive}
                  size={focused ? 24 : 23}
                  color={focused ? colors.purpleGlow : colors.tabInactive}
                />
              </View>
              <Text
                style={[styles.label, focused ? styles.labelActive : styles.labelInactive]}
                numberOfLines={1}
              >
                {TAB_LABELS[route.name]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="PathTab"
      backBehavior="initialRoute"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="ChatTab" component={PracticeScreen} options={{ title: 'Общение' }} />
      <Tab.Screen name="StatsTab" component={StatsScreen} options={{ title: 'Статистика' }} />
      <Tab.Screen
        name="PathTab"
        component={HomeStack}
        options={{ title: 'Главная', popToTopOnBlur: true }}
      />
      <Tab.Screen
        name="ExerciseTab"
        component={ExerciseStack}
        options={{ title: 'Практика', popToTopOnBlur: true }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ title: 'Профиль', popToTopOnBlur: true }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarShadow: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 18,
    height: 82,
    borderRadius: 30,
    elevation: 14,
    shadowOpacity: 0.55,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#130B35',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(180, 144, 255, 0.2)',
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 3,
    paddingBottom: 8,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(180, 144, 255, 0.16)',
  },
  label: {
    fontSize: 11.5,
    textAlign: 'center',
    letterSpacing: -0.2,
    marginTop: -2,
  },
  labelActive: {
    fontWeight: '700',
    color: colors.purpleGlow,
  },
  labelInactive: {
    fontWeight: '600',
    color: colors.tabInactive,
  },
});
