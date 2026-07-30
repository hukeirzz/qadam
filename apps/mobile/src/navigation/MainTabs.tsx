import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui/Text';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { HomeStack } from './HomeStack';
import { ExerciseStack } from './ExerciseStack';
import { PracticeScreen } from '../screens/PracticeScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { ProfileStack } from './ProfileStack';
import { MainTabParamList } from '../types/navigation';
import { colors, glow } from '../theme/colors';
import { vibrate } from '../services/soundService';
import { useAppStore } from '../store/useAppStore';
import { petImages } from '../assets/petImages';

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

// Экраны с собственной панелью действий внизу (варианты ответа, кнопка
// «Далее», полноэкранные результаты) — плавающий navbar на них скрываем,
// иначе он перекрывает нижнюю часть контента (последний вариант ответа,
// кнопку завершения).
const HIDDEN_TABBAR_ROUTES: Record<string, string[]> = {
  PathTab: ['Quiz', 'CorrectAnswer'],
  ExerciseTab: ['PracticeQuiz', 'SchoolTestQuiz'],
};

function CustomTabBar({ state, navigation, descriptors }: BottomTabBarProps) {
  const petType = useAppStore((s) => s.petType);
  const focusedRoute = state.routes[state.index];
  const focusedOptions = descriptors[focusedRoute.key].options;
  if ((focusedOptions.tabBarStyle as { display?: string } | undefined)?.display === 'none') {
    return null;
  }

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

          const isProfileTab = route.name === 'ProfileTab';

          return (
            <Pressable key={route.key} style={styles.tabItem} onPress={onPress}>
              <View style={styles.iconWrap}>
                {isProfileTab && petType ? (
                  <View style={[styles.tabAvatarRing, focused && styles.tabAvatarRingFocused]}>
                    <Image source={petImages[petType]} style={styles.tabAvatarImage} resizeMode="cover" />
                  </View>
                ) : (
                  <Ionicons
                    name={focused ? icons.active : icons.inactive}
                    size={focused ? 24 : 23}
                    color={focused ? colors.purpleGlow : colors.tabInactive}
                  />
                )}
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
        options={({ route }) => ({
          title: 'Главная',
          popToTopOnBlur: true,
          tabBarStyle: HIDDEN_TABBAR_ROUTES.PathTab.includes(getFocusedRouteNameFromRoute(route) ?? '')
            ? { display: 'none' }
            : undefined,
        })}
      />
      <Tab.Screen
        name="ExerciseTab"
        component={ExerciseStack}
        options={({ route }) => ({
          title: 'Практика',
          popToTopOnBlur: true,
          tabBarStyle: HIDDEN_TABBAR_ROUTES.ExerciseTab.includes(getFocusedRouteNameFromRoute(route) ?? '')
            ? { display: 'none' }
            : undefined,
        })}
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
    backgroundColor: colors.tabBar,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
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
  tabAvatarRing: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.tabInactive,
    overflow: 'hidden',
  },
  tabAvatarRingFocused: {
    borderColor: colors.purpleGlow,
  },
  tabAvatarImage: {
    width: '100%',
    height: '100%',
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
