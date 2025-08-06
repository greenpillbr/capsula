# Capsula Design System

## Core Principles

- **Adaptive**: Support both Passkey and transaction password flows
- **Modular**: Easy to extend for future modules
- **Secure**: Clear security-focused interactions
- **Accessible**: Support all users regardless of authentication method

## Colors

### Primary Palette
```typescript
const colors = {
  // Brand colors - Green focused
  primary: '#10B981',     // Main actions, key elements (Emerald)
  primaryLight: '#D1FAE5', // Backgrounds, highlights
  primaryDark: '#059669',  // Pressed states
  
  // Secondary green tones
  accent: '#34D399',      // Secondary actions
  accentLight: '#A7F3D0', // Subtle highlights
  accentDark: '#059669',  // Deep accents
  
  // Nature-inspired greens
  sage: '#047857',        // Rich green for emphasis
  mint: '#6EE7B7',       // Fresh, vibrant green
  forest: '#064E3B',     // Deep, trustworthy green
  
  // Surface colors
  background: '#FFFFFF',   // App background
  surface: '#F8F9FA',     // Cards, containers
  surfaceHover: '#F1F3F5', // Interactive hover
  
  // Text colors
  text: '#1A1A1A',        // Primary text
  textSecondary: '#6B7280', // Secondary text
  textDisabled: '#9CA3AF', // Disabled text
  
  // Feedback colors
  success: '#10B981',     // Success states (same as primary)
  error: '#EF4444',       // Error states
  warning: '#F59E0B',     // Warning states
  info: '#3B82F6',        // Info states
  
  // UI elements
  border: '#E5E7EB',      // Borders, dividers
  shadow: '#000000',      // Shadows (with opacity)
}
```

### Dark Mode Palette
```typescript
const darkColors = {
  // Brand colors - Green focused
  primary: '#10B981',
  primaryLight: '#064E3B',
  primaryDark: '#34D399',
  
  // Secondary green tones
  accent: '#34D399',
  accentLight: '#065F46',
  accentDark: '#6EE7B7',
  
  // Nature-inspired greens
  sage: '#047857',
  mint: '#6EE7B7',
  forest: '#064E3B',
  
  // Surface colors
  background: '#111827',
  surface: '#1F2937',
  surfaceHover: '#374151',
  
  // Text colors
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textDisabled: '#6B7280',
  
  // Feedback colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // UI elements
  border: '#374151',
  shadow: '#000000',
}
```

## Typography

### Font Scale
```typescript
const typography = {
  // Font sizes
  size: {
    xs: 12,    // Captions, hints
    sm: 14,    // Secondary text
    base: 16,  // Body text
    lg: 18,    // Important text
    xl: 20,    // Subtitles
    xxl: 24,   // Titles
    xxxl: 32,  // Hero text
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font weights
  weight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
}
```

## Mobile-First Layout System

```typescript
const spacing = {
  // Base spacing units (multiples of 4 for consistency)
  xs: 4,    // Minimal separation
  sm: 8,    // Tight spacing
  md: 16,   // Standard spacing
  lg: 24,   // Comfortable spacing
  xl: 32,   // Section spacing
  xxl: 48,  // Screen margins
  
  // Mobile-specific spacing
  safeArea: {
    top: 'env(safe-area-inset-top)',
    bottom: 'env(safe-area-inset-bottom)',
    left: 'env(safe-area-inset-left)',
    right: 'env(safe-area-inset-right)',
  },
  
  // Common component spacing
  screen: {
    padding: 16,
    bottomNavHeight: 56,
    topNavHeight: 44,
  },
  
  // Touch-friendly spacing
  button: {
    height: 48,       // Comfortable tap target
    padding: 16,
    gap: 8,
  },
  
  input: {
    height: 48,      // Match button height
    padding: 12,
    gap: 8,
  },
  
  card: {
    padding: 16,
    gap: 12,
    marginBottom: 16,
  }
}

const layout = {
  // Mobile-optimized border radius
  radius: {
    sm: 8,     // Subtle rounded corners
    md: 12,    // Standard components
    lg: 16,    // Cards and modules
    xl: 24,    // Modal sheets
    full: 9999, // Circular elements
  },
  
  // Touch targets (iOS HIG / Material Design)
  touch: {
    minHeight: 48,    // Minimum touchable height
    minWidth: 48,     // Minimum touchable width
    spacing: 8,       // Space between touchable elements
  },
  
  // Screen breakpoints (mobile-first)
  breakpoints: {
    base: 0,          // Mobile first
    sm: 360,         // Small phones
    md: 390,         // Standard phones
    lg: 428,         // Large phones
    tablet: 768,     // Tablets (if needed)
  },
  
  // Z-index scale
  zIndex: {
    base: 0,
    card: 10,
    nav: 20,
    modal: 30,
    overlay: 40,
    toast: 50,
  }
}
```

## Components

### Mobile Authentication Components

1. AuthButton
```typescript
interface AuthButtonProps {
  variant: 'passkey' | 'password' | 'recovery';
  state: 'idle' | 'loading' | 'success' | 'error';
  icon?: React.ReactNode;
  children: React.ReactNode;
  onPress: () => void;
  hapticFeedback?: 'light' | 'medium' | 'heavy';
  pressAnimation?: 'scale' | 'opacity';
  style?: ViewStyle;
}
```

2. SecurityInput
```typescript
interface SecurityInputProps {
  type: 'pin' | 'password' | 'mnemonic';
  secure?: boolean;
  validation?: RegExp;
  error?: string;
  keyboardType?: 'numeric' | 'default' | 'email-address';
  autoComplete?: 'off' | 'password';
  blurOnSubmit?: boolean;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  style?: ViewStyle;
}
```

3. RecoveryInput
```typescript
interface RecoveryInputProps {
  words: string[];
  activeIndex: number;
  onChange: (index: number, word: string) => void;
  onComplete: () => void;
}
```

### Module System Components

1. ModuleCard
```typescript
interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'available' | 'installed' | 'updating';
  onPress?: () => void;
}
```

2. ModuleAction
```typescript
interface ModuleActionProps {
  label: string;
  icon: React.ReactNode;
  requiresAuth: boolean;
  onPress: () => void;
}
```

## Animation Guidelines

```typescript
const animation = {
  // Durations
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  
  // Easing curves
  easing: {
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  }
}
```

## Security Indicators

```typescript
const securityIndicators = {
  colors: {
    secure: colors.success,
    warning: colors.warning,
    danger: colors.error,
  },
  
  icons: {
    passkey: '🔐',
    password: '🔒',
    recovery: '🔑',
  }
}
```

## Module Development Guidelines

### Visual Integration
- Use provided color tokens
- Follow typography scale
- Maintain consistent spacing
- Extend base components

### Security Requirements
- Support both auth methods
- Clear security states
- Proper error handling
- Secure data storage

### Accessibility Guidelines
- Minimum touch targets (44x44)
- Clear focus states
- Screen reader support
- Color contrast (WCAG AA)

This design system provides a foundation that supports both Passkey and transaction password flows while maintaining consistency across the core wallet and future modules.