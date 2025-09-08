import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

export { darkTheme, lightTheme };

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type ThemeMode = keyof typeof themes;
