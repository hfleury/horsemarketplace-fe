// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#6366f1' }, // indigo-500 (common in NFT sites)
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontWeight: 700, fontSize: '3rem' },
    h2: { fontWeight: 600, fontSize: '2.25rem' },
    body1: { fontSize: '1rem', color: '#374151' },
  },
  shape: {
    borderRadius: 16, // softer corners like Xhibiter
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: '1px solid #e5e7eb',
          boxShadow: 'none',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
          },
        },
      },
    },
  },
});

export default theme;