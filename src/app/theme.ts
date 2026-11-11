import { createTheme } from '@mui/material';

export const displayFont = '"Fraunces Variable", Georgia, serif';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0c0b0a',
      paper: '#141210',
    },
    primary: {
      main: '#d6b85a',
      contrastText: '#15130f',
    },
    secondary: {
      main: '#96bee6',
      contrastText: '#0c0b0a',
    },
    text: {
      primary: '#f5efe6',
      secondary: '#c9c1b4',
      disabled: '#7d766b',
    },
    divider: 'rgba(245, 239, 230, 0.1)',
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily:
      '"Inter Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    h1: {
      fontFamily: displayFont,
      fontWeight: 500,
      letterSpacing: '-0.02em',
      lineHeight: 1,
    },
    h2: {
      fontFamily: displayFont,
      fontWeight: 500,
      lineHeight: 1.05,
    },
    h3: {
      fontFamily: displayFont,
      fontWeight: 500,
      lineHeight: 1.1,
    },
    button: {
      fontWeight: 600,
      letterSpacing: 0,
      textTransform: 'none',
    },
  },
});
