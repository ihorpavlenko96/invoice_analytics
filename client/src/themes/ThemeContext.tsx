import React, { ReactNode, createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, Theme } from '@mui/material';
import { darkTheme } from './darkTheme';
import { pinkGreyTheme } from './pinkGreyTheme';
import { charcoalCitrusTheme } from './charcoalCitrusTheme';

type ThemeMode = 'dark' | 'pinkGrey' | 'charcoalCitrus';

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
      if (stored === 'pinkGrey' || stored === 'charcoalCitrus') {
        return stored as ThemeMode;
      }
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  const getTheme = (mode: ThemeMode): Theme => {
    switch (mode) {
      case 'pinkGrey':
        return pinkGreyTheme;
      case 'charcoalCitrus':
        return charcoalCitrusTheme;
      case 'dark':
      default:
        return darkTheme;
    }
  };

  const currentTheme = getTheme(themeMode);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      let newMode: ThemeMode;
      if (prev === 'dark') {
        newMode = 'pinkGrey';
      } else if (prev === 'pinkGrey') {
        newMode = 'charcoalCitrus';
      } else {
        newMode = 'dark';
      }
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
