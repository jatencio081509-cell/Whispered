import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import * as Haptics from "expo-haptics";

export default function LinkPartnerScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getToken } = useAuth();
  const { setCouple } = useApp();

  const [tab, setTab] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [coupleCode, setCoupleCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  const baseUrl = domain ? `https://${domain}` : "";

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleCreate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true); setError("");
    try {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/api/couple/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ displayName: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setCouple(data);
      setCoupleCode(data.inviteCode);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setIsLoading(false); }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true); setError("");
    try {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/api/couple/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ inviteCode: joinCode.trim().toUpperCase(), displayName: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setCouple(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid code");
    } finally { setIsLoading(false); }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.scanLine} />

      {/* Ambient background glow */}
      <LinearGradient
        colors={["rgba(0,229,255,0.04)", "transparent"]}
        style={styles.ambientGlow}
      />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={[
            styles.inner,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.header}>
            <View style={styles.ringsWrap}>
              {[104, 76, 52].map((s, i) => (
                <View
                  key={i}
                  style={[styles.ring, { width: s, height: s, borderRadius: s / 2, borderColor: `rgba(0,229,255,${0.07 + i * 0.06})` }]}
                />
              ))}
              <Animated.View
                style={[
                  styles.ringCore,
                  { backgroundColor: "rgba(0,229,255,0.08)", borderColor: "rgba(0,229,255,0.4)", transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Text style={{ fontSize: 22 }}>🔗</Text>
              </Animated.View>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Connect with your partner</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Share an invite code or enter theirs to link your accounts
            </Text>
          </View>

          {/* Name field */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Your name (shown to partner)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={name}
              onChangeText={setName}
              placeholder="Your nickname"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="words"
            />
          </View>

          {/* Tab bar */}
          <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {(["create", "join"] as const).map((t) => (
              <Pressable
                key={t}
                style={[styles.tabItem, tab === t && styles.tabItemActive]}
                onPress={() => { setTab(t); setError(""); setCoupleCode(""); }}
              >
                {tab === t ? (
                  <LinearGradient
                    colors={["#00E5FF", "#0072FF"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.tabGradient}
                  >
                    <Text style={styles.tabTextActive}>
                      {t === "create" ? "Create couple" : "Join with code"}
                    </Text>
                  </LinearGradient>
                ) : (
                  <Text style={[styles.tabTextInactive, { color: colors.mutedForeground }]}>
                    {t === "create" ? "Create couple" : "Join with code"}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>

          {/* Panel */}
          {tab === "create" ? (
            <View style={styles.panel}>
              {coupleCode ? (
                /* ── Code revealed state ── */
                <View style={styles.codeReveal}>
                  <Text style={[styles.codeRevealLabel, { color: colors.mutedForeground }]}>
                    Your invite code
                  </Text>
                  <View style={[styles.codeBox, { borderColor: "rgba(0,229,255,0.3)", backgroundColor: "rgba(0,229,255,0.06)" }]}>
                    {/* Ripple decorations */}
                    {[140, 105].map((s, i) => (
                      <View
                        key={i}
                        style={[styles.codeRipple, { width: s, height: s, borderRadius: s / 2, borderColor: `rgba(0,229,255,${0.06 + i * 0.04})` }]}
                      />
                    ))}
                    <Text style={[styles.codeText, { color: colors.primary }]}>{coupleCode}</Text>
                  </View>
                  <Text style={[styles.codeHint, { color: colors.mutedForeground }]}>
                    Share this code with your partner so they can join 🌊
                  </Text>
                  <Pressable
                    style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.85 : 1 }]}
                    onPress={() => router.replace("/(tabs)")}
                  >
                    <LinearGradient colors={["#00E5FF", "#0072FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtnGradient}>
                      <Text style={styles.primaryBtnText}>Continue to app</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              ) : (
                /* ── Create state ── */
                <>
                  <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                    Create your couple and get an invite code to share with your partner.
                  </Text>
                  {error ? (
                    <View style={[styles.errorBox, { backgroundColor: `${colors.destructive}12`, borderColor: `${colors.destructive}30` }]}>
                      <Feather name="alert-circle" size={14} color={colors.destructive} />
                      <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
                    </View>
                  ) : null}
                  <Pressable
                    style={({ pressed }) => [styles.primaryBtn, { opacity: isLoading || pressed ? 0.7 : 1 }]}
                    onPress={handleCreate}
                    disabled={isLoading}
                  >
                    <LinearGradient colors={["#00E5FF", "#0072FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtnGradient}>
                      {isLoading
                        ? <ActivityIndicator color="#030712" />
                        : <Text style={styles.primaryBtnText}>Generate invite code</Text>}
                    </LinearGradient>
                  </Pressable>
                </>
              )}
            </View>
          ) : (
            /* ── Join panel ── */
            <View style={styles.panel}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Enter your partner's code</Text>
              <TextInput
                style={[styles.input, styles.joinCodeInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.primary }]}
                value={joinCode}
                onChangeText={(t) => setJoinCode(t.toUpperCase())}
                placeholder="XXXXXX"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="characters"
                maxLength={6}
                textAlign="center"
                autoFocus
              />
              {error ? (
                <View style={[styles.errorBox, { backgroundColor: `${colors.destructive}12`, borderColor: `${colors.destructive}30` }]}>
                  <Feather name="alert-circle" size={14} color={colors.destructive} />
                  <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
                </View>
              ) : null}
              <Pressable
                style={({ pressed }) => [styles.primaryBtn, { opacity: joinCode.length < 6 || isLoading || pressed ? 0.6 : 1 }]}
                onPress={handleJoin}
                disabled={joinCode.length < 6 || isLoading}
              >
                <LinearGradient colors={["#00E5FF", "#0072FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtnGradient}>
                  {isLoading
                    ? <ActivityIndicator color="#030712" />
                    : <Text style={styles.primaryBtnText}>Join couple</Text>}
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {/* Skip */}
          <Pressable style={styles.skipBtn} onPress={() => router.replace("/(tabs)")}>
            <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Skip for now</Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scanLine: { position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(0,229,255,0.35)", zIndex: 10 },
  ambientGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 280 },
  inner: { paddingHorizontal: 24, gap: 24 },

  header: { alignItems: "center", gap: 16 },
  ringsWrap: { width: 104, height: 104, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  ring: { position: "absolute", borderWidth: 1 },
  ringCore: { width: 46, height: 46, borderRadius: 23, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", textAlign: "center", letterSpacing: -0.4 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },

  field: { gap: 8 },
  label: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 1.5, textTransform: "uppercase" },
  input: { height: 52, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 15, fontFamily: "Inter_400Regular" },

  tabBar: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 4, gap: 4 },
  tabItem: { flex: 1, borderRadius: 10, overflow: "hidden" },
  tabItemActive: {},
  tabGradient: { height: 40, alignItems: "center", justifyContent: "center" },
  tabTextActive: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#030712" },
  tabTextInactive: { fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "center", lineHeight: 40 },

  panel: { gap: 16 },
  hint: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  primaryBtn: { borderRadius: 14, overflow: "hidden" },
  primaryBtnGradient: { height: 54, alignItems: "center", justifyContent: "center" },
  primaryBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#030712", letterSpacing: 0.2 },

  codeReveal: { alignItems: "center", gap: 16 },
  codeRevealLabel: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 1.5, textTransform: "uppercase" },
  codeBox: { width: "100%", alignItems: "center", justifyContent: "center", paddingVertical: 28, borderRadius: 20, borderWidth: 1.5, overflow: "hidden", position: "relative" },
  codeRipple: { position: "absolute", borderWidth: 1 },
  codeText: { fontSize: 38, fontFamily: "Inter_700Bold", letterSpacing: 8 },
  codeHint: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },

  joinCodeInput: { height: 68, fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: 8, borderRadius: 14 },

  skipBtn: { alignItems: "center", paddingVertical: 8 },
  skipText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
