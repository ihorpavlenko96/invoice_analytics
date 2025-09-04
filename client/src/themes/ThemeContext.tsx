import React, { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { theme } from './index';

// Simple theme provider with single theme
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <MuiThemeProvider theme={theme}>
      {children}
    </MuiThemeProvider>
  );
};