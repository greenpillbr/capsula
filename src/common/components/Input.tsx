import { theme } from '@/common/styles/theme';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  variant?: 'default' | 'outlined';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  variant = 'default',
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputContainerStyle = [
    styles.inputContainer,
    styles[variant],
    isFocused ? styles.focused : null,
    error ? styles.error : null,
  ].filter(Boolean);

  const inputStyle = [
    styles.input,
    leftIcon ? styles.inputWithLeftIcon : null,
    rightIcon ? styles.inputWithRightIcon : null,
  ].filter(Boolean);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={inputContainerStyle}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={inputStyle}
          placeholderTextColor={theme.colors.textLight}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[styles.helperText, error ? styles.errorText : null].filter(Boolean)}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.body2,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    minHeight: 48,
  },
  default: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  outlined: {
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  focused: {
    borderColor: theme.colors.primary,
  },
  error: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.body1,
    lineHeight: theme.typography.lineHeight.body1,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIconContainer: {
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.sm,
  },
  rightIconContainer: {
    paddingRight: theme.spacing.md,
    paddingLeft: theme.spacing.sm,
  },
  helperText: {
    fontSize: theme.typography.fontSize.caption,
    lineHeight: theme.typography.lineHeight.caption,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
  },
});