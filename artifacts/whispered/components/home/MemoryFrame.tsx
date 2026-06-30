import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';

interface MemoryFrameProps {
  memory: any;
  onPress?: () => void;
}

export default function MemoryFrame({ memory, onPress }: MemoryFrameProps) {
  const colors = useColors();
  const router = useRouter();
  const floatAnimation = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    floatLoop.start();
    glowLoop.start();

    return () => {
      floatLoop.stop();
      glowLoop.stop();
    };
  }, [floatAnimation, glowAnimation]);

  const floatTransform = {
    transform: [
      {
        translateY: floatAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  };

  const glowOpacity = {
    opacity: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.6],
    }),
  };

  const getFrameColors = () => {
    return {
      outer: colors.card,
      inner: colors.background,
      accent: colors.primary,
      shadow: 'rgba(0,0,0,0.15)',
    };
  };

  const frameColors = getFrameColors();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(tabs)/memories');
    }
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Animated.View style={[floatTransform]}>
        {/* Frame shadow */}
        <View style={[styles.frameShadow, { backgroundColor: frameColors.shadow }]} />
        
        {/* Outer frame */}
        <LinearGradient
          colors={[frameColors.outer, frameColors.accent, frameColors.outer]}
          style={styles.outerFrame}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Inner frame */}
          <View style={[styles.innerFrame, { backgroundColor: frameColors.inner }]}>
            {/* Glow effect */}
            <Animated.View style={[styles.glowEffect, glowOpacity, { backgroundColor: colors.primary }]} />
            
            {/* Image or placeholder */}
            {memory?.image_url ? (
              <Image
                source={{ uri: memory.image_url }}
                style={styles.memoryImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.placeholder, { backgroundColor: colors.muted }]}>
                <View style={styles.placeholderContent}>
                  <View style={[styles.placeholderIcon, { backgroundColor: colors.primary }]} />
                  <View style={[styles.placeholderLines]}>
                    <View style={[styles.placeholderLine, { backgroundColor: colors.border }]} />
                    <View style={[styles.placeholderLine, { backgroundColor: colors.border }]} />
                  </View>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Frame details */}
        <View style={[styles.frameDetail, { backgroundColor: colors.border }]} />
        <View style={[styles.frameDetail, styles.frameDetailRight, { backgroundColor: colors.border }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: '50%',
    transform: [{ translateX: -110 }],
    width: 220,
    height: 180,
    zIndex: 10,
  },
  frameShadow: {
    position: 'absolute',
    bottom: -12,
    left: 12,
    right: -12,
    height: 12,
    borderRadius: 8,
  },
  outerFrame: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  innerFrame: {
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
  },
  memoryImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderContent: {
    alignItems: 'center',
    gap: 12,
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    opacity: 0.3,
  },
  placeholderLines: {
    gap: 8,
    alignItems: 'center',
  },
  placeholderLine: {
    width: 80,
    height: 8,
    borderRadius: 4,
    opacity: 0.5,
  },
  frameDetail: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.4,
  },
  frameDetailRight: {
    left: 'auto',
    right: 12,
  },
});
