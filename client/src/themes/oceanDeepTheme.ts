import { createTheme } from '@mui/material';
import { darken, lighten } from '@mui/material/styles';

// Ocean Deep Theme - Ocean Blue/Teal on Dark Navy backgrounds
export const oceanDeepTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4FC3F7', // Ocean Blue (MUI light-blue 300)
      light: lighten('#4FC3F7', 0.1),
      dark: darken('#4FC3F7', 0.15),
      contrastText: '#000000',
    },
    secondary: {
      main: '#9CA3AF',
      light: '#D1D5DB',
      dark: '#6B7280',
      contrastText: '#000000',
    },
    background: {
      default: '#0A1929', // Dark Navy
      paper: '#132F4C', // Slightly lighter navy for cards
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3C5D7',
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
    invoiceStatus: {
      paid: lighten('#4FC3F7', 0.1), // Lighter ocean blue for paid
      unpaid: '#4FC3F7', // Ocean blue for unpaid
      overdue: darken('#4FC3F7', 0.3), // Darker ocean blue for overdue
    },
    divider: 'rgba(79, 195, 247, 0.12)',
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
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
          padding: '8px 16px',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          backgroundColor: '#4FC3F7',
          color: '#000000',
          '&:hover': {
            backgroundColor: darken('#4FC3F7', 0.15),
          },
        },
        outlined: {
          borderColor: lighten('#4FC3F7', 0.1),
          color: '#4FC3F7',
          '&:hover': {
            borderColor: '#4FC3F7',
            backgroundColor: 'rgba(79, 195, 247, 0.08)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4FC3F7',
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
            backgroundColor: 'rgba(79, 195, 247, 0.16)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(79, 195, 247, 0.24)',
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
          border: '1px solid rgba(79, 195, 247, 0.12)',
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
          backgroundColor: '#132F4C',
          borderBottom: '1px solid rgba(79, 195, 247, 0.12)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 600,
            color: '#FFFFFF',
            backgroundColor: '#132F4C',
            borderBottom: '2px solid rgba(79, 195, 247, 0.12)',
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
              borderColor: '#4FC3F7',
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
