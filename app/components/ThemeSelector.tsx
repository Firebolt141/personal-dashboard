'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme, THEMES } from './ThemeContext';

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = THEMES.find(t => t.id === theme) ?? THEMES[0];

  return (
    <div ref={ref} className="theme-selector">
      {open && (
        <div className="theme-panel">
          <div className="theme-panel-header">Effects</div>
          <div className="theme-grid">
            {THEMES.map(t => (
              <button
                key={t.id}
                className={`theme-option${theme === t.id ? ' active' : ''}`}
                onClick={() => { setTheme(t.id); setOpen(false); }}
              >
                <span className="theme-emoji">{t.emoji}</span>
                <span className="theme-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        className="theme-fab"
        onClick={() => setOpen(o => !o)}
        title="Change theme effects"
      >
        {current.emoji}
      </button>
    </div>
  );
}
