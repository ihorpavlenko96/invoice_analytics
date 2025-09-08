import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { themes, ThemeMode } from './index';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-react';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState(true);
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  // Load theme preference from API
  useEffect(() => {
    const loadThemePreference = async () => {
      if (!isSignedIn || !user) {
        setThemeModeState('dark'); // Default theme
        setIsLoading(false);
        return;
      }

      try {
        const token = await getToken();
        const response = await axios.get('/users/me/theme-preference', {
          headers: { Authorization: token },
        });
        
        if (response.data?.themePreference) {
          setThemeModeState(response.data.themePreference as ThemeMode);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
        // Use dark as default fallback
        setThemeModeState('dark');
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, [isSignedIn, user, getToken]);

  // Save theme preference to API
  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);

    if (!isSignedIn || !user) {
      return;
    }

    try {
      const token = await getToken();
      await axios.put(
        '/users/me/theme-preference',
        { themePreference: mode },
        { headers: { Authorization: token } }
      );
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  const contextValue: ThemeContextType = {
    themeMode,
    setThemeMode,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={themes[themeMode]}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
