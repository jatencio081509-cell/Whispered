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
import { useColors } from "@/hooks/useColors";

export default function WelcomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient colors={["#04060E", "#060B1E", "#04060E"]} style={styles.container}>
      {/* Top scan line */}
      <View style={styles.scanLine} />

      <Animated.View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 60,
            paddingBottom: insets.bottom + 36,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Logo / hero — concentric glowing rings */}
        <View style={styles.logoArea}>
          <View style={styles.ringsContainer}>
            {[120, 90, 64].map((size, i) => (
              <View
                key={i}
                style={[
                  styles.ring,
                  {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderColor: `rgba(0,229,255,${0.08 + i * 0.06})`,
                  },
                ]}
              />
            ))}
            <Animated.View
              style={[
                styles.ringCore,
                {
                  backgroundColor: "rgba(0,229,255,0.08)",
                  borderColor: "rgba(0,229,255,0.4)",
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Text style={styles.coreEmoji}>💙</Text>
            </Animated.View>
          </View>

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
              <View style={[styles.featureIconBox, { borderColor: colors.border, backgroundColor: "rgba(0,229,255,0.05)" }]}>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scanLine: { position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(0,229,255,0.35)", zIndex: 10 },
  content: { flex: 1, paddingHorizontal: 28, gap: 40, justifyContent: "space-between" },
  logoArea: { alignItems: "center", gap: 20 },
  ringsContainer: { width: 120, height: 120, alignItems: "center", justifyContent: "center", position: "relative", marginBottom: 4 },
  ring: { position: "absolute", borderWidth: 1 },
  ringCore: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  coreEmoji: { fontSize: 20 },
  appName: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: 6, color: "#EEF2FF" },
  tagline: { fontSize: 11, fontFamily: "Inter_400Regular", letterSpacing: 3, textTransform: "uppercase" },
  featureList: { gap: 14 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  featureIconBox: { width: 38, height: 38, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  featureLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  buttons: { gap: 12 },
  primaryBtn: { borderRadius: 14, overflow: "hidden" },
  primaryBtnGradient: { height: 54, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#030712", letterSpacing: 0.3 },
  secondaryBtn: { height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  secondaryBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
