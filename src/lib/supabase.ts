import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Заполни своими данными из Supabase Dashboard → Settings → API
const SUPABASE_URL = 'https://uogzxfkoqyshkyzlzolb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oK1yUA7O6kIN_4kxh778XA_oMjudilC';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          name: string;
          streak: number;
          gems: number;
          xp: number;
          premium_unlocked: boolean;
          last_activity: string | null;
        };
      };
      questions: {
        Row: {
          id: string;
          topic_id: string;
          subject_id: string;
          text: string;
          explanation: string | null;
          xp_reward: number;
        };
      };
      options: {
        Row: {
          id: string;
          question_id: string;
          text: string;
          is_correct: boolean;
        };
      };
      topics: {
        Row: {
          id: string;
          subject_id: string;
          title: string;
          order_num: number;
          xp_reward: number;
        };
      };
      user_topic_progress: {
        Row: {
          user_id: string;
          topic_id: string;
          completed_at: string;
        };
      };
    };
  };
};
