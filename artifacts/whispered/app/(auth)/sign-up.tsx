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
import { useSignUp, useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

export default function SignUpScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, isLoaded } = useSignUp();
  const clerk = useClerk();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "verify">("form");
  const [code, setCode] = useState("");

  const handleSignUp = async () => {
    if (!isLoaded || !signUp) {
      Alert.alert("Not ready", "Please wait a moment and try again.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setError("");

    try {
      const parts = name.trim().split(" ");
      const base = (parts[0] || email.split("@")[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "");
      const username = `${base}${Math.floor(1000 + Math.random() * 9000)}`;

      const signUpAttempt = await signUp.create({
        emailAddress: email.trim(),
        password,
        username,
        ...(parts[0] && { firstName: parts[0] }),
        ...(parts[1] && { lastName: parts.slice(1).join(" ") }),
      });

      if (signUpAttempt.status === "missing_requirements") {
        await signUpAttempt.prepareEmailAddressVerification({ strategy: "email_code" });
        setStep("verify");
      } else if (signUpAttempt.status === "complete") {
        // Rare case where sign up completes without email verification
        const sessionId = signUpAttempt.createdSessionId ?? clerk.client?.lastActiveSession?.id;
        if (sessionId) {
          await clerk.setActive({ session: sessionId });
        }
        router.replace("/(tabs)");
      } else {
        setError("Unexpected sign up status. Please try again.");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string; longMessage?: string }[] };
      const msg =
        clerkErr?.errors?.[0]?.longMessage ||
        clerkErr?.errors?.[0]?.message ||
        (err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!signUp) return;

    setLoading(true);
    setError("");

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });

      if (signUpAttempt.status === "complete") {
        const sessionId = signUpAttempt.createdSessionId ?? clerk.client?.lastActiveSession?.id;
        if (sessionId) {
          await clerk.setActive({ session: sessionId });
        }
        router.replace("/(tabs)");
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string; longMessage?: string }[] };
      const msg =
        clerkErr?.errors?.[0]?.longMessage ||
        clerkErr?.errors?.[0]?.message || "Invalid verification code.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      Alert.alert("Code sent", "A new code has been sent to your email.");
    } catch {
      Alert.alert("Error", "Could not resend code. Please try again.");
    }
  };

  if (step === "verify") {
    return (
      <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={[styles.inner, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
          <Text style={[styles.title, { color: colors.text }]}>Verify your email</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Enter the 6-digit code sent to {email}
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
            maxLength={6}
          />

          {error ? <Text style={{ color: colors.destructive, marginBottom: 12 }}>{error}</Text> : null}

          <Pressable onPress={handleVerify} style={styles.submitBtn} disabled={loading}>
            <LinearGradient colors={["#00E5FF", "#0072FF"]} style={styles.submitGradient}>
              {loading ? <ActivityIndicator color="#030712" /> : <Text style={styles.submitText}>Verify</Text>}
            </LinearGradient>
          </Pressable>

          <Pressable onPress={handleResendCode} style={styles.resendBtn}>
            <Text style={[styles.resendText, { color: colors.mutedForeground }]}>Resend code</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={[styles.inner, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Join Whispered</Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Full name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

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
            />
          </View>

          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View>
              <TextInput
                style={[styles.input, styles.inputWithIcon, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
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
            onPress={handleSignUp}
            disabled={!email || !password || loading}
          >
            <LinearGradient colors={["#00E5FF", "#0072FF"]} style={styles.submitGradient}>
              {loading ? <ActivityIndicator color="#030712" /> : <Text style={styles.submitText}>Create account</Text>}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Already have an account?{" "}
          </Text>
          <Pressable onPress={() => router.replace("/(auth)/sign-in")}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Sign in</Text>
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
  submitBtn: { borderRadius: 14, overflow: "hidden" },
  submitGradient: { paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  submitText: { color: "#030712", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  forgotBtn: { alignItems: "center", paddingVertical: 8 },
  forgotText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});