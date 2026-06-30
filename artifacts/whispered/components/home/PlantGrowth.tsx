import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';

interface PlantGrowthProps {
  level?: number;
  onPress?: () => void;
}

export default function PlantGrowth({ level = 1, onPress }: PlantGrowthProps) {
  const colors = useColors();
  const router = useRouter();
  const swayAnimation = useRef(new Animated.Value(0)).current;
  const growAnimation = useRef(new Animated.Value(0)).current;
  const leafPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnimation, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(swayAnimation, {
          toValue: -1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    const growLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(growAnimation, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(growAnimation, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(leafPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(leafPulse, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    swayLoop.start();
    growLoop.start();
    pulseLoop.start();

    return () => {
      swayLoop.stop();
      growLoop.stop();
      pulseLoop.stop();
    };
  }, [swayAnimation, growAnimation, leafPulse]);

  const swayTransform = {
    transform: [
      {
        rotate: swayAnimation.interpolate({
          inputRange: [-1, 1],
          outputRange: ['-3deg', '3deg'],
        }),
      },
    ],
  };

  const growScale = {
    transform: [
      {
        scale: growAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.05],
        }),
      },
    ],
  };

  const leafOpacity = {
    opacity: leafPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1],
    }),
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/plant');
    }
  };

  const getPlantColors = () => {
    return {
      pot: colors.card,
      potAccent: colors.border,
      stem: colors.primary,
      leaf: colors.accent,
      leafDark: colors.primary,
      soil: colors.muted,
      border: colors.border,
      shadow: 'rgba(0,0,0,0.12)',
    };
  };

  const plantColors = getPlantColors();

  const renderSeedling = () => (
    <View style={styles.plantContainer}>
      {/* Pot */}
      <LinearGradient
        colors={[plantColors.pot, plantColors.potAccent]}
        style={styles.pot}
      >
        <View style={[styles.potRim, { backgroundColor: plantColors.potAccent }]} />
        <View style={[styles.potDetail, { backgroundColor: plantColors.border }]} />
      </LinearGradient>
      
      {/* Soil */}
      <View style={[styles.soil, { backgroundColor: plantColors.soil }]} />
      
      {/* Seedling */}
      <Animated.View style={[styles.seedling, swayTransform]}>
        <View style={[styles.stem, { backgroundColor: plantColors.stem, height: 20 }]} />
        <Animated.View style={[styles.leaf, styles.leafLeft, leafOpacity, { backgroundColor: plantColors.leaf }]} />
        <Animated.View style={[styles.leaf, styles.leafRight, leafOpacity, { backgroundColor: plantColors.leaf }]} />
      </Animated.View>
    </View>
  );

  const renderSprout = () => (
    <View style={styles.plantContainer}>
      {/* Pot */}
      <LinearGradient
        colors={[plantColors.pot, plantColors.potAccent]}
        style={[styles.pot, styles.potMedium]}
      >
        <View style={[styles.potRim, { backgroundColor: plantColors.potAccent }]} />
        <View style={[styles.potDetail, { backgroundColor: plantColors.border }]} />
      </LinearGradient>
      
      {/* Soil */}
      <View style={[styles.soil, styles.soilMedium, { backgroundColor: plantColors.soil }]} />
      
      {/* Sprout */}
      <Animated.View style={[styles.sprout, swayTransform]}>
        <View style={[styles.stem, { backgroundColor: plantColors.stem, height: 35 }]} />
        <Animated.View style={[styles.leaf, styles.leafLeft, styles.leafMedium, leafOpacity, { backgroundColor: plantColors.leaf }]} />
        <Animated.View style={[styles.leaf, styles.leafRight, styles.leafMedium, leafOpacity, { backgroundColor: plantColors.leaf }]} />
        <Animated.View style={[styles.leaf, styles.leafTop, leafOpacity, { backgroundColor: plantColors.leafDark }]} />
      </Animated.View>
    </View>
  );

  const renderSmallPlant = () => (
    <View style={styles.plantContainer}>
      {/* Pot */}
      <LinearGradient
        colors={[plantColors.pot, plantColors.potAccent]}
        style={[styles.pot, styles.potLarge]}
      >
        <View style={[styles.potRim, { backgroundColor: plantColors.potAccent }]} />
        <View style={[styles.potDetail, { backgroundColor: plantColors.border }]} />
      </LinearGradient>
      
      {/* Soil */}
      <View style={[styles.soil, styles.soilLarge, { backgroundColor: plantColors.soil }]} />
      
      {/* Small plant */}
      <Animated.View style={[styles.smallPlant, swayTransform]}>
        <View style={[styles.stem, { backgroundColor: plantColors.stem, height: 50 }]} />
        <Animated.View style={[styles.leaf, styles.leafLeft, styles.leafLarge, leafOpacity, { backgroundColor: plantColors.leaf }]} />
        <Animated.View style={[styles.leaf, styles.leafRight, styles.leafLarge, leafOpacity, { backgroundColor: plantColors.leaf }]} />
        <Animated.View style={[styles.leaf, styles.leafTop, styles.leafLarge, leafOpacity, { backgroundColor: plantColors.leafDark }]} />
        <Animated.View style={[styles.leaf, styles.leafSide, leafOpacity, { backgroundColor: plantColors.leaf }]} />
      </Animated.View>
    </View>
  );

  const renderMediumPlant = () => (
    <View style={styles.plantContainer}>
      {/* Pot */}
      <LinearGradient
        colors={[plantColors.pot, plantColors.potAccent]}
        style={[styles.pot, styles.potExtraLarge]}
      >
        <View style={[styles.potRim, { backgroundColor: plantColors.potAccent }]} />
        <View style={[styles.potDetail, { backgroundColor: plantColors.border }]} />
      </LinearGradient>
      
      {/* Soil */}
      <View style={[styles.soil, styles.soilExtraLarge, { backgroundColor: plantColors.soil }]} />
      
      {/* Medium plant */}
      <Animated.View style={[styles.mediumPlant, swayTransform]}>
        <View style={[styles.stem, { backgroundColor: plantColors.stem, height: 70 }]} />
        <Animated.View style={[styles.leaf, styles.leafLeft, styles.leafExtraLarge, leafOpacity, { backgroundColor: plantColors.leaf }]} />
        <Animated.View style={[styles.leaf, styles.leafRight, styles.leafExtraLarge, leafOpacity, { backgroundColor: plantColors.leaf }]} />
        <Animated.View style={[styles.leaf, styles.leafTop, styles.leafExtraLarge, leafOpacity, { backgroundColor: plantColors.leafDark }]} />
        <Animated.View style={[styles.leaf, styles.leafSide, styles.leafExtraLarge, leafOpacity, { backgroundColor: plantColors.leaf }]} />
        <Animated.View style={[styles.leaf, styles.leafSide2, leafOpacity, { backgroundColor: plantColors.leafDark }]} />
      </Animated.View>
    </View>
  );

  const renderLargePlant = () => (
    <View style={styles.plantContainer}>
      {/* Pot */}
      <LinearGradient
        colors={[plantColors.pot, plantColors.potAccent]}
        style={[styles.pot, styles.potExtraLarge]}
      >
        <View style={[styles.potRim, { backgroundColor: plantColors.potAccent }]} />
        <View style={[styles.potDetail, { backgroundColor: plantColors.border }]} />
      </LinearGradient>
      
      {/* Soil */}
      <View style={[styles.soil, styles.soilExtraLarge, { backgroundColor: plantColors.soil }]} />
      
      {/* Large plant */}
      <Animated.View style={[styles.largePlant, swayTransform]}>
        <View style={[styles.stem, { backgroundColor: plantColors.stem, height: 90 }]} />
        <Animated.View style={[styles.leaf, styles.leafLeft, styles.leafExtraLarge, leafOpacity, { backgroundColor: plantColors.leaf }]} />
        <Animated.View style={[styles.leaf, styles.leafRight, styles.leafExtraLarge, leafOpacity, { backgroundColor: plantColors.leaf }]} />
        <Animated.View style={[styles.leaf, styles.leafTop, styles.leafExtraLarge, leafOpacity, { backgroundColor: plantColors.leafDark }]} />
        <Animated.View style={[styles.leaf, styles.leafSide, styles.leafExtraLarge, leafOpacity, { backgroundColor: plantColors.leaf }]} />
        <Animated.View style={[styles.leaf, styles.leafSide2, styles.leafExtraLarge, leafOpacity, { backgroundColor: plantColors.leafDark }]} />
        <Animated.View style={[styles.leaf, styles.leafTop2, leafOpacity, { backgroundColor: plantColors.leaf }]} />
      </Animated.View>
    </View>
  );

  const renderPlant = () => {
    if (level === 1) return renderSeedling();
    if (level === 2) return renderSprout();
    if (level === 3) return renderSmallPlant();
    if (level === 4) return renderMediumPlant();
    return renderLargePlant();
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Animated.View style={growScale}>
        {/* Shadow */}
        <View style={[styles.plantShadow, { backgroundColor: plantColors.shadow }]} />
        
        {/* Plant */}
        {renderPlant()}
        
        {/* Growth indicator */}
        <View style={[styles.growthIndicator, { backgroundColor: colors.primary }]}>
          <View style={[styles.growthBar, { backgroundColor: colors.primaryForeground, width: `${(level / 5) * 100}%` }]} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    left: 40,
    zIndex: 10,
  },
  plantShadow: {
    position: 'absolute',
    bottom: -8,
    left: 15,
    right: 15,
    height: 8,
    borderRadius: 4,
  },
  plantContainer: {
    position: 'relative',
  },
  
  // Pot styles
  pot: {
    width: 60,
    height: 50,
    borderRadius: 10,
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -30 }],
  },
  potMedium: {
    width: 70,
    height: 55,
    transform: [{ translateX: -35 }],
  },
  potLarge: {
    width: 80,
    height: 60,
    transform: [{ translateX: -40 }],
  },
  potExtraLarge: {
    width: 90,
    height: 65,
    transform: [{ translateX: -45 }],
  },
  potRim: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    height: 8,
    borderRadius: 4,
  },
  potDetail: {
    position: 'absolute',
    top: 15,
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
    opacity: 0.3,
  },
  
  // Soil styles
  soil: {
    position: 'absolute',
    bottom: 40,
    left: '50%',
    transform: [{ translateX: -25 }],
    width: 50,
    height: 15,
    borderRadius: 8,
  },
  soilMedium: {
    bottom: 45,
    width: 55,
    transform: [{ translateX: -27.5 }],
  },
  soilLarge: {
    bottom: 50,
    width: 60,
    transform: [{ translateX: -30 }],
  },
  soilExtraLarge: {
    bottom: 55,
    width: 65,
    transform: [{ translateX: -32.5 }],
  },
  
  // Plant parts
  seedling: {
    position: 'absolute',
    bottom: 50,
    left: '50%',
    transform: [{ translateX: -3 }],
  },
  sprout: {
    position: 'absolute',
    bottom: 55,
    left: '50%',
    transform: [{ translateX: -3 }],
  },
  smallPlant: {
    position: 'absolute',
    bottom: 60,
    left: '50%',
    transform: [{ translateX: -3 }],
  },
  mediumPlant: {
    position: 'absolute',
    bottom: 65,
    left: '50%',
    transform: [{ translateX: -3 }],
  },
  largePlant: {
    position: 'absolute',
    bottom: 65,
    left: '50%',
    transform: [{ translateX: -3 }],
  },
  stem: {
    width: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -3 }],
  },
  leaf: {
    position: 'absolute',
    borderRadius: 15,
  },
  leafLeft: {
    left: -12,
    bottom: 8,
    width: 20,
    height: 12,
    transform: [{ rotate: '-30deg' }],
  },
  leafRight: {
    right: -12,
    bottom: 8,
    width: 20,
    height: 12,
    transform: [{ rotate: '30deg' }],
  },
  leafTop: {
    top: -8,
    left: '50%',
    transform: [{ translateX: -10 }],
    width: 20,
    height: 12,
  },
  leafSide: {
    left: -8,
    bottom: 20,
    width: 16,
    height: 10,
    transform: [{ rotate: '-45deg' }],
  },
  leafSide2: {
    right: -8,
    bottom: 20,
    width: 16,
    height: 10,
    transform: [{ rotate: '45deg' }],
  },
  leafTop2: {
    top: -12,
    left: '50%',
    transform: [{ translateX: -8 }],
    width: 16,
    height: 10,
  },
  leafMedium: {
    width: 24,
    height: 14,
  },
  leafLarge: {
    width: 28,
    height: 16,
  },
  leafExtraLarge: {
    width: 32,
    height: 18,
  },
  
  // Growth indicator
  growthIndicator: {
    position: 'absolute',
    bottom: -16,
    left: '50%',
    transform: [{ translateX: -30 }],
    width: 60,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  growthBar: {
    height: '100%',
    borderRadius: 2,
  },
});
