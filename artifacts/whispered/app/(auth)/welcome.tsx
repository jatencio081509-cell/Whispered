import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

export default function WelcomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={["#0B0A10", "#1A1030", "#0B0A10"]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 80,
            paddingBottom: insets.bottom + 40,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.logoArea}>
          <View
            style={[
              styles.iconRing,
              {
                borderColor: `${colors.primary}50`,
                backgroundColor: `${colors.primary}15`,
              },
            ]}
          >
            <Feather name="heart" size={42} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>Whispered</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Your private world for two
          </Text>
        </View>

        <View style={styles.featureList}>
          {[
            { icon: "message-circle" as const, label: "Real-time private chat" },
            { icon: "image" as const, label: "Shared memories" },
            { icon: "zap" as const, label: "Love streaks & goals" },
            { icon: "send" as const, label: "Whisper moments" },
          ].map((f) => (
            <View key={f.icon} style={styles.featureRow}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: `${colors.accent}20` },
                ]}
              >
                <Feather name={f.icon} size={16} color={colors.accent} />
              </View>
              <Text style={[styles.featureLabel, { color: colors.mutedForeground }]}>
                {f.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.push("/(auth)/sign-up")}
          >
            <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
              Get started
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>
              I already have an account
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  logoArea: { alignItems: "center", gap: 14 },
  iconRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  featureList: { gap: 14 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  buttons: { gap: 12 },
  primaryBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.1,
  },
  secondaryBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
});
