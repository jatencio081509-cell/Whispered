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
    AsyncStorage.getItem("lastMessage").then((m) => {
      if (m) setRecentMsg(m);
    });
  }, []);

  const days = couple?.startDate ? daysSince(couple.startDate) : 0;
  const firstName = user?.firstName || user?.username || "you";

  const selectMood = (m: Mood) => {
    setMyMood(m);
    setShowMoodPicker(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const topPad =
    Platform.OS === "web" ? insets.top + 67 : insets.top;

  return (
    <LinearGradient
      colors={["#0B0A10", "#120F1C", "#0B0A10"]}
      style={styles.container}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.inner,
          {
            paddingTop: topPad + 16,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greet, { color: colors.mutedForeground }]}>
              {greeting()}
            </Text>
            <Text style={[styles.name, { color: colors.text }]}>{firstName}</Text>
          </View>
          <Pressable
            onPress={() => router.push("/settings/index")}
            hitSlop={12}
            style={[styles.settingsBtn, { backgroundColor: colors.card }]}
          >
            <Feather name="settings" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Days Together */}
        {couple?.startDate ? (
          <LinearGradient
            colors={[`${colors.primary}22`, `${colors.accent}11`]}
            style={[styles.daysCard, { borderColor: `${colors.primary}30` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="heart" size={20} color={colors.primary} />
            <View>
              <Text style={[styles.daysNumber, { color: colors.text }]}>
                {days}
              </Text>
              <Text style={[styles.daysLabel, { color: colors.mutedForeground }]}>
                days together
              </Text>
            </View>
            {couple.isLinked && couple.partnerDisplayName ? (
              <View style={styles.partnerChip}>
                <View
                  style={[
                    styles.partnerDot,
                    { backgroundColor: colors.success },
                  ]}
                />
                <Text
                  style={[styles.partnerName, { color: colors.mutedForeground }]}
                >
                  {couple.partnerDisplayName}
                </Text>
              </View>
            ) : null}
          </LinearGradient>
        ) : (
          <Pressable
            style={[
              styles.linkCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => router.push("/(auth)/link-partner")}
          >
            <Feather name="link" size={20} color={colors.accent} />
            <Text style={[styles.linkText, { color: colors.text }]}>
              Connect with your partner
            </Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="zap" size={18} color={colors.streak} />
            <Text style={[styles.statNum, { color: colors.text }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              streak
            </Text>
          </View>
          <Pressable
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => setShowMoodPicker(!showMoodPicker)}
          >
            <Feather
              name={myMood ? "smile" : "plus-circle"}
              size={18}
              color={myMood ? colors.primary : colors.mutedForeground}
            />
            <Text style={[styles.statNum, { color: colors.text }]}>
              {myMood || "—"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              my mood
            </Text>
          </Pressable>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="heart" size={18} color={colors.accent} />
            <Text style={[styles.statNum, { color: colors.text }]}>
              {partnerMood || "—"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              partner
            </Text>
          </View>
        </View>

        {/* Mood Picker */}
        {showMoodPicker ? (
          <View
            style={[
              styles.moodPicker,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.moodPickerTitle, { color: colors.mutedForeground }]}>
              How are you feeling?
            </Text>
            <View style={styles.moodRow}>
              {MOODS.map((m) => (
                <Pressable
                  key={m.key}
                  style={[
                    styles.moodBtn,
                    {
                      backgroundColor:
                        myMood === m.key
                          ? `${colors.primary}25`
                          : colors.surface,
                      borderColor:
                        myMood === m.key ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => selectMood(m.key)}
                >
                  <Feather
                    name={m.icon as any}
                    size={18}
                    color={myMood === m.key ? colors.primary : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.moodLabel,
                      {
                        color:
                          myMood === m.key ? colors.primary : colors.mutedForeground,
                      },
                    ]}
                  >
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
            style={[
              styles.recentMsgCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => router.push("/(tabs)/chat")}
          >
            <View style={styles.recentMsgHeader}>
              <Feather name="message-circle" size={16} color={colors.accent} />
              <Text style={[styles.recentMsgTitle, { color: colors.mutedForeground }]}>
                Recent message
              </Text>
            </View>
            <Text
              style={[styles.recentMsgText, { color: colors.text }]}
              numberOfLines={2}
            >
              {recentMsg}
            </Text>
          </Pressable>
        ) : null}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          Quick access
        </Text>
        <View style={styles.actionsGrid}>
          {[
            { label: "Daily Prompt", icon: "message-square", route: "/prompts/index", color: colors.accent },
            { label: "Whisper", icon: "send", route: "/whispers/index", color: colors.primary },
            { label: "Journal", icon: "book-open", route: "/journal/index", color: "#4ADE80" },
            { label: "Timeline", icon: "clock", route: "/timeline/index", color: "#F59E0B" },
          ].map((a) => (
            <Pressable
              key={a.label}
              style={({ pressed }) => [
                styles.actionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => router.push(a.route as any)}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: `${a.color}20` },
                ]}
              >
                <Feather name={a.icon as any} size={20} color={a.color} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  inner: { paddingHorizontal: 20, gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  greet: { fontSize: 13, fontFamily: "Inter_400Regular" },
  name: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  daysCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
  },
  daysNumber: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  daysLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  partnerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: "auto",
  },
  partnerDot: { width: 6, height: 6, borderRadius: 3 },
  partnerName: { fontSize: 12, fontFamily: "Inter_500Medium" },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  linkText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  statNum: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  moodPicker: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  moodPickerTitle: { fontSize: 12, fontFamily: "Inter_500Medium" },
  moodRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  moodBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  moodLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  recentMsgCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  recentMsgHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  recentMsgTitle: { fontSize: 12, fontFamily: "Inter_500Medium" },
  recentMsgText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionCard: {
    width: "47%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
