import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

interface AvatarProps {
  uri?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: ViewStyle;
  fallbackText?: string;
}

export default function Avatar({
  uri,
  size = 'medium',
  style,
  fallbackText = '?',
}: AvatarProps) {
  const colors = useColors();

  const getSize = () => {
    const sizes = {
      small: 32,
      medium: 40,
      large: 56,
      xlarge: 72,
    };
    return sizes[size];
  };

  const avatarSize = getSize();

  return (
    <View
      style={[
        styles.container,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor: colors.muted,
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Feather name="user" size={avatarSize * 0.4} color={colors.primaryForeground} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
