import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import { useColors } from '@/hooks/useColors';

export default function ForgotPasswordScreen() {
  const { isLoaded, signIn } = useSignIn();
  const router = useRouter();
  const colors = useColors();

  const [emailAddress, setEmailAddress] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onRequestReset = async () => {
    if (!isLoaded || !emailAddress) return;

    setLoading(true);
    setError('');

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress,
      });
      setStep('reset');
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result.status === 'complete') {
        Alert.alert('Success', 'Password has been reset. Please sign in.');
        router.replace('/(auth)/sign-in');
      } else {
        setError('Password reset incomplete.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {step === 'request' ? 'Reset Password' : 'Enter New Password'}
        </Text>

        {step === 'request' ? (
          <>
            <TextInput
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Email address"
              placeholderTextColor={colors.mutedForeground}
              onChangeText={setEmailAddress}
              style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
              keyboardType="email-address"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={onRequestReset}
              disabled={loading || !emailAddress}
              style={[styles.button, { backgroundColor: colors.primary }]}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Send Reset Code</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <TextInput
              value={code}
              placeholder="Reset code"
              placeholderTextColor={colors.mutedForeground}
              onChangeText={setCode}
              style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
              keyboardType="number-pad"
            />

            <TextInput
              value={newPassword}
              placeholder="New password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              onChangeText={setNewPassword}
              style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={onResetPassword}
              disabled={loading || !code || !newPassword}
              style={[styles.button, { backgroundColor: colors.primary }]}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Reset Password</Text>
              )}
            </Pressable>
          </>
        )}

        <Pressable onPress={() => router.back()}>
          <Text style={[styles.link, { color: colors.primary }]}>Back to Sign In</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    padding: 18,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  error: {
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  link: {
    textAlign: 'center',
    fontSize: 15,
  },
});