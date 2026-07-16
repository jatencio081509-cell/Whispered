import React, { useState } from "react";
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
import NavigationDrawer from '@/components/NavigationDrawer';
import ThemeBackground from '@/components/ThemeBackground';
import { useUser } from '@clerk/expo';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const FEATURES = [
  { id: "goals",    label: "Goals",         description: "Track shared dreams",   icon: "target",        color: "#00E5FF", route: "/goals"    },
  { id: "prompts",  label: "Daily Prompts", description: "Answer together",        icon: "message-square",color: "#7B2FFF", route: "/prompts"  },
  { id: "whispers", label: "Whispers",      description: "Hidden messages",        icon: "send",          color: "#FF4FA3", route: "/whispers" },
  { id: "timeline", label: "Timeline",      description: "Add shared milestones",   icon: "clock",         color: "theme", route: "/timeline" },
  { id: "settings", label: "Settings",      description: "Themes & couple config", icon: "settings",      color: "#5B7A9A", route: "/settings" },
];

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { couple, streak } = useApp();
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const { user } = useUser();
  const isLinked = !!user?.unsafeMetadata?.partner_user_id;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemeBackground>
      <ScrollView
        contentContainerStyle={[styles.inner, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>More</Text>
          <Pressable onPress={() => setShowNavigationDrawer(true)}>
            <Feather name="menu" size={24} color={colors.text} />
          </Pressable>
        </View>

        {/* Stats banner */}
        <Card variant="elevated" style={styles.statsBanner}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={[styles.statNumber, { color: colors.text }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>day streak</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💙</Text>
              <Badge text={isLinked ? "Linked" : "Solo"} variant={isLinked ? "success" : "default"} />
            </View>
          </View>
        </Card>

        {/* Feature list */}
        <View style={styles.grid}>
          {FEATURES.map((f) => (
            (() => {
              const featureColor = f.color === "theme" ? colors.primary : f.color;
              return (
            <Card
              key={f.id}
              onPress={() => {
                console.log('Navigating to:', f.route);
                try {
                  router.push(f.route as any);
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
              style={styles.featureCard}
            >
              <View style={[styles.featureIcon, { backgroundColor: `${featureColor}14`, borderColor: `${featureColor}28`, borderWidth: 1 }]}>
                <Feather name={f.icon as any} size={22} color={featureColor} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureLabel, { color: colors.text }]}>{f.label}</Text>
                <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{f.description}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Card>
              );
            })()
          ))}
        </View>
      </ScrollView>

      <NavigationDrawer
        visible={showNavigationDrawer}
        onClose={() => setShowNavigationDrawer(false)}
      />
      </ThemeBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { paddingHorizontal: 20, gap: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  title: { fontSize: 24, fontFamily: "System", fontWeight: '600' },
  statsBanner: { padding: 16 },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statIcon: { fontSize: 18 },
  statNumber: { fontSize: 14, fontFamily: "System", fontWeight: '600' },
  statLabel: { fontSize: 10, fontFamily: "System" },
  statDivider: { width: 1, height: 32, marginHorizontal: 8 },
  grid: { gap: 10 },
  featureCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  featureIcon: { width: 48, height: 48, borderRadius: 4, alignItems: "center", justifyContent: "center" },
  featureText: { flex: 1 },
  featureLabel: { fontSize: 15, fontFamily: "System", fontWeight: '600' },
  featureDesc: { fontSize: 12, fontFamily: "System", marginTop: 2 },
});
