import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';
import { useThemeMode } from '../../../themes/ThemeContext';

/**
 * Theme toggle button for switching between dark and pink-grey themes
 * Only used on the invoice management page
 */
const ThemeToggle: React.FC = () => {
  const { themeMode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={`Switch to ${themeMode === 'dark' ? 'Pink-Grey' : 'Dark Blue'} theme`}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: themeMode === 'pinkGrey' ? '#FFC0CB' : '#90CAF9',
          '&:hover': {
            backgroundColor: themeMode === 'pinkGrey'
              ? 'rgba(255, 192, 203, 0.08)'
              : 'rgba(144, 202, 249, 0.08)',
          },
        }}
        aria-label="Toggle theme"
      >
        <PaletteIcon />
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
