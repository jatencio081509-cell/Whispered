import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Image, Animated, Text } from 'react-native';
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
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnimation, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 2500,
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
          outputRange: [0, -6],
        }),
      },
      {
        scale: floatAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.02],
        }),
      },
    ],
  };

  const glowOpacity = {
    opacity: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 0.5],
    }),
  };

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
        <View style={[styles.frameShadow, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
        
        {/* Outer frame */}
        <LinearGradient
          colors={[colors.card, colors.primary, colors.card]}
          style={styles.outerFrame}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Inner frame */}
          <View style={[styles.innerFrame, { backgroundColor: colors.background }]}>
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
                  <Text style={[styles.placeholderEmoji, { color: colors.primary }]}>📸</Text>
                  <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>No memory yet</Text>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Caption overlay */}
        {memory?.caption && (
          <View style={[styles.captionOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
            <Text style={[styles.captionText, { color: '#fff' }]} numberOfLines={2}>
              {memory.caption}
            </Text>
          </View>
        )}

        {/* Frame details */}
        <View style={[styles.frameDetail, { backgroundColor: colors.primary }]} />
        <View style={[styles.frameDetail, styles.frameDetailRight, { backgroundColor: colors.primary }]} />
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
    bottom: -16,
    left: 16,
    right: -16,
    height: 16,
    borderRadius: 12,
  },
  outerFrame: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  innerFrame: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
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
    gap: 8,
  },
  placeholderEmoji: {
    fontSize: 32,
  },
  placeholderText: {
    fontSize: 12,
    fontFamily: 'System',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  captionText: {
    fontSize: 11,
    fontFamily: 'System',
    fontWeight: '500',
  },
  frameDetail: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.6,
  },
  frameDetailRight: {
    left: 'auto',
    right: 14,
  },
});
