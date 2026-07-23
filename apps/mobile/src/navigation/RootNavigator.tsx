import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer, DarkTheme, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import * as Linking from 'expo-linking';
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { PetNameScreen } from '../screens/PetNameScreen';
import { EntranceTestScreen } from '../screens/EntranceTestScreen';
import { EntranceTestResultScreen } from '../screens/EntranceTestResultScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { MainTabs } from './MainTabs';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { loadUserProfile, loadPetAndRank } from '../services/progressService';
import { loadAllTopicsToCache, getCachedSubjectTopicIds } from '../services/topicsService';
import { useAppStore } from '../store/useAppStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Разбирает токены из deep-link (фрагмент #... и/или query ?...). */
function parseAuthParams(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  const hash = url.includes('#') ? url.split('#')[1] : '';
  const query = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
  [hash, query]
    .filter(Boolean)
    .join('&')
    .split('&')
    .forEach((pair) => {
      const [k, v] = pair.split('=');
      if (k) out[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
    });
  return out;
}

/** Если url — ссылка восстановления пароля, ставит recovery-сессию. true = это recovery. */
async function applyRecoveryLink(url: string | null): Promise<boolean> {
  if (!url) return false;
  const p = parseAuthParams(url);
  if (p.type === 'recovery' && p.access_token && p.refresh_token) {
    await supabase.auth.setSession({
      access_token: p.access_token,
      refresh_token: p.refresh_token,
    });
    return true;
  }
  return false;
}

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    primary: colors.purple,
  },
};

export function RootNavigator() {
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList>('Splash');
  const [checking, setChecking] = useState(true);
  const loadProfile = useAppStore((s) => s.loadProfile);
  const setRemoteTopics = useAppStore((s) => s.setRemoteTopics);
  const setPetAndRank = useAppStore((s) => s.setPetAndRank);
  const logout = useAppStore((s) => s.logout);
  const navRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    // Проверяем существующую сессию при старте
    supabase.auth.getSession().then(async ({ data }) => {
      // Холодный старт по ссылке сброса пароля → экран «Новый пароль».
      const initialUrl = await Linking.getInitialURL();
      if (await applyRecoveryLink(initialUrl)) {
        setInitialRoute('ResetPassword');
        setChecking(false);
        return;
      }

      const session = data.session;
      if (session?.user) {
        const profile = await loadUserProfile(session.user.id);
        loadProfile(
          profile ?? {
            id: session.user.id,
            name: session.user.user_metadata?.name ?? session.user.email?.split('@')[0] ?? 'Игрок',
            xp: 0, gems: 0, streak: 0,
            premium_unlocked: false,
            last_activity: null,
            completed_topics: [],
            weekly_steps: [0,0,0,0,0,0,0],
            week_start: null,
          },
        );
        // Warm the topics cache and push real per-subject IDs into the store
        loadAllTopicsToCache().then(() => {
          const ids = getCachedSubjectTopicIds();
          if (Object.keys(ids).length > 0) setRemoteTopics(ids);
        });
        // Best-effort — pet/rank columns may not exist yet if the migration
        // hasn't been applied live; a failure here shouldn't block startup.
        // Returning sessions always land on Main regardless of rank — the
        // onboarding stack (Register→PetName→EntranceTest) only runs for
        // a freshly-completed registration in this same app session.
        loadPetAndRank(session.user.id).then((pr) => {
          if (pr) setPetAndRank(pr.pet_name, pr.rank);
        }).catch(() => {});
        setInitialRoute('Main');
      } else {
        setInitialRoute('Splash');
      }
      setChecking(false);
    });

    // Ссылка сброса, когда приложение уже открыто.
    const linkSub = Linking.addEventListener('url', async ({ url }) => {
      if (await applyRecoveryLink(url)) {
        navRef.current?.navigate('ResetPassword');
      }
    });

    // Слушаем изменения авторизации
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Navigate first — then clear store so screens don't flash empty state
        navRef.current?.reset({ index: 0, routes: [{ name: 'Splash' }] });
        setTimeout(() => logout(), 400);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
      linkSub.remove();
    };
  }, []);

  if (checking) {
    // Пустой фон во время проверки сессии (без экрана «Обновление…»).
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <NavigationContainer theme={navTheme} ref={navRef}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="PetName" component={PetNameScreen} />
        <Stack.Screen name="EntranceTest" component={EntranceTestScreen} />
        <Stack.Screen name="EntranceTestResult" component={EntranceTestResultScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
