import { createTheme } from '@mui/material';
import { darken, lighten } from '@mui/material/styles';

// Sierra Blue + Vanilla Theme
export const sierraVanillaTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#BFDAF7', // Sierra Blue
      light: lighten('#BFDAF7', 0.1),
      dark: darken('#BFDAF7', 0.15),
      contrastText: '#000000',
    },
    secondary: {
      main: '#F3E5AB', // Vanilla
      light: lighten('#F3E5AB', 0.1),
      dark: darken('#F3E5AB', 0.15),
      contrastText: '#000000',
    },
    background: {
      default: '#2A2A2A', // Dark Grey from pinkGreyTheme
      paper: '#3A3A3A', // Slightly lighter grey for cards from pinkGreyTheme
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
      paid: '#BFDAF7', // Sierra Blue for paid
      unpaid: lighten('#BFDAF7', 0.2), // Even lighter blue for unpaid
      overdue: darken('#BFDAF7', 0.3), // Darker blue for overdue
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
          backgroundColor: '#BFDAF7',
          color: '#000000',
          '&:hover': {
            backgroundColor: darken('#BFDAF7', 0.15),
          },
        },
        outlined: {
          borderColor: lighten('#BFDAF7', 0.1),
          color: '#BFDAF7',
          '&:hover': {
            borderColor: '#BFDAF7',
            backgroundColor: 'rgba(191, 218, 247, 0.08)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#BFDAF7',
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
            backgroundColor: 'rgba(191, 218, 247, 0.16)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(191, 218, 247, 0.24)',
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
          backgroundColor: '#3A3A3A',
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
            backgroundColor: '#3A3A3A',
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
              borderColor: '#BFDAF7',
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
