import { createTheme } from '@mui/material';
import { darken, lighten } from '@mui/material/styles';

const orange = '#FF8C00';
const orangeLight = '#FFB347';
const orangeDark = '#C75F00';
const black = '#080808';
const charcoal = '#141414';
const charcoalRaised = '#1F1F1F';
const borderGlow = 'rgba(255, 140, 0, 0.28)';

// Orange Charcoal Theme - Black surfaces with glossy orange accents
export const charcoalCitrusTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: orange,
      light: orangeLight,
      dark: orangeDark,
      contrastText: '#050505',
    },
    secondary: {
      main: '#A3A3A3',
      light: '#E5E5E5',
      dark: '#737373',
      contrastText: '#050505',
    },
    background: {
      default: black,
      paper: charcoal,
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#C7C7C7',
    },
    error: {
      main: '#FFB4A2',
      dark: '#D97706',
    },
    warning: {
      main: orangeLight,
      dark: orangeDark,
    },
    info: {
      main: '#F5A524',
    },
    success: {
      main: orange,
      dark: orangeDark,
    },
    invoiceStatus: {
      paid: orangeLight,
      unpaid: orange,
      overdue: orangeDark,
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
          boxShadow:
            '0 1px 2px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
          padding: '8px 16px',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow:
              '0 8px 18px rgba(255, 140, 0, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          backgroundImage: `linear-gradient(180deg, ${orangeLight} 0%, ${orange} 58%, ${orangeDark} 100%)`,
          backgroundColor: orange,
          color: '#050505',
          '&:hover': {
            backgroundImage: `linear-gradient(180deg, ${lighten(orangeLight, 0.08)} 0%, ${orange} 48%, ${darken(orangeDark, 0.08)} 100%)`,
            backgroundColor: orangeDark,
          },
        },
        outlined: {
          borderColor: borderGlow,
          color: orangeLight,
          '&:hover': {
            borderColor: orange,
            backgroundColor: 'rgba(255, 140, 0, 0.10)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: orange,
            boxShadow: '0 0 0 2px rgba(255, 140, 0, 0.16)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: borderGlow,
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 140, 0, 0.18)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(255, 140, 0, 0.28)',
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 140, 0, 0.10)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow:
            '0 18px 45px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          border: `1px solid ${borderGlow}`,
          backgroundImage: `linear-gradient(180deg, ${charcoalRaised} 0%, ${charcoal} 100%)`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: `linear-gradient(180deg, ${charcoalRaised} 0%, ${charcoal} 100%)`,
          boxShadow:
            '0 18px 45px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
          backgroundImage: `linear-gradient(180deg, ${charcoalRaised} 0%, ${black} 100%)`,
          backgroundColor: charcoal,
          borderBottom: `1px solid ${borderGlow}`,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontWeight: 700,
            color: '#FFFFFF',
            backgroundColor: '#171717',
            borderBottom: `2px solid ${borderGlow}`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.18)',
            },
            '&:hover fieldset': {
              borderColor: borderGlow,
            },
            '&.Mui-focused fieldset': {
              borderColor: orange,
              boxShadow: '0 0 0 2px rgba(255, 140, 0, 0.16)',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: orangeLight,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderColor: borderGlow,
        },
      },
    },
  },
});
