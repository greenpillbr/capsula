import type { Theme } from "@react-navigation/native";

const NAV_FONT_FAMILY = "Inter_400Regular";

// Capsula Color Palette (Greenpill BR)
export const CAPSULA_COLORS = {
  // Primary Colors
  gpbrGreen: "#4CAF50",        // Main green for buttons, active states
  capsulaBlue: "#1A237E",      // Dark blue for backgrounds
  
  // Secondary & Accent Colors
  lightGreen: "#8BC34A",       // Bright green for highlights
  yellow: "#FFEB3B",           // Warning/highlight color
  teal: "#00BCD4",             // Information/accent color
  
  // Neutrals
  white: "#FFFFFF",
  lightGray: "#EEEEEE",
  mediumGray: "#9E9E9E",
  darkGray: "#424242",
  
  // Semantic
  success: "#4CAF50",          // Same as GPBR Green
  warning: "#FFEB3B",          // Same as yellow
  error: "#F44336",            // Red for errors
  
  // Additional shades for UI depth
  greenShade: "#45a049",       // Slightly darker green for pressed states
  blueShade: "#0d47a1",        // Slightly darker blue
  backgroundLight: "#f8f9fa",  // Very light background
  backgroundDark: "#121212",   // Dark mode background
};

export const NAV_THEME = {
  light: {
    background: CAPSULA_COLORS.backgroundLight,
    border: CAPSULA_COLORS.lightGray,
    card: CAPSULA_COLORS.white,
    notification: CAPSULA_COLORS.error,
    primary: CAPSULA_COLORS.gpbrGreen,
    text: CAPSULA_COLORS.darkGray,
  },
  dark: {
    background: CAPSULA_COLORS.backgroundDark,
    border: CAPSULA_COLORS.darkGray,
    card: CAPSULA_COLORS.capsulaBlue,
    notification: CAPSULA_COLORS.error,
    primary: CAPSULA_COLORS.lightGreen,
    text: CAPSULA_COLORS.white,
  },
};

export const LIGHT_THEME: Theme = {
  dark: false,
  fonts: {
    regular: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "400",
    },
    medium: {
      fontFamily: "Inter_600SemiBold",
      fontWeight: "500",
    },
    bold: {
      fontFamily: "Inter_600SemiBold",
      fontWeight: "700",
    },
    heavy: {
      fontFamily: "Inter_600SemiBold",
      fontWeight: "800",
    },
  },
  colors: NAV_THEME.light,
};

export const DARK_THEME: Theme = {
  dark: true,
  fonts: {
    regular: {
      fontFamily: NAV_FONT_FAMILY,
      fontWeight: "400",
    },
    medium: {
      fontFamily: "Inter_600SemiBold",
      fontWeight: "500",
    },
    bold: {
      fontFamily: "Inter_600SemiBold",
      fontWeight: "700",
    },
    heavy: {
      fontFamily: "Inter_600SemiBold",
      fontWeight: "800",
    },
  },
  colors: NAV_THEME.dark,
};

// Crypto-specific UI constants
export const CRYPTO_UI = {
  animations: {
    quick: 200,
    medium: 300,
    slow: 500,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  shadows: {
    light: {
      shadowColor: CAPSULA_COLORS.darkGray,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: CAPSULA_COLORS.darkGray,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};
