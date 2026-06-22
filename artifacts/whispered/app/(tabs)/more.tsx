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
import { useUser } from '@clerk/expo';

const FEATURES = [
  { id: "goals",    label: "Goals",         description: "Track shared dreams",   icon: "target",        color: "#00E5FF", route: "/goals"    },
  { id: "prompts",  label: "Daily Prompts", description: "Answer together",        icon: "message-square",color: "#7B2FFF", route: "/prompts"  },
  { id: "whispers", label: "Whispers",      description: "Hidden messages",        icon: "send",          color: "#FF4FA3", route: "/whispers" },
  { id: "timeline", label: "Timeline",      description: "Your milestones",        icon: "clock",         color: "#00E5FF", route: "/timeline" },
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
      {/* Grid Pattern Background */}
      <View style={styles.gridBackground}>
        <View style={styles.gridLineHorizontal} />
        <View style={styles.gridLineVertical} />
      </View>
      <View style={styles.scanLine} />
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
        <View style={[styles.statsBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: "🌊", value: String(streak), label: "streak" },
            { icon: "💙", value: isLinked ? "Linked" : "Solo", label: "status" },
            { icon: "💬", value: "7", label: "prompts" },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={[styles.statDivider, { backgroundColor: colors.border }]} />}
              <View style={styles.statItem}>
                <Text style={{ fontSize: 18 }}>{s.icon}</Text>
                <Text style={[styles.statNumber, { color: colors.text }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Feature list */}
        <View style={styles.grid}>
          {FEATURES.map((f) => (
            <Pressable
              key={f.id}
              style={({ pressed }) => [styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(f.route as any); }}
            >
              <View style={[styles.featureIcon, { backgroundColor: `${f.color}14`, borderColor: `${f.color}28`, borderWidth: 1 }]}>
                <Feather name={f.icon as any} size={22} color={f.color} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureLabel, { color: colors.text }]}>{f.label}</Text>
                <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{f.description}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <NavigationDrawer
        visible={showNavigationDrawer}
        onClose={() => setShowNavigationDrawer(false)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gridBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  gridLineHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  gridLineVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  scanLine: { position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(0,229,255,0.3)", zIndex: 10 },
  inner: { paddingHorizontal: 20, gap: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  title: { fontSize: 24, fontFamily: "System", fontWeight: '600' },
  statsBanner: { flexDirection: "row", borderRadius: 4, borderWidth: 1, padding: 16, alignItems: "center", borderColor: 'rgba(0, 229, 255, 0.2)', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statNumber: { fontSize: 14, fontFamily: "System", fontWeight: '600' },
  statLabel: { fontSize: 10, fontFamily: "System" },
  statDivider: { width: 1, height: 32, marginHorizontal: 8, backgroundColor: 'rgba(0, 229, 255, 0.2)' },
  grid: { gap: 10 },
  featureCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.2)' },
  featureIcon: { width: 48, height: 48, borderRadius: 4, alignItems: "center", justifyContent: "center" },
  featureText: { flex: 1 },
  featureLabel: { fontSize: 15, fontFamily: "System", fontWeight: '600' },
  featureDesc: { fontSize: 12, fontFamily: "System", marginTop: 2 },
});
