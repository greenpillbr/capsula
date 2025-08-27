import { theme } from '@/common/styles/theme';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

export type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  padding?: keyof typeof theme.spacing;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  padding = 'md',
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    { padding: theme.spacing[padding] },
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  default: {
    ...theme.shadows.sm,
  },
  elevated: {
    ...theme.shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.none,
  },
});