import React, { ReactNode, createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, Theme } from '@mui/material';
import { darkTheme } from './darkTheme';
import { pinkGreyTheme } from './pinkGreyTheme';

type ThemeMode = 'dark' | 'pinkGrey';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  currentTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'invoice-theme-preference';

// Theme provider with theme switching and localStorage persistence
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Load theme preference from localStorage
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return (stored === 'pinkGrey' ? 'pinkGrey' : 'dark') as ThemeMode;
    } catch {
      return 'dark';
    }
  });

  const currentTheme = themeMode === 'pinkGrey' ? pinkGreyTheme : darkTheme;

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const newMode = prev === 'dark' ? 'pinkGrey' : 'dark';
      // Persist to localStorage
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newMode);
      } catch {
        // Ignore localStorage errors (e.g., private browsing)
      }
      return newMode;
    });
  };

  useEffect(() => {
    // Sync with localStorage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        setThemeMode(e.newValue as ThemeMode);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, currentTheme }}>
      <MuiThemeProvider theme={currentTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
};
