import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import * as Haptics from 'expo-haptics';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
}

export default function Card({
  children,
  style,
  onPress,
  onLongPress,
  disabled = false,
  variant = 'default',
}: CardProps) {
  const colors = useColors();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 16,
      padding: 16,
      backgroundColor: colors.card,
    };

    const variantStyles = {
      default: {
        borderWidth: 1,
        borderColor: colors.border,
      },
      elevated: {
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
      outlined: {
        borderWidth: 2,
        borderColor: colors.primary,
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
    };
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const handleLongPress = () => {
    if (!disabled && onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    }
  };

  if (onPress || onLongPress) {
    return (
      <Pressable
        style={[getCardStyle(), style]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={disabled}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
}
