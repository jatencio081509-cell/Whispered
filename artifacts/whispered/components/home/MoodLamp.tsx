import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
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

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 1800,
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
      outputRange: [0.3, 0.7],
    }),
  };

  const pulseScale = {
    transform: [
      {
        scale: pulseAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.08],
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

  const containerStyle = position === 'left' ? styles.containerLeft : styles.containerRight;

  return (
    <View style={containerStyle}>
      <Animated.View style={pulseScale}>
        {/* Lamp glow effect */}
        <Animated.View style={[styles.lampGlow, glowOpacity, { backgroundColor: moodColor }]} />
        
        {/* Lamp base */}
        <LinearGradient
          colors={[colors.card, colors.border]}
          style={styles.lampBase}
        >
          <View style={[styles.baseDetail, { backgroundColor: colors.border }]} />
        </LinearGradient>
        
        {/* Lamp stand */}
        <View style={[styles.lampStand, { backgroundColor: colors.border }]} />
        
        {/* Lamp shade */}
        <LinearGradient
          colors={[colors.card, moodColor, colors.card]}
          style={styles.lampShade}
        >
          {/* Light source */}
          <View style={[styles.lightSource, { backgroundColor: moodColor }]} />
          
          {/* Mood indicator */}
          <View style={styles.moodIndicator}>
            <Text style={styles.moodEmoji}>{mood}</Text>
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
            <Text style={[styles.partnerLabelText, { color: colors.text }]}>Partner</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerRight: {
    position: 'absolute',
    top: 50,
    right: 24,
    zIndex: 10,
  },
  containerLeft: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 10,
  },
  lampGlow: {
    position: 'absolute',
    top: -24,
    left: -24,
    right: -24,
    bottom: -24,
    borderRadius: 48,
    opacity: 0.25,
  },
  lampBase: {
    width: 56,
    height: 20,
    borderRadius: 28,
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -28 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  baseDetail: {
    position: 'absolute',
    top: 5,
    left: 10,
    right: 10,
    height: 2,
    borderRadius: 1,
    opacity: 0.4,
  },
  lampStand: {
    width: 5,
    height: 80,
    borderRadius: 2,
    position: 'absolute',
    bottom: 18,
    left: '50%',
    transform: [{ translateX: -2.5 }],
  },
  lampShade: {
    width: 52,
    height: 52,
    borderRadius: 26,
    position: 'absolute',
    bottom: 94,
    left: '50%',
    transform: [{ translateX: -26 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightSource: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: 20,
    opacity: 0.5,
  },
  moodIndicator: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 26,
  },
  pullChain: {
    position: 'absolute',
    right: -10,
    top: 110,
    width: 2,
    height: 36,
    borderRadius: 1,
  },
  chainHandle: {
    position: 'absolute',
    bottom: -8,
    left: -5,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  partnerLabel: {
    position: 'absolute',
    bottom: -24,
    left: '50%',
    transform: [{ translateX: -24 }],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  partnerLabelText: {
    fontSize: 11,
    fontFamily: 'System',
    fontWeight: '600',
  },
});
