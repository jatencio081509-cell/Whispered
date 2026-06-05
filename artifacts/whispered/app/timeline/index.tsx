import React, { useEffect, useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
  color: string;
  auto: boolean;
}

function daysSince(dateStr: string): number {
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
}

export default function TimelineScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { couple, streak } = useApp();
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  useEffect(() => {
    const auto: Milestone[] = [];

    if (couple?.startDate) {
      auto.push({
        id: "start",
        title: "Your story began",
        description: "The day you connected on Whispered",
        date: couple.startDate,
        icon: "heart",
        color: colors.primary,
        auto: true,
      });

      const days = daysSince(couple.startDate);
      const milestonedays = [7, 30, 50, 100, 200, 365];
      for (const d of milestonedays) {
        if (days >= d) {
          const ms = new Date(couple.startDate);
          ms.setDate(ms.getDate() + d);
          auto.push({
            id: `days_${d}`,
            title: `${d} days together`,
            description: `A milestone worth celebrating`,
            date: ms.toISOString(),
            icon: "calendar",
            color: "#F59E0B",
            auto: true,
          });
        }
      }
    }

    if (streak >= 7) {
      auto.push({
        id: "streak_7",
        title: "7-day streak",
        description: "One week of daily connection",
        date: new Date().toISOString(),
        icon: "zap",
        color: colors.streak,
        auto: true,
      });
    }

    AsyncStorage.multiGet(["journal", "memories", "goals"]).then(
      ([j, m, g]) => {
        if (j[1]) {
          const entries = JSON.parse(j[1]);
          if (entries.length > 0) {
            auto.push({
              id: "first_journal",
              title: "First journal entry",
              description: entries[0].title || "Your thoughts captured",
              date: entries[0].createdAt,
              icon: "book-open",
              color: "#4ADE80",
              auto: true,
            });
          }
        }
        if (m[1]) {
          const mems = JSON.parse(m[1]);
          if (mems.length > 0) {
            auto.push({
              id: "first_memory",
              title: "First memory added",
              description: mems[0].caption || "A photo to remember",
              date: mems[0].date,
              icon: "image",
              color: "#06B6D4",
              auto: true,
            });
          }
        }
        if (g[1]) {
          const goals = JSON.parse(g[1]);
          const completed = goals.filter((g: any) => g.completed);
          if (completed.length > 0) {
            auto.push({
              id: "first_goal",
              title: "First goal completed",
              description: completed[0].title,
              date: completed[0].createdAt,
              icon: "target",
              color: "#8B5CF6",
              auto: true,
            });
          }
        }

        const sorted = auto.sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setMilestones(sorted);
      },
    );
  }, [couple, streak]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Timeline
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.inner,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {milestones.length === 0 ? (
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: `${colors.primary}20` },
              ]}
            >
              <Feather name="clock" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Your timeline is just beginning
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.mutedForeground }]}
            >
              Milestones appear as you build your relationship
            </Text>
          </View>
        ) : (
          milestones.map((m, idx) => (
            <View key={m.id} style={styles.milestoneRow}>
              <View style={styles.timelineBar}>
                <View
                  style={[
                    styles.timelineDot,
                    { backgroundColor: m.color, borderColor: `${m.color}40` },
                  ]}
                >
                  <Feather name={m.icon as any} size={14} color="#fff" />
                </View>
                {idx < milestones.length - 1 ? (
                  <View
                    style={[
                      styles.timelineLine,
                      { backgroundColor: colors.border },
                    ]}
                  />
                ) : null}
              </View>
              <View
                style={[
                  styles.milestoneCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.milestoneTitle, { color: colors.text }]}>
                  {m.title}
                </Text>
                <Text
                  style={[
                    styles.milestoneDesc,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {m.description}
                </Text>
                <Text
                  style={[styles.milestoneDate, { color: colors.mutedForeground }]}
                >
                  {formatDate(m.date)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  inner: { padding: 20, paddingLeft: 16 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12, paddingHorizontal: 20 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  milestoneRow: { flexDirection: "row", gap: 14, marginBottom: 16 },
  timelineBar: { alignItems: "center", width: 40 },
  timelineDot: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 2, zIndex: 1 },
  timelineLine: { width: 2, flex: 1, marginTop: 4, minHeight: 20 },
  milestoneCard: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, gap: 4 },
  milestoneTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  milestoneDesc: { fontSize: 13, fontFamily: "Inter_400Regular" },
  milestoneDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 4 },
});
