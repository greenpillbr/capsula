# Accessibility Guidelines for Module Developers

## Overview
These guidelines ensure that all modules provide a consistent and accessible experience for all users, regardless of their abilities or authentication method.

## Core Principles

### 1. Touch Targets

```typescript
// Minimum touch target sizes
const touchTargets = {
  primary: {
    minWidth: 44,
    minHeight: 44,
    spacing: 8
  },
  secondary: {
    minWidth: 36,
    minHeight: 36,
    spacing: 6
  }
};
```

- All interactive elements must be at least 44x44 points
- Maintain adequate spacing between touchable elements
- Provide clear visual feedback on touch
- Support both tap and long-press gestures

### 2. Visual Design

```typescript
// Contrast ratios
const contrastRatios = {
  normalText: 4.5, // Minimum for normal text
  largeText: 3.0,  // Minimum for large text
  icons: 3.0,      // Minimum for icons
  borders: 3.0     // Minimum for borders
};
```

- Follow minimum contrast ratios for WCAG AA compliance
- Support both light and dark themes
- Avoid relying solely on color for information
- Provide clear visual hierarchy

### 3. Text and Typography

```typescript
const typography = {
  minSize: 14,      // Minimum text size
  bodySize: 16,     // Standard body text
  scalingAllowed: true, // Support dynamic type
  lineHeight: 1.5   // Minimum line height
};
```

- Use minimum font sizes for readability
- Support dynamic type scaling
- Maintain proper line height and spacing
- Use clear, legible fonts

### 4. Authentication Support

```typescript
interface AccessibleAuth {
  // Support multiple auth methods
  methods: {
    passkey: boolean;
    password: boolean;
  };
  
  // Clear feedback
  feedback: {
    visual: boolean;
    haptic: boolean;
    audio?: boolean;
  };
  
  // Error handling
  errors: {
    clear: string;
    actionable: boolean;
    timeout: number;
  };
}
```

- Support both Passkey and password authentication
- Provide clear feedback during authentication
- Handle errors gracefully
- Allow sufficient time for input

### 5. Navigation and Structure

```typescript
interface NavigationGuidelines {
  // Logical flow
  structure: {
    hierarchical: boolean;
    backButton: boolean;
    skipLinks?: boolean;
  };
  
  // Focus management
  focus: {
    visible: boolean;
    restored: boolean;
    trapped: boolean;
  };
}
```

- Maintain logical navigation flow
- Provide clear back/exit options
- Manage focus appropriately
- Support keyboard navigation

### 6. Screen Readers

```typescript
interface A11yLabels {
  button: {
    action: string;
    state: string;
    hint?: string;
  };
  
  input: {
    label: string;
    error?: string;
    hint?: string;
  };
  
  modal: {
    title: string;
    description: string;
    closeAction: string;
  };
}
```

- Provide descriptive labels for all elements
- Include state information
- Use proper ARIA roles
- Support screen reader gestures

### 7. Motion and Animation

```typescript
interface MotionGuidelines {
  // Animation settings
  animation: {
    duration: number;
    reducedMotion: boolean;
    pausable: boolean;
  };
  
  // Transitions
  transitions: {
    smooth: boolean;
    skipable: boolean;
  };
}
```

- Respect reduced motion preferences
- Keep animations subtle and purposeful
- Allow animation control
- Provide non-animated alternatives

### 8. Error Prevention

```typescript
interface ErrorPrevention {
  // Input validation
  validation: {
    immediate: boolean;
    clear: boolean;
    recoverable: boolean;
  };
  
  // Confirmation
  confirmation: {
    destructive: boolean;
    timeout: number;
    reversible: boolean;
  };
}
```

- Validate input in real-time
- Provide clear error messages
- Allow error recovery
- Confirm destructive actions

## Implementation Examples

### 1. Accessible Button Component

```typescript
interface AccessibleButtonProps {
  // Core props
  label: string;
  onPress: () => void;
  
  // A11y props
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link';
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    busy?: boolean;
    expanded?: boolean;
  };
  
  // Visual props
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  label,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  variant = 'primary',
  size = 'medium',
  icon
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        styles[variant],
        styles[size],
        accessibilityState?.disabled && styles.disabled
      ]}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      minPressDuration={0}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.label, styles[`${variant}Label`]]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};
```

### 2. Accessible Form Input

```typescript
interface AccessibleInputProps {
  // Core props
  value: string;
  onChangeText: (text: string) => void;
  
  // A11y props
  label: string;
  error?: string;
  hint?: string;
  
  // Input props
  type?: 'text' | 'password' | 'email' | 'number';
  autoComplete?: 'off' | 'password';
  maxLength?: number;
}

const AccessibleInput: React.FC<AccessibleInputProps> = ({
  value,
  onChangeText,
  label,
  error,
  hint,
  type = 'text',
  autoComplete,
  maxLength
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      accessible={true}
      accessibilityLabel={`${label} input field${error ? `, Error: ${error}` : ''}`}
    >
      <Text style={[styles.label, error && styles.errorLabel]}>
        {label}
      </Text>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          isFocused && styles.focused,
          error && styles.errorInput
        ]}
        secureTextEntry={type === 'password'}
        keyboardType={type === 'number' ? 'numeric' : 'default'}
        autoComplete={autoComplete}
        maxLength={maxLength}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessibilityHint={hint}
        accessibilityState={{
          error: !!error,
          disabled: false
        }}
      />
      {error && (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text style={styles.hintText}>
          {hint}
        </Text>
      )}
    </View>
  );
};
```

### 3. Accessible Modal

```typescript
interface AccessibleModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const AccessibleModal: React.FC<AccessibleModalProps> = ({
  visible,
  onClose,
  title,
  children
}) => {
  const modalRef = useRef<View>(null);

  useEffect(() => {
    if (visible) {
      // Trap focus within modal
      modalRef.current?.focus();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
    >
      <View
        style={styles.overlay}
        accessible={true}
        accessibilityViewIsModal={true}
        accessibilityLabel={title}
        ref={modalRef}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Close modal"
              accessibilityRole="button"
              style={styles.closeButton}
            >
              <Text>✕</Text>
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};
```

## Testing Guidelines

### 1. Manual Testing

- Test with VoiceOver/TalkBack enabled
- Verify all touch targets are adequate
- Check color contrast ratios
- Test with different text sizes
- Verify focus management
- Test without animations

### 2. Automated Testing

```typescript
describe('Accessibility Tests', () => {
  it('should have proper accessibility props', () => {
    const { getByRole } = render(<YourComponent />);
    
    const button = getByRole('button');
    expect(button).toHaveAccessibilityLabel();
    expect(button).toHaveAccessibilityHint();
  });

  it('should handle focus properly', () => {
    const { getByTestId } = render(<YourComponent />);
    
    const input = getByTestId('input');
    fireEvent.focus(input);
    expect(input).toHaveFocus();
  });

  it('should announce errors', () => {
    const { getByText } = render(<YourComponent error="Invalid input" />);
    
    const error = getByText('Invalid input');
    expect(error).toHaveAccessibilityLiveRegion('polite');
  });
});
```

### 3. Device Testing

- Test on different screen sizes
- Test with different OS versions
- Test with different accessibility settings
- Test with different input methods

## Resources

1. React Native Accessibility API
   - [Documentation](https://reactnative.dev/docs/accessibility)
   - [Components](https://reactnative.dev/docs/accessibility#accessibility-properties)

2. WCAG Guidelines
   - [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
   - [Mobile Accessibility](https://www.w3.org/WAI/standards-guidelines/mobile/)

3. Testing Tools
   - [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
   - [Jest Accessibility Matchers](https://github.com/testing-library/jest-dom#custom-matchers)

Remember: Accessibility is not a feature, it's a requirement. All modules must follow these guidelines to ensure a consistent and inclusive experience for all users.