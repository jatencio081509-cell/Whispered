import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';

interface PetCompanionProps {
  petType?: 'cat' | 'dog' | 'fish';
  level?: number;
  onPress?: () => void;
}

export default function PetCompanion({ petType = 'dog', level = 1, onPress }: PetCompanionProps) {
  const colors = useColors();
  const router = useRouter();
  const bounceAnimation = useRef(new Animated.Value(0)).current;
  const tailWag = useRef(new Animated.Value(0)).current;
  const blinkAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    const wagLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tailWag, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(tailWag, {
          toValue: -1,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    );

    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
      ])
    );

    bounceLoop.start();
    wagLoop.start();
    blinkLoop.start();

    return () => {
      bounceLoop.stop();
      wagLoop.stop();
      blinkLoop.stop();
    };
  }, [bounceAnimation, tailWag, blinkAnimation]);

  const bounceTransform = {
    transform: [
      {
        translateY: bounceAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
    ],
  };

  const tailTransform = {
    transform: [
      {
        rotate: tailWag.interpolate({
          inputRange: [-1, 1],
          outputRange: ['-15deg', '15deg'],
        }),
      },
    ],
  };

  const blinkScale = {
    scaleY: blinkAnimation,
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/pet');
    }
  };

  const getPetColors = () => {
    return {
      body: colors.card,
      accent: colors.primary,
      secondary: colors.accent,
      shadow: 'rgba(0,0,0,0.12)',
    };
  };

  const petColors = getPetColors();

  const renderDog = () => (
    <View style={styles.petContainer}>
      {/* Body */}
      <LinearGradient
        colors={[petColors.body, petColors.accent]}
        style={styles.dogBody}
      >
        {/* Head */}
        <View style={[styles.dogHead, { backgroundColor: petColors.body }]}>
          {/* Ears */}
          <View style={[styles.dogEar, styles.dogEarLeft, { backgroundColor: petColors.secondary }]} />
          <View style={[styles.dogEar, styles.dogEarRight, { backgroundColor: petColors.secondary }]} />
          
          {/* Face */}
          <View style={styles.dogFace}>
            {/* Eyes */}
            <Animated.View style={[styles.dogEye, blinkScale]}>
              <View style={[styles.dogPupil, { backgroundColor: colors.text }]} />
            </Animated.View>
            <Animated.View style={[styles.dogEye, styles.dogEyeRight, blinkScale]}>
              <View style={[styles.dogPupil, { backgroundColor: colors.text }]} />
            </Animated.View>
            
            {/* Nose */}
            <View style={[styles.dogNose, { backgroundColor: colors.text }]} />
            
            {/* Mouth */}
            <View style={[styles.dogMouth, { backgroundColor: colors.border }]} />
          </View>
        </View>

        {/* Tail */}
        <Animated.View style={[styles.dogTail, tailTransform, { backgroundColor: petColors.secondary }]} />
        
        {/* Legs */}
        <View style={[styles.dogLeg, styles.dogLegFrontLeft, { backgroundColor: petColors.body }]} />
        <View style={[styles.dogLeg, styles.dogLegFrontRight, { backgroundColor: petColors.body }]} />
        <View style={[styles.dogLeg, styles.dogLegBackLeft, { backgroundColor: petColors.body }]} />
        <View style={[styles.dogLeg, styles.dogLegBackRight, { backgroundColor: petColors.body }]} />
      </LinearGradient>
    </View>
  );

  const renderCat = () => (
    <View style={styles.petContainer}>
      {/* Body */}
      <LinearGradient
        colors={[petColors.body, petColors.accent]}
        style={styles.catBody}
      >
        {/* Head */}
        <View style={[styles.catHead, { backgroundColor: petColors.body }]}>
          {/* Ears */}
          <View style={[styles.catEar, styles.catEarLeft, { backgroundColor: petColors.secondary }]} />
          <View style={[styles.catEar, styles.catEarRight, { backgroundColor: petColors.secondary }]} />
          
          {/* Face */}
          <View style={styles.catFace}>
            {/* Eyes */}
            <Animated.View style={[styles.catEye, blinkScale]}>
              <View style={[styles.catPupil, { backgroundColor: colors.text }]} />
            </Animated.View>
            <Animated.View style={[styles.catEye, styles.catEyeRight, blinkScale]}>
              <View style={[styles.catPupil, { backgroundColor: colors.text }]} />
            </Animated.View>
            
            {/* Nose */}
            <View style={[styles.catNose, { backgroundColor: colors.rose }]} />
            
            {/* Whiskers */}
            <View style={[styles.catWhisker, styles.catWhiskerLeft, { backgroundColor: colors.border }]} />
            <View style={[styles.catWhisker, styles.catWhiskerRight, { backgroundColor: colors.border }]} />
          </View>
        </View>

        {/* Tail */}
        <Animated.View style={[styles.catTail, tailTransform, { backgroundColor: petColors.secondary }]} />
        
        {/* Legs */}
        <View style={[styles.catLeg, styles.catLegFrontLeft, { backgroundColor: petColors.body }]} />
        <View style={[styles.catLeg, styles.catLegFrontRight, { backgroundColor: petColors.body }]} />
        <View style={[styles.catLeg, styles.catLegBackLeft, { backgroundColor: petColors.body }]} />
        <View style={[styles.catLeg, styles.catLegBackRight, { backgroundColor: petColors.body }]} />
      </LinearGradient>
    </View>
  );

  const renderFish = () => (
    <View style={styles.petContainer}>
      {/* Fish bowl */}
      <View style={[styles.fishBowl, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Water */}
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          style={styles.fishWater}
        >
          {/* Fish body */}
          <Animated.View style={[styles.fishBody, bounceTransform, { backgroundColor: petColors.body }]}>
            {/* Fish tail */}
            <Animated.View style={[styles.fishTail, tailTransform, { backgroundColor: petColors.secondary }]} />
            
            {/* Fish face */}
            <View style={styles.fishFace}>
              <Animated.View style={[styles.fishEye, blinkScale]}>
                <View style={[styles.fishPupil, { backgroundColor: colors.text }]} />
              </Animated.View>
              <View style={[styles.fishMouth, { backgroundColor: colors.border }]} />
            </View>
            
            {/* Fish fins */}
            <View style={[styles.fishFin, styles.fishFinTop, { backgroundColor: petColors.secondary }]} />
            <View style={[styles.fishFin, styles.fishFinSide, { backgroundColor: petColors.secondary }]} />
          </Animated.View>
          
          {/* Bubbles */}
          <View style={[styles.bubble, styles.bubble1, { backgroundColor: colors.primary }]} />
          <View style={[styles.bubble, styles.bubble2, { backgroundColor: colors.primary }]} />
        </LinearGradient>
      </View>
    </View>
  );

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Animated.View style={bounceTransform}>
        {/* Shadow */}
        <View style={[styles.petShadow, { backgroundColor: petColors.shadow }]} />
        
        {/* Pet */}
        {petType === 'cat' ? renderCat() : petType === 'fish' ? renderFish() : renderDog()}
        
        {/* Level indicator */}
        <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
          <View style={[styles.levelDot, { backgroundColor: colors.primaryForeground }]} />
          <View style={[styles.levelDot, { backgroundColor: level >= 2 ? colors.primaryForeground : colors.border }]} />
          <View style={[styles.levelDot, { backgroundColor: level >= 3 ? colors.primaryForeground : colors.border }]} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    right: 40,
    zIndex: 10,
  },
  petShadow: {
    position: 'absolute',
    bottom: -8,
    left: 20,
    right: 20,
    height: 8,
    borderRadius: 4,
  },
  petContainer: {
    position: 'relative',
  },
  
  // Dog styles
  dogBody: {
    width: 80,
    height: 60,
    borderRadius: 40,
    position: 'relative',
  },
  dogHead: {
    position: 'absolute',
    top: -20,
    left: 10,
    width: 50,
    height: 45,
    borderRadius: 25,
  },
  dogEar: {
    position: 'absolute',
    width: 18,
    height: 25,
    borderRadius: 12,
    top: -8,
  },
  dogEarLeft: {
    left: 2,
    transform: [{ rotate: '-20deg' }],
  },
  dogEarRight: {
    right: 2,
    transform: [{ rotate: '20deg' }],
  },
  dogFace: {
    position: 'absolute',
    top: 12,
    left: 8,
    right: 8,
    bottom: 8,
  },
  dogEye: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    top: 4,
    left: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dogEyeRight: {
    left: 'auto',
    right: 4,
  },
  dogPupil: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dogNose: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    transform: [{ translateX: -6 }],
    width: 12,
    height: 8,
    borderRadius: 6,
  },
  dogMouth: {
    position: 'absolute',
    bottom: 2,
    left: '50%',
    transform: [{ translateX: -8 }],
    width: 16,
    height: 4,
    borderRadius: 2,
  },
  dogTail: {
    position: 'absolute',
    right: -8,
    top: 10,
    width: 20,
    height: 8,
    borderRadius: 4,
    transformOrigin: 'left center',
  },
  dogLeg: {
    position: 'absolute',
    width: 12,
    height: 20,
    borderRadius: 6,
    bottom: -12,
  },
  dogLegFrontLeft: {
    left: 12,
  },
  dogLegFrontRight: {
    left: 28,
  },
  dogLegBackLeft: {
    right: 28,
  },
  dogLegBackRight: {
    right: 12,
  },
  
  // Cat styles
  catBody: {
    width: 70,
    height: 50,
    borderRadius: 35,
    position: 'relative',
  },
  catHead: {
    position: 'absolute',
    top: -18,
    left: 8,
    width: 45,
    height: 40,
    borderRadius: 22,
  },
  catEar: {
    position: 'absolute',
    width: 14,
    height: 20,
    borderRadius: 8,
    top: -10,
  },
  catEarLeft: {
    left: 4,
    transform: [{ rotate: '-15deg' }],
  },
  catEarRight: {
    right: 4,
    transform: [{ rotate: '15deg' }],
  },
  catFace: {
    position: 'absolute',
    top: 10,
    left: 6,
    right: 6,
    bottom: 6,
  },
  catEye: {
    position: 'absolute',
    width: 12,
    height: 14,
    borderRadius: 6,
    backgroundColor: '#fff',
    top: 2,
    left: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catEyeRight: {
    left: 'auto',
    right: 3,
  },
  catPupil: {
    width: 4,
    height: 8,
    borderRadius: 2,
  },
  catNose: {
    position: 'absolute',
    bottom: 6,
    left: '50%',
    transform: [{ translateX: -5 }],
    width: 10,
    height: 6,
    borderRadius: 5,
  },
  catWhisker: {
    position: 'absolute',
    width: 20,
    height: 1,
    bottom: 2,
  },
  catWhiskerLeft: {
    left: -12,
  },
  catWhiskerRight: {
    right: -12,
  },
  catTail: {
    position: 'absolute',
    right: -6,
    top: 8,
    width: 18,
    height: 6,
    borderRadius: 3,
    transformOrigin: 'left center',
  },
  catLeg: {
    position: 'absolute',
    width: 10,
    height: 16,
    borderRadius: 5,
    bottom: -10,
  },
  catLegFrontLeft: {
    left: 10,
  },
  catLegFrontRight: {
    left: 24,
  },
  catLegBackLeft: {
    right: 24,
  },
  catLegBackRight: {
    right: 10,
  },
  
  // Fish styles
  fishBowl: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    overflow: 'hidden',
  },
  fishWater: {
    flex: 1,
    position: 'relative',
  },
  fishBody: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: [{ translateX: -25 }],
    width: 50,
    height: 30,
    borderRadius: 25,
  },
  fishTail: {
    position: 'absolute',
    right: -12,
    top: 8,
    width: 16,
    height: 14,
    borderRadius: 8,
    transformOrigin: 'left center',
  },
  fishFace: {
    position: 'absolute',
    left: 8,
    top: 6,
  },
  fishEye: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fishPupil: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  fishMouth: {
    position: 'absolute',
    bottom: -4,
    left: 2,
    width: 6,
    height: 3,
    borderRadius: 2,
  },
  fishFin: {
    position: 'absolute',
    width: 12,
    height: 8,
    borderRadius: 6,
  },
  fishFinTop: {
    top: -6,
    left: 18,
  },
  fishFinSide: {
    left: -4,
    top: 10,
    transform: [{ rotate: '-30deg' }],
  },
  bubble: {
    position: 'absolute',
    borderRadius: 4,
    opacity: 0.4,
  },
  bubble1: {
    width: 8,
    height: 8,
    right: 12,
    bottom: 20,
  },
  bubble2: {
    width: 5,
    height: 5,
    right: 20,
    bottom: 35,
  },
  
  // Level badge
  levelBadge: {
    position: 'absolute',
    bottom: -12,
    left: '50%',
    transform: [{ translateX: -24 }],
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
