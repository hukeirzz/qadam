import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApiClient } from '@qadam/api-client';

// Set in apps/mobile/.env (see .env.example) — Supabase Dashboard → Settings → API
const apiClient = createApiClient({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  storage: AsyncStorage,
});

export const { supabase, auth, profile, theory, topics, questions, schools, entranceTest, schoolTests } = apiClient;
