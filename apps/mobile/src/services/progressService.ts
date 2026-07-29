import { profile } from '../lib/supabase';
import type { UserProfile } from '@qadam/api-client';

export type { UserProfile };

export const loadUserProfile = profile.load;
export const saveProfileProgress = profile.save;
export const loadOnboardingInfo = profile.onboardingInfo;
export const saveOnboarding = profile.saveOnboarding;
export const loadAverageMockScore = profile.averageMockScore;
export const recordTopicStat = profile.recordTopicStat;
