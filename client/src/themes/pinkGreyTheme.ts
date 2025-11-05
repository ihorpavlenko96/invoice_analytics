import { createTheme } from '@mui/material';
import { darken, lighten } from '@mui/material/styles';

// Coral Peach-Paper Grey Theme for Invoice Page
export const pinkGreyTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFB399', // Coral Peach
      light: lighten('#FFB399', 0.1),
      dark: darken('#FFB399', 0.15),
      contrastText: '#000000',
    },
    secondary: {
      main: '#9CA3AF',
      light: '#D1D5DB',
      dark: '#6B7280',
      contrastText: '#000000',
    },
    background: {
      default: '#D3D3D3', // Paper Grey
      paper: '#E0E0E0', // Slightly lighter paper grey for cards
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#4A4A4A',
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
      paid: '#FFB399', // Coral Peach for paid
      unpaid: lighten('#FFB399', 0.2), // Lighter coral peach for unpaid
      overdue: darken('#FFB399', 0.3), // Darker coral peach for overdue
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
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
          padding: '8px 16px',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          backgroundColor: '#FFB399',
          color: '#000000',
          '&:hover': {
            backgroundColor: darken('#FFB399', 0.15),
          },
        },
        outlined: {
          borderColor: lighten('#FFB399', 0.1),
          color: '#FFB399',
          '&:hover': {
            borderColor: '#FFB399',
            backgroundColor: 'rgba(255, 179, 153, 0.08)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FFB399',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 0, 0, 0.23)',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 179, 153, 0.16)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(255, 179, 153, 0.24)',
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
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(0, 0, 0, 0.12)',
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
          backgroundColor: '#E0E0E0',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 600,
            color: '#1A1A1A',
            backgroundColor: '#E0E0E0',
            borderBottom: '2px solid rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FFB399',
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
