import React from 'react';
import {
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Text,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  error?: string;
  icon?: keyof typeof Feather.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
}

export default function Input({
  value,
  onChangeText,
  placeholder,
  style,
  textStyle,
  error,
  icon,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
}: InputProps) {
  const colors = useColors();

  const getInputStyle = (): ViewStyle => {
    return {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: error ? colors.destructive : colors.border,
      backgroundColor: colors.input,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
      fontFamily: 'System',
      minHeight: multiline ? 80 : 52,
    };
  };

  return (
    <View style={style}>
      <View style={styles.inputContainer}>
        {icon && (
          <Feather
            name={icon}
            size={20}
            color={error ? colors.destructive : colors.mutedForeground}
            style={styles.icon}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          style={[getInputStyle(), icon && styles.inputWithIcon, textStyle]}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </View>
      {error && (
        <Text style={[styles.errorText, { color: colors.destructive }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'System',
  },
});
