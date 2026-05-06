import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const fontStack = `'Gilroy', 'Manrope', system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;

export const theme = extendTheme({
  config,
  fonts: {
    heading: fontStack,
    body: fontStack,
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  colors: {
    brand: {
      50: '#F2FAE3',
      100: '#E2F4C5',
      200: '#CCEC97',
      300: '#B3E067',
      400: '#9CD340',
      500: '#84C547',
      600: '#6BA82E',
      700: '#527E22',
      800: '#3A5A19',
      900: '#243912',
    },
    navy: {
      50: '#E8EBF1',
      100: '#C5CDDB',
      200: '#9BA8BE',
      300: '#6F8198',
      400: '#495970',
      500: '#2C3B53',
      600: '#1B2A41',
      700: '#11233A',
      800: '#0C1B2D',
      900: '#08121F',
    },
  },
  semanticTokens: {
    colors: {
      'app.bg': { default: 'gray.50', _dark: 'navy.900' },
      'app.surface': { default: 'white', _dark: 'navy.800' },
      'app.surfaceMuted': { default: 'gray.50', _dark: 'navy.700' },
      'app.border': { default: 'gray.200', _dark: 'navy.700' },
      'app.text': { default: 'navy.700', _dark: 'gray.50' },
      'app.textMuted': { default: 'gray.500', _dark: 'gray.400' },
      'app.brand': { default: 'brand.600', _dark: 'brand.400' },
      'app.brandSubtle': { default: 'brand.50', _dark: 'brand.900' },
    },
  },
  styles: {
    global: {
      'html, body, #root': {
        height: '100%',
      },
      body: {
        WebkitFontSmoothing: 'antialiased',
        fontFamily: fontStack,
        bg: 'app.bg',
        color: 'app.text',
      },
      '*::placeholder': {
        color: 'gray.400',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        letterSpacing: '0.005em',
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: 'bold',
        letterSpacing: '-0.01em',
      },
    },
    Tag: {
      baseStyle: {
        container: { fontWeight: 'semibold' },
      },
    },
    Badge: {
      baseStyle: {
        fontWeight: 'semibold',
        letterSpacing: '0.02em',
      },
    },
  },
});
