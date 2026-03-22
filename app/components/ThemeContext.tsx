'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeId = 'none' | 'snow' | 'rain' | 'embers' | 'inferno' | 'wind' | 'blossoms' | 'storm';

export interface Theme {
  id: ThemeId;
  label: string;
  emoji: string;
}

export const THEMES: Theme[] = [
  { id: 'none',     label: 'Clear',    emoji: '✨' },
  { id: 'snow',     label: 'Snow',     emoji: '❄️' },
  { id: 'rain',     label: 'Rain',     emoji: '🌧️' },
  { id: 'embers',   label: 'Embers',   emoji: '🔥' },
  { id: 'inferno',  label: 'Inferno',  emoji: '🌋' },
  { id: 'wind',     label: 'Wind',     emoji: '💨' },
  { id: 'blossoms', label: 'Blossoms', emoji: '🌸' },
  { id: 'storm',    label: 'Storm',    emoji: '⛈️' },
];

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'none', setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('none');

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-theme') as ThemeId | null;
    if (saved) setThemeState(saved);
  }, []);

  const setTheme = (id: ThemeId) => {
    setThemeState(id);
    localStorage.setItem('dashboard-theme', id);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
