'use client';
import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import ThemeEffects from './ThemeEffects';
import ThemeSelector from './ThemeSelector';

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ThemeEffects />
      {children}
      <ThemeSelector />
    </ThemeProvider>
  );
}
