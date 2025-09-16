import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

// Export both themes - ThemeContext handles selection
export { darkTheme, lightTheme };

// Legacy export for backwards compatibility
export const theme = darkTheme;
