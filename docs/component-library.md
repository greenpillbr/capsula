# Capsula Component Library

## Core Philosophy
- Composable primitives over complex components
- Mobile-first, touch-optimized
- Consistent styling and behavior
- Extensible for module development

## Base Components

### Primitive Components

```typescript
// Base component for all touchable elements
interface TouchableProps {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  hapticFeedback?: 'light' | 'medium' | 'heavy';
  hitSlop?: number;
  pressableStyle?: ViewStyle;
  children: React.ReactNode;
}

// Base text component with consistent styling
interface TextProps {
  variant: 'title' | 'subtitle' | 'body' | 'caption';
  color?: keyof typeof colors;
  weight?: keyof typeof fontWeight;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

// Base container with safe area handling
interface ContainerProps {
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  backgroundColor?: keyof typeof colors;
  padding?: keyof typeof spacing;
  children: React.ReactNode;
}
```

### Input Components

```typescript
// Base text input with mobile optimizations
interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  secureTextEntry?: boolean;
  autoComplete?: 'off' | 'password';
  autoCapitalize?: 'none' | 'sentences';
  error?: string;
  maxLength?: number;
  onSubmitEditing?: () => void;
}

// PIN input optimized for transaction passwords
interface PinInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  secure?: boolean;
  showKeyboard?: boolean;
  error?: string;
}
```

### Feedback Components

```typescript
// Loading indicator with consistent styling
interface SpinnerProps {
  size?: 'small' | 'large';
  color?: keyof typeof colors;
  overlay?: boolean;
}

// Toast messages for user feedback
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  position?: 'top' | 'bottom';
}
```

## Composite Components

### Buttons

```typescript
// Primary action button
interface ButtonProps extends TouchableProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'small' | 'regular' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

// Icon button for compact actions
interface IconButtonProps extends TouchableProps {
  icon: React.ReactNode;
  size?: 'small' | 'regular' | 'large';
  variant?: 'solid' | 'outline' | 'ghost';
  badge?: number | string;
}
```

### Cards

```typescript
// Base card component
interface CardProps {
  onPress?: () => void;
  elevation?: number;
  radius?: keyof typeof layout.radius;
  padding?: keyof typeof spacing;
  backgroundColor?: keyof typeof colors;
  children: React.ReactNode;
}

// Module card with consistent styling
interface ModuleCardProps extends CardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status?: 'available' | 'installed' | 'updating';
  actions?: ModuleAction[];
}
```

### Lists

```typescript
// List container with proper spacing
interface ListProps {
  data: any[];
  renderItem: (item: any) => React.ReactNode;
  separator?: boolean;
  padding?: keyof typeof spacing;
  refreshing?: boolean;
  onRefresh?: () => void;
}

// List item with touch feedback
interface ListItemProps extends TouchableProps {
  title: string;
  subtitle?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  chevron?: boolean;
}
```

## Module Extension Guidelines

### Creating Custom Components

1. Extend Base Components
```typescript
interface CustomModuleButton extends ButtonProps {
  moduleSpecificProp?: string;
  analytics?: ModuleAnalytics;
}
```

2. Use Theme Constants
```typescript
const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: layout.radius.md,
  }
});
```

3. Follow Touch Guidelines
```typescript
// Minimum touch target size
const MIN_TOUCH_SIZE = layout.touch.minHeight;

// Proper hit slop
const HIT_SLOP = {
  top: 8,
  bottom: 8,
  left: 8,
  right: 8,
};
```

### Component Best Practices

1. Mobile Optimization
- Use proper keyboard types
- Implement haptic feedback
- Handle safe areas
- Support gestures

2. Performance
- Memoize callbacks
- Lazy load heavy components
- Optimize renders
- Handle loading states

3. Accessibility
- Support screen readers
- Maintain contrast ratios
- Provide clear labels
- Handle reduced motion

## Usage Examples

### Basic Screen Layout
```typescript
function ExampleScreen() {
  return (
    <Container edges={['top', 'bottom']}>
      <Text variant="title">Screen Title</Text>
      <Card padding="lg">
        <Text variant="body">Card content</Text>
        <Button 
          variant="primary"
          onPress={() => {}}
          hapticFeedback="light"
        >
          Action
        </Button>
      </Card>
    </Container>
  );
}
```

### Module Integration
```typescript
function ModuleFeature() {
  return (
    <ModuleCard
      title="Feature Name"
      description="Feature description"
      icon={<FeatureIcon />}
      status="available"
      actions={[
        {
          label: "Enable",
          onPress: () => {},
          requiresAuth: true,
        }
      ]}
    />
  );
}
```

This component library provides a foundation for building consistent, mobile-optimized interfaces while allowing modules to extend and customize as needed.