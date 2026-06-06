import React, { useState, useEffect } from "react";
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
  const { signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();
  const clerk = useClerk();

  // When the signUp hook updates to "complete" after verification, activate the session
  useEffect(() => {
    if (signUp?.status === "complete" && signUp?.createdSessionId) {
      setActive({ session: signUp.createdSessionId })
        .then(() => router.replace("/(auth)/link-partner"))
        .catch(() => router.replace("/(auth)/sign-in"));
    }
  }, [signUp?.status, signUp?.createdSessionId]);

  const [step, setStep] = useState<"details" | "verify">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (!signUp) {
      Alert.alert("Not ready", "Please wait a moment and try again.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setError("");
    try {
      const parts = name.trim().split(" ");
      await signUp.create({
        emailAddress: email.trim(),
        password,
        ...(parts[0] && { firstName: parts[0] }),
        ...(parts[1] && { lastName: parts.slice(1).join(" ") }),
      });

      // After create(), the live resource is on clerk.client.signUp
      const liveSignUp = clerk.client?.signUp;
      if (liveSignUp?.prepareEmailAddressVerification) {
        await liveSignUp.prepareEmailAddressVerification({ strategy: "email_code" });
      }
      setStep("verify");
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string; longMessage?: string }[] };
      const msg =
        clerkErr?.errors?.[0]?.longMessage ||
        clerkErr?.errors?.[0]?.message ||
        (err instanceof Error ? err.message : "Something went wrong.");
      setError(msg);
      Alert.alert("Sign up error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!signUp) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setError("");
    try {
      const liveSignUp = clerk.client?.signUp ?? signUp;
      await liveSignUp.attemptEmailAddressVerification({ code });
      // useEffect above will fire when signUp.status becomes "complete"
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { code?: string; message: string }[] };
      const errCode = clerkErr?.errors?.[0]?.code;
      const msg = clerkErr?.errors?.[0]?.message ?? "";
      const isAlreadyVerified =
        errCode === "form_identifier_already_verified" ||
        msg.toLowerCase().includes("already verified") ||
        msg.toLowerCase().includes("already been verified");
      if (isAlreadyVerified) {
        // Verification already done — useEffect will handle it if signUp updated,
        // otherwise fall back to sign-in page
        router.replace("/(auth)/sign-in");
      } else {
        setError(msg || "Invalid code. Please try again.");
        setLoading(false);
      }
    }
  };

  if (step === "verify") {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.inner,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}20` }]}>
              <Feather name="mail" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Check your email</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              We sent a 6-digit code to {email}
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={[
                styles.input,
                styles.codeInput,
                { backgroundColor: colors.input, borderColor: colors.border, color: colors.text },
              ]}
              value={code}
              onChangeText={setCode}
              placeholder="000000"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              maxLength={6}
              textAlign="center"
              autoFocus
            />

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: `${colors.destructive}15` }]}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                { backgroundColor: colors.primary, opacity: !code || loading || pressed ? 0.7 : 1 },
              ]}
              onPress={handleVerify}
              disabled={!code || loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.submitText, { color: colors.primaryForeground }]}>Verify</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.resendBtn}
              onPress={async () => {
                try {
                  const liveSignUp = clerk.client?.signUp;
                  if (liveSignUp?.prepareEmailAddressVerification) {
                    await liveSignUp.prepareEmailAddressVerification({ strategy: "email_code" });
                    Alert.alert("Code sent", "A new code has been sent to your email.");
                  }
                } catch {
                  Alert.alert("Error", "Could not resend code. Please try again.");
                }
              }}
            >
              <Text style={[styles.resendText, { color: colors.mutedForeground }]}>Resend code</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.inner,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Start your private space
          </Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Your name</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.input, borderColor: colors.border, color: colors.text },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="How should your partner call you?"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="words"
            />
          </View>

          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.input, borderColor: colors.border, color: colors.text },
              ]}
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
                style={[
                  styles.input,
                  styles.inputWithIcon,
                  { backgroundColor: colors.input, borderColor: colors.border, color: colors.text },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
              />
              <Pressable
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={8}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color={colors.mutedForeground}
                />
              </Pressable>
            </View>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: `${colors.destructive}15` }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: colors.primary,
                opacity: !email || !password || loading || pressed ? 0.7 : 1,
              },
            ]}
            onPress={handleSignUp}
            disabled={!email || !password || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
                Create account
              </Text>
            )}
          </Pressable>
        </View>

        <View nativeID="clerk-captcha" />

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
  inner: { paddingHorizontal: 24, gap: 28 },
  backBtn: { width: 40 },
  header: { gap: 8 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular" },
  form: { gap: 20 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
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
    height: 64,
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 8,
  },
  inputWithIcon: { paddingRight: 48 },
  eyeBtn: { position: "absolute", right: 14, top: 16 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  submitBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  resendBtn: { alignItems: "center", paddingVertical: 8 },
  resendText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footer: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap" },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
