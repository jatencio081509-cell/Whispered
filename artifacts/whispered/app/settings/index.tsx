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
import { useAuth, useUser } from "@clerk/expo";
import { useColors } from "@/hooks/useColors";
import { useApp, type Theme } from "@/context/AppContext";
import * as Haptics from "expo-haptics";

const THEMES: { key: Theme; label: string; desc: string; color: string }[] = [
  { key: "calm", label: "Calm", desc: "Soft blues and purples", color: "#8B5CF6" },
  { key: "warm", label: "Warm", desc: "Rose golds and amber", color: "#E8516C" },
  { key: "playful", label: "Playful", desc: "Bright and fun accents", color: "#4ADE80" },
  { key: "elegant", label: "Elegant", desc: "Minimal and refined", color: "#9CA3AF" },
];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { couple, theme, setTheme, streak } = useApp();

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await signOut();
    router.replace("/(auth)/welcome");
  };

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
        {title}
      </Text>
      <View
        style={[
          styles.sectionCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {children}
      </View>
    </View>
  );

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.inner,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Account */}
        <Section title="Account">
          <View style={styles.row}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: `${colors.primary}30` },
              ]}
            >
              <Feather name="user" size={20} color={colors.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {user?.firstName || user?.username || "You"}
              </Text>
              <Text
                style={[styles.rowSubtitle, { color: colors.mutedForeground }]}
              >
                {user?.primaryEmailAddress?.emailAddress || ""}
              </Text>
            </View>
          </View>
        </Section>

        {/* Couple */}
        {couple ? (
          <Section title="Your couple">
            <View style={[styles.row, styles.rowBorder, { borderBottomColor: colors.border }]}>
              <Feather name="link" size={18} color={colors.accent} />
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  Partner
                </Text>
                <Text
                  style={[styles.rowSubtitle, { color: colors.mutedForeground }]}
                >
                  {couple.isLinked
                    ? couple.partnerDisplayName || "Linked"
                    : "Not linked yet"}
                </Text>
              </View>
              {couple.isLinked ? (
                <View
                  style={[
                    styles.linkedBadge,
                    { backgroundColor: `${colors.success}20` },
                  ]}
                >
                  <Text
                    style={[styles.linkedText, { color: colors.success }]}
                  >
                    Linked
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={[styles.row, styles.rowBorder, { borderBottomColor: colors.border }]}>
              <Feather name="hash" size={18} color={colors.mutedForeground} />
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  Invite code
                </Text>
                <Text
                  style={[styles.codeDisplay, { color: colors.primary }]}
                >
                  {couple.inviteCode}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <Feather name="zap" size={18} color={colors.streak} />
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  Love streak
                </Text>
                <Text
                  style={[styles.rowSubtitle, { color: colors.mutedForeground }]}
                >
                  {streak} day{streak !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </Section>
        ) : null}

        {/* Theme */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            Theme
          </Text>
          <View style={styles.themeGrid}>
            {THEMES.map((t) => (
              <Pressable
                key={t.key}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: colors.card,
                    borderColor:
                      theme === t.key ? t.color : colors.border,
                    borderWidth: theme === t.key ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTheme(t.key);
                }}
              >
                <View
                  style={[
                    styles.themeColorDot,
                    { backgroundColor: t.color },
                  ]}
                />
                <Text style={[styles.themeLabel, { color: colors.text }]}>
                  {t.label}
                </Text>
                <Text
                  style={[styles.themeDesc, { color: colors.mutedForeground }]}
                >
                  {t.desc}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sign Out */}
        <Section title="Account actions">
          <Pressable
            style={({ pressed }) => [
              styles.signOutBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleSignOut}
          >
            <Feather name="log-out" size={18} color={colors.destructive} />
            <Text style={[styles.signOutText, { color: colors.destructive }]}>
              Sign out
            </Text>
          </Pressable>
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  inner: { padding: 20, gap: 24 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 12, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5, paddingHorizontal: 4 },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14 },
  rowBorder: { borderBottomWidth: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontFamily: "Inter_500Medium" },
  rowSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  linkedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  linkedText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  codeDisplay: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: 4, marginTop: 2 },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  themeCard: { width: "47%", padding: 14, borderRadius: 14, gap: 6 },
  themeColorDot: { width: 20, height: 20, borderRadius: 10 },
  themeLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  themeDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  signOutBtn: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  signOutText: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
