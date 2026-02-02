import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

export const theme = extendTheme({
  config,
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`,
  },
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    sidebar: {
      light: {
        bg: '#ffffff',
        hover: '#f7f8fa',
        active: 'rgba(33, 150, 243, 0.08)',
        border: '#e2e8f0',
      },
      dark: {
        bg: '#0f1117',
        hover: '#1a1d24',
        active: 'rgba(33, 150, 243, 0.15)',
        border: '#2d3748',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        _dark: {
          bg: '#0a0b0f',
        },
      },
    },
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          boxShadow: 'sm',
          _dark: {
            bg: 'gray.800',
            borderColor: 'gray.700',
          },
        },
      },
    },
    Button: {
      defaultProps: {
        borderRadius: 'lg',
      },
    },
    Input: {
      defaultProps: {
        borderRadius: 'lg',
      },
    },
  },
});
