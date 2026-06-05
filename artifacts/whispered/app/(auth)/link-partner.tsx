import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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

  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  const baseUrl = domain ? `https://${domain}` : "";

  const handleCreate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/api/couple/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setCouple(data);
      setCoupleCode(data.inviteCode);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/api/couple/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inviteCode: joinCode.trim().toUpperCase(),
          displayName: name || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setCouple(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.inner,
        { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconRing,
            { borderColor: `${colors.primary}40`, backgroundColor: `${colors.primary}15` },
          ]}
        >
          <Feather name="link" size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          Connect with your partner
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Share an invite code or enter theirs to link your accounts
        </Text>
      </View>

      <View
        style={[styles.nameField]}
      >
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          Your name (shown to partner)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.input,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder="Your nickname"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="words"
        />
      </View>

      <View
        style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        {(["create", "join"] as const).map((t) => (
          <Pressable
            key={t}
            style={[
              styles.tab,
              tab === t && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => { setTab(t); setError(""); setCoupleCode(""); }}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === t ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              {t === "create" ? "Create couple" : "Join with code"}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "create" ? (
        <View style={styles.panel}>
          {coupleCode ? (
            <View style={styles.codeDisplay}>
              <Text style={[styles.codeLabel, { color: colors.mutedForeground }]}>
                Your invite code
              </Text>
              <View
                style={[
                  styles.codeBox,
                  {
                    backgroundColor: `${colors.primary}15`,
                    borderColor: `${colors.primary}40`,
                  },
                ]}
              >
                <Text style={[styles.codeText, { color: colors.primary }]}>
                  {coupleCode}
                </Text>
              </View>
              <Text style={[styles.codeHint, { color: colors.mutedForeground }]}>
                Share this code with your partner so they can join
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.continueBtn,
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text
                  style={[styles.continueBtnText, { color: colors.primaryForeground }]}
                >
                  Continue to app
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={[styles.createHint, { color: colors.mutedForeground }]}>
                Create your couple and get an invite code to share with your partner.
              </Text>
              {error ? (
                <Text style={[styles.errorText, { color: colors.destructive }]}>
                  {error}
                </Text>
              ) : null}
              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: colors.primary,
                    opacity: isLoading || pressed ? 0.7 : 1,
                  },
                ]}
                onPress={handleCreate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <Text
                    style={[styles.primaryBtnText, { color: colors.primaryForeground }]}
                  >
                    Generate invite code
                  </Text>
                )}
              </Pressable>
            </>
          )}
        </View>
      ) : (
        <View style={styles.panel}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            Enter your partner&apos;s code
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.codeInput,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={joinCode}
            onChangeText={(t) => setJoinCode(t.toUpperCase())}
            placeholder="XXXXXX"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="characters"
            maxLength={6}
            textAlign="center"
          />
          {error ? (
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {error}
            </Text>
          ) : null}
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor: colors.primary,
                opacity:
                  joinCode.length < 6 || isLoading || pressed ? 0.7 : 1,
              },
            ]}
            onPress={handleJoin}
            disabled={joinCode.length < 6 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text
                style={[styles.primaryBtnText, { color: colors.primaryForeground }]}
              >
                Join couple
              </Text>
            )}
          </Pressable>
        </View>
      )}

      <Pressable
        style={styles.skipBtn}
        onPress={() => router.replace("/(tabs)")}
      >
        <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
          Skip for now
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { paddingHorizontal: 24, gap: 24 },
  header: { alignItems: "center", gap: 12 },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  nameField: { gap: 8 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  codeInput: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: 6,
    textAlign: "center",
  },
  tabBar: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  panel: { gap: 16 },
  codeDisplay: { alignItems: "center", gap: 12 },
  codeLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  codeBox: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  codeText: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    letterSpacing: 6,
  },
  codeHint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  createHint: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  primaryBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  continueBtn: {
    paddingHorizontal: 32,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  skipBtn: { alignItems: "center", paddingVertical: 8 },
  skipText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
