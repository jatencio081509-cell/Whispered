import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import * as Haptics from "expo-haptics";

const FEATURES = [
  {
    id: "goals",
    label: "Goals",
    description: "Track shared dreams",
    icon: "target",
    color: "#F59E0B",
    route: "/goals/index",
  },
  {
    id: "journal",
    label: "Journal",
    description: "Write your story",
    icon: "book-open",
    color: "#4ADE80",
    route: "/journal/index",
  },
  {
    id: "prompts",
    label: "Daily Prompts",
    description: "Answer together",
    icon: "message-square",
    color: "#8B5CF6",
    route: "/prompts/index",
  },
  {
    id: "whispers",
    label: "Whispers",
    description: "Hidden messages",
    icon: "send",
    color: "#E8516C",
    route: "/whispers/index",
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Your milestones",
    icon: "clock",
    color: "#06B6D4",
    route: "/timeline/index",
  },
  {
    id: "settings",
    label: "Settings",
    description: "Themes & couple",
    icon: "settings",
    color: "#9CA3AF",
    route: "/settings/index",
  },
];

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { couple, streak } = useApp();

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.inner,
          {
            paddingTop: topPad + 16,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>More</Text>

        {/* Relationship stats banner */}
        <View
          style={[
            styles.statsBanner,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.statItem}>
            <Feather name="zap" size={16} color={colors.streak} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              streak
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.statItem}>
            <Feather name="heart" size={16} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {couple?.isLinked ? "Linked" : "Solo"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              status
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: colors.border }]}
          />
          <View style={styles.statItem}>
            <Feather name="star" size={16} color="#F59E0B" />
            <Text style={[styles.statNumber, { color: colors.text }]}>7</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              prompts
            </Text>
          </View>
        </View>

        {/* Feature Grid */}
        <View style={styles.grid}>
          {FEATURES.map((f) => (
            <Pressable
              key={f.id}
              style={({ pressed }) => [
                styles.featureCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(f.route as any);
              }}
            >
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: `${f.color}20` },
                ]}
              >
                <Feather name={f.icon as any} size={22} color={f.color} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureLabel, { color: colors.text }]}>
                  {f.label}
                </Text>
                <Text
                  style={[styles.featureDesc, { color: colors.mutedForeground }]}
                >
                  {f.description}
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={16}
                color={colors.mutedForeground}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { paddingHorizontal: 20, gap: 20 },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statsBanner: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statNumber: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, height: 32, marginHorizontal: 8 },
  grid: { gap: 10 },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { flex: 1 },
  featureLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  featureDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});
