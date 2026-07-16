import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

interface RoomBackgroundProps {
  children: React.ReactNode;
}

export default function RoomBackground({ children }: RoomBackgroundProps) {
  const colors = useColors();
  const { theme } = useApp();
  const ambientGlow = useRef(new Animated.Value(0)).current;
  const wallTexture = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ambientLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ambientGlow, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(ambientGlow, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    );

    const textureLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(wallTexture, {
          toValue: 1,
          duration: 7000,
          useNativeDriver: true,
        }),
        Animated.timing(wallTexture, {
          toValue: 0,
          duration: 7000,
          useNativeDriver: true,
        }),
      ])
    );

    ambientLoop.start();
    textureLoop.start();

    return () => {
      ambientLoop.stop();
      textureLoop.stop();
    };
  }, [ambientGlow, wallTexture]);

  const ambientPulse = {
    opacity: ambientGlow.interpolate({
      inputRange: [0, 1],
      outputRange: [0.25, 0.45],
    }),
  };

  const textureShift = {
    opacity: wallTexture.interpolate({
      inputRange: [0, 1],
      outputRange: [0.08, 0.15],
    }),
  };

  const getWallGradient = () => {
    switch (theme) {
      case 'ocean':
        return ['#E8F4F8', '#D1E8F0', '#C5E0E8'];
      case 'romance':
        return ['#FFF5F7', '#FCE8EC', '#F8DDE4'];
      case 'futuristic':
        return ['#0A1520', '#0D1A2A', '#081018'];
      case 'simplistic':
        return ['#F8F8F6', '#F0F0EC', '#F5F5F2'];
      case 'nature':
        return ['#F2F6E8', '#E8EED8', '#F0F4DC'];
      default:
        return ['#F5F5F5', '#E8E8E8', '#F0F0F0'];
    }
  };

  const getFloorGradient = () => {
    switch (theme) {
      case 'ocean':
        return ['#D4E8F0', '#C8DCE8', '#B8D0E0'];
      case 'romance':
        return ['#F8E8EC', '#F0D8E0', '#E8D0D8'];
      case 'futuristic':
        return ['#0D1A2A', '#0A1520', '#081218'];
      case 'simplistic':
        return ['#ECECE8', '#E4E4E0', '#E8E8E4'];
      case 'nature':
        return ['#E8EED8', '#DCE8D0', '#E0E6D4'];
      default:
        return ['#E8E8E8', '#E0E0E0', '#E4E4E4'];
    }
  };

  const getAmbientColor = () => {
    switch (theme) {
      case 'ocean':
        return 'rgba(2, 132, 199, 0.12)';
      case 'romance':
        return 'rgba(190, 24, 93, 0.1)';
      case 'futuristic':
        return 'rgba(0, 229, 255, 0.08)';
      case 'simplistic':
        return 'rgba(64, 64, 64, 0.06)';
      case 'nature':
        return 'rgba(63, 125, 32, 0.08)';
      default:
        return 'rgba(128, 128, 128, 0.08)';
    }
  };

  return (
    <View style={styles.container}>
      {/* Wall */}
      <LinearGradient
        colors={getWallGradient() as any}
        style={styles.wall}
      />
      
      {/* Ambient lighting */}
      <Animated.View style={[styles.ambientLight, ambientPulse, { backgroundColor: getAmbientColor() }]} />
      
      {/* Wall texture overlay */}
      <Animated.View style={[styles.wallTexture, textureShift]} />
      
      {/* Floor */}
      <LinearGradient
        colors={getFloorGradient() as any}
        style={styles.floor}
      />
      
      {/* Floor shadow */}
      <View style={[styles.floorShadow, { backgroundColor: 'rgba(0,0,0,0.06)' }]} />
      
      {/* Room content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  wall: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  ambientLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '70%',
    pointerEvents: 'none',
  },
  wallTexture: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: 'rgba(0,0,0,0.015)',
    pointerEvents: 'none',
  },
  floor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  floorShadow: {
    position: 'absolute',
    bottom: '30%',
    left: 0,
    right: 0,
    height: 24,
    pointerEvents: 'none',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
