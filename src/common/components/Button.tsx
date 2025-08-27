import { theme } from '@/common/styles/theme';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? theme.colors.white : theme.colors.primary}
        />
      ) : (
        <>
          {icon}
          <Text style={textStyleCombined}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  
  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  danger: {
    backgroundColor: theme.colors.error,
    borderWidth: 0,
  },
  
  // Sizes
  size_sm: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
  },
  size_md: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 48,
  },
  size_lg: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 56,
  },
  
  // Text styles
  text: {
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  text_primary: {
    color: theme.colors.textOnPrimary,
  },
  text_secondary: {
    color: theme.colors.primary,
  },
  text_ghost: {
    color: theme.colors.text,
  },
  text_danger: {
    color: theme.colors.white,
  },
  
  // Text sizes
  textSize_sm: {
    fontSize: theme.typography.fontSize.body2,
    lineHeight: theme.typography.lineHeight.body2,
  },
  textSize_md: {
    fontSize: theme.typography.fontSize.body1,
    lineHeight: theme.typography.lineHeight.body1,
  },
  textSize_lg: {
    fontSize: theme.typography.fontSize.subtitle2,
    lineHeight: theme.typography.lineHeight.subtitle2,
  },
  
  // Disabled states
  disabled: {
    opacity: 0.5,
  },
  textDisabled: {
    opacity: 0.5,
  },
});