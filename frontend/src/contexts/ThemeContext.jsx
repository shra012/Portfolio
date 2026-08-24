import { createContext, useContext, useEffect, useState } from 'react';
import logoSprite from '../assets/logo.png';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'portfolio-theme';

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage unavailable (private mode, blocked cookies) - fall through
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', theme === 'dark' ? '#050816' : '#f6f7fb');
    }

    // The logo asset contains dark and light marks side by side. Crop the
    // matching half into a data URL so favicon changes bypass browser caching.
    const logoImage = new Image();
    logoImage.src = logoSprite;
    logoImage.onload = () => {
      const favicon = document.querySelector('#theme-favicon');
      if (!favicon) return;

      const sourceWidth = logoImage.naturalWidth / 2;
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;

      const context = canvas.getContext('2d');
      if (!context) return;

      context.drawImage(
        logoImage,
        theme === 'dark' ? 0 : sourceWidth,
        0,
        sourceWidth,
        logoImage.naturalHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );
      favicon.setAttribute('href', canvas.toDataURL('image/png'));
    };

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // persistence is best-effort
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
