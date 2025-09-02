// src/theme.ts

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Un azul clásico y profesional
    },
    secondary: {
      main: '#dc004e', // Un color de acento
    },
    background: {
      default: '#f4f6f8', // Un gris muy claro para los fondos de página
      paper: '#ffffff', // Blanco para las tarjetas y superficies
    },
  },
  typography: {
    fontFamily:
      'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8, // Bordes ligeramente más redondeados
  },
  components: {
    // Personalización para el botón principal
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          textTransform: 'none', // Quita las mayúsculas automáticas
          fontWeight: 600,
          padding: '10px 20px',
        },
      },
    },
    // Personalización para las tarjetas
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', // Una sombra más sutil
        },
      },
    },
  },
});

export default theme;
