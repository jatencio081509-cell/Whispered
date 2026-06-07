import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import { useColors } from '@/hooks/useColors';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const colors = useColors();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        // Manually set the active session (your fix)
        await setActive({ session: completeSignUp.createdSessionId });
        
        // TODO: After verification, navigate to PIN setup or main app
        router.replace('/(auth)/link-partner'); // or your PIN screen
      } else {
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: colors.foreground }]}>Verify your email</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            We sent a verification code to {emailAddress}
          </Text>

          <TextInput
            value={code}
            placeholder="Enter verification code"
            placeholderTextColor={colors.mutedForeground}
            onChangeText={setCode}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
            keyboardType="number-pad"
            autoFocus
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={onVerifyPress}
            disabled={loading}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Verify Email</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>Create your account</Text>

        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Email address"
          placeholderTextColor={colors.mutedForeground}
          onChangeText={setEmailAddress}
          style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
          keyboardType="email-address"
        />

        <TextInput
          value={password}
          placeholder="Password"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
          onChangeText={setPassword}
          style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={onSignUpPress}
          disabled={loading || !emailAddress || !password}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Sign Up</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={[styles.link, { color: colors.primary }]}>Already have an account? Sign in</Text>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
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