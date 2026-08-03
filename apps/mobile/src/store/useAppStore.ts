import { create } from 'zustand';
import {
  calcLevel,
  dateKey,
  getWeekStart,
  todayDayIndex,
  type Rank,
} from '@qadam/business-logic';
import type { PetType } from '@qadam/types';
import { getTopicIds } from '../data/subjects';
import { playSound } from '../services/soundService';
import { computeStars } from '../utils/stars';

export {
  xpForLevel,
  calcLevel,
  calcLevelProgress,
  xpForCurrentLevel,
  xpToReachLevel,
  getRankTitle,
  dateKey,
} from '@qadam/business-logic';

const TOTAL_STEPS = (['math', 'geometry', 'analogies', 'reading', 'grammar'] as const)
  .reduce((sum, id) => sum + getTopicIds(id).length, 0);

interface AppState {
  userId: string | null;
  userName: string;
  isAuthenticated: boolean;
  hasOnboarded: boolean;
  petName: string | null;
  petType: PetType | null;
  rank: Rank | null;
  schoolId: string | null;
  classId: string | null;
  classLabel: string | null;

  xp: number;
  gems: number;
  streak: number;
  lastActivity: string | null;
  completedTopics: string[];
  /** topicId → best hearts remaining (0–3) */
  topicHearts: Record<string, number>;
  /** Ranks the player has opened (tapped «Открыть»); D is always present. */
  unlockedRanks: Rank[];
  completedSteps: number;
  totalSteps: number;
  overallProgress: number;
  premiumUnlocked: boolean;
  dailyGoalTarget: number;
  dailyGoalCurrent: number;
  weekActivity: boolean[];
  weeklySteps: number[];
  weekStart: string | null;
  dailySteps: Record<string, number>;
  /** Remote topic IDs per subject — populated from Supabase on startup */
  remoteTopicIds: Record<string, string[]>;

  loadProfile: (profile: {
    id: string; name: string; xp: number; gems: number; streak: number;
    premium_unlocked: boolean; last_activity: string | null;
    completed_topics: string[]; weekly_steps: number[]; week_start: string | null;
    topic_hearts?: Record<string, number>;
    daily_steps?: Record<string, number>;
    pet_name?: string | null;
    rank?: Rank | null;
  }) => void;
  /**
   * Merges pet name / rank / school+class fetched separately (see
   * progressService.loadOnboardingInfo) so a failed/not-yet-applied
   * migration doesn't block the main profile load.
   */
  setOnboardingInfo: (info: {
    pet_name: string | null;
    pet_type?: PetType | null;
    rank: Rank | null;
    school_id: string | null;
    class_id: string | null;
    class_label?: string | null;
  }) => void;

  /** xpReward already accounts for accuracy + hearts (+ differential for replays) */
  completeQuiz: (
    topicId: string,
    correctCount: number,
    total: number,
    xpReward: number,
    livesRemaining: number,
  ) => void;
  /** Spend 200 gems to unlock premium. Returns true if successful. */
  unlockPremiumWithGems: () => boolean;
  /** Load opened ranks from local storage (call once at startup). */
  hydrateUnlocks: () => void;
  /** Mark a rank as opened after the «Открыть» celebration, and persist it. */
  openRank: (rank: Rank) => void;
  /**
   * Awards XP outside the completeQuiz flow (e.g. Практика retries) — just
   * XP + level-up sound, no streak/topic/heart bookkeeping.
   */
  addXp: (amount: number) => void;
  /**
   * Push real per-subject topic IDs from Supabase into the store.
   * Also recalculates totalSteps and overallProgress automatically.
   */
  setRemoteTopics: (subjectTopicIds: Record<string, string[]>) => void;
  setOnboarded: (v: boolean) => void;
  setAuthenticated: (v: boolean) => void;
  setPremium: (v: boolean) => void;
  /** Renames the student and persists it to `students.name`. */
  setUserName: (name: string) => void;
  logout: () => void;
}

const FRESH: Omit<AppState,
  'loadProfile' | 'setOnboardingInfo' | 'completeQuiz' | 'unlockPremiumWithGems' | 'hydrateUnlocks' | 'openRank' | 'addXp' | 'setRemoteTopics' | 'setOnboarded' | 'setAuthenticated' | 'setPremium' | 'setUserName' | 'logout'
> = {
  userId: null, userName: '', isAuthenticated: false, hasOnboarded: false,
  petName: null, petType: null, rank: null, schoolId: null, classId: null, classLabel: null,
  xp: 0, gems: 0, streak: 0, lastActivity: null,
  completedTopics: [], topicHearts: {}, unlockedRanks: ['D'],
  completedSteps: 0, totalSteps: TOTAL_STEPS, overallProgress: 0,
  premiumUnlocked: false, dailyGoalTarget: 5, dailyGoalCurrent: 0,
  weekActivity: Array(7).fill(false),
  weeklySteps: Array(7).fill(0),
  weekStart: null,
  dailySteps: {},
  remoteTopicIds: {},
};

export const useAppStore = create<AppState>((set, get) => ({
  ...FRESH,

  setOnboarded: (v) => set({ hasOnboarded: v }),
  setAuthenticated: (v) => set({ isAuthenticated: v }),
  setPremium: (v) => set({ premiumUnlocked: v }),
  setUserName: (name) => {
    set({ userName: name });
    const s = get();
    if (s.userId) {
      import('../services/progressService').then((m) =>
        m.saveProfileProgress(s.userId!, { name })
      ).catch(console.warn);
    }
  },
  setOnboardingInfo: (info) => set((s) => ({
    petName: info.pet_name, petType: info.pet_type ?? null, rank: info.rank,
    schoolId: info.school_id, classId: info.class_id,
    classLabel: info.class_label !== undefined ? info.class_label : s.classLabel,
  })),

  setRemoteTopics: (subjectTopicIds) => set((s) => {
    const totalSteps = Object.values(subjectTopicIds).reduce((sum, ids) => sum + ids.length, 0);
    const total = totalSteps > 0 ? totalSteps : s.totalSteps;
    return {
      remoteTopicIds: subjectTopicIds,
      totalSteps: total,
      overallProgress: total > 0 ? Math.round((s.completedSteps / total) * 100) : 0,
    };
  }),

  loadProfile: (p) => {
    const completedTopics = p.completed_topics ?? [];
    const completedSteps = completedTopics.length;
    const overallProgress = Math.round((completedSteps / TOTAL_STEPS) * 100);

    const currentWeekStart = getWeekStart();
    let weeklySteps = p.weekly_steps ?? Array(7).fill(0);
    if (p.week_start && p.week_start !== currentWeekStart) {
      weeklySteps = Array(7).fill(0);
    }

    const dayIdx = todayDayIndex();
    const weekActivity = Array(7).fill(false);
    weekActivity[dayIdx] = weeklySteps[dayIdx] > 0;

    set({
      userId: p.id, userName: p.name, isAuthenticated: true,
      petName: p.pet_name ?? null, rank: p.rank ?? null,
      xp: p.xp, gems: p.gems, streak: p.streak,
      lastActivity: p.last_activity, premiumUnlocked: p.premium_unlocked,
      completedTopics, completedSteps, totalSteps: TOTAL_STEPS, overallProgress,
      topicHearts: p.topic_hearts ?? {},
      dailySteps: p.daily_steps ?? {},
      weeklySteps, weekStart: currentWeekStart, weekActivity,
      dailyGoalCurrent: weeklySteps[dayIdx] ?? 0,
    });
    get().hydrateUnlocks();
  },

  completeQuiz: (topicId, correctCount, total, xpReward, livesRemaining) => {
    const s = get();
    const alreadyDone = s.completedTopics.includes(topicId);
    const prevHearts = s.topicHearts[topicId] ?? 0;
    // Star rating now reflects how much of the topic was solved (1/3 → 1★,
    // 2/3 → 2★, all or ≤2 mistakes → 3★) rather than lives left. `void`s the
    // now-unused livesRemaining so the signature stays compatible with callers.
    void livesRemaining;
    const newBestHearts = Math.max(prevHearts, computeStars(correctCount, total));

    // xpReward is already the correct differential amount (calculated in QuizScreen)
    const earnedXp = Math.max(0, xpReward);
    // Gems are NOT earned from quizzes — only via referrals (admin-granted in Supabase)

    // Streak
    const today = dateKey();
    const yesterday = dateKey(new Date(Date.now() - 86_400_000));
    let newStreak = s.streak;
    if (s.lastActivity !== today) {
      newStreak = s.lastActivity === yesterday ? s.streak + 1 : 1;
    }

    // Weekly steps
    const currentWeekStart = getWeekStart();
    let weeklySteps = [...s.weeklySteps];
    if (s.weekStart && s.weekStart !== currentWeekStart) {
      weeklySteps = Array(7).fill(0);
    }
    const dayIdx = todayDayIndex();
    weeklySteps[dayIdx] = (weeklySteps[dayIdx] ?? 0) + 1;

    const newCompletedTopics = alreadyDone
      ? s.completedTopics
      : [...s.completedTopics, topicId];
    const completedSteps = newCompletedTopics.length;
    const overallProgress = Math.round((completedSteps / TOTAL_STEPS) * 100);

    const weekActivity = [...s.weekActivity];
    weekActivity[dayIdx] = true;

    const newTopicHearts = { ...s.topicHearts, [topicId]: newBestHearts };
    const newXp = s.xp + earnedXp;

    // Звуки достижений — с задержкой, чтобы не накладываться на звук результата
    if (newStreak > s.streak) {
      setTimeout(() => playSound('streak'), 900);
    }
    if (calcLevel(newXp) > calcLevel(s.xp)) {
      setTimeout(() => playSound('level_up'), 1800);
    }

    // Daily steps
    const newDailySteps = { ...s.dailySteps, [today]: (s.dailySteps[today] ?? 0) + 1 };

    set({
      xp: newXp, streak: newStreak,
      lastActivity: today, completedTopics: newCompletedTopics,
      topicHearts: newTopicHearts,
      dailySteps: newDailySteps,
      completedSteps, overallProgress, weeklySteps,
      weekStart: currentWeekStart, weekActivity,
      dailyGoalCurrent: weeklySteps[dayIdx],
    });

    if (s.userId) {
      import('../services/progressService').then((m) =>
        m.saveProfileProgress(s.userId!, {
          xp: newXp,
          streak: newStreak, last_activity: today,
          completed_topics: newCompletedTopics,
          weekly_steps: weeklySteps,
          week_start: currentWeekStart,
          topic_hearts: newTopicHearts,
          daily_steps: newDailySteps,
        })
      ).catch(console.warn);
    }
  },

  unlockPremiumWithGems: () => {
    const s = get();
    if (s.gems < 200) return false;
    const newGems = s.gems - 200;
    set({ gems: newGems, premiumUnlocked: true });
    playSound('unlock');
    if (s.userId) {
      import('../services/progressService').then((m) =>
        m.saveProfileProgress(s.userId!, { gems: newGems, premium_unlocked: true })
      ).catch(console.warn);
    }
    return true;
  },

  hydrateUnlocks: () => {
    import('../utils/unlockStorage').then((m) =>
      m.loadUnlockedRanks().then((ranks) => set({ unlockedRanks: ranks }))
    ).catch(() => {});
  },

  openRank: (rank) => {
    const s = get();
    if (s.unlockedRanks.includes(rank)) return;
    const next = [...s.unlockedRanks, rank];
    set({ unlockedRanks: next });
    playSound('unlock');
    import('../utils/unlockStorage').then((m) => m.saveUnlockedRanks(next)).catch(() => {});
  },

  addXp: (amount) => {
    if (amount <= 0) return;
    const s = get();
    const newXp = s.xp + amount;
    if (calcLevel(newXp) > calcLevel(s.xp)) {
      setTimeout(() => playSound('level_up'), 300);
    }
    set({ xp: newXp });
    if (s.userId) {
      import('../services/progressService').then((m) =>
        m.saveProfileProgress(s.userId!, { xp: newXp })
      ).catch(console.warn);
    }
  },

  logout: () => {
    set({ ...FRESH });
  },
}));
