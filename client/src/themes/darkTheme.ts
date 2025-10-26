import { createTheme } from '@mui/material';

// Clean Black & White Theme (Dark Mode)
// Button size variants: small, medium (default), large
// For extra-large buttons, use size="large" with sx={{ padding: '16px 32px', fontSize: '1rem', borderRadius: 16 }}
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90CAF9',
      light: '#B3E5FC',
      dark: '#42A5F5',
      contrastText: '#000000',
    },
    secondary: {
      main: '#9CA3AF',
      light: '#D1D5DB',
      dark: '#6B7280',
      contrastText: '#000000',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
    },
    error: {
      main: '#F87171',
    },
    warning: {
      main: '#FBBF24',
    },
    info: {
      main: '#60A5FA',
    },
    success: {
      main: '#34D399',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
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
          borderRadius: 12,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          padding: '8px 16px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          },
        },
        sizeSmall: {
          padding: '4px 8px',
          fontSize: '0.8125rem',
          borderRadius: 10,
        },
        sizeMedium: {
          padding: '8px 16px',
          fontSize: '0.875rem',
          borderRadius: 12,
        },
        sizeLarge: {
          padding: '12px 24px',
          fontSize: '0.9375rem',
          borderRadius: 14,
        },
        contained: {
          backgroundColor: '#90CAF9',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#42A5F5',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.23)',
          color: '#90CAF9',
          '&:hover': {
            borderColor: '#90CAF9',
            backgroundColor: 'rgba(144, 202, 249, 0.08)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#90CAF9',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.23)',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(144, 202, 249, 0.16)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(144, 202, 249, 0.24)',
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
          backgroundImage: 'none',
          backgroundColor: '#1E1E1E',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 600,
            color: '#FFFFFF',
            backgroundColor: '#2A2A2A',
            borderBottom: '2px solid rgba(255, 255, 255, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#90CAF9',
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
