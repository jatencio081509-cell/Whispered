import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

type Step = "email" | "reset";

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSendCode = async () => {
    if (!isLoaded) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setError("");
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("reset");
    } catch (err: unknown) {
      const msg =
        (err as { errors?: { message: string }[] })?.errors?.[0]?.message ||
        "Couldn't find that email. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!isLoaded) return;
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setError("");
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });
      if (result.status === "needs_new_password") {
        const resetResult = await signIn.resetPassword({
          password,
          signOutOfOtherSessions: true,
        });
        if (resetResult.status === "complete") {
          setSuccess(true);
          await setActive({ session: resetResult.createdSessionId });
          setTimeout(() => router.replace("/(tabs)"), 1200);
        }
      } else if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err: unknown) {
      const msg =
        (err as { errors?: { message: string }[] })?.errors?.[0]?.message ||
        "Invalid code. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (step === "reset") {
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
          <Pressable
            style={styles.backBtn}
            onPress={() => setStep("email")}
            hitSlop={12}
          >
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>

          <View style={styles.header}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: `${colors.primary}20` },
              ]}
            >
              {success ? (
                <Feather name="check" size={28} color={colors.primary} />
              ) : (
                <Feather name="lock" size={28} color={colors.primary} />
              )}
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {success ? "Password reset!" : "Set new password"}
            </Text>
            <Text
              style={[styles.subtitle, { color: colors.mutedForeground }]}
            >
              {success
                ? "You're all set. Signing you in…"
                : `Enter the code we sent to ${email} and choose a new password`}
            </Text>
          </View>

          {!success && (
            <View style={styles.form}>
              <View>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  Code
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
                  value={code}
                  onChangeText={setCode}
                  placeholder="000000"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  maxLength={6}
                  textAlign="center"
                  autoFocus
                />
              </View>

              <View>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  New password
                </Text>
                <View>
                  <TextInput
                    style={[
                      styles.input,
                      styles.inputWithIcon,
                      {
                        backgroundColor: colors.input,
                        borderColor: colors.border,
                        color: colors.text,
                      },
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

              <View>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  Confirm password
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
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat your new password"
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={!showPassword}
                />
              </View>

              {error ? (
                <View
                  style={[
                    styles.errorBox,
                    { backgroundColor: `${colors.destructive}15` },
                  ]}
                >
                  <Feather
                    name="alert-circle"
                    size={14}
                    color={colors.destructive}
                  />
                  <Text
                    style={[styles.errorText, { color: colors.destructive }]}
                  >
                    {error}
                  </Text>
                </View>
              ) : null}

              <Pressable
                style={({ pressed }) => [
                  styles.submitBtn,
                  {
                    backgroundColor: colors.primary,
                    opacity:
                      !code || !password || !confirmPassword || loading || pressed
                        ? 0.7
                        : 1,
                  },
                ]}
                onPress={handleReset}
                disabled={!code || !password || !confirmPassword || loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <Text
                    style={[
                      styles.submitText,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    Reset password
                  </Text>
                )}
              </Pressable>
            </View>
          )}
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
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>

        <View style={styles.header}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${colors.primary}20` },
            ]}
          >
            <Feather name="key" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Forgot password?
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Enter your email and we'll send you a reset code
          </Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              Email
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
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
          </View>

          {error ? (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: `${colors.destructive}15` },
              ]}
            >
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {error}
              </Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: colors.primary,
                opacity: !email || loading || pressed ? 0.7 : 1,
              },
            ]}
            onPress={handleSendCode}
            disabled={!email || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text
                style={[styles.submitText, { color: colors.primaryForeground }]}
              >
                Send reset code
              </Text>
            )}
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Remember your password?{" "}
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>
              Sign in
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { paddingHorizontal: 24, gap: 32 },
  backBtn: { width: 40 },
  header: { alignItems: "center", gap: 10 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
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
  footer: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap" },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
