export const colors = {
  // Primary Colors
  primary: '#4CAF50', // GPBR Green (Main)
  primaryDark: '#1A237E', // Capsula Dark Blue (Background/Base)
  
  // Secondary & Accent Colors
  accent: '#8BC34A', // Capsula Light Green (Accent)
  warning: '#FFEB3B', // Capsula Yellow (Highlight/Warning)
  info: '#00BCD4', // Capsula Teal (Accent/Information)
  
  // Neutral Colors
  white: '#FFFFFF',
  lightGray: '#EEEEEE',
  mediumGray: '#9E9E9E',
  darkGray: '#424242',
  black: '#000000',
  
  // Semantic Colors
  success: '#4CAF50',
  error: '#F44336',
  
  // Background Colors
  background: '#FFFFFF',
  backgroundDark: '#1A237E',
  surface: '#FFFFFF',
  surfaceDark: '#424242',
  
  // Text Colors
  text: '#424242',
  textLight: '#9E9E9E',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  
  // Border Colors
  border: '#EEEEEE',
  borderDark: '#9E9E9E',
} as const;

export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  fontSize: {
    caption: 12,
    body2: 14,
    body1: 16,
    subtitle2: 18,
    subtitle1: 20,
    h6: 20,
    h5: 24,
    h4: 28,
    h3: 32,
    h2: 36,
    h1: 40,
  },
  lineHeight: {
    caption: 16,
    body2: 20,
    body1: 24,
    subtitle2: 26,
    subtitle1: 28,
    h6: 28,
    h5: 32,
    h4: 36,
    h3: 40,
    h2: 44,
    h1: 48,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
} as const;

export const shadows = {
  none: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;