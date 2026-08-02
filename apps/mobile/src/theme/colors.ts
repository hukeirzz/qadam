export type ThemeMode = 'light' | 'dark';

export interface ColorPalette {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceGlass: string;
  border: string;
  borderMuted: string;
  text: string;
  textMuted: string;
  textDim: string;
  purple: string;
  purpleGlow: string;
  purpleDark: string;
  tabBar: string;
  tabInactive: string;
  gold: string;
  success: string;
}

const lightColors: ColorPalette = {
  background: '#F7F6FC',
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceGlass: 'rgba(255, 255, 255, 0.9)',
  border: '#ECE9F7',
  borderMuted: 'rgba(144, 71, 255, 0.12)',
  text: '#2B2447',
  textMuted: '#8B85A8',
  textDim: '#B3AECB',
  purple: '#8B5CF6',
  purpleGlow: '#7C3AED',
  purpleDark: '#EDE7FB',
  tabBar: '#FFFFFF',
  tabInactive: '#8B85A8',
  gold: '#FFB020',
  success: '#22C58D',
};

const darkColors: ColorPalette = {
  background: '#0A0818',
  backgroundElevated: '#120A2E',
  surface: '#130B35',
  surfaceGlass: 'rgba(19, 11, 53, 0.72)',
  border: '#231656',
  borderMuted: 'rgba(51, 35, 120, 0.45)',
  text: '#FFFFFF',
  textMuted: '#7D75A8',
  textDim: '#655B96',
  purple: '#9047FF',
  purpleGlow: '#B47AFF',
  purpleDark: '#1A1046',
  tabBar: '#070417',
  tabInactive: '#463D73',
  gold: '#FFD166',
  success: '#2EE59D',
};

export interface GlowPalette {
  purple: string;
  gold: string;
  cyan: string;
  success: string;
  rose: string;
}

// Мягкие ambient-свечения под карточками/бейджами (для shadowColor) — на
// тёмном фоне нужны заметнее (выше alpha), чем на светлом.
const lightGlow: GlowPalette = {
  purple: 'rgba(139, 92, 246, 0.35)',
  gold: 'rgba(255, 176, 32, 0.35)',
  cyan: 'rgba(34, 211, 238, 0.3)',
  success: 'rgba(34, 197, 141, 0.3)',
  rose: 'rgba(251, 123, 176, 0.3)',
};

const darkGlow: GlowPalette = {
  purple: 'rgba(139, 92, 246, 0.5)',
  gold: 'rgba(255, 209, 102, 0.5)',
  cyan: 'rgba(34, 211, 238, 0.45)',
  success: 'rgba(46, 229, 157, 0.45)',
  rose: 'rgba(251, 123, 176, 0.45)',
};

function makeCardTheme(c: ColorPalette) {
  return {
    fill: c.surfaceGlass,
    border: c.borderMuted,
    borderSoft: c.borderMuted,
  } as const;
}

export type CardTheme = ReturnType<typeof makeCardTheme>;

export const palettes: Record<ThemeMode, { colors: ColorPalette; cardTheme: CardTheme; glow: GlowPalette }> = {
  light: { colors: lightColors, cardTheme: makeCardTheme(lightColors), glow: lightGlow },
  dark: { colors: darkColors, cardTheme: makeCardTheme(darkColors), glow: darkGlow },
};

// Статичные экспорты (= светлая тема) — запасной вариант для мест, которые
// рендерятся вне ThemeProvider, и обратная совместимость. Внутри экранов
// всегда предпочитай colors/cardTheme/glow из useTheme() — они реагируют
// на переключение темы, а эти — нет.
export const colors = lightColors;
export const cardTheme = palettes.light.cardTheme;
export const glow = lightGlow;

// Двухцветные градиенты для акцентных заливок (кольцо прогресса и т.п.) —
// не зависят от темы.
export const gradients = {
  aurora: ['#8B5CF6', '#EC4899'] as const,
  auroraCool: ['#8B5CF6', '#22D3EE'] as const,
  gold: ['#FFD87A', '#E8A93B'] as const,
} as const;

const baseSubjectColors = {
  math: {
    primary: '#FF3B5C',
    secondary: '#FF6B85',
    glow: 'rgba(255, 59, 92, 0.55)',
    gradient: ['#FF3B5C', '#C41E3A'] as const,
  },
  geometry: {
    primary: '#3B8BFF',
    secondary: '#6BB0FF',
    glow: 'rgba(59, 139, 255, 0.55)',
    gradient: ['#3B8BFF', '#1E5FCC'] as const,
  },
  analogies: {
    primary: '#FF8C3B',
    secondary: '#FFB06B',
    glow: 'rgba(255, 140, 59, 0.55)',
    gradient: ['#FF8C3B', '#CC6A1E'] as const,
  },
  reading: {
    primary: '#2EE59D',
    secondary: '#5FF0B8',
    glow: 'rgba(46, 229, 157, 0.55)',
    gradient: ['#2EE59D', '#1AB87A'] as const,
  },
  grammar: {
    primary: '#E85DFF',
    secondary: '#F08BFF',
    glow: 'rgba(232, 93, 255, 0.55)',
    gradient: ['#E85DFF', '#B832D4'] as const,
  },
} as const;

// Премиум-предметы используют палитру родного базового предмета.
export const subjectColors = {
  ...baseSubjectColors,
  math_premium: baseSubjectColors.math,
  geometry_premium: baseSubjectColors.geometry,
  analogies_premium: baseSubjectColors.analogies,
  reading_premium: baseSubjectColors.reading,
  grammar_premium: baseSubjectColors.grammar,
} as const;
