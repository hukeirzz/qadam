import { profile } from '../lib/supabase';
import type { UserProfile } from '@qadam/api-client';

export type { UserProfile };

export const loadUserProfile = profile.load;
export const saveProfileProgress = profile.save;
