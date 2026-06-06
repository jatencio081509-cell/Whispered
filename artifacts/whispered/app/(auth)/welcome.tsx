import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function WelcomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo hero */}
      <Image
        source={require("@/assets/images/logo.jpeg")}
        style={styles.heroImage}
        resizeMode="cover"
      />
      {/* Gradient overlay so content reads over the image */}
      <LinearGradient
        colors={["transparent", "rgba(4,6,14,0.75)", "#04060E"]}
        style={styles.heroOverlay}
      />
      {/* Top scan line */}
      <View style={styles.scanLine} />

      <Animated.View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 36,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Spacer pushes branding + buttons toward bottom */}
        <View style={{ flex: 1 }} />

        {/* Branding */}
        <View style={styles.brandArea}>
          <Text style={styles.appName}>W H I S P E R E D</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            TOGETHER, BEYOND DISTANCE.
          </Text>
        </View>

        {/* Feature rows */}
        <View style={styles.featureList}>
          {[
            { icon: "💬", label: "Real-time private chat" },
            { icon: "✨", label: "Shared memories" },
            { icon: "🌊", label: "Whisper moments" },
            { icon: "🔥", label: "Love streaks & goals" },
          ].map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <View style={[styles.featureIconBox, { borderColor: colors.border, backgroundColor: "rgba(0,229,255,0.06)" }]}>
                <Text style={{ fontSize: 16 }}>{f.icon}</Text>
              </View>
              <Text style={[styles.featureLabel, { color: colors.mutedForeground }]}>
                {f.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.85 : 1 }]}
            onPress={() => router.push("/(auth)/sign-up")}
          >
            <LinearGradient
              colors={["#00E5FF", "#0072FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtnGradient}
            >
              <Text style={styles.primaryBtnText}>Get started</Text>
            </LinearGradient>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04060E" },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "62%",
    width: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: "30%",
    left: 0,
    right: 0,
    height: "50%",
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(0,229,255,0.35)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    gap: 24,
  },
  brandArea: { alignItems: "center", gap: 8 },
  appName: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 6,
    color: "#EEF2FF",
  },
  tagline: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  featureList: { gap: 12 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  buttons: { gap: 12 },
  primaryBtn: { borderRadius: 14, overflow: "hidden" },
  primaryBtnGradient: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#030712",
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
