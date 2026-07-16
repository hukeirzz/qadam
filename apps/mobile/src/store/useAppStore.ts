import { create } from 'zustand';
import { getTopicIds } from '../data/subjects';
import { playSound } from '../services/soundService';

// Прогрессивный порог: уровни требуют всё больше XP.
// XP, нужный чтобы перейти С уровня `level` НА следующий:
//   ур.1→2 = 100, 2→3 = 150, 3→4 = 250, 4→5 = 400, 5→6 = 600 ...
//   формула: 100 + 25 * level * (level - 1)
export function xpForLevel(level: number): number {
  return 100 + 25 * level * (level - 1);
}

/** Текущий уровень по суммарному XP (начинается с 1). */
export function calcLevel(xp: number): number {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return level;
}

/** XP, набранный внутри текущего уровня. */
export function calcLevelProgress(xp: number): number {
  let remaining = xp;
  let level = 1;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return remaining;
}

/** Сколько XP нужно на текущий уровень целиком. */
export function xpForCurrentLevel(xp: number): number {
  return xpForLevel(calcLevel(xp));
}

/** Суммарный XP, необходимый чтобы ДОСТИЧЬ уровня `level` (ур.1 = 0). */
export function xpToReachLevel(level: number): number {
  let total = 0;
  for (let k = 1; k < level; k++) total += xpForLevel(k);
  return total;
}

// Статус зависит напрямую от XP — пороги, а не от уровня, чтобы статус
// менялся заметно по мере роста XP. Берём самый высокий порог ≤ xp.
const RANKS: { xp: number; title: string }[] = [
  { xp: 0,    title: 'Новичок' },
  { xp: 200,  title: 'Ученик' },
  { xp: 500,  title: 'Начинающий исследователь' },
  { xp: 1000, title: 'Искатель' },
  { xp: 2000, title: 'Знаток' },
  { xp: 3500, title: 'Эрудит' },
  { xp: 5500, title: 'Мастер' },
  { xp: 8000, title: 'Эксперт ОРТ' },
  { xp: 12000, title: 'Гуру ОРТ' },
];

export function getRankTitle(xp: number) {
  let title = RANKS[0].title;
  for (const rank of RANKS) {
    if (xp >= rank.xp) title = rank.title;
    else break;
  }
  return title;
}

/** Локальная дата в формате YYYY-MM-DD (без сдвига по UTC) */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Понедельник текущей недели в формате YYYY-MM-DD */
function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
  return dateKey(mon);
}

/** Индекс дня недели: 0=Пн … 6=Вс */
function todayDayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

const TOTAL_STEPS = (['math', 'geometry', 'analogies', 'reading', 'grammar'] as const)
  .reduce((sum, id) => sum + getTopicIds(id).length, 0);

interface AppState {
  userId: string | null;
  userName: string;
  isAuthenticated: boolean;
  hasOnboarded: boolean;

  xp: number;
  gems: number;
  streak: number;
  lastActivity: string | null;
  completedTopics: string[];
  /** topicId → best hearts remaining (0–3) */
  topicHearts: Record<string, number>;
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
  /**
   * Push real per-subject topic IDs from Supabase into the store.
   * Also recalculates totalSteps and overallProgress automatically.
   */
  setRemoteTopics: (subjectTopicIds: Record<string, string[]>) => void;
  setOnboarded: (v: boolean) => void;
  setAuthenticated: (v: boolean) => void;
  setPremium: (v: boolean) => void;
  logout: () => void;
}

const FRESH: Omit<AppState,
  'loadProfile' | 'completeQuiz' | 'unlockPremiumWithGems' | 'setRemoteTopics' | 'setOnboarded' | 'setAuthenticated' | 'setPremium' | 'logout'
> = {
  userId: null, userName: '', isAuthenticated: false, hasOnboarded: false,
  xp: 0, gems: 0, streak: 0, lastActivity: null,
  completedTopics: [], topicHearts: {},
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
      xp: p.xp, gems: p.gems, streak: p.streak,
      lastActivity: p.last_activity, premiumUnlocked: p.premium_unlocked,
      completedTopics, completedSteps, totalSteps: TOTAL_STEPS, overallProgress,
      topicHearts: p.topic_hearts ?? {},
      dailySteps: p.daily_steps ?? {},
      weeklySteps, weekStart: currentWeekStart, weekActivity,
      dailyGoalCurrent: weeklySteps[dayIdx] ?? 0,
    });
  },

  completeQuiz: (topicId, correctCount, total, xpReward, livesRemaining) => {
    const s = get();
    const alreadyDone = s.completedTopics.includes(topicId);
    const prevHearts = s.topicHearts[topicId] ?? 0;
    const newBestHearts = Math.max(prevHearts, livesRemaining);

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

  logout: () => {
    set({ ...FRESH });
  },
}));
