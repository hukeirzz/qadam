import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palettes, ThemeMode, ColorPalette, CardTheme, GlowPalette } from './colors';

const STORAGE_KEY = 'qadam_theme_mode';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ColorPalette;
  cardTheme: CardTheme;
  glow: GlowPalette;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') setModeState(saved);
    });
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const toggleMode = () => setMode(mode === 'light' ? 'dark' : 'light');

  const value = useMemo<ThemeContextValue>(() => {
    const p = palettes[mode];
    return { mode, colors: p.colors, cardTheme: p.cardTheme, glow: p.glow, setMode, toggleMode };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
