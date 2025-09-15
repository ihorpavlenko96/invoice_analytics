import { createTheme } from '@mui/material';

// Clean White Theme (Light Mode)
export const whiteTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#111827',      // Gray-900
      light: '#374151',     // Gray-700
      dark: '#000000',      // Pure Black
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6B7280',      // Gray-500
      light: '#9CA3AF',     // Gray-400
      dark: '#4B5563',      // Gray-600
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',   // Pure White
      paper: '#F9FAFB',     // Gray-50
    },
    text: {
      primary: '#111827',   // Gray-900
      secondary: '#4B5563', // Gray-600
    },
    error: {
      main: '#DC2626',      // Red-600
    },
    warning: {
      main: '#D97706',      // Amber-600
    },
    info: {
      main: '#2563EB',      // Blue-600
    },
    success: {
      main: '#059669',      // Emerald-600
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          padding: '8px 16px',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          backgroundColor: '#111827',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#000000',
          },
        },
        outlined: {
          borderColor: '#D1D5DB',
          color: '#111827',
          '&:hover': {
            borderColor: '#9CA3AF',
            backgroundColor: 'rgba(17, 24, 39, 0.04)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#111827',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#9CA3AF',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(17, 24, 39, 0.08)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(17, 24, 39, 0.12)',
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #E5E7EB',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 600,
            color: '#111827',
            backgroundColor: '#F9FAFB',
            borderBottom: '2px solid #E5E7EB',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#D1D5DB',
            },
            '&:hover fieldset': {
              borderColor: '#9CA3AF',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#111827',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});