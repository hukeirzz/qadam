export const colors = {
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
