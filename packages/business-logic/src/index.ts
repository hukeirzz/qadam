// Pure, platform-agnostic rank/XP/streak logic shared by apps/mobile and
// apps/school-web, so a student's progress can never diverge between the
// two products. Relocated as-is from apps/mobile/src/store/useAppStore.ts —
// no behavior change.

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

/** XP, нужный на текущий уровень целиком. */
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
//
// NOTE: this is the title system currently shipped in the app. The product
// brief separately describes a D/C/B/A/S rank derived from an entrance
// test — that's a distinct, not-yet-built concept; this function is not it.
const RANKS: { xp: number; title: string }[] = [
  { xp: 0, title: 'Новичок' },
  { xp: 200, title: 'Ученик' },
  { xp: 500, title: 'Начинающий исследователь' },
  { xp: 1000, title: 'Искатель' },
  { xp: 2000, title: 'Знаток' },
  { xp: 3500, title: 'Эрудит' },
  { xp: 5500, title: 'Мастер' },
  { xp: 8000, title: 'Эксперт ОРТ' },
  { xp: 12000, title: 'Гуру ОРТ' },
];

export function getRankTitle(xp: number): string {
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
export function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
  return dateKey(mon);
}

/** Индекс дня недели: 0=Пн … 6=Вс */
export function todayDayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

// D/C/B/A/S entrance-test rank — the distinct concept flagged in the note
// above getRankTitle. Separate scale, separate purpose: this is a one-time
// placement result, not a running XP status.
export type Rank = 'D' | 'C' | 'B' | 'A' | 'S';

const RANK_THRESHOLDS: { min: number; rank: Rank }[] = [
  { min: 90, rank: 'S' },
  { min: 75, rank: 'A' },
  { min: 60, rank: 'B' },
  { min: 40, rank: 'C' },
  { min: 0, rank: 'D' },
];

export function calcRank(score: number, total: number): Rank {
  if (total <= 0) return 'D';
  const pct = (score / total) * 100;
  for (const t of RANK_THRESHOLDS) if (pct >= t.min) return t.rank;
  return 'D';
}

export type PetMood = 'excited' | 'happy' | 'neutral' | 'sad';

/** Reuses existing streak/last_activity semantics (dateKey format). */
export function petMoodFromStreak(
  streak: number,
  lastActivity: string | null,
  today: string = dateKey(),
): PetMood {
  if (!lastActivity) return 'neutral';
  const daysSince = Math.round((Date.parse(today) - Date.parse(lastActivity)) / 86_400_000);
  if (daysSince >= 3) return 'sad';
  if (daysSince === 0 && streak >= 7) return 'excited';
  if (daysSince === 0) return 'happy';
  return 'neutral';
}
