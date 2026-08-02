import { useAppStore } from '../store/useAppStore';
import { loadUserProfile, saveOnboarding, saveProfileProgress } from './progressService';
import { findClassByCode } from './schoolsService';

/**
 * Runs once a fresh signup gets a live session — whether that happens
 * immediately (email confirmation off) or later (confirmed via
 * ConfirmEmailScreen, in-app code instead of the email link). Loads the
 * profile into the store, resolves the class code into a school/class
 * link, and unlocks premium for partner-school students.
 */
export async function completeRegistration(
  userId: string,
  fullName: string,
  classCode: string,
  dataConsent: boolean,
) {
  const { loadProfile, setOnboardingInfo, setPremium } = useAppStore.getState();

  const profile = await loadUserProfile(userId);
  loadProfile(
    profile ?? {
      id: userId, name: fullName,
      xp: 0, gems: 0, streak: 0,
      premium_unlocked: false, last_activity: null,
      completed_topics: [], weekly_steps: [0, 0, 0, 0, 0, 0, 0], week_start: null,
    },
  );

  // Код класса необязателен — если введён, но не найден, просто не
  // привязываем. Содержит свой school_id, так что заодно привязывает и школу.
  const studentClass = classCode.trim() ? await findClassByCode(classCode.trim()) : null;
  const resolvedSchoolId = studentClass?.school_id ?? null;

  await saveOnboarding(userId, {
    school_id: resolvedSchoolId,
    class_id: studentClass?.id ?? null,
    data_consent: dataConsent,
  });
  setOnboardingInfo({
    pet_name: null, rank: null, school_id: resolvedSchoolId, class_id: studentClass?.id ?? null,
  });

  // Партнёрская школа — все ранги и премиум-контент открываются автоматически.
  if (resolvedSchoolId) {
    setPremium(true);
    await saveProfileProgress(userId, { premium_unlocked: true });
  }
}
