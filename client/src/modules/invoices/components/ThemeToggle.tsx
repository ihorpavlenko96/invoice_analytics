import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';
import { useThemeMode } from '../../../themes/ThemeContext';

// Map of the next theme in the rotation for display in the tooltip
const NEXT_THEME_LABEL: Record<string, string> = {
  dark: 'Pink-Grey',
  pinkGrey: 'Charcoal Citrus',
  charcoalCitrus: 'Black Purple',
  blackPurple: 'Dark Blue',
};

// Accent color per theme for the icon
const THEME_ACCENT: Record<string, { color: string; hoverBg: string }> = {
  dark: { color: '#90CAF9', hoverBg: 'rgba(144, 202, 249, 0.08)' },
  pinkGrey: { color: '#FFC0CB', hoverBg: 'rgba(255, 192, 203, 0.08)' },
  charcoalCitrus: { color: '#F4F4A1', hoverBg: 'rgba(244, 244, 161, 0.08)' },
  blackPurple: { color: '#BB86FC', hoverBg: 'rgba(187, 134, 252, 0.08)' },
};

/**
 * Theme toggle button for cycling through the available themes
 * Only used on the invoice management page
 */
const ThemeToggle: React.FC = () => {
  const { themeMode, toggleTheme } = useThemeMode();
  const accent = THEME_ACCENT[themeMode] ?? THEME_ACCENT.dark;
  const nextLabel = NEXT_THEME_LABEL[themeMode] ?? 'Dark Blue';

  return (
    <Tooltip title={`Switch to ${nextLabel} theme`}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: accent.color,
          '&:hover': {
            backgroundColor: accent.hoverBg,
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
