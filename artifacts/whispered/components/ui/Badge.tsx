import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Badge({
  text,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
}: BadgeProps) {
  const colors = useColors();

  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignSelf: 'flex-start',
    };

    const sizeStyles = {
      small: { paddingHorizontal: 8, paddingVertical: 4 },
      medium: { paddingHorizontal: 12, paddingVertical: 6 },
      large: { paddingHorizontal: 16, paddingVertical: 8 },
    };

    const variantStyles = {
      default: {
        backgroundColor: colors.muted,
      },
      primary: {
        backgroundColor: `${colors.primary}20`,
      },
      success: {
        backgroundColor: `${colors.success}20`,
      },
      warning: {
        backgroundColor: `${colors.accent}20`,
      },
      destructive: {
        backgroundColor: `${colors.destructive}20`,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      fontFamily: 'System',
    };

    const sizeStyles = {
      small: { fontSize: 10 },
      medium: { fontSize: 12 },
      large: { fontSize: 14 },
    };

    const variantStyles = {
      default: { color: colors.mutedForeground },
      primary: { color: colors.primary },
      success: { color: colors.success },
      warning: { color: colors.accent },
      destructive: { color: colors.destructive },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text style={[getTextStyle(), textStyle]}>{text}</Text>
    </View>
  );
}
