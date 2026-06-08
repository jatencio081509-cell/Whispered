import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/expo";
import { useColors } from "@/hooks/useColors";
import { useApp, type Mood } from "@/context/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const MOODS: { key: Mood; label: string; icon: string }[] = [
  { key: "loved", label: "Loved", icon: "heart" },
  { key: "happy", label: "Happy", icon: "sun" },
  { key: "calm", label: "Calm", icon: "cloud" },
  { key: "okay", label: "Okay", icon: "meh" },
  { key: "sad", label: "Sad", icon: "cloud-rain" },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

function daysSince(dateStr: string): number {
  const start = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { couple, myMood, setMyMood, partnerMood, streak } = useApp();
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [recentMsg, setRecentMsg] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("lastMessage").then((m) => { if (m) setRecentMsg(m); });
  }, []);

  const days = couple?.startDate ? daysSince(couple.startDate) : 0;
  const firstName = user?.firstName || user?.username || "you";
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const selectMood = (m: Mood) => {
    setMyMood(m);
    setShowMoodPicker(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Ambient glow */}
      <View style={styles.ambientGlow} />
      <View style={styles.scanLine} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.inner, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greet, { color: colors.mutedForeground }]}>{greeting()}</Text>
            <Text style={[styles.name, { color: colors.text }]}>{firstName}</Text>
          </View>
          <Pressable
            onPress={() => router.push("/settings")}
            hitSlop={12}
            style={[styles.settingsBtn, { backgroundColor: "rgba(0,229,255,0.06)", borderColor: colors.border, borderWidth: 1 }]}
          >
            <Feather name="settings" size={18} color={colors.primary} />
          </Pressable>
        </View>

        {/* Hero card — concentric ripple rings */}
        {couple?.startDate ? (
          <View style={[styles.heroCard, { borderColor: "rgba(0,229,255,0.14)" }]}>
            <LinearGradient
              colors={["#040C1E", "#071428", "#0A0620"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            {/* Ripple rings */}
            {[120, 90, 62].map((s, i) => (
              <View
                key={i}
                style={[
                  styles.rippleRing,
                  {
                    width: s, height: s,
                    borderColor: `rgba(0,229,255,${0.06 + i * 0.04})`,
                    top: "50%", right: -s / 3,
                    marginTop: -s / 2,
                  },
                ]}
              />
            ))}
            <View style={styles.heroContent}>
              <Text style={[styles.heroLabel, { color: "rgba(0,229,255,0.6)" }]}>
                YOU & {couple.partnerDisplayName?.toUpperCase() || "PARTNER"}
              </Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                {days} days{"\n"}together 🌊
              </Text>
              {couple.isLinked && couple.partnerDisplayName ? (
                <View style={[styles.partnerPill, { backgroundColor: "rgba(0,229,255,0.08)", borderColor: "rgba(0,229,255,0.22)" }]}>
                  <View style={[styles.partnerDot, { backgroundColor: colors.success, shadowColor: colors.success }]} />
                  <Text style={[styles.partnerPillText, { color: "rgba(0,229,255,0.9)" }]}>
                    {couple.partnerDisplayName} is near
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={[styles.heroBadge, { backgroundColor: "rgba(0,229,255,0.07)", borderColor: "rgba(0,229,255,0.18)" }]}>
              <Text style={{ fontSize: 18 }}>💙</Text>
            </View>
          </View>
        ) : (
          <Pressable
            style={[styles.linkCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/(auth)/link-partner")}
          >
            <Feather name="link" size={20} color={colors.primary} />
            <Text style={[styles.linkText, { color: colors.text }]}>Connect with your partner</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 18 }}>🌊</Text>
            <Text style={[styles.statNum, { color: colors.text }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>streak</Text>
          </View>
          <Pressable
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowMoodPicker(!showMoodPicker)}
          >
            <Feather name={myMood ? "smile" : "plus-circle"} size={18} color={myMood ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.statNum, { color: colors.text }]}>{myMood || "—"}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>my mood</Text>
          </Pressable>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 18 }}>💗</Text>
            <Text style={[styles.statNum, { color: colors.text }]}>{partnerMood || "—"}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>partner</Text>
          </View>
        </View>

        {/* Mood Picker */}
        {showMoodPicker ? (
          <View style={[styles.moodPicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.moodPickerTitle, { color: colors.mutedForeground }]}>How are you feeling?</Text>
            <View style={styles.moodRow}>
              {MOODS.map((m) => (
                <Pressable
                  key={m.key}
                  style={[
                    styles.moodBtn,
                    {
                      backgroundColor: myMood === m.key ? "rgba(0,229,255,0.12)" : colors.surface,
                      borderColor: myMood === m.key ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => selectMood(m.key)}
                >
                  <Feather name={m.icon as any} size={16} color={myMood === m.key ? colors.primary : colors.mutedForeground} />
                  <Text style={[styles.moodLabel, { color: myMood === m.key ? colors.primary : colors.mutedForeground }]}>
                    {m.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* Recent Message */}
        {recentMsg ? (
          <Pressable
            style={[styles.recentMsgCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/(tabs)/chat")}
          >
            <View style={styles.recentMsgHeader}>
              <Feather name="message-circle" size={16} color={colors.primary} />
              <Text style={[styles.recentMsgTitle, { color: colors.mutedForeground }]}>Recent message</Text>
            </View>
            <Text style={[styles.recentMsgText, { color: colors.text }]} numberOfLines={2}>{recentMsg}</Text>
          </Pressable>
        ) : null}

        {/* Quick Access */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Quick access</Text>
        <View style={styles.actionsGrid}>
          {[
            { label: "Daily Prompt", icon: "message-square", route: "/prompts",  color: "#7B2FFF" },
            { label: "Whisper",      icon: "send",           route: "/whispers", color: "#00E5FF" },
            { label: "Journal",      icon: "book-open",      route: "/journal",  color: "#22D3A5" },
            { label: "Timeline",     icon: "clock",          route: "/timeline", color: "#FF4FA3" },
          ].map((a) => (
            <Pressable
              key={a.label}
              style={({ pressed }) => [styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push(a.route as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${a.color}18`, borderColor: `${a.color}30`, borderWidth: 1 }]}>
                <Feather name={a.icon as any} size={20} color={a.color} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  ambientGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 300, backgroundColor: "transparent", opacity: 0.6 },
  scanLine: { position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(0,229,255,0.3)", zIndex: 10 },
  scroll: { flex: 1 },
  inner: { paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  greet: { fontSize: 12, fontFamily: "Inter_400Regular", letterSpacing: 0.3 },
  name: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  settingsBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  heroCard: { borderRadius: 22, borderWidth: 1, overflow: "hidden", height: 160, position: "relative", justifyContent: "center" },
  rippleRing: { position: "absolute", borderRadius: 999, borderWidth: 1 },
  heroContent: { padding: 20, gap: 8 },
  heroLabel: { fontSize: 10, fontFamily: "Inter_500Medium", letterSpacing: 2, textTransform: "uppercase" },
  heroTitle: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5, lineHeight: 32 },
  partnerPill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  partnerDot: { width: 6, height: 6, borderRadius: 3, shadowOffset: { width: 0, height: 0 }, shadowRadius: 4, shadowOpacity: 1 },
  partnerPillText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  heroBadge: { position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  linkCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  linkText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 14, borderRadius: 16, borderWidth: 1 },
  statNum: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  moodPicker: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  moodPickerTitle: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 0.3 },
  moodRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  moodBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  moodLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  recentMsgCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 8 },
  recentMsgHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  recentMsgTitle: { fontSize: 11, fontFamily: "Inter_500Medium" },
  recentMsgText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_500Medium", letterSpacing: 1, textTransform: "uppercase", marginTop: 4 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionCard: { width: "47%", padding: 16, borderRadius: 16, borderWidth: 1, gap: 10 },
  actionIcon: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
