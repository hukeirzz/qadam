export const colors = {
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
} as const;

// Доп. токены для карточек главного экрана — та же полупрозрачная заливка,
// что и на остальных экранах приложения (colors.surfaceGlass/borderMuted),
// чтобы стиль карточек был единым по всему приложению.
export const cardTheme = {
  fill: colors.surfaceGlass,
  border: colors.borderMuted,
  borderSoft: colors.borderMuted,
} as const;

// Мягкие ambient-свечения под карточками/бейджами (для shadowColor).
export const glow = {
  purple: 'rgba(139, 92, 246, 0.35)',
  gold: 'rgba(255, 176, 32, 0.35)',
  cyan: 'rgba(34, 211, 238, 0.3)',
  success: 'rgba(34, 197, 141, 0.3)',
  rose: 'rgba(251, 123, 176, 0.3)',
} as const;

// Двухцветные градиенты для акцентных заливок (кольцо прогресса и т.п.).
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
