import { createTheme } from '@mui/material';
import { darken, lighten } from '@mui/material/styles';

// Black Purple Theme - Deep Black with Vibrant Purple accents
export const blackPurpleTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#BB86FC', // Vibrant Purple
      light: lighten('#BB86FC', 0.15),
      dark: darken('#BB86FC', 0.15),
      contrastText: '#000000',
    },
    secondary: {
      main: '#7C4DFF', // Deep Purple accent
      light: lighten('#7C4DFF', 0.15),
      dark: darken('#7C4DFF', 0.15),
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0D0D0D', // Near-black
      paper: '#1A1A1A', // Slightly lighter black for cards
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
    invoiceStatus: {
      paid: lighten('#BB86FC', 0.15), // Lighter purple for paid
      unpaid: '#BB86FC', // Mid purple for unpaid
      overdue: darken('#BB86FC', 0.3), // Darker purple for overdue
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
          backgroundColor: '#BB86FC',
          color: '#000000',
          '&:hover': {
            backgroundColor: darken('#BB86FC', 0.15),
          },
        },
        outlined: {
          borderColor: lighten('#BB86FC', 0.1),
          color: '#BB86FC',
          '&:hover': {
            borderColor: '#BB86FC',
            backgroundColor: 'rgba(187, 134, 252, 0.08)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#BB86FC',
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
            backgroundColor: 'rgba(187, 134, 252, 0.16)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(187, 134, 252, 0.24)',
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
          backgroundColor: '#1A1A1A',
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
            backgroundColor: '#1A1A1A',
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
              borderColor: '#BB86FC',
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
