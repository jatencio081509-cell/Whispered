import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();

  // Existing fade + slide animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push('/(auth)/sign-up'); // or change to your preferred next screen
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* === BEAUTIFUL CONCENTRIC GLOWING RINGS === */}
        <Rings colors={colors} />

        {/* Title & Subtitle */}
        <Text style={[styles.title, { color: colors.foreground }]}>
          Whispered
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Your private space to share what matters.
        </Text>

        {/* Get Started Button */}
        <Pressable
          onPress={handleGetStarted}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
            Get Started
          </Text>
        </Pressable>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          Already have an account?{' '}
          <Text
            onPress={() => router.push('/(auth)/sign-in')}
            style={{ color: colors.primary, fontWeight: '600' }}
          >
            Sign in
          </Text>
        </Text>
      </Animated.View>
    </View>
  );
}

// === IMPROVED CONCENTRIC GLOWING RINGS COMPONENT ===
function Rings({ colors }: { colors: ReturnType<typeof useColors> }) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2400,
            delay,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2400,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    };

    createPulse(ring1, 0);
    createPulse(ring2, 700);
    createPulse(ring3, 1400);
  }, []);

  const getRingStyle = (anim: Animated.Value, scale: number, baseOpacity: number) => ({
    position: 'absolute' as const,
    width: 200 * scale,
    height: 200 * scale,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors.primary,
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [baseOpacity, 0.12],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.88, 1.18],
        }),
      },
    ],
  });

  return (
    <View style={styles.logoArea}>
      {/* Outer ring */}
      <Animated.View style={getRingStyle(ring3, 1.32, 0.22)} />
      {/* Middle ring */}
      <Animated.View style={getRingStyle(ring2, 1.12, 0.32)} />
      {/* Inner ring */}
      <Animated.View style={getRingStyle(ring1, 1.0, 0.42)} />

      {/* Center content */}
      <View style={styles.logoCenter}>
        <Text style={{ fontSize: 48 }}>💙</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A', // or use colors.background
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logoArea: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoCenter: {
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
    maxWidth: 280,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 999,
    marginBottom: 24,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    fontSize: 15,
    textAlign: 'center',
  },
});