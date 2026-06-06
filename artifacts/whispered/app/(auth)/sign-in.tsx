import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!signIn) {
      Alert.alert("Not ready", "Please wait a moment and try again.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setError("");
    try {
      console.log("📝 Attempting sign in with:", email);
      const result = await signIn.create({ identifier: email.trim(), password });
      
      console.log("✅ Sign in result:", JSON.stringify(result, null, 2));
      console.log("📊 Status:", result.status);
      console.log("🔑 Session ID:", result.createdSessionId);
      console.log("👤 User ID:", result.userId);
      
      if (result.status === "complete") {
        console.log("🎉 Status is complete, setting active session...");
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      } else if (result.createdSessionId) {
        console.log("⚠️ Status is not complete but session exists, attempting to set active anyway...");
        try {
          await setActive({ session: result.createdSessionId });
          console.log("✅ Session set successfully despite non-complete status");
          router.replace("/(tabs)");
        } catch (sessionErr) {
          console.log("❌ Failed to set active session:", sessionErr);
          setError(`Could not activate session. Status: ${result.status}`);
        }
      } else {
        console.log("❌ No session created. Status:", result.status);
        setError(`Sign in incomplete. Status: ${result.status}. Please try again.`);
      }
    } catch (err: unknown) {
      console.log("🔴 Sign in error:", err);
      const clerkErr = err as { errors?: { message: string; longMessage?: string; code?: string }[] };
      const errorCode = clerkErr?.errors?.[0]?.code;
      const msg =
        clerkErr?.errors?.[0]?.longMessage ||
        clerkErr?.errors?.[0]?.message ||
        (err instanceof Error ? err.message : "Invalid email or password.");
      console.log("Error code:", errorCode);
      console.log("Error message:", msg);
      setError(msg);
      Alert.alert("Sign in error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.scanLine} />
      <ScrollView
        contentContainerStyle={[
          styles.inner,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Sign in to continue
          </Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View>
              <TextInput
                style={[styles.input, styles.inputWithIcon, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: `${colors.destructive}15`, borderColor: `${colors.destructive}30` }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.submitBtn, { opacity: !email || !password || loading || pressed ? 0.6 : 1 }]}
            onPress={handleSignIn}
            disabled={!email || !password || loading}
          >
            <LinearGradient
              colors={["#00E5FF", "#0072FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {loading ? (
                <ActivityIndicator color="#030712" />
              ) : (
                <Text style={styles.submitText}>Sign in</Text>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.forgotBtn} onPress={() => router.push("/(auth)/forgot-password")}>
            <Text style={[styles.forgotText, { color: colors.mutedForeground }]}>Forgot password?</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Don&apos;t have an account?{" "}
          </Text>
          <Pressable onPress={() => router.replace("/(auth)/sign-up")}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Sign up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scanLine: { position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(0,229,255,0.3)", zIndex: 10 },
  inner: { paddingHorizontal: 24, gap: 28 },
  backBtn: { width: 40 },
  header: { gap: 6 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular" },
  form: { gap: 20 },
  label: { fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 8, letterSpacing: 1.5, textTransform: "uppercase" },
  input: { height: 52, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 15, fontFamily: "Inter_400Regular" },
  inputWithIcon: { paddingRight: 48 },
  eyeBtn: { position: "absolute", right: 14, top: 16 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  submitBtn: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  submitGradient: { height: 54, alignItems: "center", justifyContent: "center" },
  submitText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#030712", letterSpacing: 0.3 },
  forgotBtn: { alignItems: "center", paddingVertical: 4 },
  forgotText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footer: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap" },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
