import { createTheme } from '@mui/material';

// Clean Black & White Theme (Light Mode)
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#111827',
      light: '#374151',
      dark: '#000000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6B7280',
      light: '#9CA3AF',
      dark: '#4B5563',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
    },
    error: {
      main: '#DC2626',
    },
    warning: {
      main: '#D97706',
    },
    info: {
      main: '#2563EB',
    },
    success: {
      main: '#059669',
    },
    divider: '#E5E7EB',
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
            borderColor: '#111827',
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
            borderColor: '#6B7280',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#F3F4F6',
          },
          '&.Mui-selected:hover': {
            backgroundColor: '#E5E7EB',
          },
          '&:hover': {
            backgroundColor: '#F9FAFB',
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
              borderColor: '#6B7280',
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