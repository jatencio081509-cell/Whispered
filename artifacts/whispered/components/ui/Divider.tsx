import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface DividerProps {
  style?: ViewStyle;
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
}

export default function Divider({
  style,
  orientation = 'horizontal',
  thickness = 1,
}: DividerProps) {
  const colors = useColors();

  const dividerStyle: ViewStyle = {
    backgroundColor: colors.border,
  };

  if (orientation === 'horizontal') {
    dividerStyle.height = thickness;
    dividerStyle.width = '100%';
  } else {
    dividerStyle.width = thickness;
    dividerStyle.height = '100%';
  }

  return <View style={[dividerStyle, style]} />;
}
