import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';

interface MoodLampProps {
  mood?: string;
  isPartner?: boolean;
  position?: 'left' | 'right';
}

export default function MoodLamp({ mood = '😊', isPartner = false, position = 'right' }: MoodLampProps) {
  const colors = useColors();
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    glowLoop.start();
    pulseLoop.start();

    return () => {
      glowLoop.stop();
      pulseLoop.stop();
    };
  }, [glowAnimation, pulseAnimation]);

  const glowOpacity = {
    opacity: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 0.8],
    }),
  };

  const pulseScale = {
    transform: [
      {
        scale: pulseAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1],
        }),
      },
    ],
  };

  const getMoodColor = () => {
    const moodColors: Record<string, string> = {
      '😊': colors.success,
      '😢': colors.rose,
      '😡': colors.destructive,
      '😰': colors.accent,
      '😴': colors.mutedForeground,
      '🥰': colors.primary,
      '😎': colors.tint,
      '🤔': colors.border,
      '😆': colors.primary,
      '😌': colors.accent,
    };
    return moodColors[mood] || colors.primary;
  };

  const moodColor = getMoodColor();

  const getLampColors = () => {
    return {
      base: colors.card,
      stand: colors.border,
      shade: colors.card,
      accent: colors.primary,
      shadow: 'rgba(0,0,0,0.15)',
    };
  };

  const lampColors = getLampColors();

  const containerStyle = position === 'left' ? styles.containerLeft : styles.containerRight;

  return (
    <View style={containerStyle}>
      <Animated.View style={pulseScale}>
        {/* Lamp glow effect */}
        <Animated.View style={[styles.lampGlow, glowOpacity, { backgroundColor: moodColor }]} />
        
        {/* Lamp base */}
        <LinearGradient
          colors={[lampColors.base, lampColors.stand]}
          style={styles.lampBase}
        >
          <View style={[styles.baseDetail, { backgroundColor: colors.border }]} />
        </LinearGradient>
        
        {/* Lamp stand */}
        <View style={[styles.lampStand, { backgroundColor: lampColors.stand }]} />
        
        {/* Lamp shade */}
        <LinearGradient
          colors={[lampColors.shade, moodColor, lampColors.shade]}
          style={styles.lampShade}
        >
          {/* Light source */}
          <View style={[styles.lightSource, { backgroundColor: moodColor }]} />
          
          {/* Mood indicator */}
          <View style={styles.moodIndicator}>
            <Animated.Text style={[styles.moodEmoji, { fontSize: 24 }]}>{mood}</Animated.Text>
          </View>
        </LinearGradient>
        
        {/* Lamp pull chain */}
        <View style={[styles.pullChain, { backgroundColor: colors.border }]}>
          <View style={[styles.chainHandle, { backgroundColor: colors.primary }]} />
        </View>
        
        {/* Partner label */}
        {isPartner && (
          <View style={[styles.partnerLabel, { backgroundColor: colors.card }]}>
            <View style={[styles.labelDot, { backgroundColor: moodColor }]} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerRight: {
    position: 'absolute',
    top: 60,
    right: 30,
    zIndex: 10,
  },
  containerLeft: {
    position: 'absolute',
    top: 60,
    left: 30,
    zIndex: 10,
  },
  lampGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 40,
    opacity: 0.3,
    filter: 'blur(20px)',
  },
  lampBase: {
    width: 50,
    height: 18,
    borderRadius: 25,
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -25 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  baseDetail: {
    position: 'absolute',
    top: 4,
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
    opacity: 0.3,
  },
  lampStand: {
    width: 4,
    height: 70,
    borderRadius: 2,
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: [{ translateX: -2 }],
  },
  lampShade: {
    width: 45,
    height: 45,
    borderRadius: 22,
    position: 'absolute',
    bottom: 82,
    left: '50%',
    transform: [{ translateX: -22 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightSource: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 18,
    opacity: 0.6,
  },
  moodIndicator: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 20,
  },
  pullChain: {
    position: 'absolute',
    right: -8,
    top: 100,
    width: 2,
    height: 30,
    borderRadius: 1,
  },
  chainHandle: {
    position: 'absolute',
    bottom: -6,
    left: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  partnerLabel: {
    position: 'absolute',
    bottom: -20,
    left: '50%',
    transform: [{ translateX: -20 }],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
